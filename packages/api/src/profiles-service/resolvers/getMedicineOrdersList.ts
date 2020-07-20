import gql from 'graphql-tag';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { MedicineOrdersRepository } from 'profiles-service/repositories/MedicineOrdersRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { MedicineOrders } from 'profiles-service/entities';
import { Resolver } from 'api-gateway';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

export const getMedicineOrdersListTypeDefs = gql`
  type MedicineOrdersListResult {
    MedicineOrdersList: [MedicineOrders]
  }
  enum DEVICE_TYPE {
    IOS
    ANDROID
    DESKTOP
  }
  type MedicineOrderDetailsResult {
    MedicineOrderDetails: MedicineOrders
  }

  enum BOOKING_SOURCE {
    WEB
    MOBILE
    ORDER_PUNCHING_TOOL
    MFINE
  }

  type MedicineOrders {
    id: ID!
    orderAutoId: Int
    quoteId: String
    shopId: String
    estimatedAmount: Float
    patientId: ID!
    quoteDateTime: String
    coupon: String
    deliveryType: MEDICINE_DELIVERY_TYPE!
    patientAddressId: ID
    devliveryCharges: Float
    deviceType: DEVICE_TYPE
    prescriptionImageUrl: String
    prismPrescriptionFileId: String
    pharmaRequest: String
    orderTat: String
    orderType: MEDICINE_ORDER_TYPE
    currentStatus: MEDICINE_ORDER_STATUS
    bookingSource: BOOKING_SOURCE
    medicineOrderLineItems: [MedicineOrderLineItems]
    medicineOrdersStatus: [MedicineOrdersStatus]
    medicineOrderPayments: [MedicineOrderPayments]
    medicineOrderInvoice: [MedicineOrderInvoice]
    patient: Patient
  }

  type MedicineOrderInvoice {
    id: ID!
    siteId: String
    remarks: String
    requestType: String
    vendorName: String
    billDetails: String
    itemDetails: String
  }

  type MedicineOrderLineItems {
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

  type MedicineOrdersStatus {
    id: ID!
    orderStatus: MEDICINE_ORDER_STATUS
    statusDate: DateTime
    hideStatus: Boolean
  }

  type MedicineOrderPayments {
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
    getMedicineOrdersList(patientId: String): MedicineOrdersListResult!
    getMedicineOrderDetails(patientId: String, orderAutoId: Int): MedicineOrderDetailsResult!
    getMedicinePaymentOrder: MedicineOrdersListResult!
  }
`;

type MedicineOrdersListResult = {
  MedicineOrdersList: MedicineOrders[];
};

type MedicineOrderDetailsResult = {
  MedicineOrderDetails: MedicineOrders;
};

const getMedicineOrdersList: Resolver<
  null,
  { patientId: string; orderAutoId?: number },
  ProfilesServiceContext,
  MedicineOrdersListResult
> = async (parent, args, { profilesDb }) => {
  const patientRepo = profilesDb.getCustomRepository(PatientRepository);
  const patientDetails = await patientRepo.findById(args.patientId);
  if (!patientDetails) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }
  const primaryPatientIds = await patientRepo.getLinkedPatientIds(args.patientId);

  const medicineOrdersRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
  const MedicineOrdersList = await medicineOrdersRepo.getMedicineOrdersList(primaryPatientIds);

  return { MedicineOrdersList };
};

const getMedicineOrderDetails: Resolver<
  null,
  { patientId: string; orderAutoId: number },
  ProfilesServiceContext,
  MedicineOrderDetailsResult
> = async (parent, args, { profilesDb }) => {
  const patientRepo = profilesDb.getCustomRepository(PatientRepository);
  if (args.patientId) {
    const patientDetails = await patientRepo.findById(args.patientId);
    if (!patientDetails) {
      throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
    }
  }
  const medicineOrdersRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
  let MedicineOrderDetails;
  if (!args.patientId) {
    MedicineOrderDetails = await medicineOrdersRepo.getMedicineOrderDetailsByOderId(
      args.orderAutoId
    );
  } else {
    MedicineOrderDetails = await medicineOrdersRepo.getMedicineOrderById(
      args.patientId,
      args.orderAutoId
    );
  }
  console.log(MedicineOrderDetails, 'medicineOrderDetails');
  if (!MedicineOrderDetails) {
    throw new AphError(AphErrorMessages.INVALID_MEDICINE_ORDER_ID, undefined, {});
  }
  return { MedicineOrderDetails };
};

const getMedicinePaymentOrder: Resolver<
  null,
  {},
  ProfilesServiceContext,
  MedicineOrdersListResult
> = async (parent, args, { profilesDb }) => {
  const medicineOrdersRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
  const MedicineOrdersList = await medicineOrdersRepo.getPaymentMedicineOrders();
  return { MedicineOrdersList };
};

export const getMedicineOrdersListResolvers = {
  Query: {
    getMedicineOrdersList,
    getMedicineOrderDetails,
    getMedicinePaymentOrder,
  },
};
