import gql from 'graphql-tag';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { MedicineOrdersRepository } from 'profiles-service/repositories/MedicineOrdersRepository';
import { Connection, UpdateResult } from 'typeorm';
import {
  MEDICINE_ORDER_PAYMENT_TYPE,
  MedicineOrderPayments,
  PAYMENT_METHODS,
  PAYMENT_METHODS_REVERSE,
  MEDICINE_ORDER_STATUS,
  MedicineOrdersStatus,
  DEVICE_TYPE,
  MedicineOrders,
} from 'profiles-service/entities';
import { Resolver } from 'api-gateway';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { ServiceBusService } from 'azure-sb';
import { sendMedicineOrderStatusNotification } from 'notifications-service/handlers';
import { NotificationType } from 'notifications-service/constants';
import { medicineCOD } from 'helpers/emailTemplates/medicineCOD';
import { sendMail } from 'notifications-service/resolvers/email';
import { ApiConstants } from 'ApiConstants';
import { EmailMessage } from 'types/notificationMessageTypes';
import { log } from 'customWinstonLogger';
import {
  BlockOneApolloPointsRequest,
  BlockUserPointsResponse,
  ONE_APOLLO_STORE_CODE,
} from 'types/oneApolloTypes';
import { OneApollo } from 'helpers/oneApollo';
import { getStoreCodeFromDevice } from 'profiles-service/helpers/OneApolloTransactionHelper';
import { calculateRefund } from 'profiles-service/helpers/refundHelper';

export const saveMedicineOrderPaymentMqTypeDefs = gql`
  enum CODCity {
    CHENNAI
  }

  enum PAYMENT_METHODS {
    DC
    CC
    NB
    PPI
    EMI
    UPI
    PAYTMCC
    COD
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
    paymentMode: PAYMENT_METHODS
    healthCredits: Float
    partnerInfo: String
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
  paymentMode: PAYMENT_METHODS_REVERSE;
  healthCredits: number;
  partnerInfo: string;
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

type userDetailInput = {
  mobileNumber: string;
  deviceType: DEVICE_TYPE | DEVICE_TYPE.ANDROID;
  creditsToBlock: number;
  orderId: number;
  id: MedicineOrderPayments['id'];
  bookingSource: MedicineOrders['bookingSource'];
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
  const orderDetails = await medicineOrdersRepo.getMedicineOrderDetailsByOrderId(
    medicinePaymentMqInput.orderAutoId
  );
  if (!orderDetails || !orderDetails.patient) {
    log(
      'profileServiceLogger',
      'Invalid Order ID',
      'SaveMedicineOrderPaymentMq()',
      JSON.stringify(medicinePaymentMqInput),
      ''
    );
    throw new AphError(AphErrorMessages.INVALID_MEDICINE_ORDER_ID, undefined, {});
  }

  const patientAddressId = orderDetails.patientAddressId;

  if (medicinePaymentMqInput.paymentType == MEDICINE_ORDER_PAYMENT_TYPE.COD) {
    medicinePaymentMqInput.paymentDateTime = new Date();
    medicinePaymentMqInput.paymentMode = PAYMENT_METHODS_REVERSE.COD;
  }

  const paymentAttrs: Partial<MedicineOrderPayments> = {
    medicineOrders: orderDetails,
    paymentDateTime: medicinePaymentMqInput.paymentDateTime || new Date(),
    paymentStatus: medicinePaymentMqInput.paymentStatus,
    paymentType: medicinePaymentMqInput.paymentType,
    amountPaid: medicinePaymentMqInput.amountPaid,
    paymentRefId: medicinePaymentMqInput.paymentRefId,
    responseCode: medicinePaymentMqInput.responseCode,
    responseMessage: medicinePaymentMqInput.responseMessage,
    bankTxnId: medicinePaymentMqInput.bankTxnId,
    partnerInfo: medicinePaymentMqInput.partnerInfo,
  };
  if (medicinePaymentMqInput.healthCredits) {
    paymentAttrs.healthCreditsRedeemed = medicinePaymentMqInput.healthCredits;
  }
  if (medicinePaymentMqInput.paymentMode) {
    const paymentMode: string = PAYMENT_METHODS[medicinePaymentMqInput.paymentMode];
    paymentAttrs.paymentMode = paymentMode as PAYMENT_METHODS_REVERSE;
  }

  if (medicinePaymentMqInput.bankName) {
    paymentAttrs.bankName = medicinePaymentMqInput.bankName;
  }

  if (medicinePaymentMqInput.refundAmount) {
    paymentAttrs.refundAmount = medicinePaymentMqInput.refundAmount;
  }

  let savePaymentDetails: MedicineOrderPayments | undefined;

  if ((savePaymentDetails = await medicineOrdersRepo.findMedicineOrderPayment(orderDetails.id))) {
    if (
      savePaymentDetails.paymentStatus !== 'PENDING' &&
      savePaymentDetails.paymentMode != PAYMENT_METHODS_REVERSE.COD
    ) {
      throw new AphError(AphErrorMessages.PAYMENT_ALREADY_PROCESSED, undefined, {});
    }
    await medicineOrdersRepo.updateMedicineOrderPayment(
      orderDetails.id,
      orderDetails.orderAutoId,
      paymentAttrs
    );
    //get above updated details
    savePaymentDetails = await medicineOrdersRepo.findMedicineOrderPayment(orderDetails.id);
  } else {
    savePaymentDetails = await medicineOrdersRepo.saveMedicineOrderPayment(paymentAttrs);
    delete savePaymentDetails.medicineOrders;
  }

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

  orderStatus = orderDetails.currentStatus;

  if (
    orderDetails.currentStatus == MEDICINE_ORDER_STATUS.QUOTE ||
    orderDetails.currentStatus == MEDICINE_ORDER_STATUS.PAYMENT_PENDING
  ) {
    let currentStatus = MEDICINE_ORDER_STATUS.PAYMENT_SUCCESS;
    if (medicinePaymentMqInput.paymentStatus === 'PENDING') {
      currentStatus = MEDICINE_ORDER_STATUS.PAYMENT_PENDING;
    }
    if (medicinePaymentMqInput.paymentType == MEDICINE_ORDER_PAYMENT_TYPE.COD) {
      currentStatus = MEDICINE_ORDER_STATUS.ORDER_INITIATED;
    }

    let statusMsg = '';
    if (medicinePaymentMqInput.paymentStatus == 'TXN_FAILURE') {
      if (
        medicinePaymentMqInput.responseCode == '141' ||
        medicinePaymentMqInput.responseCode == '810'
      ) {
        currentStatus = MEDICINE_ORDER_STATUS.PAYMENT_ABORTED;
        errorCode = -1;
        errorMessage = 'Payment Aborted';
        paymentOrderId = savePaymentDetails.id;
        orderStatus = currentStatus;
        statusMsg = 'order payment aborted';
      } else {
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
      }
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

    const orderStatusAttrs: Partial<MedicineOrdersStatus> = {
      orderStatus: currentStatus,
      medicineOrders: orderDetails,
      statusDate: new Date(),
      statusMessage: statusMsg,
    };
    await medicineOrdersRepo.saveMedicineOrderStatus(orderStatusAttrs, orderDetails.orderAutoId);

    await medicineOrdersRepo.updateMedicineOrder(orderDetails.id, orderDetails.orderAutoId, {
      orderDateTime: new Date(),
      currentStatus,
      paymentInfo: savePaymentDetails,
    });
    if (
      medicinePaymentMqInput.paymentStatus != 'TXN_FAILURE' &&
      medicinePaymentMqInput.paymentStatus != 'PENDING'
    ) {
      if (
        medicinePaymentMqInput.healthCredits &&
        !Object.keys(savePaymentDetails.healthCreditsRedemptionRequest).length
      ) {
        try {
          const oneApolloresponse = await blockOneApolloUserPoints(
            {
              mobileNumber: orderDetails.patient.mobileNumber.slice(3),
              deviceType: orderDetails.deviceType,
              creditsToBlock: medicinePaymentMqInput.healthCredits,
              orderId: orderDetails.orderAutoId,
              id: orderDetails.id,
              bookingSource: orderDetails.bookingSource,
            },
            profilesDb
          );

          if (!oneApolloresponse.Success) {
            log(
              'profileServiceLogger',
              `Points block request failed - ${orderDetails.orderAutoId}`,
              'blockUserPoints()',
              JSON.stringify(oneApolloresponse),
              'true'
            );
            await handleOneApolloFailure(orderDetails, medicineOrdersRepo, profilesDb);
          }
        } catch (e) {
          log(
            'profileServiceLogger',
            `Points block request exception - ${orderDetails.orderAutoId}`,
            'blockUserPoints()',
            e.stack,
            'true'
          );
          await handleOneApolloFailure(orderDetails, medicineOrdersRepo, profilesDb);
        }
      }

      const serviceBusConnectionString = process.env.AZURE_SERVICE_BUS_CONNECTION_STRING;
      const azureServiceBus = new ServiceBusService(serviceBusConnectionString);
      const queueName = orderDetails.isOmsOrder
        ? process.env.AZURE_SERVICE_BUS_OMS_QUEUE_NAME || ''
        : process.env.AZURE_SERVICE_BUS_QUEUE_NAME || '';
      azureServiceBus.createTopicIfNotExists(queueName, (topicError) => {
        if (topicError) {
          log(
            'profileServiceLogger',
            'Failed to create message queue',
            `SaveMedicineOrderPaymentMq()->${queueName}`,
            JSON.stringify(topicError),
            JSON.stringify(topicError)
          );
        }
        const message =
          'MEDICINE_ORDER:' + orderDetails.orderAutoId + ':' + orderDetails.patient.id;
        azureServiceBus.sendTopicMessage(queueName, message, (sendMsgError) => {
          if (sendMsgError) {
            log(
              'profileServiceLogger',
              'Failed to send message queue',
              `SaveMedicineOrderPaymentMq()->${queueName}`,
              message,
              JSON.stringify(sendMsgError)
            );
          }
        });
      });
    }
  }

  //send email notifictaion id if the city sent is in CODCity
  if (medicinePaymentMqInput.CODCity && medicinePaymentMqInput.CODCity.length > 0) {
    const patientRepo = profilesDb.getCustomRepository(PatientRepository);
    const medicineOrderLineItems = await medicineOrdersRepo.getMedicineOrderLineItemByOrderId(
      orderDetails.id
    );
    let patientAddress = null;
    if (patientAddressId)
      patientAddress = await patientRepo.getPatientAddressById(patientAddressId);
    if (medicineOrderLineItems.length) {
      const mailContent = medicineCOD({
        orderDetails,
        patientAddress: patientAddress,
        medicineOrderLineItems: medicineOrderLineItems,
      });

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

      //medicine support cc email is '' and input is used, hence retaining this
      let ccEmailIds =
        process.env.NODE_ENV == 'dev' ||
        process.env.NODE_ENV == 'development' ||
        process.env.NODE_ENV == 'local'
          ? ''
          : <string>ApiConstants.MEDICINE_SUPPORT_CC_EMAILID_PRODUCTION;

      if (medicinePaymentMqInput.email && medicinePaymentMqInput.email.length > 0) {
        ccEmailIds = ccEmailIds.concat(medicinePaymentMqInput.email);
      }
      //retaining cc as input is concatenated with cc
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
  }

  return {
    errorCode,
    errorMessage,
    paymentOrderId,
    orderStatus,
  };
};

const blockOneApolloUserPoints = async (
  userDetailInput: userDetailInput,
  profilesDb: Connection
) => {
  let storeCode = ONE_APOLLO_STORE_CODE.WEBCUS;
  switch (userDetailInput.deviceType) {
    case DEVICE_TYPE.ANDROID:
      storeCode = ONE_APOLLO_STORE_CODE.ANDCUS;
      break;
    case DEVICE_TYPE.IOS:
      storeCode = ONE_APOLLO_STORE_CODE.IOSCUS;
      break;
  }
  const blockUserPointsInput: BlockOneApolloPointsRequest = {
    MobileNumber: +userDetailInput.mobileNumber,
    CreditsRedeemed: userDetailInput.creditsToBlock,
    StoreCode: getStoreCodeFromDevice(userDetailInput.deviceType, userDetailInput.bookingSource),
    BusinessUnit: process.env.ONEAPOLLO_BUSINESS_UNIT || '',
  };
  const oneApollo = new OneApollo();
  const response: Partial<BlockUserPointsResponse> = await oneApollo.blockOneUserCredits(
    blockUserPointsInput
  );
  const medRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
  await medRepo.updateMedicineOrderPayment(userDetailInput.id, userDetailInput.orderId, {
    healthCreditsRedemptionRequest: response,
  });
  return response;
};

const handleOneApolloFailure = async (
  orderDetails: MedicineOrders,
  medicineOrdersRepo: MedicineOrdersRepository,
  profilesDb: Connection
) => {
  let cancelOrderUpdates: Promise<MedicineOrdersStatus | UpdateResult>[] = [];

  const orderStatusAttrs: Partial<MedicineOrdersStatus> = {
    orderStatus: MEDICINE_ORDER_STATUS.CANCELLED,
    medicineOrders: orderDetails,
    statusDate: new Date(),
    statusMessage: '' + ApiConstants.ONE_APOLLO_ORDER_CANCELLATION_REASON_CODE,
  };
  cancelOrderUpdates.push(
    medicineOrdersRepo.saveMedicineOrderStatus(orderStatusAttrs, orderDetails.orderAutoId)
  );

  cancelOrderUpdates.push(
    medicineOrdersRepo.updateMedicineOrderDetails(
      orderDetails.id,
      orderDetails.orderAutoId,
      new Date(),
      MEDICINE_ORDER_STATUS.CANCELLED
    )
  );
  await Promise.all(cancelOrderUpdates);

  calculateRefund(
    orderDetails,
    0,
    profilesDb,
    medicineOrdersRepo,
    ApiConstants.ONE_APOLLO_ORDER_CANCELLATION_REASON_CODE
  );
  throw new AphError(AphErrorMessages.ONEAPOLLO_CREDITS_BLOCK_FAILED, undefined, {});
};

export const saveMedicineOrderPaymentMqResolvers = {
  Mutation: {
    SaveMedicineOrderPaymentMq,
  },
};
