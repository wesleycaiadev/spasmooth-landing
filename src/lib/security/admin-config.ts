// Explicitly approved by the site owner. These addresses are identifiers, not
// secrets; only server-only auth.ts uses this configuration to grant access.
// To revoke access, remove the address here AND from the deployment allowlists.
const APPROVED_ADMIN_EMAILS = ['layararenata123@gmail.com'] as const;

export function configuredAdminEmails(emails = '', legacyEmail = ''): string {
    return [...APPROVED_ADMIN_EMAILS, emails, legacyEmail].join(',');
}
