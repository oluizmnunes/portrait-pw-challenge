'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated } from '@/app/lib/auth'
import { Product } from '@/app/lib/products'
import { useProducts } from '@/app/lib/products-context'
import Navbar from '@/app/components/navbar'

export default function InventoryPage() {
  const router = useRouter()
  const { products, adjustStock, isLoading } = useProducts()
  const [adjustModal, setAdjustModal] = useState<{ product: Product; adjustment: string } | null>(null)
  const [adjustmentError, setAdjustmentError] = useState('')

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login')
      return
    }
  }, [router])

  const handleAdjustStock = () => {
    if (!adjustModal) return

    const adjustment = parseInt(adjustModal.adjustment)
    if (isNaN(adjustment)) {
      setAdjustmentError('Please enter a valid number')
      return
    }

    if (adjustModal.product.stock + adjustment < 0) {
      setAdjustmentError('Stock cannot be negative')
      return
    }

    const result = adjustStock(adjustModal.product.id, adjustment)
    if (result) {
      setAdjustModal(null)
      setAdjustmentError('')
    }
  }

  const lowStockProducts = products.filter(p => p.stock <= p.lowStockThreshold)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-8" data-testid="inventory-title">
            Inventory Management
          </h1>

          {/* Low Stock Alert */}
          {lowStockProducts.length > 0 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6" data-testid="low-stock-alert">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong>{lowStockProducts.length} products</strong> are running low on stock
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Inventory Table */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200" data-testid="inventory-table">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} data-testid={`inventory-row-${product.id}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.stock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.stock <= product.lowStockThreshold ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800" data-testid={`low-stock-badge-${product.id}`}>
                          Low Stock
                        </span>
                      ) : product.stock <= product.lowStockThreshold * 2 ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Medium
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          In Stock
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(product.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setAdjustModal({ product, adjustment: '' })}
                        className="text-blue-600 hover:text-blue-900"
                        data-testid={`adjust-stock-${product.id}`}
                      >
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Adjust Stock Modal */}
      {adjustModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" data-testid="adjust-stock-modal">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
                Adjust Stock for {adjustModal.product.name}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500 mb-4">
                  Current Stock: <strong>{adjustModal.product.stock}</strong>
                </p>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Adjustment (use negative for decrease)
                </label>
                <input
                  type="number"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={adjustModal.adjustment}
                  onChange={(e) => setAdjustModal({ ...adjustModal, adjustment: e.target.value })}
                  placeholder="e.g., 10 or -5"
                  data-testid="adjustment-input"
                />
                {adjustmentError && (
                  <p className="text-red-500 text-xs italic mt-1" data-testid="adjustment-error">
                    {adjustmentError}
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  New Stock: <strong>
                    {adjustModal.adjustment && !isNaN(parseInt(adjustModal.adjustment))
                      ? adjustModal.product.stock + parseInt(adjustModal.adjustment)
                      : adjustModal.product.stock}
                  </strong>
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={handleAdjustStock}
                  className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 mr-3"
                  data-testid="confirm-adjust-button"
                >
                  Adjust
                </button>
                <button
                  onClick={() => {
                    setAdjustModal(null)
                    setAdjustmentError('')
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  data-testid="cancel-adjust-button"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}