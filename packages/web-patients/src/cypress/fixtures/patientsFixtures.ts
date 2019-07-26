import { QueryResultFixture } from 'cypress/types/queryFixtureTypes';
import {
  GetCurrentPatients,
  GetCurrentPatients_getCurrentPatients_patients,
} from 'graphql/types/GetCurrentPatients';
import { GetPatients } from 'graphql/types/GetPatients';
import { Gender, Relation } from 'graphql/types/globalTypes';
import { UpdatePatient } from 'graphql/types/UpdatePatient';

type Patient = GetCurrentPatients_getCurrentPatients_patients;

const jane: Patient = {
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

// const john: Patient = {
//   __typename: 'Patient',
//   id: '2',
//   uhid: '',
//   firstName: 'John',
//   lastName: 'Doe',
//   gender: Gender.MALE,
//   mobileNumber: '+91123456789',
//   relation: Relation.BROTHER,
//   dateOfBirth: '1999-01-01',
//   emailAddress: '',
// };

export const getCurrentPatientsFixture: QueryResultFixture<GetCurrentPatients> = () => {
  return {
    getCurrentPatients: {
      __typename: 'GetCurrentPatientsResult',
      patients: [jane],
    },
  };
};

export const getPatientsFixture: QueryResultFixture<GetPatients> = () => {
  return {
    getPatients: {
      __typename: 'GetPatientsResult',
      patients: [jane],
    },
  };
};

export const updatePatientFixture: QueryResultFixture<UpdatePatient> = () => {
  return {
    updatePatient: {
      __typename: 'UpdatePatientResult',
      patient: {
        ...jane,
        firstName: 'Jane the man',
        gender: Gender.MALE,
      },
    },
  };
};
