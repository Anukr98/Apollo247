import { RxPdfData } from 'consults-service/entities/index';
import { convertCaseSheetToRxPdfData } from 'consults-service/rxPdfGenerator';
import { buildCaseSheet } from 'consults-service/database/factories/caseSheetFactory';
import _capitalize from 'lodash/capitalize';
import _compact from 'lodash/compact';
import _times from 'lodash/times';
import _random from 'lodash/random';
import faker from 'faker';

export const buildRxPdfData = (): RxPdfData => {
  const caseSheet = buildCaseSheet();
  const { prescriptions } = convertCaseSheetToRxPdfData(caseSheet);

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

  return { prescriptions, generalAdvice, diagnoses };
};
