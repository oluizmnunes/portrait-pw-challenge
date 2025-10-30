import { test, expect } from '@playwright/test';
import { PageManager } from '../page-objects/pageManager'

const ADMIN_EMAIL = process.env.PW_ADMIN_EMAIL || 'admin@test.com'
const ADMIN_PASSWORD = process.env.PW_ADMIN_PASSWORD || 'Admin123!'
const INVALID_EMAIL = process.env.PW_INVALID_EMAIL || 'invalid@test.com'
const INVALID_PASSWORD = process.env.PW_INVALID_PASSWORD || 'InvalidPassword'

test.describe('valid login scenarios', () => {
  test.beforeEach(async ({ page }) => {
    const pm = new PageManager(page);
    await page.goto('/dashboard')
  })

  test('should login successfully', async ({ page }) => {
    const pm = new PageManager(page);
    await expect(pm.onNavigationBar().logoutButton, { message: 'Failed to login, no Logout button found' }).toBeVisible();
  })
})

test.describe('invalid login scenarios', () => {
  test.use({ storageState: undefined })
  test.beforeEach(async ({ page }) => {
    const pm = new PageManager(page);
    await pm.navigateTo().loginPage();
  });

  test('should display error message when login fails due to invalid credentials', async ({ page }) => {
    const pm = new PageManager(page);

    await pm.onLoginPage().inputEmailAndPassword(INVALID_EMAIL, INVALID_PASSWORD);
    await pm.onLoginPage().loginButton.click();

    const errorMessage = await pm.onLoginPage().getErrorMessage();
    expect(errorMessage).toBe('Invalid email or password');
  });
});