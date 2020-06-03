import gql from 'graphql-tag';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { MedicineOrdersRepository } from 'profiles-service/repositories/MedicineOrdersRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { Resolver } from 'api-gateway';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { ONE_APOLLO_STORE_CODE } from 'profiles-service/entities';

export const getOneApolloUserTypeDefs = gql`
  type UserDetailResponse {
    name: String!
    earnedHC: Int!
    availableHC: Int!
    tier: String!
  }
  extend type Query {
    getOneApolloUser(patientId: String): UserDetailResponse
  }
`;

type UserDetailResponse = {
  name: string;
  earnedHC: number;
  availableHC: number;
  tier: string;
};

const getOneApolloUser: Resolver<
  null,
  { patientId: string },
  ProfilesServiceContext,
  UserDetailResponse
> = async (parent, args, { mobileNumber, profilesDb }) => {
  const mobNumberIN = mobileNumber.slice(3);

  const medOrdersRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
  let response = await medOrdersRepo.getOneApolloUser(mobNumberIN);
  if (!response.Success) {
    const patientRepo = profilesDb.getCustomRepository(PatientRepository);
    const patient = await patientRepo.findById(args.patientId);
    if (patient) {
      let storeCode: ONE_APOLLO_STORE_CODE = ONE_APOLLO_STORE_CODE.WEBCUS;
      if (patient.iosVersion) {
        storeCode = ONE_APOLLO_STORE_CODE.IOSCUS;
      }
      if (patient.androidVersion) {
        storeCode = ONE_APOLLO_STORE_CODE.ANDCUS;
      }
      const userCreateResponse = await medOrdersRepo.createOneApolloUser({
        FirstName: patient.firstName,
        LastName: patient.lastName,
        BusinessUnit: <string>process.env.ONEAPOLLO_BUSINESS_UNIT,
        MobileNumber: mobNumberIN,
        Gender: patient.gender,
        StoreCode: storeCode,
      });
      if (userCreateResponse.Success) {
        response = await medOrdersRepo.getOneApolloUser(mobNumberIN);
        if (!response.Success) {
          throw new AphError(response.Message, undefined, {});
        }
      } else {
        throw new AphError(userCreateResponse.Message, undefined, {});
      }
    } else {
      throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
    }
  }
  return {
    name: response.CustomerData.Name,
    earnedHC: response.CustomerData.EarnedCredits,
    availableHC: response.CustomerData.AvailableCredits,
    tier: response.CustomerData.Tier,
  };
};
export const getOneApolloUserResolvers = {
  Query: {
    getOneApolloUser,
  },
};
