import tempEmailDomains from "../../temp_emails_domains.json";

export class EmailValidator {
  private static readonly tempEmailDomains: Set<string> = new Set(tempEmailDomains.emails);

  /**
   * Validates if an email is from a temporary/disposable email domain
   * @param email The email address to validate
   * @throws BadRequest if the email is from a temporary domain
   */
  static validateNotTemporary(email: string): void {
    const domain = email.split("@")[1]?.toLowerCase();
    if (!domain || this.tempEmailDomains.has(domain)) {
      throw new Error("Use a real email address");
    }
  }

  /**
   * Comprehensive email validation including format and temporary domain check
   * @param email The email address to validate
   * @throws BadRequest if the email is invalid or from a temporary domain
   */
  static validate(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format");
    }

    // Check for temporary email domain
    this.validateNotTemporary(email);
  }
}
