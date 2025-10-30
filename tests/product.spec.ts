import { test, expect } from '@playwright/test';
import { PageManager } from '../page-objects/pageManager';

test.describe('Products - Positive Flows', () => {
  test.beforeEach(async ({ page }) => {
    const pm = new PageManager(page);
    await pm.onProductsPage().resetApplicationData();
    await pm.onNavigationBar().navigateToProducts();
  });

  test('should add a new product with valid data', async ({ page }) => {
    const pm = new PageManager(page);
    const product = pm.onProductsPage().generateTestProduct();

    await pm.onProductsPage().createProduct(product);
    await expect(pm.onProductsPage().productsTable.filter({ hasText: product.sku })).toBeVisible();
  });

  test('should return only the product that matches the search', async ({ page }) => {
    const pm = new PageManager(page);
    const product = pm.onProductsPage().generateTestProduct();
    await pm.onProductsPage().createProduct(product);

    await pm.onProductsPage().searchProduct(product.name);
    const productRows = pm.onProductsPage().productsTable.locator('[data-testid^="product-row-"]');
    await expect(productRows).toHaveCount(1);
    await expect(productRows.first()).toContainText(product.name);
  });

  test('should delete a product with confirmation', async ({ page }) => {
    const pm = new PageManager(page);
    const product = pm.onProductsPage().generateTestProduct();
    await pm.onProductsPage().createProduct(product);

    await pm.onProductsPage().searchProduct(product.name);
    await pm.onProductsPage().deleteFirstProduct();
    await expect(pm.onProductsPage().noProductsMessage).toBeVisible();
  });

});

test.describe('Products - Empty Required Fields', () => {
  test.beforeEach(async ({ page }) => {
    const pm = new PageManager(page);
    await pm.onProductsPage().resetApplicationData();
    await pm.onNavigationBar().navigateToProducts();
    await expect(pm.onProductsPage().addProductButton).toBeVisible();
    await Promise.all([
      page.waitForURL('/products/new'),
      pm.onProductsPage().addProductButton.click()
    ]);
  });

  test('should display error message for required fields', async ({ page }) => {
    const pm = new PageManager(page);
    await pm.onProductsPage().saveButton.click();
    const form = pm.onProductsPage().productForm;
    await expect(form.filter({ hasText: 'SKU is required' })).toBeVisible();
    await expect(form.filter({ hasText: 'Name is required' })).toBeVisible();
    await expect(form.filter({ hasText: 'Price is required' })).toBeVisible();
    await expect(form.filter({ hasText: 'Stock is required' })).toBeVisible();
  });
});

test.describe('Products - Negative Price and Stock', () => {
  test.beforeEach(async ({ page }) => {
    const pm = new PageManager(page);
    await pm.onProductsPage().resetApplicationData();
    await pm.onNavigationBar().navigateToProducts();
    await Promise.all([
      page.waitForURL('/products/new'),
      pm.onProductsPage().addProductButton.click()
    ]);
  });

  test('should display error message for negative price and stock values', async ({ page }) => {
    const pm = new PageManager(page);
    await pm.onProductsPage().skuInput.fill('TEST-NEG');
    await pm.onProductsPage().nameInput.fill('Test Product');
    await pm.onProductsPage().priceInput.fill('-10');
    await pm.onProductsPage().stockInput.fill('-5');
    await pm.onProductsPage().saveButton.click();
    const form = pm.onProductsPage().productForm;
    await expect(form.filter({ hasText: 'Price must be greater than 0' })).toBeVisible();
    await expect(form.filter({ hasText: 'Stock cannot be negative' })).toBeVisible();
  });
});