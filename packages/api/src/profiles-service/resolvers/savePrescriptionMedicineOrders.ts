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
  MedicineOrderPayments,
  MedicineOrdersStatus,
} from 'profiles-service/entities';
import { Resolver } from 'api-gateway';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

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
    status: MEDICINE_ORDER_STATUS
    orderId: ID!
    orderAutoId: Int
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
};

type PrescriptionMedicineInputInputArgs = { prescriptionMedicineInput: PrescriptionMedicineInput };

const SavePrescriptionMedicineOrder: Resolver<
  null,
  PrescriptionMedicineInputInputArgs,
  ProfilesServiceContext,
  SavePrescriptionMedicineOrderResult
> = async (parent, { prescriptionMedicineInput }, { profilesDb }) => {
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
  };
  const medicineOrdersRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
  const saveOrder = await medicineOrdersRepo.saveMedicineOrder(medicineOrderattrs);

  if (saveOrder) {
    const orderStatusAttrs: Partial<MedicineOrdersStatus> = {
      orderStatus: MEDICINE_ORDER_STATUS.ORDER_PLACED,
      medicineOrders: saveOrder,
      statusDate: new Date(),
    };
    await medicineOrdersRepo.saveMedicineOrderStatus(orderStatusAttrs);
  }

  if (
    prescriptionMedicineInput.payment &&
    prescriptionMedicineInput.payment.paymentType !== MEDICINE_ORDER_PAYMENT_TYPE.NO_PAYMENT
  ) {
    const paymentAttrs: Partial<MedicineOrderPayments> = {
      medicineOrders: saveOrder,
      paymentDateTime: prescriptionMedicineInput.payment.paymentDateTime,
      paymentStatus: prescriptionMedicineInput.payment.paymentStatus,
      paymentType: prescriptionMedicineInput.payment.paymentType,
      amountPaid: prescriptionMedicineInput.payment.amountPaid,
      paymentRefId: prescriptionMedicineInput.payment.paymentRefId,
    };
    await medicineOrdersRepo.saveMedicineOrderPayment(paymentAttrs);
  }
  return {
    status: MEDICINE_ORDER_STATUS.ORDER_PLACED,
    orderId: saveOrder.id,
    orderAutoId: saveOrder.orderAutoId,
  };
};

export const savePrescriptionMedicineOrderResolvers = {
  Mutation: {
    SavePrescriptionMedicineOrder,
  },
};
