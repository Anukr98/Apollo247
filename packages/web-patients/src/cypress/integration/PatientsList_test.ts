import { clientBaseUrl, clientRoutes } from 'helpers/clientRoutes';
import { getPatientsFixture } from 'cypress/fixtures/patientsFixtures';
import schema from '@aph/api-schema/schema.json';

describe('PatientsList', () => {
  const GetPatients = getPatientsFixture();

  beforeEach(() => {
    cy.signOut();
    cy.server()
      .mockAphGraphql({ schema })
      .mockAphGraphqlOps({
        operations: {
          GetPatients,
        },
      });
  });

  it('Shows the PatientsList', () => {
    cy.visit(`${clientBaseUrl()}${clientRoutes.patients()}`).contains('h3', 'Patients List');
  });

  it('Renders each patient', () => {
    cy.visit(`${clientBaseUrl()}${clientRoutes.patients()}`).then(() => {
      const { patients } = GetPatients.getPatients!;
      patients.forEach((patient) => {
        cy.contains('div', `${patient.firstName} ${patient.lastName}`);
      });
    });
  });
});
