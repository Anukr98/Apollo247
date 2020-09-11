import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { Connection } from 'typeorm';
import { ApiConstants } from 'ApiConstants';
import {
  Patient,
  MedicineOrders,
  DiagnosticOrders,
  MEDICINE_ORDER_PAYMENT_TYPE,
} from 'profiles-service/entities';
import {
  NotificationType,
  NotificationPriority,
  PushNotificationSuccessMessage,
  APPT_CALL_TYPE,
} from 'notifications-service/constants';
import { DoctorDeviceTokenRepository } from 'doctors-service/repositories/doctorDeviceTokenRepository';
import { MedicineOrdersRepository } from 'profiles-service/repositories/MedicineOrdersRepository';
import { addMilliseconds, format } from 'date-fns';
import path from 'path';
import fs from 'fs';
import { Appointment } from 'consults-service/entities';
import * as child_process from 'child_process';
import { Doctor } from 'doctors-service/entities';
import { getPatientDeviceTokens, logNotificationResponse } from './common';
import { sendNotificationSMS } from './sms';
import { sendDoctorNotificationWhatsapp } from './whatsApp';
import { admin } from 'firebase';
import { getPatientDeeplink } from 'helpers/appsflyer';

export async function sendPatientRegistrationNotification(
  patient: Patient,
  patientsDb: Connection,
  registrationCode: string
) {
  //get all the patient device tokens
  let patientDeviceTokens: string[] = [];
  patientDeviceTokens = await getPatientDeviceTokens(patient.mobileNumber, patientsDb);
  //notification payload
  const notificationTitle = ApiConstants.PATIENT_REGISTRATION_TITLE.toString();
  let notificationBody: string = '';
  notificationBody = ApiConstants.PATIENT_REGISTRATION_BODY.replace('{0}', patient.firstName);
  let smsContent = process.env.SMS_LINK ? ' Click here ' + process.env.SMS_LINK : '';
  smsContent = notificationBody + smsContent;
  const payload = {
    notification: {
      title: notificationTitle,
      body: notificationBody,
      sound: ApiConstants.NOTIFICATION_DEFAULT_SOUND.toString(),
    },
    data: {
      type: 'Registration_Success',
      patientId: patient.id,
      firstName: patient.firstName,
      content: notificationBody,
    },
  };
  //let smsContent = notificationBody;
  // not sending regCode from any callee
  // if (registrationCode != '') {
  //   smsContent = ApiConstants.PATIENT_REGISTRATION_CODE_BODY.replace('{0}', patient.firstName);
  //   smsContent = smsContent.replace('{1}', registrationCode);
  // }
  //call sendNotificationSMS function to send sms
  await sendNotificationSMS(patient.mobileNumber, smsContent ? smsContent : '');
  if (patientDeviceTokens.length == 0) return;

  //notification options
  const options = {
    priority: NotificationPriority.high,
    timeToLive: 60 * 60 * 24, //wait for one day.. if device is offline
  };

  admin
    .messaging()
    .sendToDevice(patientDeviceTokens, payload, options)
    .then((response: PushNotificationSuccessMessage) => {
      const logData = { patientId: patient.id, multicastId: response.multicastId };
      logNotificationResponse(NotificationType.PATIENT_REGISTRATION, logData);
    })
    .catch((error: JSON) => {
      console.log('PushNotification Failed::' + error);
      throw new AphError(AphErrorMessages.PUSH_NOTIFICATION_FAILED);
    });

  console.log('push notifications sent');
  return { status: true };
}

//Notification - Medicine order Status Changes
export async function sendMedicineOrderStatusNotification(
  notificationType: NotificationType,
  orderDetails: MedicineOrders,
  patientsDb: Connection
) {
  //get all the patient device tokens
  let patientDeviceTokens: string[] = [];
  const patientDetails = orderDetails.patient;
  patientDeviceTokens = await getPatientDeviceTokens(patientDetails.mobileNumber, patientsDb);

  if (patientDeviceTokens.length == 0) return;

  let notificationTitle: string = '';
  let notificationBody: string = '';
  let payloadDataType: string = '';

  switch (notificationType) {
    case NotificationType.MEDICINE_ORDER_PLACED:
      payloadDataType = 'Order_Placed';
      notificationTitle = ApiConstants.ORDER_PLACED_TITLE;
      notificationBody = ApiConstants.ORDER_PLACED_BODY;
      break;
    case NotificationType.MEDICINE_ORDER_OUT_FOR_DELIVERY:
      payloadDataType = 'Order_Out_For_Delivery';
      notificationTitle = ApiConstants.ORDER_OUT_FOR_DELIVERY_TITLE;
      notificationBody = ApiConstants.ORDER_OUT_FOR_DELIVERY_BODY;
      break;
    case NotificationType.MEDICINE_ORDER_OUT_FOR_DELIVERY_EXTERNAL:
      payloadDataType = 'Order_Out_For_Delivery';
      notificationTitle = ApiConstants.ORDER_OUT_FOR_DELIVERY_TITLE;
      notificationBody = ApiConstants.ORDER_OUT_FOR_DELIVERY_BODY_EXTERNAL;
      break;
    case NotificationType.MEDICINE_ORDER_READY_AT_STORE:
      payloadDataType = 'Order_ready_at_store';
      notificationTitle = ApiConstants.ORDER_READY_AT_STORE_TITLE;
      notificationBody = ApiConstants.ORDER_READY_AT_STORE_BODY;
      break;
    case NotificationType.MEDICINE_ORDER_DELIVERED:
      payloadDataType = 'Order_Delivered';
      notificationTitle = ApiConstants.ORDER_DELIVERY_TITLE;
      notificationBody = ApiConstants.ORDER_DELIVERY_BODY;
      break;
    case NotificationType.MEDICINE_ORDER_PICKEDUP:
      payloadDataType = 'Order_pickedup';
      notificationTitle = ApiConstants.ORDER_PICKEDUP_TITLE;
      notificationBody = ApiConstants.ORDER_PICKEDUP_BODY;
      break;
    case NotificationType.MEDICINE_ORDER_PAYMENT_FAILED:
      payloadDataType = 'Order_Payment_Failed';
      notificationTitle = ApiConstants.MEDICINE_ORDER_PAYMENT_FAILED_TITLE;
      notificationBody = ApiConstants.MEDICINE_ORDER_PAYMENT_FAILED_BODY;
      break;
    case NotificationType.MEDICINE_ORDER_BILL_CHANGED:
      payloadDataType = 'Order_bill_changed';
      notificationTitle = ApiConstants.MEDICINE_ORDER_CHANGED_TITLE;
      notificationBody = ApiConstants.MEDICINE_ORDER_CHANGED_BODY;
      break;
    default:
      payloadDataType = 'Order_Placed';
      notificationTitle = ApiConstants.ORDER_PLACED_TITLE;
      notificationBody = ApiConstants.ORDER_PLACED_BODY;
  }
  //notification payload
  const userName = patientDetails.firstName ? patientDetails.firstName.trim() : 'User';
  const orderNumber = orderDetails.orderAutoId ? orderDetails.orderAutoId.toString() : '';

  notificationTitle = notificationTitle.toString();
  notificationBody = notificationBody.replace('{0}', userName);
  notificationBody = notificationBody.replace(/\{1}/g, orderNumber);

  if (notificationType == NotificationType.MEDICINE_ORDER_READY_AT_STORE) {
    const shopAddress = JSON.parse(orderDetails.shopAddress);
    notificationBody = notificationBody.replace('{2}', shopAddress.storename);
    notificationBody = notificationBody.replace('{3}', shopAddress.phone);
  }

  console.log(notificationBody, notificationType, 'med orders');
  const payload = {
    notification: {
      title: notificationTitle,
      body: notificationBody,
      sound: ApiConstants.NOTIFICATION_DEFAULT_SOUND.toString(),
    },
    data: {
      type: payloadDataType,
      orderAutoId: orderDetails.orderAutoId.toString(),
      orderId: orderDetails.id,
      statusDate: format(new Date(), 'yyyy-MM-dd HH:mm'),
      deliveredDate: format(new Date(), 'yyyy-MM-dd HH:mm'),
      firstName: patientDetails.firstName,
      content: notificationBody,
    },
  };

  //notification options
  const options = {
    priority: NotificationPriority.high,
    timeToLive: 60 * 60 * 24, //wait for one day.. if device is offline
  };

  //send SMS notification
  sendNotificationSMS(patientDetails.mobileNumber, notificationBody);

  if (notificationType == NotificationType.MEDICINE_ORDER_OUT_FOR_DELIVERY) {
    return { status: true };
  }

  admin
    .messaging()
    .sendToDevice(patientDeviceTokens, payload, options)
    .then((response: PushNotificationSuccessMessage) => {
      const logData = {
        patientId: patientDetails.id,
        orderAutoId: orderDetails.orderAutoId,
        orderId: orderDetails.id,
        multicastId: response.multicastId,
      };
      logNotificationResponse(notificationType, logData);
    })
    .catch((error: JSON) => {
      console.log('PushNotificationFailed::' + error);
      throw new AphError(AphErrorMessages.PUSH_NOTIFICATION_FAILED);
    });

  console.log('push notifications sent');
  return { status: true };
}

//Notification - Dignostic order Status
export async function sendDiagnosticOrderStatusNotification(
  notificationType: NotificationType,
  orderDetails: DiagnosticOrders,
  patientsDb: Connection
) {
  //get all the patient device tokens
  let patientDeviceTokens: string[] = [];
  const patientDetails = orderDetails.patient;
  patientDeviceTokens = await getPatientDeviceTokens(patientDetails.mobileNumber, patientsDb);

  if (patientDeviceTokens.length == 0) return;

  let notificationTitle: string = '';
  let notificationBody: string = '';
  let payloadDataType: string = '';

  switch (notificationType) {
    case NotificationType.DIAGNOSTIC_ORDER_SUCCESS:
      payloadDataType = 'Diagnostic_Order_Success';
      notificationTitle = ApiConstants.DIAGNOSTIC_ORDER_SUCCESS_TITLE;
      notificationBody = ApiConstants.DIAGNOSTIC_ORDER_SUCCESS_BODY;
      break;
    case NotificationType.DIAGNOSTIC_ORDER_PAYMENT_FAILED:
      payloadDataType = 'Diagnostic_Order_Payment_Failed';
      notificationTitle = ApiConstants.DIAGNOSTIC_ORDER_PAYMENT_FAILED_TITLE;
      notificationBody = ApiConstants.DIAGNOSTIC_ORDER_PAYMENT_FAILED_BODY;
      break;
    default:
      payloadDataType = 'Diagnostic_Order_Success';
      notificationTitle = ApiConstants.DIAGNOSTIC_ORDER_SUCCESS_TITLE;
      notificationBody = ApiConstants.DIAGNOSTIC_ORDER_SUCCESS_BODY;
  }
  //notification payload
  const userName = patientDetails.firstName ? patientDetails.firstName : 'User';
  const orderNumber = orderDetails.displayId ? orderDetails.displayId.toString() : '';

  notificationTitle = notificationTitle.toString();
  notificationBody = notificationBody.replace('{0}', userName);

  const payload = {
    notification: {
      title: notificationTitle,
      body: notificationBody,
      sound: ApiConstants.NOTIFICATION_DEFAULT_SOUND.toString(),
    },
    data: {
      type: payloadDataType,
      displayId: orderNumber,
      orderId: orderDetails.id,
      firstName: patientDetails.firstName,
      content: notificationBody,
    },
  };

  //notification options
  const options = {
    priority: NotificationPriority.high,
    timeToLive: 60 * 60 * 24, //wait for one day.. if device is offline
  };

  sendNotificationSMS(patientDetails.mobileNumber, notificationBody);

  admin
    .messaging()
    .sendToDevice(patientDeviceTokens, payload, options)
    .then((response: PushNotificationSuccessMessage) => {
      const logData = {
        patientId: patientDetails.id,
        displayId: orderNumber,
        orderId: orderDetails.id,
        multicastId: response.multicastId,
      };
      logNotificationResponse(notificationType, logData);
    })
    .catch((error: JSON) => {
      console.log('PushNotificationFailed::' + error);
      throw new AphError(AphErrorMessages.PUSH_NOTIFICATION_FAILED);
    });

  console.log('push notifications sent');
  return { status: true };
}

export async function medicineOrderCancelled(
  orderDetails: MedicineOrders,
  reasonCode: string,
  patientsDb: Connection
) {
  let msgText: string = '';
  msgText = ApiConstants.ORDER_CANCEL_BODY;
  const medicineOrdersRepo = patientsDb.getCustomRepository(MedicineOrdersRepository);
  msgText = msgText.replace('{name}', orderDetails.patient.firstName);
  msgText = msgText.replace('{orderId}', orderDetails.orderAutoId.toString());
  const cancellationReasons = await medicineOrdersRepo.getMedicineOrderCancelReasonByCode(
    reasonCode
  );
  if (cancellationReasons) {
    msgText = msgText.replace('{reason}', cancellationReasons.displayMessage);
  } else {
    msgText = msgText.replace('{reason}', 'Your order has been cancelled');
  }
  await sendNotificationSMS(orderDetails.patient.mobileNumber, msgText);
  const paymentInfo = orderDetails.medicineOrderPayments[0] || {};
  if (paymentInfo.paymentType == MEDICINE_ORDER_PAYMENT_TYPE.CASHLESS) {
    msgText = ApiConstants.ORDER_CANCEL_PREPAID_BODY;
    msgText = msgText.replace('{orderId}', orderDetails.orderAutoId.toString());
    msgText = msgText.replace('{refund}', paymentInfo.amountPaid.toString());
    await sendNotificationSMS(orderDetails.patient.mobileNumber, msgText);
    if (paymentInfo.healthCreditsRedeemed > 0) {
      msgText = ApiConstants.ORDER_CANCEL_HC_REFUND_BODY;
      msgText = msgText.replace('{orderId}', orderDetails.orderAutoId.toString());
      msgText = msgText.replace(
        '{healthCreditsRefund}',
        paymentInfo.healthCreditsRedeemed.toString()
      );
      await sendNotificationSMS(orderDetails.patient.mobileNumber, msgText);
    }
  }
}

export async function sendChatMessageNotification(
  doctorDetails: Doctor,
  patientDetails: Patient,
  appointment: Appointment,
  doctorsDb: Connection,
  chatMessage: string
) {
  const devLink = await getPatientDeeplink(
    ApiConstants.PATIENT_CHATROOM_DEEPLINK + appointment.id.toString()
  );
  const templateData: string[] = [
    doctorDetails.salutation + ' ' + doctorDetails.firstName,
    patientDetails.firstName + ' ' + patientDetails.lastName,
    devLink,
  ];
  sendDoctorNotificationWhatsapp(
    ApiConstants.WHATSAPP_SD_CHAT_NOTIFICATION_ID,
    doctorDetails.mobileNumber,
    templateData
  );
  const messageBody = ApiConstants.CHAT_MESSGAE_TEXT.replace(
    '{0}',
    doctorDetails.firstName
  ).replace('{1}', patientDetails.firstName);
  await sendNotificationSMS(doctorDetails.mobileNumber, messageBody);
  //sendNotificationWhatsapp(doctorDetails.mobileNumber, messageBody);
  const doctorTokenRepo = doctorsDb.getCustomRepository(DoctorDeviceTokenRepository);
  const deviceTokensList = await doctorTokenRepo.getDeviceTokens(doctorDetails.id);
  //if (deviceTokensList.length == 0) return { status: true };

  const registrationToken: string[] = [];
  if (deviceTokensList.length > 0) {
    //initialize firebaseadmin

    let notificationResponse: PushNotificationSuccessMessage;

    const options = {
      priority: NotificationPriority.high,
      timeToLive: 60 * 60 * 24, //wait for one day.. if device is offline
    };
    let chatMsg = '';
    if (chatMessage) {
      chatMsg = chatMessage;
    }
    const payload = {
      notification: {
        title:
          patientDetails.firstName +
          ' sent 1 message | ' +
          format(addMilliseconds(new Date(), 19800000), 'yyyy-MM-dd HH:mm:ss'),
        body: chatMsg,
        sound: ApiConstants.NOTIFICATION_DEFAULT_SOUND.toString(),
      },
      data: {
        title:
          patientDetails.firstName +
          ' sent 1 message | ' +
          format(addMilliseconds(new Date(), 19800000), 'yyyy-MM-dd HH:mm:ss'),
        type: 'doctor_chat_message',
        appointmentId: appointment.id,
        patientName: appointment.patientName,
        body: chatMsg,
      },
    };

    deviceTokensList.forEach((values: { deviceToken: string }) => {
      registrationToken.push(values.deviceToken);
    });

    console.log(registrationToken, 'registrationToken doctor');
    admin
      .messaging()
      .sendToDevice(registrationToken, payload, options)
      .then((response: PushNotificationSuccessMessage) => {
        notificationResponse = response;
        //if (pushNotificationInput.notificationType == NotificationType.CALL_APPOINTMENT) {
        const fileName =
          process.env.NODE_ENV +
          '_doctorapptnotification_' +
          format(new Date(), 'yyyyMMdd') +
          '.txt';
        let assetsDir = path.resolve('/apollo-hospitals/packages/api/src/assets');
        if (process.env.NODE_ENV != 'local') {
          assetsDir = path.resolve(<string>process.env.ASSETS_DIRECTORY);
        }
        let content =
          format(new Date(), 'yyyy-MM-dd hh:mm') +
          '\n apptid: ' +
          appointment.id.toString() +
          '\n multicastId: ';
        content +=
          response.multicastId.toString() +
          '\n------------------------------------------------------------------------------------\n';
        fs.appendFile(assetsDir + '/' + fileName, content, (err) => {
          if (err) {
            console.log('file saving error', err);
          }
          console.log('notification results saved');
        });
        //}
        console.log(notificationResponse, 'notificationResponse');
      })
      .catch((error: JSON) => {
        console.log('PushNotification Failed::' + error);
        throw new AphError(AphErrorMessages.PUSH_NOTIFICATION_FAILED);
      });
  }
  return { status: true };
}

export async function hitCallKitCurl(
  token: string,
  doctorName: string,
  apptId: string,
  patientId: string,
  connecting: boolean,
  callType: APPT_CALL_TYPE,
  isDev: boolean
) {
  const CERT_PATH = process.env.VOIP_CALLKIT_CERT_PATH + '/voipCert.pem';
  const passphrase = process.env.VOIP_CALLKIT_PASSPHRASE || 'apollo@123';
  let domain = process.env.VOIP_CALLKIT_DOMAIN || 'https://api.push.apple.com/3/device/';
  if (isDev) {
    domain = 'https://api.development.push.apple.com/3/device/';
  }
  try {
    const curlCommand = `curl -v -d '{"name": "${doctorName}", 
      "${connecting ? 'isVideo' : 'disconnectCall'}": 
      ${connecting ? (callType == APPT_CALL_TYPE.VIDEO ? true : false) : true}, 
      "appointmentId" : "${apptId}", "patientId": "${patientId}" }' --http2 --cert ${CERT_PATH}:${passphrase} ${domain}${token}`;
    const resp = child_process.execSync(curlCommand);
    const result = resp.toString('utf-8');
    console.log('voipCallKit result > ', result);
    console.log('curlCommand > ', curlCommand);
  } catch (err) {
    console.error('voipCallKit error > ', err);
  }
}
