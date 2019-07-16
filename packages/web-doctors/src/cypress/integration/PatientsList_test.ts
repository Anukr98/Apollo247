import { clientBaseUrl, clientRoutes } from 'helpers/clientRoutes';
import { apiRoutes } from 'helpers/apiRoutes';
import { getPatientsFixture } from 'cypress/fixtures/patientsFixtures';

describe('PatientsList', () => {
  it('Shows the PatientsList', () => {
    cy.visit(`${clientBaseUrl()}${clientRoutes.patients()}`);
    cy.contains('h3', 'Patients List').should('exist');
  });

  it('Renders each patient', () => {
    const patientsListQueryResult = getPatientsFixture();
    cy.server();
    cy.route('POST', apiRoutes.graphql(), patientsListQueryResult);
    cy.visit(`${clientBaseUrl()}${clientRoutes.patients()}`);
    patientsListQueryResult.data.getPatients!.patients.forEach((patient) => {
      cy.contains('div', `${patient.firstName} ${patient.lastName}`);
    });
  });
});
