import gql from 'graphql-tag';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { DiagnosticOrdersRepository } from 'profiles-service/repositories/diagnosticOrdersRepository';
import { Resolver } from 'api-gateway';
import { AphError } from 'AphError';
import {
  DiagnosticOrders,
  DiagnosticOrdersStatus,
  DIAGNOSTIC_ORDER_STATUS,
} from 'profiles-service/entities';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { sendDiagnosticOrderStatusNotification } from 'notifications-service/handlers/main';
import { NotificationType } from 'notifications-service/constants';
import { notificationType } from 'consults-service/entities';

export const cancelDiagnosticOrdersTypeDefs = gql`
  type DiagnosticOrderCancelResult {
    message: String
  }

  input UpdateDiagnosticOrderInput {
    id: String
    slotTimings: String!
    employeeSlotId: Int!
    diagnosticEmployeeCode: String!
    diagnosticBranchCode: String!
    prescriptionUrl: String!
    diagnosticDate: Date!
    centerName: String!
    centerCode: String!
    centerCity: String!
    centerState: String!
    centerLocality: String!
  }

  input DiagnosticsOrderNotificationInput {
    type: String
    patientID: String
    mobileNumber: String
    patientFirstName: String
    displayID: Int
    orderID: String
  }

  type SendDiagnosticOrderNotificationResponse {
    status: Boolean
  }

  extend type Query {
    sendDiagnosticOrderNotification(
      type: String
      patientID: String
      mobileNumber: String
      patientFirstName: String
      displayID: Int
      orderID: String
    ): SendDiagnosticOrderNotificationResponse!
  }

  extend type Mutation {
    cancelDiagnosticOrder(diagnosticOrderId: Int): DiagnosticOrderCancelResult!
    updateDiagnosticOrder(
      updateDiagnosticOrderInput: UpdateDiagnosticOrderInput
    ): DiagnosticOrderCancelResult!
  }
`;

type DiagnosticOrderCancelResult = {
  message: string;
};

type UpdateDiagnosticOrderInput = {
  id: string;
  slotTimings: string;
  employeeSlotId: number;
  diagnosticEmployeeCode: string;
  diagnosticBranchCode: string;
  prescriptionUrl: string;
  diagnosticDate: Date;
  centerName: string;
  centerCode: string;
  centerCity: string;
  centerState: string;
  centerLocality: string;
};

type SendDiagnosticOrderNotificationResponse = {
  status: boolean;
};

type UpdateOrderInputArgs = { updateDiagnosticOrderInput: UpdateDiagnosticOrderInput };

const updateDiagnosticOrder: Resolver<
  null,
  UpdateOrderInputArgs,
  ProfilesServiceContext,
  DiagnosticOrderCancelResult
> = async (parent, { updateDiagnosticOrderInput }, { profilesDb }) => {
  const diagnosticOrdersRepo = profilesDb.getCustomRepository(DiagnosticOrdersRepository);
  const orderDetails = await diagnosticOrdersRepo.getOrderDetails(updateDiagnosticOrderInput.id);
  if (!orderDetails) {
    throw new AphError(AphErrorMessages.INVALID_DIAGNOSTIC_ORDER_ID, undefined, {});
  }
  const updateAttrs: Partial<DiagnosticOrders> = {
    slotTimings: updateDiagnosticOrderInput.slotTimings,
    employeeSlotId: updateDiagnosticOrderInput.employeeSlotId,
    diagnosticEmployeeCode: updateDiagnosticOrderInput.diagnosticEmployeeCode,
    diagnosticBranchCode: updateDiagnosticOrderInput.diagnosticBranchCode,
    prescriptionUrl: updateDiagnosticOrderInput.prescriptionUrl,
    diagnosticDate: updateDiagnosticOrderInput.diagnosticDate,
    centerName: updateDiagnosticOrderInput.centerName,
    centerCode: updateDiagnosticOrderInput.centerCode,
    centerCity: updateDiagnosticOrderInput.centerCity,
    centerState: updateDiagnosticOrderInput.centerState,
    centerLocality: updateDiagnosticOrderInput.centerLocality,
  };
  const updateDetails = await diagnosticOrdersRepo.updateDiagnosticOrderDetails(
    updateDiagnosticOrderInput.id,
    updateAttrs
  );
  return { message: 'Order updated successfully' };
};

const cancelDiagnosticOrder: Resolver<
  null,
  { diagnosticOrderId: number },
  ProfilesServiceContext,
  DiagnosticOrderCancelResult
> = async (parent, args, { profilesDb }) => {
  const diagnosticOrdersRepo = profilesDb.getCustomRepository(DiagnosticOrdersRepository);
  const orderDetails = await diagnosticOrdersRepo.getOrderDetailsById(args.diagnosticOrderId);
  if (!orderDetails) {
    throw new AphError(AphErrorMessages.INVALID_DIAGNOSTIC_ORDER_ID, undefined, {});
  }
  await diagnosticOrdersRepo.cancelDiagnosticOrder(orderDetails.id);
  const diagnosticOrderStatusAttrs: Partial<DiagnosticOrdersStatus> = {
    diagnosticOrders: orderDetails,
    orderStatus: DIAGNOSTIC_ORDER_STATUS.ORDER_CANCELLED,
    statusDate: new Date(),
    hideStatus: false,
  };
  await diagnosticOrdersRepo.saveDiagnosticOrderStatus(diagnosticOrderStatusAttrs);
  return { message: 'Order cancelled successfully' };
};

const sendDiagnosticOrderNotification: Resolver<
  null,
  {
    type: string;
    patientID: string;
    mobileNumber: string;
    patientFirstName: string;
    displayID: number;
    orderID: string;
  },
  ProfilesServiceContext,
  SendDiagnosticOrderNotificationResponse
> = async (parent, args, { profilesDb }) => {
  console.log(args);
  let notificationType: NotificationType;
  switch (args.type) {
    case NotificationType.DIAGNOSTIC_ORDER_SUCCESS:
      notificationType = NotificationType.DIAGNOSTIC_ORDER_SUCCESS;
      break;
    case NotificationType.DIAGNOSTIC_ORDER_PAYMENT_FAILED:
      notificationType = NotificationType.DIAGNOSTIC_ORDER_PAYMENT_FAILED;
      break;
    default:
      console.log(args.type);
      throw new AphError(AphErrorMessages.UNKNOWN_NOTIFICATION_ERROR);
  }
  const notification = await sendDiagnosticOrderStatusNotification(
    notificationType,
    profilesDb,
    args.patientID,
    args.mobileNumber,
    args.patientFirstName,
    args.displayID,
    args.orderID
  );
  if (!notification) {
    return { status: false };
  }
  return { status: notification.status };
};

export const cancelDiagnosticOrdersResolvers = {
  Mutation: {
    cancelDiagnosticOrder,
    updateDiagnosticOrder,
  },
  Query: {
    sendDiagnosticOrderNotification,
  },
};
