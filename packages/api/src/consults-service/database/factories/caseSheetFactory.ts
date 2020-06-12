import {
  CaseSheet,
  CaseSheetSymptom,
  CaseSheetMedicinePrescription,
  MEDICINE_TIMINGS,
  MEDICINE_TO_BE_TAKEN,
  CaseSheetDiagnosis,
  CaseSheetDiagnosisPrescription,
  CaseSheetOtherInstruction,
  APPOINTMENT_TYPE,
  MEDICINE_UNIT,
  MEDICINE_CONSUMPTION_DURATION,
  MEDICINE_FREQUENCY,
  MEDICINE_FORM_TYPES,
} from 'consults-service/entities';
import faker from 'faker';
import _random from 'lodash/random';
import _sample from 'lodash/sample';
import _times from 'lodash/times';
import { randomEnum } from 'helpers/factoryHelpers';
import { ROUTE_OF_ADMINISTRATION } from 'doctors-service/entities';

const buildSymptom = (): CaseSheetSymptom => {
  const names = ['fever', 'cough and cold'];
  const howOftens = ['nights', 'days', 'mornings', 'all day, even while sleeping'];
  const severities = ['high (102)', 'spots of blood'];
  return {
    symptom: _sample(names) as string,
    since: `last ${_random(2, 10)} ${_sample(['days', 'weeks', 'months'])}`,
    howOften: _sample(howOftens) as string,
    severity: _sample(severities) as string,
    details: 'dont know',
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
    medicineUnit: randomEnum(MEDICINE_UNIT),
    medicineInstructions: faker.random.boolean ? faker.lorem.sentences(_random(1, 5)) : undefined,
    medicineTimings: _times(timesPerDay, () => randomEnum(MEDICINE_TIMINGS)),
    medicineToBeTaken: _times(timesPerDay, () => randomEnum(MEDICINE_TO_BE_TAKEN)),
    medicineConsumptionDuration: '',
    medicineConsumptionDurationUnit: randomEnum(MEDICINE_CONSUMPTION_DURATION),
    medicineFrequency: randomEnum(MEDICINE_FREQUENCY),
    medicineFormTypes: randomEnum(MEDICINE_FORM_TYPES),
    routeOfAdministration: randomEnum(ROUTE_OF_ADMINISTRATION),
    medicineCustomDosage: '1-0-0-1',
  };
};

const buildDiagnosis = (): CaseSheetDiagnosis => {
  const names = ['Viral Fever', 'Throat Infection'];
  const name = _sample(names) as string;
  return { name };
};

const buildDiagnosisPrescription = (): CaseSheetDiagnosisPrescription => ({
  itemname: faker.commerce.productName(),
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
  const diagnosisPrescription = _times(_random(0, 3), () => buildDiagnosisPrescription());
  const otherInstructions = _times(_random(0, 5), () => buildOtherInstruction());
  const medicinePrescriptions = _times(_random(0, 8), () => buildMedicinePrescription());
  const symptoms = _times(_random(0, 5), () => buildSymptom());
  caseSheet.notes = notes;
  caseSheet.diagnosis = (diagnosis as unknown) as string;
  caseSheet.diagnosticPrescription = (diagnosisPrescription as unknown) as string;
  caseSheet.followUp = faker.random.boolean();
  caseSheet.followUpAfterInDays = _random(1, 60);
  caseSheet.otherInstructions = (otherInstructions as unknown) as string;
  caseSheet.medicinePrescription = (medicinePrescriptions as unknown) as string;
  caseSheet.symptoms = (symptoms as unknown) as string;
  caseSheet.consultType = randomEnum(APPOINTMENT_TYPE);
  return Object.assign(caseSheet, attrs);
};
