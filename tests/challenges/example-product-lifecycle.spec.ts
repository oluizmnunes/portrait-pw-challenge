import { test, expect } from '@playwright/test'
import { LoginPage } from '../../pages/login.page'
import { resetApplicationData, loginAsAdmin, generateTestProduct } from '../helpers/test-helpers'
import testData from '../../data/test-products.json'

/**
 * EXAMPLE TEST SUITE
 * This demonstrates a complete product lifecycle test
 * showing good practices for the QA challenge
 */

test.describe('Product Lifecycle - Example', () => {
  test.beforeEach(async ({ page }) => {
    // Reset data before each test for isolation
    await resetApplicationData(page)

    // Login as admin for product management
    await loginAsAdmin(page)
  })

  test.only('Complete product lifecycle: Create → Edit → Adjust Stock → Delete', async ({ page }) => {
    // Generate unique test data
    const testProduct = generateTestProduct()

    // Step 1: Create a new product
    await test.step('Create new product', async () => {
      await page.goto('/products')
      await page.getByTestId('add-product-button').click()
      await expect(page).toHaveURL('/products/new')

      // Fill product form
      await page.getByTestId('sku-input').fill(testProduct.sku)
      await page.getByTestId('name-input').fill(testProduct.name)
      await page.getByTestId('description-input').fill(testProduct.description)
      await page.getByTestId('price-input').fill(testProduct.price.toString())
      await page.getByTestId('stock-input').fill(testProduct.stock.toString())
      await page.getByTestId('category-input').selectOption(testProduct.category)
      await page.getByTestId('threshold-input').fill(testProduct.lowStockThreshold.toString())

      await page.getByTestId('save-button').click()
      await expect(page).toHaveURL('/products')

      const productsTable = page.getByTestId('products-table');
      await expect(productsTable.filter({ hasText: `${testProduct.sku}` })).toBeVisible();
    })

    // Step 2: Search for the product
    await test.step('Search for created product', async () => {
      await page.getByTestId('search-input').fill(testProduct.name)

      // Verify only our product is shown
      const productRows = page.locator('[data-testid^="product-row-"]')
      await expect(productRows).toHaveCount(1)
      await expect(productRows.first()).toContainText(testProduct.name)
    })

    // Step 3: Edit the product
    await test.step('Edit product details', async () => {
      // Find the product ID from the edit button's href
      const editButton = page.locator(`[data-testid^="edit-product-"]`).first()
      await editButton.click()

      // Update product details
      const updatedProductName = `${testProduct.name} - Updated`
      await page.getByTestId('name-input').fill(updatedProductName)
      await page.getByTestId('price-input').fill('999.99')
      await page.getByTestId('save-button').click()

      // Verify updates
      await expect(page).toHaveURL('/products')
      await expect(page.getByText(updatedProductName)).toBeVisible()
      await expect(page.getByText('$999.99')).toBeVisible()
    })

    // Step 4: Adjust its stock
    await test.step('Adjust product stock', async () => {
      await page.goto('/inventory')

      // Find new product by SKU and get the adjust button
      const productRow = page.locator('[data-testid^="inventory-row-"]').filter({ hasText: testProduct.sku })
      const adjustButton = productRow.getByText('Adjust Stock')
      await adjustButton.click()

      // Wait for modal to appear and fill adjustment
      await page.getByTestId('adjust-stock-modal').waitFor({ state: 'visible' })
      await page.getByTestId('adjustment-input').fill('10')
      
      // Click confirm button
      await page.getByTestId('confirm-adjust-button').click()
      
      // Wait for modal to close
      await page.getByTestId('adjust-stock-modal').waitFor({ state: 'hidden' })

      // Verify stock was updated
      const newStock = testProduct.stock + 10;
      await expect(page.getByText(newStock.toString())).toBeVisible();
    })

    // Step 5: Delete the product
    await test.step('Delete product', async () => {
      await page.goto('/products')

      // Find and delete
      await page.getByTestId('search-input').fill(testProduct.name)
      const deleteButton = page.locator(`[data-testid^="delete-product-"]`).first()
      await deleteButton.click()

      // Confirm deletion in modal
      await page.getByTestId('confirm-delete-button').click()

      // Assert that the product was deleted
      await expect(page.getByTestId('no-products-message')).toBeVisible()
    })
  })

  test('Verify low stock alerts', async ({ page }) => {
    await test.step('Create product with low stock', async () => {
      await page.goto('/products/new')

      // Create product with stock below threshold
      await page.getByTestId('sku-input').fill('LOW-STOCK-001')
      await page.getByTestId('name-input').fill('Low Stock Product')
      await page.getByTestId('description-input').fill('Product with low inventory')
      await page.getByTestId('price-input').fill('50.00')
      await page.getByTestId('stock-input').fill('3')
      await page.getByTestId('category-input').selectOption('Electronics')
      await page.getByTestId('threshold-input').fill('10')
      await page.getByTestId('save-button').click()
    })

    await test.step('Verify low stock indicators', async () => {
      // Check products page - stock badge should have a red background
      await page.goto('/products')
      const stockBadge = page.locator('[data-testid^="product-row-"]').filter({ hasText: 'Low Stock Product' }).locator('.bg-red-100')
      await expect(stockBadge).toBeVisible()

      // Check inventory page - low stock alert (in yellow) should exist
      await page.goto('/inventory')
      const lowStockAlert = page.getByTestId('low-stock-alert').filter({ hasText: 'running low on stock' })
      await expect(lowStockAlert).toContainText('running low on stock') // avoid possible future errors by pluralization

      // Check inventory page - low stock item should have 'Low Stock' status with a red background
      const lowStockItem = page.locator('[data-testid^="inventory-row-"]').filter({ hasText: 'Low Stock Product' }).locator('.bg-red-100')
      await expect(lowStockItem).toContainText('Low Stock')
    })
  })

  test('Data-driven product creation from test data', async ({ page }) => {
    // Use test data from JSON file
    for (const product of testData.validProducts) {
      await test.step(`Create product: ${product.name}`, async () => {
        await page.goto('/products/new')

        await page.getByTestId('sku-input').fill(product.sku)
        await page.getByTestId('name-input').fill(product.name)
        await page.getByTestId('description-input').fill(product.description)
        await page.getByTestId('price-input').fill(product.price.toString())
        await page.getByTestId('stock-input').fill(product.stock.toString())
        await page.getByTestId('category-input').selectOption(product.category)
        await page.getByTestId('threshold-input').fill(product.lowStockThreshold.toString())

        await page.getByTestId('save-button').click()
        await expect(page).toHaveURL('/products')

        // Verify product was created
        await expect(page.getByText(product.name)).toBeVisible()
      })
    }
  })
})

test.describe('Form Validation - Negative Tests', () => {
  test.beforeEach(async ({ page }) => {
    await resetApplicationData(page)
    await loginAsAdmin(page)
    await page.goto('/products/new')
  })

  test('Should validate required fields', async ({ page }) => {
    // Try to submit empty form
    await page.getByTestId('save-button').click()

    // Check for validation errors
    const productForm = page.getByTestId('product-form');
    await expect(productForm.filter({ hasText: 'SKU is required' })).toBeVisible();
    await expect(productForm.filter({ hasText: 'Name is required' })).toBeVisible();
    await expect(productForm.filter({ hasText: 'Price is required' })).toBeVisible();
    await expect(productForm.filter({ hasText: 'Stock is required' })).toBeVisible();
  })

  test('Should validate negative values', async ({ page }) => {
    await page.getByTestId('sku-input').fill('TEST-NEG')
    await page.getByTestId('name-input').fill('Test Product')
    await page.getByTestId('price-input').fill('-10')
    await page.getByTestId('stock-input').fill('-5')

    await page.getByTestId('save-button').click()

    // Check for validation errors
    const productForm = page.getByTestId('product-form');
    await expect(productForm.filter({ hasText: 'Price must be greater than 0' })).toBeVisible();
    await expect(productForm.filter({ hasText: 'Stock cannot be negative' })).toBeVisible();
  })
})