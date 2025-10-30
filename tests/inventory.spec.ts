import { test, expect } from '@playwright/test'
import { PageManager } from '../page-objects/pageManager'

test.describe('Inventory - Stock Adjustment', () => {
  test.beforeEach(async ({ page }) => {
    const pm = new PageManager(page)
    await pm.onProductsPage().resetApplicationData()
  })

  test('should adjust stock for an existing product', async ({ page }) => {
    const pm = new PageManager(page)
    const product = pm.onProductsPage().generateTestProduct()
    const adjustment = Math.floor(Math.random() * (2000 - 1000 + 1)) + 1000

    await pm.onProductsPage().createProduct(product)
    await pm.navigateTo().inventoryPage()
    await expect(page, { message: 'Did not navigate to /inventory after product creation' }).toHaveURL('/inventory')

    const row = pm.onInventoryPage().getProductRowByText(product.sku)
    await expect(row, { message: 'Inventory row for created product not visible' }).toBeVisible()
    await row.getByText('Adjust Stock').click()
    await expect(pm.onInventoryPage().adjustStockModal, { message: 'Adjust stock modal did not appear' }).toBeVisible()
    await pm.onInventoryPage().adjustmentInput.fill(String(adjustment))
    await pm.onInventoryPage().confirmAdjustButton.click()
    await pm.onInventoryPage().adjustStockModal.waitFor({ state: 'hidden' })

    const newStock = (product.stock + adjustment).toString()
    await expect.soft(row.getByText(newStock), { message: 'Adjusted stock not reflected in row' }).toBeVisible()
  })
})

test.describe('Inventory - Low Stock Rules', () => {
  test.beforeEach(async ({ page }) => {
    const pm = new PageManager(page)
    await pm.onProductsPage().resetApplicationData()
  })

test('alert clears when stock rises above threshold', async ({ page }) => {
    const pm = new PageManager(page)

    await pm.navigateTo().productsPage()
    await Promise.all([
      page.waitForURL('/products/new'),
      pm.onProductsPage().addProductButton.click()
    ])

    await pm.onProductsPage().skuInput.fill('LOW-STOCK-CLR')
    await pm.onProductsPage().nameInput.fill('Low Stock Clear')
    await pm.onProductsPage().descriptionInput.fill('X')
    await pm.onProductsPage().priceInput.fill('10.00')
    await pm.onProductsPage().stockInput.fill('3')
    await pm.onProductsPage().categoryInput.selectOption('Electronics')
    await pm.onProductsPage().thresholdInput.fill('10')
    await pm.onProductsPage().saveButton.click()
    await expect(page).toHaveURL('/products')
    await pm.navigateTo().inventoryPage()
    await expect(page).toHaveURL('/inventory')

    const row = pm.onInventoryPage().getProductRowByText('Low Stock Clear')
    await row.getByText('Adjust Stock').click()
    await pm.onInventoryPage().adjustmentInput.fill('11')
    await pm.onInventoryPage().confirmAdjustButton.click()
    await pm.onInventoryPage().adjustStockModal.waitFor({ state: 'hidden' })

    const lowStockRow = pm.onInventoryPage().getProductRowByText('Low Stock Clear')
    await expect(lowStockRow.locator('.bg-red-100'), { message: 'Low stock indicator class still present on row after raising stock' }).toHaveCount(0)
  })
})
test.describe('Inventory - Low Stock Indicators', () => {
  test.beforeEach(async ({ page }) => {
    const pm = new PageManager(page)
    await pm.onProductsPage().resetApplicationData()
  })

  test('Low stock badges and alerts are displayed', async ({ page }) => {
    const pm = new PageManager(page)

    await pm.navigateTo().productsPage()
    await Promise.all([
      page.waitForURL('/products/new'),
      pm.onProductsPage().addProductButton.click()
    ])

    await pm.onProductsPage().skuInput.fill('LOW-STOCK-001')
    await pm.onProductsPage().nameInput.fill('Low Stock Product')
    await pm.onProductsPage().descriptionInput.fill('Product with low inventory')
    await pm.onProductsPage().priceInput.fill('50.00')
    await pm.onProductsPage().stockInput.fill('3')
    await pm.onProductsPage().categoryInput.selectOption('Electronics')
    await pm.onProductsPage().thresholdInput.fill('10')
    await pm.onProductsPage().saveButton.click()

    await pm.navigateTo().productsPage()
    const badge = pm.onProductsPage().getProductRowByText('Low Stock Product').locator('.bg-red-100')
    await expect(badge).toBeVisible()

    await pm.navigateTo().inventoryPage()
    const alert = pm.onInventoryPage().lowStockAlert.filter({ hasText: 'running low on stock' })
    await expect(alert).toContainText('running low on stock')
    const lowItem = pm.onInventoryPage().getProductRowByText('Low Stock Product').locator('.bg-red-100')
    await expect(lowItem).toContainText('Low Stock')
  })
})