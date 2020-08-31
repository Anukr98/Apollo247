import gql from 'graphql-tag';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { MedicineOrdersRepository } from 'profiles-service/repositories/MedicineOrdersRepository';
import {
  MEDICINE_ORDER_STATUS,
  MedicineOrders,
  MedicineOrdersStatus,
} from 'profiles-service/entities';
import { Resolver } from 'api-gateway';
import { log } from 'customWinstonLogger';
import { calculateRefund } from 'profiles-service/helpers/refundHelper';

export const refundOrderTypeDefs = gql`
  input RefundInput {
    orderId: Int!
  }

  type RefundResult {
    orderId: Int!
    refundStatus: Boolean!
  }
  extend type Mutation {
    refundInitiate(refundInput: RefundInput): RefundResult
  }
`;

type RefundInput = {
  orderId: MedicineOrders['orderAutoId'];
};
type RefundInputArgs = {
  refundInput: RefundInput;
};

type RefundResult = {
  orderId: MedicineOrders['orderAutoId'];
  refundStatus: boolean;
};

const refundInitiate: Resolver<
  null,
  RefundInputArgs,
  ProfilesServiceContext,
  RefundResult
> = async (parent, { refundInput }, { profilesDb }) => {
  const orderId = refundInput.orderId;
  const medOrderRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
  const orderDetails = await medOrderRepo.getMedicineOrderWithStatus(orderId);
  let totalOrderBilling = 0;
  let statusMessage: MedicineOrdersStatus['statusMessage'] = '';
  let customReason: MedicineOrdersStatus['customReason'] = '';

  if (orderDetails) {
    if (orderDetails.medicineOrdersStatus) {
      orderDetails.medicineOrdersStatus.find((val) => {
        if (val.orderStatus === MEDICINE_ORDER_STATUS.CANCELLED) {
          statusMessage = val.statusMessage;
          customReason = val.customReason;
        }
      });
    }
    if (
      orderDetails.currentStatus !== MEDICINE_ORDER_STATUS.CANCELLED &&
      orderDetails.currentStatus !== MEDICINE_ORDER_STATUS.ORDER_VERIFIED &&
      orderDetails.currentStatus !== MEDICINE_ORDER_STATUS.ORDER_PLACED &&
      orderDetails.currentStatus !== MEDICINE_ORDER_STATUS.PAYMENT_SUCCESS
    ) {
      throw `${orderId} - is in status ${orderDetails.currentStatus}`;
    }
    try {
      calculateRefund(orderDetails, totalOrderBilling, profilesDb, medOrderRepo, statusMessage);
      if (orderDetails.currentStatus !== MEDICINE_ORDER_STATUS.CANCELLED) {
        const orderStatusAttrs: Partial<MedicineOrdersStatus> = {
          orderStatus: MEDICINE_ORDER_STATUS.CANCELLED,
          medicineOrders: orderDetails,
          statusDate: new Date(),
          statusMessage,
          customReason,
        };
        medOrderRepo.saveMedicineOrderStatus(orderStatusAttrs, orderDetails.orderAutoId);
        medOrderRepo.updateMedicineOrderDetails(
          orderDetails.id,
          orderDetails.orderAutoId,
          new Date(),
          MEDICINE_ORDER_STATUS.CANCELLED
        );
      }
      return { orderId: orderDetails.orderAutoId, refundStatus: true };
    } catch (e) {
      log(
        'profileServiceLogger',
        `refundInitiate():${orderId}`,
        `calculateRefund() failed`,
        e.stack,
        'true'
      );
      throw e;
    }
  } else {
    throw `refundInitiate(): Invalid orderId - ${orderId}`;
  }
};

export const refundInitResolver = {
  Mutation: {
    refundInitiate,
  },
};
