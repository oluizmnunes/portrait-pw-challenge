import { Page } from '@playwright/test'

export class HelperBase {
  // class
  // field
  // constructor

  readonly page: Page;

  constructor(page: Page) {
      this.page = page;
  }

  /**
  * Reset application data to default state
  * Useful for test isolation and cleanup
  */
  async resetApplicationData() {
    try {
      await this.page.goto('/') // Navigate to the page first to ensure we're in the correct context
      await this.page.request.post('/api/reset') // Call the reset API endpoint
      await this.page.evaluate(() => { localStorage.clear() }) // Clear localStorage to reset client-side data
      await this.page.reload() // Reload to apply changes
    } catch (error) {
      throw new Error(`Failed to reset application data: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
  * Generate unique test data
  */
  async generateTestProduct() {
    const timestamp = Date.now()
    return {
      sku: `TEST-${timestamp}`,
      name: `Test Product ${timestamp}`,
      description: `Automated test product created at ${new Date().toISOString()}`,
      price: Math.floor(Math.random() * 900 + 100), // Random price between 100-1000
      stock: Math.floor(Math.random() * 100 + 1), // Random stock between 1-100
      category: ['Electronics', 'Hardware', 'Software', 'Accessories'][Math.floor(Math.random() * 4)] as any,
      lowStockThreshold: 10
    }
  }
}