import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { MedicineOrdersRepository } from 'profiles-service/repositories/MedicineOrdersRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import _ from 'lodash';

export const pharmaOrdersTypeDefs = gql`
  type PharmacyOrderResult {
    pharmaOrders: [PharmaResponse]
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
    amountPaid: Float
    paymentDateTime: DateTime
  }
  extend type Query {
    pharmacyOrders(patientId: String): PharmacyOrderResult
  }
`;

type PharmacyOrderResult = {
  pharmaOrders: Partial<PharmaResponse[]>;
};
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
  amountPaid: number;
  paymentDateTime: Date;
};

const pharmacyOrders: Resolver<
  null,
  { patientId: string },
  ProfilesServiceContext,
  PharmacyOrderResult
> = async (parent, args, { profilesDb }) => {
  const medicineOrderRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
  const medicineOrders = await medicineOrderRepo.getMedicineOrdersList(args.patientId);
  // console.log('pharmacy Response', JSON.stringify(medicineOrders, null, 2))
  if (medicineOrders && medicineOrders.length > 0) {
    const excludeNullPayments = _.filter(medicineOrders, (o) => { return o.medicineOrderPayments !== [] });
    const result = _.filter(excludeNullPayments, (o) => { return o.medicineOrderPayments[0].paymentType !== 'COD' && o.currentStatus !== 'QUOTE' })
    return { pharmaOrders: result };
  } else throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
};

export const pharmacyOrdersResolvers = {
  Query: {
    pharmacyOrders,
  },
};
