// playwright/tests/auth/login.spec.ts
// Migrated from: cypress/e2e/login.cy.js
//
// Key improvements over the Cypress version:
//   ✓ No hardcoded cy.wait() — all waits are condition-based
//   ✓ Credentials sourced from testData.ts — one place to update
//   ✓ Selectors live in LoginPage.ts — no duplication across specs
//   ✓ Full TypeScript — type errors caught at compile time

import { test } from '@playwright/test'
import { LoginPage } from '../../pages/LoginPage'
import { credentials, location } from '../../fixtures/testData'

test.describe('Authentication', () => {

  let loginPage: LoginPage

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page)
    await loginPage.goto()
  })

  test('should login successfully with valid credentials', async () => {
    await loginPage.login(
      credentials.admin.username,
      credentials.admin.password,
      location
    )
    await loginPage.assertLoggedIn()
  })

  test('should show error with wrong password', async () => {
    await loginPage.loginWithInvalidCredentials(
      credentials.admin.username,
      'wrongpassword'
    )
    await loginPage.assertErrorVisible('Invalid username/password')
  })

  test('should show error with wrong username', async () => {
    await loginPage.loginWithInvalidCredentials(
      'unknownuser',
      credentials.admin.password
    )
    await loginPage.assertErrorVisible()
  })

  test('should not login with blank credentials', async () => {
    // Click login without filling any fields
    await loginPage.loginWithInvalidCredentials('', '')
    await loginPage.assertOnLoginPage()
  })

})
