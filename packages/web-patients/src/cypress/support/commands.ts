import 'cypress-graphql-mock';
import { AllAphOperations } from 'cypress/types/AllAphOperations';
import { clientBaseUrl } from 'helpers/clientRoutes';
import schema from '@aph/api-schema/schema.json';
import { GetCurrentPatients_getCurrentPatients_patients } from 'graphql/types/GetCurrentPatients';

// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// see more example of adding custom commands to Cypress TS interface
// in https://github.com/cypress-io/add-cypress-custom-command-in-typescript
// add new command to the existing Cypress interface
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
// add a custom command cy.foo()
Cypress.Commands.add('foo', () => 'foo');
Cypress.Commands.add('visitAph', (route) => cy.visit(`${clientBaseUrl()}${route}`));
Cypress.Commands.add('mockAphGraphql', (options) => (cy as any).mockGraphql(options));
Cypress.Commands.add('mockAphGraphqlOps', (options) => (cy as any).mockGraphqlOps(options));
Cypress.Commands.add('clearFirebaseDb', () =>
  window.indexedDB.deleteDatabase('firebaseLocalStorageDb')
);
Cypress.Commands.add('signIn', (patients) => {
  cy.clearFirebaseDb();
  cy.server();
  (cy as any).mockAphGraphql({ schema });
  (cy as any).mockAphGraphqlOps({
    operations: {
      GetCurrentPatients: {
        getCurrentPatients: {
          __typename: 'GetCurrentPatientsResult',
          patients,
        },
      },
    },
  });
});
Cypress.Commands.add('signOut', () => {
  cy.clearFirebaseDb();
  cy.server();
  (cy as any).mockAphGraphql({ schema });
  (cy as any).mockAphGraphqlOps({
    operations: {
      GetCurrentPatients: {
        getCurrentPatients: null,
      },
    },
  });
});

interface MockAphGraphQLOptions<AllOperations = AllAphOperations> {
  schema: any;
  name?: string;
  mocks?: any;
  endpoint?: string;
  operations?: Partial<AllOperations>;
}

interface SetAphOperationsOpts<AllOperations = AllAphOperations> {
  name?: string;
  endpoint?: string;
  operations?: Partial<AllOperations>;
}

declare global {
  namespace Cypress {
    interface Chainable {
      foo: () => string;
      clearFirebaseDb: () => void;
      signIn: (
        currentPatients: GetCurrentPatients_getCurrentPatients_patients[] | null
      ) => Cypress.Chainable;
      signOut: () => void;
      visitAph: (route: string) => Cypress.Chainable;
      mockAphGraphql(options?: MockAphGraphQLOptions<AllAphOperations>): Cypress.Chainable;
      mockAphGraphqlOps(options?: SetAphOperationsOpts<AllAphOperations>): Cypress.Chainable;
    }
  }
}
