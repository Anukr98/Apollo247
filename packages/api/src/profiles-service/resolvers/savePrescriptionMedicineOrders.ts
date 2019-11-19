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
  MedicineOrdersStatus,
  PHARMA_CART_TYPE,
} from 'profiles-service/entities';
import { Resolver } from 'api-gateway';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { PatientAddressRepository } from 'profiles-service/repositories/patientAddressRepository';
import { PharmaResponse, PrescriptionUrl } from 'types/medicineOrderTypes';
import fetch from 'node-fetch';
import { differenceInYears } from 'date-fns';

export const savePrescriptionMedicineOrderTypeDefs = gql`
  input PrescriptionMedicineInput {
    quoteId: String
    shopId: String
    patientId: ID!
    medicineDeliveryType: MEDICINE_DELIVERY_TYPE!
    patinetAddressId: ID
    prescriptionImageUrl: String!
    prismPrescriptionFileId: String!
    appointmentId: String
    payment: PrescriptionMedicinePaymentDetails
  }

  input PrescriptionMedicinePaymentDetails {
    paymentType: MEDICINE_ORDER_PAYMENT_TYPE
    amountPaid: Float
    paymentRefId: String
    paymentStatus: String
    paymentDateTime: DateTime
  }

  type SavePrescriptionMedicineOrderResult {
    status: MEDICINE_ORDER_STATUS!
    orderId: ID!
    orderAutoId: Int!
    errorCode: Int!
    errorMessage: String!
  }

  extend type Mutation {
    SavePrescriptionMedicineOrder(
      prescriptionMedicineInput: PrescriptionMedicineInput
    ): SavePrescriptionMedicineOrderResult!
  }
`;

type PrescriptionMedicineInput = {
  quoteId: string;
  shopId: string;
  patientId: string;
  medicineDeliveryType: MEDICINE_DELIVERY_TYPE;
  patinetAddressId: string;
  prescriptionImageUrl: string;
  prismPrescriptionFileId: string;
  appointmentId: string;
  payment?: PrescriptionMedicinePaymentDetails;
};

type PrescriptionMedicinePaymentDetails = {
  paymentType: MEDICINE_ORDER_PAYMENT_TYPE;
  amountPaid: number;
  paymentRefId: string;
  paymentStatus: string;
  paymentDateTime: Date;
};

type SavePrescriptionMedicineOrderResult = {
  status: MEDICINE_ORDER_STATUS;
  orderId: string;
  orderAutoId: number;
  errorCode: number;
  errorMessage: string;
};

type PrescriptionMedicineInputInputArgs = { prescriptionMedicineInput: PrescriptionMedicineInput };

const SavePrescriptionMedicineOrder: Resolver<
  null,
  PrescriptionMedicineInputInputArgs,
  ProfilesServiceContext,
  SavePrescriptionMedicineOrderResult
> = async (parent, { prescriptionMedicineInput }, { profilesDb }) => {
  let errorCode = 0,
    errorMessage = '',
    orderStatus: MEDICINE_ORDER_STATUS = MEDICINE_ORDER_STATUS.QUOTE;
  const patientRepo = profilesDb.getCustomRepository(PatientRepository);
  const patientDetails = await patientRepo.findById(prescriptionMedicineInput.patientId);
  if (!patientDetails) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }
  const medicineOrderattrs: Partial<MedicineOrders> = {
    patient: patientDetails,
    orderType: MEDICINE_ORDER_TYPE.UPLOAD_PRESCRIPTION,
    shopId: prescriptionMedicineInput.shopId,
    quoteDateTime: new Date(),
    deliveryType: prescriptionMedicineInput.medicineDeliveryType,
    quoteId: prescriptionMedicineInput.quoteId,
    appointmentId: prescriptionMedicineInput.appointmentId,
    prescriptionImageUrl: prescriptionMedicineInput.prescriptionImageUrl,
    prismPrescriptionFileId: prescriptionMedicineInput.prismPrescriptionFileId,
    estimatedAmount: 0.0,
    devliveryCharges: 0.0,
    patientAddressId: prescriptionMedicineInput.patinetAddressId,
    currentStatus: MEDICINE_ORDER_STATUS.PRESCRIPTION_UPLOADED,
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
    let deliveryCity = 'Kakinada',
      deliveryZipcode = '500034',
      deliveryAddress = 'Kakinada';
    if (saveOrder.patientAddressId != null && saveOrder.patientAddressId != '') {
      const patientAddressRepo = profilesDb.getCustomRepository(PatientAddressRepository);
      const patientAddressDetails = await patientAddressRepo.findById(saveOrder.patientAddressId);
      if (!patientAddressDetails) {
        throw new AphError(AphErrorMessages.INVALID_PATIENT_ADDRESS_ID, undefined, {});
      }

      deliveryAddress =
        patientAddressDetails.addressLine1 + ' ' + patientAddressDetails.addressLine2;
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
    let selShopId = '15288';
    if (saveOrder.shopId != '' && saveOrder.shopId != null) {
      selShopId = saveOrder.shopId;
    }
    let patientAge = 30;
    if (patientDetails.dateOfBirth && patientDetails.dateOfBirth != null) {
      patientAge = Math.abs(differenceInYears(new Date(), patientDetails.dateOfBirth));
    }
    const medicineOrderPharma = {
      tpdetails: {
        OrderId: saveOrder.orderAutoId,
        ShopId: selShopId,
        ShippingMethod: saveOrder.deliveryType.replace('_', ' '),
        RequestType: PHARMA_CART_TYPE.NONCART,
        PaymentMethod: MEDICINE_ORDER_PAYMENT_TYPE.CASHLESS,
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
        PaymentDetails: {},
        ItemDetails: [],
        PrescUrl: orderPrescriptionUrl,
      },
    };

    console.log('prescmedicineOrderPharma', medicineOrderPharma);
    const placeOrderUrl = process.env.PHARMACY_MED_PLACE_ORDERS
      ? process.env.PHARMACY_MED_PLACE_ORDERS
      : '';
    const placeOrderToken = process.env.PHARMACY_ORDER_TOKEN
      ? process.env.PHARMACY_ORDER_TOKEN
      : '';
    if (placeOrderUrl == '' || placeOrderToken == '') {
      throw new AphError(AphErrorMessages.INVALID_PHARMA_ORDER_URL, undefined, {});
    }
    const pharmaResp = await fetch(placeOrderUrl, {
      method: 'POST',
      body: JSON.stringify(medicineOrderPharma),
      headers: { 'Content-Type': 'application/json', Token: placeOrderToken },
    });

    if (pharmaResp.status == 400 || pharmaResp.status == 404) {
      throw new AphError(AphErrorMessages.SOMETHING_WENT_WRONG, undefined, {});
    }

    const textRes = await pharmaResp.text();
    const orderResp: PharmaResponse = JSON.parse(textRes);
    console.log(orderResp, 'respp', orderResp.ordersResult.Message);
    if (orderResp.ordersResult.Status === false) {
      errorCode = -1;
      errorMessage = orderResp.ordersResult.Message;
      orderStatus = MEDICINE_ORDER_STATUS.ORDER_FAILED;
    } else {
      const orderStatusAttrs: Partial<MedicineOrdersStatus> = {
        orderStatus: MEDICINE_ORDER_STATUS.ORDER_PLACED,
        medicineOrders: saveOrder,
        statusDate: new Date(),
        statusMessage: orderResp.ordersResult.Message,
      };
      await medicineOrdersRepo.saveMedicineOrderStatus(orderStatusAttrs, saveOrder.orderAutoId);
      await medicineOrdersRepo.updateMedicineOrderDetails(
        saveOrder.id,
        saveOrder.orderAutoId,
        new Date(),
        MEDICINE_ORDER_STATUS.ORDER_PLACED
      );
      errorCode = 0;
      errorMessage = orderResp.ordersResult.Message;
      orderStatus = MEDICINE_ORDER_STATUS.PRESCRIPTION_UPLOADED;
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

export const savePrescriptionMedicineOrderResolvers = {
  Mutation: {
    SavePrescriptionMedicineOrder,
  },
};
