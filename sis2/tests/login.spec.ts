import { expect, test } from '@playwright/test';

test.describe('Login functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/.*\/auth\/login/);
  });

  test('should log in successfully with valid credentials', async ({ page }) => {
    const credentials = [
      { email: 'customer2@practicesoftwaretesting.com', password: 'welcome01' },
      { email: 'customer@practicesoftwaretesting.com', password: 'welcome01' },
      { email: 'customer3@practicesoftwaretesting.com', password: 'pass123' },
    ];

    let loggedIn = false;

    for (const user of credentials) {
      await page.goto('/auth/login');

      await page.getByTestId('email').fill(user.email);
      await page.getByTestId('password').fill(user.password);
      await page.getByRole('button', { name: 'Login' }).click();

      const result = await Promise.race([
        page.waitForURL(/.*\/account/, { timeout: 5000 }).then(() => 'success' as const),
        page
          .getByTestId('login-error')
          .waitFor({ state: 'visible', timeout: 5000 })
          .then(() => 'error' as const),
      ]).catch(() => 'timeout' as const);

      if (result === 'success') {
        loggedIn = true;
        break;
      }
    }

    expect(loggedIn, 'None of the credentials worked').toBe(true);

    await expect(page).toHaveURL(/.*\/account/);
  });

  test('should show error message on invalid email or password', async ({ page }) => {
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
