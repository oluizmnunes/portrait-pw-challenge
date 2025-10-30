import { test, expect } from '@playwright/test';
import { PageManager } from '../page-objects/pageManager';

test.describe('Products - Add and Delete', () => {
  test.beforeEach(async ({ page }) => {
    const pm = new PageManager(page);
    await pm.onProductsPage().resetApplicationData();
    await pm.navigateTo().productsPage();
    await expect(pm.onProductsPage().productsTable, { message: 'Products table not ready after navigation' }).toBeVisible();
  });

  test('should add a new product with valid data', async ({ page }) => {
    const pm = new PageManager(page);
    const product = pm.onProductsPage().generateTestProduct();
    await test.step('Open form and submit valid product', async () => {
      await pm.onProductsPage().createProduct(product);
    })
    await test.step('Verify product appears in list', async () => {
      await expect(pm.onProductsPage().productsTable.filter({ hasText: product.sku }), { message: 'Created product row not visible in table' }).toBeVisible();
    })
  });

  test('should delete a product with confirmation', async ({ page }) => {
    const pm = new PageManager(page);
    const product = pm.onProductsPage().generateTestProduct();
    await test.step('Create product to be deleted', async () => {
      await pm.onProductsPage().createProduct(product);
    })
    await test.step('Delete from list', async () => {
      await pm.onProductsPage().searchProduct(product.name);
      await pm.onProductsPage().deleteFirstProduct();
    })
    await test.step('Verify deletion feedback', async () => {
      await expect(pm.onProductsPage().noProductsMessage, { message: 'No products message not visible after deletion' }).toBeVisible();
    })
  });

});

test.describe('Products - Business Rules', () => {
  test.beforeEach(async ({ page }) => {
    const pm = new PageManager(page);
    await pm.onProductsPage().resetApplicationData();
    await pm.navigateTo().productsPage();
    await expect(pm.onProductsPage().productsTable, { message: 'Products table not ready after navigation' }).toBeVisible();
  });

  test('should not create a second product with duplicate SKU', async ({ page }) => {
    const pm = new PageManager(page);
    const product = pm.onProductsPage().generateTestProduct();
    await test.step('Create baseline product', async () => {
      await pm.onProductsPage().createProduct(product);
    })
    await test.step('Attempt to create duplicate SKU', async () => {
      await pm.navigateTo().productsPage();
      await Promise.all([
        page.waitForURL('/products/new'),
        pm.onProductsPage().addProductButton.click()
      ]);
      const duplicate = { ...product, name: `${product.name} Copy`, category: 'Electronics' as any }
      await pm.onProductsPage().fillProductForm(duplicate);
      await pm.onProductsPage().saveButton.click();
    })
    await test.step('Verify no duplicate in list', async () => {
      await pm.navigateTo().productsPage();
      const rowsWithSku = pm.onProductsPage().productsTable.filter({ hasText: product.sku });
      await expect(rowsWithSku, { message: 'Duplicate SKU appears more than once in the list' }).toHaveCount(1);
    })
  });
});

test.describe('Products - Empty Required Fields', () => {
  test.beforeEach(async ({ page }) => {
    const pm = new PageManager(page);
    await pm.onProductsPage().resetApplicationData();
    await pm.navigateTo().productsPage();
    await expect(pm.onProductsPage().addProductButton).toBeVisible();
    await Promise.all([
      page.waitForURL('/products/new'),
      pm.onProductsPage().addProductButton.click()
    ]);
  });

  test('should display error message for required fields', async ({ page }) => {
    const pm = new PageManager(page);
    await test.step('Submit empty form', async () => {
      await pm.onProductsPage().saveButton.click();
    })
    await test.step('Assert required fields', async () => {
      const form = pm.onProductsPage().productForm;
      await expect(form.filter({ hasText: 'SKU is required' }), { message: 'Missing SKU required validation' }).toBeVisible();
      await expect(form.filter({ hasText: 'Name is required' }), { message: 'Missing Name required validation' }).toBeVisible();
      await expect(form.filter({ hasText: 'Price is required' }), { message: 'Missing Price required validation' }).toBeVisible();
      await expect(form.filter({ hasText: 'Stock is required' }), { message: 'Missing Stock required validation' }).toBeVisible();
    })
  });
});

test.describe('Products - Negative Price and Stock', () => {
  test.beforeEach(async ({ page }) => {
    const pm = new PageManager(page);
    await pm.onProductsPage().resetApplicationData();
    await pm.navigateTo().productsPage();
    await Promise.all([
      page.waitForURL('/products/new'),
      pm.onProductsPage().addProductButton.click()
    ]);
  });

  test('should display error message for negative price and stock values', async ({ page }) => {
    const pm = new PageManager(page);
    await test.step('Fill invalid values and submit', async () => {
      await pm.onProductsPage().skuInput.fill('TEST-NEG');
      await pm.onProductsPage().nameInput.fill('Test Product');
      await pm.onProductsPage().priceInput.fill('-10');
      await pm.onProductsPage().stockInput.fill('-5');
      await pm.onProductsPage().saveButton.click();
    })
    await test.step('Assert validation errors', async () => {
      const form = pm.onProductsPage().productForm;
      await expect(form.filter({ hasText: 'Price must be greater than 0' }), { message: 'Negative price not validated' }).toBeVisible();
      await expect(form.filter({ hasText: 'Stock cannot be negative' }), { message: 'Negative stock not validated' }).toBeVisible();
    })
  });
});

test.describe('Products - Sorting and Filtering', () => {
  test.beforeEach(async ({ page }) => {
    const pm = new PageManager(page);
    await pm.onProductsPage().resetApplicationData();
    await pm.navigateTo().productsPage();
  });

  test('should sort by name', async ({ page }) => {
    const pm = new PageManager(page);

    const startedWithZ = pm.onProductsPage().generateTestProduct(); startedWithZ.name = 'ZZZ Product';
    await test.step('Seed data', async () => {
      await pm.onProductsPage().createProduct(startedWithZ);
      await expect(page).toHaveURL('/products')
      await expect(pm.onProductsPage().productsTable, { message: 'Products table not ready' }).toBeVisible()
      await expect(pm.onProductsPage().productsTable.filter({ hasText: startedWithZ.sku }), { message: 'Row for last product not rendered yet' }).toBeVisible();
    })
    await test.step('Apply sort and verify', async () => {
      await pm.onProductsPage().sortSelect.selectOption('Sort by Name');
      const firstRow = pm.onProductsPage().productsTable.locator('[data-testid^="product-row-"]').last();
      await expect(firstRow, { message: 'Name ascending sort did not place ZZZ Product first' }).toContainText('ZZZ Product');
    })
  });

  test('should return only the product that matches the search', async ({ page }) => {
    const pm = new PageManager(page);
    const product = pm.onProductsPage().generateTestProduct();
    await test.step('Seed product', async () => {
      await pm.onProductsPage().createProduct(product);
    })
    await test.step('Search and verify single result', async () => {
      await pm.onProductsPage().searchProduct(product.name);
      const productRows = pm.onProductsPage().productsTable.locator('[data-testid^="product-row-"]');
      await expect(productRows, { message: 'Search did not narrow results to a single row' }).toHaveCount(1);
      await expect(productRows.first(), { message: 'Search results do not contain expected product' }).toContainText(product.name);
    })
  });
});