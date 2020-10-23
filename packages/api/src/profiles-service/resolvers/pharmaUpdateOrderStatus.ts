import gql from 'graphql-tag';
import { Decimal } from 'decimal.js';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { MedicineOrdersRepository } from 'profiles-service/repositories/MedicineOrdersRepository';

import {
  MEDICINE_ORDER_STATUS,
  MedicineOrdersStatus,
  MedicineOrderShipments,
  MedicineOrderInvoice,
} from 'profiles-service/entities';

import { Resolver } from 'api-gateway';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { sendMedicineOrderStatusNotification } from 'notifications-service/handlers';
import { NotificationType } from 'notifications-service/constants';
import { format, addMinutes, parseISO } from 'date-fns';
import { log } from 'customWinstonLogger';
import { calculateRefund } from 'profiles-service/helpers/refundHelper';
import { WebEngageInput, postEvent } from 'helpers/webEngage';
import { ApiConstants } from 'ApiConstants';

import { syncInventory } from 'profiles-service/helpers/inventorySync';
import { SYNC_TYPE } from 'types/inventorySync';
import { ItemDetails } from 'types/oneApolloTypes';
import { createOneApolloTransaction } from 'profiles-service/helpers/OneApolloTransactionHelper';

export const updateOrderStatusTypeDefs = gql`
  input OrderStatusInput {
    orderId: Int!
    status: MEDICINE_ORDER_STATUS!
    trackingNo: String
    trackingUrl: String
    trackingProvider: String
    reasonCode: String
    apOrderNo: String
    updatedDate: String!
    referenceNo: String
    driverName: String
    driverPhone: String
  }

  type UpdateOrderStatusResult {
    status: String
    errorCode: Int
    errorMessage: String
    orderId: Int
  }

  extend type Mutation {
    updateOrderStatus(updateOrderStatusInput: OrderStatusInput): UpdateOrderStatusResult!
  }
`;

type UpdateOrderStatusResult = {
  status: MEDICINE_ORDER_STATUS;
  errorCode: number;
  errorMessage: string;
  orderId: number;
};

type OrderStatusInput = {
  orderId: number;
  status: MEDICINE_ORDER_STATUS;
  trackingNo: string;
  trackingUrl: string;
  trackingProvider: string;
  driverName: string;
  driverPhone: string;
  referenceNo: string;
  reasonCode: string;
  apOrderNo: string;
  updatedDate: string;
};

type OrderStatusInputArgs = {
  updateOrderStatusInput: OrderStatusInput;
};

const inernal_statuses = ['READY_FOR_VERIFICATION', 'VERIFICATION_DONE', 'SHIPPED'];

const updateOrderStatus: Resolver<
  null,
  OrderStatusInputArgs,
  ProfilesServiceContext,
  UpdateOrderStatusResult
> = async (parent, { updateOrderStatusInput }, { profilesDb }) => {
  log(
    'profileServiceLogger',
    `ORDER_STATUS_CHANGE_${updateOrderStatusInput.status}_FOR_ORDER_ID:${updateOrderStatusInput.orderId}`,
    `updateOrderStatus call from OMS`,
    JSON.stringify(updateOrderStatusInput),
    ''
  );

  let status = MEDICINE_ORDER_STATUS[updateOrderStatusInput.status];
  const medicineOrdersRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
  const orderDetails = await medicineOrdersRepo.getMedicineOrderWithPaymentAndShipments(
    updateOrderStatusInput.orderId
  );
  if (!orderDetails) {
    throw new AphError(AphErrorMessages.INVALID_MEDICINE_ORDER_ID, undefined, {});
  }

  const mobileNumberIn = orderDetails.patient.mobileNumber.slice(3);

  if (orderDetails.currentStatus == MEDICINE_ORDER_STATUS.CANCELLED) {
    throw new AphError(AphErrorMessages.INVALID_MEDICINE_ORDER_ID, undefined, {});
  }

  const statusDate = format(
    addMinutes(parseISO(updateOrderStatusInput.updatedDate), -330),
    "yyyy-MM-dd'T'HH:mm:ss.SSSX"
  );
  // shipments are not created. order level status updates
  if (!updateOrderStatusInput.apOrderNo || !orderDetails.medicineOrderShipments) {
    let hideStatus = true;
    if (inernal_statuses.indexOf(status) > -1) {
      hideStatus = false;
    } else {
      await medicineOrdersRepo.updateMedicineOrderDetails(
        orderDetails.id,
        orderDetails.orderAutoId,
        new Date(statusDate),
        status
      );
    }
    const orderStatusAttrs: Partial<MedicineOrdersStatus> = {
      orderStatus: status,
      medicineOrders: orderDetails,
      statusDate: new Date(statusDate),
      statusMessage: updateOrderStatusInput.reasonCode,
      hideStatus,
    };
    await medicineOrdersRepo.saveMedicineOrderStatus(orderStatusAttrs, orderDetails.orderAutoId);
    if (status == MEDICINE_ORDER_STATUS.CANCELLED) {
      calculateRefund(
        orderDetails,
        0,
        profilesDb,
        medicineOrdersRepo,
        updateOrderStatusInput.reasonCode
      );
      orderDetails.medicineOrderLineItems = await medicineOrdersRepo.getMedicineOrderLineItemByOrderId(
        orderDetails.id
      );
      syncInventory(orderDetails, SYNC_TYPE.CANCEL);
    }
  } else {
    const shipmentDetails = orderDetails.medicineOrderShipments.find((shipment) => {
      return shipment.apOrderNo == updateOrderStatusInput.apOrderNo;
    });
    if (!shipmentDetails) {
      throw new AphError(AphErrorMessages.INVALID_MEDICINE_SHIPMENT_ID, undefined, {});
    }
    if (shipmentDetails.currentStatus == MEDICINE_ORDER_STATUS.CANCELLED) {
      throw new AphError(AphErrorMessages.INVALID_MEDICINE_SHIPMENT_ID, undefined, {});
    }
    const orderStatusAttrs: Partial<MedicineOrdersStatus> = {
      orderStatus: status,
      medicineOrderShipments: shipmentDetails,
      statusDate: new Date(statusDate),
      statusMessage: updateOrderStatusInput.reasonCode,
    };
    try {
      await medicineOrdersRepo.saveMedicineOrderStatus(orderStatusAttrs, orderDetails.orderAutoId);
    } catch (e) {
      throw new AphError(AphErrorMessages.SAVE_MEDICINE_ORDER_STATUS_ERROR, undefined, e);
    }
    const orderShipmentsAttrs: Partial<MedicineOrderShipments> = {
      currentStatus: status,
      cancelReasonCode: updateOrderStatusInput.reasonCode || shipmentDetails.cancelReasonCode,
    };
    if (status == MEDICINE_ORDER_STATUS.READY_TO_SHIP) {
      orderShipmentsAttrs.trackingNo = updateOrderStatusInput.trackingNo;
      orderShipmentsAttrs.trackingUrl = updateOrderStatusInput.trackingUrl;
      orderShipmentsAttrs.trackingProvider = updateOrderStatusInput.trackingProvider;
    } else if (status == MEDICINE_ORDER_STATUS.OUT_FOR_DELIVERY) {
      orderShipmentsAttrs.driverDetails = {
        driverName: updateOrderStatusInput.driverName,
        driverPhone: updateOrderStatusInput.driverPhone,
      };
    }
    try {
      await medicineOrdersRepo.updateMedicineOrderShipment(
        orderShipmentsAttrs,
        shipmentDetails.apOrderNo
      );
    } catch (e) {
      throw new AphError(AphErrorMessages.SAVE_MEDICINE_ORDER_SHIPMENT_ERROR, undefined, e);
    }
    let invoiceIds: string[] = [];

    /**
     * Shipments which are neigther cancelled nor billed are unresolved shipments
     */
    let hasUnresolvedShipments: boolean = false;

    let resolvedShipments: MedicineOrderShipments['id'][] = [];

    // Variable for array of invoices for the orderId
    let invoices: MedicineOrderInvoice[] = [];

    /**
     * Total order billing happened till now,
     * For all the shipments excluding already canceled ones
     * Will be stored in it
     */
    let totalOrderBilling: number = 0;

    /**
     * If current shipment in context is canceled
     * then fetch all the invoices related to the orderId
     */
    if (status === MEDICINE_ORDER_STATUS.CANCELLED) {
      invoices = await medicineOrdersRepo.getInvoiceWithShipment(orderDetails.orderAutoId);
      invoiceIds = invoices.map((invoice: MedicineOrderInvoice) => {
        return invoice.medicineOrderShipments.id;
      });
    }
    const shipmentsWithDifferentStatus = orderDetails.medicineOrderShipments.filter((shipment) => {
      /**
       * If any of the shipment is neighther invoiced nor cancelled,
       * then don't initiate refund here as it will happen in pharmaOrderBilled
       */
      if (!invoiceIds.includes(shipment.id)) {
        if (
          shipment.currentStatus != MEDICINE_ORDER_STATUS.CANCELLED &&
          shipment.id !== shipmentDetails.id
        ) {
          hasUnresolvedShipments = true;
        }
      } else {
        if (
          !hasUnresolvedShipments &&
          shipment.currentStatus != MEDICINE_ORDER_STATUS.CANCELLED &&
          shipment.id !== shipmentDetails.id
        ) {
          resolvedShipments.push(shipment.id);
        }
      }

      if (shipment.apOrderNo != shipmentDetails.apOrderNo) {
        const sameStatusObject = shipment.medicineOrdersStatus.find((orderStatusObj) => {
          return orderStatusObj.orderStatus == status;
        });
        return !sameStatusObject;
      }
    });

    if (!shipmentsWithDifferentStatus || shipmentsWithDifferentStatus.length == 0) {
      let hideStatus = true;
      if (inernal_statuses.indexOf(status) > -1) {
        hideStatus = false;
      } else {
        await medicineOrdersRepo.updateMedicineOrderDetails(
          orderDetails.id,
          orderDetails.orderAutoId,
          new Date(statusDate),
          status
        );
      }

      const orderStatusAttrs: Partial<MedicineOrdersStatus> = {
        orderStatus: status,
        medicineOrders: orderDetails,
        statusDate: new Date(statusDate),
        statusMessage: updateOrderStatusInput.reasonCode,
        hideStatus,
      };
      await medicineOrdersRepo.saveMedicineOrderStatus(orderStatusAttrs, orderDetails.orderAutoId);
      if (status == MEDICINE_ORDER_STATUS.OUT_FOR_DELIVERY) {
        if (updateOrderStatusInput.trackingProvider) {
          const trackingProvider = updateOrderStatusInput.trackingProvider.toLowerCase();
          if (trackingProvider != 'apollo fleet')
            sendMedicineOrderStatusNotification(
              trackingProvider == 'ap internal fleet'
                ? NotificationType.MEDICINE_ORDER_OUT_FOR_DELIVERY
                : NotificationType.MEDICINE_ORDER_OUT_FOR_DELIVERY_EXTERNAL,
              orderDetails,
              profilesDb
            );
        }

        //post order out for delivery event to webEngage
        const postBody: Partial<WebEngageInput> = {
          userId: orderDetails.patient.mobileNumber,
          eventName: ApiConstants.MEDICINE_ORDER_DISPATCHED_EVENT_NAME.toString(),
          eventData: {
            orderId: orderDetails.orderAutoId,
            statusDateTime: format(
              parseISO(updateOrderStatusInput.updatedDate),
              "yyyy-MM-dd'T'HH:mm:ss'+0530'"
            ),
            DSP: orderShipmentsAttrs.trackingProvider,
            AWBNumber: orderShipmentsAttrs.trackingNo,
          },
        };
        postEvent(postBody);
      }
      if (status == MEDICINE_ORDER_STATUS.DELIVERED || status == MEDICINE_ORDER_STATUS.PICKEDUP) {
        const notificationType =
          status == MEDICINE_ORDER_STATUS.DELIVERED
            ? NotificationType.MEDICINE_ORDER_DELIVERED
            : NotificationType.MEDICINE_ORDER_PICKEDUP;
        sendMedicineOrderStatusNotification(notificationType, orderDetails, profilesDb);
        await createOneApolloTransaction(
          medicineOrdersRepo,
          orderDetails,
          orderDetails.patient,
          mobileNumberIn,
          shipmentDetails.apOrderNo
        );

        //post order delivered event to webEngage
        const postBody: Partial<WebEngageInput> = {
          userId: orderDetails.patient.mobileNumber,
          eventName: ApiConstants.MEDICINE_ORDER_DELIVERED_EVENT_NAME.toString(),
          eventData: {
            orderId: orderDetails.orderAutoId,
            statusDateTime: format(
              parseISO(updateOrderStatusInput.updatedDate),
              "yyyy-MM-dd'T'HH:mm:ss'+0530'"
            ),
          },
        };
        postEvent(postBody);
      }
      if (status == MEDICINE_ORDER_STATUS.CANCELLED) {
        //post order cancelled event to webEngage
        const postBody: Partial<WebEngageInput> = {
          userId: orderDetails.patient.mobileNumber,
          eventName: ApiConstants.MEDICINE_ORDER_CANCELLED_EVENT_NAME.toString(),
          eventData: {
            orderId: orderDetails.orderAutoId,
            statusDateTime: format(
              parseISO(updateOrderStatusInput.updatedDate),
              "yyyy-MM-dd'T'HH:mm:ss'+0530'"
            ),
          },
        };
        postEvent(postBody);
        orderDetails.medicineOrderLineItems = await medicineOrdersRepo.getMedicineOrderLineItemByOrderId(
          orderDetails.id
        );
        syncInventory(orderDetails, SYNC_TYPE.CANCEL);
      }
    }
    if (status === MEDICINE_ORDER_STATUS.CANCELLED && !hasUnresolvedShipments) {
      totalOrderBilling = invoices.reduce(
        (acc: number, curValue: Partial<MedicineOrderInvoice>) => {
          if (
            curValue.billDetails &&
            curValue.medicineOrderShipments &&
            resolvedShipments.includes(curValue.medicineOrderShipments.id)
          ) {
            const invoiceValue: number = JSON.parse(curValue.billDetails).invoiceValue;
            return +new Decimal(acc).plus(invoiceValue);
          }
          return acc;
        },
        0
      );
      calculateRefund(
        orderDetails,
        totalOrderBilling,
        profilesDb,
        medicineOrdersRepo,
        updateOrderStatusInput.reasonCode
      );
    }
  }

  return {
    status: updateOrderStatusInput.status,
    errorCode: 0,
    errorMessage: '',
    orderId: orderDetails.orderAutoId,
  };
};

export const updateOrderStatusResolvers = {
  Mutation: {
    updateOrderStatus,
  },
};
