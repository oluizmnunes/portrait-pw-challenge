import { Page, Locator } from '@playwright/test'
import { HelperBase } from "../page-objects/helperBase";

export class ProductsPage extends HelperBase {

  readonly productsTitle: Locator
  readonly addProductButton: Locator
  readonly searchInput: Locator
  readonly categoryFilter: Locator
  readonly sortSelect: Locator
  readonly productsTable: Locator
  readonly noProductsMessage: Locator
  readonly deleteModal: Locator
  readonly confirmDeleteButton: Locator
  readonly cancelDeleteButton: Locator
  // Form inputs used on create/edit product screens
  readonly nameInput: Locator
  readonly descriptionInput: Locator
  readonly priceInput: Locator
  readonly stockInput: Locator
  readonly categoryInput: Locator
  readonly thresholdInput: Locator
  readonly saveButton: Locator

  constructor(page: Page) {
    super(page);
    this.productsTitle = page.getByTestId('products-title')
    this.addProductButton = page.getByTestId('add-product-button')
    this.searchInput = page.getByTestId('search-input')
    this.categoryFilter = page.getByTestId('category-filter')
    this.sortSelect = page.getByTestId('sort-select')
    this.productsTable = page.getByTestId('products-table')
    this.noProductsMessage = page.getByTestId('no-products-message')
    this.deleteModal = page.getByTestId('delete-modal')
    this.confirmDeleteButton = page.getByTestId('confirm-delete-button')
    this.cancelDeleteButton = page.getByTestId('cancel-delete-button')
    // Form inputs (present on /products/new and edit pages)
    this.nameInput = page.getByTestId('name-input')
    this.descriptionInput = page.getByTestId('description-input')
    this.priceInput = page.getByTestId('price-input')
    this.stockInput = page.getByTestId('stock-input')
    this.categoryInput = page.getByTestId('category-input')
    this.thresholdInput = page.getByTestId('threshold-input')
    this.saveButton = page.getByTestId('save-button')
  }
}