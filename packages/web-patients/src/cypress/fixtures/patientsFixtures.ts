import { QueryResultFixture } from 'cypress/types/queryFixtureTypes';
import { GetPatients } from 'graphql/types/GetPatients';
import { Gender, Relation } from 'graphql/types/globalTypes';

export const getPatientsFixture: QueryResultFixture<GetPatients> = () => {
  return {
    data: {
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
    },
  };
};
