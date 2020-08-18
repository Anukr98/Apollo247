import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { ApiConstants } from 'ApiConstants';
import {
  MedicineOrders,
  MedicineOrderPayments,
  MEDICINE_ORDER_PAYMENT_TYPE,
} from 'profiles-service/entities';
import { log } from 'customWinstonLogger';
import { Connection } from 'typeorm';
import { MedicineOrdersRepository } from 'profiles-service/repositories/MedicineOrdersRepository';

type MedicineOrderRefundNotificationInput = {
  refundAmount: number;
  healthCreditsRefunded: number;
  paymentInfo: MedicineOrderPayments;
  reasonCode?: string;
  isPartialRefund: boolean;
  isRefundSuccessful: boolean;
};

export const sendNotificationSMS = async (mobileNumber: string, message: string) => {
  //Adding Apollo 247 string at starting of the body
  message = '[Apollo 247] ' + message;

  const apiBaseUrl = process.env.KALEYRA_OTP_API_BASE_URL;
  const apiUrlWithKey = `${apiBaseUrl}?api_key=${process.env.KALEYRA_NOTIFICATION_API_KEY}`;
  const queryParams = `&method=${ApiConstants.KALEYRA_OTP_SMS_METHOD}&message=${message}&to=${mobileNumber}&sender=${ApiConstants.KALEYRA_OTP_SENDER}`;

  const apiUrl = `${apiUrlWithKey}${queryParams}`;
  //logging api call data here
  log('smsOtpAPILogger', `OPT_API_CALL: ${apiUrl}`, 'sendSMS()->API_CALL_STARTING', '', '');
  const smsResponse = await fetch(apiUrl)
    .then((res) => res.json())
    .catch((error) => {
      //logging error here
      log('smsOtpAPILogger', `API_CALL_ERROR`, 'sendSMS()->CATCH_BLOCK', '', JSON.stringify(error));
      throw new AphError(AphErrorMessages.CREATE_OTP_ERROR);
    });

  console.log('smsResponse================', smsResponse);
  return smsResponse;
};

export async function medicineOrderRefundNotification(
  orderDetails: MedicineOrders,
  medicineOrderRefundNotificationInput: MedicineOrderRefundNotificationInput,
  patientsDb: Connection
) {
  let notificationBody: string = '';
  const {
    paymentInfo,
    isPartialRefund,
    isRefundSuccessful,
    reasonCode,
    healthCreditsRefunded,
    refundAmount,
  } = medicineOrderRefundNotificationInput;

  /**
   * If partial refund happens, it means order is not cancelled but billing amount is less
   * Otherwise, order was cancelled and user should have been refunded
   */
  if (isPartialRefund === true) {
    if ((refundAmount > 0 && isRefundSuccessful) || healthCreditsRefunded > 0) {
      if (refundAmount > 0 && isRefundSuccessful && healthCreditsRefunded > 0) {
        notificationBody = ApiConstants.ORDER_PAYMENT_HC_PARTIAL_REFUND_BODY;
        notificationBody = notificationBody.replace(
          '{orderId}',
          orderDetails.orderAutoId.toString()
        );
        notificationBody = notificationBody.replace('{refundAmount}', refundAmount.toString());
        notificationBody = notificationBody.replace(
          '{healthCreditsRefund}',
          healthCreditsRefunded.toString()
        );
      } else if (refundAmount > 0 && isRefundSuccessful) {
        notificationBody = ApiConstants.ORDER_PAYMENT_PARTIAL_REFUND_BODY;
        notificationBody = notificationBody.replace(
          '{orderId}',
          orderDetails.orderAutoId.toString()
        );
        notificationBody = notificationBody.replace('{refundAmount}', refundAmount.toString());
      } else if (healthCreditsRefunded > 0) {
        notificationBody = ApiConstants.ORDER_HC_PARTIAL_REFUND_BODY;
        notificationBody = notificationBody.replace(
          '{orderId}',
          orderDetails.orderAutoId.toString()
        );
        notificationBody = notificationBody.replace(
          '{healthCreditsRefund}',
          healthCreditsRefunded.toString()
        );
      }
      await sendNotificationSMS(orderDetails.patient.mobileNumber, notificationBody);
    }
  } else {
    notificationBody = ApiConstants.ORDER_CANCEL_BODY;
    const medicineOrdersRepo = patientsDb.getCustomRepository(MedicineOrdersRepository);
    notificationBody = notificationBody.replace('{name}', orderDetails.patient.firstName);
    notificationBody = notificationBody.replace('{orderId}', orderDetails.orderAutoId.toString());
    if (reasonCode) {
      const cancellationReasons = await medicineOrdersRepo.getMedicineOrderCancelReasonByCode(
        reasonCode
      );
      if (cancellationReasons) {
        notificationBody = notificationBody.replace('{reason}', cancellationReasons.displayMessage);
      } else {
        notificationBody = notificationBody.replace('{reason}', 'Your order has been cancelled');
      }
      await sendNotificationSMS(orderDetails.patient.mobileNumber, notificationBody);
    }

    if (
      paymentInfo.paymentType == MEDICINE_ORDER_PAYMENT_TYPE.CASHLESS &&
      ((refundAmount > 0 && isRefundSuccessful) || healthCreditsRefunded > 0)
    ) {
      if (refundAmount > 0 && isRefundSuccessful && healthCreditsRefunded > 0) {
        notificationBody = ApiConstants.ORDER_CANCEL_PAYMENT_HC_REFUND_BODY;
        notificationBody = notificationBody.replace(
          '{orderId}',
          orderDetails.orderAutoId.toString()
        );
        notificationBody = notificationBody.replace('{refund}', refundAmount.toString());
        notificationBody = notificationBody.replace(
          '{healthCreditsRefund}',
          healthCreditsRefunded.toString()
        );
      } else if (refundAmount > 0 && isRefundSuccessful) {
        notificationBody = ApiConstants.ORDER_CANCEL_PREPAID_BODY;
        notificationBody = notificationBody.replace(
          '{orderId}',
          orderDetails.orderAutoId.toString()
        );
        notificationBody = notificationBody.replace('{refund}', refundAmount.toString());
      } else if (healthCreditsRefunded > 0) {
        notificationBody = ApiConstants.ORDER_CANCEL_HC_REFUND_BODY;
        notificationBody = notificationBody.replace(
          '{orderId}',
          orderDetails.orderAutoId.toString()
        );
        notificationBody = notificationBody.replace(
          '{healthCreditsRefund}',
          healthCreditsRefunded.toString()
        );
      }
      await sendNotificationSMS(orderDetails.patient.mobileNumber, notificationBody);
    }
  }
  return;
}
