import { clientRoutes } from 'helpers/clientRoutes';
import { janeNoRelation, johnBrother } from 'cypress/fixtures/patientsFixtures';
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

  it("Firebase (Captcha Disabled): Blurring a mobile input after submission doesn't cancel action", () => {
    cy.get('[data-cypress="SignIn"]')
      .find('input[type="tel"]')
      .type('9999999999');

    cy.get('button[type="submit"]')
      .click()
      .blur()
      .find('[class*="MuiCircularProgress"]')
      .should('exist');

    cy.get('[data-cypress="SignIn"]')
      .contains('Type in the OTP sent to you, to authenticate')
      .should('exist');
  });

  it("Firebase (Captcha Disabled): Blurring an incomplete mobile number beginning with 6-9 doesn't display error", () => {
    cy.get('[data-cypress="SignIn"]')
      .find('input[type="tel"]')
      .type('6')
      .blur();

    cy.get('[data-cypress="SignIn"]').should('not.contain', 'This seems like a wrong number');

    cy.get('[data-cypress="SignIn"]')
      .find('input[type="tel"]')
      .clear()
      .type('7')
      .blur();

    cy.get('[data-cypress="SignIn"]').should('not.contain', 'This seems like a wrong number');

    cy.get('[data-cypress="SignIn"]')
      .find('input[type="tel"]')
      .clear()
      .type('8')
      .blur();

    cy.get('[data-cypress="SignIn"]').should('not.contain', 'This seems like a wrong number');

    cy.get('[data-cypress="SignIn"]')
      .find('input[type="tel"]')
      .clear()
      .type('9')
      .blur();

    cy.get('[data-cypress="SignIn"]').should('not.contain', 'This seems like a wrong number');

    cy.get('[data-cypress="SignIn"]')
      .find('input[type="tel"]')
      .clear()
      .type('5')
      .blur();

    cy.get('[data-cypress="SignIn"]').should('contain', 'This seems like a wrong number');
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

  it('Error message should display immediately upon entering an invalid number starting with a digit 0-5', () => {
    for (let digit = 0; digit <= 5; digit++) {
      cy.get('[data-cypress="SignIn"]')

        .find('input[name*="mobileNumber"]')
        .clear()

        .type(String(digit));

      cy.get('div[class*="Mui-error"]').should('contain', 'This seems like a wrong number');
    }

    cy.get('[data-cypress="SignIn"]')
      .find('input[name*="mobileNumber"]')
      .clear()
      .type('6');

    cy.get('div[class*="Mui-error"]').should('not.contain', 'This seems like a wrong number');
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

  it('Submit should not be enabled until 10 digits are entered', () => {
    cy.get('[data-cypress="SignIn"]') //first
      .find('input[name*="mobileNumber"]')
      .type('9');

    cy.get('[data-cypress="SignIn"]')
      .find('button[type="submit"]')
      .should('be.disabled');

    cy.get('[data-cypress="SignIn"]') //second
      .find('input[name*="mobileNumber"]')
      .type('9');

    cy.get('[data-cypress="SignIn"]')
      .find('button[type="submit"]')
      .should('be.disabled');

    cy.get('[data-cypress="SignIn"]') //third
      .find('input[name*="mobileNumber"]')
      .type('9');

    cy.get('[data-cypress="SignIn"]')
      .find('button[type="submit"]')
      .should('be.disabled');

    cy.get('[data-cypress="SignIn"]') //fourth
      .find('input[name*="mobileNumber"]')
      .type('9');

    cy.get('[data-cypress="SignIn"]')
      .find('button[type="submit"]')
      .should('be.disabled');

    cy.get('[data-cypress="SignIn"]') //fifth
      .find('input[name*="mobileNumber"]')
      .type('9');

    cy.get('[data-cypress="SignIn"]')
      .find('button[type="submit"]')
      .should('be.disabled');

    cy.get('[data-cypress="SignIn"]') //sixth
      .find('input[name*="mobileNumber"]')
      .type('9');

    cy.get('[data-cypress="SignIn"]')
      .find('button[type="submit"]')
      .should('be.disabled');

    cy.get('[data-cypress="SignIn"]') //seventh
      .find('input[name*="mobileNumber"]')
      .type('9');

    cy.get('[data-cypress="SignIn"]')
      .find('button[type="submit"]')
      .should('be.disabled');

    cy.get('[data-cypress="SignIn"]') //eighth
      .find('input[name*="mobileNumber"]')
      .type('9');

    cy.get('[data-cypress="SignIn"]')
      .find('button[type="submit"]')
      .should('be.disabled');

    cy.get('[data-cypress="SignIn"]') //ninth
      .find('input[name*="mobileNumber"]')
      .type('9');

    cy.get('[data-cypress="SignIn"]')
      .find('button[type="submit"]')
      .should('be.disabled');

    cy.get('[data-cypress="SignIn"]') //tenth
      .find('input[name*="mobileNumber"]')
      .type('9');

    cy.get('[data-cypress="SignIn"]')
      .find('button[type="submit"]')
      .should('not.be.disabled');
  });

  it('Ten digit numbers starting with non-zero should be considered valid', () => {
    cy.get('[data-cypress="SignIn"]')
      .find('input[name*="mobileNumber"]')
      .type('9234567890');
    cy.get('[data-cypress="SignIn"]')
      .find('button[type="submit"]')
      .should('be.enabled');
    cy.contains('OTP will be sent to this number');
  });
});

describe('Login (Firebase)', () => {
  beforeEach(() => {
    const johnMe = { ...johnBrother, relation: Relation.ME };
    const patients = [janeNoRelation, johnMe];
    cy.signIn(patients);
    cy.visitAph(clientRoutes.welcome()).wait(500);
    cy.get('[data-cypress="Header"]')
      .find('[class*="userCircle"]')
      .click();
  });

  it('Firebase (Captcha Disabled): Can do a real login', () => {
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

  it('Firebase (Captcha Disabled): Resend OTP', () => {
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
      .click()
      .should('be.disabled');

    cy.get('[data-cypress="SignIn"]')
      .find('input[type*="tel"]')
      .each(($el) => cy.wrap($el).should('be.empty'));

    cy.get('[data-cypress="SignIn"]')
      .find('[class*="MuiCircularProgress"]')
      .should('not.exist');

    cy.contains('Type in the OTP that has been resent to you for authentication');
  });
});
