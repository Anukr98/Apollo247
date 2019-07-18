import { clientBaseUrl, clientRoutes } from 'helpers/clientRoutes';
import { apiRoutes } from 'helpers/apiRoutes';
import { getPatientsFixture } from 'cypress/fixtures/patientsFixtures';

describe('PatientsList', () => {
  const patientsListQueryResult = getPatientsFixture();

  it('Shows the PatientsList', () => {
    cy.server();
    cy.visit(`${clientBaseUrl()}${clientRoutes.patients()}`);
    cy.route('POST', apiRoutes.graphql(), patientsListQueryResult);
    cy.contains('h3', 'Patients List').should('exist');
  });

  it('Renders each patient', () => {
    cy.server();
    cy.visit(`${clientBaseUrl()}${clientRoutes.patients()}`);
    cy.route('POST', apiRoutes.graphql(), patientsListQueryResult);
    patientsListQueryResult.data.getPatients!.patients.forEach((patient) => {
      cy.contains('div', `${patient.firstName} ${patient.lastName}`);
    });
  });
  it('can bypass the captcha to successfully log in', () => {
    cy.visit('http://localhost:3000');
    // cy.get('[data-cypress*="User Circle"]');
    //   //   .click()
    //   //   .get('input[type="tel"]')
    //   //   .type('9999999999')
    //   //   .get('button[aria-label="Sign in"]')
    //   //   .click()
    //   //   .wait(1000) // because if there's no wait, it re-finds the previous type=tel
    //   // .get('[class*="loginFormWrap"]')
    //   // .find('input[type*="tel"]')
    //   // .each(($el) => {
    //   //   cy.wrap($el).type('9');
    //   // })
    //   // .get('span')
    //   //   .contains('OK')
    //   //   .click()
    //   //   .wait(3000)
    //   //   .get('p')
    //   //   .contains('Let us quickly get to know you so that we can get you the best help');
    const userCircle = cy.get('[data-cypress*="User Circle"]');
    userCircle.click(); //.wait(1000);
    const phoneInput = userCircle.get('input[type="tel"]');
    phoneInput.type('9999999999');
    const submitButton = userCircle.get('button[aria-label="Sign in"]');
    submitButton.click().wait(1000);
    const otpInput = cy.get('[class*="loginFormWrap"]').find('input[type*="tel"]');
    otpInput.each(($el) => {
      cy.wrap($el).type('9');
    });
    const otpEntry = cy.get('span').contains('OK');
    otpEntry.click().wait(3000);
    const confirmation = cy.get('p');
    confirmation.within(($p) => {
      expect($p).to.contain('Let us quickly get to know you so that we can get you the best help');
    });
  });
});
