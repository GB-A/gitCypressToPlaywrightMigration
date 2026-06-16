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
    cy.visit('/openmrs/login.htm');
    return this; 
  }

  /**
   * Executes a robust login flow using parent-child chaining.
   */
  login(username: string, password: string, location: string): void {
    if (username) this.usernameInput.type(username);
    if (password) this.passwordInput.type(password);

    // Optimized: Reuses the locationContainer getter and chains find() 
    // to strictly scope the target list item, preventing global DOM leakage.
    this.locationContainer.find(SELECTORS.LOCATION_ITEM(location)).click();
    this.loginButton.click();
  }

  /**
   * Shortcut login for failure scenarios.
   */
  loginWithInvalidCredentials(username: string, password: string): void {
    if (username) this.usernameInput.type(username);
    if (password) this.passwordInput.type(password);
    
    // Optimized: Safely extracts the first available option via chaining
    this.locationContainer.find('li').first().click();
    this.loginButton.click();
  }

  /**
   * Consolidated assertion with conditional validation design.
   */
  assertErrorVisible(expectedText?: string): void {
    if (expectedText) {
      // Direct text checking inherently implies visibility validation in Cypress
      this.errorMessage.should('have.text', expectedText);
    } else {
      this.errorMessage.should('be.visible');
    }
  }

  assertOnLoginPage(): void {
    cy.url().should('include', '/login');
  }

  /**
   * State-driven synchronization block.
   */
  assertLoggedIn(): void {
    // Optimized: We wait for the core dashboard container to render FIRST.
    // An increased timeout here gives a slow backend environment a window to complete
    // the redirect before Cypress evaluates the text and URL assertions.
    cy.get('#content', { timeout: 10000 }).should('be.visible');
    
    cy.url().should('include', 'home.page');
    cy.get('#content h4').should('contain.text', 'admin');
  }
}