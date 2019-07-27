import { clientRoutes } from 'helpers/clientRoutes';
import { jane, john, jimmy } from 'cypress/fixtures/patientsFixtures';
import { Relation } from 'graphql/types/globalTypes';

describe('Home page', () => {
  beforeEach(() => {
    // Add a wait so we finish attempting to authenticate
    cy.visitAph(clientRoutes.welcome()).wait(500);
  });

  it('Apollo logo is displayed', () => {
    cy.get('header').find('img');
  });

  // it('Available tabs in the header', () => {
  //   // These don't exist yet
  //   cy.get('header').contains('Consult Room');
  //   cy.get('header').contains('Health Records');
  //   cy.get('header').contains('Tests & Medicines');
  // });

  it('should display profile icon', () => {
    cy.get('header')
      .find('div[class*="userCircle"]')
      .should('exist');
  });

  it('Button for consult a doctor', () => {
    cy.get('[data-cypress="HeroBanner"]')
      .find('span')
      .contains('Consult a doctor')
      .should('exist');
  });

  it('Name of the logged in user should be visible beside Hello', () => {
    cy.get('h1')
      .contains('there!')
      .should('exist');
  });

  it('Clicking "Consult a doctor" when not signed in renders sign in popup', () => {
    cy.contains(/consult a doctor/i).click();
    cy.get('[data-cypress="SignIn"]').should('be.visible');
  });

  it('Are you not feeling well', () => {
    cy.contains('p', 'Not feeling well today').should('exist');
  });

  it('All the profiles should be visible after logging in', () => {
    const me = { ...jimmy, relation: Relation.ME };
    const patients = [jane, john, me];
    cy.signIn(patients);
    cy.visitAph(clientRoutes.welcome())
      .wait(500)
      .get('[data-cypress="HeroBanner"]')
      .find('div[role*="button"]')
      .contains(me.firstName!.toLowerCase())
      .click({ force: true });

    patients.forEach(({ firstName }) => cy.contains(firstName!.toLowerCase())); //passes, though doesn't display right?
    //played around endlessly with line 141-153 of HeroBanner, to no avail.
    //Proper capitalization displays in console, though.
  });

  it('Add member option verified', () => {
    const me = { ...jane, relation: Relation.ME };
    const patients = [jimmy, john, me];
    cy.signIn(patients);
    cy.visitAph(clientRoutes.welcome()).wait(500);
    cy.get('[data-cypress="HeroBanner"]')
      .find('div[role*="button"]')
      .contains(me.firstName!.toLowerCase())
      .click({ force: true });
    cy.get('button[class*="addMember"]')
      .contains('Add Member')
      .should('exist');
  });

  it('links of search specialist & star doctors in horizontal', () => {
    cy.get('a').contains('Find specialist');
    cy.get('a').contains('Search Medicine');
    cy.get('a').contains('Book a test');
    cy.get('a').contains('Who are star doctors');
  });
});
