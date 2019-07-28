import { clientRoutes } from 'helpers/clientRoutes';
import { jane, john, jimmy } from 'cypress/fixtures/patientsFixtures';
import { Relation } from 'graphql/types/globalTypes';

describe('Home page', () => {
  it('Clicking "Consult a doctor" when not signed in renders sign in popup', () => {
    cy.signOut();
    cy.visitAph(clientRoutes.welcome()).wait(500);
    cy.contains(/consult a doctor/i).click();
    cy.get('[data-cypress="SignIn"]').should('be.visible');
  });

  it('All the profiles should be visible after logging in', () => {
    const me = { ...jimmy, relation: Relation.ME };
    const patients = [jane, john, me];
    cy.signIn(patients);
    cy.visitAph(clientRoutes.welcome())
      .wait(500)
      .get('[data-cypress="HeroBanner"]')
      .contains(me.firstName!.toLowerCase())
      .click({ force: true });
    patients.forEach(({ firstName }) => cy.contains(firstName!.toLowerCase()));
    cy.contains('button', /add member/i);
  });
});
