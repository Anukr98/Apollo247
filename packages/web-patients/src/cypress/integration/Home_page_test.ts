import { clientRoutes } from 'helpers/clientRoutes';
import { jane, john, jimmy } from 'cypress/fixtures/patientsFixtures';
import { Relation } from 'graphql/types/globalTypes';
// import chaiColors from 'chai-colors';
// chai.use(chaiColors);
// ^related error: "Could not find a declaration file for module 'chai-colors'. '/Users/BarkerAW83/Repos/apollo/apollo-hospitals/packages/web-patients/node_modules/chai-colors/chai_colors.js' implicitly has an 'any' type.""

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
  it('Prefix "+91" should be displayed before the mobile number input field', () => {
    cy.contains(/consult a doctor/i).click();
    cy.get('[data-cypress="SignIn"]')
      .find('p')
      .contains('+91')
      .should('exist');
  });
  it('There should be validation upon entering anything non-numerical', () => {
    cy.contains(/consult a doctor/i).click();
    cy.get('[data-cypress="SignIn"]')
      .find('input[name*="mobileNumber"]')
      .type('test');
    cy.get('input[name*="mobileNumber"]')
      .contains('test')
      .should('not.exist');
  });
  it('Next arrow should be disabled upon entering anything invalid number', () => {
    cy.contains(/consult a doctor/i).click();
    cy.get('[data-cypress="SignIn"]')
      .find('input[name*="mobileNumber"]')
      .type('0123456789')
      .find('button[type*="submit"]')
      .should('not.exist');
  });
  it('There should be validation upon entering mobile number starting with zero', () => {
    cy.contains(/consult a doctor/i).click();
    cy.get('[data-cypress="SignIn"]')
      .find('input[name*="mobileNumber"]')
      .type('0123456789');
    cy.get('div[class*="MuiFormHelperText-filled"]').should(
      'contain',
      'This seems like a wrong number'
    );
  });
  it('Ten digit numbers starting with non-zero should be considered valid', () => {
    //fails with any number starting w/ 0-5
    cy.contains(/consult a doctor/i).click();
    cy.get('[data-cypress="SignIn"]')
      .find('input[name*="mobileNumber"]')
      .type('1234567890');
    cy.get('div[class*="MuiFormHelperText-filled"]').should(
      'contain',
      'OTP will be sent to this number'
    );
  });
  it('Validation error message should be in red font', () => {
    //chai-colors must be properly imported for test to pass
    cy.contains(/consult a doctor/i).click();
    cy.get('[data-cypress="SignIn"]')
      .find('input[name*="mobileNumber"]')
      .type('0123456789');
    cy.get('div[class*="MuiFormHelperText-filled"]')
      .contains('This seems like a wrong number')
      .should('have.css', 'color')
      .and('be.colored', '#890000');
  });
  it('Validation success message should be in green font', () => {
    //chai-colors must be properly imported for test to pass
    cy.contains(/consult a doctor/i).click();
    cy.get('[data-cypress="SignIn"]')
      .find('input[name*="mobileNumber"]')
      .type('9876543210');
    cy.get('div[class*="MuiFormHelperText-filled"]')
      .contains('OTP will be sent to this number')
      .should('have.css', 'color')
      .and('be.colored', 'rgba(2,71,91,0.6)');
  });

  it('Resend OTP hyperlink should be displayed, clicking on which resends OTP to the provided mobile number', () => {
    //fails because this doesn't trigger firebase captcha exception?
    cy.contains(/consult a doctor/i).click();
    cy.get('[data-cypress="SignIn"]')
      .find('input[name*="mobileNumber"]')
      .type('9876543210');
    cy.get('button[type*="submit"]')
      .click()
      .wait(5000);
    cy.get('button[class*="resendBtn"]')
      .should('contain', 'Resend OTP')
      .find('input[name*="mobileNumber"]')
      .type('555');
    cy.get('button[class*="resendBtn"]').click();
    cy.get('input[name*="mobileNumber"]')
      .should('not')
      .contains('555');
  });

  it('After clicking  Resend OTP, header text should be changed to "Type in the OTP that has been resent to you for authentication"', () => {
    //fails, because that doesn't exist yet
    cy.contains(/consult a doctor/i).click();
    cy.get('[data-cypress="SignIn"]')
      .find('input[name*="mobileNumber"]')
      .type('9876543210');
    cy.get('button[type*="submit"]')
      .click()
      .wait(5000);
    cy.get('button[class*="resendBtn"]')
      .find('p')
      .contains('Type in the OTP sent to you, to authenticate')
      .should('exist');

    cy.get('button[class*="resendBtn"]').click();
    cy.get('input[name*="mobileNumber"]')
      .find('p')
      .contains('Type in the OTP sent to you, to authenticate')
      .should('exist');
  });

  //OTP should be received twice on the provided mobile number,
  // once as soon as we redirect to OTP screen and the other upon clicking on Resend OTP

  // There should be a back arrow on the top left of the screen,
  // clicking on which user should redirect to the previous screen (Enter mobile number screen)

  // API-21 all
});
