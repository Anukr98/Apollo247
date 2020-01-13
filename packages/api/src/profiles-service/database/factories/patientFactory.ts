import faker from 'faker/locale/en_IND'; //populates with Indian data
import { Patient, PatientAddress } from 'profiles-service/entities';
import { Relation } from 'profiles-service/entities';
import { randomEnum } from 'helpers/factoryHelpers';
import { Gender } from 'profiles-service/entities';

export const buildPatient = (attrs: Partial<Patient> = {}) => {
  const patient = new Patient();
  patient.firstName = faker.name.firstName();
  patient.lastName = faker.name.lastName();
  patient.relation = Relation.ME;
  // patient.relation = randomEnum(Relation); // for full range of Relations
  patient.gender = randomEnum(Gender);
  patient.dateOfBirth = faker.date.past(80);
  patient.emailAddress = faker.internet.email();
  patient.uhid = 'uhid-'.concat(String(faker.random.number(9999)).padStart(4, '0')); //to ensure numerical portion is 4 digits
  patient.mobileNumber = faker.phone.phoneNumber('+91##########');

  return Object.assign(patient, attrs);
};

export const buildPatientAddress = (attrs: Partial<PatientAddress> = {}) => {
  const patientAddress = new PatientAddress();
  patientAddress.addressLine1 = faker.address.streetAddress();
  patientAddress.addressLine2 = faker.address.city();
  patientAddress.zipcode = faker.address.zipCode();

  return Object.assign(patientAddress, attrs);
};

//PatientAddress attributes from /src/graphql/types/GetPatientAddressList.ts
