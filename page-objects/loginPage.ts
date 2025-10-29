import { Page, Locator } from '@playwright/test'
import { HelperBase } from "../page-objects/helperBase";

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
    await this.errorMessage.waitFor({ state: 'visible' })
    const errorMessage = await this.errorMessage.textContent()

    if (!errorMessage || errorMessage.trim() === '') {
      throw new Error('Error message text is empty')
    }

    return errorMessage.trim()
  }
}




export class FormLayoutsPage extends HelperBase {
    //private readonly page: Page;

    /*constructor(page: Page){
        this.page = page;
    }*/

    constructor (page: Page) {
        super(page);
    }