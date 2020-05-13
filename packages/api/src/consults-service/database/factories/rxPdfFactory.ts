import { RxPdfData } from 'consults-service/entities/index';
import _capitalize from 'lodash/capitalize';
import _random from 'lodash/random';
import faker from 'faker';
import { randomEnum } from 'helpers/factoryHelpers';
import { Salutation } from 'doctors-service/entities';

export const buildRxPdfData = (): RxPdfData => {
  //const caseSheet = buildCaseSheet();
  const prescriptions = [{ name: '', ingredients: [], frequency: '', instructions: '' }];

  const generalAdvice = [{ instruction: '' }];

  const diagnoses = [{ name: '' }];

  const doctorInfo = {
    salutation: _capitalize(randomEnum(Salutation)),
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    qualifications: _capitalize(faker.lorem.words(_random(2, 10))),
    registrationNumber: faker.random.alphaNumeric(8).toUpperCase(),
    specialty: '',
    signature: '',
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

  const patientInfo = {
    firstName: '',
    lastName: '',
    gender: '',
    uhid: '',
    age: '',
    email: '',
    phoneNumber: '',
  };

  const vitals = { height: '', weight: '', temperature: '', bp: '' };
  const appointmentDetails = { displayId: '', consultDate: '', consultType: '' };
  const diagnosesTests = [
    {
      itemname: '',
    },
  ];
  const caseSheetSymptoms = [{ symptom: '', since: '', howOften: '', severity: '', details: '' }];
  const followUpDetails = '';
  const referralSpecialtyName = '';
  const referralSpecialtyDescription = '';

  return {
    prescriptions,
    generalAdvice,
    diagnoses,
    doctorInfo,
    hospitalAddress,
    patientInfo,
    vitals,
    appointmentDetails,
    diagnosesTests,
    caseSheetSymptoms,
    followUpDetails,
    referralSpecialtyName,
    referralSpecialtyDescription,
  };
};
