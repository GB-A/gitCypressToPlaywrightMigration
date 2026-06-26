// playwright/tests/patient/search.spec.ts
import { test } from '@playwright/test'
import { PatientPage } from '../../pages/PatientPage'

test.describe('Patient Search', () => {

  test.beforeEach(async ({ page }) => {
    // Page is already authenticated via storage state from playwright.config.ts
    // Just navigate to the search page
    const patientPage = new PatientPage(page)
    await patientPage.gotoSearch()
  })

  test('should find an existing patient by name', async ({ page }) => {
    const patientPage = new PatientPage(page)
    await patientPage.searchPatient('John', 27)
  })

  test('should show no results for unknown patient', async ({ page }) => {
    const patientPage = new PatientPage(page)
    await patientPage.searchPatient('ZZZNOMATCH99999', 0)
  })

  test('should navigate to patient dashboard on result click', async ({ page }) => {
    const patientPage = new PatientPage(page)
    await patientPage.searchPatient('Maria', 2)
    await patientPage.clickFirstResult()
    await patientPage.assertOnPatientDashboard()
  })

})