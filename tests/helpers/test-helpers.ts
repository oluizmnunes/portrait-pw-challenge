import { Page } from '@playwright/test'

/**
 * Reset application data to default state
 * Useful for test isolation and cleanup
 */
export async function resetApplicationData(page: Page) {
  // Navigate to the page first to ensure we're in the correct context
  await page.goto('/')
  
  // Call the reset API endpoint
  await page.request.post('/api/reset')

  // Clear localStorage to reset client-side data
  await page.evaluate(() => {
    localStorage.clear()
  })

  // Reload to apply changes
  await page.reload()
}

/**
 * Login helper for quick authentication in tests
 */
export async function loginAsAdmin(page: Page) {
  await page.goto('/login')
  await page.getByTestId('email-input').fill('admin@test.com')
  await page.getByTestId('password-input').fill('Admin123!')
  await page.getByTestId('login-button').click()
  await page.waitForURL('/dashboard')
}

/**
 * Login helper for regular user
 */
export async function loginAsUser(page: Page) {
  await page.goto('/login')
  await page.getByTestId('email-input').fill('user@test.com')
  await page.getByTestId('password-input').fill('User123!')
  await page.getByTestId('login-button').click()
  await page.waitForURL('/dashboard')
}

/**
 * Wait for a specific element to be visible and stable
 */
export async function waitForElement(page: Page, testId: string) {
  const element = page.getByTestId(testId)
  await element.waitFor({ state: 'visible' })
  await element.waitFor({ state: 'attached' })
  return element
}

/**
 * Generate unique test data
 */
export function generateTestProduct() {
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