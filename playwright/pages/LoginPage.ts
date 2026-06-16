/**
 * @fileoverview LoginPage Page Object Model for OpenMRS login functionality.
 * 
 * Implements the Page Object Model pattern to centralize all login-related selectors
 * and actions. This eliminates selector duplication across multiple test files and
 * simplifies maintenance — a single selector change only requires updating this file.
 * 
 * @see https://playwright.dev/docs/pom
 */

import { type Page, type Locator, expect } from '@playwright/test';
// Centralized Selector Dictionary (Using anonymous functions for dynamic strings)
const SELECTORS = {
  USERNAME_LABEL: 'Username',
  PASSWORD_LABEL: 'Password',
  LOGIN_BUTTON_VALUE: 'Log In',
  ERROR_MESSAGE_ID: '#error-message',
  LOCATION_CONTAINER_ID: '#sessionLocation',
  // Anonymous arrow function handles the dynamic runtime variable
  LOCATION_ITEM: (locationName: string) => `li[id="${locationName}"]`,
} as const;

/**
 * LoginPage class - Page Object Model for OpenMRS login interactions.
 * 
 * Encapsulates all selectors and methods related to the login page,
 * providing a clean interface for test files to interact with login functionality.
 * This prevents selector duplication and centralizes maintenance.
 * 
 * @class
 * @example
 * const loginPage = new LoginPage(page);
 * await loginPage.goto();
 * await loginPage.login('admin', 'Admin123', 'Inpatient Ward');
 */
export class LoginPage {
  /** The Playwright Page instance used for interactions */
  private readonly page: Page

  // Locators defined once — no duplication across test files
  private readonly usernameInput: Locator
  private readonly passwordInput: Locator
  private readonly loginButton: Locator
  private readonly errorMessage: Locator
  private readonly locationContainer: Locator;

  /**
   * Initializes LoginPage with page instance and defines all necessary locators.
   * Locators are defined once to prevent duplication across test files.
   * 
   * @param {Page} page - The Playwright Page instance
   */
  constructor(page: Page) {
    this.page = page
    this.usernameInput  = page.getByLabel(SELECTORS.USERNAME_LABEL)
    this.passwordInput  = page.getByLabel(SELECTORS.PASSWORD_LABEL)
    this.loginButton    = page.getByRole('button', {name:SELECTORS.LOGIN_BUTTON_VALUE})
    this.errorMessage   = page.locator(SELECTORS.ERROR_MESSAGE_ID)
    this.locationContainer = page.locator(SELECTORS.LOCATION_CONTAINER_ID);
  }

  /**
   * Navigates to the OpenMRS login page.
   * 
   * @returns {Promise<void>}
   */
  async goto(): Promise<void> {
    await this.page.goto('/openmrs/login.htm')
  }

  /**
   * Logs in with valid credentials and location selection.
   * 
   * Fills username and password fields, selects the specified location from the
   * dropdown, clicks the login button, and waits for successful navigation to the home page.
   * Uses URL change for intelligent wait instead of hardcoded delays.
   * 
   * @param {string} username - The username to login with
   * @param {string} password - The password to login with
   * @param {string} location - The location name to select (must match the <li> id in #sessionLocation)
   * @returns {Promise<void>}
   * @example
   * await loginPage.login('admin', 'Admin123', 'Inpatient Ward');
   */
  async login(username: string, password: string, location: string): Promise<void> {
    await this.usernameInput.fill(username)
    await this.passwordInput.fill(password)

    // Location must be selected before clicking the login button.
    // Each <li> in #sessionLocation has id matching the location name exactly.
    const targetedLocationSelector = SELECTORS.LOCATION_ITEM(location);
    await this.locationContainer.locator(targetedLocationSelector).click();
    await this.loginButton.click()

    // Smart wait — waits for URL change, not a hardcoded ms delay
    await this.page.waitForURL(/home/)
  }

  /**
   * Attempts login with invalid credentials to test error handling.
   * 
   * Fills username and password, selects the first available location,
   * and clicks the login button. Used to verify error message display
   * without waiting for successful navigation.
   * 
   * @param {string} username - The username to attempt login with
   * @param {string} password - The password to attempt login with
   * @returns {Promise<void>}
   */
  async loginWithInvalidCredentials(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username)
    await this.passwordInput.fill(password)
    // Select location so the login attempt actually fires
    await this.page.locator('#sessionLocation li').first().click()
    await this.loginButton.click()
  }

  /**
   * Asserts that an error message is visible on the login page.
   * 
   * Optionally verifies the error message contains specific text.
   * 
   * @param {string} [expectedText] - Optional text to verify in the error message
   * @returns {Promise<void>}
   * @example
   * await loginPage.assertErrorVisible('Invalid credentials');
   */
  async assertErrorVisible(expectedText?: string): Promise<void> {
    await expect(this.errorMessage).toBeVisible()
    if (expectedText) {
      await expect(this.errorMessage).toContainText(expectedText)
    }
  }

  /**
   * Asserts that the current page is the OpenMRS login page.
   * 
   * Verifies the URL contains 'login' to confirm we are on the login page.
   * 
   * @returns {Promise<void>}
   */
  async assertOnLoginPage(): Promise<void> {
    await expect(this.page).toHaveURL(/login/)
  }

  /**
   * Asserts that the user is successfully logged in.
   * 
   * Verifies that the URL contains 'home' and that the page displays
   * the logged-in user's name ('admin' in this case).
   * 
   * @returns {Promise<void>}
   */
  async assertLoggedIn(): Promise<void> {
    await expect(this.page).toHaveURL(/home/)
    await expect(this.page.locator('#content h4')).toContainText('admin')
  }
}
