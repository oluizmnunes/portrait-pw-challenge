'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useProducts } from '@/app/lib/products-context'

export default function ResetPage() {
  const router = useRouter()
  const { resetProducts } = useProducts()

  useEffect(() => {
    resetProducts()
    router.push('/products')
  }, [resetProducts, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-xl font-semibold">Resetting data...</h1>
      </div>
    </div>
  )
}