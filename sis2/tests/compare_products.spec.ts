import test, { expect } from '@playwright/test';

test.only('should compare two products', async ({ page }) => {
  await page.goto('/');

  const container = page.getByTestId('');
  const productCards = container.locator('a.card');

  const firstProduct = productCards.first();
  const firstProductName = await firstProduct.getByTestId('product-name').textContent();
  const firstProductTestId = (await firstProduct.getAttribute('data-test')) || '';
  const firstProductId = firstProductTestId.split('-')[1];

  const secondProduct = productCards.nth(1);
  const secondProductName = await secondProduct.getByTestId('product-name').textContent();
  const secondProductTestId = (await secondProduct.getAttribute('data-test')) || '';
  const secondProductId = secondProductTestId.split('-')[1];

  // go to the first product details and check url to match
  await firstProduct.click();
  await expect(page).toHaveURL(new RegExp(`.*\\/product\\/${firstProductId}`));

  // get first product price
  const firstProductPrice = await page.getByTestId('unit-price').textContent();

  // add to compare
  await page.getByTestId('add-to-compare').click();

  // back to home page
  await page.goto('/');

  // go to the second product details and check url to match
  await secondProduct.click();
  await expect(page).toHaveURL(new RegExp(`.*\\/product\\/${secondProductId}`));

  // get second product price
  const secondProductPrice = await page.getByTestId('unit-price').textContent();

  // add to compare
  await page.getByTestId('add-to-compare').click();

  // go to the compare page and check url to match
  await page.getByTestId('compare-link').click();
  await expect(page).toHaveURL(/.*\/comparison/);

  // match names
  const productNames = page.getByTestId('product-name');
  await expect(productNames.first()).toHaveText(`${firstProductName}`);
  await expect(productNames.nth(1)).toHaveText(`${secondProductName}`);

  const productPrices = page.getByTestId('compare-price');
  await expect(productPrices.first()).toHaveText(`$${firstProductPrice}`);
  await expect(productPrices.nth(1)).toHaveText(`$${secondProductPrice}`);
});
