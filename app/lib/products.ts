export interface Product {
  id: string
  sku: string
  name: string
  description: string
  price: number
  stock: number
  category: 'Electronics' | 'Accessories' | 'Software' | 'Hardware'
  lowStockThreshold: number
  imageUrl?: string
  createdAt: string
  updatedAt: string
}

// Default products
const defaultProducts: Product[] = [
  {
    id: '1',
    sku: 'LAP-001',
    name: 'Laptop Pro 15"',
    description: 'High-performance laptop with 16GB RAM and 512GB SSD',
    price: 1299.99,
    stock: 15,
    category: 'Electronics',
    lowStockThreshold: 5,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15'
  },
  {
    id: '2',
    sku: 'MOU-002',
    name: 'Wireless Mouse',
    description: 'Ergonomic wireless mouse with precision tracking',
    price: 29.99,
    stock: 45,
    category: 'Accessories',
    lowStockThreshold: 10,
    createdAt: '2024-01-16',
    updatedAt: '2024-01-16'
  },
  {
    id: '3',
    sku: 'KEY-003',
    name: 'Mechanical Keyboard',
    description: 'RGB backlit mechanical keyboard with blue switches',
    price: 89.99,
    stock: 3,
    category: 'Accessories',
    lowStockThreshold: 5,
    createdAt: '2024-01-17',
    updatedAt: '2024-01-17'
  },
  {
    id: '4',
    sku: 'MON-004',
    name: '27" 4K Monitor',
    description: 'Ultra HD monitor with HDR support',
    price: 449.99,
    stock: 8,
    category: 'Electronics',
    lowStockThreshold: 3,
    createdAt: '2024-01-18',
    updatedAt: '2024-01-18'
  },
  {
    id: '5',
    sku: 'CAB-005',
    name: 'USB-C Cable',
    description: 'High-speed USB-C to USB-C cable, 2m',
    price: 19.99,
    stock: 2,
    category: 'Accessories',
    lowStockThreshold: 10,
    createdAt: '2024-01-19',
    updatedAt: '2024-01-19'
  }
]

// Storage key for localStorage
const STORAGE_KEY = 'qa_challenge_products'

// Load products from localStorage or use defaults
const loadProducts = (): Product[] => {
  if (typeof window === 'undefined') {
    return [...defaultProducts]
  }

  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch (e) {
      console.error('Failed to parse stored products:', e)
    }
  }
  return [...defaultProducts]
}

// Save products to localStorage
const saveProducts = (products: Product[]): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
  }
}

// Initialize with default products (will be synced on client)
let products: Product[] = [...defaultProducts]

// Sync with localStorage on client side
export const initializeProducts = (): void => {
  if (typeof window !== 'undefined') {
    products = loadProducts()
  }
}

export const getProducts = (): Product[] => {
  return [...products]
}

export const getProductById = (id: string): Product | undefined => {
  return products.find(p => p.id === id)
}

export const createProduct = (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product => {
  const newProduct: Product = {
    ...product,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  products.push(newProduct)
  saveProducts(products)
  return newProduct
}

export const updateProduct = (id: string, updates: Partial<Product>): Product | null => {
  const index = products.findIndex(p => p.id === id)
  if (index === -1) return null

  products[index] = {
    ...products[index],
    ...updates,
    id: products[index].id,
    updatedAt: new Date().toISOString()
  }
  saveProducts(products)
  return products[index]
}

export const deleteProduct = (id: string): boolean => {
  const index = products.findIndex(p => p.id === id)
  if (index === -1) return false

  products.splice(index, 1)
  saveProducts(products)
  return true
}

export const adjustStock = (id: string, quantity: number): Product | null => {
  const product = products.find(p => p.id === id)
  if (!product) return null

  const newStock = product.stock + quantity
  if (newStock < 0) return null

  product.stock = newStock
  product.updatedAt = new Date().toISOString()
  saveProducts(products)
  return product
}

export const searchProducts = (query: string): Product[] => {
  const lowercaseQuery = query.toLowerCase()
  return products.filter(p =>
    p.name.toLowerCase().includes(lowercaseQuery) ||
    p.sku.toLowerCase().includes(lowercaseQuery) ||
    p.description.toLowerCase().includes(lowercaseQuery)
  )
}

export const resetProducts = (): void => {
  products = [...defaultProducts]
  saveProducts(products)
}