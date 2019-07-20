import { clientRoutes, clientBaseUrl } from 'helpers/clientRoutes';
import { useAuth } from 'hooks/authHooks';

describe('Login', () => {
  it('Can bypass the captcha to successfully log in', () => {
    cy.signOut();

    cy.visit(`${clientBaseUrl()}${clientRoutes.welcome()}`);
    const userCircle = cy.get('[data-cypress*="User Circle"]');
    userCircle.click();

    const phoneInput = userCircle.get('input[type="tel"]');
    phoneInput.type('9999999999');

    const phoneSubmit = userCircle.get('button[aria-label="Sign in"]');
    phoneSubmit.click();
    cy.wait(7000);

    const otpInputs = cy.get('[class*="loginFormWrap"]').find('input[type*="tel"]');
    otpInputs.each(($el) => cy.wrap($el).type('9'));

    const otpSubmit = cy.get('form').find('button[type*="submit"]');
    otpSubmit.click();
    cy.wait(7000);
  });
});
