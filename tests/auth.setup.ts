import { test as setup } from '@playwright/test'
import { PageManager } from '../page-objects/pageManager'

const ADMIN_EMAIL = process.env.PW_ADMIN_EMAIL || 'admin@test.com'
const ADMIN_PASSWORD = process.env.PW_ADMIN_PASSWORD || 'Admin123!'

setup('authenticate as admin and save storage state', async ({ page }) => {
  const pm = new PageManager(page)

  await page.goto('/login')
  await pm.onLoginPage().login(ADMIN_EMAIL, ADMIN_PASSWORD)

  await page.context().storageState({ path: '.auth/admin.json' })
})


