import { RxPdfData } from 'consults-service/entities/index';
//import { convertCaseSheetToRxPdfData } from 'consults-service/rxPdfGenerator';
//import { buildCaseSheet } from 'consults-service/database/factories/caseSheetFactory';
import _capitalize from 'lodash/capitalize';
import _compact from 'lodash/compact';
import _times from 'lodash/times';
import _random from 'lodash/random';
import faker from 'faker';
import { randomEnum } from 'helpers/factoryHelpers';
import { Salutation } from 'doctors-service/entities';

export const buildRxPdfData = (): RxPdfData => {
  //const caseSheet = buildCaseSheet();
  const prescriptions = [{ name: '', ingredients: [], frequency: '', instructions: '' }];

  const generalAdvice = _times(_random(0, 5), () => ({
    title: faker.commerce.productName(),
    description: _compact(
      faker.lorem
        .sentences(_random(0, 5))
        .split('.')
        .map((s) => s.trim())
    ),
  }));

  const diagnoses = _times(_random(0, 5), () => ({
    title: faker.commerce.productName(),
    description: faker.random.boolean() ? _capitalize(faker.lorem.words(_random(2, 10))) : '',
  }));

  const doctorInfo = {
    salutation: _capitalize(randomEnum(Salutation)),
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    qualifications: _capitalize(faker.lorem.words(_random(2, 10))),
    registrationNumber: faker.random.alphaNumeric(8).toUpperCase(),
  };

  const hospitalAddress = {
    name: '',
    streetLine1: '',
    streetLine2: '',
    city: '',
    zipcode: '',
    state: '',
    country: '',
  };

  return { prescriptions, generalAdvice, diagnoses, doctorInfo, hospitalAddress };
};
