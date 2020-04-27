import { clientRoutes } from 'helpers/clientRoutes';
import {
  janeNoRelation,
  johnBrother,
  jimmyCousin,
  julieNoRelation,
  quentinQuotes,
} from 'cypress/fixtures/patientsFixtures';
import { Relation, Gender } from 'graphql/types/globalTypes';

describe('UpdatePatient (single, with uhid)', () => {
  const patient = [janeNoRelation].map((pat) => ({
    ...pat,
    uhid: 'uhid-1234',
  }));

  beforeEach(() => {
    cy.signIn(patient);
    cy.visitAph(clientRoutes.welcome()).wait(500);
  });
  it('upon clicking submit with only one patient, default to Relation.ME if no relation selected', () => {
    cy.get('[data-cypress="ExistingProfile"]').should('exist');

    cy.get('button[type="submit"]').should('be.enabled');
  });
});

describe('UpdatePatient (multiple, with uhids, invalid primary user)', () => {
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

  it('upon clicking submit, show an error if there is no Relation.Me, and disable submit', () => {
    cy.get('[data-cypress="ExistingProfile"]')
      .contains('Please tell us who is who')
      .should('exist');

    cy.get('div[class*="selectMenuRoot"]').contains('Me').should('not.exist');

    cy.get('div[class*="selectMenuRoot"]').contains('Brother').should('exist');

    cy.get('button[type="submit"]').should('be.disabled');

    cy.get('[data-cypress="ExistingProfile"]')
      .contains('There should be 1 profile with relation set as Me')
      .should('exist');
  });

  it('Upon clicking submit, show an error if there is more than 1 Me, and disable submit', () => {
    cy.get('[data-cypress="ExistingProfile"]')
      .contains('Please tell us who is who')
      .should('exist');

    cy.get('div[class*="makeStyles-formGroup"]')
      .find('div[data-cypress="PatientProfile"]')
      .children()
      .eq(1)
      .find('div[class*="selectInputRoot"]')
      .click();

    cy.get('li[data-value*="ME"]').click();

    cy.get('div[class*="makeStyles-formGroup"]')
      .find('div[data-cypress="PatientProfile"]')
      .children()
      .eq(3)
      .find('div[class*="selectInputRoot"]')
      .click();

    cy.get('li[data-value*="ME"]').click();

    cy.get('button[type="submit"]').should('be.disabled');

    cy.get('[data-cypress="ExistingProfile"]')
      .contains('Relation can be set as Me for only 1 profile')
      .should('exist');
  });

  it('If one user has a relation of "Me", and others have complete profiles, let the user submit', () => {
    cy.get('[data-cypress="ExistingProfile"]')
      .contains('Please tell us who is who')
      .should('exist');

    cy.get('div[class*="makeStyles-formGroup"]')
      .find('div[data-cypress="PatientProfile"]')
      .children()
      .eq(1)
      .find('div[class*="selectInputRoot"]')
      .click();

    cy.get('li[data-value*="ME"]').click();

    cy.get('button[type="submit"]').should('be.enabled');
  });

  it('If there is no relation selected, display "Relation" as placeholder', () => {
    cy.get('[data-cypress="ExistingProfile"]')
      .contains('Please tell us who is who')
      .should('exist');

    cy.get('div[class*="MuiInputBase-inputSelect"]').should('contain', 'Relation');
  });

  it('Welcomes you by prompting for complete family data', () => {
    cy.get('[data-cypress="ExistingProfile"]')
      .contains('Please tell us who is who')
      .should('exist');
  });

  it('Relations dropdown goes in order Me (Default), Mother, Father, Sister, Brother, Cousin, Wife, Husband', () => {
    cy.get('[data-cypress="ExistingProfile"]')
      .find('div[class*="MuiInputBase-inputSelect"]')
      .first()
      .click();

    cy.get('ul[role*="listbox"]').find('li').eq(1).should('have.attr', 'data-value', 'ME');

    cy.get('ul[role*="listbox"]').find('li').eq(2).should('have.attr', 'data-value', 'MOTHER');

    cy.get('ul[role*="listbox"]').find('li').eq(3).should('have.attr', 'data-value', 'FATHER');

    cy.get('ul[role*="listbox"]').find('li').eq(4).should('have.attr', 'data-value', 'SISTER');

    cy.get('ul[role*="listbox"]').find('li').eq(5).should('have.attr', 'data-value', 'BROTHER');

    cy.get('ul[role*="listbox"]').find('li').eq(6).should('have.attr', 'data-value', 'COUSIN');

    cy.get('ul[role*="listbox"]').find('li').eq(7).should('have.attr', 'data-value', 'WIFE');

    cy.get('ul[role*="listbox"]').find('li').eq(8).should('have.attr', 'data-value', 'HUSBAND');
  });

  it('Does not show name in HeroBanner until Relation.ME is established', () => {
    cy.get('[data-cypress="HeroBanner"]')
      .contains('hello there')
      .should('exist')
      .contains(janeNoRelation.firstName!)
      .should('not.exist');
  });
});

describe('UpdatePatient (multiple, without uhids)', () => {
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
    cy.get('[data-cypress="NewProfile"]').find('button[type="submit"]').should('be.disabled');
  });

  const checkInvalidDob = () => {
    cy.contains('Invalid date of birth').should('exist');
    cy.get('[data-cypress="NewProfile"]')
      .find('form')
      .find('button[type="submit"]')
      .should('be.disabled');
  };

  const enterDob = (dob: string) => {
    cy.get('[data-cypress="NewProfile"]')
      .find('form')
      .find('input[name="dateOfBirth"]')
      .clear()
      .type(dob)
      .blur();
  };

  it("Won't allow non-dates to be submitted in dateOfBirth field", () => {
    enterDob('test');
    checkInvalidDob();
  });

  it("Won't allow future dates to be submitted in the dateOfBirth field", () => {
    enterDob('01/01/2099');
    checkInvalidDob();
  });

  it("Won't allow impossible dates to be submitted in the dateOfBirth field", () => {
    enterDob('31/02/2001');
    checkInvalidDob();
  });

  it("Won't validate DOB until input is blurred once", () => {
    cy.get('[data-cypress="NewProfile"]')
      .find('form')
      .find('input[name="dateOfBirth"]')
      .clear()
      .type('01/01/2099');

    cy.get('[data-cypress="NewProfile"]')
      .find('form')
      .find('button[type="submit"]')
      .should('be.disabled');

    cy.contains('Invalid date of birth').should('not.exist');

    cy.get('[data-cypress="NewProfile"]').find('form').find('input[name="dateOfBirth"]').blur();

    cy.contains('Invalid date of birth').should('exist');
  });

  it('Will allow possible dates in the dateOfBirth field', () => {
    enterDob('31/01/2001');
    cy.get('[data-cypress="NewProfile"]')
      .find('form')
      .find('button[type="submit"]')
      .should('be.enabled');
    cy.contains('Invalid date of birth').should('not.exist');
  });

  it('Should allow single quotation marks to be added within first and last names', () => {
    const validNames = ["Sumeet'h", "D'Souza", "D'Souza", "D'S'ouza"];

    validNames.forEach((name) => {
      cy.get('[data-cypress="NewProfile"]').find('input[name*="firstName"]').clear().type(name);

      cy.get('[data-cypress="NewProfile"]').find('button[type="submit"]').should('not.be.disabled');
    });
  });

  it('Should forbid quotation marks to be added consecutively, or at the beginning or end of a name', () => {
    const invalidNames = [
      "'",
      "''",
      "'Sumeeth",
      "Sumeeth'",
      "D''souza",
      "Sumeeth '",
      "Sumeeth ''",
      "Kumar'",
      "K''umar",
    ];

    invalidNames.forEach((name) => {
      cy.get('[data-cypress="NewProfile"]').find('input[name*="firstName"]').clear().type(name);

      cy.get('[data-cypress="NewProfile"]').find('button[type="submit"]').should('be.disabled');
    });
  });

  it('Should update the patient', () => {
    const janeTheMan = {
      ...janeNoRelation,
      firstName: "Jane The 'Man",
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

    cy.get('[data-cypress="NewProfile"]').find('button[value="MALE"]').click();

    cy.get('[data-cypress="NewProfile"]')
      .find(`input[value="${janeNoRelation.firstName!}"]`)
      .clear()
      .type(janeTheMan.firstName!);

    cy.get('[data-cypress="NewProfile"]').find('button[type="submit"]').click();

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

  it('Should allow single quotation marks to be added within first and last names', () => {
    const validNames = ["Sumeet'h", "D'Souza", "D'Souza", "D'S'ouza"];

    validNames.forEach((name) => {
      cy.get('[data-cypress="NewProfile"]').find('input[name*="firstName"]').clear().type(name);

      cy.get('[data-cypress="NewProfile"]').find('button[type="submit"]').should('not.be.disabled');
    });
  });

  it('Should forbid quotation marks to be added consecutively, or at the beginning or end of a name', () => {
    const invalidNames = [
      "'",
      "''",
      "'Sumeeth",
      "Sumeeth'",
      "D''souza",
      "Sumeeth '",
      "Sumeeth ''",
      "Kumar'",
      "K''umar",
    ];

    invalidNames.forEach((name) => {
      cy.get('[data-cypress="NewProfile"]').find('input[name*="firstName"]').clear().type(name);

      cy.get('[data-cypress="NewProfile"]').find('button[type="submit"]').should('be.disabled');
    });
  });
});

describe('UpdatePatient (single, without uhids)', () => {
  const patient = [janeNoRelation];

  beforeEach(() => {
    cy.signIn(patient);
    cy.visitAph(clientRoutes.welcome()).wait(500);
  });

  it('Status should autofill to Relation.ME, as indicated in welcome banner', () => {
    cy.get('[data-cypress="HeroBanner"]').click({ force: true });
    cy.should('contain', patient[0].firstName!.toLowerCase());
  });

  it('Email validity should not be tested until submit button is blurred', () => {
    cy.get('input[name="emailAddress"]').scrollIntoView().clear().type('test@test...');

    cy.contains('Invalid email address').should('not.exist');

    cy.get('[data-cypress="NewProfile"]').find('button[type="submit"]').should('be.disabled');

    cy.get('input[name="emailAddress"]').blur();

    cy.contains('Invalid email address').should('exist');
  });

  it('A valid email should have an enabled submit button', () => {
    cy.get('input[name="emailAddress"]').scrollIntoView().clear().type('test@test.com').blur();

    cy.get('[data-cypress="NewProfile"]').find('button[type="submit"]').should('be.enabled');

    cy.contains('Invalid email address').should('not.exist');
  });
});
