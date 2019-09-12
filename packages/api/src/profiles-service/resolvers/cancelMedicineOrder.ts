import gql from 'graphql-tag';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { MedicineOrdersRepository } from 'profiles-service/repositories/MedicineOrdersRepository';
import { MEDICINE_ORDER_STATUS, MedicineOrdersStatus } from 'profiles-service/entities';
import { Resolver } from 'api-gateway';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

export const medicineOrderCancelTypeDefs = gql`
  input MedicineOrderCancelInput {
    orderNo: Int
    remarksCode: String
  }

  type MedicineOrderCancelResult {
    orderStatus: MEDICINE_ORDER_STATUS
  }

  extend type Mutation {
    cancelMedicineOrder(
      medicineOrderCancelInput: MedicineOrderCancelInput
    ): MedicineOrderCancelResult!
  }
`;

type MedicineOrderCancelInput = {
  orderNo: number;
  remarksCode: string;
};

type MedicineOrderCancelResult = {
  orderStatus: MEDICINE_ORDER_STATUS;
};
type medicineOrderCancelInputArgs = {
  medicineOrderCancelInput: MedicineOrderCancelInput;
};

const cancelMedicineOrder: Resolver<
  null,
  medicineOrderCancelInputArgs,
  ProfilesServiceContext,
  MedicineOrderCancelResult
> = async (parent, { medicineOrderCancelInput }, { profilesDb }) => {
  const medicineOrdersRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
  const orderDetails = await medicineOrdersRepo.getMedicineOrderDetails(
    medicineOrderCancelInput.orderNo
  );
  if (!orderDetails) {
    throw new AphError(AphErrorMessages.INVALID_MEDICINE_ORDER_ID, undefined, {});
  }

  const orderStatusAttrs: Partial<MedicineOrdersStatus> = {
    orderStatus: MEDICINE_ORDER_STATUS.CANCEL_REQUEST,
    medicineOrders: orderDetails,
    statusDate: new Date(),
  };
  await medicineOrdersRepo.saveMedicineOrderStatus(orderStatusAttrs, orderDetails.orderAutoId);
  await medicineOrdersRepo.updateMedicineOrderDetails(
    orderDetails.id,
    orderDetails.orderAutoId,
    new Date(),
    MEDICINE_ORDER_STATUS.CANCEL_REQUEST
  );

  return { orderStatus: MEDICINE_ORDER_STATUS.CANCEL_REQUEST };
};

export const medicineOrderCancelResolvers = {
  Mutation: {
    cancelMedicineOrder,
  },
};
