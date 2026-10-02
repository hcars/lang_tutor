import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    video: false,
    screenshotOnRunFailure: false,
    setupNodeEvents(on, config) {
      on('dev-server:start', (options) => {
        options.browser.isHeadless = true;
      });
      return config;
    },
  },
});
