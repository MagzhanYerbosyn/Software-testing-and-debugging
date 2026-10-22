import { expect, test } from '@playwright/test';

test('check link redirection from home page to contact page', async ({ page }) => {
  await page.goto('https://practicesoftwaretesting.com/');

  await page.getByRole('link', { name: 'Contact' }).click();

  await expect(page).toHaveURL('https://practicesoftwaretesting.com/contact');
});
