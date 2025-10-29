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
  readonly skuInput: Locator
  readonly nameInput: Locator
  readonly descriptionInput: Locator
  readonly priceInput: Locator
  readonly stockInput: Locator
  readonly categoryInput: Locator
  readonly thresholdInput: Locator
  readonly saveButton: Locator
  readonly productForm: Locator

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
    this.skuInput = page.getByTestId('sku-input')
    this.nameInput = page.getByTestId('name-input')
    this.descriptionInput = page.getByTestId('description-input')
    this.priceInput = page.getByTestId('price-input')
    this.stockInput = page.getByTestId('stock-input')
    this.categoryInput = page.getByTestId('category-input')
    this.thresholdInput = page.getByTestId('threshold-input')
    this.saveButton = page.getByTestId('save-button')
    this.productForm = page.getByTestId('product-form')
  }

  async createProduct(product: { sku: string; name: string; description: string; price: number; stock: number; category: string; lowStockThreshold: number }) {
    await this.page.goto('/products')
    await this.addProductButton.click()
    await this.page.waitForURL('/products/new')
    await this.skuInput.fill(product.sku)
    await this.nameInput.fill(product.name)
    await this.descriptionInput.fill(product.description)
    await this.priceInput.fill(product.price.toString())
    await this.stockInput.fill(product.stock.toString())
    await this.categoryInput.selectOption(product.category)
    await this.thresholdInput.fill(product.lowStockThreshold.toString())
    await this.saveButton.click()
    await this.page.waitForURL('/products')
  }

  async searchProduct(searchTerm: string) {
    await this.searchInput.fill(searchTerm)
  }

  async editFirstProduct(updates: { name?: string; price?: string }) {
    const editButton = this.page.locator('[data-testid^="edit-product-"]').first()
    await editButton.click()
    if (updates.name) await this.nameInput.fill(updates.name)
    if (updates.price) await this.priceInput.fill(updates.price)
    await this.saveButton.click()
    await this.page.waitForURL('/products')
  }

  async deleteFirstProduct() {
    const deleteButton = this.page.locator('[data-testid^="delete-product-"]').first()
    await deleteButton.click()
    await this.confirmDeleteButton.click()
  }

  productRowByText(text: string): Locator {
    return this.page.locator('[data-testid^="product-row-"]').filter({ hasText: text })
  }
}