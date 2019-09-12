import gql from 'graphql-tag';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { MedicineOrdersRepository } from 'profiles-service/repositories/MedicineOrdersRepository';
import { MEDICINE_ORDER_STATUS, MedicineOrdersStatus } from 'profiles-service/entities';
import { Resolver } from 'api-gateway';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

export const pharmaOrderConfirmationTypeDefs = gql`
  input OrderConfimrationInput {
    ordersResult: OrderResult
  }

  input OrderResult {
    message: String
    apOrderNo: String
    orderNo: Int
    siteId: String
    status: String
  }

  type OrderConfirmationResult {
    requestStatus: String
    requestMessage: String
  }

  extend type Mutation {
    saveOrderConfirmation(orderConfimrationInput: OrderConfimrationInput): OrderConfirmationResult!
  }
`;

type OrderConfimrationInput = {
  ordersResult: OrderResult;
};

type OrderResult = {
  message: string;
  apOrderNo: string;
  orderNo: number;
  siteId: string;
  status: string;
};

type OrderConfirmationResult = {
  requestStatus: string;
  requestMessage: string;
};
type saveOrderConfirmationInputArgs = {
  orderConfimrationInput: OrderConfimrationInput;
};

const saveOrderConfirmation: Resolver<
  null,
  saveOrderConfirmationInputArgs,
  ProfilesServiceContext,
  OrderConfirmationResult
> = async (parent, { orderConfimrationInput }, { profilesDb }) => {
  const medicineOrdersRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
  const orderDetails = await medicineOrdersRepo.getMedicineOrderDetails(
    orderConfimrationInput.ordersResult.orderNo
  );
  if (!orderDetails) {
    throw new AphError(AphErrorMessages.INVALID_MEDICINE_ORDER_ID, undefined, {});
  }

  const orderStatusAttrs: Partial<MedicineOrdersStatus> = {
    orderStatus: MEDICINE_ORDER_STATUS.ORDER_CONFIRMED,
    medicineOrders: orderDetails,
    statusDate: new Date(),
    statusMessage: orderConfimrationInput.ordersResult.message,
  };
  await medicineOrdersRepo.saveMedicineOrderStatus(orderStatusAttrs, orderDetails.orderAutoId);
  await medicineOrdersRepo.updateMedicineOrderDetails(
    orderDetails.id,
    orderDetails.orderAutoId,
    new Date(),
    MEDICINE_ORDER_STATUS.ORDER_CONFIRMED
  );

  await medicineOrdersRepo.updateOrderFullfillment(
    orderDetails.orderAutoId,
    orderDetails.id,
    orderConfimrationInput.ordersResult.apOrderNo
  );

  return { requestStatus: 'true', requestMessage: 'order confirmation updated succssfully' };
};

export const pharmaOrderConfirmationResolvers = {
  Mutation: {
    saveOrderConfirmation,
  },
};
