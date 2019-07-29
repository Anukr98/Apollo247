import { clientRoutes } from 'helpers/clientRoutes';
import { jane, john } from 'cypress/fixtures/patientsFixtures';
import { Relation } from 'graphql/types/globalTypes';

describe('Login', () => {
  beforeEach(() => {
    cy.signOut();
    cy.visitAph(clientRoutes.welcome()).wait(500);
    cy.get('[data-cypress="Header"]')
      .find('[class*="userCircle"]')
      .click();
  });

  it('Prefix "+91" should be displayed before the mobile number input field', () => {
    cy.get('[data-cypress="SignIn"]').contains('+91');
  });

  it('There should be validation upon entering anything non-numerical', () => {
    cy.get('[data-cypress="SignIn"]')
      .find('input[name*="mobileNumber"]')
      .type('test');
    cy.get('input[name*="mobileNumber"]')
      .contains('test')
      .should('not.exist');
    cy.get('[data-cypress="SignIn"]')
      .find('button[type="submit"]')
      .should('be.disabled');
  });

  it('Next arrow should be disabled upon entering an invalid number', () => {
    cy.get('[data-cypress="SignIn"]')
      .find('input[name*="mobileNumber"]')
      .type('0123456789');
    cy.get('[data-cypress="SignIn"]')
      .find('button[type="submit"]')
      .should('be.disabled');
  });

  it('There should be validation upon entering mobile number starting with zero', () => {
    cy.get('[data-cypress="SignIn"]')
      .find('input[name*="mobileNumber"]')
      .type('0123456789');
    cy.get('[data-cypress="SignIn"]')
      .find('button[type="submit"]')
      .should('be.disabled');
    cy.contains('This seems like a wrong number');
  });

  it('Ten digit numbers starting with non-zero should be considered valid', () => {
    cy.get('[data-cypress="SignIn"]')
      .find('input[name*="mobileNumber"]')
      .type('934567890');
    cy.get('[data-cypress="SignIn"]')
      .find('button[type="submit"]')
      .should('be.enabled');
    cy.contains('OTP will be sent to this number');
  });
});

describe('Login (Firebase)', () => {
  beforeEach(() => {
    const johnMe = { ...john, relation: Relation.ME };
    const patients = [jane, johnMe];
    cy.signIn(patients);
    cy.visitAph(clientRoutes.welcome()).wait(500);
    cy.get('[data-cypress="Header"]')
      .find('[class*="userCircle"]')
      .click();
  });

  it('Firebase: Can do a real login', () => {
    cy.get('[data-cypress="Navigation"]').should('not.exist');

    cy.get('[data-cypress="SignIn"]')
      .find('input[type="tel"]')
      .type('9999999999')
      .get('button[type="submit"]')
      .click()
      .find('[class*="MuiCircularProgress"]')
      .should('not.exist');

    cy.get('[data-cypress="SignIn"]')
      .find('input[type*="tel"]')
      .each(($el) => cy.wrap($el).type('9'))
      .get('form')
      .find('button[type="submit"]')
      .click()
      .find('[class*="MuiCircularProgress"]')
      .should('not.exist');

    cy.get('[data-cypress="Navigation"]').should('exist');
  });

  it('Firebase: Resend OTP', () => {
    cy.get('[data-cypress="SignIn"]')
      .find('input[type="tel"]')
      .type('9999999999')
      .get('button[type="submit"]')
      .click()
      .find('[class*="MuiCircularProgress"]')
      .should('not.exist');

    cy.contains('Type in the OTP sent to you, to authenticate');

    cy.get('[data-cypress="SignIn"]')
      .find('input[type*="tel"]')
      .each(($el) => cy.wrap($el).type('9'));

    cy.get('[data-cypress="SignIn"]')
      .should('be.visible')
      .contains('button', 'Resend OTP')
      .click();

    cy.get('[data-cypress="SignIn"]')
      .find('input[type*="tel"]')
      .each(($el) => cy.wrap($el).should('be.empty'));

    cy.get('[data-cypress="SignIn"]')
      .find('[class*="MuiCircularProgress"]')
      .should('not.exist');

    cy.contains('Type in the OTP that has been resent to you for authentication');
  });
});
