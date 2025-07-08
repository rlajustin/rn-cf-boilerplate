import * as nodemailer from "nodemailer";
import { Context } from "hono";
import { env } from "hono/adapter";
import { errorConfig, messageConfig, typeConfig } from "@configs";
import { cryptoUtil, loggerUtil } from "@utils";
import * as kvService from "./kv";

const checkEmailSetup = (c: Context<typeConfig.Context>) => {
  const {
    SMTP_HOST: smtpHost,
    SMTP_PORT: smtpPort,
    SMTP_USER: smtpUser,
    SMTP_PASSWORD: smtpPassword,
    SMTP_SENDER_ADDRESS: smtpSenderAddress,
    SMTP_SENDER_NAME: smtpSenderName,
  } = env(c);
  if (!smtpHost || !smtpPort || !smtpUser || !smtpPassword || !smtpSenderAddress || !smtpSenderName) {
    loggerUtil.triggerLogger(c, loggerUtil.LoggerLevel.Error, messageConfig.ConfigError.NoEmailSender);
    throw new errorConfig.Forbidden(messageConfig.ConfigError.NoEmailSender);
  }
};

export const sendEmail = async (
  c: Context<typeConfig.Context>,
  receiverEmail: string,
  subject: string,
  text: string
): Promise<boolean> => {
  const {
    SMTP_HOST: smtpHost,
    SMTP_PORT: smtpPort,
    SMTP_USER: smtpUser,
    SMTP_PASSWORD: smtpPassword,
    SMTP_SENDER_ADDRESS: smtpSenderAddress,
    SMTP_SENDER_NAME: smtpSenderName,
  } = env(c);
  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: false, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    });

    // send mail with defined transport object
    const info = await transporter.sendMail({
      from: {
        address: smtpSenderAddress,
        name: smtpSenderName,
      },
      to: receiverEmail,
      subject,
      text,
    });
    if (info.messageId) {
      loggerUtil.triggerLogger(
        c,
        loggerUtil.LoggerLevel.Info,
        `Email sent to ${receiverEmail} with subject ${subject} and text ${text}`
      );
    } else {
      loggerUtil.triggerLogger(
        c,
        loggerUtil.LoggerLevel.Error,
        `Failed to send email to ${receiverEmail} with subject ${subject} and text ${text}`
      );
    }

    return true;
  } catch (error) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Error,
      `Unknown error sending email to ${receiverEmail} with subject ${subject} and text ${text}`
    );
    return false;
  }
};

export const sendEmailAuthorizationCode = async (c: Context<typeConfig.Context>, email: string) => {
  checkEmailSetup(c);

  const mfaCode = cryptoUtil.genRandom6DigitString();
  const content = `Your one-time verification code is: ${mfaCode}. This code will expire in 24 hours.`;

  try {
    const res = await sendEmail(c, email, "[<YOUR-APP-NAME>] Email Verification Code", content);

    return res ? mfaCode : null;
  } catch (error) {
    loggerUtil.triggerLogger(c, loggerUtil.LoggerLevel.Error, `Error sending email verification code to ${email}`);
    throw new errorConfig.InternalServerError("Error sending email verification code");
  }
};

export const handleSendEmailVerificationCode = async (
  c: Context<typeConfig.Context>,
  email: string,
  authId: string
): Promise<true> => {
  const { EMAIL_VERIFICATION_CODE_LIMIT: threshold } = env(c);

  await kvService.setEmailVerificationCodeAttempts(c.env.KV, authId, 0);
  const numCodes = await kvService.getEmailVerificationCodeAttempts(c.env.KV, authId);

  if (threshold) {
    if (numCodes >= threshold) {
      loggerUtil.triggerLogger(c, loggerUtil.LoggerLevel.Warn, "Email verification code limit reached: " + email);
      throw new errorConfig.Forbidden("Email verification code limit reached, try again in 24 hours");
    }

    await kvService.setEmailVerificationCodeAttempts(c.env.KV, authId, numCodes + 1);
  }

  const mfaCode = await sendEmailAuthorizationCode(c, email);
  if (mfaCode) {
    await kvService.storeEmailVerificationCode(c.env.KV, authId, mfaCode);
  }

  return true;
};

export const sendPasswordResetEmail = async (
  c: Context<typeConfig.Context>,
  user: { email: string },
  token: string
) => {
  checkEmailSetup(c);
  // You should customize the reset URL for your frontend
  const resetUrl = `http://localhost:3000/reset-password/confirm?token=${encodeURIComponent(token)}`;
  const subject = "[<YOUR-APP-NAME>] Password Reset Request";
  const text = `You requested a password reset. Use this link to reset your password: ${resetUrl}\nIf you did not request this, please ignore this email. The link will expire in 24 hours.`;
  await sendEmail(c, user.email, subject, text);
};
