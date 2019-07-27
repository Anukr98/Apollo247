import { clientRoutes } from 'helpers/clientRoutes';
import { Relation } from 'graphql/types/globalTypes';
import { jane, john, jimmy } from 'cypress/fixtures/patientsFixtures';

describe('Login', () => {
  const jimmyMe = { ...jimmy, relation: Relation.ME };
  const patients = [jane, john, jimmyMe];

  beforeEach(() => {
    cy.signIn(patients);
    cy.visitAph(clientRoutes.welcome());
  });

  // describe('LandingPage', () => {
  //   it('Shows mobile number input', () => {
  //     cy.visit('http://localhost:3000');
  //     cy.get('[data-cypress="ConsultButton"]')
  //       .click()
  //       .wait(500);
  //     cy.get('[data-cypress="phoneSignIn"]').should('be.visible');
  //   });
  // });

  it('Wont allow improper dates in date field', () => {
    cy.get('[data-cypress="loginFollowUpForm"]')
      .find('input[name="dateOfBirth"]')
      .type('test');

    cy.get('[data-cypress="submit"]')
      .click()
      .wait(500);

    expect('[data-cypress="birthValidation"]').to.exist;
  });
});
