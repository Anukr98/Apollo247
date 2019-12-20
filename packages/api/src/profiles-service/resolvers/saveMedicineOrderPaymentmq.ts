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
//import { PatientAddressRepository } from 'profiles-service/repositories/patientAddressRepository';
//import { PharmaLineItem, PrescriptionUrl } from 'types/medicineOrderTypes';
//import { differenceInYears } from 'date-fns';
import { ServiceBusService } from 'azure-sb';
/*import fetch from 'node-fetch';
import { log } from 'customWinstonLogger';*/

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
  /*let deliveryCity = 'Kakinada',
    deliveryZipcode = '500045',
    deliveryAddress = 'Kakinada';
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
  let orderLineItemsStr = '';
  let orderPrescriptionUrlStr = '';
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
    orderLineItemsStr +=
      "{ItemID:\"" +
      item.medicineSKU +
      "',ItemName:\"" +
      item.medicineName +
      "\",Qty:" +
      item.quantity * item.mou +
      ',Pack:' +
      item.quantity +
      ',MOU:' +
      item.mou +
      ',Price:' +
      item.price +
      ',Status: true},';
    orderLineItems.push(lineItem);
  });
  orderLineItemsStr = '[' + orderLineItemsStr.substring(0, orderLineItemsStr.length - 1) + ']';
  let prescriptionImages: string[] = [];
  if (orderDetails.prescriptionImageUrl != '' && orderDetails.prescriptionImageUrl != null) {
    prescriptionImages = orderDetails.prescriptionImageUrl.split(',');
  }
  if (prescriptionImages.length > 0) {
    prescriptionImages.map((imageUrl) => {
      const url = {
        url: imageUrl,
      };
      orderPrescriptionUrlStr += '{url:' + imageUrl + ',}';
      orderPrescriptionUrl.push(url);
    });
  }
  orderPrescriptionUrlStr =
    '[' + orderPrescriptionUrlStr.substring(0, orderPrescriptionUrlStr.length - 1) + ']';
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

  const pharmaRequest =
    '{tpdetails:{OrderId:' +
    orderDetails.orderAutoId +
    ',ShopId:' +
    selShopId +
    ",ShippingMethod:'" +
    orderDetails.deliveryType.replace('_', '') +
    "',RequestType:'" +
    PHARMA_CART_TYPE.CART +
    "',PaymentMethod:'" +
    medicinePaymentInput.paymentType +
    "',VendorName:'*****',DotorName:'Apollo',OrderType:'Pharma',StateCode:'TS',TAT:'',CouponCode:'MED10',OrderDate:'" +
    new Date() +
    "',CustomerDetails:{MobileNo:'" +
    patientDetails.mobileNumber.substr(3) +
    "',Comm_addr:'" +
    deliveryAddress +
    "',Del_addr:'" +
    deliveryAddress +
    "',FirstName:'" +
    patientDetails.firstName +
    "',LastName:'" +
    patientDetails.lastName +
    "',City:'" +
    deliveryCity +
    "',PostCode:'" +
    deliveryZipcode +
    "',MailId:'" +
    patientDetails.emailAddress +
    "',Age:" +
    patientAge +
    ",CardNo:null,PatientName:'" +
    patientDetails.firstName +
    "'},PaymentDetails:{TotalAmount:" +
    medicinePaymentInput.amountPaid +
    ",PaymentSource:'" +
    medicinePaymentInput.paymentType +
    "',PaymentStatus:'" +
    payStatus +
    "',PaymentOrderId:'" +
    medicinePaymentInput.paymentRefId +
    "'},ItemDetails:" +
    orderLineItemsStr +
    ',PrescUrl:' +
    orderPrescriptionUrlStr +
    '}}';*/
  const orderStatusAttrs: Partial<MedicineOrdersStatus> = {
    orderStatus: MEDICINE_ORDER_STATUS.PAYMENT_SUCCESS,
    medicineOrders: orderDetails,
    statusDate: new Date(),
    statusMessage: 'order payment done successfully',
  };
  await medicineOrdersRepo.saveMedicineOrderStatus(orderStatusAttrs, orderDetails.orderAutoId);
  await medicineOrdersRepo.updateMedicineOrderDetails(
    orderDetails.id,
    orderDetails.orderAutoId,
    new Date(),
    MEDICINE_ORDER_STATUS.PAYMENT_SUCCESS
  );
  errorCode = 0;
  errorMessage = '';
  paymentOrderId = savePaymentDetails.id;
  orderStatus = MEDICINE_ORDER_STATUS.PAYMENT_SUCCESS;

  //medicine order in queue starts
  const serviceBusConnectionString =
    'Endpoint=sb://apollodevpopcorn.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=zBbU2kCqxiBny22Zj7rCefaM930uJUYGKw3L/4AqNeQ=';
  const azureServiceBus = new ServiceBusService(serviceBusConnectionString);
  azureServiceBus.createTopicIfNotExists('orders', (topicError) => {
    if (topicError) {
      console.log('topic create error', topicError);
    }
    console.log('connected to topic orders');
    const message = 'MEDICINE_ORDER:' + orderDetails.orderAutoId + ':' + patientDetails.id;
    azureServiceBus.sendTopicMessage('orders', message, (sendMsgError) => {
      if (sendMsgError) {
        console.log('send message error', sendMsgError);
      }
      console.log('message sent to topic');
      /*azureServiceBus.createSubscription('orders', 'supplier1', (error3) => {
        if (error3) {
          console.log('subscription error', error3);
        }
        azureServiceBus.receiveSubscriptionMessage('orders', 'supplier1', (error4, result) => {
          if (error4) {
            console.log('read error', error4);
          }
          console.log('message from topic', result.body);
        });
      });*/
    });
  });
  //medicine order in queue ends

  /*console.log('medicineOrderPharma', medicineOrderPharma);
  const placeOrderUrl = process.env.PHARMACY_MED_PLACE_ORDERS
    ? process.env.PHARMACY_MED_PLACE_ORDERS
    : '';
  const placeOrderToken = process.env.PHARMACY_ORDER_TOKEN ? process.env.PHARMACY_ORDER_TOKEN : '';
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
  const pharmaResp = await fetch(placeOrderUrl, {
    method: 'POST',
    body: JSON.stringify(medicineOrderPharma),
    headers: { 'Content-Type': 'application/json', Token: placeOrderToken },
  }).catch((error) => {
    console.log('pharma_payment_error', error);
    throw new AphError(AphErrorMessages.SAVE_MEDICINE_ORDER_PAYMENT_ERROR);
  });

  console.log('pharmaResp===>', pharmaResp);

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

  console.log(pharmaResp, 'pharmaResp');
  const textRes = await pharmaResp.text();
  log(
    'profileServiceLogger',
    'API_CALL_RESPONSE',
    'SaveMedicineOrderPayment()->API_CALL_RESPONSE',
    textRes,
    ''
  );

  const orderResp: PharmaResponse = JSON.parse(textRes);
  console.log(orderResp, 'respp', orderResp.ordersResult.Message);
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
  }*/

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
