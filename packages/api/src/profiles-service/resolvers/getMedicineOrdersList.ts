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
    meta: PaginateMetaData
    MedicineOrdersList: [MedicineOrders]
  }

  type PaginateMetaData {
    total: Int
    pageSize: Int
    pageNo: Int
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
    getMedicineOrdersList(
      patientId: String
      pageNo: Int
      pageSize: Int
    ): MedicineOrdersListResult!
    getMedicineOrderDetails(patientId: String, orderAutoId: Int): MedicineOrderDetailsResult!
    getMedicinePaymentOrder(
      pageNo: Int
      pageSize: Int
    ): MedicineOrdersListResult!
  }
`;

type PaginateMetaData = {
  total: number | null,
  pageSize: number | null,
  pageNo: number | null
}

type MedicineOrdersListResult = {
  meta: PaginateMetaData
  MedicineOrdersList: MedicineOrders[];
};

type MedicineOrderDetailsResult = {
  MedicineOrderDetails: MedicineOrders;
};

const getMedicineOrdersList: Resolver<
  null,
  { patientId: string; orderAutoId?: number, pageNo?: number, pageSize?: number },
  ProfilesServiceContext,
  MedicineOrdersListResult
> = async (parent, args, { profilesDb }) => {
  const patientRepo = profilesDb.getCustomRepository(PatientRepository);

  const patientDetails = await patientRepo.getPatientDetails(args.patientId);
  // paginated vars
  const { pageNo, pageSize = 10 } = args; //default pageSize = 10
  const paginateParams: { take?: number, skip?: number } = {};

  if (!patientDetails) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }
  const primaryPatientIds = await patientRepo.getLinkedPatientIds({ patientDetails });
  const medicineOrdersRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
  //pageNo should be greater than 0
  if (pageNo === 0) {
    throw new AphError(AphErrorMessages.PAGINATION_PARAMS_PAGENO_ERROR, undefined, {});
  }
  if (pageNo) {
    paginateParams.take = pageSize
    paginateParams.skip = (pageSize * pageNo) - pageSize //bcoz pageNo. starts from 1 not 0.
  }

  const [MedicineOrdersList, totalCount]: any = await medicineOrdersRepo.getMedicineOrdersList(primaryPatientIds, paginateParams);

  return {
    meta: {
      pageNo: pageNo || null,
      pageSize: (Number.isInteger(pageNo) && pageSize) || null,
      total: (Number.isInteger(pageNo) && totalCount) || null
    },
    MedicineOrdersList
  };
};

const getMedicineOrderDetails: Resolver<
  null,
  { patientId: string; orderAutoId: number },
  ProfilesServiceContext,
  MedicineOrderDetailsResult
> = async (parent, args, { profilesDb }) => {
  const patientRepo = profilesDb.getCustomRepository(PatientRepository);
  if (args.patientId) {
    const patientDetails = await patientRepo.getPatientDetails(args.patientId);
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
  { pageNo?: number, pageSize?: number }, //for consistency response though not mandatory
  ProfilesServiceContext,
  MedicineOrdersListResult
> = async (parent, args, { profilesDb }) => {
  const medicineOrdersRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
  // paginated vars
  const { pageNo, pageSize = 10 } = args; //default pageSize = 10
  const paginateParams: { take?: number, skip?: number } = {};
  //pageNo should be greater than 0
  if (pageNo === 0) {
    throw new AphError(AphErrorMessages.PAGINATION_PARAMS_PAGENO_ERROR, undefined, {});
  }
  if (pageNo) {
    paginateParams.take = pageSize
    paginateParams.skip = (pageSize * pageNo) - pageSize //bcoz pageNo. starts from 1 not 0.
  }
  const [MedicineOrdersList, totalCount] = await medicineOrdersRepo.getPaymentMedicineOrders(paginateParams);
  //meta added for consistency response 
  return {
    meta: {
      pageNo: pageNo || null,
      pageSize: (Number.isInteger(pageNo) && pageSize) || null,
      total: (Number.isInteger(pageNo) && totalCount) || null
    },
    MedicineOrdersList
  };
};

export const getMedicineOrdersListResolvers = {
  Query: {
    getMedicineOrdersList,
    getMedicineOrderDetails,
    getMedicinePaymentOrder,
  },
};
