import { clientRoutes } from 'helpers/clientRoutes';
import { srKabir } from 'cypress/fixtures/doctorDetailsFixtures';
import { GraphQLError } from 'graphql';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

const fillStart = (start: string) =>
  cy
    .get('[data-cypress="BlockedCalendarModal"]')
    .contains('Start')
    .parent()
    .find('input')
    .type(start);

const fillEnd = (end: string) =>
  cy
    .get('[data-cypress="BlockedCalendarModal"]')
    .contains('End')
    .parent()
    .find('input')
    .type(end);

const selectDay = () =>
  cy
    .get('[data-cypress="BlockedCalendarModal"]')
    .contains('For a day')
    .click();

const selectDuration = () =>
  cy
    .get('[data-cypress="BlockedCalendarModal"]')
    .contains('For a duration')
    .click();

const waitForLoader = () =>
  cy
    .get('[data-cypress="BlockedCalendar"]')
    .find('[class*="MuiCircularProgress"]')
    .should('exist')
    .find('[class*="MuiCircularProgress"]')
    .should('not.exist');

const getSubmitBtn = () =>
  cy.get('[data-cypress="BlockedCalendarModal"]').find('button[type="submit"]');

const getAddBtn = () => cy.contains(/add blocked hours/i);

describe('BlockedCalendar', () => {
  beforeEach(() => {
    cy.signIn(srKabir);
    cy.visitAph(clientRoutes.MyAccount())
      .contains('Availability')
      .click();
  });

  it('Can visit Availability page', () => {
    getAddBtn().should('exist');
  });

  it('Should convert UTC dates to IST for display purposes (same-day)', () => {
    const doctorId = srKabir.id;
    const startUtcFromDb = '2050-09-18T10:00:00.000Z';
    const endUtcFromDb = '2050-09-18T11:00:00.000Z';
    const displayDateIst = 'Sun, 09/18/2050';
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
    waitForLoader();
    cy.contains(displayDateIst).should('exist');
    cy.contains(displayTimeIst).should('exist');
  });

  it('Should display "All slots" for multi-day block', () => {
    const doctorId = srKabir.id;
    const startUtcFromDb = '2050-09-18T10:00:00.000Z';
    const endUtcFromDb = '2050-09-19T11:00:00.000Z';
    const displayDateIst = '09/18/2050 - 09/19/2050';
    const displayTimeIst = 'All slots';
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
    waitForLoader();
    cy.contains(displayDateIst).should('exist');
    cy.contains(displayTimeIst).should('exist');
  });

  it('Should validate start/end dates', () => {
    getAddBtn().click();

    getSubmitBtn().should('be.disabled');

    fillStart('2050-09-18');
    fillEnd('2050-09-19');
    getSubmitBtn().should('be.enabled');

    fillStart('2050-09-19');
    fillEnd('2050-09-18');
    getSubmitBtn().should('be.disabled');

    fillStart('1999-01-01');
    fillEnd('2050-09-18');
    getSubmitBtn().should('be.disabled');
  });

  it('Should send dates in UTC', () => {
    getAddBtn().click();
    fillStart('2050-09-18');
    fillEnd('2050-09-18');

    const doctorId = srKabir.id;
    const startUtc = '2050-09-17T18:30:00.000Z';
    const endUtc = '2050-09-18T18:29:00.000Z';
    const blockedCalendarResult = {
      __typename: 'BlockedCalendarResult' as 'BlockedCalendarResult',
      blockedCalendar: [
        {
          __typename: 'BlockedCalendarItem' as 'BlockedCalendarItem',
          id: 1,
          doctorId,
          start: startUtc,
          end: endUtc,
        },
      ],
    };

    cy.mockAphGraphqlOps({
      operations: {
        GetBlockedCalendar: {
          getBlockedCalendar: blockedCalendarResult,
        },
        AddBlockedCalendarItem: {
          addBlockedCalendarItem: blockedCalendarResult,
        },
      },
    });

    getSubmitBtn().click();

    cy.get('@fetchStub').should((fetchStub: any) => {
      const fetchSpy = fetchStub.getCalls();
      const addItemMutation = fetchSpy[fetchSpy.length - 2];
      const addItemMutationArgs = addItemMutation.args[1];
      const addItemMutationArgsBody = JSON.parse(addItemMutationArgs.body);
      const addItemMutationInputVariables = addItemMutationArgsBody.variables;
      expect(addItemMutationInputVariables).to.deep.equal({
        doctorId,
        start: startUtc,
        end: endUtc,
      });
    });
  });

  it('Add screen should always start with empty fields', () => {
    getAddBtn().click();
    fillStart('2050-09-18');
    fillEnd('2050-09-18');

    const doctorId = srKabir.id;
    const startUtc = '2050-09-17T18:30:00.000Z';
    const endUtc = '2050-09-18T18:29:00.000Z';
    const blockedCalendarResult = {
      __typename: 'BlockedCalendarResult' as 'BlockedCalendarResult',
      blockedCalendar: [
        {
          __typename: 'BlockedCalendarItem' as 'BlockedCalendarItem',
          id: 1,
          doctorId,
          start: startUtc,
          end: endUtc,
        },
      ],
    };

    cy.mockAphGraphqlOps({
      operations: {
        GetBlockedCalendar: {
          getBlockedCalendar: blockedCalendarResult,
        },
        AddBlockedCalendarItem: {
          addBlockedCalendarItem: blockedCalendarResult,
        },
      },
    });

    getSubmitBtn().click();

    getAddBtn().click();
    cy.get('[data-cypress="BlockedCalendarModal"]')
      .find('input[value="2050-09-18"]')
      .should('not.exist');
  });

  it('Should pre-populate fields for Edit', () => {
    const doctorId = srKabir.id;
    const startUtcFromDb = '2050-09-18T10:00:00.000Z';
    const endUtcFromDb = '2050-09-18T11:00:00.000Z';
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
    waitForLoader();

    cy.get('[data-cypress="BlockedCalendar"]')
      .find('button:contains(EDIT)')
      .click();

    selectDuration()
      .get('[data-cypress="BlockedCalendarModal"]')
      .find('input[value="2050-09-18"]')
      .should('exist');

    selectDay()
      .get('[data-cypress="BlockedCalendarModal"]')
      .find('input[value="15:30"]')
      .should('exist')
      .get('[data-cypress="BlockedCalendarModal"]')
      .find('input[value="16:30"]')
      .should('exist');
  });

  it('Unblocking should work', () => {
    const doctorId = srKabir.id;
    const startUtcFromDb = '2050-09-18T10:00:00.000Z';
    const endUtcFromDb = '2050-09-18T11:00:00.000Z';
    const displayDateIst = 'Sun, 09/18/2050';
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
    waitForLoader();
    cy.contains(displayDateIst).should('exist');
    cy.contains(displayTimeIst).should('exist');
    cy.mockAphGraphqlOps({
      operations: {
        RemoveBlockedCalendarItem: {
          removeBlockedCalendarItem: {
            __typename: 'BlockedCalendarResult',
            blockedCalendar: [],
          },
        },
        GetBlockedCalendar: {
          getBlockedCalendar: {
            __typename: 'BlockedCalendarResult',
            blockedCalendar: [],
          },
        },
      },
    });
    cy.contains(/unblock/i).click();
    cy.contains(displayDateIst).should('not.exist');
    cy.contains(displayTimeIst).should('not.exist');
  });

  it('Should display error if dates overlap', () => {
    const errorMsgInDom = /Error/i;
    const doctorId = srKabir.id;
    const startUtcFromDb = '2050-09-18T10:00:00.000Z';
    const endUtcFromDb = '2050-09-18T11:00:00.000Z';
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
    waitForLoader();
    getAddBtn().click();
    cy.contains(errorMsgInDom).should('not.exist');
    fillStart('2050-09-13');
    fillEnd('2050-09-20');
    cy.mockAphGraphqlOps({
      operations: {
        AddBlockedCalendarItem: () => {
          throw new GraphQLError(AphErrorMessages.BLOCKED_CALENDAR_ITEM_OVERLAPS);
        },
      },
    });
    getSubmitBtn().click();
    cy.contains(errorMsgInDom).should('exist');
  });
});
