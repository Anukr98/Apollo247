export enum ApiConstants {
  /*** push-notification messages start here ***/

  //appointment reschedule initiated
  RESCHEDULE_INITIATION_TITLE = 'Appointment Reschedule Initiation',
  RESCHEDULE_INITIATION_BODY = 'Hi {0}, we’re really sorry to keep you waiting. {1} will not be able to make it for this appointment. We request you to reschedule.',

  //appointment transfer initiated
  TRANSFER_INITIATION_TITLE = 'Appointment Transfer Initiation',
  TRANSFER_INITIATION_BODY = 'You have been referred to {0}. We request you to book an appointment.',

  //appointment call started by doctor
  CALL_APPOINTMENT_TITLE = 'Appointment has been started',
  CALL_APPOINTMENT_BODY = 'Hi {0}! :) Dr. {1} is waiting to start your consultation. Please proceed to the Consult Room',

  //appointment reminder 15
  APPOINTMENT_REMINDER_15_TITLE = 'Appointment reminder',
  APPOINTMENT_REMINDER_15_BODY = 'Your appointment with Dr {0} will start in 15 mins. :)',
  PHYSICAL_APPOINTMENT_REMINDER_15_BODY = ' Your appointment with Dr {0} will start in 3 hours at {1}. We hope to see you soon :)',
  PHYSICAL_APPOINTMENT_REMINDER_60_BODY = 'Hi {0}! Dr. {1} will see you in an hour. Please come down to {2}.',
  PHYSICAL_APPOINTMENT_REMINDER_1_BODY = "Hi {0}! It's time to see Dr. {1}. Hope you're ready for your appointment.",

  //appointment casesheet reminder 15
  APPOINTMENT_CASESHEET_REMINDER_15_TITLE = 'Appointment reminder',
  APPOINTMENT_CASESHEET_REMINDER_15_BODY = 'Hi {0}! We noticed you have not filled in your medical details yet. This is necessary for your consultation to begin. Click here to fill your details now',
  PHYSICAL_APPOINTMENT_CASESHEET_REMINDER_15_BODY = 'Hi {0}! We noticed you have not filled in your medical details yet. This is necessary for your consultation to begin. Click here to fill your details now',

  //appointment casesheet reminder 15
  PATIENT_APPOINTMENT_RESCHEDULE_TITLE = 'Appointment has been rescheduled',
  PATIENT_APPOINTMENT_RESCHEDULE_BODY = 'Hi {0}!  Your appointment {1} with Dr. {2} has been rescheduled  to {3}. ',

  //initiate junior doctor session
  JUNIOR_APPT_SESSION_TITLE = 'Junior doctor initiated the session',
  JUNIOR_APPT_SESSION_BODY = "Hi {0}! :) {1} from Dr. {2}'s team is waiting to start your consultation prep. Please proceed to the Consult Room",

  //initiate senior doctor session
  SENIOR_APPT_SESSION_TITLE = 'Doctor has joined the consult room',
  SENIOR_APPT_SESSION_BODY = 'Hi {0}! :) Dr. {1} is waiting to start your consultation. Please proceed to the Consult Room',

  //medicine order cart ready
  CART_READY_TITLE = 'Medicine order cart ready',
  CART_READY_BODY = 'Hi {0}, your prescription cart is ready',

  //medicine order out for delivery
  ORDER_PLACED_TITLE = 'Medicine order is placed',
  ORDER_PLACED_BODY = 'Thanks for choosing Apollo24X7, {0} :) Your order {1} is placed with us successfully.View Order Details',

  //medicine order out for delivery
  ORDER_CONFIRMED_TITLE = 'Medicine order is confirmed',
  ORDER_CONFIRMED_BODY = 'Hi {0}! Your order no {1} has been verfied & successfully processed. Order will be delivered in {2} hours',

  //medicine order out for delivery
  ORDER_OUT_FOR_DELIVERY_TITLE = 'Medicine order is out for delivery',
  ORDER_OUT_FOR_DELIVERY_BODY = 'Hi {0}! Your order {1} is out for delivery. Our executive will be there soon :)',

  //medicine order delivered
  ORDER_DELIVERY_TITLE = 'Medicine order is delivered',
  ORDER_DELIVERY_BODY = 'Hi {0}! Your order {1} has been delivered successfully',

  //appointment cancellation
  CANCEL_APPT_TITLE = 'Your appointment has been cancelled',
  CANCEL_APPT_BODY = 'Hi {0}, we are really sorry. {1} will not be able to make it for this appointment. Any payment that you have made for this consultation would be refunded in 2-4 working days. We request you to please book appointment with any of our other Apollo certified Doctor',

  PATIENT_CANCEL_APPT_TITLE = 'Your appointment has been cancelled',
  PATIENT_CANCEL_APPT_BODY = 'Hi {0}! As per your request, your appointment {1} with Dr. {2} scheduled for {3} has been cancelled. Click here to book a new appointment with our top Apollo doctors.',

  //patient registration successfull
  PATIENT_REGISTRATION_TITLE = 'Welcome to Apollo24X7',
  PATIENT_REGISTRATION_BODY = "Hi {0}, Welcome to Apollo24X7. We're glad you're here! Consult online with our top Apollo doctors now!",

  //book appointment sucessfull
  BOOK_APPOINTMENT_TITLE = 'Your appointment is confirmed',
  BOOK_APPOINTMENT_BODY = 'Thanks for choosing Apollo24X7, {0} :) Your appointment {1} with Dr. {2} is confirmed for {3}. Click here to fill your details before your consultation starts. This will take hardly 10 minutes and will help our doctor to assist you better.',

  //physical book appointment sucessfull
  PHYSICAL_BOOK_APPOINTMENT_BODY = 'Thanks for choosing Apollo24X7, {0} :) Your appointment {1} with Dr. {2} is confirmed for {3} at {4}. Click here to fill your details before your consultation starts. This will take hardly 10 minutes and will help our doctor to assist you better.',

  DIAGNOSTIC_ORDER_SUCCESS_TITLE = 'Diagnostic test is booked',
  DIAGNOSTIC_ORDER_SUCCESS_BODY = "Congratulations {0}! We've booked your test successfully.",

  DIAGNOSTIC_ORDER_PAYMENT_FAILED_TITLE = 'Diagnostic test payment failed',
  DIAGNOSTIC_ORDER_PAYMENT_FAILED_BODY = "Hi {0}! We're sorry. :(  There's been a problem with your order. If money was debited from your account, it will be refunded automatically in 5-7 working days. Click here to book again",
  /*** push-notification messages end here ***/

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

  BOOK_APPOINTMENT_SMS_MESSAGE = 'Thanks for choosing Apollo24x7, {0} :) Your appointment {1} with Dr. {2} is confirmed for {3} at {4}. Call us at 18605000101 for any questions',

  CANCEL_APPOINTMENT_SUBJECT = 'Appointment has been cancelled',
  PHARMA_TOKEN = '9f15bdd0fcd5423190c2e877ba0228A24',

  PRISM_TIMEOUT = 10000,
  PRISM_UPLOAD_DOCUMENT_PROGRAME = 'prog2',
  PRISM_STATIC_UHID = 'AHB.0000724284',
  PRISM_STATIC_MOBILE_NUMBER = '8019677178',

  GENERAL_PHYSICIAN = 'General Physician/ Internal Medicine',
  MAX_DOCTOR_AVAILABILITY_CHECK_DAYS = 7,

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
  KALEYRA_OPT_API_LOG_FILE = '/kaleyra-logs/sms-response.log',
  DOCTORS_SEARCH_API_LOG_FILE = '/debug-logs/doctors-search.log',

  TO_MAIL = 'sriram.kanchan@popcornapps.com',
  CC_MAIL = 'raj@popcornapps.com,prasanth.babu@popcornapps.com',
  FROM_MAIL = 'info@popcornapps.com',
  APPT_MAIL_SUBJECT = 'Your appointment has been booked successfully',
  FROM_NAME = 'Admin',
  PATIENT_APPT_EMAILID = 'sriram.kanchan@popcornapps.com',
  PATIENT_APPT_CC_EMAILID = 'raj@popcornapps.com,sumeeth.kumar@popcornapps.com',
  PATIENT_APPT_EMAILID_PRODUCTION = 'helpdesk@apollo247.com',
  PATIENT_APPT_CC_EMAILID_PRODUCTION = 'bharathrao@apollopharmacy.org,Vijayendra_Singh@external.mckinsey.com,prashant_sharma@apollohospitals.com,sumeeth.kumar@popcornapps.com,sriram.kanchan@popcornapps.com,raj@popcornapps.com',

  APPOINTMENT_MAX_RESCHEDULE_COUNT_PATIENT = 3,
  APPOINTMENT_MAX_RESCHEDULE_COUNT_DOCTOR = 3,

  COUNTRY_CODE = '91',

  //doctor no-photo url
  DOCTOR_DEFAULT_PHOTO_URL = 'https://prodaphstorage.blob.core.windows.net/doctors/no_photo.png',

  PHARMA_DEFAULT_SHOPID = '16001',

  OTP_EXPIRATION_MINUTES = 2,
  OTP_MESSAGE_TEXT = 'Dear Apollo Customer, Your one time password is {0} and is valid for {1} mins.',
  KALEYRA_OTP_SENDER = 'APOLLO',
  KALEYRA_OTP_SMS_METHOD = 'sms',
  OTP_SUCCESS_MESSAGE = 'OTP sent to the mobile number successfully',
  OTP_FAIL_MESSAGE = 'OTP sending failed',

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
