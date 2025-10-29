import { Page, Locator } from '@playwright/test'
import { HelperBase } from './helperBase'

export class DashboardPage extends HelperBase {
  readonly dashboardTitle: Locator

  constructor(page: Page) {
    super(page)
    this.dashboardTitle = page.getByTestId('dashboard-title')
  }
}

