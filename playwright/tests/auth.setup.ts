/**
 * @fileoverview Authentication setup for Playwright tests.
 * 
 * Runs once before all tests to authenticate and save the browser session state.
 * Other tests will reuse this authenticated state, eliminating redundant login calls.
 * 
 * Storage state includes cookies, localStorage, sessionStorage — everything needed
 * to maintain an authenticated session.
 * 
 * This runs as a separate setup project in playwright.config.ts
 * @see https://playwright.dev/docs/auth
 */

import { test as setup } from '@playwright/test'
import { LoginPage } from '../pages/LoginPage'
import { credentials, location } from '../fixtures/testData'

// Path where authenticated session will be saved for reuse across tests
const authFile = 'playwright/.auth/user.json'

setup('authenticate user', async ({ page }) => {
  // Navigate to login and authenticate
  const loginPage = new LoginPage(page)
  
  await loginPage.goto()
  await loginPage.login(
    credentials.admin.username,
    credentials.admin.password,
    location
  )
  
  // Verify successful login
  await loginPage.assertLoggedIn()

  // Save authenticated browser state to file
  // This state includes cookies, localStorage, sessionStorage
  await page.context().storageState({ path: authFile })
})
