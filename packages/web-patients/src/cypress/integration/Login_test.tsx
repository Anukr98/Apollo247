import { clientRoutes } from 'helpers/clientRoutes';
import { Relation } from 'graphql/types/globalTypes';
import { jane, john } from 'cypress/fixtures/patientsFixtures';

describe('Login', () => {
  const johnMe = { ...john, relation: Relation.ME };
  const patients = [jane, johnMe];

  beforeEach(() => {
    cy.signIn(patients);
    cy.visitAph(clientRoutes.welcome()).wait(500);
  });

  it('Can do a real login with firebase', () => {
    cy.get('[data-cypress="Navigation"]').should('not.exist');

    cy.get('[data-cypress="Header"]')
      .find('[class*="userCircle"]')
      .click();

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

    cy.clearFirebaseDb();
  });

  it('Shows "me" selected in hello dropdown', () => {
    const me = patients.find((p) => p.relation === Relation.ME);
    cy.contains('hello');
    cy.contains(me!.firstName!.toLowerCase());
  });
});
