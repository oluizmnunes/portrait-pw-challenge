import { Page, Locator } from '@playwright/test'
import { HelperBase } from "../page-objects/helperBase";

export class LoginPage extends HelperBase {

  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly loginButton: Locator
  readonly errorMessage: Locator
  readonly passwordToggle: Locator

  constructor(page: Page) {
    super(page);

    this.emailInput = page.getByTestId('email-input')
    this.passwordInput = page.getByTestId('password-input')
    this.loginButton = page.getByTestId('login-button')
    this.errorMessage = page.getByTestId('error-message')
    this.passwordToggle = page.getByTestId('password-toggle')
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await Promise.all([
      this.page.waitForURL('/dashboard'),
      this.loginButton.click()
    ])
    await this.page.getByTestId('logout-button').waitFor({ state: 'visible' })
  }

  // TODO: Candidates should implement these methods
  async isPasswordVisible(): Promise<boolean> {
    const inputType = await this.passwordInput.getAttribute('type')

    return inputType === 'text'
  }

  async togglePasswordVisibility(): Promise<void> {
    await this.passwordInput.waitFor({ state: 'visible', timeout: 5000 })

    // Toggle icon is only visible when password input is NOT focused
    if (!await this.isPasswordVisible()) {
      await this.passwordInput.evaluate((element: HTMLElement) => {
        if (element instanceof HTMLElement) element.blur()
      
        return
      })
    }

    // No need to wait once click() already has its own timeout (default)
    await this.passwordToggle.click()
  }

  async getErrorMessage(): Promise<string> {
    // Some browsers (e.g., WebKit) may not make the element visible immediately
    // but text is attached quickly. First wait for attachment, then fall back to visibility.
    await this.errorMessage.waitFor({ state: 'attached' })
    let text = await this.errorMessage.textContent()
    text = (text || '').trim()
    if (text.length > 0) return text

    await this.errorMessage.waitFor({ state: 'visible' })
    const visibleText = (await this.errorMessage.textContent()) || ''
    const trimmed = visibleText.trim()
    if (!trimmed) {
      throw new Error('Error message text is empty')
    }
    return trimmed
  }

  async inputEmailAndPassword(email: string, password: string) {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
  }
}