export enum ApiConstants {
  //push-notification messages
  RESCHEDULE_INITIATION_TITLE = 'Appointment Reschedule Initiation',
  RESCHEDULE_INITIATION_BODY = 'Hi {0}, we’re really sorry to keep you waiting. {1} will not be able to make it for this appointment. We request you to reschedule.',

  //push-notification messages
  TRANSFER_INITIATION_TITLE = 'Appointment Transfer Initiation',
  TRANSFER_INITIATION_BODY = 'You have been referred to {0}. We request you to book an appointment.',

  APPOINTMENT_RESCHEDULE_DAYS_LIMIT = 7,
  PATIENT_INITIATE_REASON = 'initiated by patient',

  //pepipost configurations
  PEPIPOST_API_KEY = '0e396e4e9b5247d267c9a536cd154869',

  //Patient app, help form email configurations
  PATIENT_HELP_SUPPORT_EMAILID = 'sushma.voleti@popcornapps.com',
  PATIENT_HELP_SUPPORT_CC_EMAILID = 'sriram.kanchan@popcornapps.com,sumeeth.kumar@popcornapps.com',
  PATIENT_HELP_FROM_EMAILID = 'info@pepisandbox.com',
  PATIENT_HELP_FROM_NAME = 'Apollo24*7',
  PATIENT_HELP_SUBJECT = 'Patient Help Form',

  PATIENT_HELP_SUPPORT_EMAILID_PRODUCTION = 'Apurva_Agarwal@mckinsey.com',
  PATIENT_HELP_SUPPORT_CC_EMAILID_PRODUCTION = 'Vikas_Siddeshwar@mckinsey.com,prashant_sharma@apollohospitals.com,sumeeth.kumar@popcornapps.com,sushma.voleti@popcornapps.com,raj@popcornapps.com',

  //initiate junior doctor session
  JUNIOR_APPT_SESSION_TITLE = 'Junior doctor initiated the session',
  JUNIOR_APPT_SESSION_BODY = "Hi {0}! :) {1} from Dr. {2}'s team is waiting to start your consultation prep. Please proceed to the Consult Room",

  //initiate senior doctor session
  SENIOR_APPT_SESSION_TITLE = 'Doctor has joined the consult room',
  SENIOR_APPT_SESSION_BODY = 'Hi {0}! :) Dr. {1} is waiting to start your consultation. Please proceed to the Consult Room',

  BOOK_APPOINTMENT_SMS_MESSAGE = 'Thanks for choosing Apollo24x7, {0} :) Your appointment {1} with Dr. {2} is confirmed for {3} at {4}. Call us at 18605000101 for any questions',
  BOOK_APPOINTMENT_TITLE = 'your appointment is confirmed',
}
