import { clientRoutes } from 'helpers/clientRoutes';
import { srKabir } from 'cypress/fixtures/doctorDetailsFixtures';

describe('BlockedCalendar', () => {
  it('Should be true', () => {
    cy.signIn(srKabir);
    cy.visitAph(clientRoutes.welcome()).contains('GET STARTED');
  });
});
