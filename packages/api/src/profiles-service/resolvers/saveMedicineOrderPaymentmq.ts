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
import {
  sendMedicineOrderStatusNotification,
  NotificationType,
} from 'notifications-service/resolvers/notifications';

import { medicineCOD } from 'helpers/emailTemplates/medicineCOD';
import { sendMail } from 'notifications-service/resolvers/email';
import { ApiConstants } from 'ApiConstants';
import { EmailMessage } from 'types/notificationMessageTypes';
import { log } from 'customWinstonLogger';

export const saveMedicineOrderPaymentMqTypeDefs = gql`
  enum CODCity {
    CHENNAI
  }

  input MedicinePaymentMqInput {
    orderAutoId: Int!
    paymentType: MEDICINE_ORDER_PAYMENT_TYPE!
    amountPaid: Float!
    paymentRefId: String
    refundAmount: Float
    bankName: String
    paymentStatus: String
    paymentDateTime: DateTime
    responseCode: String
    responseMessage: String
    bankTxnId: String
    email: String
    CODCity: CODCity
    orderId: String
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
  orderAutoId: number;
  paymentType: MEDICINE_ORDER_PAYMENT_TYPE;
  amountPaid: number;
  refundAmount: number;
  bankName: string;
  paymentRefId: string;
  paymentStatus: string;
  paymentDateTime?: Date;
  responseCode: string;
  responseMessage: string;
  bankTxnId: string;
  email: string;
  CODCity: CODCity;
};

enum CODCity {
  'CHENNAI' = 'CHENNAI',
}

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

  log(
    'profileServiceLogger',
    'payload received',
    'SaveMedicineOrderPaymentMq()',
    JSON.stringify(medicinePaymentMqInput),
    ''
  );

  const medicineOrdersRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
  const orderDetails = await medicineOrdersRepo.getMedicineOrderDetails(
    medicinePaymentMqInput.orderAutoId
  );
  if (!orderDetails) {
    log(
      'profileServiceLogger',
      'Invalid Order ID',
      'SaveMedicineOrderPaymentMq()',
      JSON.stringify(medicinePaymentMqInput),
      ''
    );
    throw new AphError(AphErrorMessages.INVALID_MEDICINE_ORDER_ID, undefined, {});
  }
  //get patient address
  const patientAddress = orderDetails.patient.patientAddress.filter(
    (item) => item.id === orderDetails.patientAddressId
  );

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
  if (medicinePaymentMqInput.bankName) {
    paymentAttrs.bankName = medicinePaymentMqInput.bankName;
  }

  if (medicinePaymentMqInput.refundAmount) {
    paymentAttrs.refundAmount = medicinePaymentMqInput.refundAmount;
  }

  if (
    orderDetails.currentStatus == MEDICINE_ORDER_STATUS.QUOTE ||
    orderDetails.currentStatus == MEDICINE_ORDER_STATUS.PAYMENT_PENDING
  ) {
    const savePaymentDetails = await medicineOrdersRepo.saveMedicineOrderPayment(paymentAttrs);
    if (!savePaymentDetails) {
      log(
        'profileServiceLogger',
        'saveMedicineOrderPayment failed ',
        'SaveMedicineOrderPaymentMq()->saveMedicineOrderPayment',
        JSON.stringify(paymentAttrs),
        ''
      );
      throw new AphError(AphErrorMessages.INVALID_MEDICINE_ORDER_ID, undefined, {});
    }
    let currentStatus = MEDICINE_ORDER_STATUS.PAYMENT_SUCCESS;
    if (medicinePaymentMqInput.paymentStatus === 'PENDING') {
      currentStatus = MEDICINE_ORDER_STATUS.PAYMENT_PENDING;
    }
    if (medicinePaymentMqInput.paymentType == MEDICINE_ORDER_PAYMENT_TYPE.COD) {
      medicinePaymentMqInput.paymentDateTime = new Date();
      currentStatus = MEDICINE_ORDER_STATUS.ORDER_INITIATED;
    }

    const patientRepo = profilesDb.getCustomRepository(PatientRepository);
    const patientDetails = await patientRepo.findById(orderDetails.patient.id);
    if (!patientDetails) {
      log(
        'profileServiceLogger',
        'Patient details not found',
        'SaveMedicineOrderPaymentMq()->patientRepo.findById()',
        `${orderDetails.orderAutoId} - ${orderDetails.patient.id}`,
        ''
      );
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
      sendMedicineOrderStatusNotification(
        NotificationType.MEDICINE_ORDER_PAYMENT_FAILED,
        orderDetails,
        profilesDb
      );
    } else if (medicinePaymentMqInput.paymentStatus === 'PENDING') {
      errorCode = 1;
      errorMessage = 'Payment is in pending state';
      paymentOrderId = savePaymentDetails.id;
      orderStatus = currentStatus;
      statusMsg = 'order payment awaited';
    } else {
      errorCode = 0;
      errorMessage = '';
      paymentOrderId = savePaymentDetails.id;
      orderStatus = currentStatus;
      statusMsg = 'order payment done successfully';
    }
    if (!orderDetails.isOmsOrder) {
      const orderStatusAttrs: Partial<MedicineOrdersStatus> = {
        orderStatus: currentStatus,
        medicineOrders: orderDetails,
        statusDate: new Date(),
        statusMessage: statusMsg,
      };
      await medicineOrdersRepo.saveMedicineOrderStatus(orderStatusAttrs, orderDetails.orderAutoId);
    }

    await medicineOrdersRepo.updateMedicineOrderDetails(
      orderDetails.id,
      orderDetails.orderAutoId,
      new Date(),
      currentStatus
    );
    if (
      medicinePaymentMqInput.paymentStatus != 'TXN_FAILURE' &&
      medicinePaymentMqInput.paymentStatus != 'PENDING'
    ) {
      const serviceBusConnectionString = process.env.AZURE_SERVICE_BUS_CONNECTION_STRING;
      const azureServiceBus = new ServiceBusService(serviceBusConnectionString);
      const queueName = orderDetails.isOmsOrder
        ? process.env.AZURE_SERVICE_BUS_OMS_QUEUE_NAME || ''
        : process.env.AZURE_SERVICE_BUS_QUEUE_NAME || '';
      azureServiceBus.createTopicIfNotExists(queueName, (topicError) => {
        if (topicError) {
          log(
            'profileServiceLogger',
            'Failed to send message queue',
            `SaveMedicineOrderPaymentMq()->${queueName}`,
            JSON.stringify(topicError),
            JSON.stringify(topicError)
          );
          console.log('topic create error', topicError);
        }
        console.log('connected to topic', queueName);
        const message = 'MEDICINE_ORDER:' + orderDetails.orderAutoId + ':' + patientDetails.id;
        azureServiceBus.sendTopicMessage(queueName, message, (sendMsgError) => {
          if (sendMsgError) {
            log(
              'profileServiceLogger',
              'Failed to send message queue',
              `SaveMedicineOrderPaymentMq()->${queueName}`,
              message,
              JSON.stringify(sendMsgError)
            );
            console.log('send message error', sendMsgError);
          }
          console.log('message sent to topic');
        });
      });
    }

    return {
      errorCode,
      errorMessage,
      paymentOrderId,
      orderStatus,
    };
  } else {
    const paymentAttrsWebhook: Partial<MedicineOrderPayments> = {
      responseCode: medicinePaymentMqInput.responseCode,
      responseMessage: medicinePaymentMqInput.responseMessage,
    };
    orderStatus = orderDetails.currentStatus;

    if (medicinePaymentMqInput.bankName) {
      paymentAttrsWebhook.bankName = medicinePaymentMqInput.bankName;
    }

    if (medicinePaymentMqInput.refundAmount) {
      paymentAttrsWebhook.refundAmount = medicinePaymentMqInput.refundAmount;
    }
    if (Object.keys(paymentAttrsWebhook).length) {
      const updatePaymentDetails = await medicineOrdersRepo.updateMedicineOrderPayment(
        orderDetails.id,
        orderDetails.orderAutoId,
        paymentAttrsWebhook
      );
      log(
        'profileServiceLogger',
        'Updated Payment Details',
        'SaveMedicineOrderPaymentMq()',
        JSON.stringify(updatePaymentDetails),
        ''
      );
      if (!updatePaymentDetails) {
        errorCode = -1;
        errorMessage = 'Could not update payment status';
      }
    }
  }

  //send email notifictaion id if the city sent is in CODCity
  if (
    orderDetails.medicineOrderLineItems &&
    medicinePaymentMqInput.CODCity &&
    medicinePaymentMqInput.CODCity.length > 0
  ) {
    const mailContent = medicineCOD({ orderDetails, patientAddress: patientAddress[0] });

    const subjectLine = ApiConstants.ORDER_PLACED_TITLE;
    const subject =
      process.env.NODE_ENV == 'production'
        ? subjectLine
        : subjectLine + ' from ' + process.env.NODE_ENV;

    const toEmailId =
      process.env.NODE_ENV == 'dev' ||
      process.env.NODE_ENV == 'development' ||
      process.env.NODE_ENV == 'local'
        ? ApiConstants.MEDICINE_SUPPORT_EMAILID
        : ApiConstants.MEDICINE_SUPPORT_EMAILID_PRODUCTION;

    let ccEmailIds =
      process.env.NODE_ENV == 'dev' ||
      process.env.NODE_ENV == 'development' ||
      process.env.NODE_ENV == 'local'
        ? <string>ApiConstants.MEDICINE_SUPPORT_CC_EMAILID
        : <string>ApiConstants.MEDICINE_SUPPORT_CC_EMAILID_PRODUCTION;

    if (medicinePaymentMqInput.email && medicinePaymentMqInput.email.length > 0) {
      ccEmailIds = ccEmailIds.concat(medicinePaymentMqInput.email);
    }

    const emailContent: EmailMessage = {
      subject: subject,
      fromEmail: <string>ApiConstants.PATIENT_HELP_FROM_EMAILID,
      fromName: <string>ApiConstants.PATIENT_HELP_FROM_NAME,
      messageContent: <string>mailContent,
      toEmail: <string>toEmailId,
      ccEmail: <string>ccEmailIds,
    };

    sendMail(emailContent);
  }

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
