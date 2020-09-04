import { ApiConstants } from 'ApiConstants';

export enum NotificationType {
  INITIATE_RESCHEDULE = 'INITIATE_RESCHEDULE',
  INITIATE_TRANSFER = 'INITIATE_TRANSFER',
  INITIATE_JUNIOR_APPT_SESSION = 'INITIATE_JUNIOR_APPT_SESSION',
  INITIATE_SENIOR_APPT_SESSION = 'INITIATE_SENIOR_APPT_SESSION',
  BOOK_APPOINTMENT = 'BOOK_APPOINTMENT',
  CALL_APPOINTMENT = 'CALL_APPOINTMENT',
  MEDICINE_CART_READY = 'MEDICINE_CART_READY',
  MEDICINE_ORDER_PLACED = 'MEDICINE_ORDER_PLACED',
  MEDICINE_ORDER_CONFIRMED = 'MEDICINE_ORDER_CONFIRMED',
  MEDICINE_ORDER_PAYMENT_FAILED = 'MEDICINE_ORDER_PAYMENT_FAILED',
  MEDICINE_ORDER_OUT_FOR_DELIVERY = 'MEDICINE_ORDER_OUT_FOR_DELIVERY',
  MEDICINE_ORDER_OUT_FOR_DELIVERY_EXTERNAL = 'MEDICINE_ORDER_OUT_FOR_DELIVERY_EXTERNAL',
  MEDICINE_ORDER_DELIVERED = 'MEDICINE_ORDER_DELIVERED',
  MEDICINE_ORDER_PICKEDUP = 'MEDICINE_ORDER_PICKEDUP',
  MEDICINE_ORDER_READY_AT_STORE = 'MEDICINE_ORDER_READY_AT_STORE',
  DOCTOR_CANCEL_APPOINTMENT = 'DOCTOR_CANCEL_APPOINTMENT',
  PATIENT_REGISTRATION = 'PATIENT_REGISTRATION',
  APPOINTMENT_REMINDER_15 = 'APPOINTMENT_REMINDER_15',
  APPOINTMENT_CASESHEET_REMINDER_15 = 'APPOINTMENT_CASESHEET_REMINDER_15',
  PATIENT_APPOINTMENT_RESCHEDULE = 'PATIENT_APPOINTMENT_RESCHEDULE',
  DIAGNOSTIC_ORDER_SUCCESS = 'DIAGNOSTIC_ORDER_SUCCESS',
  DIAGNOSTIC_ORDER_PAYMENT_FAILED = 'DIAGNOSTIC_ORDER_PAYMENT_FAILED',
  PATIENT_CANCEL_APPOINTMENT = 'PATIENT_CANCEL_APPOINTMENT',
  PHYSICAL_APPT_60 = 'PHYSICAL_APPT_60',
  PHYSICAL_APPT_180 = 'PHYSICAL_APPT_180',
  PHYSICAL_APPT_1 = 'PHYSICAL_APPT_1',
  PATIENT_NO_SHOW = 'PATIENT_NO_SHOW',
  ACCEPT_RESCHEDULED_APPOINTMENT = 'ACCEPT_RESCHEDULED_APPOINTMENT',
  RESCHEDULE_APPOINTMENT_BY_PATIENT = 'RESCHEDULE_APPOINTMENT_BY_PATIENT',
  PRESCRIPTION_READY = 'PRESCRIPTION_READY',
  VIRTUAL_REMINDER_15 = 'VIRTUAL_REMINDER_15',
  APPOINTMENT_CASESHEET_REMINDER_15_VIRTUAL = 'APPOINTMENT_CASESHEET_REMINDER_15_VIRTUAL',
  DOCTOR_NO_SHOW_INITIATE_RESCHEDULE = 'DOCTOR_NO_SHOW_INITIATE_RESCHEDULE',
  PAYMENT_PENDING_SUCCESS = 'PAYMENT_PENDING_SUCCESS',
  PAYMENT_PENDING_FAILURE = 'PAYMENT_PENDING_FAILURE',
  APPOINTMENT_PAYMENT_REFUND = 'APPOINTMENT_PAYMENT_REFUND',
  DOCTOR_APPOINTMENT_REMINDER = 'DOCTOR_APPOINTMENT_REMINDER',
  MEDICINE_ORDER_BILL_CHANGED = 'MEDICINE_ORDER_BILL_CHANGED',
  WHATSAPP_CHAT_NOTIFICATION = 'WHATSAPP_CHAT_NOTIFICATION',
}

type PushNotificationMessage = {
  messageId: string;
};

export type PushNotificationSuccessMessage = {
  results: PushNotificationMessage[];
  canonicalRegistrationTokenCount: number;
  failureCount: number;
  successCount: number;
  multicastId: number;
};

export enum APPT_CALL_TYPE {
  AUDIO = 'AUDIO',
  VIDEO = 'VIDEO',
  CHAT = 'CHAT',
}

export enum DOCTOR_CALL_TYPE {
  SENIOR = 'SENIOR',
  JUNIOR = 'JUNIOR',
}

export enum NotificationPriority {
  high = 'high',
  normal = 'normal',
}

export const NotificationMap = {
  PATIENT_CANCEL_APPOINTMENT: {
    title: ApiConstants.PATIENT_CANCEL_APPT_TITLE,
    patient: {
      sms: {
        smsLink: process.env.SMS_LINK_BOOK_APOINTMENT,
        body: ApiConstants.PATIENT_CANCEL_APPT_BODY,
      },
    },
    doctor: {
      sms: {
        body: ApiConstants.DOCTOR_PATIENT_CANCEL_SMS,
      },
      browserNotification: true,
    },
  },
  DOCTOR_CANCEL_APPOINTMENT: {
    title: ApiConstants.CANCEL_APPT_TITLE,
    patient: {
      sms: {
        smsLink: process.env.SMS_LINK_BOOK_APOINTMENT,
        body: ApiConstants.CANCEL_APPT_BODY,
      },
    },
  },
  INITIATE_RESCHEDULE: {
    title: ApiConstants.RESCHEDULE_INITIATION_TITLE,
    patient: {
      sms: {
        smsLink: process.env.SMS_LINK_BOOK_APOINTMENT,
        body: ApiConstants.RESCHEDULE_INITIATION_BODY,
      },
    },
  },
  DOCTOR_NO_SHOW_INITIATE_RESCHEDULE: {
    title: ApiConstants.RESCHEDULE_INITIATION_TITLE,
    patient: {
      sms: {
        smsLink: process.env.SMS_LINK_BOOK_APOINTMENT,
        body: ApiConstants.RESCHEDULE_INITIATION_BODY,
      },
    },
  },
  PATIENT_NO_SHOW: {
    title: ApiConstants.PATIENT_NO_SHOW_RESCHEDULE_TITLE,
    patient: {
      sms: {
        smsLink: process.env.SMS_LINK_BOOK_APOINTMENT,
        body: ApiConstants.PATIENT_NO_SHOW_RESCHEDULE_BODY,
      },
    },
  },
  INITIATE_TRANSFER: {},
  INITIATE_JUNIOR_APPT_SESSION: {},
  INITIATE_SENIOR_APPT_SESSION: {},
  BOOK_APPOINTMENT: {},
  PAYMENT_PENDING_SUCCESS: {},
  PAYMENT_PENDING_FAILURE: {},
  CALL_APPOINTMENT: {},
  ACCEPT_RESCHEDULED_APPOINTMENT: {},
  RESCHEDULE_APPOINTMENT_BY_PATIENT: {},
  PRESCRIPTION_READY: {},
  APPOINTMENT_PAYMENT_REFUND: {},
};