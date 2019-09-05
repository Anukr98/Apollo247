import gql from 'graphql-tag';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { MedicineOrdersRepository } from 'profiles-service/repositories/MedicineOrdersRepository';
//import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import {
  MedicineOrderLineItems,
  MedicineOrdersStatus,
  MEDICINE_ORDER_STATUS,
} from 'profiles-service/entities';
import { Resolver } from 'api-gateway';

export const getDigitizedOrderTypeDefs = gql`
  input MedicineOrderInput {
    quoteId: Int
    shopId: String
    estimatedAmount: Float
    items: [MedicineItem]
  }

  input MedicineItem {
    medicineSKU: String
    medicineName: String
    price: Float
    quantity: Int
    mrp: Float
    pack: Int
    mou: Int
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
  quoteId: number;
  shopId: string;
  estimatedAmount: number;
  items: MedicineItem[];
};

type MedicineItem = {
  medicineSKU: string;
  medicineName: string;
  price: number;
  quantity: number;
  mrp: number;
  pack: number;
  mou: number;
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

  if (!MedicineOrderInput.items || MedicineOrderInput.items.length == 0) {
    errorCode = -1;
    errorMessage = 'Missing medicine line items';
    status = 'Rejected';
  }
  //const patientRepo = profilesDb.getCustomRepository(PatientRepository);
  //const patientDetails = await patientRepo.findById(MedicineOrderInput.patientId);
  /*const medicineOrderattrs: Partial<MedicineOrders> = {
    patient: patientDetails,
    quoteId: MedicineOrderInput.quoteId,
    deliveryType: MEDICINE_DELIVERY_TYPE.HOME_DELIVERY,
    estimatedAmount: MedicineOrderInput.estimatedAmount,
    orderType: MEDICINE_ORDER_TYPE.UPLOAD_PRESCRIPTION,
    shopId: MedicineOrderInput.shopId,
    quoteDateTime: new Date(),
    devliveryCharges: 0.0,
  };*/
  const medicineOrdersRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
  const orderDetails = await medicineOrdersRepo.getMedicineOrderDetails(MedicineOrderInput.quoteId);
  //const saveOrder = await medicineOrdersRepo.saveMedicineOrder(medicineOrderattrs);
  if (orderDetails) {
    MedicineOrderInput.items.map((item) => {
      const orderItemAttrs: Partial<MedicineOrderLineItems> = {
        medicineOrders: orderDetails,
        ...item,
      };
      const lineItemOrder = medicineOrdersRepo.saveMedicineOrderLineItem(orderItemAttrs);
      console.log(lineItemOrder);
    });
    //save in order status table
    const medicineOrderStatusAttrs: Partial<MedicineOrdersStatus> = {
      medicineOrders: orderDetails,
      orderStatus: MEDICINE_ORDER_STATUS.PRESCRIPTION_CART_READY,
      statusDate: new Date(),
    };
    await medicineOrdersRepo.saveMedicineOrderStatus(
      medicineOrderStatusAttrs,
      orderDetails.orderAutoId
    );
  }
  //console.log(saveOrder, 'save order');

  return { status, errorCode, errorMessage };
};

export const getDigitizedOrderResolvers = {
  Mutation: {
    getDigitizedPrescription,
  },
};
