import { NextResponse } from 'next/server'

export async function POST() {
  // This endpoint is for test automation
  // Tests should call this endpoint and then clear localStorage on the client side
  // Example in Playwright:
  // await page.request.post('/api/reset')
  // await page.evaluate(() => localStorage.clear())
  // await page.reload()

  return NextResponse.json({
    message: 'Data reset endpoint called - clear localStorage on client to reset',
    instructions: 'Run localStorage.clear() in browser console or test automation'
  })
}