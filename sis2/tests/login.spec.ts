import { expect, test } from '@playwright/test';

test.describe('Login functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/.*\/auth\/login/);
  });

  test('should log in successfully with valid credentials', async ({ page }) => {
    const testEmail = 'customer2@practicesoftwaretesting.com';
    const testPassword = 'welcome01';

    await page.getByTestId('email').fill(testEmail);
    await page.getByTestId('password').fill(testPassword);
    await page.getByTestId('login-submit').click();

    await expect(page).toHaveURL(/.*\/account/);
  });

  test('should show error message on invalid email', async ({ page }) => {
    const testEmail = 'asddddd@mail.ru';
    const testPassword = 'welcome01';

    await page.getByTestId('email').fill(testEmail);
    await page.getByTestId('password').fill(testPassword);
    await page.getByTestId('login-submit').click();

    const errorMessage = page.getByTestId('login-error');

    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toHaveText('Invalid email or password');
  });
});
