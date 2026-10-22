import { expect, test } from '@playwright/test';

test.only('valid log in credentials', async ({ page }) => {
  const testEmail = 'customer2@practicesoftwaretesting.com';
  const testPassword = 'welcome01';

  await page.goto('/');

  await page.getByRole('link', { name: 'Sign in' }).click();

  await expect(page).toHaveURL(/.*\/auth\/login/);

  await page.getByTestId('email').fill(testEmail);
  await page.getByTestId('password').fill(testPassword);

  await page.getByTestId('login-submit').click();

  await expect(page).toHaveURL(/.*\/account/);
});
