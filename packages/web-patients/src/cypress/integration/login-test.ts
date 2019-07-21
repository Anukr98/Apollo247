import { clientBaseUrl, clientRoutes } from 'helpers/clientRoutes';
import { apiRoutes } from 'helpers/apiRoutes';
import { getPatientsFixture } from 'cypress/fixtures/patientsFixtures';

describe('PatientsList', () => {
  it('can bypass the captcha to successfully log in', () => {
    cy.visit('http://localhost:3000'); //authprovider.tsx - 97
    cy.get('[data-cypress*="User Circle"]') //header.tsx - 109
      .click()
      .get('[data-cypress*="mobileLoginFormWrap"]') //signin.tsx - 229
      .should('be.visible')
      .get('[data-cypress="mobileNumberInput"]') //signin.tsx - 254
      .type('9999999999')
      .get('button[data-cypress="signIn"]') //signin.tsx - 286
      .click()
      .get('[data-cypress="otpInput"]') //signin.tsx - 124
      .should('be.visible')
      // .get('[class*="loginFormWrap"]') //signin.tsx - 229
      .get('[data-cypress="otpForm"]') //signIn.tsx - 125
      .should('be.visible') //signin.tsx - 133
      .find('input[type*="tel"]')
      .each(($el) => {
        cy.wrap($el).type('9');
      })
      // .get('span')
      // .contains('OK')
      .get('[data-cypress="okButton"]') //signin.tsx -177
      .click()
      .get('[data-cypress="confirmationGreeting"]') //newProfile.tsx - 196
      .should('be.visible')
      // .get('p')
      // .find('p')
      // .get('[data-cypress="confirmationGreeting]')
      .within(($p) => {
        expect($p).to.contain(
          'Let us quickly get to know you so that we can get you the best help'
        );
      });
  });
});
