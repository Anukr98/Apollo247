import gql from 'graphql-tag';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { MedicineOrdersRepository } from 'profiles-service/repositories/MedicineOrdersRepository';
import { Resolver } from 'api-gateway';
import { MedicineOrderCancelReason } from 'profiles-service/entities';

export const getMedicineOrderCancelReasonsTypeDefs = gql`
  type MedicineOrderCancelReasonResult {
    cancellationReasons: [MedicineOrderCancelReason]
  }

  type MedicineOrderCancelReason {
    reasonCode: String
    description: String
    displayMessage: String
    isUserReason: Boolean
  }

  extend type Query {
    getMedicineOrderCancelReasons: MedicineOrderCancelReasonResult!
  }
`;

type MedicineOrderCancelReasonResult = {
  cancellationReasons: MedicineOrderCancelReason[];
};

const getMedicineOrderCancelReasons: Resolver<
  null,
  {},
  ProfilesServiceContext,
  MedicineOrderCancelReasonResult
> = async (parent, args, { profilesDb }) => {
  const medicineOrdersRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
  const cancellationReasons = await medicineOrdersRepo.getMedicineOrderCancelReasons();
  return { cancellationReasons };
};

export const getMedicineOrderCancelReasonsResolvers = {
  Query: {
    getMedicineOrderCancelReasons,
  },
};
