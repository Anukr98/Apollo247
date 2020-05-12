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
} from 'profiles-service/entities';
import { Resolver } from 'api-gateway';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { PatientAddressRepository } from 'profiles-service/repositories/patientAddressRepository';
import { PharmaResult, PrescriptionUrl } from 'types/medicineOrderTypes';
import fetch from 'node-fetch';
import { differenceInYears } from 'date-fns';
import { log } from 'customWinstonLogger';
import { ApiConstants } from 'ApiConstants';
import { medicineSendPrescription } from 'helpers/emailTemplates/medicineSendPrescription';
import { EmailMessage } from 'types/notificationMessageTypes';
import { sendMail } from 'notifications-service/resolvers/email';

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
  let errorCode = 0,
    errorMessage = '',
    orderStatus: MEDICINE_ORDER_STATUS = MEDICINE_ORDER_STATUS.QUOTE;
  const patientRepo = profilesDb.getCustomRepository(PatientRepository);
  const patientDetails = await patientRepo.findById(prescriptionMedicineOMSInput.patientId);
  if (!patientDetails) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
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
  };
  let patientAddressDetails;
  if (
    prescriptionMedicineOMSInput.patinetAddressId != null &&
    prescriptionMedicineOMSInput.patinetAddressId != ''
  ) {
    const patientAddressRepo = profilesDb.getCustomRepository(PatientAddressRepository);
    patientAddressDetails = await patientAddressRepo.findById(
      prescriptionMedicineOMSInput.patinetAddressId
    );
    if (!patientAddressDetails) {
      throw new AphError(AphErrorMessages.INVALID_PATIENT_ADDRESS_ID, undefined, {});
    }
  }
  const medicineOrdersRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
  const saveOrder = await medicineOrdersRepo.saveMedicineOrder(medicineOrderattrs);

  if (saveOrder) {
    let deliveryCity = 'Kakinada',
      deliveryZipcode = '500034',
      deliveryAddress1 = '',
      deliveryAddress2 = '',
      landmark = '',
      deliveryAddress = 'Kakinada',
      deliveryState = 'Telangana';
    if (patientAddressDetails) {
      deliveryState = patientAddressDetails.state;
      deliveryAddress1 = patientAddressDetails.addressLine1;
      deliveryAddress2 = patientAddressDetails.addressLine2;
      landmark = patientAddressDetails.landmark || landmark;

      deliveryAddress =
        patientAddressDetails.addressLine1 + ' ' + patientAddressDetails.addressLine2;
      deliveryCity = patientAddressDetails.city || deliveryCity;
      deliveryZipcode = patientAddressDetails.zipcode || deliveryZipcode;
    }
    const patientDelivaryDetails = {
      addressLine1: deliveryAddress1,
      addressLine2: deliveryAddress2,
      Landmark: landmark,
      City: deliveryCity,
      State: deliveryState,
      Zipcode: deliveryZipcode,
    };
    const orderPrescriptionUrl: PrescriptionUrl[] = [];
    const prescriptionImages = saveOrder.prescriptionImageUrl.split(',');
    if (prescriptionImages.length > 0) {
      prescriptionImages.map((imageUrl) => {
        const url = {
          url: imageUrl,
        };
        orderPrescriptionUrl.push(url);
      });
    }
    let patientAge = 30;
    if (patientDetails.dateOfBirth && patientDetails.dateOfBirth != null) {
      patientAge = Math.abs(differenceInYears(new Date(), patientDetails.dateOfBirth));
    }
    const medicineOrderPharma = {
      orderid: saveOrder.orderAutoId,
      orderdate: saveOrder.quoteDateTime, //"04-22-2020 14:46:41",
      couponcode: '',
      drname: '',
      VendorName: 'Apollo247',
      shippingmethod:
        saveOrder.deliveryType == MEDICINE_DELIVERY_TYPE.HOME_DELIVERY
          ? 'HOMEDELIVERY'
          : 'STOREPICKUP',
      paymentmethod: 'COD',
      prefferedsite: '',
      ordertype: 'NONCART',
      orderamount: 0,
      deliverydate: '',
      timeslot: '',
      shippingcharges: 0,
      categorytype: 'Pharma',
      customercomment: '',
      landmark: landmark,
      issubscribe: false,
      customerdetails: {
        billingaddress: deliveryAddress.trim(),
        billingpincode: deliveryZipcode,
        billingcity: deliveryCity,
        billingstateid: 'TS',
        shippingaddress: deliveryAddress.trim(),
        shippingpincode: deliveryZipcode,
        shippingcity: deliveryCity,
        shippingstateid: 'TS',
        customerid: '',
        patiendname: '',
        customername: patientDetails.firstName + ' ' + patientDetails.lastName,
        primarycontactno: patientDetails.mobileNumber.substr(3),
        secondarycontactno: '',
        age: patientAge,
        emailid: patientDetails.emailAddress,
        cardno: '0',
        latitude: 17.4538043,
        longitude: 78.3694429,
      },
      paymentdetails: [],
      itemdetails: [],
      imageurl: orderPrescriptionUrl,
    };

    const placeOrderUrl = process.env.PHARMACY_MED_PLACE_OMS_ORDERS
      ? process.env.PHARMACY_MED_PLACE_OMS_ORDERS
      : '';
    const placeOrderToken = process.env.PHARMACY_OMS_ORDER_TOKEN
      ? process.env.PHARMACY_OMS_ORDER_TOKEN
      : '';

    if (placeOrderUrl == '' || placeOrderToken == '') {
      throw new AphError(AphErrorMessages.INVALID_PHARMA_ORDER_URL, undefined, {});
    }

    log(
      'profileServiceLogger',
      `EXTERNAL_API_CALL_PHARMACY: ${placeOrderUrl}`,
      'SavePrescriptionMedicineOrder()->API_CALL_STARTING',
      JSON.stringify(medicineOrderPharma),
      ''
    );
    const pharmaResp = await fetch(placeOrderUrl, {
      method: 'POST',
      body: JSON.stringify(medicineOrderPharma),
      headers: { 'Content-Type': 'application/json', 'Auth-Token': placeOrderToken },
    });

    if (pharmaResp.status == 400 || pharmaResp.status == 404) {
      log(
        'profileServiceLogger',
        'API_CALL_RESPONSE',
        'SavePrescriptionMedicineOrder()->API_CALL_RESPONSE',
        JSON.stringify(pharmaResp),
        ''
      );
      throw new AphError(AphErrorMessages.SOMETHING_WENT_WRONG, undefined, {});
    }

    const textRes = await pharmaResp.text();
    log(
      'profileServiceLogger',
      'API_CALL_RESPONSE',
      'SavePrescriptionMedicineOrder()->API_CALL_RESPONSE',
      textRes,
      ''
    );
    const orderResp: PharmaResult = JSON.parse(textRes);

    if (orderResp.Status === false) {
      errorCode = -1;
      errorMessage = orderResp.Message;
      orderStatus = MEDICINE_ORDER_STATUS.ORDER_FAILED;
    } else {
      await medicineOrdersRepo.updateMedicineOrderDetails(
        saveOrder.id,
        saveOrder.orderAutoId,
        new Date(),
        MEDICINE_ORDER_STATUS.ORDER_PLACED
      );
      medicineOrdersRepo.updateOrderReferenceNo(
        saveOrder.orderAutoId,
        saveOrder.id,
        orderResp.ReferenceNo
      );
      if (
        prescriptionMedicineOMSInput.NonCartOrderCity &&
        prescriptionMedicineOMSInput.NonCartOrderCity.length > 0
      ) {
        const mailContent = medicineSendPrescription({
          patientDetails,
          patientAddressDetails: patientDelivaryDetails,
          prescriptionUrls: prescriptionImages,
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
            ? <string>ApiConstants.MEDICINE_SUPPORT_CC_EMAILID
            : <string>ApiConstants.MEDICINE_SUPPORT_CC_EMAILID_PRODUCTION;

        if (prescriptionMedicineOMSInput.email && prescriptionMedicineOMSInput.email.length > 0) {
          ccEmailIds = ccEmailIds.concat(prescriptionMedicineOMSInput.email);
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
      //end email notification

      errorCode = 0;
      errorMessage = '';
      orderStatus = MEDICINE_ORDER_STATUS.ORDER_PLACED;
    }
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
