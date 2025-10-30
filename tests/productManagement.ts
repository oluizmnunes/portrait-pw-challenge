import { test, expect } from '@playwright/test';
import { PageManager } from '../page-objects/pageManager';
import testData from '../data/test-products.json';

/**
 * Product Lifecycle Test Suite
 * Demonstrates comprehensive product management testing using Page Object Model
 */

test.describe('Product Lifecycle - Example', () => {
  test.beforeEach(async ({ page }) => {
    const pm = new PageManager(page);
    await pm.onProductsPage().resetApplicationData();

    await pm.onLoginPage().inputEmailAndPassword('admin@test.com', 'Admin123!'); // eliminate hardcoding asap
    await pm.onLoginPage().loginButton.click();
    await pm.onNavigationBar().navigateToProducts();
  });

  // this test should be split
  test('Complete product lifecycle: Create → Edit → Adjust Stock → Delete', async ({ page }) => {
    const pm = new PageManager(page);
    
    // Generate unique test data
    const testProduct = pm.onProductsPage().generateTestProduct();

    // Step 1: Create a new product
    await test.step('Create new product', async () => {
      await pm.onProductsPage().createProduct(testProduct);

      // Verify product appears in table
      const productsTable = pm.onProductsPage().productsTable;
      await expect(productsTable.filter({ hasText: testProduct.sku })).toBeVisible();
    });

    // Step 2: Search for the product
    await test.step('Search for created product', async () => {
      await pm.onProductsPage().searchProduct(testProduct.name);

      // Verify only our product is shown
      const productRows = pm.onProductsPage().page.locator('[data-testid^="product-row-"]');
      await expect(productRows).toHaveCount(1);
      await expect(productRows.first()).toContainText(testProduct.name);
    });

    // Step 3: Edit the product
    await test.step('Edit product details', async () => {
      // Update product details
      const updatedProductName = `${testProduct.name} - Updated`;
      await pm.onProductsPage().editFirstProduct({
        name: updatedProductName,
        price: '999.99'
      });

      // Verify updates
      await expect(page).toHaveURL('/products');
      await expect(page.getByText(updatedProductName)).toBeVisible();
      await expect(page.getByText('$999.99')).toBeVisible();
    });

    // Step 4: Adjust its stock
    await test.step('Adjust product stock', async () => {
      await pm.navigateTo().inventoryPage();

      // Adjust stock for the product by SKU
      await pm.onInventoryPage().adjustStockBySku(testProduct.sku, '10');

      // Verify stock was updated
      const newStock = testProduct.stock + 10;
      const productRow = pm.onInventoryPage().productRowByText(testProduct.sku);
      await expect(productRow.getByText(newStock.toString())).toBeVisible();
    });

    // Step 5: Delete the product
    await test.step('Delete product', async () => {
      await pm.navigateTo().productsPage();

      // Find and delete
      await pm.onProductsPage().searchProduct(testProduct.name);
      await pm.onProductsPage().deleteFirstProduct();

      // Assert that the product was deleted
      await expect(pm.onProductsPage().noProductsMessage).toBeVisible();
    });
  });

  test('Verify low stock alerts', async ({ page }) => {
    const pm = new PageManager(page);
    
    await test.step('Create product with low stock', async () => {
      await pm.navigateTo().productsPage();
      await pm.onProductsPage().addProductButton.click();
      await page.waitForURL('/products/new');

      // Create product with stock below threshold
      await pm.onProductsPage().skuInput.fill('LOW-STOCK-001');
      await pm.onProductsPage().nameInput.fill('Low Stock Product');
      await pm.onProductsPage().descriptionInput.fill('Product with low inventory');
      await pm.onProductsPage().priceInput.fill('50.00');
      await pm.onProductsPage().stockInput.fill('3');
      await pm.onProductsPage().categoryInput.selectOption('Electronics');
      await pm.onProductsPage().thresholdInput.fill('10');
      await pm.onProductsPage().saveButton.click();
    });

    await test.step('Verify low stock indicators', async () => {
      // Check products page - stock badge should have a red background
      await pm.navigateTo().productsPage();
      const stockBadge = pm.onProductsPage().productRowByText('Low Stock Product').locator('.bg-red-100');
      await expect(stockBadge).toBeVisible();

      // Check inventory page - low stock alert (in yellow) should exist
      await pm.navigateTo().inventoryPage();
      const lowStockAlert = pm.onInventoryPage().lowStockAlert().filter({ hasText: 'running low on stock' });
      await expect(lowStockAlert).toContainText('running low on stock'); // avoid possible future errors by pluralization

      // Check inventory page - low stock item should have 'Low Stock' status with a red background
      const lowStockItem = pm.onInventoryPage().productRowByText('Low Stock Product').locator('.bg-red-100');
      await expect(lowStockItem).toContainText('Low Stock');
    });
  });

  test('Data-driven product creation from test data', async ({ page }) => {
    const pm = new PageManager(page);
    
    // Use test data from JSON file
    for (const product of testData.validProducts) {
      await test.step(`Create product: ${product.name}`, async () => {
        await pm.onProductsPage().createProduct(product);

        // Verify product was created
        await expect(page.getByText(product.name)).toBeVisible();
      });
    }
  });
});

test.describe('Form Validation - Negative Tests', () => {
  test.beforeEach(async ({ page }) => {
    const pm = new PageManager(page);
    
    await pm.onProductsPage().resetApplicationData();

    await pm.navigateTo().productsPage();
    await pm.onProductsPage().addProductButton.click();
    await page.waitForURL('/products/new');
  });

  test('Should validate required fields', async ({ page }) => {
    const pm = new PageManager(page);
    
    // Try to submit empty form
    await pm.onProductsPage().saveButton.click();

    // Check for validation errors
    const productForm = pm.onProductsPage().productForm;
    await expect(productForm.filter({ hasText: 'SKU is required' })).toBeVisible();
    await expect(productForm.filter({ hasText: 'Name is required' })).toBeVisible();
    await expect(productForm.filter({ hasText: 'Price is required' })).toBeVisible();
    await expect(productForm.filter({ hasText: 'Stock is required' })).toBeVisible();
  });

  test('Should validate negative values', async ({ page }) => {
    const pm = new PageManager(page);
    
    await pm.onProductsPage().skuInput.fill('TEST-NEG');
    await pm.onProductsPage().nameInput.fill('Test Product');
    await pm.onProductsPage().priceInput.fill('-10');
    await pm.onProductsPage().stockInput.fill('-5');

    await pm.onProductsPage().saveButton.click();

    // Check for validation errors
    const productForm = pm.onProductsPage().productForm;
    await expect(productForm.filter({ hasText: 'Price must be greater than 0' })).toBeVisible();
    await expect(productForm.filter({ hasText: 'Stock cannot be negative' })).toBeVisible();
  });
});
