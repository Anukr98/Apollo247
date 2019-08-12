import '@aph/universal/dist/global';

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

let currentTestTitle = 'test';

Cypress.on('window:before:load', (win) => {
  // Note: the value of window.__TEST__ will always be the text found in the test description;
  // i.e. `it('test description')`
  win.__TEST__ = currentTestTitle;
});

Cypress.on('test:before:run', (test) => {
  currentTestTitle = test.title;
});
