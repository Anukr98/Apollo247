import gql from 'graphql-tag';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { MedicineOrdersRepository } from 'profiles-service/repositories/MedicineOrdersRepository';
import {
  MEDICINE_ORDER_PAYMENT_TYPE,
  MedicineOrderPayments,
  MEDICINE_ORDER_STATUS,
  MedicineOrdersStatus,
  PHARMA_CART_TYPE,
} from 'profiles-service/entities';
import { Resolver } from 'api-gateway';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import fetch from 'node-fetch';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { PatientAddressRepository } from 'profiles-service/repositories/patientAddressRepository';
import { PharmaLineItem, PharmaResponse, PrescriptionUrl } from 'types/medicineOrderTypes';
import { differenceInYears } from 'date-fns';
import { log } from 'customWinstonLogger';

export const saveMedicineOrderPaymentTypeDefs = gql`
  enum MEDICINE_ORDER_PAYMENT_TYPE {
    COD
    CASHLESS
    NO_PAYMENT
  }

  enum PHARMA_CART_TYPE {
    CART
    NONCART
  }

  input MedicinePaymentInput {
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

type MedicinePaymentInputArgs = { medicinePaymentInput: MedicinePaymentInput };

const SaveMedicineOrderPayment: Resolver<
  null,
  MedicinePaymentInputArgs,
  ProfilesServiceContext,
  SaveMedicineOrderResult
> = async (parent, { medicinePaymentInput }, { profilesDb }) => {
  let errorCode = 0,
    errorMessage = '',
    orderStatus: MEDICINE_ORDER_STATUS = MEDICINE_ORDER_STATUS.QUOTE,
    paymentOrderId = '';
  const medicineOrdersRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
  const orderDetails = await medicineOrdersRepo.getMedicineOrderDetails(
    medicinePaymentInput.orderAutoId
  );
  if (!orderDetails) {
    throw new AphError(AphErrorMessages.INVALID_MEDICINE_ORDER_ID, undefined, {});
  }
  if (medicinePaymentInput.paymentType == MEDICINE_ORDER_PAYMENT_TYPE.COD) {
    medicinePaymentInput.paymentDateTime = new Date();
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
  if (!savePaymentDetails) {
    throw new AphError(AphErrorMessages.INVALID_MEDICINE_ORDER_ID, undefined, {});
  }

  const patientRepo = profilesDb.getCustomRepository(PatientRepository);
  const patientDetails = await patientRepo.getPatientDetails(orderDetails.patient.id);

  let deliveryCity = 'Kakinada',
    deliveryZipcode = '500045',
    deliveryAddress = 'Kakinada';
  if (!patientDetails) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }
  if (orderDetails.patientAddressId !== '' && orderDetails.patientAddressId !== null) {
    const patientAddressRepo = profilesDb.getCustomRepository(PatientAddressRepository);
    const patientAddressDetails = await patientAddressRepo.findById(orderDetails.patientAddressId);
    if (!patientAddressDetails) {
      throw new AphError(AphErrorMessages.INVALID_PATIENT_ADDRESS_ID, undefined, {});
    }
    deliveryAddress = patientAddressDetails.addressLine1 + ' ' + patientAddressDetails.addressLine2;
    if (patientAddressDetails.city == '' || patientAddressDetails.city == null) {
      deliveryCity = 'Kakinada';
    } else {
      deliveryCity = patientAddressDetails.city;
    }

    if (patientAddressDetails.zipcode == '' || patientAddressDetails.zipcode == null) {
      deliveryZipcode = '500045';
    } else {
      deliveryZipcode = patientAddressDetails.zipcode;
    }
  }

  const orderLineItems: PharmaLineItem[] = [];
  const orderPrescriptionUrl: PrescriptionUrl[] = [];
  orderDetails.medicineOrderLineItems.map((item) => {
    const lineItem = {
      ItemID: item.medicineSKU,
      ItemName: item.medicineName,
      Qty: item.quantity * item.mou,
      Pack: item.quantity,
      MOU: item.mou,
      Price: item.price,
      Status: true,
    };
    orderLineItems.push(lineItem);
  });
  let prescriptionImages: string[] = [];
  if (orderDetails.prescriptionImageUrl != '' && orderDetails.prescriptionImageUrl != null) {
    prescriptionImages = orderDetails.prescriptionImageUrl.split(',');
  }
  if (prescriptionImages.length > 0) {
    prescriptionImages.map((imageUrl) => {
      const url = {
        url: imageUrl,
      };
      orderPrescriptionUrl.push(url);
    });
  }
  let selShopId = '15288';
  if (orderDetails.shopId != '' && orderDetails.shopId != null) {
    selShopId = orderDetails.shopId;
  }
  let patientAge = 30;
  if (patientDetails.dateOfBirth && patientDetails.dateOfBirth != null) {
    patientAge = Math.abs(differenceInYears(new Date(), patientDetails.dateOfBirth));
  }
  let payStatus = medicinePaymentInput.paymentStatus;
  if (medicinePaymentInput.paymentType == MEDICINE_ORDER_PAYMENT_TYPE.COD) {
    payStatus = '';
  }
  const medicineOrderPharma = {
    tpdetails: {
      OrderId: orderDetails.orderAutoId,
      ShopId: selShopId,
      ShippingMethod: orderDetails.deliveryType.replace('_', ' '),
      RequestType: PHARMA_CART_TYPE.CART,
      PaymentMethod: medicinePaymentInput.paymentType,
      VendorName: '*****',
      DotorName: 'Apollo',
      OrderType: 'Pharma',
      StateCode: 'TS',
      TAT: null,
      CouponCode: 'MED10',
      OrderDate: new Date(),
      CustomerDetails: {
        MobileNo: patientDetails.mobileNumber.substr(3),
        Comm_addr: deliveryAddress,
        Del_addr: deliveryAddress,
        FirstName: patientDetails.firstName,
        LastName: patientDetails.lastName,
        City: deliveryCity,
        PostCode: deliveryZipcode,
        MailId: patientDetails.emailAddress,
        Age: patientAge,
        CardNo: null,
        PatientName: patientDetails.firstName,
      },
      PaymentDetails: {
        TotalAmount: medicinePaymentInput.amountPaid,
        PaymentSource: medicinePaymentInput.paymentType,
        PaymentStatus: payStatus,
        PaymentOrderId: medicinePaymentInput.paymentRefId,
      },
      ItemDetails: orderLineItems,
      PrescUrl: orderPrescriptionUrl,
    },
  };

  console.log('medicineOrderPharma', medicineOrderPharma);
  const placeOrderUrl = process.env.PHARMACY_MED_PLACE_ORDERS
    ? process.env.PHARMACY_MED_PLACE_ORDERS
    : '';
  const placeOrderToken = process.env.PHARMACY_ORDER_TOKEN ? process.env.PHARMACY_ORDER_TOKEN : '';
  console.log('placeOrderToken', placeOrderToken);
  if (placeOrderUrl == '' || placeOrderToken == '') {
    throw new AphError(AphErrorMessages.INVALID_PHARMA_ORDER_URL, undefined, {});
  }
  log(
    'profileServiceLogger',
    `EXTERNAL_API_CALL_PHARMACY: ${placeOrderUrl}`,
    'SaveMedicineOrderPayment()->API_CALL_STARTING',
    JSON.stringify(medicineOrderPharma),
    ''
  );
  // const dummyUrl = 'http://dummy.restapiexample.com/api/v1/create';
  // const dummyUrl2 = 'http://blue.phrdemo.com/ui/data/getauthtoken?mobile=8019677178';
  // const pharmaResp = await fetch(dummyUrl2, {
  //   method: 'GET',
  //   //body: JSON.stringify({ name: 'testName', salary: '12345', age: '23' }),
  //   //headers: { 'Content-Type': 'application/json', Token: placeOrderToken },
  // }).catch((error) => {
  //   console.log('pharma_payment_error', error);
  //   throw new AphError(AphErrorMessages.SAVE_MEDICINE_ORDER_PAYMENT_ERROR);
  // });

  const pharmaResp = await fetch(placeOrderUrl, {
    method: 'POST',
    body: JSON.stringify(medicineOrderPharma),
    headers: { 'Content-Type': 'application/json', Token: placeOrderToken },
    timeout: 50000,
  }).catch((error) => {
    console.log('pharma_payment_error', error);
    log(
      'profileServiceLogger',
      'API_CALL_RESPONSE',
      'SaveMedicineOrderPayment()->CATCH_BLOCK',
      '',
      JSON.stringify(error)
    );
    throw new AphError(AphErrorMessages.SAVE_MEDICINE_ORDER_PAYMENT_ERROR);
  });

  if (pharmaResp.status == 400 || pharmaResp.status == 404) {
    log(
      'profileServiceLogger',
      'API_CALL_RESPONSE',
      'SaveMedicineOrderPayment()->API_CALL_RESPONSE',
      JSON.stringify(pharmaResp),
      ''
    );
    throw new AphError(AphErrorMessages.SOMETHING_WENT_WRONG, undefined, {});
  }

  console.log('pharmaResp', pharmaResp);

  const textRes = await pharmaResp.text();
  log(
    'profileServiceLogger',
    'API_CALL_RESPONSE',
    'SaveMedicineOrderPayment()->API_CALL_RESPONSE',
    textRes,
    ''
  );
  errorMessage = textRes;

  const orderResp: PharmaResponse = JSON.parse(textRes);
  if (orderResp.ordersResult.Status === false) {
    errorCode = -1;
    errorMessage = orderResp.ordersResult.Message;
    paymentOrderId = savePaymentDetails.id;
    orderStatus = MEDICINE_ORDER_STATUS.ORDER_FAILED;
  } else {
    const orderStatusAttrs: Partial<MedicineOrdersStatus> = {
      orderStatus: MEDICINE_ORDER_STATUS.ORDER_PLACED,
      medicineOrders: orderDetails,
      statusDate: new Date(),
      statusMessage: orderResp.ordersResult.Message,
    };
    await medicineOrdersRepo.saveMedicineOrderStatus(orderStatusAttrs, orderDetails.orderAutoId);
    await medicineOrdersRepo.updateMedicineOrderDetails(
      orderDetails.id,
      orderDetails.orderAutoId,
      new Date(),
      MEDICINE_ORDER_STATUS.ORDER_PLACED
    );
    errorCode = 0;
    errorMessage = orderResp.ordersResult.Message;
    paymentOrderId = savePaymentDetails.id;
    orderStatus = MEDICINE_ORDER_STATUS.ORDER_PLACED;
  }

  return {
    errorCode,
    errorMessage,
    paymentOrderId,
    orderStatus,
  };
};

export const saveMedicineOrderPaymentResolvers = {
  Mutation: {
    SaveMedicineOrderPayment,
  },
};
