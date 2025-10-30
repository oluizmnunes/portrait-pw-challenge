import { test as base, expect as baseExpect } from '@playwright/test'
import { PageManager } from '../page-objects/pageManager'

const ADMIN_EMAIL = process.env.PW_ADMIN_EMAIL || 'admin@test.com'
const ADMIN_PASSWORD = process.env.PW_ADMIN_PASSWORD || 'Admin123!'

export const test = base.extend({
  page: async ({ page }, use) => {
    const pm = new PageManager(page)
    await page.goto('/login')
    await pm.onLoginPage().login(ADMIN_EMAIL, ADMIN_PASSWORD)
    await use(page)
  },
})

export const expect = baseExpect


