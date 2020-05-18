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
  BOOKING_SOURCE,
  DEVICE_TYPE,
  MedicineOrdersStatus,
} from 'profiles-service/entities';
import { Resolver } from 'api-gateway';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { PatientAddressRepository } from 'profiles-service/repositories/patientAddressRepository';

export const saveMedicineOrderOMSTypeDefs = gql`
  input MedicineCartOMSInput {
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
    items: [MedicineCartOMSItem]
    coupon: String
    couponDiscount: Float
    productDiscount: Float
  }

  input MedicineCartOMSItem {
    medicineSKU: String
    medicineName: String
    price: Float
    quantity: Int
    mrp: Float
    itemValue: Float
    itemDiscount: Float
    isPrescriptionNeeded: Int
    mou: Int
    isMedicine: String!
  }

  extend type Mutation {
    saveMedicineOrderOMS(medicineCartOMSInput: MedicineCartOMSInput): SaveMedicineOrderResult!
  }
`;

type MedicineCartOMSInput = {
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
  items: MedicineCartOMSItem[];
  coupon: string;
  couponDiscount: number;
  productDiscount: number;
};

type MedicineCartOMSItem = {
  medicineSku: string;
  medicineName: string;
  itemValue: number;
  itemDiscount: number;
  price: number;
  quantity: number;
  mrp: number;
  isPrescriptionNeeded: number;
  mou: number;
  isMedicine: string;
};

type SaveMedicineOrderResult = {
  errorCode: number;
  errorMessage: string;
  orderId: string;
  orderAutoId: number;
};

type MedicineCartOMSInputInputArgs = { medicineCartOMSInput: MedicineCartOMSInput };

const saveMedicineOrderOMS: Resolver<
  null,
  MedicineCartOMSInputInputArgs,
  ProfilesServiceContext,
  SaveMedicineOrderResult
> = async (parent, { medicineCartOMSInput }, { profilesDb }) => {
  const errorCode = 0,
    errorMessage = '';
  if (!medicineCartOMSInput.items || medicineCartOMSInput.items.length == 0) {
    throw new AphError(AphErrorMessages.CART_EMPTY_ERROR, undefined, {});
  }
  const patientRepo = profilesDb.getCustomRepository(PatientRepository);
  const patientDetails = await patientRepo.findById(medicineCartOMSInput.patientId);
  if (!patientDetails) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }
  if (
    medicineCartOMSInput.patientAddressId != '' &&
    medicineCartOMSInput.patientAddressId != null
  ) {
    const patientAddressRepo = profilesDb.getCustomRepository(PatientAddressRepository);
    const patientAddressDetails = await patientAddressRepo.findById(
      medicineCartOMSInput.patientAddressId
    );
    if (!patientAddressDetails) {
      throw new AphError(AphErrorMessages.INVALID_PATIENT_ADDRESS_ID, undefined, {});
    }
  }

  const medicineOrderattrs: Partial<MedicineOrders> = {
    patient: patientDetails,
    estimatedAmount: medicineCartOMSInput.estimatedAmount,
    orderType: MEDICINE_ORDER_TYPE.CART_ORDER,
    shopId: medicineCartOMSInput.shopId,
    quoteDateTime: new Date(),
    devliveryCharges: medicineCartOMSInput.devliveryCharges,
    deliveryType: medicineCartOMSInput.medicineDeliveryType,
    quoteId: medicineCartOMSInput.quoteId,
    prescriptionImageUrl: medicineCartOMSInput.prescriptionImageUrl,
    prismPrescriptionFileId: medicineCartOMSInput.prismPrescriptionFileId,
    currentStatus: MEDICINE_ORDER_STATUS.QUOTE,
    orderTat: medicineCartOMSInput.orderTat,
    bookingSource: medicineCartOMSInput.bookingSource,
    deviceType: medicineCartOMSInput.deviceType,
    patientAddressId: medicineCartOMSInput.patientAddressId,
    coupon: medicineCartOMSInput.coupon,
    couponDiscount: medicineCartOMSInput.couponDiscount,
    productDiscount: medicineCartOMSInput.productDiscount,
    isOmsOrder: true,
  };

  const medicineOrdersRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
  const saveOrder = await medicineOrdersRepo.saveMedicineOrder(medicineOrderattrs);
  if (saveOrder) {
    const medicineOrderLineItems = medicineCartOMSInput.items.map(async (item) => {
      const orderItemAttrs: Partial<MedicineOrderLineItems> = {
        medicineOrders: saveOrder,
        ...item,
      };
      await medicineOrdersRepo.saveMedicineOrderLineItem(orderItemAttrs);
    });
    await Promise.all(medicineOrderLineItems);

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

export const saveMedicineOrderOMSResolvers = {
  Mutation: {
    saveMedicineOrderOMS,
  },
};
