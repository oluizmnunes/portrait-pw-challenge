import { test, expect } from '@playwright/test';
import { PageManager } from '../page-objects/pageManager';

test.describe('Products - Add and Delete', () => {
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

  test('should delete a product with confirmation', async ({ page }) => {
    const pm = new PageManager(page);
    const product = pm.onProductsPage().generateTestProduct();
    await pm.onProductsPage().createProduct(product);

    await pm.onProductsPage().searchProduct(product.name);
    await pm.onProductsPage().deleteFirstProduct();
    await expect(pm.onProductsPage().noProductsMessage).toBeVisible();
  });

});

test.describe('Products - Edit Flows', () => {
  test.beforeEach(async ({ page }) => {
    const pm = new PageManager(page);
    await pm.onProductsPage().resetApplicationData();
    await pm.onNavigationBar().navigateToProducts();
  });

  test('should edit only name and keep SKU unchanged', async ({ page }) => {
    const pm = new PageManager(page);
    const product = pm.onProductsPage().generateTestProduct();

    await pm.onProductsPage().createProduct(product);

    const updatedName = `${product.name} - Updated`;
    await pm.onProductsPage().editFirstProduct({ name: updatedName });
    await expect(page).toHaveURL('/products');

    const row = pm.onProductsPage().getProductRowByText(updatedName);
    await expect(row).toBeVisible();
    await expect(row).toContainText(product.sku); // SKU must remain the same
  });
});

test.describe('Products - Business Rules', () => {
  test.beforeEach(async ({ page }) => {
    const pm = new PageManager(page);
    await pm.onProductsPage().resetApplicationData();
    await pm.onNavigationBar().navigateToProducts();
  });

  test('should reject creating product with duplicate SKU', async ({ page }) => {
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

    await pm.onProductsPage().skuInput.fill(product.sku);
    await pm.onProductsPage().nameInput.fill(`${product.name} Copy`);
    await pm.onProductsPage().descriptionInput.fill(product.description);
    await pm.onProductsPage().priceInput.fill(String(product.price));
    await pm.onProductsPage().stockInput.fill(String(product.stock));
    await pm.onProductsPage().categoryInput.selectOption('Electronics');
    await pm.onProductsPage().thresholdInput.fill(String(product.lowStockThreshold));
    await pm.onProductsPage().saveButton.click();

    // Expect a SKU uniqueness error on the form (message wording may vary)
    const form = pm.onProductsPage().productForm;
    await expect(form, { message: 'Expected a SKU uniqueness error' }).toContainText(/SKU|sku/);
    await expect(form, { message: 'Expected uniqueness wording for duplicate SKU' }).toContainText(/exists|unique/i);
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

test.describe('Products - Sorting and Filtering', () => {
  test.beforeEach(async ({ page }) => {
    const pm = new PageManager(page);
    await pm.onProductsPage().resetApplicationData();
    await pm.onNavigationBar().navigateToProducts();
  });

  test('should sort by name ascending', async ({ page }) => {
    const pm = new PageManager(page);
    const a = pm.onProductsPage().generateTestProduct(); a.name = 'AAA Product';
    const z = pm.onProductsPage().generateTestProduct(); z.name = 'ZZZ Product';
    await pm.onProductsPage().createProduct(a);
    await pm.onProductsPage().createProduct(z);

    await pm.onProductsPage().sortSelect.selectOption('name-asc');
    const firstRow = pm.onProductsPage().productsTable.locator('[data-testid^="product-row-"]').first();
    await expect(firstRow).toContainText('AAA Product');
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

  test('should filter by category and show only matching products', async ({ page }) => {
    const pm = new PageManager(page);
    const p1 = pm.onProductsPage().generateTestProduct(); p1.category = 'Electronics' as any; // casting for test data convenience; UI accepts string option
    const p2 = pm.onProductsPage().generateTestProduct(); p2.category = 'Hardware' as any; // bypass strict TS type on fixture-only assignment
    await pm.onProductsPage().createProduct(p1);
    await pm.onProductsPage().createProduct(p2);

    await pm.onProductsPage().categoryFilter.selectOption('Electronics');
    const rows = pm.onProductsPage().productsTable.locator('[data-testid^="product-row-"]');
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText(p1.name);
  });
});