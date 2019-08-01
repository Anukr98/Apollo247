import { clientRoutes } from 'helpers/clientRoutes';
import {
  janeNoRelation,
  johnBrother,
  jimmyCousin,
  julieNoRelation,
} from 'cypress/fixtures/patientsFixtures';
import { Relation, Gender } from 'graphql/types/globalTypes';

describe('UpdatePatient (with uhids)', () => {
  const patients = [janeNoRelation, johnBrother, jimmyCousin].map((pat) => ({
    ...pat,
    uhid: 'uhid-1234',
  }));

  beforeEach(() => {
    cy.signIn(patients);
    cy.visitAph(clientRoutes.welcome()).wait(500);
  });

  it('Shows ExistingProfile automatically', () => {
    cy.get('[data-cypress="ExistingProfile"]').should('exist');
  });

  it('Welcomes you by prompting for complete family data', () => {
    cy.get('[data-cypress="ExistingProfile"]')
      .contains('Please tell us who is who')
      .should('exist');
  });

  it('Relations dropdown goes in order Me (Default), Mother, Father, Sister, Brother, Wife, Husband, Others', () => {
    cy.get('[data-cypress="ExistingProfile"]')
      .find('div[class*="MuiInputBase-inputSelect"]')
      .first()
      .click();

    cy.get('ul[role*="listbox"]')
      .find('li')
      .eq(1)
      .should('have.attr', 'data-value', 'ME');

    cy.get('ul[role*="listbox"]')
      .find('li')
      .eq(2)
      .should('have.attr', 'data-value', 'MOTHER');

    cy.get('ul[role*="listbox"]')
      .find('li')
      .eq(3)
      .should('have.attr', 'data-value', 'FATHER');

    cy.get('ul[role*="listbox"]')
      .find('li')
      .eq(4)
      .should('have.attr', 'data-value', 'SISTER');

    cy.get('ul[role*="listbox"]')
      .find('li')
      .eq(5)
      .should('have.attr', 'data-value', 'BROTHER');

    cy.get('ul[role*="listbox"]')
      .find('li')
      .eq(6)
      .should('have.attr', 'data-value', 'WIFE');

    cy.get('ul[role*="listbox"]')
      .find('li')
      .eq(7)
      .should('have.attr', 'data-value', 'HUSBAND');

    cy.get('ul[role*="listbox"]')
      .find('li')
      .eq(8)
      .should('have.attr', 'data-value', 'COUSIN');

    cy.get('ul[role*="listbox"]')
      .find('li')
      .eq(9)
      .should('have.attr', 'data-value', 'OTHER');
  });

  it('Does not show name in HeroBanner until Relation.ME is established', () => {
    cy.get('[data-cypress="HeroBanner"]')
      .contains('hello there')
      .should('exist')
      .contains(janeNoRelation.firstName!)
      .should('not.exist');
  });
});

describe('UpdatePatient (without uhids)', () => {
  const patients = [janeNoRelation, julieNoRelation];

  beforeEach(() => {
    cy.signIn(patients);
    cy.visitAph(clientRoutes.welcome()).wait(500);
  });

  it('Shows NewProfile automatically', () => {
    cy.get('[data-cypress="NewProfile"]').should('exist');
  });

  it('Does not show name in HeroBanner until a Relation.ME is established', () => {
    cy.get('[data-cypress="HeroBanner"]')
      .contains('hello there')
      .should('exist')
      .contains(janeNoRelation.firstName!)
      .should('not.exist');
  });

  it('Has firstName input pre-filled', () => {
    cy.get(`input[value="${janeNoRelation.firstName}"]`).should('exist');
  });

  it('Submit is disabled unless form is dirty', () => {
    cy.get('[data-cypress="NewProfile"]')
      .find('button[type="submit"]')
      .should('be.disabled');
  });

  it('Wont allow improper dates in dateOfBirth field', () => {
    cy.get('[data-cypress="NewProfile"]')
      .find('form')
      .find('input[name="dateOfBirth"]')
      .clear()
      .type('test')
      .blur();

    cy.get('[data-cypress="NewProfile"]')
      .find('form')
      .get('button[type="submit"]')
      .should('be.disabled');

    cy.contains('Invalid date of birth');
  });

  it('Should update the patient', () => {
    const janeTheMan = {
      ...janeNoRelation,
      firstName: 'Jane The Man',
      relation: Relation.ME,
      gender: Gender.MALE,
    };

    cy.mockAphGraphqlOps({
      operations: {
        UpdatePatient: {
          updatePatient: {
            __typename: 'UpdatePatientResult',
            patient: janeTheMan,
          },
        },
      },
    });

    cy.get('[data-cypress="NewProfile"]')
      .find('button[value="MALE"]')
      .click();

    cy.get('[data-cypress="NewProfile"]')
      .find(`input[value="${janeNoRelation.firstName!}"]`)
      .clear()
      .type(janeTheMan.firstName!);

    cy.get('[data-cypress="NewProfile"]')
      .find('button[type="submit"]')
      .click();

    cy.contains('congratulations!');

    cy.get('[data-cypress="HeroBanner"]')
      .contains(janeTheMan.firstName!.toLowerCase())
      .should('exist');
  });

  it('Shows genders in the order Male, Female, Other', () => {
    cy.get('[data-cypress="NewProfile"]')
      .find('div[class*="makeStyles-btnGroup"]')
      .children()
      .eq(0)
      .find('span[class*="MuiButton-label"]')
      .should('contain', 'Male');

    cy.get('div[class*="makeStyles-btnGroup"]')
      .children()
      .eq(1)
      .find('span[class*="MuiButton-label"]')
      .should('contain', 'Female');

    cy.get('div[class*="makeStyles-btnGroup"]')
      .children()
      .eq(2)
      .find('span[class*="MuiButton-label"]')
      .should('contain', 'Other');
  });
});
