import { Page, Locator } from '@playwright/test'
import { HelperBase } from './helperBase'

export class Navbar extends HelperBase {

  readonly dashboardLink: Locator
  readonly productsLink: Locator
  readonly inventoryLink: Locator
  readonly logoutButton: Locator
  readonly userName: Locator

  constructor(page: Page) {
    super(page)

    this.dashboardLink = page.getByTestId('nav-dashboard')
    this.productsLink = page.getByTestId('nav-products')
    this.inventoryLink = page.getByTestId('nav-inventory')
    this.logoutButton = page.getByTestId('logout-button')
    this.userName = page.getByTestId('user-name')
  }

  async navigateToDashboard() {
    await this.dashboardLink.click()
    await this.page.waitForURL('/dashboard')
  }

  async navigateToProducts() {
    await this.productsLink.click()
    await this.page.waitForURL('/products')
  }

  async navigateToInventory() {
    await this.inventoryLink.click()
    await this.page.waitForURL('/inventory')
  }

  async logout() {
    await this.logoutButton.click()
    await this.page.waitForURL('/login')
  }
}