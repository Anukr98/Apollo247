import gql from 'graphql-tag';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { Resolver } from 'api-gateway';
import { Double } from 'typeorm';

export const getDigitizedOrderTypeDefs = gql`
  input MedicineOrderInput {
    quoteId: String
    shopId: String
    estimatedAmount: Float
    patientId: ID!
    items: [MedicineItem]
  }

  input MedicineItem {
    medicineSku: String
    medicineName: String
    price: Float
    quantity: Int
    mrp: Float
  }

  type MedicineOrderResult {
    status: String
    errorCode: Int
    errorMessage: String
  }

  extend type Mutation {
    getDigitizedPrescription(MedicineOrderInput: MedicineOrderInput): MedicineOrderResult!
  }
`;

type MedicineOrderInput = {
  quoteId: string;
  shopId: string;
  estimatedAmount: Double;
  patientId: string;
  items: MedicineItem[];
};

type MedicineItem = {
  medicineSku: string;
  medicineName: string;
  price: Double;
  quantity: number;
  mrp: Double;
};

type MedicineOrderResult = {
  status: string;
  errorCode: number;
  errorMessage: string;
};

type MedicineOrderInputArgs = { MedicineOrderInput: MedicineOrderInput };

const getDigitizedPrescription: Resolver<
  null,
  MedicineOrderInputArgs,
  ProfilesServiceContext,
  MedicineOrderResult
> = async (parent, { MedicineOrderInput }, { profilesDb }) => {
  console.log(MedicineOrderInput, 'input');
  let errorCode = 0,
    errorMessage = '';
  if (MedicineOrderInput.patientId === '' || MedicineOrderInput.patientId == null) {
    errorCode = -1;
    errorMessage = 'Missing patient Id';
  }
  if (!MedicineOrderInput.items || MedicineOrderInput.items.length == 0) {
    errorCode = -1;
    errorMessage = 'Missing medicine line items';
  }
  return { status: 'Accepted', errorCode, errorMessage };
};

export const getDigitizedOrderResolvers = {
  Mutation: {
    getDigitizedPrescription,
  },
};
