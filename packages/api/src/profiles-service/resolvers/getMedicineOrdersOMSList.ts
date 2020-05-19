import gql from 'graphql-tag';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { MedicineOrdersRepository } from 'profiles-service/repositories/MedicineOrdersRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { MedicineOrders } from 'profiles-service/entities';
import { Resolver } from 'api-gateway';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

export const getMedicineOrdersOMSListTypeDefs = gql`
  type MedicineOrdersOMSListResult {
    medicineOrdersList: [MedicineOrdersOMS]
  }

  type MedicineOrderOMSDetailsResult {
    medicineOrderDetails: MedicineOrdersOMS
  }

  type MedicineOrdersOMS {
    id: ID!
    orderAutoId: Int
    quoteId: String
    shopId: String
    estimatedAmount: Float
    patientId: ID!
    deliveryType: MEDICINE_DELIVERY_TYPE!
    patientAddressId: ID
    quoteDateTime: DateTime
    coupon: String
    devliveryCharges: Float
    prescriptionImageUrl: String
    prismPrescriptionFileId: String
    pharmaRequest: String
    orderTat: String
    orderType: MEDICINE_ORDER_TYPE
    currentStatus: MEDICINE_ORDER_STATUS
    bookingSource: BOOKING_SOURCE
    medicineOrderLineItems: [MedicineOrderOMSLineItems]
    medicineOrderPayments: [MedicineOrderOMSPayments]
    medicineOrdersStatus: [MedicineOrdersOMSStatus]
    medicineOrderShipments: [MedicineOrderOMSShipment]
    patient: Patient
  }

  type MedicineOrderOMSLineItems {
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

  type MedicineOrderOMSShipment {
    id: ID!
    siteId: String
    siteName: String
    apOrderNo: String
    updatedDate: String
    currentStatus: MEDICINE_ORDER_STATUS
    itemDetails: String
    medicineOrdersStatus: [MedicineOrdersOMSStatus]
    medicineOrderInvoice: [MedicineOrderOMSInvoice]
  }

  type MedicineOrderOMSInvoice {
    id: ID!
    siteId: String
    remarks: String
    requestType: String
    vendorName: String
    billDetails: String
    itemDetails: String
  }

  type MedicineOrdersOMSStatus {
    id: ID!
    orderStatus: MEDICINE_ORDER_STATUS
    statusDate: DateTime
    hideStatus: Boolean
  }

  type MedicineOrderOMSPayments {
    id: ID!
    paymentType: MEDICINE_ORDER_PAYMENT_TYPE
    amountPaid: Float
    paymentRefId: String
    paymentStatus: String
    paymentDateTime: Date
    responseCode: String
    responseMessage: String
    bankTxnId: String
  }

  extend type Query {
    getMedicineOrdersOMSList(patientId: String): MedicineOrdersOMSListResult!
    getMedicineOrderOMSDetails(patientId: String, orderAutoId: Int): MedicineOrderOMSDetailsResult!
    getMedicineOMSPaymentOrder: MedicineOrdersOMSListResult!
  }
`;

type MedicineOrdersOMSListResult = {
  medicineOrdersList: MedicineOrders[];
};

type MedicineOrderOMSDetailsResult = {
  medicineOrderDetails: MedicineOrders;
};

const getMedicineOrdersOMSList: Resolver<
  null,
  { patientId: string; orderAutoId?: number },
  ProfilesServiceContext,
  MedicineOrdersOMSListResult
> = async (parent, args, { profilesDb }) => {
  const patientRepo = profilesDb.getCustomRepository(PatientRepository);
  const patientDetails = await patientRepo.findById(args.patientId);
  if (!patientDetails) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }

  const medicineOrdersRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
  const medicineOrdersList = await medicineOrdersRepo.getMedicineOrdersList(args.patientId);
  return { medicineOrdersList };
};

const getMedicineOrderOMSDetails: Resolver<
  null,
  { patientId: string; orderAutoId: number },
  ProfilesServiceContext,
  MedicineOrderOMSDetailsResult
> = async (parent, args, { profilesDb }) => {
  const patientRepo = profilesDb.getCustomRepository(PatientRepository);
  if (args.patientId) {
    const patientDetails = await patientRepo.findById(args.patientId);
    if (!patientDetails) {
      throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
    }
  }
  const medicineOrdersRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
  let medicineOrderDetails;
  if (!args.patientId) {
    medicineOrderDetails = await medicineOrdersRepo.getMedicineOrderDetailsByOderId(
      args.orderAutoId
    );
  } else {
    medicineOrderDetails = await medicineOrdersRepo.getMedicineOrderById(
      args.patientId,
      args.orderAutoId
    );
  }
  if (!medicineOrderDetails) {
    throw new AphError(AphErrorMessages.INVALID_MEDICINE_ORDER_ID, undefined, {});
  }
  return { medicineOrderDetails };
};

const getMedicineOMSPaymentOrder: Resolver<
  null,
  {},
  ProfilesServiceContext,
  MedicineOrdersOMSListResult
> = async (parent, args, { profilesDb }) => {
  const medicineOrdersRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
  const medicineOrdersList = await medicineOrdersRepo.getPaymentMedicineOrders();
  return { medicineOrdersList };
};

export const getMedicineOrdersOMSListResolvers = {
  Query: {
    getMedicineOrdersOMSList,
    getMedicineOrderOMSDetails,
    getMedicineOMSPaymentOrder,
  },
};
