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
} from 'profiles-service/entities';
import { Resolver } from 'api-gateway';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { PatientAddressRepository } from 'profiles-service/repositories/patientAddressRepository';
import { PharmaResponse } from 'types/medicineOrderTypes';
import fetch from 'node-fetch';

export const savePrescriptionMedicineOrderTypeDefs = gql`
  input PrescriptionMedicineInput {
    quoteId: String
    shopId: String
    patientId: ID!
    medicineDeliveryType: MEDICINE_DELIVERY_TYPE!
    patinetAddressId: ID
    prescriptionImageUrl: String!
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
    const patientAddressRepo = profilesDb.getCustomRepository(PatientAddressRepository);
    const patientAddressDetails = await patientAddressRepo.findById(saveOrder.patientAddressId);
    if (!patientAddressDetails) {
      throw new AphError(AphErrorMessages.INVALID_PATIENT_ADDRESS_ID, undefined, {});
    }
    const medicineOrderPharma = {
      tpdetails: {
        OrderId: '123456226',
        ShopId: 91905,
        ShippingMethod: 'Home Delivery',
        RequestType: 'NONCART',
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
          Age: 30,
          CardNo: null,
          PatientName: patientDetails.firstName,
        },
        PaymentDetails: {},
        ItemDetails: [],
        PrescUrl: [
          {
            url: 'http://13.126.95.18/pub/media/medicine_prescription/beauty.png',
          },
          {
            url: 'http://13.126.95.19/pub/media/medicine_prescription/beauty.png',
          },
        ],
      },
    };

    console.log('prescmedicineOrderPharma', medicineOrderPharma);

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
      orderStatus = MEDICINE_ORDER_STATUS.ORDER_FAILED;
      console.log(orderStatus, 'order status inside');
    } else {
      const orderStatusAttrs: Partial<MedicineOrdersStatus> = {
        orderStatus: MEDICINE_ORDER_STATUS.ORDER_PLACED,
        medicineOrders: saveOrder,
        statusDate: new Date(),
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

    console.log(orderStatus, 'order status');
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
