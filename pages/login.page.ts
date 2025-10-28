import { Page, Locator } from '@playwright/test'

export class LoginPage {
  readonly page: Page
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly loginButton: Locator
  readonly errorMessage: Locator
  readonly passwordToggle: Locator

  constructor(page: Page) {
    this.page = page
    this.emailInput = page.getByTestId('email-input')
    this.passwordInput = page.getByTestId('password-input')
    this.loginButton = page.getByTestId('login-button')
    this.errorMessage = page.getByTestId('error-message')
    this.passwordToggle = page.getByTestId('password-toggle')
  }

  async goto() {
    await this.page.goto('/login')
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.loginButton.click()
  }

  // TODO: Candidates should implement these methods
  async isPasswordVisible(): Promise<boolean> {
    const inputType = await this.passwordInput.getAttribute('type')
    return inputType === 'text'
  }

  async togglePasswordVisibility() {
    // Implementation needed
    throw new Error('Method not implemented')
  }

  async getErrorMessage(): Promise<string> {
    // Implementation needed
    throw new Error('Method not implemented')
  }
}