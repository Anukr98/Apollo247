import gql from 'graphql-tag';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { MedicineOrdersRepository } from 'profiles-service/repositories/MedicineOrdersRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import {
  MedicineOrders,
  MEDICINE_DELIVERY_TYPE,
  MEDICINE_ORDER_TYPE,
  MEDICINE_ORDER_STATUS,
  MedicineOrderLineItems,
} from 'profiles-service/entities';
import { Resolver } from 'api-gateway';

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
  estimatedAmount: number;
  patientId: string;
  items: MedicineItem[];
};

type MedicineItem = {
  medicineSku: string;
  medicineName: string;
  price: number;
  quantity: number;
  mrp: number;
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
    errorMessage = '',
    status = 'Accepted';
  if (MedicineOrderInput.patientId === '' || MedicineOrderInput.patientId == null) {
    errorCode = -1;
    errorMessage = 'Missing patient Id';
    status = 'Rejected';
  }
  if (!MedicineOrderInput.items || MedicineOrderInput.items.length == 0) {
    errorCode = -1;
    errorMessage = 'Missing medicine line items';
    status = 'Rejected';
  }
  const patientRepo = profilesDb.getCustomRepository(PatientRepository);
  const patientDetails = await patientRepo.findById(MedicineOrderInput.patientId);
  const medicineOrderattrs: Partial<MedicineOrders> = {
    patient: patientDetails,
    quoteId: MedicineOrderInput.quoteId,
    deliveryType: MEDICINE_DELIVERY_TYPE.HOME_DELIVERY,
    estimatedAmount: MedicineOrderInput.estimatedAmount,
    orderType: MEDICINE_ORDER_TYPE.UPLOAD_PRESCRIPTION,
    shopId: MedicineOrderInput.shopId,
    quoteDateTime: new Date(),
    status: MEDICINE_ORDER_STATUS.QUOTE,
  };
  const medicineOrdersRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
  const saveOrder = await medicineOrdersRepo.saveMedicineOrder(medicineOrderattrs);
  if (saveOrder) {
    MedicineOrderInput.items.map((item) => {
      const orderItemAttrs: Partial<MedicineOrderLineItems> = {
        medicineOrders: saveOrder,
        medicineSKU: item.medicineSku,
        ...item,
      };
      const lineItemOrder = medicineOrdersRepo.saveMedicineOrderLineItem(orderItemAttrs);
      console.log(lineItemOrder);
    });
  }
  console.log(saveOrder, 'save order');

  return { status, errorCode, errorMessage };
};

export const getDigitizedOrderResolvers = {
  Mutation: {
    getDigitizedPrescription,
  },
};
