import { Page } from '@playwright/test'

/**
 * Reset application data to default state
 * Useful for test isolation and cleanup
 */

export class HelperBase {
  // class
  // field
  // constructor

  readonly page: Page;

  constructor(page: Page) {
      this.page = page;
  }

  async resetApplicationData() {
    // Navigate to the page first to ensure we're in the correct context
      await this.page.goto('/')

      // Call the reset API endpoint
      await this.page.request.post('/api/reset')

      // Clear localStorage to reset client-side data
      await this.page.evaluate(() => {
        localStorage.clear()
      })
    
      // Reload to apply changes
      await this.page.reload()
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