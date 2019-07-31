import { clientRoutes } from 'helpers/clientRoutes';
import { jane, john, jimmy } from 'cypress/fixtures/patientsFixtures';
import { Relation } from 'graphql/types/globalTypes';

describe('Home page (when signed out)', () => {
  beforeEach(() => {
    cy.signOut();
    cy.visitAph(clientRoutes.welcome()).wait(500);
  });

  it('Clicking "Consult a doctor" renders sign in popup', () => {
    cy.contains(/consult a doctor/i).click();
    cy.get('[data-cypress="SignIn"]').should('be.visible');
  });
});

describe('Home page (when signed in)', () => {
  const me = { ...jimmy, relation: Relation.ME };
  const patients = [jane, john, me];

  beforeEach(() => {
    cy.signIn(patients);
    cy.visitAph(clientRoutes.welcome()).wait(500);
  });

  it.only('All the profiles should be visible after logging in', () => {
    cy.get('[data-cypress="HeroBanner"]')
      .contains(me.firstName!.toLowerCase())
      .click({ force: true });
    patients.forEach(({ firstName }) => cy.contains(firstName!.toLowerCase()));
    cy.contains('button', /add member/i);
  });

  it('Shows "me" selected in hello dropdown', () => {
    cy.contains('hello');
    cy.contains(me!.firstName!.toLowerCase());
  });
});

// describe('Relation.ME autofills for a single user', () => { //Not active yet
//   const patient = [jane];

//   beforeEach(() => {
//     cy.signIn(patient);
//     cy.visitAph(clientRoutes.welcome()).wait(500);
//   });

//   it.only('All the profiles should be visible after logging in', () => {
//     cy.get('[data-cypress="HeroBanner"]').click({ force: true });
//     cy.contains('button', /add member/i);
//   });

//   it('Shows "me" selected in hello dropdown', () => {
//     cy.contains('hello');
//   });
// });
