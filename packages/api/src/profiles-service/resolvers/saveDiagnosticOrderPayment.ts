import gql from 'graphql-tag';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { DiagnosticOrdersRepository } from 'profiles-service/repositories/diagnosticOrdersRepository';
import { DiagnosticOrderPayments } from 'profiles-service/entities';
import { Resolver } from 'api-gateway';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { log } from 'customWinstonLogger';
import { sendDiagnosticOrderStatusNotification } from 'notifications-service/handlers';
import { NotificationType } from 'notifications-service/constants';

export const saveDiagnosticOrderPaymentTypeDefs = gql`
  input DiagnosticPaymentInput {
    amountPaid: Float!
    bankRefNum: String
    diagnosticOrderId: ID!
    errorCode: String
    errorMessage: String
    mihpayid: String
    mode: String
    netAmountDebit: String
    paymentDateTime: DateTime
    paymentStatus: String!
    txnId: String!
    discount: String
    hash: String
    paymentSource: String
    bankCode: String
    issuingBank: String
    cardType: String
  }

  type SaveDiagnosticOrderPaymentResult {
    status: Boolean
  }

  extend type Mutation {
    saveDiagnosticOrderPayment(
      diagnosticPaymentInput: DiagnosticPaymentInput
    ): SaveDiagnosticOrderPaymentResult!
  }
`;

type DiagnosticPaymentInput = {
  amountPaid: string;
  bankRefNum: string;
  diagnosticOrderId: string;
  errorCode: string;
  errorMessage: string;
  paymentDateTime: Date;
  mihpayid: string;
  mode: string;
  netAmountDebit: string;
  paymentStatus: string;
  txnId: string;
  discount: string;
  hash: string;
  paymentSource: string;
  bankCode: string;
  issuingBank: string;
  cardType: string;
};

type SaveDiagnosticOrderPaymentResult = {
  status: Boolean;
};

type DiagnosticPaymentInputArgs = { diagnosticPaymentInput: DiagnosticPaymentInput };

const saveDiagnosticOrderPayment: Resolver<
  null,
  DiagnosticPaymentInputArgs,
  ProfilesServiceContext,
  SaveDiagnosticOrderPaymentResult
> = async (parent, { diagnosticPaymentInput }, { profilesDb }) => {
  console.log('diagnosticPaymentInput:', diagnosticPaymentInput);
  log(
    'profileServiceLogger',
    `DEBUG_LOG`,
    'saveDiagnosticOrderPayment()->inputParams',
    JSON.stringify(diagnosticPaymentInput),
    ''
  );

  let status: boolean = true;

  const diagnosticOrdersRepo = profilesDb.getCustomRepository(DiagnosticOrdersRepository);
  const diagnosticOrder = await diagnosticOrdersRepo.getOrderDetails(
    diagnosticPaymentInput.diagnosticOrderId
  );
  console.log('diagnosticOrderDetails', diagnosticOrder);
  log(
    'profileServiceLogger',
    `DEBUG_LOG`,
    'saveDiagnosticOrderPayment()->diagnosticOrderDetiails',
    JSON.stringify(diagnosticOrder),
    ''
  );

  if (!diagnosticOrder) {
    throw new AphError(AphErrorMessages.INVALID_DIAGNOSTIC_ORDER_ID, undefined, {});
  }

  const paymentAttrs: Partial<DiagnosticOrderPayments> = {
    amountPaid: parseFloat(diagnosticPaymentInput.amountPaid),
    paymentDateTime: diagnosticPaymentInput.paymentDateTime,
    bankRefNum: diagnosticPaymentInput.bankRefNum,
    errorCode: diagnosticPaymentInput.errorCode,
    errorMessage: diagnosticPaymentInput.errorMessage,
    mihpayid: diagnosticPaymentInput.mihpayid,
    netAmountDebit: diagnosticPaymentInput.netAmountDebit,
    paymentStatus: diagnosticPaymentInput.paymentStatus,
    txnId: diagnosticPaymentInput.txnId,
    discount: diagnosticPaymentInput.discount,
    hash: diagnosticPaymentInput.hash,
    mode: diagnosticPaymentInput.mode,
    paymentSource: diagnosticPaymentInput.paymentSource,
    bankCode: diagnosticPaymentInput.bankCode,
    issuingBank: diagnosticPaymentInput.issuingBank,
    cardType: diagnosticPaymentInput.cardType,
    diagnosticOrders: diagnosticOrder,
  };

  console.log('paymentAttrs==>', paymentAttrs);
  log(
    'profileServiceLogger',
    `DEBUG_LOG`,
    'saveDiagnosticOrderPayment()->paymentAttrs',
    JSON.stringify(paymentAttrs),
    ''
  );
  const savePaymentDetails = await diagnosticOrdersRepo.saveDiagnosticOrderPayment(paymentAttrs);

  console.log('savePaymentDetails', savePaymentDetails);
  log(
    'profileServiceLogger',
    `DEBUG_LOG`,
    'saveDiagnosticOrderPayment()->savePaymentDetails',
    JSON.stringify(savePaymentDetails),
    ''
  );

  //call far-eye api's if payment is success
  if (diagnosticPaymentInput.paymentStatus == 'success') {
    diagnosticOrdersRepo.callDiagnosticFareEyeAPIs(diagnosticOrder, profilesDb);

    //send order payment success notification
    sendDiagnosticOrderStatusNotification(
      NotificationType.DIAGNOSTIC_ORDER_SUCCESS,
      diagnosticOrder,
      profilesDb
    );
  } else {
    //send order payment failed notification
    sendDiagnosticOrderStatusNotification(
      NotificationType.DIAGNOSTIC_ORDER_PAYMENT_FAILED,
      diagnosticOrder,
      profilesDb
    );
  }

  if (!savePaymentDetails) {
    status = false;
    //throw new AphError(AphErrorMessages.SAVE_DIAGNOSTIC_ORDER_ERROR, undefined, {});
  }

  return { status };
};

export const saveDiagnosticOrderPaymentResolvers = {
  Mutation: {
    saveDiagnosticOrderPayment,
  },
};
