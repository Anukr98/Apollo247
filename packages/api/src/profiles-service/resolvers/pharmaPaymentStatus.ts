import gql from 'graphql-tag';
import { log } from 'customWinstonLogger';
import { STATUS_PAYMENT_MAP, PAYMENT_STATUS_MAP } from 'profiles-service/entities/index';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { MedicineOrdersRepository } from 'profiles-service/repositories/MedicineOrdersRepository';
import { Resolver } from 'api-gateway';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

export const paymentStatusTypeDefs = gql`
  type PharmaPaymentDetails {
    paymentRefId: String
    bankTxnId: String
    amountPaid: Float
    paymentStatus: String!
    paymentDateTime: DateTime
  }

  extend type Query {
    pharmaPaymentStatus(orderId: Int): PharmaPaymentDetails
  }
`;

type PharmaPaymentResponse = {
  paymentRefId: string;
  bankTxnId: string;
  amountPaid: number;
  paymentStatus: PAYMENT_STATUS_MAP;
  paymentDateTime: Date;
};

const pharmaPaymentStatus: Resolver<
  null,
  { orderId: number },
  ProfilesServiceContext,
  PharmaPaymentResponse
> = async (parent, args, { profilesDb }) => {
  const pharmaRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
  const response = await pharmaRepo.findPharamaOrdersByOrderId(args.orderId);
  if (!response) {
    throw new AphError(AphErrorMessages.INVALID_ORDER_ID, undefined, {});
  }
  log(
    'consultServiceLogger',
    `pharma payment - orderId - ${args.orderId}`,
    'pharmaPaymentStatus()',
    `response: ${response}`,
    ''
  );

  switch (response.paymentStatus) {
    case STATUS_PAYMENT_MAP.PAYMENT_SUCCESS:
      response.paymentStatus = PAYMENT_STATUS_MAP.TXN_SUCCESS;
      break;
    case STATUS_PAYMENT_MAP.PAYMENT_PENDING_PG:
      response.paymentStatus = PAYMENT_STATUS_MAP.PENDING;
      break;
    case STATUS_PAYMENT_MAP.PAYMENT_FAILED:
      response.paymentStatus = PAYMENT_STATUS_MAP.TXN_FAILURE;
      break;
    default:
      response.paymentStatus = PAYMENT_STATUS_MAP.UNKNOWN;
  }
  const returnResponse: PharmaPaymentResponse = {
    ...response,
  };
  return returnResponse;
};

export const paymentStatusResolvers = {
  Query: {
    pharmaPaymentStatus,
  },
};
