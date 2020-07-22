import gql from 'graphql-tag';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { MedicineOrdersRepository } from 'profiles-service/repositories/MedicineOrdersRepository';
import { MEDICINE_ORDER_STATUS, MedicineOrdersStatus } from 'profiles-service/entities';
import { Resolver } from 'api-gateway';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

export const pharmaOrderCancelledTypeDefs = gql`
  input OrderCancelInput {
    orderNo: Int
    remarksCode: String
  }

  type OrderCancelResult {
    requestStatus: String
    requestMessage: String
  }

  extend type Mutation {
    saveOrderCancelStatus(orderCancelInput: OrderCancelInput): OrderCancelResult!
  }
`;

type OrderCancelInput = {
  orderNo: number;
  remarksCode: string;
};

type OrderCancelResult = {
  requestStatus: string;
  requestMessage: string;
};
type orderCancelInputArgs = {
  orderCancelInput: OrderCancelInput;
};

const saveOrderCancelStatus: Resolver<
  null,
  orderCancelInputArgs,
  ProfilesServiceContext,
  OrderCancelResult
> = async (parent, { orderCancelInput }, { profilesDb }) => {
  const medicineOrdersRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
  const orderDetails = await medicineOrdersRepo.getMedicineOrder(orderCancelInput.orderNo);
  if (!orderDetails) {
    throw new AphError(AphErrorMessages.INVALID_MEDICINE_ORDER_ID, undefined, {});
  }

  const orderStatusAttrs: Partial<MedicineOrdersStatus> = {
    orderStatus: MEDICINE_ORDER_STATUS.CANCELLED,
    medicineOrders: orderDetails,
    statusDate: new Date(),
    statusMessage: orderCancelInput.remarksCode,
  };
  await medicineOrdersRepo.saveMedicineOrderStatus(orderStatusAttrs, orderDetails.orderAutoId);
  await medicineOrdersRepo.updateMedicineOrderDetails(
    orderDetails.id,
    orderDetails.orderAutoId,
    new Date(),
    MEDICINE_ORDER_STATUS.CANCELLED
  );

  return { requestStatus: 'true', requestMessage: 'Cancel status updated succssfully' };
};

export const pharmaOrderCancelResolvers = {
  Mutation: {
    saveOrderCancelStatus,
  },
};
