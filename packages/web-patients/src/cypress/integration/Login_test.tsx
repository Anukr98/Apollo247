import { clientRoutes, clientBaseUrl } from 'helpers/clientRoutes';
import { Relation } from 'graphql/types/globalTypes';
import schema from '@aph/api-schema/schema.json';
import { jane, john } from 'cypress/fixtures/patientsFixtures';

describe('Login', () => {
  const johnMe = { ...john, relation: Relation.ME };
  const patients = [jane, johnMe];

  beforeEach(() => {
    cy.signOut();
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

  it('Can do a real login with firebase', () => {
    cy.get('[data-cypress="Navigation"]').should('not.exist');

    cy.get('[data-cypress="Header"]')
      .find('[class*="userCircle"]')
      .click();

    cy.get('input[type="tel"]')
      .type('9999999999')
      .get('button[type="submit"]')
      .click()
      .wait(5000);

    cy.get('[class*="loginFormWrap"]')
      .find('input[type*="tel"]')
      .each(($el) => cy.wrap($el).type('9'))
      .get('form')
      .find('button[type="submit"]')
      .click()
      .wait(5000);

    cy.get('[data-cypress="Navigation"]').should('exist');
  });

  it('Shows "me" selected in hello dropdown', () => {
    const me = patients.find((p) => p.relation === Relation.ME);
    cy.contains('hello');
    cy.contains(me!.firstName!.toLowerCase());
  });
});
