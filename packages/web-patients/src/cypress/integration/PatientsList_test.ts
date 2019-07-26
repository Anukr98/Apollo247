import { clientRoutes } from 'helpers/clientRoutes';
import { jane, john } from 'cypress/fixtures/patientsFixtures';
import schema from '@aph/api-schema/schema.json';

describe('PatientsList', () => {
  const patients = [jane, john];

  beforeEach(() => {
    cy.signOut();
    cy.server()
      .mockAphGraphql({ schema })
      .mockAphGraphqlOps({
        operations: {
          GetPatients: {
            getPatients: {
              __typename: 'GetPatientsResult',
              patients,
            },
          },
        },
      });
  });

  it('Shows the PatientsList', () => {
    cy.visitAph(clientRoutes.patients()).contains('h3', 'Patients List');
  });

  it('Renders each patient', () => {
    cy.visitAph(clientRoutes.patients()).then(() => {
      patients.forEach((patient) => {
        cy.contains('div', `${patient.firstName} ${patient.lastName}`);
      });
    });
  });
});
