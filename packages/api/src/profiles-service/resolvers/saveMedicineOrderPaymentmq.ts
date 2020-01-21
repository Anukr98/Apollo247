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
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { ServiceBusService } from 'azure-sb';

export const saveMedicineOrderPaymentMqTypeDefs = gql`
  input MedicinePaymentMqInput {
    orderId: String!
    orderAutoId: Int!
    paymentType: MEDICINE_ORDER_PAYMENT_TYPE!
    amountPaid: Float!
    paymentRefId: String
    paymentStatus: String
    paymentDateTime: DateTime
    responseCode: String
    responseMessage: String
    bankTxnId: String
  }

  type SaveMedicineOrderPaymentMqResult {
    errorCode: Int
    errorMessage: String
    paymentOrderId: ID!
    orderStatus: MEDICINE_ORDER_STATUS
  }

  extend type Mutation {
    SaveMedicineOrderPaymentMq(
      medicinePaymentMqInput: MedicinePaymentMqInput
    ): SaveMedicineOrderPaymentMqResult!
  }
`;

type MedicinePaymentMqInput = {
  orderId: string;
  orderAutoId: number;
  paymentType: MEDICINE_ORDER_PAYMENT_TYPE;
  amountPaid: number;
  paymentRefId: string;
  paymentStatus: string;
  paymentDateTime?: Date;
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

type MedicinePaymentInputArgs = { medicinePaymentMqInput: MedicinePaymentMqInput };

const SaveMedicineOrderPaymentMq: Resolver<
  null,
  MedicinePaymentInputArgs,
  ProfilesServiceContext,
  SaveMedicineOrderResult
> = async (parent, { medicinePaymentMqInput }, { profilesDb }) => {
  let errorCode = 0,
    errorMessage = '',
    orderStatus: MEDICINE_ORDER_STATUS = MEDICINE_ORDER_STATUS.QUOTE,
    paymentOrderId = '';
  const medicineOrdersRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
  const orderDetails = await medicineOrdersRepo.getMedicineOrderDetails(
    medicinePaymentMqInput.orderAutoId
  );
  if (!orderDetails) {
    throw new AphError(AphErrorMessages.INVALID_MEDICINE_ORDER_ID, undefined, {});
  }
  let currentStatus = MEDICINE_ORDER_STATUS.PAYMENT_SUCCESS;
  if (medicinePaymentMqInput.paymentType == MEDICINE_ORDER_PAYMENT_TYPE.COD) {
    medicinePaymentMqInput.paymentDateTime = new Date();
    currentStatus = MEDICINE_ORDER_STATUS.ORDER_INITIATED;
  }
  if (medicinePaymentMqInput.paymentType == MEDICINE_ORDER_PAYMENT_TYPE.COD) {
    medicinePaymentMqInput.paymentDateTime = new Date();
  }
  const paymentAttrs: Partial<MedicineOrderPayments> = {
    medicineOrders: orderDetails,
    paymentDateTime: medicinePaymentMqInput.paymentDateTime,
    paymentStatus: medicinePaymentMqInput.paymentStatus,
    paymentType: medicinePaymentMqInput.paymentType,
    amountPaid: medicinePaymentMqInput.amountPaid,
    paymentRefId: medicinePaymentMqInput.paymentRefId,
    responseCode: medicinePaymentMqInput.responseCode,
    responseMessage: medicinePaymentMqInput.responseMessage,
    bankTxnId: medicinePaymentMqInput.bankTxnId,
  };
  const savePaymentDetails = await medicineOrdersRepo.saveMedicineOrderPayment(paymentAttrs);
  if (!savePaymentDetails) {
    throw new AphError(AphErrorMessages.INVALID_MEDICINE_ORDER_ID, undefined, {});
  }

  const patientRepo = profilesDb.getCustomRepository(PatientRepository);
  const patientDetails = await patientRepo.findById(orderDetails.patient.id);
  if (!patientDetails) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }

  let statusMsg = '';
  if (medicinePaymentMqInput.paymentStatus == 'TXN_FAILURE') {
    currentStatus = MEDICINE_ORDER_STATUS.PAYMENT_FAILED;
    errorCode = -1;
    errorMessage = 'Payment failed';
    paymentOrderId = savePaymentDetails.id;
    orderStatus = currentStatus;
    statusMsg = 'order payment failed';
  } else {
    errorCode = 0;
    errorMessage = '';
    paymentOrderId = savePaymentDetails.id;
    orderStatus = currentStatus;
    statusMsg = 'order payment done successfully';
  }
  const orderStatusAttrs: Partial<MedicineOrdersStatus> = {
    orderStatus: currentStatus,
    medicineOrders: orderDetails,
    statusDate: new Date(),
    statusMessage: statusMsg,
  };
  await medicineOrdersRepo.saveMedicineOrderStatus(orderStatusAttrs, orderDetails.orderAutoId);
  await medicineOrdersRepo.updateMedicineOrderDetails(
    orderDetails.id,
    orderDetails.orderAutoId,
    new Date(),
    currentStatus
  );

  //medicine order in queue starts
  if (medicinePaymentMqInput.paymentStatus != 'TXN_FAILURE') {
    const serviceBusConnectionString = process.env.AZURE_SERVICE_BUS_CONNECTION_STRING;
    const azureServiceBus = new ServiceBusService(serviceBusConnectionString);
    const queueName = process.env.AZURE_SERVICE_BUS_QUEUE_NAME
      ? process.env.AZURE_SERVICE_BUS_QUEUE_NAME
      : '';
    azureServiceBus.createTopicIfNotExists(queueName, (topicError) => {
      if (topicError) {
        console.log('topic create error', topicError);
      }
      console.log('connected to topic', queueName);
      const message = 'MEDICINE_ORDER:' + orderDetails.orderAutoId + ':' + patientDetails.id;
      azureServiceBus.sendTopicMessage(queueName, message, (sendMsgError) => {
        if (sendMsgError) {
          console.log('send message error', sendMsgError);
        }
        console.log('message sent to topic');
      });
    });
  }
  //medicine order in queue ends

  return {
    errorCode,
    errorMessage,
    paymentOrderId,
    orderStatus,
  };
};

export const saveMedicineOrderPaymentMqResolvers = {
  Mutation: {
    SaveMedicineOrderPaymentMq,
  },
};
