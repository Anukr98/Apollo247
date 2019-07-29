import { QueryResultFixture } from 'cypress/types/queryFixtureTypes';
import { GetCurrentPatients } from 'graphql/types/GetCurrentPatients';
import { GetPatients } from 'graphql/types/GetPatients';
import { Gender, Relation } from 'graphql/types/globalTypes';

export const getCurrentPatientsFixture: QueryResultFixture<GetCurrentPatients> = () => {
  return {
    getCurrentPatients: {
      __typename: 'GetCurrentPatientsResult',
      patients: [
        {
          __typename: 'Patient',
          id: '1',
          uhid: '',
          firstName: 'Jane',
          lastName: 'Doe',
          gender: Gender.FEMALE,
          mobileNumber: '+91123456789',
          relation: Relation.ME,
          dateOfBirth: '01/01/1999',
          emailAddress: '',
        },
        {
          __typename: 'Patient',
          id: '2',
          uhid: '',
          firstName: 'John',
          lastName: 'Doe',
          gender: Gender.MALE,
          mobileNumber: '+91123456789',
          relation: Relation.BROTHER,
          dateOfBirth: '01/01/1999',
          emailAddress: '',
        },
      ],
    },
  };
};

export const getPatientsFixture: QueryResultFixture<GetPatients> = () => {
  return {
    getPatients: {
      __typename: 'GetPatientsResult',
      patients: [
        {
          __typename: 'Patient',
          id: '1',
          uhid: '',
          firstName: 'Jane',
          lastName: 'Doe',
          gender: Gender.FEMALE,
          mobileNumber: '+91123456789',
          relation: Relation.ME,
          dateOfBirth: '01/01/1999',
        },
      ],
    },
  };
};
