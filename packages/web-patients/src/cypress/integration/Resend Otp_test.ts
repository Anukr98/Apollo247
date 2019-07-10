import { clientBaseUrl, clientRoutes } from 'helpers/clientRoutes';
import { apiRoutes } from 'helpers/apiRoutes';

describe('Resend Otp', () => {
  it('Launch the Application', () => {
    cy.visit(`${clientBaseUrl()}${clientRoutes.welcome()}`, {
      onLoad: () => console.log('*** PAGE IS LOADED ***'),
    });
  });
  // it('Verify the hyperlink of Resend OTP', () => {});
});
