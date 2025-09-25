'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useProducts } from '@/app/lib/products-context'
import Navbar from '@/app/components/navbar'

export default function NewProductPage() {
  const router = useRouter()
  const { createProduct } = useProducts()
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    price: '',
    stock: '',
    category: 'Electronics' as const,
    lowStockThreshold: '5'
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.sku) newErrors.sku = 'SKU is required'
    if (!formData.name) newErrors.name = 'Name is required'
    if (!formData.price) newErrors.price = 'Price is required'
    else if (parseFloat(formData.price) <= 0) newErrors.price = 'Price must be greater than 0'
    if (!formData.stock) newErrors.stock = 'Stock is required'
    else if (parseInt(formData.stock) < 0) newErrors.stock = 'Stock cannot be negative'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    createProduct({
      sku: formData.sku,
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      category: formData.category,
      lowStockThreshold: parseInt(formData.lowStockThreshold)
    })

    router.push('/products')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900" data-testid="new-product-title">
              Add New Product
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4" data-testid="product-form">
            <div className="grid grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="sku">
                  SKU *
                </label>
                <input
                  type="text"
                  id="sku"
                  data-testid="sku-input"
                  className={`shadow appearance-none border ${errors.sku ? 'border-red-500' : ''} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                />
                {errors.sku && <p className="text-red-500 text-xs italic">{errors.sku}</p>}
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  data-testid="name-input"
                  className={`shadow appearance-none border ${errors.name ? 'border-red-500' : ''} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                {errors.name && <p className="text-red-500 text-xs italic">{errors.name}</p>}
              </div>

              <div className="mb-4 col-span-2">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  data-testid="description-input"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
                  Category *
                </label>
                <select
                  id="category"
                  data-testid="category-input"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                >
                  <option value="Electronics">Electronics</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Software">Software</option>
                  <option value="Hardware">Hardware</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price">
                  Price *
                </label>
                <input
                  type="number"
                  id="price"
                  step="0.01"
                  data-testid="price-input"
                  className={`shadow appearance-none border ${errors.price ? 'border-red-500' : ''} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
                {errors.price && <p className="text-red-500 text-xs italic">{errors.price}</p>}
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="stock">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  id="stock"
                  data-testid="stock-input"
                  className={`shadow appearance-none border ${errors.stock ? 'border-red-500' : ''} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                />
                {errors.stock && <p className="text-red-500 text-xs italic">{errors.stock}</p>}
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="lowStockThreshold">
                  Low Stock Threshold
                </label>
                <input
                  type="number"
                  id="lowStockThreshold"
                  data-testid="threshold-input"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={formData.lowStockThreshold}
                  onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between mt-6">
              <button
                type="button"
                onClick={() => router.push('/products')}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                data-testid="cancel-button"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                data-testid="save-button"
              >
                Save Product
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}