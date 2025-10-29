import { test, expect } from '@playwright/test';
import { PageManager } from '../page-objects/pageManager'

test.describe('valid login scenarios', () => {
  test('should login successfully', async ({ page }) => {
      const pm = new PageManager(page);

      // Act
      await pm.navigateTo().loginPage();
      await expect(pm.onLoginPage().emailInput).toBeVisible();
      await expect(pm.onLoginPage().passwordInput).toBeVisible();
      await pm.onLoginPage().togglePasswordVisibility();
      await expect(pm.onLoginPage().passwordInput).toHaveAttribute('type', 'text');
      await pm.onLoginPage().inputEmailAndPassword('admin@test.com', 'Admin123!'); // TODO: eliminate hardcoding asap
      await pm.onLoginPage().loginButton.click()

      // Assert
      await page.waitForURL('/dashboard')
      await expect(pm.onDashboardPage().dashboardTitle).toContainText('Dashboard')
  })
})

test.describe('invalid login scenarios', () => {
  test('should display error message for invalid password', async ({ page }) => {
    const pm = new PageManager(page);

    // Act
    await pm.navigateTo().loginPage();
    await expect(pm.onLoginPage().emailInput).toBeVisible();
    await expect(pm.onLoginPage().passwordInput).toBeVisible();
    await pm.onLoginPage().togglePasswordVisibility();
    
    // Assert
    await expect(pm.onLoginPage().passwordInput).toHaveAttribute('type', 'text');
    await pm.onLoginPage().inputEmailAndPassword('invalid@test.com', 'Admin123!'); // TODO: eliminate hardcoding asap
    await pm.onLoginPage().loginButton.click()
    await expect(pm.onLoginPage().errorMessage).toContainText('Invalid email or password'); 
  })
})