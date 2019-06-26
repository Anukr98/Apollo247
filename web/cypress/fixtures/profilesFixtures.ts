import { QueryResultFixture } from 'cypress/types/queryFixtureTypes';
import { GetPatients } from 'graphql/types/GetPatients';
import { Sex } from 'graphql/types/globalTypes';

export const getPatientsFixture: QueryResultFixture<GetPatients> = () => {
  return {
    data: {
      getPatients: {
        __typename: 'GetPatientsResult',
        patients: [
          {
            __typename: 'Patient',
            id: '1',
            firstName: 'John',
            lastName: 'Doe',
            sex: Sex.MALE,
            mobileNumber: '+91123456789',
          },
        ],
      },
    },
  };
};
