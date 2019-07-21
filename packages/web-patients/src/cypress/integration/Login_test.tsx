import { clientRoutes, clientBaseUrl } from 'helpers/clientRoutes';

describe('Login', () => {
  it('Can bypass the captcha to successfully log in', () => {
    cy.signOut();
    cy.visit(`${clientBaseUrl()}${clientRoutes.welcome()}`)
      .get('[data-cypress*="User Circle"]')
      .click()
      .get('input[type="tel"]')
      .type('9999999999')
      .get('button[type="submit"]')
      .click()
      .wait(7000)
      .get('[class*="loginFormWrap"]')
      .find('input[type*="tel"]')
      .each(($el) => cy.wrap($el).type('9'))
      .get('form')
      .find('button[type*="submit"]')
      .click()
      .wait(7000);
  });
});
