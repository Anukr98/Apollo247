import gql from 'graphql-tag';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { MedicineOrdersRepository } from 'profiles-service/repositories/MedicineOrdersRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import {
  MedicineOrders,
  MEDICINE_DELIVERY_TYPE,
  MEDICINE_ORDER_TYPE,
  MEDICINE_ORDER_STATUS,
  MEDICINE_ORDER_PAYMENT_TYPE,
  BOOKING_SOURCE,
  DEVICE_TYPE,
  MedicineOrdersStatus,
} from 'profiles-service/entities';
import { Resolver } from 'api-gateway';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { PatientAddressRepository } from 'profiles-service/repositories/patientAddressRepository';
import { log } from 'customWinstonLogger';
import { ApiConstants } from 'ApiConstants';
import { medicineSendPrescription } from 'helpers/emailTemplates/medicineSendPrescription';
import { EmailMessage } from 'types/notificationMessageTypes';
import { sendMail } from 'notifications-service/resolvers/email';
import { ServiceBusService } from 'azure-sb';

export const savePrescriptionMedicineOrderOMSTypeDefs = gql`
  input PrescriptionMedicineOrderOMSInput {
    quoteId: String
    shopId: String
    patientId: ID!
    bookingSource: BOOKING_SOURCE
    deviceType: DEVICE_TYPE
    medicineDeliveryType: MEDICINE_DELIVERY_TYPE!
    patinetAddressId: ID
    prescriptionImageUrl: String!
    prismPrescriptionFileId: String!
    appointmentId: String
    isEprescription: Int
    payment: PrescriptionMedicinePaymentOMSDetails
    email: String
    NonCartOrderCity: NonCartOrderOMSCity
    orderAutoId: Int
    shopAddress: ShopAddress
    prescriptionOptionSelected: String
    durationDays: Int
    customerComment: String
  }

  enum NonCartOrderOMSCity {
    CHENNAI
  }

  input PrescriptionMedicinePaymentOMSDetails {
    paymentType: MEDICINE_ORDER_PAYMENT_TYPE
    amountPaid: Float
    paymentRefId: String
    paymentStatus: String
    paymentDateTime: DateTime
  }

  type SavePrescriptionMedicineOrderOMSResult {
    status: MEDICINE_ORDER_STATUS!
    orderId: ID!
    orderAutoId: Int!
    errorCode: Int!
    errorMessage: String!
  }

  extend type Mutation {
    savePrescriptionMedicineOrderOMS(
      prescriptionMedicineOMSInput: PrescriptionMedicineOrderOMSInput
    ): SavePrescriptionMedicineOrderOMSResult!
  }
`;

enum NonCartOrderOMSCity {
  'CHENNAI' = 'CHENNAI',
}

type PrescriptionMedicineOrderOMSInput = {
  quoteId: string;
  shopId: string;
  orderAutoId: number;
  patientId: string;
  bookingSource: BOOKING_SOURCE;
  deviceType: DEVICE_TYPE;
  medicineDeliveryType: MEDICINE_DELIVERY_TYPE;
  patinetAddressId: string;
  prescriptionImageUrl: string;
  prismPrescriptionFileId: string;
  appointmentId: string;
  isEprescription: number;
  payment?: PrescriptionMedicinePaymentOMSDetails;
  email: string;
  NonCartOrderCity: NonCartOrderOMSCity;
  shopAddress: ShopAddress;
  prescriptionOptionSelected: string;
  durationDays: number;
  customerComment: string;
};

type ShopAddress = {
  storename: string;
  address: string;
  workinghrs: string;
  phone: string;
  city: string;
  state: string;
};

type PrescriptionMedicinePaymentOMSDetails = {
  paymentType: MEDICINE_ORDER_PAYMENT_TYPE;
  amountPaid: number;
  paymentRefId: string;
  paymentStatus: string;
  paymentDateTime: Date;
};

type SavePrescriptionMedicineOrderOMSResult = {
  status: MEDICINE_ORDER_STATUS;
  orderId: string;
  orderAutoId: number;
  errorCode: number;
  errorMessage: string;
};

type PrescriptionMedicineOMSInputInputArgs = {
  prescriptionMedicineOMSInput: PrescriptionMedicineOrderOMSInput;
};

const savePrescriptionMedicineOrderOMS: Resolver<
  null,
  PrescriptionMedicineOMSInputInputArgs,
  ProfilesServiceContext,
  SavePrescriptionMedicineOrderOMSResult
> = async (parent, { prescriptionMedicineOMSInput }, { profilesDb }) => {
  const errorCode = 0,
    errorMessage = '',
    orderStatus: MEDICINE_ORDER_STATUS = MEDICINE_ORDER_STATUS.QUOTE;

  const patientRepo = profilesDb.getCustomRepository(PatientRepository);
  const patientDetails = await patientRepo.getPatientDetails(
    prescriptionMedicineOMSInput.patientId
  );
  if (!patientDetails) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }

  if (!prescriptionMedicineOMSInput.patinetAddressId && !prescriptionMedicineOMSInput.shopId) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ADDRESS_ID, undefined, {});
  }

  let patientAddressDetails;
  if (prescriptionMedicineOMSInput.patinetAddressId) {
    const patientAddressRepo = profilesDb.getCustomRepository(PatientAddressRepository);
    patientAddressDetails = await patientAddressRepo.findById(
      prescriptionMedicineOMSInput.patinetAddressId
    );
    if (!patientAddressDetails) {
      throw new AphError(AphErrorMessages.INVALID_PATIENT_ADDRESS_ID, undefined, {});
    }
  }

  const customerComments = [];
  if (prescriptionMedicineOMSInput.customerComment) {
    customerComments.push(prescriptionMedicineOMSInput.customerComment);
  }

  if (prescriptionMedicineOMSInput.prescriptionOptionSelected) {
    customerComments.push(prescriptionMedicineOMSInput.prescriptionOptionSelected);
  }

  if (prescriptionMedicineOMSInput.durationDays) {
    customerComments.push(prescriptionMedicineOMSInput.durationDays);
  }

  const medicineOrderattrs: Partial<MedicineOrders> = {
    patient: patientDetails,
    orderType: MEDICINE_ORDER_TYPE.UPLOAD_PRESCRIPTION,
    shopId: prescriptionMedicineOMSInput.shopId,
    quoteDateTime: new Date(),
    deliveryType: prescriptionMedicineOMSInput.medicineDeliveryType,
    quoteId: prescriptionMedicineOMSInput.quoteId,
    appointmentId: prescriptionMedicineOMSInput.appointmentId,
    prescriptionImageUrl: prescriptionMedicineOMSInput.prescriptionImageUrl,
    prismPrescriptionFileId: prescriptionMedicineOMSInput.prismPrescriptionFileId,
    bookingSource: prescriptionMedicineOMSInput.bookingSource,
    deviceType: prescriptionMedicineOMSInput.deviceType,
    estimatedAmount: 0.0,
    devliveryCharges: 0.0,
    patientAddressId: prescriptionMedicineOMSInput.patinetAddressId,
    currentStatus: MEDICINE_ORDER_STATUS.PRESCRIPTION_UPLOADED,
    isEprescription: prescriptionMedicineOMSInput.isEprescription,
    shopAddress: JSON.stringify(prescriptionMedicineOMSInput.shopAddress),
    isOmsOrder: true,
    customerComment: customerComments.join(' '),
  };
  const medicineOrdersRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
  const saveOrder = await medicineOrdersRepo.saveMedicineOrder(medicineOrderattrs);

  if (saveOrder) {
    const orderStatusAttrs: Partial<MedicineOrdersStatus> = {
      orderStatus: MEDICINE_ORDER_STATUS.PRESCRIPTION_UPLOADED,
      medicineOrders: saveOrder,
      statusDate: new Date(),
    };
    await medicineOrdersRepo.saveMedicineOrderStatus(orderStatusAttrs, saveOrder.orderAutoId);
  }

  const serviceBusConnectionString = process.env.AZURE_SERVICE_BUS_CONNECTION_STRING;
  const azureServiceBus = new ServiceBusService(serviceBusConnectionString);
  const queueName = process.env.AZURE_SERVICE_BUS_OMS_QUEUE_NAME || '';
  azureServiceBus.createTopicIfNotExists(queueName, (topicError) => {
    if (topicError) {
      log(
        'profileServiceLogger',
        'Failed to create message queue',
        `savePrescriptionMedicineOrdersOMS()->${queueName}`,
        JSON.stringify(topicError),
        JSON.stringify(topicError)
      );
      console.log('topic create error', topicError);
    }
    console.log('connected to topic', queueName);

    const message = 'MEDICINE_ORDER:' + saveOrder.orderAutoId + ':' + patientDetails.id;
    azureServiceBus.sendTopicMessage(queueName, message, (sendMsgError) => {
      if (sendMsgError) {
        log(
          'profileServiceLogger',
          'Failed to send message queue',
          `savePrescriptionMedicineOrdersOMS()->${queueName}`,
          message,
          JSON.stringify(sendMsgError)
        );
        console.log('send message error', sendMsgError);
      }
      console.log('message sent to topic');
    });
  });

  if (
    prescriptionMedicineOMSInput.NonCartOrderCity &&
    prescriptionMedicineOMSInput.NonCartOrderCity.length > 0 &&
    patientAddressDetails
  ) {
    const mailContent = medicineSendPrescription({
      patientDetails,
      patientAddressDetails: {
        addressLine1: patientAddressDetails.addressLine1,
        addressLine2: patientAddressDetails.addressLine2,
        Landmark: patientAddressDetails.landmark,
        City: patientAddressDetails.city,
        State: patientAddressDetails.state,
        Zipcode: patientAddressDetails.zipcode,
      },
      prescriptionUrls: saveOrder.prescriptionImageUrl.split(','),
    });
    const subjectLine = ApiConstants.UPLOAD_PRESCRIPTION_TITLE;
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
        ? ''
        : <string>ApiConstants.MEDICINE_SUPPORT_CC_EMAILID_PRODUCTION;

    if (prescriptionMedicineOMSInput.email && prescriptionMedicineOMSInput.email.length > 0) {
      ccEmailIds = ccEmailIds.concat(prescriptionMedicineOMSInput.email);
    }

    //retaining cc as input is being concatenated with cc
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
    status: orderStatus,
    orderId: saveOrder.id,
    orderAutoId: saveOrder.orderAutoId,
    errorCode,
    errorMessage,
  };
};

export const savePrescriptionMedicineOrderOMSResolvers = {
  Mutation: {
    savePrescriptionMedicineOrderOMS,
  },
};
