import { clientRoutes, clientBaseUrl } from 'helpers/clientRoutes';
import schema from '@aph/api-schema/schema.json';
import { jane } from 'cypress/fixtures/patientsFixtures';
import { Relation, Gender } from 'graphql/types/globalTypes';

describe('UpdatePatient', () => {
  const patients = [jane];

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

  it('Shows NewProfile automatically', () => {
    cy.get('[data-cypress="NewProfile"]').should('exist');
  });

  it('Does not show name in HeroBanner (yet)', () => {
    cy.get('[data-cypress="HeroBanner"]')
      .contains('hello there')
      .should('exist')
      .contains(jane.firstName!)
      .should('not.exist');
  });

  it('Has firstName input pre-filled', () => {
    cy.get(`input[value="${jane.firstName}"]`).should('exist');
  });

  it('Submit is disabled unless form is dirty', () => {
    cy.get('[data-cypress="NewProfile"]')
      .find('button[type="submit"]')
      .should('be.disabled');
  });

  it('Should update the patient', () => {
    const janeTheMan = {
      ...jane,
      firstName: 'Jane The Man',
      relation: Relation.ME,
      gender: Gender.MALE,
    };

    cy.mockAphGraphqlOps({
      operations: {
        UpdatePatient: {
          updatePatient: {
            __typename: 'UpdatePatientResult',
            patient: janeTheMan,
          },
        },
      },
    });

    cy.get('[data-cypress="NewProfile"]')
      .find('button[value="MALE"]')
      .click();

    cy.get('[data-cypress="NewProfile"]')
      .find(`input[value="${jane.firstName!}"]`)
      .clear()
      .type(janeTheMan.firstName!);

    cy.get('[data-cypress="NewProfile"]')
      .find('button[type="submit"]')
      .click();

    cy.contains('congratulations!');

    cy.get('[data-cypress="HeroBanner"]')
      .contains(janeTheMan.firstName!.toLowerCase())
      .should('exist');
  });
});
