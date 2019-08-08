import { GetCurrentPatients_getCurrentPatients_patients } from 'graphql/types/GetCurrentPatients';
import { Gender, Relation } from 'graphql/types/globalTypes';

type Patient = GetCurrentPatients_getCurrentPatients_patients;

export const janeNoRelation: Patient = {
  __typename: 'Patient',
  id: '1',
  uhid: '',
  firstName: 'Jane',
  lastName: 'Doe',
  gender: Gender.FEMALE,
  mobileNumber: '+91123456789',
  relation: null,
  dateOfBirth: '1999-01-01',
  emailAddress: '',
};

export const johnBrother: Patient = {
  __typename: 'Patient',
  id: '2',
  uhid: '',
  firstName: 'John',
  lastName: 'Doe',
  gender: Gender.MALE,
  mobileNumber: '+91123456789',
  relation: Relation.BROTHER,
  dateOfBirth: '1999-01-01',
  emailAddress: '',
};

export const jimmyCousin: Patient = {
  __typename: 'Patient',
  id: '3',
  uhid: '',
  firstName: 'Jimmy',
  lastName: 'Doe',
  gender: Gender.MALE,
  mobileNumber: '+91123456789',
  relation: Relation.COUSIN,
  dateOfBirth: '1999-01-01',
  emailAddress: '',
};

export const jeromeFather: Patient = {
  __typename: 'Patient',
  id: '4',
  uhid: '4',
  firstName: 'Jerome',
  lastName: 'Doe',
  gender: Gender.MALE,
  mobileNumber: '+91123456789',
  relation: Relation.FATHER,
  dateOfBirth: '1999-01-01',
  emailAddress: '',
};

export const jennyMother: Patient = {
  __typename: 'Patient',
  id: '5',
  uhid: '5',
  firstName: 'Jenny',
  lastName: 'Doe',
  gender: Gender.FEMALE,
  mobileNumber: '+91123456789',
  relation: Relation.MOTHER,
  dateOfBirth: '1999-01-01',
  emailAddress: '',
};

export const julieNoRelation: Patient = {
  __typename: 'Patient',
  id: '6',
  uhid: '',
  firstName: 'Julie',
  lastName: 'Doe',
  gender: Gender.FEMALE,
  mobileNumber: '+91123456789',
  relation: null,
  dateOfBirth: '1999-01-01',
  emailAddress: '',
};

export const quentinQuotes: Patient = {
  __typename: 'Patient',
  id: '7',
  uhid: '',
  firstName: "Quen'tin",
  lastName: "Quo'tes",
  gender: Gender.MALE,
  mobileNumber: '+91123456789',
  relation: Relation.ME,
  dateOfBirth: '1999-01-01',
  emailAddress: '',
};
