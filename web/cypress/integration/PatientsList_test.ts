import { clientBaseUrl, clientRoutes } from 'helpers/clientRoutes';

describe('PatientsList', () => {
  it('Shows PatientsList', () => {
    cy.visit(`${clientBaseUrl}${clientRoutes.patients()}`);
    cy.get(`[data-cypress='PatientsList']`).should('exist');
  });
});
