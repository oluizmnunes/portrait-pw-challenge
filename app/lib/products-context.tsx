'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Product } from './products'

const STORAGE_KEY = 'qa_challenge_products'

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

interface ProductsContextType {
  products: Product[]
  isLoading: boolean
  getProductById: (id: string) => Product | undefined
  createProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Product
  updateProduct: (id: string, updates: Partial<Product>) => Product | null
  deleteProduct: (id: string) => boolean
  adjustStock: (id: string, quantity: number) => Product | null
  searchProducts: (query: string) => Product[]
  resetProducts: () => void
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined)

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(defaultProducts)
  const [isLoading, setIsLoading] = useState(true)

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setProducts(parsed)
      } catch (e) {
        console.error('Failed to parse stored products:', e)
      }
    }
    setIsLoading(false)
  }, [])

  // Save to localStorage whenever products change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
    }
  }, [products, isLoading])

  const getProductById = (id: string) => {
    return products.find(p => p.id === id)
  }

  const createProduct = (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setProducts(prev => [...prev, newProduct])
    return newProduct
  }

  const updateProduct = (id: string, updates: Partial<Product>) => {
    let updatedProduct: Product | null = null
    setProducts(prev => {
      const index = prev.findIndex(p => p.id === id)
      if (index === -1) return prev

      const updated = [...prev]
      updated[index] = {
        ...updated[index],
        ...updates,
        id: updated[index].id,
        updatedAt: new Date().toISOString()
      }
      updatedProduct = updated[index]
      return updated
    })
    return updatedProduct
  }

  const deleteProduct = (id: string) => {
    let deleted = false
    setProducts(prev => {
      const index = prev.findIndex(p => p.id === id)
      if (index === -1) return prev
      deleted = true
      return prev.filter(p => p.id !== id)
    })
    return deleted
  }

  const adjustStock = (id: string, quantity: number) => {
    let adjustedProduct: Product | null = null
    setProducts(prev => {
      const index = prev.findIndex(p => p.id === id)
      if (index === -1) return prev

      const newStock = prev[index].stock + quantity
      if (newStock < 0) return prev

      const updated = [...prev]
      updated[index] = {
        ...updated[index],
        stock: newStock,
        updatedAt: new Date().toISOString()
      }
      adjustedProduct = updated[index]
      return updated
    })
    return adjustedProduct
  }

  const searchProducts = (query: string) => {
    const lowercaseQuery = query.toLowerCase()
    return products.filter(p =>
      p.name.toLowerCase().includes(lowercaseQuery) ||
      p.sku.toLowerCase().includes(lowercaseQuery) ||
      p.description.toLowerCase().includes(lowercaseQuery)
    )
  }

  const resetProducts = () => {
    setProducts([...defaultProducts])
  }

  return (
    <ProductsContext.Provider
      value={{
        products,
        isLoading,
        getProductById,
        createProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
        searchProducts,
        resetProducts
      }}
    >
      {children}
    </ProductsContext.Provider>
  )
}

export function useProducts() {
  const context = useContext(ProductsContext)
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductsProvider')
  }
  return context
}