/**
 * @fileoverview Page Object Model for patient registration and search flows
 * in the OpenMRS web application.
 *
 * This module centralizes selectors and interactions for patient-related
 * functionality (registration and search). Keeping locators at the class
 * level improves maintainability, reduces duplication across tests, and
 * makes it easier to apply automated linting rules for Playwright.
 */

import { type Page, type Locator, expect } from '@playwright/test'
const SELECTORS = {
  GIVEN_NAME: 'Given (required)',
  FAMILY_NAME:'Family Name (required)',
  NEXT_BUTTON:'#next-button',
  PASSWORD_LABEL: 'Password',
  LOGIN_BUTTON_VALUE: 'Log In',
  ERROR_MESSAGE_ID: '#error-message',
  LOCATION_CONTAINER_ID: '#sessionLocation',
  // Anonymous arrow function handles the dynamic runtime variable
  LOCATION_ITEM: (locationName: string) => `li[id="${locationName}"]`,
} as const;

export interface PatientDetails {
  givenName: string
  familyName: string
  gender: string
  birthdateDay: string
  birthdateMonth: string
  birthdateYear: string
  address: string
  city: string
  country: string
  phone: string
}

/**
 * Data object representing all fields required to register a patient.
 * Use test fixtures to provide a `PatientDetails` instance to the
 * registration helpers below.
 */

/**
 * `PatientPage` encapsulates page-level actions and locators for patient
 * registration and search. Tests should call the high-level methods on this
 * class (e.g. `registerPatient`, `searchPatient`) rather than interacting
 * with locators directly.
 *
 * All locators are defined as `private readonly` fields in the constructor so
 * they are created once per test and reused across methods. Dynamic locators
 * can be exposed via small factory methods when necessary.
 */
export class PatientPage {
  /* eslint-disable playwright/no-raw-locators -- selectors required: legacy markup lacks accessible attributes */
  private readonly page: Page

  private readonly givenName: Locator
  private readonly familyName: Locator
  private readonly searchField: Locator
  private readonly searchResults: Locator
  private readonly demographics: Locator
  private readonly identifiers: Locator
  private readonly nextButton: Locator
  private readonly submitButton: Locator
  private readonly tableInfo: Locator
  private readonly genderField: Locator
  private readonly birthdateDayField: Locator
  private readonly birthdateMonth: Locator
  private readonly birthdateMonthField: Locator
  private readonly birthdateYearField: Locator
  private readonly address1Field: Locator
  private readonly cityVillageField: Locator
  private readonly countryField: Locator
  private readonly phoneInput: Locator

  constructor(page: Page) {
    /**
     * Initializes the `PatientPage` with a Playwright `Page` and defines
     * all locators used by the helper methods.
     *
     * @param {Page} page - Playwright `Page` instance provided by the test
     */
    this.page        = page
    this.givenName= page.getByRole('textbox',{name:SELECTORS.GIVEN_NAME})
    this.familyName= page.getByRole('textbox',{name:SELECTORS.FAMILY_NAME})
    this.nextButton   = page.locator(SELECTORS.NEXT_BUTTON)
    this.searchField  = page.locator('#patient-search')
    this.searchResults = page.locator('#patient-search-results td')
    this.emptyResult  = page.locator('.empty-search-result')
    this.demographics = page.locator('.demographics')
    this.identifiers  = page.locator('.identifiers')

    this.submitButton = page.locator('#submit')
    this.fieldError   = page.locator('.field-error')
    this.tableInfo    = page.locator('#patient-search-results-table_info')
    this.genderField = page.locator('#gender-field')
    this.birthdateDayField = page.locator('#birthdateDay-field')
    this.birthdateMonth = page.locator('#birthdateMonth')
    this.birthdateMonthField = page.locator('#birthdateMonth-field')
    this.birthdateYearField = page.locator('#birthdateYear-field')
    this.address1Field = page.locator('#address1')
    this.cityVillageField = page.locator('#cityVillage')
    this.countryField = page.locator('#country')
    this.phoneInput = page.locator('input[name="phoneNumber"]')
  }

  // --- Registration ---

  async gotoRegistration(): Promise<void> {
    /**
     * Navigate to the patient registration page.
     *
     * @returns {Promise<void>}
     */
    await this.page.goto(
      '/openmrs/registrationapp/registerPatient.page?appId=referenceapplication.registrationapp.registerPatient'
    )
  }

  /**
   * Fill the personal details section of the patient registration form.
   * This includes given/family name, gender selection, and birthdate fields.
   *
   * @param {PatientDetails} patient - Object containing patient personal data
   * @returns {Promise<void>}
   */
  async fillPersonalDetails(patient: PatientDetails): Promise<void> {
    await this.givenName.fill(patient.givenName)
    await this.familyName.fill(patient.familyName)
    await this.clickNext()
    await this.selectGender(patient.gender)
    await this.clickNext()
    await this.birthdateDayField.fill(patient.birthdateDay)

    await this.birthdateMonth.click()
    await this.birthdateMonthField.selectOption({ label: patient.birthdateMonth })
    await this.birthdateYearField.fill(patient.birthdateYear)
    await this.clickNext()
  }


  /**
   * Fill the address section of the registration form.
   *
   * @param {PatientDetails} patient - Patient address information
   * @returns {Promise<void>}
   */
  async fillAddress(patient: PatientDetails): Promise<void> {
    await this.address1Field.fill(patient.address)
    await this.cityVillageField.fill(patient.city)
    await this.countryField.fill(patient.country)
    await this.clickNext()
  }

  /**
   * Fill contact information and submit the registration form.
   *
   * @param {PatientDetails} patient - Patient contact data (phone, etc.)
   * @returns {Promise<void>}
   */
  async fillContactInfo(patient: PatientDetails): Promise<void> {
    await this.phoneInput.fill(patient.phone)
    await this.clickNext()
    // Patient relatives info is only optional so skipping that intentionally and clicking next
    await this.clickNext()
    await this.submitButton.click()
  }

  /**
   * High-level helper that completes the full registration flow using the
   * other helpers. After submission this waits for the dashboard to appear.
   *
   * @param {PatientDetails} patient - Full patient data used for registration
   * @returns {Promise<void>}
   */
  async registerPatient(patient: PatientDetails): Promise<void> {
    await this.fillPersonalDetails(patient)
    await this.fillAddress(patient)
    await this.fillContactInfo(patient)
    // Smart wait for redirect to patient dashboard
    await this.demographics.waitFor({ state: 'visible' })
  }

  /**
   * Assert the registration flow completed and the patient dashboard is visible.
   *
   * @returns {Promise<void>}
   */
  async assertRegistrationSuccess(): Promise<void> {
    await expect(this.demographics).toBeVisible()
    await expect(this.identifiers).not.toBeEmpty()
  }

  /**
   * Assert that a validation error is shown on the given-name input.
   *
   * @returns {Promise<void>}
   */
  async assertValidationError(): Promise<void> {
    const givenNameError = this.givenName.locator('..').locator('.field-error')
    await expect(givenNameError).toBeVisible()
  }

  // --- Search ---

  /**
   * Navigate to the patient search page.
   *
   * @returns {Promise<void>}
   */
  async gotoSearch(): Promise<void> {
    await this.page.goto(
      '/openmrs/coreapps/findpatient/findPatient.page?app=coreapps.findPatient'
    )
  }

  /**
   * Perform a search for a patient name and assert expected entry counts.
   * The app listens for keyboard events; `pressSequentially` simulates typing
   * with delays to trigger the search filter logic.
   *
   * @param {string} name - Patient name to search for
   * @param {number} expectedEntries - Expected number of results
   * @returns {Promise<void>}
   */
  async searchPatient(name: string, expectedEntries: number): Promise<void> {
  // press sequentially or use dispatch event keyup 
  // the application was listening specifically for keyboard-related events (like keyup or keydown) 
  // to trigger the search filtering logic, which a standard fill() often bypasses.
    await this.searchField.clear()
    await this.searchField.pressSequentially(name, { delay: 50 })
    //await this.searchField.dispatchEvent('keyup');
    if (expectedEntries == 0) {
      await expect(this.page.locator('.dataTables_empty')).toContainText('No matching records found')
    }
    else if (expectedEntries < 15) {
      await expect(this.tableInfo).toContainText(`Showing 1 to ${expectedEntries} of ${expectedEntries} entries`);
    }
    else {
      await expect(this.tableInfo).toContainText(`Showing 1 to 15 of ${expectedEntries} entries`);
    }
  
  }

  /**
   * Click the first search result and wait for the patient dashboard to load.
   *
   * @returns {Promise<void>}
   */
  async clickFirstResult(): Promise<void> {
    await this.searchResults.first().click()
    await this.demographics.waitFor({ state: 'visible' })
  }

  /**
   * Assert that the current page is the patient dashboard.
   *
   * @returns {Promise<void>}
   */
  async assertOnPatientDashboard(): Promise<void> {
    await expect(this.page).toHaveURL(/patient.page/)
    await expect(this.demographics).toBeVisible()
  }

  /**
   * Click the next button in the registration flow.
   *
   * @returns {Promise<void>}
   */
  async clickNext(): Promise<void> {
    await this.nextButton.click()
  }

  /**
   * Select gender option from the custom gender control.
   *
   * @param {string} gender - 'Male' or any other value treated as Female
   * @returns {Promise<void>}
   */
  async selectGender(gender: string): Promise<void> {
    await this.genderField.click()
    await this.genderField.selectOption(gender === 'Male' ? 'M' : 'F')
  }
}
/* eslint-enable playwright/no-raw-locators */
