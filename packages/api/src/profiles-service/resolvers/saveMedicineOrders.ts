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
  MedicineOrderLineItems,
  MedicineOrderPayments,
} from 'profiles-service/entities';
import { Resolver } from 'api-gateway';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

export const saveMedicineOrderTypeDefs = gql`
  enum MEDICINE_ORDER_STATUS {
    QUOTE
    ORDERED
    DELIVERED
    CANCELLED
    ON_THE_WAY
    PICKEDUP
  }

  enum MEDICINE_DELIVERY_TYPE {
    HOME_DELIVERY
    STORE_PICK_UP
  }

  enum MEDICINE_ORDER_TYPE {
    UPLOAD_PRESCRIPTION
    CART_ORDER
  }

  enum MEDICINE_ORDER_PAYMENT_TYPE {
    COD
    ONLINE
    NO_PAYMENT
  }

  input MedicineCartInput {
    quoteId: String
    shopId: String
    estimatedAmount: Float
    patientId: ID!
    medicineDeliveryType: MEDICINE_DELIVERY_TYPE!
    patinetAddressId: ID
    devliveryCharges: Float
    items: [MedicineCartItem]
    payment: MedicinePaymentDetails
  }

  input MedicineCartItem {
    medicineSku: String
    medicineName: String
    price: Float
    quantity: Int
    mrp: Float
    isPrescriptionNeeded: Int
    prescriptionImage: String
  }

  input MedicinePaymentDetails {
    paymentType: MEDICINE_ORDER_PAYMENT_TYPE
    amountPaid: Float
    paymentRefId: String
    paymentStatus: String
    paymentDateTime: DateTime
  }

  type SaveMedicineOrderResult {
    status: String
    errorCode: Int
    errorMessage: String
    orderId: ID!
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
  patinetAddressId: string;
  devliveryCharges: number;
  items: MedicineCartItem[];
  payment: MedicinePaymentDetails;
};

type MedicineCartItem = {
  medicineSku: string;
  medicineName: string;
  price: number;
  quantity: number;
  mrp: number;
  isPrescriptionNeeded: number;
  prescriptionImage: string;
};

type MedicinePaymentDetails = {
  paymentType: MEDICINE_ORDER_PAYMENT_TYPE;
  amountPaid: number;
  paymentRefId: string;
  paymentStatus: string;
  paymentDateTime: Date;
};

type SaveMedicineOrderResult = {
  status: string;
  errorCode: number;
  errorMessage: string;
  orderId: string;
};

type MedicineCartInputInputArgs = { MedicineCartInput: MedicineCartInput };

const SaveMedicineOrder: Resolver<
  null,
  MedicineCartInputInputArgs,
  ProfilesServiceContext,
  SaveMedicineOrderResult
> = async (parent, { MedicineCartInput }, { profilesDb }) => {
  console.log(MedicineCartInput, 'input');
  const errorCode = 0,
    errorMessage = '',
    status = 'Accepted';

  if (!MedicineCartInput.items || MedicineCartInput.items.length == 0) {
    throw new AphError(AphErrorMessages.CART_EMPTY_ERROR, undefined, {});
  }
  const patientRepo = profilesDb.getCustomRepository(PatientRepository);
  const patientDetails = await patientRepo.findById(MedicineCartInput.patientId);
  if (!patientDetails) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }
  const medicineOrderattrs: Partial<MedicineOrders> = {
    patient: patientDetails,
    estimatedAmount: MedicineCartInput.estimatedAmount,
    orderType: MEDICINE_ORDER_TYPE.CART_ORDER,
    shopId: MedicineCartInput.shopId,
    quoteDateTime: new Date(),
    status: MEDICINE_ORDER_STATUS.QUOTE,
    devliveryCharges: MedicineCartInput.devliveryCharges,
    deliveryType: MedicineCartInput.medicineDeliveryType,
    quoteId: MedicineCartInput.quoteId,
  };
  const medicineOrdersRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
  const saveOrder = await medicineOrdersRepo.saveMedicineOrder(medicineOrderattrs);
  if (saveOrder) {
    MedicineCartInput.items.map(async (item) => {
      const orderItemAttrs: Partial<MedicineOrderLineItems> = {
        medicineOrders: saveOrder,
        medicineSKU: item.medicineSku,
        ...item,
      };
      const lineItemOrder = await medicineOrdersRepo.saveMedicineOrderLineItem(orderItemAttrs);
      console.log(lineItemOrder);
    });
  }

  if (MedicineCartInput.payment.paymentType !== MEDICINE_ORDER_PAYMENT_TYPE.NO_PAYMENT) {
    const paymentAttrs: Partial<MedicineOrderPayments> = {
      medicineOrders: saveOrder,
      paymentDateTime: MedicineCartInput.payment.paymentDateTime,
      paymentStatus: MedicineCartInput.payment.paymentStatus,
      paymentType: MedicineCartInput.payment.paymentType,
      amountPaid: MedicineCartInput.payment.amountPaid,
      paymentRefId: MedicineCartInput.payment.paymentRefId,
    };
    await medicineOrdersRepo.saveMedicineOrderPayment(paymentAttrs);
  }
  console.log(saveOrder, 'save order');

  return { status, errorCode, errorMessage, orderId: saveOrder.id };
};

export const saveMedicineOrderResolvers = {
  Mutation: {
    SaveMedicineOrder,
  },
};
