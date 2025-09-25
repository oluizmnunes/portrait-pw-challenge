import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ProductsProvider } from './lib/products-context'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Inventory Management System',
  description: 'QA Automation Challenge',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ProductsProvider>{children}</ProductsProvider>
      </body>
    </html>
  )
}