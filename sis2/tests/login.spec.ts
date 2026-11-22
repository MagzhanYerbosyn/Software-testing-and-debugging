import { expect, test } from '@playwright/test';
import { getCustomerCredentials } from './utils/credentials';

test.describe('Login functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/.*\/auth\/login/);
  });

  test('should log in successfully with valid credentials', async ({ page }) => {
    const credentials = getCustomerCredentials();

    let loggedIn = false;

    for (const user of credentials) {
      await page.goto('/auth/login');

      await page.getByTestId('email').fill(user.email);
      await page.getByTestId('password').fill(user.password);

      const [response] = await Promise.all([
        page.waitForResponse(
          (res) => res.url().includes('/users/login') && res.request().method() === 'POST'
        ),
        page.getByRole('button', { name: 'Login' }).click(),
      ]);

      if (response.ok()) {
        loggedIn = true;
        break;
      }
    }

    expect(loggedIn, 'None of the credentials worked').toBe(true);

    await expect(page).toHaveURL(/.*\/account/, { timeout: 15000 });
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
