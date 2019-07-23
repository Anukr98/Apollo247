import { clientBaseUrl, clientRoutes } from 'helpers/clientRoutes';

describe('Home page Elements', () => {
  it('Launch the Application', () => {
    cy.visit(`${clientBaseUrl()}${clientRoutes.welcome()}`, {
      onLoad: () => console.log('*** PAGE IS LOADED ***'),
    });
  });
  it('Apollo logo displayed', () => {
    cy.get('header').find('img');
  });

  // it('Available tabs in the header', () => {
  //   cy.get('header').contains('Consult Room');
  //   cy.get('header').contains('Health Records');
  //   cy.get('header').contains('Tests & Medicines');
  // });
  it('profile icon displayed', () => {
    const header = cy.get('header');
    const userAccount = header.find('[ data-cypress="userAccountImg"]');
    expect(userAccount).to.exist;
  });
  // it('Name of the logged in user should be visible beside Hello', () => {
  //   cy.get('h1')
  //     .contains('there!')
  //     .should('exist');
  // });
  it('Are you not feeling well', () => {
    cy.contains('p', 'Not feeling well today').should('exist');
  });

  // it('All the profiles should be visible upon clicking on drop down beside name of the logged In user', () => {
  //   cy.contains('Surj').click();
  //   cy.contains('Surj').should('exist');
  //   cy.contains('Preeti').should('exist');
  // });
  // it('Add member option verified', () => {
  //   cy.get('span')
  //     .contains('Add Member')
  //     .should('exist');
  // });
  it('Button for consult a doctor', () => {
    cy.get('span')
      .contains('Consult a doctor')
      .should('exist');
  });
  it('links of search specialist & star doctors in horizontal', () => {
    cy.get('a').contains('Find specialist');
    cy.get('a').contains('Search Medicine');
    cy.get('a').contains('Book a test');
    cy.get('a').contains('Who are star doctors');
  });
});
