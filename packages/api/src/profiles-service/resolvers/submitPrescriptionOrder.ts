import gql from 'graphql-tag';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { MedicineOrdersRepository } from 'profiles-service/repositories/MedicineOrdersRepository';
import {
  MEDICINE_ORDER_STATUS,
  MedicineOrdersStatus,
  MEDICINE_ORDER_PAYMENT_TYPE,
} from 'profiles-service/entities';
import { Resolver } from 'api-gateway';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { PatientAddressRepository } from 'profiles-service/repositories/patientAddressRepository';
import { PharmaLineItem, PharmaResponse, PrescriptionUrl } from 'types/medicineOrderTypes';
import { differenceInYears } from 'date-fns';

export const submitPrescriptionOrderTypeDefs = gql`
  input SubmitPrescriptionOrderInput {
    orderId: Int
    paymentType: MEDICINE_ORDER_PAYMENT_TYPE!
    amountPaid: Float!
    paymentRefId: String
    paymentStatus: String
    paymentDateTime: DateTime
    responseCode: String
    responseMessage: String
    bankTxnId: String
  }

  type PrescriptionOrderResult {
    orderStatus: MEDICINE_ORDER_STATUS
    errorCode: Int
    errorMessage: String
  }

  extend type Mutation {
    submitPrescriptionOrder(
      submitPrescriptionOrderInput: SubmitPrescriptionOrderInput
    ): PrescriptionOrderResult!
  }
`;

type SubmitPrescriptionOrderInput = {
  orderId: number;
  paymentType: MEDICINE_ORDER_PAYMENT_TYPE;
  amountPaid: number;
  paymentRefId: string;
  paymentStatus: string;
  paymentDateTime: Date;
  responseCode: string;
  responseMessage: string;
  bankTxnId: string;
};

type PrescriptionOrderResult = {
  orderStatus: MEDICINE_ORDER_STATUS;
  errorCode: number;
  errorMessage: string;
};

type SubmitPrescriptionOrderInputArgs = {
  submitPrescriptionOrderInput: SubmitPrescriptionOrderInput;
};

const submitPrescriptionOrder: Resolver<
  null,
  SubmitPrescriptionOrderInputArgs,
  ProfilesServiceContext,
  PrescriptionOrderResult
> = async (parent, { submitPrescriptionOrderInput }, { profilesDb }) => {
  let errorCode = 0,
    errorMessage = '',
    orderStatus = MEDICINE_ORDER_STATUS.ORDER_PLACED;

  const medicineOrdersRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
  const orderDetails = await medicineOrdersRepo.getMedicineOrderDetails(
    submitPrescriptionOrderInput.orderId
  );
  if (!orderDetails) {
    throw new AphError(AphErrorMessages.INVALID_MEDICINE_ORDER_ID, undefined, {});
  }
  const patientRepo = profilesDb.getCustomRepository(PatientRepository);
  const patientDetails = await patientRepo.findById(orderDetails.patient.id);
  let deliveryCity = 'Kakinada',
    deliveryZipcode = '500034';
  if (!patientDetails) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }
  if (orderDetails.patientAddressId !== '' && orderDetails.patientAddressId !== null) {
    const patientAddressRepo = profilesDb.getCustomRepository(PatientAddressRepository);
    const patientAddressDetails = await patientAddressRepo.findById(orderDetails.patientAddressId);
    if (!patientAddressDetails) {
      throw new AphError(AphErrorMessages.INVALID_PATIENT_ADDRESS_ID, undefined, {});
    }
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
  const prescriptionImages = orderDetails.prescriptionImageUrl.split(',');
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
  const medicineOrderPharma = {
    tpdetails: {
      OrderId: orderDetails.orderAutoId,
      ShopId: selShopId,
      ShippingMethod: orderDetails.deliveryType.replace('_', ' '),
      RequestType: 'ORDER_CONFIRM',
      PaymentMethod: submitPrescriptionOrderInput.paymentType,
      VendorName: '*****',
      DotorName: 'Apollo',
      OrderType: 'Pharma',
      StateCode: 'Telangana',
      TAT: null,
      CouponCode: 'MED10',
      OrderDate: new Date(),
      CustomerDetails: {
        MobileNo: patientDetails.mobileNumber.substr(3),
        Comm_addr: deliveryCity,
        Del_addr: deliveryCity,
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
        TotalAmount: submitPrescriptionOrderInput.amountPaid,
        PaymentSource: submitPrescriptionOrderInput.paymentType,
        PaymentStatus: submitPrescriptionOrderInput.paymentStatus,
        PaymentOrderId: submitPrescriptionOrderInput.paymentRefId,
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

  if (pharmaResp.status == 400) {
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
    orderStatus = MEDICINE_ORDER_STATUS.ORDER_PLACED;
  }

  return { orderStatus, errorCode, errorMessage };
};

export const submitPrescriptionOrderResolvers = {
  Mutation: {
    submitPrescriptionOrder,
  },
};
