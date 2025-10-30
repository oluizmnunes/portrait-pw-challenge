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
  createdSkus: string[]
  createProduct: (overrides?: Partial<Product>) => Promise<Product>
  untrackProduct: (sku: string) => void
  productCleanup: void
}

export const test = authTest.extend<ProductFixtures>({
  createdSkus: async ({}, use) => {
    const skus: string[] = []
    await use(skus)
  },

  createProduct: async ({ page, createdSkus }, use) => {
    const pm = new PageManager(page)
    const fn = async (overrides?: Partial<Product>): Promise<Product> => {
      const base = pm.onProductsPage().generateTestProduct()
      const product: Product = { ...base, ...overrides }
      await pm.onProductsPage().createProduct(product)
      createdSkus.push(product.sku)
      return product
    }
    await use(fn)
  },

  untrackProduct: async ({ createdSkus }, use) => {
    const fn = (sku: string) => {
      const idx = createdSkus.indexOf(sku)
      if (idx >= 0) createdSkus.splice(idx, 1)
    }
    await use(fn)
  },

  productCleanup: async ({ page, createdSkus }, use) => {
    await use(undefined as unknown as void)
    const pm = new PageManager(page)
    for (const sku of createdSkus) {
      try {
        await pm.navigateTo().productsPage()
        await pm.onProductsPage().searchProduct(sku)
        await pm.onProductsPage().deleteFirstProduct()
      } catch {}
    }
  },
})

export const expect = baseExpect