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
import fetch from 'node-fetch';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { PatientAddressRepository } from 'profiles-service/repositories/patientAddressRepository';
import { PharmaLineItem, PharmaResponse, PrescriptionUrl } from 'types/medicineOrderTypes';
import { differenceInYears } from 'date-fns';

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
  const patientDetails = await patientRepo.findById(orderDetails.patient.id);
  if (!patientDetails) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }
  const patientAddressRepo = profilesDb.getCustomRepository(PatientAddressRepository);
  const patientAddressDetails = await patientAddressRepo.findById(orderDetails.patientAddressId);
  if (!patientAddressDetails) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ADDRESS_ID, undefined, {});
  }

  const orderLineItems: PharmaLineItem[] = [];
  const orderPrescriptionUrl: PrescriptionUrl[] = [];
  orderDetails.medicineOrderLineItems.map((item) => {
    const lineItem = {
      ItemID: item.medicineSKU,
      ItemName: item.medicineName,
      Qty: item.quantity,
      PackSize: item.mou,
      Price: item.price,
      Status: true,
    };
    orderLineItems.push(lineItem);
  });
  const prescriptionImages = orderDetails.prescriptionImageUrl.split(',');
  if (prescriptionImages.length > 0) {
    prescriptionImages.map((imageUrl) => {
      const url = {
        url: imageUrl,
      };
      orderPrescriptionUrl.push(url);
    });
  }
  const medicineOrderPharma = {
    tpdetails: {
      OrderId: '123456224',
      ShopId: 91905,
      ShippingMethod: 'Home Delivery',
      RequestType: 'CART',
      PaymentMethod: 'CASHLESS',
      VendorName: '*****',
      DotorName: 'Apollo',
      OrderType: 'Pharma',
      StateCode: 'Telangana',
      TAT: null,
      CouponCode: 'MED10',
      OrderDate: new Date(),
      CustomerDetails: {
        MobileNo: patientDetails.mobileNumber.substr(3),
        Comm_addr: patientAddressDetails.city,
        Del_addr: patientAddressDetails.city,
        FirstName: patientDetails.firstName,
        LastName: patientDetails.lastName,
        City: patientAddressDetails.city,
        PostCode: patientAddressDetails.zipcode,
        MailId: patientDetails.emailAddress,
        Age: Math.abs(differenceInYears(new Date(), patientDetails.dateOfBirth)),
        CardNo: null,
        PatientName: patientDetails.firstName,
      },
      PaymentDetails: {
        TotalAmount: medicinePaymentInput.amountPaid,
        PaymentSource: 'CASHLESS',
        PaymentStatus: medicinePaymentInput.paymentStatus,
        PaymentOrderId: medicinePaymentInput.paymentRefId,
      },
      ItemDetails: orderLineItems,
      PrescUrl: orderPrescriptionUrl,
    },
  };

  console.log('medicineOrderPharma', medicineOrderPharma);

  const pharmaResp = await fetch(
    'http://online.apollopharmacy.org:51/POPCORN/OrderPlace.svc/Place_orders',
    {
      method: 'POST',
      body: JSON.stringify(medicineOrderPharma),
      headers: { 'Content-Type': 'application/json', Token: '9f15bdd0fcd5423190c2e877ba0228A24' },
    }
  );

  const textRes = await pharmaResp.text();
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
