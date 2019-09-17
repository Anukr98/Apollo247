import { clientRoutes } from 'helpers/clientRoutes';
import { srKabir } from 'cypress/fixtures/doctorDetailsFixtures';

describe('BlockedCalendar', () => {
  beforeEach(() => {
    cy.signIn(srKabir);
    cy.visitAph(clientRoutes.MyAccount())
      .contains('Availability')
      .click();
  });

  it('Can visit Availability page', () => {
    cy.contains(/add blocked hours/i);
  });

  it('Should convert UTC dates to IST for display purposes', () => {
    const doctorId = srKabir.id;
    const startUtcFromDb = '2019-09-18T10:00:00.000Z';
    const endUtcFromDb = '2019-09-18T11:00:00.000Z';
    const displayDateIst = 'Wed, 09/18/2019';
    const displayTimeIst = '3:30 PM - 4:30 PM';
    cy.mockAphGraphqlOps({
      operations: {
        GetBlockedCalendar: {
          getBlockedCalendar: {
            __typename: 'BlockedCalendarResult',
            blockedCalendar: [
              {
                __typename: 'BlockedCalendarItem',
                id: 1,
                doctorId,
                start: startUtcFromDb,
                end: endUtcFromDb,
              },
            ],
          },
        },
      },
    });
    cy.contains(/add blocked hours/i).should('exist');
    cy.get('[data-cypress="BlockedCalendar"]')
      .find('[class*="MuiCircularProgress"]')
      .should('exist')
      .find('[class*="MuiCircularProgress"]')
      .should('not.exist');
    cy.contains(displayDateIst).should('exist');
    cy.contains(displayTimeIst).should('exist');
  });

  it('Should send dates in UTC', () => {});
});
