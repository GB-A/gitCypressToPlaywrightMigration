/// <reference types="cypress" />

const SELECTORS = {
  USERNAME_FIELD: '#username',
  PASSWORD_FIELD: '#password',
  LOGIN_BUTTON: '#loginButton',
  ERROR_MESSAGE: '#error-message',
  LOCATION_CONTAINER: '#sessionLocation',
  LOCATION_ITEM: (locationName: string) => `li[id="${locationName}"]`,
} as const;

export class LoginPage {
  
  // Element Getters: Provides a clean interface for elements within the DOM
  private get usernameInput() { return cy.get(SELECTORS.USERNAME_FIELD); }
  private get passwordInput() { return cy.get(SELECTORS.PASSWORD_FIELD); }
  private get loginButton() { return cy.get(SELECTORS.LOGIN_BUTTON); }
  private get errorMessage() { return cy.get(SELECTORS.ERROR_MESSAGE); }
  private get locationContainer() { return cy.get(SELECTORS.LOCATION_CONTAINER); }

  /**
   * Navigates to the login page using the configured baseUrl.
   */
  goto(): this {
    // Use waitForPageLoad: false and wait for a specific element instead
    // This avoids timeout issues with OpenMRS page load events
    cy.visit('/openmrs/login.htm', { waitForPageLoad: false });
    cy.get(SELECTORS.USERNAME_FIELD, { timeout: 30000 }).should('exist');
    return this; 
  }

  /**
   * Executes a robust login flow using request interception.
   * Intercepts the login POST request and avoids page load event waiting.
   */
  login(username: string, password: string, location: string): void {
    // Set up interception BEFORE clicking the button
    cy.intercept('POST', '**/openmrs/login.htm').as('loginRequest');
    
    if (username) this.usernameInput.type(username);
    if (password) this.passwordInput.type(password);

    // Select location
    this.locationContainer.find(SELECTORS.LOCATION_ITEM(location)).click();
    
    // Click button without waiting for page load event, then wait for request
    this.loginButton.click({ force: true, waitForAnimations: true });
    
    // Wait for the login POST request to complete
    cy.wait('@loginRequest', { timeout: 30000 }).then((interception) => {
      // After request completes, wait a bit for redirect
      cy.wait(500);
    });
    
    // Verify redirect to home page
    cy.url({ timeout: 30000 }).should('include', 'home.page');
  }

  /**
   * Shortcut login for failure scenarios.
   * Does not wait for navigation since invalid login stays on the same page.
   */
  loginWithInvalidCredentials(username: string, password: string): void {
    if (username) this.usernameInput.type(username);
    if (password) this.passwordInput.type(password);
    
    // Optimized: Safely extracts the first available option via chaining
    this.locationContainer.find('li').first().click();
    this.loginButton.click();
    
    // Wait for error message to appear - don't wait for page load
    cy.wait(500);
  }

  /**
   * Consolidated assertion with conditional validation design.
   */
  assertErrorVisible(expectedText?: string): void {
    // Wait a moment for error message to appear
    cy.wait(500);
    
    if (expectedText) {
      // Direct text checking inherently implies visibility validation in Cypress
      cy.get(SELECTORS.ERROR_MESSAGE, { timeout: 10000 }).should('have.text', expectedText);
    } else {
      cy.get(SELECTORS.ERROR_MESSAGE, { timeout: 10000 }).should('be.visible');
    }
  }

  assertOnLoginPage(): void {
    cy.url({ timeout: 10000 }).should('include', '/login');
  }

  /**
   * State-driven synchronization block.
   * Waits for dashboard content instead of relying on page load events.
   */
  assertLoggedIn(): void {
    // Wait for the URL to change to home page
    cy.url({ timeout: 30000 }).should('include', 'home.page');
    
    // Wait for dashboard content to be visible
    cy.get('#content h4', { timeout: 10000 }).should('contain.text', 'admin');
  }
}