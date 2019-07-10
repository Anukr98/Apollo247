import { clientBaseUrl, clientRoutes } from 'helpers/clientRoutes';
import { apiRoutes } from 'helpers/apiRoutes';

describe('OTP Authentication', () => {
  it('Launch the Application', () => {
    cy.visit(`${clientBaseUrl()}${clientRoutes.welcome()}`, {
      onLoad: () => console.log('*** PAGE IS LOADED ***'),
    });
  });

  it('Open login popup', () => {
    const header = cy.get('[data-cypress="header"]');
    const userAccount = header.find('[data-cypress="userAccountImg"]');
    userAccount.click();
    expect(userAccount).to.exist;
  });

  it('Verify mobile Number input feild', () => {
    const loginForm = cy.get('[data-cypress="loginForm"]');
    expect(loginForm).to.exist;
    const input = loginForm.find('input');
    expect(input).to.exist;
  });

  it('Validation for Mobile number less than 10 digits', () => {
    const loginForm = cy.get('[data-cypress="loginForm"]');
    expect(loginForm).to.exist;
    const input = loginForm.find('input');
    expect(input).to.exist;
    input.clear();
    input.type('123456789');
    const loginsubmit = cy.get('button[type="submit"]');
    loginsubmit.should('be.disabled');
  });

  it('Validation for Mobile number more than 10 digits', () => {
    const loginForm = cy.get('[data-cypress="loginForm"]');
    expect(loginForm).to.exist;
    const input = loginForm.find('input');
    expect(input).to.exist;
    input.clear();
    input.type('987654321012');
    const loginsubmit = cy.get('button[type="submit"]');
    loginsubmit.should('be.disabled');
  });

  it('Validation for Alphabets', () => {
    const loginForm = cy.get('[data-cypress="loginForm"]');
    expect(loginForm).to.exist;
    const input = loginForm.find('input[type="tel"]');
    expect(input).to.exist;
    input.clear();
    input.type('abcdef');
    input.should('have.value', '');
  });

  it('Validation for special characters', () => {
    const loginForm = cy.get('[data-cypress="loginForm"]');
    expect(loginForm).to.exist;
    const input = loginForm.find('input');
    expect(input).to.exist;
    input.clear();
    input.type('!@.#$%^&*()_+');
    input.should('have.value', '');
  });

  it('Validation for spaces', () => {
    const loginForm = cy.get('[data-cypress="loginForm"]');
    expect(loginForm).to.exist;
    const input = loginForm.find('input');
    expect(input).to.exist;
    input.clear();
    input.type('     ');
    const loginsubmit = cy.get('button[type="submit"]');
    loginsubmit.should('be.disabled');
  });

  it('should not allow Mobile Number starting with Zero', () => {
    const loginForm = cy.get('[data-cypress="loginForm"]');
    expect(loginForm).to.exist;
    const input = loginForm.find('input');
    expect(input).to.exist;
    input.clear();
    input.type('0123456789');
    const loginsubmit = cy.get('button[type="submit"]');
    loginsubmit.should('be.disabled');
  });

  it('Prefix +91 displayed before mobile number input field', () => {
    cy.get('p')
      .contains('+91')
      .should('exist');
  });

  it('Verify the text of validation error message', () => {
    const loginForm = cy.get('[data-cypress="loginForm"]');
    expect(loginForm).to.exist;
    const input = loginForm.find('input');
    expect(input).to.exist;
    input.clear();
    input.type('1234567890');
    cy.get('[data-cypress="error"]').should('contain', 'This seems like a wrong number');
  });

  it('Verify if the next arrow is enabled / disabled upon providing valid / invalid mobile numbers', () => {
    const loginForm = cy.get('[data-cypress="loginForm"]');
    expect(loginForm).to.exist;
    const input = loginForm.find('input');
    expect(input).to.exist;
    input.clear();
    input.type('9652742427');

    if (input.should('have.value', '9652742427')) {
      const loginsubmit = cy.get('button[type="submit"]');
      loginsubmit.should('be.enabled');
    } else if (input.should('not.have.value', '0123456789')) {
      const loginsubmit = cy.get('button[type="submit"]');
      loginsubmit.should('be.disabled');
    }
  });

  it('Verify the next screen upon providing mobile number and clicking on Next arrow', () => {
    const loginForm = cy.get('[data-cypress="loginForm"]');
    expect(loginForm).to.exist;
    const input = loginForm.find('input');
    expect(input).to.exist;
    input.clear();
    input.type('9652742427');
    input.should('have.value', '9652742427');
    const loginsubmit = cy.get('button[type="submit"]');
    loginsubmit.click();
    // loginsubmit.should('be.disabled');
  });

  // it('OTP should be received the provided mobile number', () => {
  //   const loginForm = cy.get('[data-cypress="loginForm"]');
  //   expect(loginForm).to.exist;
  //   const input = loginForm.find('input');
  //   expect(input).to.exist;
  //   input.clear();
  //   input.type('9652742427');
  //   const loginsubmit = cy.get('button[type="submit"]');
  //   loginsubmit.click();
  // });
});
