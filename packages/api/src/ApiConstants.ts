export enum ApiConstants {
  /*** push-notification messages start here ***/

  //appointment reschedule initiated
  RESCHEDULE_INITIATION_TITLE = 'Appointment Reschedule Initiation',
  //RESCHEDULE_INITIATION_BODY = 'Hi {0}, we’re really sorry to keep you waiting. {1} will not be able to make it for this appointment. We request you to reschedule.',
  RESCHEDULE_INITIATION_BODY = 'Hi {0}! Due to an emergency, Dr. {1} had to reschedule your appointment to the next available slot. Confirm Slot',
  PATIENT_NO_SHOW_RESCHEDULE_TITLE = 'Appointment Reschedule Initiation',
  PATIENT_NO_SHOW_RESCHEDULE_BODY = 'Hi {0}, as you were unable to attend your consultation appointment on time with Dr. {1}, Please reschedule it. We request you to be on time for your rescheduled consultation.',

  //appointment transfer initiated
  TRANSFER_INITIATION_TITLE = 'Appointment Transfer Initiation',
  TRANSFER_INITIATION_BODY = 'You have been referred to {0}. We request you to book an appointment.',

  //appointment call started by doctor
  CALL_APPOINTMENT_TITLE = 'Appointment has been started',
  CALL_APPOINTMENT_BODY = "Hi {0}! :) Dr. {1}'s team doctor is waiting to start your consultation. Please proceed to the consult room",
  JUNIOR_CALL_APPOINTMENT_BODY = "Hi {0}! :) Dr. {1}'s team doctor is waiting to start your consultation. Please proceed to the consult room",
  JUNIOR_AVCALL_APPOINTMENT_BODY = "Hi {0}! :) Dr. {1}'s team doctor is waiting for your call response. Please proceed to the consult room",
  AVCALL_APPOINTMENT_BODY = 'Hi {0}! :) Dr. {1} is waiting for your call response. Please proceed to the consult room.',

  //appointment reminder 15
  APPOINTMENT_REMINDER_15_TITLE = 'Appointment reminder',
  CLICK_HERE = ' Click here to fill your details now ',
  APPOINTMENT_REMINDER_15_BODY = 'Your appointment with Dr {0} will start in {1} mins. :)',
  VIRTUAL_REMINDER_15_BODY = 'Appointment Reminder: Your appointment with Dr {0} will start in 15 mins. :) ',
  APPOINTMENT_REMINDER_1_BODY = "Hi {0}! It's time to see Dr. {1}. Hope you're online and ready for your appointment.",
  PHYSICAL_APPOINTMENT_REMINDER_15_BODY = 'Your appointment with Dr {0} will start in 3 hours at {1}. We hope to see you soon :)',
  PHYSICAL_APPOINTMENT_REMINDER_60_BODY = 'Hi {0}! Dr. {1} will see you in an hour. Please come down to {2}.',
  PHYSICAL_APPOINTMENT_REMINDER_1_BODY = "Hi {0}! It's time to see Dr. {1}. Hope you're ready for your appointment.",
  PHYSICAL_APPOINTMENT_REMINDER_DOCTOR_1_BODY = "Hi Dr. {0}! It's time to see {1}. Hope you're ready for your appointment.",

  DOCTOR_APPOINTMENT_REMINDER_15_SMS = 'Appointment Reminder: Your appointment with {0} will start in 15 mins. Please be available online and prepared, accordingly.',
  DOCTOR_APPOINTMENT_REMINDER_15_SMS_PHYSICAL = 'Appointment Reminder: Your appointment with {0} will start in 15 mins. Please be available and prepared, accordingly.',
  DOCTOR_APPOINTMENT_REMINDER_1_SMS = "Hi Dr. {0}! It's time to see {1}. Hope you're online and ready for your appointment.",

  //appointment casesheet reminder 15
  APPOINTMENT_CASESHEET_REMINDER_15_TITLE = 'Appointment reminder',
  APPOINTMENT_CASESHEET_REMINDER_15_BODY = 'Hi {0}! We noticed you have not filled in your medical details yet. This is necessary for your consultation to begin.',
  PHYSICAL_APPOINTMENT_CASESHEET_REMINDER_15_BODY = 'Hi {0}! We noticed you have not filled in your medical details yet. This is necessary for your consultation to begin.',

  //appointment casesheet reminder 15
  PATIENT_APPOINTMENT_RESCHEDULE_TITLE = 'Appointment has been rescheduled',
  PATIENT_APPOINTMENT_RESCHEDULE_BODY = 'Hi {0}!  Your appointment {1} with Dr. {2} has been rescheduled  to {3}. ',

  //appointment reschedule by patient
  DOCTOR_APPOINTMENT_RESCHEDULE_TITLE = 'Appointment has been rescheduled',
  DOCTOR_APPOINTMENT_RESCHEDULE_BODY = 'Hi Dr. {0}!  Your appointment {1} with {2} has been rescheduled  to {3}. ',
  //initiate junior doctor session
  JUNIOR_APPT_SESSION_TITLE = 'Junior doctor initiated the session',
  JUNIOR_APPT_SESSION_BODY = "Hi {0}! :) Dr. {2}'s team doctor is waiting to start your consultation prep. Please proceed to the Consult Room",

  //initiate senior doctor session
  SENIOR_APPT_SESSION_TITLE = 'Doctor has joined the consult room',
  SENIOR_APPT_SESSION_BODY = 'Hi {0}! :) Dr. {1} is waiting to start your consultation. Please proceed to the Consult Room',

  //medicine order cart ready
  CART_READY_TITLE = 'Medicine order cart ready',
  CART_READY_BODY = 'Hi {0}, your prescription cart is ready',

  //medicine order out for delivery
  ORDER_PLACED_TITLE = 'Medicine order is placed',
  ORDER_PLACED_BODY = 'Thanks for choosing Apollo24|7, {0} :) Your order {1} is placed with us successfully.',

  // medicine order out for delivery
  UPLOAD_PRESCRIPTION_TITLE = 'Upload Prescription medicine order placed ',

  //medicine order out for delivery
  ORDER_CONFIRMED_TITLE = 'Medicine order is confirmed',
  ORDER_CONFIRMED_BODY = 'Hi {0}! Your order no {1} has been verified & successfully processed. Order will be delivered {2}',

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
  PATIENT_CANCEL_APPT_BODY = 'Hi {0}! As per your request, your appointment {1} with Dr. {2} scheduled for {3} has been cancelled.',
  PATIENT_CANCEL_APPT_BODY_END = 'to book a new appointment with our top Apollo doctors.',
  DOCTOR_PATIENT_CANCEL_SMS = 'Hi Dr. {0}! Your appointment {1} with {2} scheduled for {3} has unfortunately been cancelled. Please make note.',
  //patient registration successfull
  PATIENT_REGISTRATION_TITLE = 'Welcome to Apollo24|7',
  PATIENT_REGISTRATION_BODY = "Hi {0}, Welcome to Apollo24|7. We're glad you're here! Consult online with our top Apollo doctors now!",
  PATIENT_REGISTRATION_CODE_BODY = 'Hi {0}, Welcome to Apollo24|7. Use discount code {1} and get your FREE Gift @Apollo Pharmacy retail store in Chennai and Hyderabad. Terms and Conditions Apply',

  //payment refund
  PAYMENT_REFUND_TITLE = 'Your appointment payment will be refunded',
  PAYMENT_REFUND_BODY = 'Hi there! The refund of Rs.{0} for your Consultation ID: {2}  has been initiated by Apollo 24/7 with the refund ID - {2}. Due to the lockdown, banks are taking longer than usual to process the refunds.Hence, the amount may take around 10-14 working days to reflect in your source account. However, we are working with banks to speed up the refund process. Thank you for your understanding',

  //book appointment payment success
  BOOK_APPOINTMENT_PAYMENT_SUCCESS_TITLE = 'Your appointment payment is received',
  BOOK_APPOINTMENT_PAYMENT_SUCCESS_BODY = 'Your pending payment of Rs. {0} for Appointment : {1} with Dr. {2} has been been received for {3}. Click here to fill your details before your consultation starts.',
  BOOK_APPOINTMENT_PAYMENT_SUCCESS_SMS = 'Your pending payment of Rs. {0} for Appointment : {1} with Dr. {2} has been been received for {3}. Click here {5} to fill your details before your consultation starts.',

  //book appointment payment failure
  BOOK_APPOINTMENT_PAYMENT_FAILURE_TITLE = 'Your appointment payment is failed',
  BOOK_APPOINTMENT_PAYMENT_FAILURE_BODY = "Your pending payment of Rs.{0} for Appointment: {1} with Dr. {2} has failed. Your amount will be refunded in 7-10 working days as per your bank's policy. Click here to book appointment again.",
  BOOK_APPOINTMENT_PAYMENT_FAILURE_SMS = "Your pending payment of Rs.{0} for Appointment: {1} with Dr. {2} has failed. Your amount will be refunded in 7-10 working days as per your bank's policy. Click here {5} to book appointment again.",

  //book appointment sucessfull
  BOOK_APPOINTMENT_TITLE = 'Your appointment is confirmed',
  BOOK_APPOINTMENT_BODY = 'Thanks for choosing Apollo24|7, {0} :) Your appointment {1} with Dr. {2} is confirmed for {3}. Click here to fill your details before your consultation starts. This will take hardly 10 minutes and will help our doctor to assist you better.',
  BOOK_APPOINTMENT_BODY_WITH_CLICK = 'Thanks for choosing Apollo24|7, {0} :) Your appointment {1} with Dr. {2} is confirmed for {3}. Click here {5} to fill your details before your consultation starts. This will take hardly 10 minutes and will help our doctor to assist you better.',
  //physical book appointment sucessfull
  PHYSICAL_BOOK_APPOINTMENT_BODY_WITH_CLICK = 'Thanks for choosing Apollo24|7, {0} :) Your appointment {1} with Dr. {2} is confirmed for {3} at {4}. Click here {5} to fill your details before your consultation starts. This will take hardly 10 minutes and will help our doctor to assist you better. You may be required to pay additional fees for registration at Hospital for Visit Clinic appointments.',
  PHYSICAL_BOOK_APPOINTMENT_BODY = 'Thanks for choosing Apollo24|7, {0} :) Your appointment {1} with Dr. {2} is confirmed for {3} at {4}. Click here to fill your details before your consultation starts. This will take hardly 10 minutes and will help our doctor to assist you better.',
  DOCTOR_BOOK_APPOINTMENT_SMS = 'Hi Dr. {0}! You have a new appointment {1} with {2} scheduled for {3}.',
  DIAGNOSTIC_ORDER_SUCCESS_TITLE = 'Diagnostic test is booked',
  DIAGNOSTIC_ORDER_SUCCESS_BODY = "Congratulations {0}! We've booked your test successfully.",

  DIAGNOSTIC_ORDER_PAYMENT_FAILED_TITLE = 'Diagnostic test payment failed',
  DIAGNOSTIC_ORDER_PAYMENT_FAILED_BODY = "Hi {0}! We're sorry. :(  There's been a problem with your order. If money was debited from your account, it will be refunded automatically in 5-7 working days.",
  MEDICINE_ORDER_PAYMENT_FAILED_TITLE = 'Medicine order payment failed',
  MEDICINE_ORDER_PAYMENT_FAILED_BODY = "Hi {0}! We're sorry. :(  There's been a problem with your order. If money was debited from your account, it will be refunded automatically in 5-7 working days.",
  SENT_BY_API = 'SENT_BY_API',
  //case sheet submitted
  CASESHEET_SUBMITTED_BODY = 'Hi Dr. {0}! Dr. {1} from your team has prepared and shared the case sheet with you.',
  DAILY_APPOINTMENT_SUMMARY = 'Hi Dr. {0}! Good morning. You have {1} appointment(s) booked for today on Apollo24|7. Summary of appointments',
  ONLINE_APPOINTMENTS = ' \nOnline Appointments : {0}',
  PHYSICAL_APPOINTMENTS = ' \nPhysical Appointments : {0}',
  FOLLOWUP_NOTIFITICATION_TEXT = 'Hi {0}! Hope you are feeling better after your consultation with Dr. {1} :) You can book a free follow up with us till {2}.',
  CHAT_MESSGAE_TEXT = 'Hi Dr. {0}! Your patient {1} has sent you a chat message. ',
  DAILY_APPOINTMENT_SUMMARY_RESPONSE = 'Daily Appointment summaries have been sent to {0} Doctor(s) successfully',
  FOLLOW_UP_NOTIFICATION_RESPONSE = 'Follow up notifications sent to {0} patients successfully',
  PRESCRIPTION_READY_TITLE = 'Prescription ready',
  PRESCRIPTION_READY_BODY = 'Hi {0}! Your prescription from consultation with Doctor {1} for appointment {2} on {3} is ready :) ',

  REFERRAL_CODE_TEXT = 'Hi {0}, Use code "WELCOME" to avail discount up to Rs. 999  on the 1st Apollo Doctor consult on your Apollo 24|7 app. Click to learn https://youtu.be/gwIRbcO3hpk',
  REFERRAL_CODE_TEXT_WITH_COUPON = 'Hi {0}, Use code "{1}" to avail discount up to Rs. 299  on the 1st Apollo Doctor consult on your Apollo 24|7 app. Click to learn https://youtu.be/XF7MWPebtkw',

  /*** push-notification messages end here ***/

  APPOINTMENT_RESCHEDULE_DAYS_LIMIT = 7,
  PATIENT_INITIATE_REASON = 'initiated by patient',
  PATIENT_NOSHOW_REASON = 'Patient did not initiate the appointment, no casesheet',

  //pepipost configurations
  PEPIPOST_API_KEY = '0e396e4e9b5247d267c9a536cd154869',

  //medicine COD email configuration starts
  MEDICINE_SUPPORT_EMAILID = 'sushma.voleti@popcornapps.com',
  MEDICINE_SUPPORT_CC_EMAILID = 'sumeeth.kumar@popcornapps.com,',
  MEDICINE_SUPPORT_EMAILID_PRODUCTION = 'hd.chennai@apollopharmacy.org',
  MEDICINE_SUPPORT_CC_EMAILID_PRODUCTION = '',
  //medicine COD email configuration ends

  //Patient app, help form email configurations
  PATIENT_HELP_SUPPORT_EMAILID = 'sushma.voleti@popcornapps.com',
  PATIENT_HELP_SUPPORT_CC_EMAILID = 'sriram.kanchan@popcornapps.com',
  PATIENT_HELP_FROM_EMAILID = 'info@apollo247.com', // 'info@pepisandbox.com',
  PATIENT_HELP_FROM_NAME = 'Apollo24*7',
  PATIENT_HELP_SUBJECT = 'Issue raised by customer : {0} - {1}, {2}',

  APPOINTMENT_PAYMENT_SUBJECT = 'New Appointment for: {0} Hosp Doctor - {1}  {2} hrs, Dr.{3} :{4}',

  PATIENT_HELP_SUPPORT_EMAILID_PRODUCTION = 'helpdesk@apollo247.com',
  PATIENT_HELP_SUPPORT_CC_EMAILID_PRODUCTION = 'raj@popcornapps.com',

  BOOK_APPOINTMENT_SMS_MESSAGE = 'Thanks for choosing Apollo24|7, {0} :) Your appointment {1} with Dr. {2} is confirmed for {3} at {4}. Call us at 18605000101 for any questions',

  CANCEL_APPOINTMENT_SUBJECT = 'Appointment has been cancelled',
  CANCEL_APPOINTMENT_BODY = 'Appointment booked on Apollo 24|7 has been cancelled.',
  PHARMA_TOKEN = '9f15bdd0fcd5423190c2e877ba0228A24',

  PRISM_TIMEOUT = 10000,
  PRISM_UPLOAD_DOCUMENT_PROGRAME = 'prog2',
  PRISM_STATIC_UHID = 'AHB.0000724284',
  PRISM_STATIC_MOBILE_NUMBER = '8019677178',

  GENERAL_PHYSICIAN = 'General Physician/ Internal Medicine',
  MAX_DOCTOR_AVAILABILITY_CHECK_DAYS = 2,

  GOOGLE_MAPS_DISTANCE_MATRIX_URL = 'https://maps.googleapis.com/maps/api/distancematrix/json',

  //All services log files
  PROFILES_SERVICE_ACCESS_LOG_FILE = '/access-logs/profiles-service.log',
  PROFILES_SERVICE_ERROR_LOG_FILE = '/error-logs/profiles-service.log',
  DOCTORS_SERVICE_ACCESS_LOG_FILE = '/access-logs/doctors-service.log',
  DOCTORS_SERVICE_ERROR_LOG_FILE = '/error-logs/doctors-service.log',
  CONSULTS_SERVICE_ACCESS_LOG_FILE = '/access-logs/consults-service.log',
  CONSULTS_SERVICE_ERROR_LOG_FILE = '/error-logs/consults-service.log',
  COUPONS_SERVICE_ACCESS_LOG_FILE = '/access-logs/coupons-service.log',
  COUPONS_SERVICE_ERROR_LOG_FILE = '/error-logs/coupons-service.log',
  API_GATEWAY_ACCESS_LOG_FILE = '/access-logs/api-gateway.log',
  API_GATEWAY_ERROR_LOG_FILE = '/error-logs/api-gateway.log',

  NOTIFICATIONS_SERVICE_ACCESS_LOG_FILE = '/access-logs/notifications-service.log',
  NOTIFICATIONS_SERVICE_ERROR_LOG_FILE = '/error-logs/notifications-service.log',
  KALEYRA_OPT_API_LOG_FILE = '/kaleyra-logs/sms-response.log',
  DOCTORS_SEARCH_API_LOG_FILE = '/debug-logs/doctors-search.log',
  OTP_VERIFICATION_API_LOG_FILE = '/debug-logs/otp-verification.log',
  GET_CURRENT_PATIENTS_API_LOG_FILE = '/debug-logs/get-current-patients.log',

  TO_MAIL = 'sriram.kanchan@popcornapps.com',
  CC_MAIL = 'raj@popcornapps.com',
  FROM_MAIL = 'info@popcornapps.com',
  APPT_MAIL_SUBJECT = 'Your appointment has been booked successfully',
  FROM_NAME = 'Admin',
  PATIENT_APPT_EMAILID = 'sriram.kanchan@popcornapps.com',
  PATIENT_APPT_CC_EMAILID = 'raj@popcornapps.com',
  PATIENT_APPT_CC_EMAILID_TRIGGER = 'raj@popcornapps.com',
  PATIENT_APPT_EMAILID_PRODUCTION = 'helpdesk@apollo247.com',
  PATIENT_APPT_CC_EMAILID_PRODUCTION = 'sriram.kanchan@popcornapps.com',

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
  INVALID_RESEND_MESSAGE = 'Invalid resend details',

  NOTIFICATION_DEFAULT_SOUND = 'default',

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

  OPENTOK_URL = 'https://apolloaudiovideosprod.blob.core.windows.net/audiovideos/46422952/{1}/archive.mp4?sv=2018-03-28&ss=bfqt&srt=sco&sp=rl&st=2019-12-24T10%3A52%3A03Z&se=2020-01-28T10%3A52%3A00Z&sig=QrKoK7bAHTMzz3lLyxDRVcQXauhM9ySvgQDJHeLhmFc%3D',

  CONVERT_VIDEO_MSG = '^^convert`video^^',
  CONVERT_AUDIO_MSG = '^^convert`audio^^',
  VIDEO_CALL_MSG = '^^callme`video^^',
  AUDIO_CALL_MSG = '^^callme`audio^^',
  STOP_CALL_MSG = '^^callme`stop^^',
  ACCEPT_CALL_MSG = '^^callme`accept^^',
  START_CONSULT = '^^#startconsult',
  START_CONSULT_JR = '^^#startconsultJr',
  STOP_CONSULT = '^^#stopconsult',
  TRANSFER_CONSULT = '^^#transferconsult',
  RESCHEDULE_CONSULT = '^^#rescheduleconsult',
  FOLLOW_UP_CONSULT = '^^#followupconsult',
  ASSETS_DIR = '/apollo-hospitals/packages/api/src/assets',
  LOCAL = 'local',
  CHAT_TRANSCRIPTS_PATH = '/chat_transcripts',
  JUNIOR_DOC_TXT = 'Junior doctor: ',
  SENIOR_DOC_TXT = 'Senior doctor: ',
  PATIENT_TXT = 'Patient: ',
  PINCODE_API_RESPONSE = 'Pincode Insertion Completed :)',

  SAMPLE_DATE = '2020-01-20T',
  SAMPLE_DATE_MORNING_START = '2020-01-20T08:00:00',
  SAMPLE_DATE_MORNING_END = '2020-01-20T12:00:00',
  SAMPLE_DATE_AFTERNOON_START = '2020-01-20T12:00:01',
  SAMPLE_DATE_AFTERNOON_END = '2020-01-20T15:00:00',
  SAMPLE_DATE_EVENING_START = '2020-01-20T15:00:01',
  SAMPLE_DATE_EVENING_END = '2020-01-20T18:00:00',
  SAMPLE_DATE_NIGHT_START = '2020-01-20T18:00:01',
  SAMPLE_DATE_NIGHT_END = '2020-01-20T22:00:00',

  //coupon related constants
  INVALID_COUPON = 'Sorry, invalid coupon code.',
  EARLY_COUPON = 'Sorry, offer has not started.',
  COUPON_EXPIRED = 'Sorry, offer has expired.',
  COUPON_COUNT_PER_CUSTOMER_EXCEEDED = 'Sorry, this code has already been used under this campaign.',
  COUPON_COUNT_USAGE_EXPIRED = 'Sorry, the limit for this coupon code has exceeded.',
  COUPON_RESTRICTED_TO_SKU_OR_CATEGORY = 'Product(s) in cart are not applicable for this coupon.',
  COUPON_FOR_FIRST_CUSTOMER_ONLY = 'This coupon is applicable for first time ordering customers only',
  COUPON_WITH_BU_RESTRICTION = 'This coupon is applicable for {0} only',
  LOWER_CART_LIMIT = 'Coupon applicable for Minimum order value Rs.{0} or more',
  UPPER_CART_LIMIT = 'Coupon applicable for Maximum order value Rs.{0} or less',

  DOCTOR_SEARCH_DEFAULT_CITY1 = 'Hyderabad',
  DOCTOR_SEARCH_DEFAULT_CITY2 = 'Chennai',

  AUTO_SUBMIT_JD_CASESHEET_RESPONSE = 'Checked all the appointments scheduled after 10 minutes',
  VIRTUAL_JD_NOTES_UNASSIGNED = 'The patient did not complete the self-assessment form. Hence empty case has been submitted',
  VIRTUAL_JD_NOTES_ASSIGNED = 'As the JD did not have enough time to submit the case, an empty case has been submitted',
  ALLOWED_DOSAGES = 'ML,MG,GM,TABLET,PUFF,UNIT,SPRAY,PATCH,AS_PRESCRIBED,CAPSULE,DROP',
  NO_JD_AVAILABLE_TEXT = 'Patient Medical details could not be collected by the JD',
  APPOINTMENT_BOOKED_WITHIN_10_MIN = 'As patient booked within {0} minutes of the appointment time, case sheet has been submitted without any details.',
  MEDICINE_TIMINGS = '(morning, noon, evening & night)',
  FREE_CHAT_DAYS = 7,
  DOCTOR_CHAT_SMS_TEXT = 'Hi {0}, you have pending chat messages from {1} patient(s). Please login to your doctor portal to reply.',
  DOCTOR_CHAT_SMS_LAST_DAY = 'Hi {0}, you have pending chat messages from {1} patient(s). Please login to your doctor portal to reply. Please note that for {2} patient(s), today is the last day to reply.',
  CASESHEET_PROVISIONAL_HEADING = 'Diagnosis',
  AUTO_SUBMIT_CASESHEET_TIME_APPOINMENT = 10,
  AUTO_SUBMIT_CASESHEET_TIME = 10,
  STAT_LOWECASE = 'stat',
  STAT_UPPERCASE = 'STAT(Immediately)',
}
