import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { MedicineOrdersRepository } from 'profiles-service/repositories/MedicineOrdersRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import _ from 'lodash';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';

export const pharmaOrdersTypeDefs = gql`
  type PharmacyOrderResult {
    meta: PaginateMetaDataPharmacyOrders
    pharmaOrders: [PharmaResponse]
  }

  type PaginateMetaDataPharmacyOrders {
    total: Int
    pageSize: Int
    pageNo: Int
  }

  type PharmaResponse {
    id: String
    bookingSource: String
    devliveryCharges: Float
    estimatedAmount: Float
    orderAutoId: Float
    appointmentId: String
    currentStatus: String
    orderType: String
    quoteDateTime: DateTime
    orderDateTime: DateTime
    medicineOrderPayments: [PharmacyPayment]
  }
  type PharmacyPayment {
    paymentStatus: String
    paymentRefId: String
    paymentType: String
    paymentMode: String
    bankTxnId: String
    amountPaid: Float
    paymentDateTime: DateTime
    healthCreditsRedeemed: Float
  }
  extend type Query {
    pharmacyOrders(
      patientId: String
      pageNo: Int
      pageSize: Int
    ): PharmacyOrderResult
  }
`;

type PharmacyOrderResult = {
  meta: PaginateMetaDataPharmacyOrders,
  pharmaOrders: Partial<PharmaResponse[]>;
};

type PaginateMetaDataPharmacyOrders = {
  total: number | null,
  pageSize: number | null,
  pageNo: number | null
}

type PharmaResponse = {
  id: string;
  bookingSource: string;
  devliveryCharges: number;
  estimatedAmount: number;
  orderAutoId: number;
  appointmentId: string;
  currentStatus: string;
  orderType: string;
  quoteDateTime: Date;
  orderDateTime: Date;
  medicineOrderPayments: PharmacyPayment[];
};
type PharmacyPayment = {
  paymentStatus: string;
  paymentRefId: string;
  paymentType: string;
  paymentMode: string;
  bankTxnId: string;
  amountPaid: number;
  paymentDateTime: Date;
  healthCreditsRedeemed: number;
};

const pharmacyOrders: Resolver<
  null,
  { patientId: string, pageNo?: number, pageSize?: number },
  ProfilesServiceContext,
  PharmacyOrderResult
> = async (parent, args, { profilesDb }) => {
  const { patientId } = args;
  const medicineOrderRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
  const patientRepo = profilesDb.getCustomRepository(PatientRepository);

  const patientDetails = await patientRepo.getPatientDetails(args.patientId);

  if (!patientDetails) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }

  const primaryPatientIds = await patientRepo.getLinkedPatientIds({ patientDetails });

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

  const [pharmaOrders, totalCount]: any = await Promise.all(medicineOrderRepo.getMedicineOrdersListWithPayments(
    primaryPatientIds,
    paginateParams
  ));

  const metaResponse = {
    pageNo: pageNo || null,
    pageSize: (Number.isInteger(pageNo) && pageSize) || null,
    total: (Number.isInteger(pageNo) && totalCount) || null
  }

  return {
    pharmaOrders: pharmaOrders,
    meta: metaResponse
  }
  /**
   * keeping it for ref as below filters used in getMedicineOrdersListWithPayments
   * once verified abv fn remove below snippet
   */
  // if (medicineOrders && medicineOrders.length > 0) {
  //   const excludeNullPayments = _.filter(medicineOrders, (o) => {
  //     return o.medicineOrderPayments.length > 0;
  //   });
  //   const result = _.filter(excludeNullPayments, (o) => {
  //     return (
  //       o.medicineOrderPayments[0].paymentType !== 'COD' &&
  //       o.currentStatus !== 'QUOTE' &&
  //       o.currentStatus !== 'PAYMENT_ABORTED'
  //     );
  //   });
  //   console.log('pharmacy orders after filter--->', medicineOrders, medicineOrders.length)
  //   return {
  //     meta: metaResponse,
  //     pharmaOrders: medicineOrders
  //   };
  // } else if (medicineOrders.length == 0) return {
  //   meta: metaResponse,
  //   pharmaOrders: []
  // };
  // else throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
};

export const pharmacyOrdersResolvers = {
  Query: {
    pharmacyOrders,
  },
};
