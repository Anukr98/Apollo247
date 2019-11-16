import gql from 'graphql-tag';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { DiagnosticOrdersRepository } from 'profiles-service/repositories/diagnosticOrdersRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { DiagnosticOrders, DiagnosticOrderLineItems } from 'profiles-service/entities';
import { Resolver } from 'api-gateway';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { PatientAddressRepository } from 'profiles-service/repositories/patientAddressRepository';

export const saveDiagnosticOrderTypeDefs = gql`
  enum DIAGNOSTIC_ORDER_STATUS {
    PICKUP_REQUESTED
    PICKUP_CONFIRMED
  }

  input DiagnosticOrderInput {
    patientId: ID!
    patientAddressId: ID!
    city: String!
    slotTimings: String!
    employeeSlotId: Int!
    diagnosticEmployeeCode: String!
    diagnosticBranchCode: String!
    totalPrice: Float!
    prescriptionUrl: String!
    diagnosticDate: Date!
    centerName: String!
    centerCode: String!
    centerCity: String!
    centerState: String!
    centerLocality: String!
    items: [DiagnosticLineItem]
  }

  input DiagnosticLineItem {
    itemId: Int
    price: Float
    quantity: Int
  }

  type SaveDiagnosticOrderResult {
    errorCode: Int
    errorMessage: String
    orderId: String
  }

  type DiagnosticOrdersResult {
    ordersList: [DiagnosticOrders]
  }

  type DiagnosticOrderResult {
    ordersList: DiagnosticOrders
  }

  type DiagnosticOrders {
    id: ID!
    patientId: ID!
    patientAddressId: ID!
    city: String!
    slotTimings: String!
    employeeSlotId: Int!
    diagnosticEmployeeCode: String!
    diagnosticBranchCode: String!
    totalPrice: Float!
    prescriptionUrl: String!
    diagnosticDate: Date!
    centerName: String!
    centerCode: String!
    centerCity: String!
    centerState: String!
    centerLocality: String!
    orderStatus: DIAGNOSTIC_ORDER_STATUS!
    orderType: String!
    displayId: Int!
    diagnosticOrderLineItems: [DiagnosticOrderLineItems]
  }

  type DiagnosticOrderLineItems {
    id: ID!
    itemId: Int
    price: Float
    quantity: Int
  }

  extend type Mutation {
    SaveDiagnosticOrder(diagnosticOrderInput: DiagnosticOrderInput): SaveDiagnosticOrderResult!
  }
  extend type Query {
    getDiagnosticOrdersList(patientId: String): DiagnosticOrdersResult!
    getDiagnosticOrderDetails(diagnosticOrderId: String): DiagnosticOrderResult!
  }
`;

type DiagnosticOrderInput = {
  patientId: string;
  patientAddressId: string;
  city: string;
  slotTimings: string;
  employeeSlotId: number;
  diagnosticEmployeeCode: string;
  diagnosticBranchCode: string;
  totalPrice: number;
  prescriptionUrl: string;
  diagnosticDate: Date;
  centerName: string;
  centerCode: string;
  centerCity: string;
  centerState: string;
  centerLocality: string;
  items: [DiagnosticLineItem];
};

type DiagnosticLineItem = {
  itemId: number;
  price: number;
  quantity: number;
};

type SaveDiagnosticOrderResult = {
  errorCode: number;
  errorMessage: string;
  orderId: string;
};

type DiagnosticOrdersResult = {
  ordersList: DiagnosticOrders[];
};

type DiagnosticOrderResult = {
  ordersList: DiagnosticOrders;
};

type DiagnosticOrderInputInputArgs = { diagnosticOrderInput: DiagnosticOrderInput };

const SaveDiagnosticOrder: Resolver<
  null,
  DiagnosticOrderInputInputArgs,
  ProfilesServiceContext,
  SaveDiagnosticOrderResult
> = async (parent, { diagnosticOrderInput }, { profilesDb }) => {
  const errorCode = 0,
    errorMessage = '';

  if (!diagnosticOrderInput.items) {
    throw new AphError(AphErrorMessages.CART_EMPTY_ERROR, undefined, {});
  }
  const patientRepo = profilesDb.getCustomRepository(PatientRepository);
  const patientDetails = await patientRepo.findById(diagnosticOrderInput.patientId);
  if (!patientDetails) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }
  if (
    diagnosticOrderInput.patientAddressId != '' &&
    diagnosticOrderInput.patientAddressId != null
  ) {
    const patientAddressRepo = profilesDb.getCustomRepository(PatientAddressRepository);
    const patientAddressDetails = await patientAddressRepo.findById(
      diagnosticOrderInput.patientAddressId
    );
    if (!patientAddressDetails) {
      throw new AphError(AphErrorMessages.INVALID_PATIENT_ADDRESS_ID, undefined, {});
    }
  }

  const diagnosticOrderattrs: Partial<DiagnosticOrders> = {
    patient: patientDetails,
    patientAddressId: diagnosticOrderInput.patientAddressId,
    totalPrice: diagnosticOrderInput.totalPrice,
    slotTimings: diagnosticOrderInput.slotTimings,
    employeeSlotId: diagnosticOrderInput.employeeSlotId,
    diagnosticBranchCode: diagnosticOrderInput.diagnosticBranchCode,
    diagnosticEmployeeCode: diagnosticOrderInput.diagnosticEmployeeCode,
    city: diagnosticOrderInput.city,
    prescriptionUrl: diagnosticOrderInput.prescriptionUrl,
    diagnosticDate: diagnosticOrderInput.diagnosticDate,
    centerCity: diagnosticOrderInput.centerCity,
    centerCode: diagnosticOrderInput.centerCode,
    centerName: diagnosticOrderInput.centerName,
    centerLocality: diagnosticOrderInput.centerLocality,
    centerState: diagnosticOrderInput.centerState,
  };

  const diagnosticOrdersRepo = profilesDb.getCustomRepository(DiagnosticOrdersRepository);
  const saveOrder = await diagnosticOrdersRepo.saveDiagnosticOrder(diagnosticOrderattrs);
  if (saveOrder) {
    diagnosticOrderInput.items.map(async (item) => {
      const orderItemAttrs: Partial<DiagnosticOrderLineItems> = {
        diagnosticOrders: saveOrder,
        ...item,
      };
      const lineItemOrder = await diagnosticOrdersRepo.saveDiagnosticOrderLineItem(orderItemAttrs);
      console.log(lineItemOrder);
    });
  }

  return {
    errorCode,
    errorMessage,
    orderId: saveOrder.id,
  };
};

const getDiagnosticOrdersList: Resolver<
  null,
  { patientId: string },
  ProfilesServiceContext,
  DiagnosticOrdersResult
> = async (parent, args, { profilesDb }) => {
  const diagnosticsRepo = profilesDb.getCustomRepository(DiagnosticOrdersRepository);
  const ordersList = await diagnosticsRepo.getListOfOrders(args.patientId);
  return { ordersList };
};

const getDiagnosticOrderDetails: Resolver<
  null,
  { diagnosticOrderId: string },
  ProfilesServiceContext,
  DiagnosticOrderResult
> = async (parent, args, { profilesDb }) => {
  const diagnosticsRepo = profilesDb.getCustomRepository(DiagnosticOrdersRepository);
  const ordersList = await diagnosticsRepo.getOrderDetails(args.diagnosticOrderId);
  if (ordersList == null)
    throw new AphError(AphErrorMessages.INVALID_DIAGNOSTIC_ORDER_ID, undefined, {});
  return { ordersList };
};

export const saveDiagnosticOrderResolvers = {
  Mutation: {
    SaveDiagnosticOrder,
  },
  Query: {
    getDiagnosticOrdersList,
    getDiagnosticOrderDetails,
  },
};
