import { defineConfig } from "cypress";

export default defineConfig({
  allowCypressEnv: false,

  e2e: {
    baseUrl: 'https://o2.openmrs.org',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: false,
    
    // Screenshot settings
    screenshotOnRunFailure: true,
    
    // Video settings
    video: true,
    videoCompression: 32,
    
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  
  // UI mode settings
  viewportWidth: 1280,
  viewportHeight: 720,
});