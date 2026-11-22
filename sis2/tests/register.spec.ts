import { expect, test } from '@playwright/test';
import { randomUUID } from 'node:crypto';

test('register a new customer successfully', async ({ page }) => {
  const uniqueEmail = `user_${Date.now()}_${randomUUID().slice(0, 8)}@example.com`;
  const uniquePassword = `Pass_${Date.now()}!aB9`;

  await page.goto('/');

  await page.getByRole('link', { name: 'Sign in' }).click();
  await page.getByTestId('register-link').click();

  await expect(page).toHaveURL(/.*\/auth\/register/);

  await page.getByTestId('first-name').fill('Amir');
  await page.getByTestId('last-name').fill('Amir');
  await page.getByTestId('dob').fill('1990-01-01');
  await page.getByTestId('country').selectOption('KZ');
  await page.getByTestId('postal_code').fill('050000');
  await page.getByTestId('house_number').fill('42');
  await page.getByTestId('street').fill('Rayimbek street');
  await page.getByTestId('city').fill('Almaty');
  await page.getByTestId('state').fill('Zhetysu');
  await page.getByTestId('phone').fill('1234567890');
  await page.getByTestId('email').fill(uniqueEmail);
  await page.getByTestId('password').fill(uniquePassword);

  const [response] = await Promise.all([
    page.waitForResponse(
      (res) => res.url().includes('/users/register') && res.request().method() === 'POST'
    ),
    page.getByRole('button', { name: 'Register' }).click(),
  ]);

  expect(response.ok(), `Register API returned ${response.status()}`).toBe(true);

  await expect(page).toHaveURL(/.*\/auth\/login/, { timeout: 15000 });
});
