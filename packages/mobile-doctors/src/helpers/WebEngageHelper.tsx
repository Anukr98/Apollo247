import WebEngage from 'react-native-webengage';
import { AppConfig } from '@aph/mobile-doctors/src/helpers/AppConfig';
import { GetDoctorAppointments_getDoctorAppointments_appointmentsHistory_caseSheet } from '@aph/mobile-doctors/src/graphql/types/GetDoctorAppointments';
import { ConsultMode } from '@aph/mobile-doctors/src/graphql/types/globalTypes';

export interface WebEngageType {
  init: (autoRegister: boolean) => void;
  track: (eventName: string, attributes?: object) => void;
  screen: (name: string, data?: Object) => void;
  push: {
    onClick: (callback: (notificationData: Object, clickId: string) => void) => void;
  };
  notification: {
    onPrepare: (callback: (notificationData: Object) => void) => void;
    onShown: (callback: (notificationData: Object) => void) => void;
    onDismiss: (callback: (notificationData: Object) => void) => void;
    onClick: (callback: (notificationData: Object, clickId: string) => void) => void;
  };
  user: {
    login: (userId: string) => void;
    logout: () => void;
    setAttribute: (key: string, value: any) => void;
    deleteAttribute: (key: string) => void;
    deleteAttributes: (keys: string) => void;
    setEmail: (email: string) => void;
    setHashedEmail: (email: string) => void;
    setPhone: (phone: string) => void;
    setHashedPhone: (phone: string) => void;
    setBirthDateString: (date: string) => void;
    setGender: (gender: 'male' | 'female' | 'other') => void;
    setFirstName: (name: string) => void;
    setLastName: (name: string) => void;
    setCompany: (name: string) => void;
    setOptIn: (channel: 'push' | 'in_app' | 'email' | 'sms' | 'whatsapp', status: boolean) => void;
  };
}
const webengage: WebEngageType = new WebEngage();

export type callType = 'Telephonic' | 'Video' | 'Audio' | 'Join Acceptance';

export enum WebEngageEventName {
  MOBILE_NUMBER_ENTERED = 'Front_end - Doctor Mobile Number entered',
  NOT_REGISTERED = 'Front_end - Non Registered Number Login',
  OTP_ENTERED = 'Front_end - Doctor OTP Entered',
  OTP_VERIFIED = 'Front_end - Doctor OTP Verification',
  OTP_RESEND = 'Front_end - Doctor OTP Resend',
  DOCTOR_LOGIN = 'Front_end - Doctor Logged in',
  DOCTOR_APPOINTMENT_CLICKED = 'Front_end - Doctor Clicked on Appointment',
  DOCTOR_APPOINTMENT_FORCE_START_ACCEPT = 'Front_end - Doctor Accepted to  Force Start',
  DOCTOR_APPOINTMENT_FORCE_START_DECLINE = 'Front_end - Doctor Declined to Force start',
  DOCTOR_APPOINTMENT_UNABLETO_FORCE_START = 'Front_end - Doctor unable to Force start consult',
  DOCTOR_APPOINTMETNT_CANCELLED = 'Front_end - Doctor cancelled appointment',
  DOCTOR_APPOINTMENT_RESCHEDULED = 'Front_end - Doctor rescheduled the appointment',
  DOCTOR_START_CONSULT = 'Front_end - Doctor started the consult',
  DOCTOR_START_EXOTEL_CALL = 'Front_end - Doctor Started the Exotel call',
  DOCTOR_START_VIDEO_CALL = 'Front_end - Doctor Started the Video call',
  DOCTOR_STOP_VIDEO_CALL = 'Front_end - Doctor Stoped the Video call',
  DOCTOR_START_AUDIO_CALL = 'Front_end - Doctor Started the Audio call',
  DOCTOR_STOP_AUDIO_CALL = 'Front_end - Doctor Stoped the Audio call',
  DOCTOR_ACCEPTED_JOIN = 'Front_end - Doctor Accepted to Join the session',
  DOCTOR_ACCEPTED_JOIN_END = 'Front_end - Doctor Ended Join the session call',
  DOCTOR_STOP_CONSULT = 'Front_end - Doctor Ended the consult',
  DOCTOR_SEND_MSG = 'Front_end - Doctor Sent a message to the patient after End consult',
  DOCTOR_SEND_PRESCRIPTION = 'Front_end - Doctor Send Prescription',
  DOCTOR_RESEND_PRESCRIPTION = 'Front_end - Doctor resent Prescription',
  DOCTOR_ISSUE_NEW_PRESCRIPTION = 'Front_end - Doctor re-issued new Prescription',
  DOCTOR_CLICKED_PATIENT_LOG = 'Front_end - Doctor Clicked on the Patient Log',
  DOCTOR_CLICKED_PATIENT_LOG_CHAT = 'Front_end - Doctor Clicked on the Patient Log Chat',
  DOCTOR_CLICKED_NOTIFICATION = 'Front_end - Doctor Clicked on the Notification',
  DOCTOR_CLICKED_HELP = 'Front_end - Doctor Clicked on the help',
  DOCTOR_STARTED_TEST = 'Front_end - Doctor started test',
  DOCTOR_CLICKED_SETTINGS = 'Front_end - Doctor Clicked on the Settings',
  DOCTOR_CHANGED_CHATDAYS = 'Front_end - Doctor Changed Chat Days(Settings)',
  DOCTOR_CHANGED_IVR = 'Front_end - Doctor Changed IVR (Settings)',
  DOCTOR_CALENDAR_ERROR = 'Front_end - Doctor API-Error on Calendar',
  DOCTOR_CASESHEET_ERROR = 'Front_end - Doctor API-Error on Casesheet',
  DOCTOR_PREVIEWCASESHEET_ERROR = 'Front_end - Doctor API-Error on Prescription Preview',
  DOCTOR_OPENTOK_SESSION_EVENTS = 'Front_end - Doctor Session Event',
  DOCTOR_OPENTOK_PUBLISHER_EVENTS = 'Front_end - Doctor Publisher Event',
  DOCTOR_OPENTOK_SUBSCRIBER_EVENTS = 'Front_end - Doctor Subscriber Event',
}

export interface WebEngageEvents {
  [WebEngageEventName.MOBILE_NUMBER_ENTERED]: {
    'Doctor mobile Number': string;
  };
  [WebEngageEventName.OTP_ENTERED]: {};
  [WebEngageEventName.NOT_REGISTERED]: {
    mobileNumber: string;
  };
  [WebEngageEventName.OTP_VERIFIED]: {
    Successful: 'YES' | 'NO';
  };
  [WebEngageEventName.OTP_RESEND]: {
    'Doctor mobile Number': string;
  };
  [WebEngageEventName.DOCTOR_LOGIN]: {};
  [WebEngageEventName.DOCTOR_APPOINTMENT_CLICKED]: {
    'Doctor name': string;
    'Patient name': string;
    'Patient mobile number': string;
    'Doctor Mobile number': string;
    'Appointment Date time': string;
    'Appointment display ID': string;
    'Appointment ID': string;
  };
  [WebEngageEventName.DOCTOR_APPOINTMENT_FORCE_START_ACCEPT]: {
    'Doctor name': string;
    'Patient name': string;
    'Patient mobile number': string;
    'Doctor Mobile number': string;
    'Appointment Date time': string;
    'Appointment display ID': string;
    'Appointment ID': string;
  };
  [WebEngageEventName.DOCTOR_APPOINTMENT_FORCE_START_DECLINE]: {
    'Appointment Date time': string;
    'Appointment ID': string;
  };
  [WebEngageEventName.DOCTOR_APPOINTMENT_UNABLETO_FORCE_START]: {
    'Appointment Date time': string;
    'Appointment ID': string;
    'Jd casesheet': GetDoctorAppointments_getDoctorAppointments_appointmentsHistory_caseSheet | null;
  };
  [WebEngageEventName.DOCTOR_APPOINTMETNT_CANCELLED]: {
    'Doctor name': string;
    'Patient name': string;
    'Patient mobile number': string;
    'Doctor Mobile number': string;
    'Appointment Date time': string;
    'Appointment display ID': string;
    'Appointment ID': string;
    'Cancel reason': string;
  };
  [WebEngageEventName.DOCTOR_APPOINTMENT_RESCHEDULED]: {
    'Doctor name': string;
    'Patient name': string;
    'Patient mobile number': string;
    'Doctor Mobile number': string;
    'Appointment Date time': string;
    'Appointment display ID': string;
    'Appointment ID': string;
    'Reschedule date ': string;
    'Reschedule time': string;
    'Reschedule reason ': string;
  };
  [WebEngageEventName.DOCTOR_START_CONSULT]: {
    'Doctor name': string;
    'Patient name': string;
    'Patient mobile number': string;
    'Doctor Mobile number': string;
    'Appointment Date time': string;
    'Appointment display ID': string;
    'Appointment ID': string;
  };
  [WebEngageEventName.DOCTOR_START_EXOTEL_CALL]: {
    'Doctor name': string;
    'Patient name': string;
    'Patient mobile number': string;
    'Doctor Mobile number': string;
    'Appointment Date time': string;
    'Appointment display ID': string;
    'Appointment ID': string;
    'Type of call': 'Telephonic';
    'Exotel number': string;
  };
  [WebEngageEventName.DOCTOR_START_VIDEO_CALL]: {
    'Doctor name': string;
    'Patient name': string;
    'Patient mobile number': string;
    'Doctor Mobile number': string;
    'Appointment Date time': string;
    'Appointment display ID': string;
    'Type of call': 'Video';
    'Appointment ID': string;
  };
  [WebEngageEventName.DOCTOR_STOP_VIDEO_CALL]: {
    'Doctor name': string;
    'Patient name': string;
    'Patient mobile number': string;
    'Doctor Mobile number': string;
    'Appointment Date time': string;
    'Appointment display ID': string;
    'Appointment ID': string;
    'Type of call': 'Video';
    'Call Duration': string;
  };
  [WebEngageEventName.DOCTOR_START_AUDIO_CALL]: {
    'Doctor name': string;
    'Patient name': string;
    'Patient mobile number': string;
    'Doctor Mobile number': string;
    'Appointment Date time': string;
    'Appointment display ID': string;
    'Type of call': 'Audio';
    'Appointment ID': string;
  };
  [WebEngageEventName.DOCTOR_STOP_AUDIO_CALL]: {
    'Doctor name': string;
    'Patient name': string;
    'Patient mobile number': string;
    'Doctor Mobile number': string;
    'Appointment Date time': string;
    'Appointment display ID': string;
    'Appointment ID': string;
    'Type of call': 'Audio';
    'Call Duration': string;
  };
  [WebEngageEventName.DOCTOR_ACCEPTED_JOIN]: {
    'Doctor name': string;
    'Patient name': string;
    'Patient mobile number': string;
    'Doctor Mobile number': string;
    'Appointment Date time': string;
    'Appointment display ID': string;
    'Type of call': 'Join Acceptance';
    'Appointment ID': string;
  };
  [WebEngageEventName.DOCTOR_ACCEPTED_JOIN_END]: {
    'Doctor name': string;
    'Patient name': string;
    'Patient mobile number': string;
    'Doctor Mobile number': string;
    'Appointment Date time': string;
    'Appointment display ID': string;
    'Type of call': 'Join Acceptance';
    'Appointment ID': string;
  };
  [WebEngageEventName.DOCTOR_STOP_CONSULT]: {
    'Doctor name': string;
    'Patient name': string;
    'Patient mobile number': string;
    'Doctor Mobile number': string;
    'Appointment Date time': string;
    'Appointment display ID': string;
    'Appointment ID': string;
  };
  [WebEngageEventName.DOCTOR_SEND_MSG]: {
    'Doctor name': string;
    'Patient name': string;
    'Patient mobile number': string;
    'Doctor Mobile number': string;
    'Appointment Date time': string;
    'Appointment display ID': string;
    'Appointment ID': string;
  };
  [WebEngageEventName.DOCTOR_SEND_PRESCRIPTION]: {
    'Doctor name': string;
    'Patient name': string;
    'Patient mobile number': string;
    'Doctor Mobile number': string;
    'Appointment Date time': string;
    'Appointment display ID': string;
    'Appointment ID': string;
    'Blob URL': string;
  };
  [WebEngageEventName.DOCTOR_RESEND_PRESCRIPTION]: {
    'Doctor name': string;
    'Patient name': string;
    'Patient mobile number': string;
    'Doctor Mobile number': string;
    'Appointment Date time': string;
    'Appointment display ID': string;
    'Appointment ID': string;
    'Blob URL': string;
  };
  [WebEngageEventName.DOCTOR_ISSUE_NEW_PRESCRIPTION]: {
    'Doctor name': string;
    'Patient name': string;
    'Patient mobile number': string;
    'Doctor Mobile number': string;
    'Appointment Date time': string;
    'Appointment display ID': string;
    'Appointment ID': string;
    'Blob URL': string;
  };
  [WebEngageEventName.DOCTOR_CLICKED_PATIENT_LOG]: {
    'Doctor name': string;
    'Patient name': string;
    'Patient mobile number': string;
    'Doctor Mobile number': string;
  };
  [WebEngageEventName.DOCTOR_CLICKED_PATIENT_LOG_CHAT]: {
    'Doctor name': string;
    'Patient name': string;
    'Patient mobile number': string;
    'Doctor Mobile number': string;
    'Button Type': 'chat' | 'reply';
  };
  [WebEngageEventName.DOCTOR_CLICKED_NOTIFICATION]: {};
  [WebEngageEventName.DOCTOR_CLICKED_HELP]: {
    'Doctor name': string;
    'Doctor Mobile number': string;
  };
  [WebEngageEventName.DOCTOR_STARTED_TEST]: {
    'Doctor name': string;
    'Doctor Mobile number': string;
  };
  [WebEngageEventName.DOCTOR_CLICKED_SETTINGS]: {
    'Doctor name': string;
    'Doctor Mobile number': string;
  };
  [WebEngageEventName.DOCTOR_CHANGED_CHATDAYS]: {
    'Old Chat Days': string;
    'New Chat Days': string;
  };
  [WebEngageEventName.DOCTOR_CHANGED_IVR]: {
    'Old IVR option': 'YES' | 'NO';
    'Old Consult Type': ConsultMode | null;
    'Old Online Time': string;
    'Old In-Person Time': string;
    'New IVR option': 'YES' | 'NO';
    'New Consult Type': ConsultMode | null;
    'New Online Time': string;
    'New In-Person Time': string;
  };
  [WebEngageEventName.DOCTOR_CALENDAR_ERROR]: {
    'Selected Calendar Day': string;
    ErrorDetails: string;
  };
  [WebEngageEventName.DOCTOR_CASESHEET_ERROR]: {
    'API name': string;
    ErrorDetails: string;
    'Consultation Display ID': string;
    'Consult ID': string;
  };
  [WebEngageEventName.DOCTOR_PREVIEWCASESHEET_ERROR]: {
    'API name': string;
    ErrorDetails: string;
    'Consultation Display ID': string;
    'Consult ID': string;
  };
  [WebEngageEventName.DOCTOR_OPENTOK_SESSION_EVENTS]: {
    'Event Name': string;
    'Event Details': Object;
  };
  [WebEngageEventName.DOCTOR_OPENTOK_PUBLISHER_EVENTS]: {
    'Event Name': string;
    'Event Details': Object;
  };
  [WebEngageEventName.DOCTOR_OPENTOK_SUBSCRIBER_EVENTS]: {
    'Event Name': string;
    'Event Details': Object;
  };
}

export const postWebEngageEvent = (eventName: WebEngageEventName, attributes: Object) => {
  try {
    if (AppConfig.Configuration.ENABLE_WEBENGAGE) {
      webengage.track(eventName, attributes);
    }
  } catch (e) {}
};

export const setWebEngageData = (
  mobileNumber: string,
  firstName: string,
  lastName: string,
  email: string
) => {
  try {
    if (AppConfig.Configuration.ENABLE_WEBENGAGE) {
      webengage.user.setPhone(mobileNumber);
      webengage.user.setFirstName(firstName);
      webengage.user.setLastName(lastName);
      webengage.user.setEmail(email);
    }
  } catch (e) {}
};

export const webEngageLogin = (id?: string) => {
  try {
    if (AppConfig.Configuration.ENABLE_WEBENGAGE) {
      if (id) {
        webengage.user.login(id);
      } else {
        webengage.user.logout();
      }
    }
  } catch (e) {}
};

export const setScreenName = (screenName: string) => {
  webengage.screen(screenName);
};
