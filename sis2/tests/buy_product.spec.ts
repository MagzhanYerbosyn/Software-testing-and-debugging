import { expect, test } from '@playwright/test';

test('should buy a product', async ({ page }) => {
  await page.goto('/');

  const container = page.getByTestId('');
  const productCards = container.locator('a.card');

  let product = null;

  await expect(productCards.first()).toBeVisible();

  for (let i = 0; i < (await productCards.count()); i++) {
    const currentCard = productCards.nth(i);

    const isOutOfStock = await currentCard.getByText('Out of stock', { exact: false }).isVisible();

    if (!isOutOfStock) {
      product = currentCard;
      break;
    }
  }

  if (!product) {
    throw new Error('All products are out of stock');
  }

  const productName = await product.getByTestId('product-name').textContent();
  const productTestId = (await product.getAttribute('data-test')) || '';
  const productId = productTestId.split('-')[1];
  const randomCount = Math.floor(Math.random() * 10 + 1);

  // go to item
  await page.getByTestId(productTestId).click();
  await expect(page).toHaveURL(new RegExp(`.*\\/product\\/${productId}`));

  // fill quantity and add to cart
  await page.getByTestId('quantity').click();
  await page.getByTestId('quantity').fill(`${randomCount}`);
  await page.getByRole('button', { name: 'Add to cart' }).click();

  // check success alert
  const successMessage = page.getByRole('alert');
  await expect(successMessage).toBeVisible();
  await expect(successMessage).toHaveText('Product added to shopping cart.');

  // go to cart
  await page.getByTestId('nav-cart').click();
  await expect(page).toHaveURL(/.*\/checkout/);

  // check item and its quantity
  await expect(page.getByTestId('product-title')).toHaveText(`${productName}`);
  await expect(page.getByTestId('product-quantity')).toHaveValue(`${randomCount}`);

  // proceed to checkout
  await page.getByTestId('proceed-1').click();

  // fill login
  const credentials = [
    { email: 'customer2@practicesoftwaretesting.com', password: 'welcome01' },
    { email: 'customer@practicesoftwaretesting.com', password: 'welcome01' },
    { email: 'customer3@practicesoftwaretesting.com', password: 'pass123' },
  ];

  let loggedIn = false;

  for (const user of credentials) {
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

  // proceed to billing address
  await page.getByTestId('proceed-2').click();

  // fill billing address
  await page.getByTestId('country').selectOption('KZ');
  await page.getByTestId('postal_code').fill('050000');
  await page.getByTestId('house_number').fill('42');
  await page.getByTestId('street').fill('Rayimbek street');
  await page.getByTestId('city').fill('Almaty');
  await page.getByTestId('state').fill('Zhetysu');
  await page.getByTestId('proceed-3').click();

  // choose payment method
  await page.getByTestId('payment-method').selectOption('buy-now-pay-later');
  await page.getByTestId('monthly_installments').selectOption('3');
  await page.getByTestId('finish').click();

  const successPayment = page.getByTestId('payment-success-message');
  await expect(successPayment).toBeVisible();
  await expect(successPayment).toHaveText('Payment was successful');
});
