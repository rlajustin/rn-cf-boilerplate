// Helper function to normalize email addresses
export function normalizeEmail(email: string): string {
  const [localPart, domain] = email.trim().toLowerCase().split("@");
  // Remove everything after + in local part
  const normalizedLocal = localPart.split("+")[0];
  return `${normalizedLocal}@${domain}`;
}
