import { test, expect } from '@playwright/test';
import { PageManager } from '../page-objects/pageManager';

test.describe('Products - Add and Delete', () => {
  test.beforeEach(async ({ page }) => {
    const pm = new PageManager(page);
    await pm.onProductsPage().resetApplicationData();
    await pm.onNavigationBar().navigateToProducts();
    await expect(pm.onProductsPage().productsTable, { message: 'Products table not ready after navigation' }).toBeVisible();
  });

  test('should add a new product with valid data', async ({ page }) => {
    const pm = new PageManager(page);
    const product = pm.onProductsPage().generateTestProduct();

    await pm.onProductsPage().createProduct(product);
    await expect(pm.onProductsPage().productsTable.filter({ hasText: product.sku }), { message: 'Created product row not visible in table' }).toBeVisible();
  });

  test('should delete a product with confirmation', async ({ page }) => {
    const pm = new PageManager(page);
    const product = pm.onProductsPage().generateTestProduct();
    await pm.onProductsPage().createProduct(product);

    await pm.onProductsPage().searchProduct(product.name);
    await pm.onProductsPage().deleteFirstProduct();
    await expect(pm.onProductsPage().noProductsMessage, { message: 'No products message not visible after deletion' }).toBeVisible();
  });

});

test.describe('Products - Business Rules', () => {
  test.beforeEach(async ({ page }) => {
    const pm = new PageManager(page);
    await pm.onProductsPage().resetApplicationData();
    await pm.onNavigationBar().navigateToProducts();
    await expect(pm.onProductsPage().productsTable, { message: 'Products table not ready after navigation' }).toBeVisible();
  });

  test('should not create a second product with duplicate SKU', async ({ page }) => {
    const pm = new PageManager(page);
    const product = pm.onProductsPage().generateTestProduct();

    // Create first product
    await pm.onProductsPage().createProduct(product);

    // Attempt to create second product with the same SKU
    await pm.onNavigationBar().navigateToProducts();
    await Promise.all([
      page.waitForURL('/products/new'),
      pm.onProductsPage().addProductButton.click()
    ]);

    const duplicate = { ...product, name: `${product.name} Copy`, category: 'Electronics' as any }
    await pm.onProductsPage().fillProductForm(duplicate);
    await pm.onProductsPage().saveButton.click();

    // Business rule verification: table must still contain only one row with that SKU
    await pm.onNavigationBar().navigateToProducts();
    const rowsWithSku = pm.onProductsPage().productsTable.filter({ hasText: product.sku });
    await expect(rowsWithSku, { message: 'Duplicate SKU appears more than once in the list' }).toHaveCount(1);
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
    await expect(form.filter({ hasText: 'SKU is required' }), { message: 'Missing SKU required validation' }).toBeVisible();
    await expect(form.filter({ hasText: 'Name is required' }), { message: 'Missing Name required validation' }).toBeVisible();
    await expect(form.filter({ hasText: 'Price is required' }), { message: 'Missing Price required validation' }).toBeVisible();
    await expect(form.filter({ hasText: 'Stock is required' }), { message: 'Missing Stock required validation' }).toBeVisible();
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
    await expect(form.filter({ hasText: 'Price must be greater than 0' }), { message: 'Negative price not validated' }).toBeVisible();
    await expect(form.filter({ hasText: 'Stock cannot be negative' }), { message: 'Negative stock not validated' }).toBeVisible();
  });
});

test.describe('Products - Sorting and Filtering', () => {
  test.beforeEach(async ({ page }) => {
    const pm = new PageManager(page);
    await pm.onProductsPage().resetApplicationData();
    await pm.onNavigationBar().navigateToProducts();
  });

  test('should sort by name', async ({ page }) => {
    const pm = new PageManager(page);

    const startedWithZ = pm.onProductsPage().generateTestProduct(); startedWithZ.name = 'ZZZ Product';
    await pm.onProductsPage().createProduct(startedWithZ);
    await expect(page).toHaveURL('/products')
    await expect(pm.onProductsPage().productsTable, { message: 'Products table not ready' }).toBeVisible()

    await expect(pm.onProductsPage().productsTable.filter({ hasText: startedWithZ.sku }), { message: 'Row for last product not rendered yet' }).toBeVisible();

    await pm.onProductsPage().sortSelect.selectOption('Sort by Name');
    const firstRow = pm.onProductsPage().productsTable.locator('[data-testid^="product-row-"]').last();
    await expect(firstRow, { message: 'Name ascending sort did not place ZZZ Product first' }).toContainText('ZZZ Product');
  });

  test('should return only the product that matches the search', async ({ page }) => {
    const pm = new PageManager(page);
    const product = pm.onProductsPage().generateTestProduct();
    await pm.onProductsPage().createProduct(product);

    await pm.onProductsPage().searchProduct(product.name);
    const productRows = pm.onProductsPage().productsTable.locator('[data-testid^="product-row-"]');
    await expect(productRows, { message: 'Search did not narrow results to a single row' }).toHaveCount(1);
    await expect(productRows.first(), { message: 'Search results do not contain expected product' }).toContainText(product.name);
  });
});