import { expect, test } from '@playwright/test';

test.only('register a new customer successfully', async ({ page }) => {
  const uniqueEmail = `user_${Date.now()}@example.com`;
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

  await page.getByRole('button', { name: 'Register' }).click();

  await expect(page).toHaveURL(/.*\/auth\/login/);
});
