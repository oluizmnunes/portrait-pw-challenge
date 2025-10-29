import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/loginPage'
import { PageManager } from '../page-objects/pageManager'
import { NavigationPage } from '../page-objects/navigationPage'

test.describe('valid login scenarios', () => {
  test('should login successfully', async ({ page }) => {
      const pm = new PageManager(page);

      // Act
      await pm.navigateTo().loginPage();
      await expect(pm.onLoginPage().emailInput).toBeVisible();
      await expect(pm.onLoginPage().passwordInput).toBeVisible();
      await pm.onLoginPage().togglePasswordVisibility(); // facilitate 
      await expect(pm.onLoginPage().passwordInput).toHaveAttribute('type', 'text');
      await pm.onLoginPage().inputEmailAndPassword('admin@test.com', 'Admin123!'); // TODO: eliminate hardcoding asap
      await pm.onLoginPage().loginButton.click()

      // Assert
      await page.waitForURL('/dashboard')
      await expect(pm.onDashboardPage().dashboardTitle).toContainText('Dashboard')
  })
})