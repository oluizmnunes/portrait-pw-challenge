import { test as authTest, expect as baseExpect } from './auth'
import { PageManager } from '../page-objects/pageManager'

export type Product = {
  sku: string
  name: string
  description: string
  price: number
  stock: number
  category: string
  lowStockThreshold: number
}

type ProductFixtures = {
  createProduct: (overrides?: Partial<Product>) => Promise<Product>
  untrackProduct: (sku: string) => void
}

export const test = authTest.extend<ProductFixtures>(({ page }, use) => {
  const createdSkus: string[] = []

  async function createProduct(overrides?: Partial<Product>): Promise<Product> {
    const pm = new PageManager(page)
    const base = pm.onProductsPage().generateTestProduct()
    const product: Product = { ...base, ...overrides }
    await pm.onProductsPage().createProduct(product)
    createdSkus.push(product.sku)
    return product
  }

  function untrackProduct(sku: string) {
    const idx = createdSkus.indexOf(sku)
    if (idx >= 0) createdSkus.splice(idx, 1)
  }

  use({ createProduct, untrackProduct } as any)

  return async () => {
    const pm = new PageManager(page)
    for (const sku of createdSkus) {
      try {
        await pm.navigateTo().productsPage()
        await pm.onProductsPage().searchProduct(sku)
        await pm.onProductsPage().deleteFirstProduct()
      } catch {}
    }
  }
})

export const expect = baseExpect


