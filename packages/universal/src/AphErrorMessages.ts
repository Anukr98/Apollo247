export enum AphErrorMessages {
  DOCTOR_SLOT_BLOCKED = 'DOCTOR_SLOT_BLOCKED',
  BLOCKED_CALENDAR_ITEM_OVERLAPS = 'BLOCKED_CALENDAR_ITEM_OVERLAPS',
  APPOINTMENT_ALREADY_IN_CONSULT_QUEUE = 'APPOINTMENT_ALREADY_IN_CONSULT_QUEUE',
  NO_ONLINE_DOCTORS = 'NO_ONLINE_DOCTORS',
  NO_CURRENT_USER = 'NO_CURRENT_USER',
  FIREBASE_AUTH_TOKEN_ERROR = 'FIREBASE_AUTH_TOKEN_ERROR',
  FIREBASE_GET_USER_ERROR = 'FIREBASE_GET_USER_ERROR',
  PRISM_AUTH_TOKEN_ERROR = 'PRISM_AUTH_TOKEN_ERROR',
  PRISM_GET_USERS_ERROR = 'PRISM_GET_USERS_ERROR',
  PRISM_CREATE_ATHS_TOKEN_ERROR = 'PRISM_CREATE_ATHS_TOKEN_ERROR',
  PRISM_CREATE_UHID_ERROR = 'PRISM_CREATE_UHID_ERROR',
  UPDATE_PROFILE_ERROR = 'UPDATE_PROFILE_ERROR',
  CREATE_APPOINTMENT_ERROR = 'CREATE_APPOINTMENT_ERROR',
  UPDATE_APPOINTMENT_ERROR = 'UPDATE_APPOINTMENT_ERROR',
  ADD_APPOINTMENT_PAYMENT_ERROR = 'ADD_APPOINTMENT_PAYMENT_ERROR',
  GET_APPOINTMENT_ERROR = 'GET_APPOINTMENT_ERROR',
  GET_CASESHEET_ERROR = 'GET_CASESHEET_ERROR',
  CREATE_CASESHEET_ERROR = 'CREATE_CASESHEET_ERROR',
  UPDATE_CASESHEET_ERROR = 'UPDATE_CASESHEET_ERROR',
  INVALID_ENTITY = 'INVALID_ENTITY',
  GET_SPECIALTIES_ERROR = 'GET_SPECIALTIES_ERROR',
  SAVE_SPECIALTIES_ERROR = 'SAVE_SPECIALTIES_ERROR',
  GET_FACILITIES_ERROR = 'GET_FACILITIES_ERROR',
  SAVE_FACILITIES_ERROR = 'SAVE_FACILITIES_ERROR',
  GET_PROFILE_ERROR = 'GET_PROFILE_ERROR',
  INSUFFICIENT_PRIVILEGES = 'INSUFFICIENT_PRIVILEGES',
  ALREADY_ACTIVE_IN_STARTEAM = 'ALREADY_ACTIVE_IN_STARTEAM',
  UNAUTHORIZED = 'UNAUTHORIZED',
  GET_DOCTORS_ERROR = 'GET_DOCTORS_ERROR',
  SAVE_DOCTORS_ERROR = 'SAVE_DOCTORS_ERROR',
  SEARCH_DOCTOR_ERROR = 'SEARCH_DOCTOR_ERROR',
  FILTER_DOCTORS_ERROR = 'FILTER_DOCTORS_ERROR',
  NO_CHANGE_IN_DELEGATE_NUMBER = 'NO_CHANGE_IN_DELEGATE_NUMBER',
  APPOINTMENT_BOOK_DATE_ERROR = 'APPOINTMENT_BOOK_DATE_ERROR',
  APPOINTMENT_EXIST_ERROR = 'APPOINTMENT_EXIST_ERROR',
  INVALID_DOCTOR_ID = 'INVALID_DOCTOR_ID',
  INVALID_PATIENT_ID = 'INVALID_PATIENT_ID',
  INVALID_FACILITY_ID = 'INVALID_FACILITY_ID',
  INVALID_SPECIALTY_ID = 'INVALID_SPECIALTY_ID',
  INVALID_CASESHEET_ID = 'INVALID_CASESHEET_ID',
  NO_CASESHEET_EXIST = 'NO_CASESHEET_EXIST',
  INVALID_APPOINTMENT_ID = 'INVALID_APPOINTMENT_ID',
  INVALID_DATE_FORMAT = 'INVALID_DATE_FORMAT',
  SAVE_SEARCH_ERROR = 'SAVE_SEARCH_ERROR',
  GET_COUPONS_ERROR = 'GET_COUPONS_ERROR',
  GET_PAST_SEARCHES_ERROR = 'GET_PAST_SEARCHES_ERROR',
  SAVE_PATIENT_ADDRESS_ERROR = 'SAVE_PATIENT_ADDRESS_ERROR',
  SAVE_PATIENT_DEVICE_TOKEN_ERROR = 'SAVE_PATIENT_DEVICE_TOKEN_ERROR',
  SAVE_MEDICINE_ORDER_ERROR = 'SAVE_MEDICINE_ORDER_ERROR',
  GET_MEDICINE_ORDERS_ERROR = 'GET_MEDICINE_ORDERS_ERROR',
  CANCEL_MEDICINE_ORDER_ERROR = 'CANCEL_MEDICINE_ORDER_ERROR',
  INVALID_PATIENT_DETAILS = 'INVALID_PATIENT_DETAILS',
  SAVE_DOCTOR_DEVICE_TOKEN_ERROR = 'SAVE_DOCTOR_DEVICE_TOKEN_ERROR',
  GET_NOTIFICATION_SETTINGS_ERROR = 'GET_NOTIFICATION_SETTINGS_ERROR',
  SAVE_NOTIFICATION_SETTINGS_ERROR = 'SAVE_NOTIFICATION_SETTINGS_ERROR',
  SAVE_MEDICAL_RECORD_ERROR = 'SAVE_MEDICAL_RECORD_ERROR',
  SAVE_MEDICAL_RECORD_PARAMETERS_ERROR = 'SAVE_MEDICAL_RECORD_PARAMETERS_ERROR',
  GET_MEDICAL_RECORDS_ERROR = 'GET_MEDICAL_RECORDS_ERROR',
  INVALID_MEDICAL_RECORD_ID = 'INVALID_MEDICAL_RECORD_ID',
  DELETE_MEDICAL_RECORD_ERROR = 'DELETE_MEDICAL_RECORD_ERROR',
  DELETE_MEDICAL_RECORD_PARAMETERS_ERROR = 'DELETE_MEDICAL_RECORD_PARAMETERS_ERROR',
  CART_EMPTY_ERROR = 'CART_EMPTY_ERROR',
  INVALID_OPENTOK_KEYS = 'INVALID_OPENTOK_KEYS',
  INVALID_MEDICINE_ORDER_ID = 'INVALID_MEDICINE_ORDER_ID',
  TRANSFER_APPOINTMENT_EXIST_ERROR = 'TRANSFER_APPOINTMENT_EXIST_ERROR',
  TRANSFER_APPOINTMENT_ERROR = 'TRANSFER_APPOINTMENT_ERROR',
  RESCHEDULE_APPOINTMENT_ERROR = 'RESCHEDULE_APPOINTMENT_ERROR',
  INVALID_PATIENT_ADDRESS_ID = 'INVALID_PATIENT_ADDRESS_ID',
  CANCEL_APPOINTMENT_ERROR = 'CANCEL_APPOINTMENT_ERROR',
  INVALID_PARENT_APPOINTMENT_ID = 'INVALID_PARENT_APPOINTMENT_ID',
  PUSH_NOTIFICATION_FAILED = 'PUSH_NOTIFICATION_FAILED',
  SOMETHING_WENT_WRONG = 'SOMETHING_WENT_WRONG',
  FILE_SAVE_ERROR = 'FILE_SAVE_ERROR',
  OUT_OF_CONSULT_HOURS = 'OUT_OF_CONSULT_HOURS',
  GET_CONSULT_HOURS_ERROR = 'GET_CONSULT_HOURS_ERROR',
  SAVE_CONSULT_HOURS_ERROR = 'SAVE_CONSULT_HOURS_ERROR',
  SAVE_DOCTOR_AND_HOSPITAL_ERROR = 'SAVE_DOCTOR_AND_HOSPITAL_ERROR',
  INVALID_REQUEST_ROLE = 'INVALID_REQUEST_ROLE',
  SAVE_PATIENT_LIFE_STYLE_ERROR = 'SAVE_PATIENT_LIFE_STYLE_ERROR',
  SAVE_PATIENT_FAMILY_HISTORY_ERROR = 'SAVE_PATIENT_FAMILY_HISTORY_ERROR',
  CREATE_APPOINTMENT_SESSION_ERROR = 'CREATE_APPOINTMENT_SESSION_ERROR',
  CREATE_APPOINTMENT_DOCUMENT_ERROR = 'CREATE_APPOINTMENT_DOCUMENT_ERROR',
  SAVE_MEDICINE_ORDER_LINE_ERROR = 'SAVE_MEDICINE_ORDER_LINE_ERROR',
  SAVE_MEDICINE_ORDER_PAYMENT_ERROR = 'SAVE_MEDICINE_ORDER_PAYMENT_ERROR',
  SAVE_MEDICINE_ORDER_STATUS_ERROR = 'SAVE_MEDICINE_ORDER_STATUS_ERROR',
  INVALID_PHARMA_ORDER_URL = 'INVALID_PHARMA_ORDER_URL',
  INVALID_PRISM_URL = 'INVALID_PRISM_URL',
  INVALID_SMS_GATEWAY_URL = 'INVALID_SMS_GATEWAY_URL',
  INVALID_SYMPTOMS_LIST = 'INVALID_SYMPTOMS_LIST',
  INVALID_DIAGNOSIS_LIST = 'INVALID_DIAGNOSIS_LIST',
  INVALID_DIAGNOSTIC_PRESCRIPTION_LIST = 'INVALID_DIAGNOSTIC_PRESCRIPTION_LIST',
  INVALID_MEDICINE_PRESCRIPTION_LIST = 'INVALID_MEDICINE_PRESCRIPTION_LIST',
  INVALID_OTHER_INSTRUCTIONS_LIST = 'INVALID_OTHER_INSTRUCTIONS_LIST',
  SAVE_PATIENT_MEDICAL_HISTORY_ERROR = 'SAVE_PATIENT_MEDICAL_HISTORY_ERROR',
  JUNIOR_DOCTOR_CASESHEET_NOT_CREATED = 'JUNIOR_DOCTOR_CASESHEET_NOT_CREATED',
  ANOTHER_DOCTOR_APPOINTMENT_EXIST = 'ANOTHER_DOCTOR_APPOINTMENT_EXIST',
  CALL_DETAILS_ERROR = 'CALL_DETAILS_ERROR',
  INVALID_CALL_ID = 'INVALID_CALL_ID',
  INVALID_DATES = 'INVALID_DATES',
  NO_DEVICE_TOKEN_EXIST = 'NO_DEVICE_TOKEN_EXIST',
  SAVE_NEW_PROFILE_ERROR = 'SAVE_NEW_PROFILE_ERROR',
  INVALID_SECRETARY_ID = 'INVALID_SECRETARY_ID',
  CREATE_DOCTORSECRETARY_ERROR = 'CREATE_DOCTORSECRETARY_ERROR',
  SECRETARY_DOCTOR_COMBINATION_EXIST = 'SECRETARY_DOCTOR_COMBINATION_EXIST',
  SECRETARY_DOCTOR_COMBINATION_DOESNOT_EXIST = 'SECRETARY_DOCTOR_COMBINATION_DOESNOT_EXIST',
  INVALID_DOCUMENT_PATH = 'INVALID_DOCUMENT_PATH',
  GET_APPOINTMENT_DOCUMENT_ERROR = 'GET_APPOINTMENT_DOCUMENT_ERROR',
  DELETE_APPOINTMENT_DOCUMENT_ERROR = 'DELETE_APPOINTMENT_DOCUMENT_ERROR',
  SAVE_DIAGNOSTIC_ORDER_ERROR = 'SAVE_DIAGNOSTIC_ORDER_ERROR',
  SAVE_DIAGNOSTIC_ORDER_LINE_ERROR = 'SAVE_DIAGNOSTIC_ORDER_LINE_ERROR',
  INVALID_DIAGNOSTIC_ORDER_ID = 'INVALID_DIAGNOSTIC_ORDER_ID',
  INVALID_ZIPCODE = 'INVALID_ZIPCODE',
  NO_HUB_SLOTS = 'NO_HUB_SLOTS',
  INVALID_HOSPITAL_ID = 'INVALID_HOSPITAL_ID',
  BOOKING_LIMIT_EXCEEDED = 'BOOKING_LIMIT_EXCEEDED',
  INVALID_SEARCH_VALUE = 'INVALID_SEARCH_VALUE',
  SAVE_DOCTOR_FAVOURITE_MEDICINE_ERROR = 'SAVE_DOCTOR_FAVOURITE_MEDICINE_ERROR',
  SAVE_DOCTOR_FAVOURITE_ADVICE_ERROR = 'SAVE_DOCTOR_FAVOURITE_ADVICE_ERROR',
  SAVE_DOCTOR_FAVOURITE_TEST_ERROR = 'SAVE_DOCTOR_FAVOURITE_TEST_ERROR',
  GET_DOCTOR_FAVOURITE_ADVICE_ERROR = 'GET_DOCTOR_FAVOURITE_ADVICE_ERROR',
  GET_DOCTOR_FAVOURITE_TEST_ERROR = 'GET_DOCTOR_FAVOURITE_TEST_ERROR',
  GET_DOCTOR_FAVOURITE_MEDICINE_ERROR = 'GET_DOCTOR_FAVOURITE_MEDICINE_ERROR',
  TEST_ALREADY_EXIST = 'TEST_ALREADY_EXIST',
  INVALID_TEST_ID = 'INVALID_TEST_ID',
  DELETE_DOCTOR_FAVOURITE_TEST_ERROR = 'DELETE_DOCTOR_FAVOURITE_TEST_ERROR',
  INVALID_FAVOURITE_ID = 'INVALID_FAVOURITE_ID',
  GET_FAVOURITE_ERROR = 'GET_FAVOURITE_ERROR',
  DELETE_DOCTOR_FAVOURITE_MEDICINE_ERROR = 'DELETE_DOCTOR_FAVOURITE_MEDICINE_ERROR',
  UPDATE_DOCTOR_FAVOURITE_MEDICINE_ERROR = 'UPDATE_DOCTOR_FAVOURITE_MEDICINE_ERROR',
  GET_DOCTOR_ADVICE_ERROR = 'GET_DOCTOR_ADVICE_ERROR',
  INVALID_ADVICE_ID = 'INVALID_ADVICE_ID',
  ADVICE_ALREADY_EXIST = 'ADVICE_ALREADY_EXIST',
  MEDICINE_ALREADY_EXIST = 'MEDICINE_ALREADY_EXIST',
  JUNIOR_DOCTOR_CONSULTATION_INPROGRESS = 'JUNIOR_DOCTOR_CONSULTATION_INPROGRESS',
  INVALID_APPOINTMENT_STATUS_TO_RESCHEDULE = 'INVALID_APPOINTMENT_STATUS_TO_RESCHEDULE',
  APPOINTMENT_NO_SHOW_ERROR = 'APPOINTMENT_NO_SHOW_ERROR',
  INVALID_FIRST_NAME = 'INVALID_FIRST_NAME',
  INVALID_LAST_NAME = 'INVALID_LAST_NAME',
  INVALID_FULL_NAME = 'INVALID_FULL_NAME',
  INVALID_DISPLAY_NAME = 'INVALID_DISPLAY_NAME',
  INVALID_MOBILE_NUMBER = 'INVALID_MOBILE_NUMBER',
  DOCTOR_ALREADY_EXISTS = 'DOCTOR_ALREADY_EXISTS',
  INVALID_OFFSET = 'INVALID_OFFSET',
  INVALID_LIMIT = 'INVALID_LIMIT',
  GET_ADMIN_USER_ERROR = 'GET_ADMIN_USER_ERROR',
  SAVE_DOCTORANDHOSPITAL_ERROR = 'SAVE_DOCTORANDHOSPITAL_ERROR',
  GET_SECRETARY_ERROR = 'GET_SECRETARY_ERROR',
  DELETE_SECRETARY_ERROR = 'DELETE_SECRETARY_ERROR',
  INVALID_CONSULT_HOURS = 'INVALID_CONSULT_HOURS',
}
