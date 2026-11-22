export type Credentials = { email: string; password: string };

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing environment variable ${name}. Set it in .env locally or in GitHub Actions secrets.`
    );
  }
  return value;
}

export function getCustomerCredentials(): Credentials[] {
  const accounts = ['CUSTOMER', 'CUSTOMER2', 'CUSTOMER3']
    .map((prefix) => ({
      email: process.env[`${prefix}_EMAIL`],
      password: process.env[`${prefix}_PASSWORD`],
    }))
    .filter((c): c is Credentials => !!c.email && !!c.password);

  if (accounts.length === 0) {
    throw new Error(
      'No customer credentials configured. Set CUSTOMER_EMAIL / CUSTOMER_PASSWORD (and optionally CUSTOMER2_*, CUSTOMER3_*).'
    );
  }
  return accounts;
}

export function getKnownEmail(): string {
  return requireEnv('CUSTOMER2_EMAIL');
}
