import { add } from 'cypress/support/add';
import { clientRoutes } from 'helpers/clientRoutes';

// brings type definition from @types/chai
// declare const expect: Chai.ExpectStatic
describe('Example', () => {
  it('works', () => {
    // note TypeScript definition
    const x: number = 42; // eslint-disable-line @typescript-eslint/no-unused-vars
  });

  it('can visit our app', () => {
    cy.visitAph(clientRoutes.welcome()).contains('GET STARTED');
  });

  it('checks shape of an object', () => {
    const object = {
      age: 21,
      name: 'Joe',
    };
    expect(object).to.have.all.keys('name', 'age');
  });

  it('uses cy commands', () => {
    cy.wrap({}).should('deep.eq', {});
  });

  // enable once we release updated TypeScript definitions
  it('has Cypress object type definition', () => {
    expect(Cypress.version).to.be.a('string');
  });

  // wrong code on purpose to type check our definitions
  // it('can visit website', () => {
  //   cy.boo();
  // });
  it('adds numbers', () => {
    expect(add(2, 3)).to.equal(5);
  });

  it('uses custom command cy.foo()', () => {
    cy.foo().should('be.equal', 'foo');
  });
});
