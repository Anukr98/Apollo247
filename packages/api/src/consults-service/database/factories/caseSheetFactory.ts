import { CaseSheet } from 'consults-service/entities';
import faker from 'faker';
import _random from 'lodash/random';
import _sample from 'lodash/sample';
import _times from 'lodash/times';
import { randomEnum } from 'helpers/factoryHelpers';

enum MEDICINE_TIMINGS {
  EVENING = 'EVENING',
  MORNING = 'MORNING',
  NIGHT = 'NIGHT',
  NOON = 'NOON',
}
enum MEDICINE_TO_BE_TAKEN {
  AFTER_FOOD = 'AFTER_FOOD',
  BEFORE_FOOD = 'BEFORE_FOOD',
}
export type CaseSheetMedicinePrescription = {
  id: string;
  externalId: string;
  medicineConsumptionDurationInDays: number;
  medicineDosage: string;
  medicineInstructions?: string;
  medicineTimings: MEDICINE_TIMINGS[];
  medicineToBeTaken: MEDICINE_TO_BE_TAKEN[];
  medicineName: string;
};
export type CaseSheetDiagnosis = { name: string };
export type CaseSheetDiagnosisPrescription = { name: string };
export type CaseSheetOtherInstruction = { instruction: string };
export type CaseSheetSymptom = {
  symptom: string;
  since: string;
  howOften: string;
  severity: string;
};

const buildSymptom = (): CaseSheetSymptom => {
  const names = ['fever', 'cough and cold'];
  const howOftens = ['nights', 'days', 'mornings', 'all day, even while sleeping'];
  const severities = ['high (102)', 'spots of blood'];
  return {
    symptom: _sample(names) as string,
    since: `last ${_random(2, 10)} ${_sample(['days', 'weeks', 'months'])}`,
    howOften: _sample(howOftens) as string,
    severity: _sample(severities) as string,
  };
};

const buildMedicinePrescription = (): CaseSheetMedicinePrescription => {
  const timesPerDay = _random(1, 3);
  return {
    id: faker.random.uuid(),
    externalId: faker.random.uuid(),
    medicineName: faker.commerce.productName(),
    medicineConsumptionDurationInDays: _random(3, 20),
    medicineDosage: `${timesPerDay} times/day`,
    medicineInstructions: faker.random.boolean ? faker.lorem.sentences(_random(1, 5)) : undefined,
    medicineTimings: _times(timesPerDay, () => randomEnum(MEDICINE_TIMINGS)),
    medicineToBeTaken: _times(timesPerDay, () => randomEnum(MEDICINE_TO_BE_TAKEN)),
  };
};

const buildDiagnosis = (): CaseSheetDiagnosis => {
  const names = ['Viral Fever', 'Throat Infection'];
  const name = _sample(names) as string;
  return { name };
};

const buildDiagnosisPrescription = (): CaseSheetDiagnosisPrescription => ({
  name: faker.commerce.productName(),
});

const buildOtherInstruction = (): CaseSheetOtherInstruction => {
  const instructions = ['Drink plenty of water', 'Use sunscreen every day'];
  const instruction = _sample(instructions) as string;
  return { instruction };
};

export const buildCaseSheet = (attrs?: Partial<CaseSheet>) => {
  const caseSheet = new CaseSheet();
  const notes = faker.lorem.sentences(_random(0, 8));
  const diagnosis = _times(_random(0, 3), () => buildDiagnosis());
  const diagnosisPrescriptions = _times(_random(0, 3), () => buildDiagnosisPrescription());
  const otherInstructions = _times(_random(0, 5), () => buildOtherInstruction());
  const medicinePrescriptions = _times(_random(2, 10), () => buildMedicinePrescription());
  const symptoms = _times(_random(0, 5), () => buildSymptom());
  caseSheet.notes = notes;
  caseSheet.diagnosis = JSON.stringify(diagnosis);
  caseSheet.diagnosticPrescription = JSON.stringify(diagnosisPrescriptions);
  caseSheet.followUp = faker.random.boolean();
  caseSheet.followUpAfterInDays = _random(1, 60);
  caseSheet.otherInstructions = JSON.stringify(otherInstructions);
  caseSheet.medicinePrescription = JSON.stringify(medicinePrescriptions);
  caseSheet.symptoms = JSON.stringify(symptoms);
  return Object.assign(caseSheet, attrs);
};
