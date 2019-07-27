import { GetCurrentPatients_getCurrentPatients_patients } from 'graphql/types/GetCurrentPatients';
import { Gender, Relation } from 'graphql/types/globalTypes';

type Patient = GetCurrentPatients_getCurrentPatients_patients;

export const jane: Patient = {
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

export const john: Patient = {
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

export const jimmy: Patient = {
  __typename: 'Patient',
  id: '3',
  uhid: '',
  firstName: 'Jimmy',
  lastName: 'Doe',
  gender: Gender.MALE,
  mobileNumber: '+91123456789',
  relation: Relation.BROTHER,
  dateOfBirth: null,
  emailAddress: '',
};

export const jerome: Patient = {
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

export const jenny: Patient = {
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
