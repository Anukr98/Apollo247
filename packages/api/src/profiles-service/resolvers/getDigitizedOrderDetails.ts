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
};

type MedicineOrderInputArgs = { MedicineOrderInput: MedicineOrderInput };

const getDigitizedPrescription: Resolver<
  null,
  MedicineOrderInputArgs,
  ProfilesServiceContext,
  MedicineOrderResult
> = async (parent, { MedicineOrderInput }, { profilesDb }) => {
  console.log(MedicineOrderInput, 'input');
  return { status: 'Accepted' };
};

export const getDigitizedOrderResolvers = {
  Mutation: {
    getDigitizedPrescription,
  },
};
