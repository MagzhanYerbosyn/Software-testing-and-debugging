import test, { expect } from '@playwright/test';

test.describe('Reset password functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/.*\/auth\/login/);

    await page.getByTestId('forgot-password-link').click();
    await expect(page).toHaveURL(/.*\/auth\/forgot-password/);
  });

  test.only('should confirm to reset a password for a known email', async ({ page }) => {
    const testEmail = 'customer2@practicesoftwaretesting.com';
    await page.getByTestId('email').fill(`${testEmail}`);

    await page.getByTestId('forgot-password-submit').click();

    const successMessage = page.getByRole('alert');
    await expect(successMessage).toBeVisible();
    await expect(successMessage).toHaveText('page.forgot-password.confirm');
  });

  test.only('should reject to reset a password for a unknown email', async ({ page }) => {
    const testEmail = 'wrongEmail@practicesoftwaretesting.com';
    await page.getByTestId('email').fill(`${testEmail}`);

    await page.getByTestId('forgot-password-submit').click();

    const errorMessage = page.getByRole('alert');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toHaveText('The selected email is invalid.');
  });
});
