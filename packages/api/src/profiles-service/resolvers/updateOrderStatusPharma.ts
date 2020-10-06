import gql from 'graphql-tag';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { MedicineOrdersRepository } from 'profiles-service/repositories/MedicineOrdersRepository';
import { MedicineOrdersStatus, MEDICINE_ORDER_STATUS } from 'profiles-service/entities';
import { Resolver } from 'api-gateway';

export const updateOrderStatusTypeDefs = gql`
  type UpdateOrderStatusResult {
    status: String
    errorCode: Int
    errorMessage: String
  }

  extend type Mutation {
    updateMedicineOrderStatus(orderId: Int, orderStatus: String): UpdateOrderStatusResult!
  }
`;

type UpdateOrderStatusResult = {
  status: string;
  errorCode: number;
  errorMessage: string;
};

const updateMedicineOrderStatus: Resolver<
  null,
  { orderId: number; orderStatus: string },
  ProfilesServiceContext,
  UpdateOrderStatusResult
> = async (parent, args, { profilesDb }) => {
  let errorCode = 0,
    errorMessage = '',
    status = 'Accepted';

  const medicineOrdersRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
  const orderDetails = await medicineOrdersRepo.getMedicineOrder(args.orderId);
  //const saveOrder = await medicineOrdersRepo.saveMedicineOrder(medicineOrderattrs);
  if (orderDetails) {
    //save in order status table
    const medicineOrderStatusAttrs: Partial<MedicineOrdersStatus> = {
      medicineOrders: orderDetails,
      orderStatus: MEDICINE_ORDER_STATUS.ORDER_VERIFIED,
      statusDate: new Date(),
    };
    await medicineOrdersRepo.saveMedicineOrderStatus(
      medicineOrderStatusAttrs,
      orderDetails.orderAutoId
    );
    await medicineOrdersRepo.updateMedicineOrderDetails(
      orderDetails.id,
      orderDetails.orderAutoId,
      new Date(),
      MEDICINE_ORDER_STATUS.ORDER_VERIFIED
    );
  } else {
    errorCode = -1;
    errorMessage = 'Invalid order id';
    status = 'Rejected';
  }

  return { status, errorCode, errorMessage };
};

export const updateOrderStatusResolvers = {
  Mutation: {
    updateMedicineOrderStatus,
  },
};
