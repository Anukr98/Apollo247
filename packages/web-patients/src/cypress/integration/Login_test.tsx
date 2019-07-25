import { clientRoutes, clientBaseUrl } from 'helpers/clientRoutes';
import { getCurrentPatientsFixture } from 'cypress/fixtures/patientsFixtures';
import { apiRoutes } from '@aph/universal/aphRoutes';
import { Relation } from 'graphql/types/globalTypes';

describe('Login', () => {
  beforeEach(() => {
    cy.signOut();
    cy.server();
    cy.route('POST', apiRoutes.graphql(), currentPatientsResult);
    // Add a wait after visiting because firebase will immediately think it's signing in
    // (until it realizes there is no auth token present), during this time the profile circle is not clickable
    cy.visit(`${clientBaseUrl()}${clientRoutes.welcome()}`).wait(500);
  });

  const currentPatientsResult = getCurrentPatientsFixture();

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
    const me = currentPatientsResult.data.getCurrentPatients!.patients.find(
      (p) => p.relation === Relation.ME
    );
    cy.contains('hello');
    cy.contains(me!.firstName!.toLowerCase());
  });
});
