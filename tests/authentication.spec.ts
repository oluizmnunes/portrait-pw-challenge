import { test, expect } from '@playwright/test';
import { PageManager } from '../page-objects/pageManager'

const INVALID_EMAIL = process.env.PW_INVALID_EMAIL || 'invalid@test.com'
const INVALID_PASSWORD = process.env.PW_INVALID_PASSWORD || 'InvalidPassword'
const ADMIN_EMAIL = process.env.PW_ADMIN_EMAIL || 'admin@test.com'
const ADMIN_PASSWORD = process.env.PW_ADMIN_PASSWORD || 'Admin123!'

test.describe('valid login scenarios', () => {
  test.beforeEach(async ({ page }) => {
    const pm = new PageManager(page);
    await pm.navigateTo().dashboardPage()
  })

  test('should keep login time to authenticated state under 3 seconds', async ({ page }) => {
    const pm = new PageManager(page);

    // Ensure logged-out state without failing if already logged out
    try { await pm.onNavigationBar().logout() } catch {}
    await pm.navigateTo().loginPage()

    const start = Date.now()
    await pm.onLoginPage().login(ADMIN_EMAIL, ADMIN_PASSWORD)
    await expect(pm.onNavigationBar().logoutButton).toBeVisible()
    const elapsedMs = Date.now() - start

    expect(elapsedMs).toBeLessThan(3000)
  })

  test('should login successfully', async ({ page }) => {
    const pm = new PageManager(page);
    await expect(pm.onNavigationBar().logoutButton, { message: 'Failed to login, no Logout button found' }).toBeVisible();
  })

  test('should show navbar items and username', async ({ page }) => {
    const pm = new PageManager(page);
    await expect(pm.onNavigationBar().dashboardLink).toBeVisible()
    await expect(pm.onNavigationBar().productsLink).toBeVisible()
    await expect(pm.onNavigationBar().inventoryLink).toBeVisible()
    await expect(pm.onNavigationBar().userName).toBeVisible()
  })

  test('should persist session after reload', async ({ page }) => {
    const pm = new PageManager(page);
    await page.reload()
    await expect(pm.onNavigationBar().logoutButton).toBeVisible()
  })

  test('should logout and prevent access to dashboard', async ({ page }) => {
    const pm = new PageManager(page);
    await pm.onNavigationBar().logout()
    await expect(page).toHaveURL('/login')
    await pm.navigateTo().dashboardPage()
    await expect(page).toHaveURL('/login')
  })

  test('should logout and prevent access to Products page', async ({ page }) => {
    const pm = new PageManager(page);
    await pm.onNavigationBar().logout()
    await expect(page).toHaveURL('/login')
    await pm.navigateTo().productsPage()
    await expect(page).toHaveURL('/login')
  })

  test('should logout and prevent access to Inventory page', async ({ page }) => {
    const pm = new PageManager(page);
    await pm.onNavigationBar().logout()
    await expect(page).toHaveURL('/login')
    await pm.navigateTo().inventoryPage()
    await expect(page).toHaveURL('/login')
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

  test('should display error for wrong email and correct password', async ({ page }) => {
    const pm = new PageManager(page);

    await pm.onLoginPage().inputEmailAndPassword(INVALID_EMAIL, ADMIN_PASSWORD);
    await pm.onLoginPage().loginButton.click();

    await expect(pm.onLoginPage().errorMessage).toContainText('Invalid email or password');
  });

  test('should display error for correct email and wrong password', async ({ page }) => {
    const pm = new PageManager(page);

    await pm.onLoginPage().inputEmailAndPassword(ADMIN_EMAIL, INVALID_PASSWORD);
    await pm.onLoginPage().loginButton.click();

    await expect(pm.onLoginPage().errorMessage).toContainText('Invalid email or password');
  });

  test('should display native HTML5 form validation for empty Email', async ({ page }) => {
    const pm = new PageManager(page);

    await pm.onLoginPage().inputEmailAndPassword('', ADMIN_PASSWORD);
    await pm.onLoginPage().loginButton.click();

    await expect(pm.onLoginPage().errorMessage).toBeHidden();

    // validate native HTML5 form validation
    const emailValidation = await pm.onLoginPage().emailInput.evaluate((el: any) => (el as HTMLInputElement).validationMessage);
    expect(emailValidation).toContain('Please fill out this field');
  });

  test('should display native HTML5 form validation for empty Password', async ({ page }) => {
    const pm = new PageManager(page);

    await pm.onLoginPage().inputEmailAndPassword(ADMIN_EMAIL, '');
    await pm.onLoginPage().loginButton.click();

    await expect(pm.onLoginPage().errorMessage).toBeHidden();

    const passwordValidation = await pm.onLoginPage().passwordInput.evaluate((el: any) => (el as HTMLInputElement).validationMessage);
    expect(passwordValidation).toContain('Please fill out this field');
  });
});