import gql from 'graphql-tag';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { MedicineOrdersRepository } from 'profiles-service/repositories/MedicineOrdersRepository';
import { MedicineOrdersStatusRepository } from 'profiles-service/repositories/MedicineOrdersStatusRepository';
import {
  MEDICINE_ORDER_STATUS,
  MedicineOrdersStatus,
  MedicineOrders,
} from 'profiles-service/entities';
import { Resolver } from 'api-gateway';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import fetch from 'node-fetch';
import { PharmaCancelResult } from 'types/medicineOrderTypes';
import { log } from 'customWinstonLogger';
import { Connection } from 'typeorm';
import {} from 'coupons-service/resolvers/validatePharmaCoupon';
import { medicineOrderCancelled } from 'notifications-service/resolvers/notifications';
import { calculateRefund } from 'profiles-service/helpers/refundHelper';
import { WebEngageInput, postEvent } from 'helpers/webEngage';
import { ApiConstants } from 'ApiConstants';
import { format, addMinutes } from 'date-fns';

export const medicineOrderCancelOMSTypeDefs = gql`
  input MedicineOrderCancelOMSInput {
    orderNo: Int
    cancelReasonCode: String
    cancelReasonText: String
  }

  type MedicineOrderCancelOMSResult {
    orderStatus: MEDICINE_ORDER_STATUS
  }

  extend type Mutation {
    cancelMedicineOrderOMS(
      medicineOrderCancelOMSInput: MedicineOrderCancelOMSInput
    ): MedicineOrderCancelOMSResult!
  }
`;

type MedicineOrderCancelOMSInput = {
  orderNo: number;
  cancelReasonCode: string;
  cancelReasonText: string;
};

type MedicineOrderCancelOMSResult = {
  orderStatus: MEDICINE_ORDER_STATUS;
};
type MedicineOrderCancelOMSInputArgs = {
  medicineOrderCancelOMSInput: MedicineOrderCancelOMSInput;
};

const cancelMedicineOrderOMS: Resolver<
  null,
  MedicineOrderCancelOMSInputArgs,
  ProfilesServiceContext,
  MedicineOrderCancelOMSResult
> = async (parent, { medicineOrderCancelOMSInput }, { profilesDb }) => {
  const medicineOrdersRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
  const orderDetails = await medicineOrdersRepo.getMedicineOrderWithPaymentAndShipments(
    medicineOrderCancelOMSInput.orderNo
  );
  if (!orderDetails) {
    throw new AphError(AphErrorMessages.INVALID_MEDICINE_ORDER_ID, undefined, {});
  }
  if (orderDetails.currentStatus == MEDICINE_ORDER_STATUS.CANCELLED) {
    throw new AphError(AphErrorMessages.INVALID_MEDICINE_ORDER_ID, undefined, {});
  }
  // check whether order is pushed to oms or not
  if (orderDetails.referenceNo) {
    const shipmentDetails = orderDetails.medicineOrderShipments;
    if (shipmentDetails && shipmentDetails.length > 0) {
      const billedShipment = shipmentDetails.filter(
        (shipment) => shipment.currentStatus === MEDICINE_ORDER_STATUS.ORDER_VERIFIED
      );
      if (billedShipment.length != shipmentDetails.length) {
        throw new AphError(AphErrorMessages.CANCEL_MEDICINE_ORDER_BILLED_ERROR, undefined, {});
      }
    }

    const cancelOrderInput = {
      orderrefno: orderDetails.referenceNo,
      reasoncode: medicineOrderCancelOMSInput.cancelReasonCode,
    };

    const cancelOrderUrl = process.env.PHARMACY_MED_CANCEL_OMS_ORDERS
      ? process.env.PHARMACY_MED_CANCEL_OMS_ORDERS
      : '';
    const omsOrderToken = process.env.PHARMACY_OMS_ORDER_TOKEN
      ? process.env.PHARMACY_OMS_ORDER_TOKEN
      : '';
    if (cancelOrderUrl == '' || omsOrderToken == '') {
      throw new AphError(AphErrorMessages.INVALID_PHARMA_ORDER_URL, undefined, {});
    }

    log(
      'profileServiceLogger',
      `EXTERNAL_API_CALL_CANCEL_MED: ${cancelOrderUrl}`,
      'cancelMedicineOrder()->API_CALL_STARTING',
      '',
      ''
    );
    const pharmaResp = await fetch(cancelOrderUrl, {
      method: 'POST',
      body: JSON.stringify(cancelOrderInput),
      headers: { 'Content-Type': 'application/json', 'Auth-Token': omsOrderToken },
    }).catch((error) => {
      log(
        'profileServiceLogger',
        'API_CALL_ERROR',
        'cancelMedicineOrder()->CATCH_BLOCK',
        '',
        JSON.stringify(error)
      );
      throw new AphError(AphErrorMessages.CANCEL_MEDICINE_ORDER_ERROR);
    });
    if (pharmaResp.status == 400 || pharmaResp.status == 404) {
      log(
        'profileServiceLogger',
        'API_CALL_RESPONSE',
        'cancelMedicineOrder()->API_CALL_RESPONSE',
        JSON.stringify(pharmaResp),
        ''
      );
      throw new AphError(AphErrorMessages.SOMETHING_WENT_WRONG, undefined, {});
    }

    const textRes = await pharmaResp.text();
    console.log(textRes);
    log(
      'profileServiceLogger',
      'API_CALL_RESPONSE',
      'cancelMedicineOrder()->API_CALL_RESPONSE',
      textRes,
      ''
    );

    const orderResp: PharmaCancelResult = JSON.parse(textRes);

    if (orderResp.Status) {
      updateOrderCancelled(profilesDb, orderDetails, medicineOrderCancelOMSInput);
    } else {
      throw new AphError(AphErrorMessages.SOMETHING_WENT_WRONG, undefined, orderResp);
    }
  } else {
    updateOrderCancelled(profilesDb, orderDetails, medicineOrderCancelOMSInput);
  }
 // medicineOrderCancelled(orderDetails, medicineOrderCancelOMSInput.cancelReasonCode, profilesDb);

  //post order cancelled event to webEngage
  const postBody: Partial<WebEngageInput> = {
    userId: orderDetails.patient.mobileNumber,
    eventName: ApiConstants.MEDICINE_ORDER_CANCELLED_FROM_APP_EVENT_NAME.toString(),
    eventData: {
      orderId: orderDetails.orderAutoId,
      statusDateTime: format(addMinutes(new Date(), +330), "yyyy-MM-dd'T'HH:mm:ss'+0530'"),
      reasonCode: medicineOrderCancelOMSInput.cancelReasonCode.toString(),
    },
  };
  postEvent(postBody);

  return { orderStatus: MEDICINE_ORDER_STATUS.CANCEL_REQUEST };
};

const updateOrderCancelled = async (
  profilesDb: Connection,
  orderDetails: MedicineOrders,
  medicineOrderCancelOMSInput: MedicineOrderCancelOMSInput
) => {
  const medicineOrdersRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
  const medicineOrdersStatusRepo = profilesDb.getCustomRepository(MedicineOrdersStatusRepository);
  const orderStatusAttrs: Partial<MedicineOrdersStatus> = {
    orderStatus: MEDICINE_ORDER_STATUS.CANCELLED,
    medicineOrders: orderDetails,
    statusDate: new Date(),
    statusMessage: medicineOrderCancelOMSInput.cancelReasonCode,
    customReason: medicineOrderCancelOMSInput.cancelReasonText,
  };
  medicineOrdersStatusRepo.saveMedicineOrderStatus(orderStatusAttrs, orderDetails.orderAutoId);
  medicineOrdersRepo.updateMedicineOrderDetails(
    orderDetails.id,
    orderDetails.orderAutoId,
    new Date(),
    MEDICINE_ORDER_STATUS.CANCELLED
  );
  calculateRefund(orderDetails, 0, profilesDb, medicineOrdersRepo,medicineOrderCancelOMSInput.cancelReasonCode);
};

export const medicineOrderCancelOMSResolvers = {
  Mutation: {
    cancelMedicineOrderOMS,
  },
};
