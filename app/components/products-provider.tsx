'use client'

import { useEffect } from 'react'
import { initializeProducts } from '@/app/lib/products'

export default function ProductsProvider({
  children
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    initializeProducts()
  }, [])

  return <>{children}</>
}