import { clientBaseUrl, clientRoutes } from 'helpers/clientRoutes';
import { apiRoutes } from 'helpers/apiRoutes';
import { escape } from 'querystring';

function profileIcon() {
  cy.get('body').click();

  const header = cy.get('[data-cypress="header"]');
  const profileIcon = header.find('[ data-cypress="userAccountImg"]');
  expect(profileIcon).to.exist;
  profileIcon.click();

  const loginForm = cy.get('[data-cypress="loginForm"]');
  expect(loginForm).to.exist;

  const input = loginForm.find('input');
  expect(input).to.exist;
}

describe('LogIn page', () => {
  it('Launch the Application', () => {
    cy.visit(`${clientBaseUrl()}${clientRoutes.welcome()}`, {
      onLoad: () => console.log('*** PAGE IS LOADED ***'),
    });
  });
  it('Verify enter mobile number screen upon clicking on Consult a doctor button', () => {
    const header = cy.get('[data-cypress="header"]');
    const userAccount = header.find('[ data-cypress="userAccountImg"]');
    expect(userAccount).to.exist;

    cy.get('[data-cypress="bannerInfo"]')
      .find('button[type="button"]')
      .contains('Consult a doctor')
      .click();

    const loginForm = cy.get('[data-cypress="loginForm"]');
    expect(loginForm).to.exist;

    const input = loginForm.find('input');
    expect(input).to.exist;
  });
  it('Verify enter mobile number screen upon clicking on Profile icon', () => {
    cy.wait(1000);
    const header = cy.get('[data-cypress="header"]');
    const profileIcon = header.find('[ data-cypress="userAccountImg"]');
    expect(profileIcon).to.exist;
    const loginForm = cy.get('[data-cypress="loginForm"]');
    expect(loginForm).to.exist;

    const input = loginForm.find('input');
    expect(input).to.exist;
  });
  it('Need help Icon', () => {
    profileIcon();
  });
  it('Verify enter mobile number screen  upon clicking the links of doctors list ', () => {
    cy.get('body').click();
    cy.get('a')
      .contains('Find specialist')
      .click();
    cy.get('body').click();

    cy.get('a')
      .contains('Search Medicine')
      .click();
    cy.get('body').click();

    cy.get('a')
      .contains('Book a test')
      .click();
    cy.get('body').click();

    cy.get('a')
      .contains('Who are star doctors')
      .click();

    const loginForm = cy.get('[data-cypress="loginForm"]');
    expect(loginForm).to.exist;

    const input = loginForm.find('input');
    expect(input).to.exist;
  });
});
