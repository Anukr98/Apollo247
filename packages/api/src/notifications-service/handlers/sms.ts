import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { ApiConstants } from 'ApiConstants';
import { MedicineOrders } from 'profiles-service/entities';
import { log } from 'customWinstonLogger';

type MedicineOrderRefundNotificationInput = {
  refundAmount: number;
  healthCreditsRefund: number;
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
  medicineOrderRefundNotificationInput: MedicineOrderRefundNotificationInput
) {
  let notificationBody: string = '';
  if (
    medicineOrderRefundNotificationInput.refundAmount > 0 ||
    medicineOrderRefundNotificationInput.healthCreditsRefund > 0
  ) {
    if (
      medicineOrderRefundNotificationInput.refundAmount > 0 &&
      medicineOrderRefundNotificationInput.healthCreditsRefund > 0
    ) {
      notificationBody = ApiConstants.ORDER_PAYMENT_HC_PARTIAL_REFUND_BODY;
      notificationBody = notificationBody.replace('{orderId}', orderDetails.orderAutoId.toString());
      notificationBody = notificationBody.replace(
        '{refundAmount}',
        medicineOrderRefundNotificationInput.refundAmount.toString()
      );
      notificationBody = notificationBody.replace(
        '{healthCreditsRefund}',
        medicineOrderRefundNotificationInput.healthCreditsRefund.toString()
      );
    } else if (medicineOrderRefundNotificationInput.refundAmount > 0) {
      notificationBody = ApiConstants.ORDER_PAYMENT_PARTIAL_REFUND_BODY;
      notificationBody = notificationBody.replace('{orderId}', orderDetails.orderAutoId.toString());
      notificationBody = notificationBody.replace(
        '{refundAmount}',
        medicineOrderRefundNotificationInput.refundAmount.toString()
      );
    } else if (medicineOrderRefundNotificationInput.healthCreditsRefund > 0) {
      notificationBody = ApiConstants.ORDER_HC_PARTIAL_REFUND_BODY;
      notificationBody = notificationBody.replace('{orderId}', orderDetails.orderAutoId.toString());
      notificationBody = notificationBody.replace(
        '{healthCreditsRefund}',
        medicineOrderRefundNotificationInput.healthCreditsRefund.toString()
      );
    }
    //console.log(notificationBody);
    await sendNotificationSMS(orderDetails.patient.mobileNumber, notificationBody);
  }
  return;
}
