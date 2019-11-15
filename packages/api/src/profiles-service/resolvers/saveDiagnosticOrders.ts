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
  input DiagnosticOrderInput {
    patientId: ID!
    patientAddressId: ID!
    city: String!
    slotTimings: String!
    employeeSlotId: Int!
    diagnosticEmployeeCode: String!
    diagnosticBranchCode: String!
    totalPrice: Float
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

  extend type Mutation {
    SaveDiagnosticOrder(diagnosticOrderInput: DiagnosticOrderInput): SaveDiagnosticOrderResult!
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

export const saveDiagnosticOrderResolvers = {
  Mutation: {
    SaveDiagnosticOrder,
  },
};
