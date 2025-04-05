export function getAdminEmails(): string[] {
  const emailsString = process.env.ADMIN_EMAILS || '';
  return emailsString.split(',').map(email => email.trim()).filter(email => email.length > 0);
}

export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) {
    return false;
  }
  const adminEmails = getAdminEmails();
  return adminEmails.includes(email);
} 