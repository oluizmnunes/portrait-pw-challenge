import { test, expect } from '@playwright/test'
import { LoginPage } from '../page-objects/loginPage'

test.describe('Login Functionality - Example Test', () => {
  test('should successfully login with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page)

    // Navigate to login page
    await loginPage.goto()

    // Verify login page is loaded
    await expect(loginPage.emailInput).toBeVisible()
    await expect(loginPage.passwordInput).toBeVisible()

    // Perform login
    await loginPage.login('admin@test.com', 'Admin123!')

    // Verify successful login by checking navigation to dashboard
    await page.waitForURL('/dashboard')
    await expect(page.getByTestId('dashboard-title')).toContainText('Dashboard')
  })

  test('should show error message with invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page)

    await loginPage.goto()
    await loginPage.login('invalid@test.com', 'wrongpassword')

    // Verify error message is displayed
    await expect(loginPage.errorMessage).toBeVisible()
    await expect(loginPage.errorMessage).toContainText('Invalid email or password')
  })
})