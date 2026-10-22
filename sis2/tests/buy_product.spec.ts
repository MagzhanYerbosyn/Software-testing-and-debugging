import { expect, test } from '@playwright/test';

test.only('should buy a product', async ({ page }) => {
  const products = [
    {
      name: 'Pliers',
      testId: 'product-01M5J8X2RR6V0A3VGDS59Q3SST',
    },
  ];

  const productName = products[0].name;
  const productId = products[0].testId.split('-')[1];
  const randomCount = Math.floor(Math.random() * 10 + 1);

  await page.goto('/');

  await page.getByTestId(products[0].testId).click();
  await expect(page).toHaveURL(new RegExp(`.*\\/product\\/${productId}`));

  await page.getByTestId('quantity').click();
  await page.getByTestId('quantity').fill(`${randomCount}`);
  await page.getByRole('button', { name: 'Add to cart' }).click();

  const successMessage = await page.getByRole('alert');
  await expect(successMessage).toBeVisible();
  await expect(successMessage).toHaveText('Product added to shopping cart.');

  await page.getByTestId('nav-cart').click();
  await expect(page).toHaveURL(/.*\/checkout/);

  await expect(page.getByTestId('product-title')).toHaveText(`${productName}`);
  await expect(page.getByTestId('product-quantity')).toHaveValue(`${randomCount}`);
});
