import { Page, Locator } from '@playwright/test'
import { HelperBase } from "../page-objects/helperBase";

export class InventoryPage extends HelperBase {

  // Table rows
  readonly inventoryRows: Locator

  // Modal and controls
  readonly adjustStockModal: Locator
  readonly adjustmentInput: Locator
  readonly adjustmentError: Locator
  readonly confirmAdjustButton: Locator
  readonly cancelAdjustButton: Locator
  // Alerts/indicators
  readonly lowStockAlert: Locator

  constructor(page: Page) {
    super(page);
    this.inventoryRows = page.locator('[data-testid^="inventory-row-"]')
    this.adjustStockModal = page.getByTestId('adjust-stock-modal')
    this.adjustmentInput = page.getByTestId('adjustment-input')
    this.adjustmentError = page.getByTestId('adjustment-error')
    this.confirmAdjustButton = page.getByTestId('confirm-adjust-button')
    this.cancelAdjustButton = page.getByTestId('cancel-adjust-button')
    this.lowStockAlert = page.getByTestId('low-stock-alert')
  }

  getProductRowByText(text: string): Locator {
    return this.inventoryRows.filter({ hasText: text })
  }
}