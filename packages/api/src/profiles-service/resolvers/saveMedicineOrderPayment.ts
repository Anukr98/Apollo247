import gql from 'graphql-tag';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { MedicineOrdersRepository } from 'profiles-service/repositories/MedicineOrdersRepository';
import {
  MEDICINE_ORDER_PAYMENT_TYPE,
  MedicineOrderPayments,
  MEDICINE_ORDER_STATUS,
  MedicineOrdersStatus,
} from 'profiles-service/entities';
import { Resolver } from 'api-gateway';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

export const saveMedicineOrderPaymentTypeDefs = gql`
  enum MEDICINE_ORDER_PAYMENT_TYPE {
    COD
    ONLINE
    NO_PAYMENT
  }

  input MedicinePaymentInput {
    orderId: String
    orderAutoId: Int
    paymentType: MEDICINE_ORDER_PAYMENT_TYPE
    amountPaid: Float
    paymentRefId: String
    paymentStatus: String
    paymentDateTime: DateTime
    responseCode: String
    responseMessage: String
    bankTxnId: String
  }

  type SaveMedicineOrderPaymentResult {
    errorCode: Int
    errorMessage: String
    paymentOrderId: ID!
    orderStatus: MEDICINE_ORDER_STATUS
  }

  extend type Mutation {
    SaveMedicineOrderPayment(
      medicinePaymentInput: MedicinePaymentInput
    ): SaveMedicineOrderPaymentResult!
  }
`;

type MedicinePaymentInput = {
  orderId: string;
  orderAutoId: number;
  paymentType: MEDICINE_ORDER_PAYMENT_TYPE;
  amountPaid: number;
  paymentRefId: string;
  paymentStatus: string;
  paymentDateTime: Date;
  responseCode: string;
  responseMessage: string;
  bankTxnId: string;
};

type SaveMedicineOrderResult = {
  errorCode: number;
  errorMessage: string;
  paymentOrderId: string;
  orderStatus: MEDICINE_ORDER_STATUS;
};

type MedicinePaymentInputArgs = { medicinePaymentInput: MedicinePaymentInput };

const SaveMedicineOrderPayment: Resolver<
  null,
  MedicinePaymentInputArgs,
  ProfilesServiceContext,
  SaveMedicineOrderResult
> = async (parent, { medicinePaymentInput }, { profilesDb }) => {
  const errorCode = 0,
    errorMessage = '';
  const medicineOrdersRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
  const orderDetails = await medicineOrdersRepo.getMedicineOrderDetails(
    medicinePaymentInput.orderAutoId
  );
  if (!orderDetails) {
    throw new AphError(AphErrorMessages.INVALID_MEDICINE_ORDER_ID, undefined, {});
  }
  const paymentAttrs: Partial<MedicineOrderPayments> = {
    medicineOrders: orderDetails,
    paymentDateTime: medicinePaymentInput.paymentDateTime,
    paymentStatus: medicinePaymentInput.paymentStatus,
    paymentType: medicinePaymentInput.paymentType,
    amountPaid: medicinePaymentInput.amountPaid,
    paymentRefId: medicinePaymentInput.paymentRefId,
    responseCode: medicinePaymentInput.responseCode,
    responseMessage: medicinePaymentInput.responseMessage,
    bankTxnId: medicinePaymentInput.bankTxnId,
  };
  const savePaymentDetails = await medicineOrdersRepo.saveMedicineOrderPayment(paymentAttrs);
  if (savePaymentDetails) {
    const orderStatusAttrs: Partial<MedicineOrdersStatus> = {
      orderStatus: MEDICINE_ORDER_STATUS.ORDER_PLACED,
      medicineOrders: orderDetails,
      statusDate: new Date(),
    };
    await medicineOrdersRepo.saveMedicineOrderStatus(orderStatusAttrs);
  }

  return {
    errorCode,
    errorMessage,
    paymentOrderId: savePaymentDetails.id,
    orderStatus: MEDICINE_ORDER_STATUS.ORDER_PLACED,
  };
};

export const saveMedicineOrderPaymentResolvers = {
  Mutation: {
    SaveMedicineOrderPayment,
  },
};
