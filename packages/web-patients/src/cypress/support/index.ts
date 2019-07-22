// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Using import here no longer works. for reasons unkown
require('./commands');

// Cypress will not intercept `fetch` calls (only xhrs)
// Nullify `window.fetch` to trick it into using a polyfill (which will fallback to xhrs)
// And use `Cypress` instead of `cy` so that this persists across all tests
// More info: https://github.com/cypress-io/cypress/issues/95
interface Win extends Window {
  __TEST__: boolean;
}
Cypress.on('window:before:load', (win: Win) => {
  win.fetch = null as any;
  win.__TEST__ = true;
});
