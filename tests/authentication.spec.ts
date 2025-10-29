import { test, expect } from '@playwright/test';
import { PageManager } from '../page-objects/pageManager'

test.describe('valid login scenarios', () => {
  test.beforeEach(async ({ page }) => { // not beforeAll() to keep test isolation
    const pm = new PageManager(page);

    await pm.onProductsPage().resetApplicationData();
    await pm.navigateTo().loginPage();

    await expect(pm.onLoginPage().emailInput).toBeVisible();
    await expect(pm.onLoginPage().passwordInput).toBeVisible();
  })

  test('should login successfully', async ({ page }) => {
      const pm = new PageManager(page);

      // Act
      await pm.onLoginPage().inputEmailAndPassword('admin@test.com', 'Admin123!'); // eliminate hardcoding asap
      await pm.onLoginPage().loginButton.click()

      // Assert
      await expect(pm.onDashboardPage().dashboardTitle).toContainText('Dashboard') // toContainText() has default timeouts (5s), no need to wait
  })
})

test.describe('invalid login scenarios', () => {
  test.beforeEach(async ({ page }) => {
    const pm = new PageManager(page);

    await pm.onProductsPage().resetApplicationData();
    await pm.navigateTo().loginPage();

    // Assert
    await expect(pm.onLoginPage().emailInput).toBeVisible();
  });

  test('should fail to login and display error message', async ({ page }) => {
    const pm = new PageManager(page);

    // Act
    await pm.onLoginPage().inputEmailAndPassword('invalid@test.com', 'InvalidPassword');
    await pm.onLoginPage().loginButton.click();

    // Assert
    await expect(pm.onLoginPage().errorMessage).toContainText('Invalid email or password');
  });
});