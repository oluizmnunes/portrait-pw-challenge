import { test, expect } from '@playwright/test';
import { PageManager } from '../page-objects/pageManager'

test.describe('valid login scenarios', () => {
  test.beforeEach(async ({ page }) => { // not beforeAll() to keep test isolation
    const pm = new PageManager(page);
    await pm.onLoginPage().resetApplicationData();
    await pm.navigateTo().loginPage();
  })

  test('should login successfully', async ({ page }) => {
      const pm = new PageManager(page);

      await pm.onLoginPage().inputEmailAndPassword('admin@test.com', 'Admin123!'); // eliminate hardcoding asap
      await pm.onLoginPage().loginButton.click();

      await expect(pm.onDashboardPage().dashboardTitle, { // find another way to assert login success
        message: 'Dashboard title should be visible after successful login' 
      }).toBeVisible();
  })
})

test.describe('invalid login scenarios', () => {
  test.beforeEach(async ({ page }) => {
    const pm = new PageManager(page);
    await pm.navigateTo().loginPage();
  });

  test('should fail to login and display error message', async ({ page }) => {
    const pm = new PageManager(page);

    await pm.onLoginPage().inputEmailAndPassword('invalid@test.com', 'InvalidPassword');
    await pm.onLoginPage().loginButton.click();

    const errorMessage = await pm.onLoginPage().getErrorMessage();
    expect(errorMessage).toBe('Invalid email or password');
  });
});