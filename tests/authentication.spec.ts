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
    try { await pm.logout() } catch {}
    await pm.navigateTo().loginPage()

    const start = Date.now()
    await pm.onLoginPage().login(ADMIN_EMAIL, ADMIN_PASSWORD)
    await expect(pm.onNavigationBar().logoutButton, { message: 'Login may not have succeeded once Logout button is not visible' }).toBeVisible()
    const elapsedMs = Date.now() - start

    expect(elapsedMs, 'Performance regression detected: login time degradation exceeded 3 seconds. Please investigate.').toBeLessThan(3000)
  })

  test('should login successfully', async ({ page }) => {
    const pm = new PageManager(page);
    await expect(pm.onNavigationBar().logoutButton, { message: 'Failed to login, no Logout button found' }).toBeVisible();
  })

  test('should show navbar items and username', async ({ page }) => {
    const pm = new PageManager(page);
    await expect(pm.onNavigationBar().dashboardLink, { message: 'Dashboard link not visible after login' }).toBeVisible()
    await expect(pm.onNavigationBar().productsLink, { message: 'Products link not visible after login' }).toBeVisible()
    await expect(pm.onNavigationBar().inventoryLink, { message: 'Inventory link not visible after login' }).toBeVisible()
    await expect(pm.onNavigationBar().userName, { message: 'Logged-in username is not visible' }).toBeVisible()
  })

  test('should persist session after reload', async ({ page }) => {
    const pm = new PageManager(page);
    await page.reload()
    await expect(pm.onNavigationBar().logoutButton, { message: 'Session did not persist; Logout button not visible after reload' }).toBeVisible()
  })

  test('should logout and prevent access to dashboard', async ({ page }) => {
    const pm = new PageManager(page);
    await pm.logout()
    await expect(page, { message: 'After logout, URL did not change to /login' }).toHaveURL('/login')
    await pm.navigateTo().dashboardPage()
    await expect(page, { message: 'Unauthenticated user could access /dashboard' }).toHaveURL('/login')
  })

  test('should logout and prevent access to Products page', async ({ page }) => {
    const pm = new PageManager(page);
    await pm.logout()
    await expect(page, { message: 'After logout, URL did not change to /login' }).toHaveURL('/login')
    await pm.navigateTo().productsPage()
    await expect(page, { message: 'Unauthenticated user could access /products' }).toHaveURL('/login')
  })

  test('should logout and prevent access to Inventory page', async ({ page }) => {
    const pm = new PageManager(page);
    await pm.logout()
    await expect(page, { message: 'After logout, URL did not change to /login' }).toHaveURL('/login')
    await pm.navigateTo().inventoryPage()
    await expect(page, { message: 'Unauthenticated user could access /inventory' }).toHaveURL('/login')
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
    expect(errorMessage, 'Expected generic invalid credentials message').toBe('Invalid email or password');
  });



  test('should display error for correct email and wrong password', async ({ page }) => {
    const pm = new PageManager(page);

    await pm.onLoginPage().inputEmailAndPassword(ADMIN_EMAIL, INVALID_PASSWORD);
    await pm.onLoginPage().loginButton.click();
    const errorMessage = await pm.onLoginPage().getErrorMessage();

    expect(errorMessage, 'Missing error for wrong password with valid email').toBe('Invalid email or password');
  });

  // include browserName in the test name to help with cross-browser testing
  test('should display native HTML5 form validation for empty Email', async ({ page }) => {
    const pm = new PageManager(page);

    await pm.onLoginPage().inputEmailAndPassword('', ADMIN_PASSWORD);
    await pm.onLoginPage().loginButton.click();

    await expect(pm.onLoginPage().errorMessage, { message: 'App-level error should not appear for empty email' }).toBeHidden();

    // Cross-browser: trigger validity UI (Safari may not populate message until reportValidity())
    const validity = await pm.onLoginPage().emailInput.evaluate((el: any) => {
      const input = el as HTMLInputElement;
      input.reportValidity();
      return { valid: input.checkValidity(), message: input.validationMessage };
    });
    expect(validity.valid, 'Email input should be invalid when empty').toBe(false);
    expect((validity.message || '').trim().length, 'Expected a non-empty native validation message').toBeGreaterThan(0);
  });


  test('should display native HTML5 form validation for empty Password', async ({ page }) => {
    const pm = new PageManager(page);

    await pm.onLoginPage().inputEmailAndPassword(ADMIN_EMAIL, '');
    await pm.onLoginPage().loginButton.click();

    await expect(pm.onLoginPage().errorMessage, { message: 'App-level error should not appear for empty password' }).toBeHidden();

    const validity = await pm.onLoginPage().passwordInput.evaluate((el: any) => {
      const input = el as HTMLInputElement;
      input.reportValidity();
      return { valid: input.checkValidity(), message: input.validationMessage };
    });
    expect(validity.valid, 'Password input should be invalid when empty').toBe(false);
    expect((validity.message || '').trim().length, 'Expected a non-empty native validation message').toBeGreaterThan(0);
  });
});

test.describe('password visibility toggle', () => {
  test.use({ storageState: undefined })
  test.beforeEach(async ({ page }) => {
    const pm = new PageManager(page);
    await pm.navigateTo().loginPage();
  })

  test('should hide password by default and show when toggled', async ({ page }) => {
    const pm = new PageManager(page);

    await pm.onLoginPage().inputEmailAndPassword('user@example.com', 'Secret123!')

    const initiallyVisible = await pm.onLoginPage().isPasswordVisible()
    expect(initiallyVisible, 'Password should be hidden by default (type="password")').toBe(false)

    await pm.onLoginPage().togglePasswordVisibility()
    const afterToggleVisible = await pm.onLoginPage().isPasswordVisible()
    expect(afterToggleVisible, 'Password should become visible after toggling (type="text")').toBe(true)
  })

  test('should toggle password visibility back to hidden when clicked again', async ({ page }) => {
    const pm = new PageManager(page);

    await pm.onLoginPage().inputEmailAndPassword('user@example.com', 'Secret123!')
    await pm.onLoginPage().togglePasswordVisibility()
    expect(await pm.onLoginPage().isPasswordVisible(), 'Password should be visible after first toggle (type="text")').toBe(true)

    await pm.onLoginPage().togglePasswordVisibility()
    expect(await pm.onLoginPage().isPasswordVisible(), 'Password should be hidden after second toggle (type="password")').toBe(false)
  })
})