import gql from 'graphql-tag';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { MedicineOrdersRepository } from 'profiles-service/repositories/MedicineOrdersRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import {
  MedicineOrders,
  MEDICINE_DELIVERY_TYPE,
  MEDICINE_ORDER_TYPE,
  MedicineOrderLineItems,
  MEDICINE_ORDER_STATUS,
  MedicineOrdersStatus,
  BOOKING_SOURCE,
  DEVICE_TYPE,
} from 'profiles-service/entities';
// import { BOOKINGSOURCE, DEVICETYPE } from 'consults-service/entities';
import { Resolver } from 'api-gateway';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { PatientAddressRepository } from 'profiles-service/repositories/patientAddressRepository';

export const saveMedicineOrderTypeDefs = gql`
  enum MEDICINE_ORDER_STATUS {
    QUOTE
    PAYMENT_SUCCESS
    PAYMENT_PENDING
    PAYMENT_FAILED
    ORDER_INITIATED
    ORDER_PLACED
    ORDER_VERIFIED
    DELIVERED
    CANCELLED
    OUT_FOR_DELIVERY
    PICKEDUP
    RETURN_INITIATED
    ITEMS_RETURNED
    RETURN_ACCEPTED
    PRESCRIPTION_UPLOADED
    ORDER_FAILED
    PRESCRIPTION_CART_READY
    ORDER_CONFIRMED
    CANCEL_REQUEST
    READY_AT_STORE
  }

  enum MEDICINE_DELIVERY_TYPE {
    HOME_DELIVERY
    STORE_PICKUP
  }

  enum MEDICINE_ORDER_TYPE {
    UPLOAD_PRESCRIPTION
    CART_ORDER
  }

  input MedicineCartInput {
    quoteId: String
    shopId: String
    estimatedAmount: Float
    patientId: ID!
    medicineDeliveryType: MEDICINE_DELIVERY_TYPE!
    bookingSource: BOOKINGSOURCE
    deviceType: DEVICETYPE
    patientAddressId: ID!
    devliveryCharges: Float
    prescriptionImageUrl: String
    prismPrescriptionFileId: String
    orderTat: String
    items: [MedicineCartItem]
  }

  input MedicineCartItem {
    medicineSKU: String
    medicineName: String
    price: Float
    quantity: Int
    mrp: Float
    isPrescriptionNeeded: Int
    prescriptionImageUrl: String
    prismPrescriptionFileId: String
    mou: Int
    isMedicine: String
  }

  type SaveMedicineOrderResult {
    errorCode: Int
    errorMessage: String
    orderId: ID!
    orderAutoId: Int!
  }

  extend type Mutation {
    SaveMedicineOrder(MedicineCartInput: MedicineCartInput): SaveMedicineOrderResult!
  }
`;

type MedicineCartInput = {
  quoteId: string;
  shopId: string;
  estimatedAmount: number;
  patientId: string;
  medicineDeliveryType: MEDICINE_DELIVERY_TYPE;
  patientAddressId: string;
  devliveryCharges: number;
  prescriptionImageUrl: string;
  prismPrescriptionFileId: string;
  orderTat: string;
  bookingSource: BOOKING_SOURCE;
  deviceType: DEVICE_TYPE;
  items: MedicineCartItem[];
};

type MedicineCartItem = {
  medicineSku: string;
  medicineName: string;
  price: number;
  quantity: number;
  mrp: number;
  isPrescriptionNeeded: number;
  prescriptionImageUrl: string;
  prismPrescriptionFileId: string;
  mou: number;
  isMedicine: string;
};

type SaveMedicineOrderResult = {
  errorCode: number;
  errorMessage: string;
  orderId: string;
  orderAutoId: number;
};

type MedicineCartInputInputArgs = { MedicineCartInput: MedicineCartInput };

const SaveMedicineOrder: Resolver<
  null,
  MedicineCartInputInputArgs,
  ProfilesServiceContext,
  SaveMedicineOrderResult
> = async (parent, { MedicineCartInput }, { profilesDb }) => {
  const errorCode = 0,
    errorMessage = '';

  if (!MedicineCartInput.items || MedicineCartInput.items.length == 0) {
    throw new AphError(AphErrorMessages.CART_EMPTY_ERROR, undefined, {});
  }
  const patientRepo = profilesDb.getCustomRepository(PatientRepository);
  const patientDetails = await patientRepo.findById(MedicineCartInput.patientId);
  if (!patientDetails) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }
  if (MedicineCartInput.patientAddressId != '' && MedicineCartInput.patientAddressId != null) {
    const patientAddressRepo = profilesDb.getCustomRepository(PatientAddressRepository);
    const patientAddressDetails = await patientAddressRepo.findById(
      MedicineCartInput.patientAddressId
    );
    if (!patientAddressDetails) {
      throw new AphError(AphErrorMessages.INVALID_PATIENT_ADDRESS_ID, undefined, {});
    }
  }

  const medicineOrderattrs: Partial<MedicineOrders> = {
    patient: patientDetails,
    estimatedAmount: MedicineCartInput.estimatedAmount,
    orderType: MEDICINE_ORDER_TYPE.CART_ORDER,
    shopId: MedicineCartInput.shopId,
    quoteDateTime: new Date(),
    devliveryCharges: MedicineCartInput.devliveryCharges,
    deliveryType: MedicineCartInput.medicineDeliveryType,
    quoteId: MedicineCartInput.quoteId,
    prescriptionImageUrl: MedicineCartInput.prescriptionImageUrl,
    prismPrescriptionFileId: MedicineCartInput.prismPrescriptionFileId,
    currentStatus: MEDICINE_ORDER_STATUS.QUOTE,
    orderTat: MedicineCartInput.orderTat,
    bookingSource: MedicineCartInput.bookingSource,
    deviceType: MedicineCartInput.deviceType,
    patientAddressId: MedicineCartInput.patientAddressId,
  };

  const medicineOrdersRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
  const saveOrder = await medicineOrdersRepo.saveMedicineOrder(medicineOrderattrs);
  if (saveOrder) {
    MedicineCartInput.items.map(async (item) => {
      const orderItemAttrs: Partial<MedicineOrderLineItems> = {
        medicineOrders: saveOrder,
        ...item,
      };
      const lineItemOrder = await medicineOrdersRepo.saveMedicineOrderLineItem(orderItemAttrs);
      console.log(lineItemOrder);
    });

    //save in order status table
    const medicineOrderStatusAttrs: Partial<MedicineOrdersStatus> = {
      medicineOrders: saveOrder,
      orderStatus: MEDICINE_ORDER_STATUS.QUOTE,
      statusDate: new Date(),
      hideStatus: false,
    };
    await medicineOrdersRepo.saveMedicineOrderStatus(
      medicineOrderStatusAttrs,
      saveOrder.orderAutoId
    );
  }

  return {
    errorCode,
    errorMessage,
    orderId: saveOrder.id,
    orderAutoId: saveOrder.orderAutoId,
  };
};

export const saveMedicineOrderResolvers = {
  Mutation: {
    SaveMedicineOrder,
  },
};
