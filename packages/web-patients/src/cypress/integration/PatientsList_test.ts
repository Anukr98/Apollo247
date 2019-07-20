import { clientBaseUrl, clientRoutes } from 'helpers/clientRoutes';
import { apiRoutes } from 'helpers/apiRoutes';
import { getPatientsFixture } from 'cypress/fixtures/patientsFixtures';

describe('PatientsList', () => {
  beforeEach(() => cy.signOut());

  const patientsListQueryResult = getPatientsFixture();

  it('Shows the PatientsList', () => {
    cy.server();
    cy.visit(`${clientBaseUrl()}${clientRoutes.patients()}`);
    cy.route('POST', apiRoutes.graphql(), patientsListQueryResult).as('getPatients');
    cy.wait('@getPatients');
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
});
