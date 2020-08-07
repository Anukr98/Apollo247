import gql from 'graphql-tag';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { MedicineOrdersRepository } from 'profiles-service/repositories/MedicineOrdersRepository';
import {
  MedicineOrderLineItems,
  MedicineOrdersStatus,
  MEDICINE_ORDER_STATUS,
} from 'profiles-service/entities';
import { Resolver } from 'api-gateway';
import {
  sendCartNotification,
  NotificationType,
} from 'notifications-service/resolvers/notifications';

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
> = async (parent, { MedicineOrderInput }, { profilesDb, doctorsDb, consultsDb }) => {
  console.log(MedicineOrderInput, 'input');
  let errorCode = 0,
    errorMessage = '',
    status = 'Accepted';

  if (!MedicineOrderInput.items || MedicineOrderInput.items.length == 0) {
    errorCode = -1;
    errorMessage = 'Missing medicine line items';
    status = 'Rejected';
  }
  const medicineOrdersRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
  const orderDetails = await medicineOrdersRepo.getMedicineOrder(MedicineOrderInput.quoteId);
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
    const pushNotificationInput = {
      orderAutoId: orderDetails.orderAutoId,
      notificationType: NotificationType.MEDICINE_CART_READY,
    };
    const notificationResult = sendCartNotification(pushNotificationInput, profilesDb);
    console.log(notificationResult, 'user cart ready notification');
  } else {
    errorCode = -1;
    errorMessage = 'Invalid order id';
    status = 'Rejected';
  }

  return { status, errorCode, errorMessage };
};

export const getDigitizedOrderResolvers = {
  Mutation: {
    getDigitizedPrescription,
  },
};
