import { clientBaseUrl, clientRoutes } from 'helpers/clientRoutes';
import { apiRoutes } from 'helpers/apiRoutes';
import { getPatientsFixture } from 'cypress/fixtures/patientsFixtures';

describe('PatientsList', () => {
  beforeEach(() => cy.signOut());

  const patientsListQueryResult = getPatientsFixture();

  it('Shows the PatientsList', () => {
    cy.server()
      .visit(`${clientBaseUrl()}${clientRoutes.patients()}`)
      .route('POST', apiRoutes.graphql(), patientsListQueryResult)
      .then(() => {
        cy.contains('h3', 'Patients List');
      });
  });

  it('Renders each patient', () => {
    cy.server()
      .visit(`${clientBaseUrl()}${clientRoutes.patients()}`)
      .route('POST', apiRoutes.graphql(), patientsListQueryResult)
      .then(() => {
        patientsListQueryResult.data.getPatients!.patients.forEach((patient) => {
          cy.contains('div', `${patient.firstName} ${patient.lastName}`);
        });
      });
  });
});
