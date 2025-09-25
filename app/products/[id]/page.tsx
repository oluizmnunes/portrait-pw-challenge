'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useProducts } from '@/app/lib/products-context'
import { Product } from '@/app/lib/products'
import Navbar from '@/app/components/navbar'

export default function EditProductPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const router = useRouter()
  const { getProductById, updateProduct } = useProducts()
  const [productId, setProductId] = useState<string | null>(null)
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
  const [loading, setLoading] = useState(true)

  // Handle async params
  useEffect(() => {
    async function loadParams() {
      const resolvedParams = await Promise.resolve(params)
      setProductId(resolvedParams.id)
    }
    loadParams()
  }, [params])

  useEffect(() => {
    if (!productId) return

    const product = getProductById(productId)
    if (product) {
      setFormData({
        sku: product.sku,
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        stock: product.stock.toString(),
        category: product.category,
        lowStockThreshold: product.lowStockThreshold.toString()
      })
      setLoading(false)
    } else {
      // Product not found, redirect to products page
      router.push('/products')
    }
  }, [productId, getProductById, router])

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

    if (!validate() || !productId) return

    const updated = updateProduct(productId, {
      sku: formData.sku,
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      category: formData.category,
      lowStockThreshold: parseInt(formData.lowStockThreshold)
    })

    if (updated) {
      router.push('/products')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="text-center">Loading...</div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900" data-testid="edit-product-title">
              Edit Product
            </h1>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <form onSubmit={handleSubmit} className="p-6 space-y-6" data-testid="edit-product-form">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="sku" className="block text-sm font-medium text-gray-700">
                    SKU
                  </label>
                  <input
                    type="text"
                    id="sku"
                    name="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.sku ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    data-testid="sku-input"
                  />
                  {errors.sku && (
                    <p className="mt-1 text-sm text-red-600" data-testid="sku-error">
                      {errors.sku}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    data-testid="name-input"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600" data-testid="name-error">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    data-testid="description-input"
                  />
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                    Price
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.price ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    data-testid="price-input"
                  />
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-600" data-testid="price-error">
                      {errors.price}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
                    Stock
                  </label>
                  <input
                    type="number"
                    id="stock"
                    name="stock"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.stock ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    data-testid="stock-input"
                  />
                  {errors.stock && (
                    <p className="mt-1 text-sm text-red-600" data-testid="stock-error">
                      {errors.stock}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    data-testid="category-select"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Software">Software</option>
                    <option value="Hardware">Hardware</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="lowStockThreshold" className="block text-sm font-medium text-gray-700">
                    Low Stock Threshold
                  </label>
                  <input
                    type="number"
                    id="lowStockThreshold"
                    name="lowStockThreshold"
                    value={formData.lowStockThreshold}
                    onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    data-testid="low-stock-threshold-input"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => router.push('/products')}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  data-testid="cancel-button"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  data-testid="save-button"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}