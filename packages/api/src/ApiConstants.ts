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
  PATIENT_HELP_SUBJECT = 'Issue raised by customer : {0} - {1}, {2}',

  PATIENT_HELP_SUPPORT_EMAILID_PRODUCTION = 'helpdesk@apollo247.com',
  PATIENT_HELP_SUPPORT_CC_EMAILID_PRODUCTION = 'Apurva_Agarwal@mckinsey.com,Vikas_Siddeshwar@mckinsey.com,prashant_sharma@apollohospitals.com,raj@popcornapps.com',

  //initiate junior doctor session
  JUNIOR_APPT_SESSION_TITLE = 'Junior doctor initiated the session',
  JUNIOR_APPT_SESSION_BODY = "Hi {0}! :) {1} from Dr. {2}'s team is waiting to start your consultation prep. Please proceed to the Consult Room",

  //initiate senior doctor session
  SENIOR_APPT_SESSION_TITLE = 'Doctor has joined the consult room',
  SENIOR_APPT_SESSION_BODY = 'Hi {0}! :) Dr. {1} is waiting to start your consultation. Please proceed to the Consult Room',

  BOOK_APPOINTMENT_SMS_MESSAGE = 'Thanks for choosing Apollo24x7, {0} :) Your appointment {1} with Dr. {2} is confirmed for {3} at {4}. Call us at 18605000101 for any questions',
  BOOK_APPOINTMENT_TITLE = 'your appointment is confirmed',

  CANCEL_APPOINTMENT_SUBJECT = 'Appointment has been cancelled',
  PHARMA_TOKEN = '9f15bdd0fcd5423190c2e877ba0228A24',

  PRISM_TIMEOUT = 10000,
  PRISM_UPLOAD_DOCUMENT_PROGRAME = 'prog2',
  PRISM_STATIC_UHID = 'AHB.0000724284',
  PRISM_STATIC_MOBILE_NUMBER = '8019677178',

  GENERAL_PHYSICIAN = 'General Physician/ Internal Medicine',

  CALL_APPOINTMENT_TITLE = 'Appointment has been started',
  CALL_APPOINTMENT_BODY = 'Hi {0}! :) Dr. {1} is waiting to start your consultation. Please proceed to the Consult Room',

  CART_READY_TITLE = 'Medicine order cart ready',
  CART_READY_BODY = 'Hi {0}, your prescription cart is ready',

  ORDER_OUT_FOR_DELIVERY_TITLE = 'Medicine order is out for delivery',
  ORDER_OUT_FOR_DELIVERY_BODY = 'Hi {0}, your medicine order is out for delivery',

  ORDER_DELIVERY_TITLE = 'Medicine order is delivered',
  ORDER_DELIVERY_BODY = 'Hi {0}, your medicine order is delivered',

  GOOGLE_MAPS_DISTANCE_MATRIX_URL = 'https://maps.googleapis.com/maps/api/distancematrix/json',

  //All services log files
  PROFILES_SERVICE_ACCESS_LOG_FILE = '/access-logs/profiles-service.log',
  PROFILES_SERVICE_ERROR_LOG_FILE = '/error-logs/profiles-service.log',
  DOCTORS_SERVICE_ACCESS_LOG_FILE = '/access-logs/doctors-service.log',
  DOCTORS_SERVICE_ERROR_LOG_FILE = '/error-logs/doctors-service.log',
  CONSULTS_SERVICE_ACCESS_LOG_FILE = '/access-logs/consults-service.log',
  CONSULTS_SERVICE_ERROR_LOG_FILE = '/error-logs/consults-service.log',
  NOTIFICATIONS_SERVICE_ACCESS_LOG_FILE = '/access-logs/notifications-service.log',
  NOTIFICATIONS_SERVICE_ERROR_LOG_FILE = '/error-logs/notifications-service.log',

  TO_MAIL = 'sriram.kanchan@popcornapps.com',
  CC_MAIL = 'raj@popcornapps.com,prasanth.babu@popcornapps.com',
  FROM_MAIL = 'info@popcornapps.com',
  APPT_MAIL_SUBJECT = 'Your appointment has been booked successfully',
  FROM_NAME = 'Admin',
  PATIENT_APPT_EMAILID = 'sriram.kanchan@popcornapps.com',
  PATIENT_APPT_CC_EMAILID = 'raj@popcornapps.com,sumeeth.kumar@popcornapps.com',
  PATIENT_APPT_EMAILID_PRODUCTION = 'helpdesk@apollo247.com',
  PATIENT_APPT_CC_EMAILID_PRODUCTION = 'bharathrao@apollopharmacy.org,Vijayendra_Singh@external.mckinsey.com,prashant_sharma@apollohospitals.com,sumeeth.kumar@popcornapps.com,sriram.kanchan@popcornapps.com,raj@popcornapps.com',

  CANCEL_APPT_TITLE = 'Your appointment has been cancelled',
  CANCEL_APPT_BODY = 'Hi {0}, we are really sorry. {1} will not be able to make it for this appointment. Any payment that you have made for this consultation would be refunded in 2-4 working days. We request you to please book appointment with any of our other Apollo certified Doctor',

  APPOINTMENT_MAX_RESCHEDULE_COUNT_PATIENT = 3,
  APPOINTMENT_MAX_RESCHEDULE_COUNT_DOCTOR = 3,

  COUNTRY_CODE = '91',

  //doctor no-photo url
  DOCTOR_DEFAULT_PHOTO_URL = 'https://prodaphstorage.blob.core.windows.net/doctors/no_photo.png',

  PHARMA_DEFAULT_SHOPID = '16001',

  //Medmantra Static data
  MEDMANTRA_GENDER = '72',
  MEDMANTRA_REGIONID = '1',
  MEDMANTRA_TITLE = '1',
  MEDMANTRA_SERVICEID = 2118,
  MEDMANTRA_REGISTRATION_TYPE = 'PaidUHID',
  MEDMANTRA_STATUSCHECK = 102,
  MEDMANTRA_MARITALSTATUS = 1,
  MEDMANTRA_LOCATIONID = 10201,
  MEDMANTRA_UPDATEDBY = 103330,
  MEDMANTRA_FLAG = 1,
  MEDMANTRA_APPOINTMENT_MODE = 'Apollo247',
  MEDMANTRA_PAYTYPE = 'NETBANKING',
}
