import gql from 'graphql-tag';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { MedicineOrdersRepository } from 'profiles-service/repositories/MedicineOrdersRepository';
import { Resolver } from 'api-gateway';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { getDspStatus } from 'profiles-service/helpers/inventorySync';
import { DspStatusRespBody, DspStatusResp } from 'types/inventorySync';

export const orderDspStatusTypeDefs = gql`
  type orderDspStatusResult {
    ALLOCATE_DSP: String
    CHANGE_DSP: String
    ORDER_UPDATE: String
  }

  extend type Mutation {
    orderDspStatus(orderId: Int!): orderDspStatusResult!
  }
`;

const orderDspStatus: Resolver<
  null,
  { orderId: number },
  ProfilesServiceContext,
  DspStatusResp
> = async (parent, { orderId }, { profilesDb }) => {
  console.log(orderId);
  const medicineOrdersRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
  const orderDetails = await medicineOrdersRepo.getMedicineOrderWithShipments(orderId);
  if (!orderDetails) {
    throw new AphError(AphErrorMessages.INVALID_MEDICINE_ORDER_ID, undefined, {});
  }

  const dspStatus: DspStatusRespBody = await getDspStatus(orderId);
  if (dspStatus.errorCode != 0) {
    throw new AphError(AphErrorMessages.INTERNAL_SERVER_ERROR, undefined, {});
  }
  return dspStatus.response;
};

export const orderDspStatusResolvers = {
  Mutation: {
    orderDspStatus,
  },
};
