# Security Reference

For any full-stack application, security should be a priority from the beginning. If security isn't handled proactively, you may run into a lot of headaches in the future. The security implemented in this boilerplate should be considered the bare minimum, and if you become big, you will want to get a real security audit. That said, I will explain how authentication works in this boilerplate, so you have a reference if you ever want to change parameters or something more invasive.

## Security Primer

This is by no means exhaustive, and doesn't discuss protecting users from browser-based attacks (CSRF/XSS). This just gives the core of server-side authentication that just about all backends have in some form.

### What do we authenticate?

If you have no background in app dev, you may have no idea how this is done. What does it mean for the user to log in to an app? Sure, we can check whether their username and password matches what's in the database, but after the user logs in, how would we know that subsequent API calls indeed are coming from the same user? Sure, we can check if it's coming from the same IP, but I'm sure you can imagine some of the problems with that (especially for mobile apps).

On the other hand, the user can repeatedly send their login credentials with every network request, but that would require us to verify their identity with a database request every time they use the API. Also, it's a little scary (to me) to be handling credentials like that.

This is what we use access tokens for. When the user logs in for the first time, we generate and _sign_ a token (a condensed string of characters) that contains information about the user. These [signatures](https://en.wikipedia.org/wiki/Digital_signature) are done in such a way that it's [cryptographically impossible](https://en.wikipedia.org/wiki/Computational_hardness_assumption) for someone to change the contents of the token without the server knowing. The user just needs to remember this token, which (a) contains nothing about their login credentials, thus making it safer to store in persistent storage (this isn't really a concern though) and (b) allows us to verify the user's identity without making a database request, since we can simply verify the validity of their token when they send it to us.

Going one step further, we use what's known as a "refresh token". Essentially, logging in for the first time gives the user a token that lasts for a very long time (by default I say 4 years), and is used to generate short-lived (e.g. 15 minutes) access tokens for the user, functionally acting the same way a login behaved in the previous setup. We store these refresh tokens in a database, and when the user wants to refresh their access token, we check if their refresh token is valid in the database. This allows us to:

- Know how many valid user sessions there are, and display that to the user,
- Give the user transparency over their active sessions, as we can associate these persistent refresh tokens with IPs or regions
- Allow the user to sign out of all active sessions upon changing their password by revoking the other refresh tokens
- Restrict access by a malicious user

and much more.

### How do we authenticate?

Simply creating middleware that verifies the validity of tokens doesn't automatically make your application secure, and it's extremely easy to create security vulnerabilities if you're not careful. For example, suppose we are a bank with users A and B

Let's say we have a money transfer endpoint that looks something like this:

```typescript
// Hypothetical vulnerable endpoint

app.post("/transfer", async (req, res) => {
  const { senderUsername, recipientUsername, amount } = req.body;

  // Throws an error if token is invalid
  try {
    await authenticateToken(req.headers.authorization);
  } catch {
    throw new HTTPException(401, "Authorization failed");
  }

  await transferMoney(senderUsername, recipientUsername, amount);
});
```

In this scenario, suppose that User A sent a request with the body:

```json
{
  "senderUsername": "userB",
  "recipientUsername": "userA",
  "amount": "1_000_000"
}
```

Even though we are using our authentication function, this request will actually succeed, and the attacker A can impersonate User B to send money to herself. Needless to say, this is a catastrophic security issue, and it's not out of the question that AI editors will sneak stuff like this into your code. As a general rule, never let a user assert to the API their identity, and always use the data given in their access token.

Instead, the transfer endpoint should look something like this:

```typescript
// Hypothetical vulnerable endpoint

app.post("/transfer", async (req, res) => {
  const { recipientUsername, amount } = req.body;

  const tokenBody = await authenticateToken(req.headers.authorization);
  const senderUsername = tokenBody.username;

  await transferMoney(senderUsername, recipientUsername, amount);
});
```

In this repository, the middleware will automatically decode and authenticate the token before it hits your API handler. You simply need to call `getAuthenticatedUser` method from `src/utils/auth.ts` to get the decoded token body.

## Boilerplate Security Features

Here is a brief overview of the current auth flow in this app.

### User Scopes

There are two main user scopes in this app, though you may want to add more or implement more complex verification steps.

### User registration

With the existing setup, users must register with an email, which they then must verify. Simply registering a user will create an entry in the users table (`backend/src/schema/user.ts`), and they will immediately be able to log in and out. We can restrict their access to other parts of the app by specifying in the `shared/` folder whether an endpoint requires the "user" scope. Before email verification, their scope is set to "unverified", and the middleware will prevent them from successfully using specified protected endpoints.

If you want to tie your app more strongly to mobile devices in an attempt to deter programmatic account creation (through which attacker could potentially circumvent API rate limits), you can make use of Apple's [Managed Device Attestation](https://support.apple.com/guide/deployment/managed-device-attestation-dep28afbde6a/web) to limit app registrations. I haven't yet implemented many features myself, but it's definitely something to look into. However, this is probably not something to care too much about in the beginning.

### Changing Password or Email

This app already supports allowing a user to change their password or email. As it exists right now, the frontend implementation is for the web only, but there is a way to integrate it with your mobile app. It should be noted that the password reset link itself immediately gives the user authority to change their password, whereas the email verification code requires the user to log in first. Users can only request an email change if their previous email is verified, whereas account deletion and password changes can be done for emails that haven't yet been verified. The email is only changed in the database if the user successfully completes the email change, otherwise nothing happens.

### Why no phone number verification?

If you want to add phone verification to the auth flow and have some money, I might be down to help make it/add it to this repo. I didn't initially want to do it because sms is annoying and like $0.01/text.
