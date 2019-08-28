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
  }

  extend type Mutation {
    SavePrescriptionMedicineOrder(
      PrescriptionMedicineInput: PrescriptionMedicineInput
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
  payment: PrescriptionMedicinePaymentDetails;
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
};

type PrescriptionMedicineInputInputArgs = { PrescriptionMedicineInput: PrescriptionMedicineInput };

const SavePrescriptionMedicineOrder: Resolver<
  null,
  PrescriptionMedicineInputInputArgs,
  ProfilesServiceContext,
  SavePrescriptionMedicineOrderResult
> = async (parent, { PrescriptionMedicineInput }, { profilesDb }) => {
  const patientRepo = profilesDb.getCustomRepository(PatientRepository);
  const patientDetails = await patientRepo.findById(PrescriptionMedicineInput.patientId);
  if (!patientDetails) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }
  const medicineOrderattrs: Partial<MedicineOrders> = {
    patient: patientDetails,
    orderType: MEDICINE_ORDER_TYPE.UPLOAD_PRESCRIPTION,
    shopId: PrescriptionMedicineInput.shopId,
    quoteDateTime: new Date(),
    status: MEDICINE_ORDER_STATUS.QUOTE,
    deliveryType: PrescriptionMedicineInput.medicineDeliveryType,
    quoteId: PrescriptionMedicineInput.quoteId,
    appointmentId: PrescriptionMedicineInput.appointmentId,
    prescriptionImageUrl: PrescriptionMedicineInput.prescriptionImageUrl,
    estimatedAmount: 0.0,
    devliveryCharges: 0.0,
  };
  const medicineOrdersRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
  const saveOrder = await medicineOrdersRepo.saveMedicineOrder(medicineOrderattrs);

  if (PrescriptionMedicineInput.payment.paymentType !== MEDICINE_ORDER_PAYMENT_TYPE.NO_PAYMENT) {
    const paymentAttrs: Partial<MedicineOrderPayments> = {
      medicineOrders: saveOrder,
      paymentDateTime: PrescriptionMedicineInput.payment.paymentDateTime,
      paymentStatus: PrescriptionMedicineInput.payment.paymentStatus,
      paymentType: PrescriptionMedicineInput.payment.paymentType,
      amountPaid: PrescriptionMedicineInput.payment.amountPaid,
      paymentRefId: PrescriptionMedicineInput.payment.paymentRefId,
    };
    await medicineOrdersRepo.saveMedicineOrderPayment(paymentAttrs);
  }
  return { status: MEDICINE_ORDER_STATUS.QUOTE, orderId: saveOrder.id };
};

export const savePrescriptionMedicineOrderResolvers = {
  Mutation: {
    SavePrescriptionMedicineOrder,
  },
};
