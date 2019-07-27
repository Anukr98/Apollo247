import { clientRoutes, clientBaseUrl } from 'helpers/clientRoutes';
import { Relation } from 'graphql/types/globalTypes';
import schema from '@aph/api-schema/schema.json';
import { jane, john, jimmy } from 'cypress/fixtures/patientsFixtures';

describe('Login', () => {
  const jimmyMe = { ...jimmy, relation: Relation.ME };
  const patients = [jane, john, jimmyMe];
  //added another patient, with incomplete data

  beforeEach(() => {
    cy.signOut(); //original
    cy.server();
    cy.mockAphGraphql({ schema });
    cy.mockAphGraphqlOps({
      operations: {
        GetCurrentPatients: {
          getCurrentPatients: {
            __typename: 'GetCurrentPatientsResult',
            patients,
          },
        },
      },
    });
    cy.visitAph(clientRoutes.welcome()).wait(500);
  });

  // describe('LandingPage', () => {
  //   //works when logged out, but times out; can't work with fixture, even after AuthProvider alteration
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
