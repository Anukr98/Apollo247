import {
  DoctorType,
  MEDICINE_ORDER_STATUS,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { SymptomsSpecialities } from '@aph/mobile-patients/src/helpers/apiCalls';
import {
  PharmaUserStatus,
  UploadPrescSource,
} from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { DIAGNOSTIC_ADD_TO_CART_SOURCE_TYPE } from '@aph/mobile-patients/src/utils/commonUtils';

type YesOrNo = 'Yes' | 'No';
type HdfcPlan = 'SILVER' | 'GOLD' | 'PLATINUM';
type PrescriptionOptions =
  | 'Prescription Upload'
  | 'Prescription Later'
  | 'Virtual Consult'
  | 'Not Applicable';
type SiteType = 'Hub' | 'LVDC' | 'CVDC';

export enum ProductPageViewedSource {
  NOTIFICATION = 'notification',
  DEEP_LINK = 'deeplink',
  BANNER = 'banner',
  REGISTRATION = 'registration',
  CART = 'cart',
  PARTIAL_SEARCH = 'partial search',
  FULL_SEARCH = 'full search',
  RECENT_SEARCH = 'recent search',
  HOME_PAGE = 'home page',
  BUY_AGAIN = 'buy again',
  CATEGORY_OR_LISTING = 'category or listing',
  SUBSTITUTES = 'substitutes',
  CROSS_SELLING_PRODUCTS = 'cross selling products',
  SIMILAR_PRODUCTS = 'similar products',
  MULTI_VARIANT = 'multivariant',
  BRAND_PAGES = 'brandPages',
}

export enum WebEngageEventName {
  Patient_API_Error = 'Patient_API_Error',
  //DOH
  DOH_Clicked = 'DOH Clicked',
  DOH_Viewed = 'DOH Viewed',

  MOBILE_ENTRY = 'Mobile Entry',
  MOBILE_NUMBER_ENTERED = 'Mobile Number Entered',
  OTP_ENTERED = 'OTP Entered',
  PRE_APOLLO_CUSTOMER = 'Pre Apollo Customer',
  OTP_VERIFICATION_SUCCESS = 'OTP Verification Success',
  OTP_ON_CALL_CLICK = 'OTP on call clicked',
  REGISTRATION_DONE = 'Registration Done',
  NUMBER_OF_PROFILES_FETCHED = 'Number of Profiles fetched',
  SEARCH = 'Pharmacy Search',
  SEARCH_ENTER_CLICK = 'Pharmacy Search Enter Clicked',
  PHARMACY_SEARCH_RESULTS = 'Pharmacy Search Results',
  PRODUCT_DETAIL_TAB_CLICKED = 'Product Detail Tab Clicked',
  PRODUCT_DETAIL_PINCODE_CHECK = 'Product Detail Pincode Check',
  NOTIFY_ME = 'Notify Me',
  CATEGORY_CLICKED = 'Pharmacy Category Clicked',
  CATEGORY_FILTER_CLICKED = 'Pharmacy Category Filter Clicked',
  CATEGORY_FILTER_APPLIED = 'Pharmacy Category Filter Applied',
  CATEGORY_LIST_GRID_VIEW = 'Listing view',
  SHOW_PRESCRIPTION_AT_STORE_SELECTED = 'Show prescription at store selected',
  PHARMACY_STORE_PICKUP_VIEWED = 'Pharmacy store pickup viewed',
  PHARMACY_STORE_SELECTED_SUCCESS = 'Pharmacy store selected success',
  PHARMACY_ADD_TO_CART = 'Pharmacy Add to cart',
  PHARMACY_ADD_TO_CART_NONSERVICEABLE = 'Pharmacy Add to cart Nonserviceable',
  PHARMACY_CART_VIEWED = 'Pharmacy Cart Viewed',
  SKU_PRICE_MISMATCH = 'SKU Price Mismatch',
  TAT_API_FAILURE = 'Tat API Failure',
  PHARMACY_PROCEED_TO_PAY_CLICKED = 'Pharmacy Proceed To Pay Clicked',
  PHARMACY_PAYMENT_INITIATED = 'Pharmacy Payment Initiated',
  UPLOAD_PRESCRIPTION_CLICKED = 'Pharmacy Upload Prescription Clicked',
  CART_UPLOAD_PRESCRIPTION_CLICKED = 'Cart - upload prescription',
  ITEMS_REMOVED_FROM_CART = 'Items removed from cart',
  CART_APPLY_COUPON_CLCIKED = 'Pharmacy cart - Apply coupon clicked',
  CART_COUPON_APPLIED = 'Pharmacy cart - coupon applied',
  UPLOAD_PRESCRIPTION_IMAGE_UPLOADED = 'Upload Prescription Image Uploaded',
  UPLOAD_PRESCRIPTION_OPTION_SELECTED = 'Upload Prescription Option Selected',
  UPLOAD_PRESCRIPTION_SUBMIT_CLICKED = 'Upload Prescription Submit Clicked',
  UPLOAD_PRESCRIPTION_ADDRESS_SELECTED = 'Upload prescription - Address selected',
  UPLOAD_PRESCRIPTION_NEW_ADDRESS = 'Upload prescription - New address added',
  PHARMACY_SUBMIT_PRESCRIPTION = 'Upload Prescription Proceed Clicked',
  PHARMACY_CHECKOUT_COMPLETED = 'Pharmacy Checkout completed',
  PHARMACY_DETAIL_IMAGE_CLICK = 'Product Detail page Image clicked',
  DOCTOR_SEARCH = 'Doctor Search',
  SPECIALITY_CLICKED = 'Speciality Clicked',
  DOCTOR_CLICKED = 'Doctor card on doctor listing screen clicked',
  BOOK_APPOINTMENT = 'Book Appointment',
  TYPE_OF_CONSULT_SELECTED = 'Type of consultation seleted',
  CONSULT_SORT = 'Consult Sort',
  CONSULT_NOW_CLICKED = 'Consult Now clicked',
  CONSULT_SCHEDULE_FOR_LATER_CLICKED = 'Consult Schedule for Later clicked',
  CONSULT_SLOT_SELECTED = 'Consult Slot Selected',
  CONSULT_COUPON_APPLIED = 'Coupon Applied',
  PAY_BUTTON_CLICKED = 'Pay Button Clicked',
  CONSULTATION_BOOKED = 'Consultation booked',
  PHARMACY_FEEDBACK_GIVEN = 'Pharmacy Feedback Given',
  PAST_DOCTOR_SEARCH = 'Past Doctor Search',
  CONSULT_TYPE_SELECTION = 'Consult Type Selection',
  HOMEPAGE_WIDGET_FOLLOWUP_CLICK = 'Home Page Consult Widget Follow Up Click',
  DOCTOR_CARD_CONSULT_CLICK = 'Doctor card Consult in x minutes clicked',
  DOCTOR_CONNECT_CARD_CLICK = 'Doctor Connect Card Click',
  CONSULTED_WITH_DOCTOR_BEFORE = 'Chat Window Consulted with doctor before alert',
  DOCTOR_SPECIALITY_SEARCH_NO_RESULT = 'Doctor Speciality Fuzzy Search No Result',
  CONFIRM_LOCATION = 'Confirm Location',
  DOCTOR_LISTING_FILTER_APPLIED = 'Doctor Listing Filter Apply',
  DOCTOR_PROFILE_THROUGH_DEEPLINK = 'Doctor profile through deeplink',
  SEARCH_SUGGESTIONS = 'Search suggestions',
  SEARCH_SUGGESTIONS_VIEW_ALL = 'User clicked on View All',
  RETURN_REQUEST_START = 'Return Request Start',
  RETURN_REQUEST_SUBMITTED = 'Return Request Submitted',
  HOME_VIEWED = 'Home page viewed',
  MOVED_AWAY_FROM_HOME = 'User moved away from Homepage',
  SEARCH_SUGGESTIONS_CLICKED = 'Search suggestion clicked',
  USER_LOGGED_IN_WITH_TRUECALLER = 'User logged in with truecaller',
  TRUECALLER_EVENT_ERRORS = 'Truecaller event errors',
  TRUECALLER_APOLLO247_LOGIN_ERRORS = 'Apollo247 truecaller login errors',
  LOGIN_WITH_TRUECALLER_CLICKED = 'Login with truecaller clicked',
  MY_CONSULTED_DOCTORS_CLICKED = 'My doctor clicked',
  VIEW_PROFILE_SLOT_SCREEN = 'View Profile Slot Screen',
  VIEW_AVAILABLE_SLOTS = 'View Available Slots',
  VIEW_SLOTS_CLICKED = 'View Slots Clicked',
  //Doctor Share Events
  SHARE_CLICK_DOC_LIST_SCREEN = 'Share clicked doc list screen',
  SHARE_PROFILE_CLICKED_DOC_LIST = 'Share profile clicked doc list',
  GO_BACK_CLICKED_DOC_LIST = 'go back clicked doc list',
  SHARE_CLICKED_DOC_PROFILE_SCREEN = 'share clicked doc profile screen',
  SHARE_PROFILE_CLICKED_DOC_PROFILE = 'Share profile clicked doc profile',
  GO_BACK_CLICKED_DOC_PROFILE = 'go back clicked doc profile',
  DOCTOR_PROFILE_SCREEN_BY_SHARE_LINK = 'Doctor profile screen by share link',

  MY_ORDERS_CLICKED = 'My Orders Clicked',
  ORDER_SUMMARY_CLICKED = 'Order Summary Clicked',
  PHARMACY_MY_ORDER_TRACKING_CLICKED = 'Pharmacy My Order Tracking Clicked',
  PHARMACY_ADD_NEW_ADDRESS_CLICK = 'Pharmacy Add New Address Click',
  PHARMACY_ADD_NEW_ADDRESS_COMPLETED = 'Pharmacy Add New Address Completed',
  PHARMACY_CART_ADDRESS_SELECTED_SUCCESS = 'Pharmacy Cart Address Selected Success',
  PHARMACY_CART_ADDRESS_SELECTED_FAILURE = 'Pharmacy Cart Address Selected Failure',
  PHARMACY_AVAILABILITY_API_CALLED = 'Pharmacy Availability API Called',
  PHARMACY_TAT_API_CALLED = 'Pharmacy TAT API Called',
  PHARMACY_CART_SELECT_DELIVERY_ADDRESS_CLICKED = 'Pharmacy Cart - Select Delivery Address Clicked',
  PHARMACY_CART_UPLOAD_PRESCRIPTION_CLICKED = 'Pharmacy Cart - Upload Prescription Clicked',

  PHARMACY_POST_CART_PAGE_VIEWED = 'Pharmacy Post Cart Screen Viewed',
  PHARMACY_ORDER_SUBSTITUTE_OPTION_CLICKED = 'Pharmacy Order Success Substitute Option Clicked',

  // HomePageElements Events
  BUY_MEDICINES = 'Buy Medicines',
  ORDER_TESTS = 'Order Tests',
  MANAGE_DIABETES = 'Manage Diabetes',
  PROHEALTH = 'Prohealth',
  TRACK_SYMPTOMS = 'Track Symptoms',
  VIEW_HELATH_RECORDS = 'PHR Click Health records',
  LEARN_MORE_ABOUT_CORONAVIRUS = 'Learn more about coronavirus',
  CHECK_YOUR_RISK_LEVEL = 'Check your risk level',
  APOLLO_PRO_HEALTH = 'Apollo pro health',
  NOTIFICATION_ICON = 'Notification Icon clicked',
  ACTIVE_APPOINTMENTS = 'Active Appointments',
  ACTIVE_PROHEALTH_APPOINTMENTS = 'PROHEALTH_ACTIVE_APPOINTMENTS',
  NEED_HELP = 'Need Help?',
  TICKET_RAISED = 'Ticket raised',
  HELP_TICKET_SUBMITTED = 'Help_Ticket_Submitted',
  MY_ACCOUNT = 'My Account',
  BOOK_DOCTOR_APPOINTMENT = 'Book Doctor Appointment clicked on homescreen',
  TABBAR_APPOINTMENTS_CLICKED = 'Appointments Clicked on tab bar',
  APOLLO_KAVACH_PROGRAM = 'Apollo Kavach Program',
  COVID_VACCINE_TRACKER = 'Covid Vaccine Tracker',
  READ_ARTICLES = 'Read Articles',
  HDFC_HEALTHY_LIFE = 'Explore HDFC Tile Clicked on Homepage',
  LOCATION_PERMISSION = 'Location permission',

  FAQs_ARTICLES_CLICKED = 'Vaccination FAQs & Articles clicked',
  VACCINATION_CALL_A_DOCTOR_CLICKED = 'Vaccination Call a doctor clicked',
  VACCINATION_PROCEED_TO_CONNECT_A_DOCTOR_CLICKED = 'Vaccination Call a doctor - Proceed to connect',
  VACCINATION_CHAT_WITH_US = 'Vaccination Chat with us',
  VACCINATION_TRACKER_ON_HOME_PAGE = 'Vaccine tracker on home page',
  COVID_VACCINATION_SECTION_CLICKED = 'Covid Vaccination Section Clicked',
  USER_LOCATION_CONSULT = 'User Location consult',
  USER_CHANGED_LOCATION = 'Change location',
  // Diagnostics Events
  DIAGNOSTIC_LANDING_PAGE_VIEWED = 'Diagnostic landing page viewed',
  DIAGNOSTIC_PINCODE_ENTERED_ON_LOCATION_BAR = 'Diagnostic pincode entered',
  DIAGNOSTIC_LANDING_ITEM_SEARCHED = 'Diagnostic partial search',
  DIAGNOSTIC_ITEM_SEARCHED = 'Diagnostic full search',
  DIAGNOSTIC_HOME_PAGE_WIDGET_CLICKED = 'Diagnostic home page widgets',
  DIAGNOSTIC_TEST_DESCRIPTION = 'Diagnostic test page viewed',
  DIAGNOSTIC_ADD_TO_CART = 'Diagnostic add to cart',
  DIAGNOSTIC_CART_VIEWED = 'Diagnostic Cart page viewed',
  DIAGNOSTIC_MY_ORDERS = 'Diagnostics - My Orders Viewed',
  DIAGNOSTIC_ORDER_SUMMARY_VIEWED = 'Diagnostic Order summary viewed',
  DIAGNOSTIC_VIEW_REPORT_CLICKED = 'Diagnostic view reports',

  DIAGNOSTIC_ADDRESS_SELECTED_CARTPAGE = 'Diagnostic address selected',
  DIAGNOSTIC_ITEM_REMOVE_ON_CARTPAGE = 'Diagnostic cart item removed',
  DIAGNOSTIC_ITEM_ADD_ON_CARTPAGE = 'Diagnostic add item clicked',

  DIAGNOSTIC_ADDRESS_NON_SERVICEABLE_CARTPAGE = 'Address Non Serviceable on Diagnostic Cart Page',
  DIAGNOSTIC_AREA_SELECTED = 'Diagnostic Area Selected on Cart',
  DIAGNOSTIC_APPOINTMENT_TIME_SELECTED = 'Diagnostic slot time selected',
  DIAGNOSTIC_PROCEED_TO_PAY_CLICKED = 'Diagnostic proceed to pay clicked',
  PAYMENT_INITIATED = 'Payment Initiated',
  DIAGNOSTIC_CHECKOUT_COMPLETED = 'Diagnostic Checkout completed',
  DIAGNOSTIC_TRACK_ORDER_VIEWED = 'Diagnostic track Order viewed',
  DIAGNOSTIC_ORDER_RESCHEDULE = 'Diagnostic order reschedule - frontend',
  DIAGNOSTIC_FEEDBACK_GIVEN = 'Diagnostic feedback submitted',
  DIAGNOSITC_HOME_PAGE_BANNER_CLICKED = 'Diagnostic home page banner',
  DIAGNOSTIC_PAYMENT_PAGE_VIEWED = 'Diagnostic payment page viewed',
  DIAGNOSTIC_PHLEBO_FEEDBACK_SUBMITTED = 'Diagnostic Phlebo feedback submitted',
  DIAGNOSTIC_PHLEBO_CALLING_CLICKED = 'Diagnostic Phlebo calling clicked',
  DIAGNOSTIC_ORDER_STATUS = 'Diagnostic Order Status',
  DIAGNOSTIC_TRACK_PHLEBO_CLICKED = 'Diagnostic Track Phlebo clicked',
  DIGNOSTIC_PAYMENT_ABORTED = 'Diagnostic payment aborted',
  DIAGNOSITC_MODIFY_CLICKED = 'Diagnostic modify clicked',
  DIAGNOSTIC_MODIFY_ORDER = 'Diagnostic modify order',

  // Health Records
  CONSULT_RX = 'PHR Consult & RX',
  MEDICAL_RECORDS = 'PHR Medical Records',
  ADD_RECORD = 'Add Record',
  ADD_VACCINATION_RECORD = 'Add Vaccination Record',
  UPLOAD_PRESCRIPTION = 'Upload Prescription',
  UPLOAD_PHOTO = 'Upload Photo',
  ITEMS_CLICKED = 'Items Clicked',
  PHR_ORDER_MEDS_TESTS = 'PHR Order Tests and Meds Prescription',
  PHR_CONSULT_CARD_CLICK = 'PHR Consult Card click',
  RE_ORDER_MEDICINE = 'ReOrder Medicine',
  PHR_CLICK_DOCTOR_CONSULTATIONS = 'PHR Click Doctor Consultations',
  PHR_CLICK_TEST_REPORTS = 'PHR Click Test Reports',
  PHR_CLICK_HOSPITALIZATIONS = 'PHR Click Hospitalizations',
  PHR_CLICK_HEALTH_CONDITIONS = 'PHR Click Health Conditions',
  PHR_CLICK_BILLS = 'PHR Click Bills',
  PHR_CLICK_VACCINATION = 'PHR Click Vaccination',
  PHR_CLICK_INSURANCES = 'PHR Click Insurances',
  PHR_ADD_DOCTOR_CONSULTATIONS = 'PHR Add Doctor Consultation',
  PHR_ADD_TEST_REPORT = 'PHR Add Test Report',
  PHR_ADD_HOSPITALIZATIONS = 'PHR Add Hospitalization',
  PHR_ADD_ALLERGY = 'PHR Add Allergy',
  PHR_ADD_FAMILY_HISTORY = 'PHR Add Family History',
  PHR_ADD_MEDICATION = 'PHR Add Medication',
  PHR_ADD_HEALTH_RESTRICTIONS = 'PHR Add Health Restriction',
  PHR_ADD_MEDICAL_CONDITION = 'PHR Add Medical Condition',
  PHR_ADD_BILLS = 'PHR Add Bills',
  PHR_ADD_INSURANCE = 'PHR Add Insurance',
  PHR_ADD_HEIGHT = 'PHR Add Height',
  PHR_ADD_WEIGHT = 'PHR Add Weight',
  PHR_ADD_BLOOD_GROUP = 'PHR Add BloodGroup',
  PHR_DOWNLOAD_DOCTOR_CONSULTATION = 'PHR Download Doctor Consultation',
  PHR_DOWNLOAD_TEST_REPORT = 'PHR Download Test Report',
  PHR_DOWNLOAD_HEALTH_CHECKS = 'PHR Download Health Check',
  PHR_DOWNLOAD_HOSPITALIZATIONS = 'PHR Download Hospitalization',
  PHR_DOWNLOAD_ALLERGY = 'PHR Download Allergy',
  PHR_DOWNLOAD_FAMILY_HISTORY = 'PHR Download Family History',
  PHR_DOWNLOAD_MEDICAL_CONDITION = 'PHR Download Medical Condition',
  PHR_DOWNLOAD_BILLS = 'PHR Download Bill',
  PHR_DOWNLOAD_INSURANCE = 'PHR Download Insurance',
  PHR_UPDATE_DOCTOR_CONSULTATION = 'PHR Update Doctor Consultation',
  PHR_UPDATE_TEST_REPORT = 'PHR Update Test Report',
  PHR_UPDATE_HOSPITALIZATIONS = 'PHR Update Hospitalization',
  PHR_UPDATE_ALLERGY = 'PHR Update Allergy',
  PHR_UPDATE_FAMILY_HISTORY = 'PHR Update Family History',
  PHR_UPDATE_MEDICATION = 'PHR Update Medication',
  PHR_UPDATE_HEALTH_RESTRICTIONS = 'PHR Update Health Restriction',
  PHR_UPDATE_MEDICAL_CONDITION = 'PHR Update Medical Condition',
  PHR_UPDATE_BILLS = 'PHR Update Bill',
  PHR_UPDATE_INSURANCE = 'PHR Update Insurance',
  PHR_UPDATE_HEIGHT = 'PHR Update Height',
  PHR_UPDATE_WEIGHT = 'PHR Update Weight',
  PHR_UPDATE_BLOOD_GROUP = 'PHR Update BloodGroup',
  PHR_DELETE_DOCTOR_CONSULTATION = 'PHR Delete Doctor Consultation',
  PHR_DELETE_TEST_REPORT = 'PHR Delete Test Report',
  PHR_DELETE_HOSPITALIZATIONS = 'PHR Delete Hospitalization',
  PHR_DELETE_ALLERGY = 'PHR Delete Allergy',
  PHR_DELETE_FAMILY_HISTORY = 'PHR Delete Family History',
  PHR_DELETE_MEDICATION = 'PHR Delete Medication',
  PHR_DELETE_HEALTH_RESTRICTIONS = 'PHR Delete Health Restriction',
  PHR_DELETE_MEDICAL_CONDITION = 'PHR Delete Medical Condition',
  PHR_DELETE_BILLS = 'PHR Delete Bill',
  PHR_DELETE_INSURANCE = 'PHR Delete Insurance',
  PHR_LOAD_HEALTH_RECORDS = 'PHR Load Health Records',
  PHR_USER_LINKING = 'PHR User Linking',
  PHR_USER_DELINKING = 'PHR User DeLinking',
  PHR_NO_OF_USERS_SEARCHED_GLOBAL = 'PHR No Of Users searched Global',
  PHR_NO_USERS_SEARCHED_LOCAL = 'PHR No Of Users searched Local {0}',
  PHR_NO_OF_USERS_CLICKED_ON_RECORDS = 'PHR users seen on records in {0}',

  // ConsultRoom Events
  CONSULTATION_CANCELLED_BY_CUSTOMER = 'Consultation Cancelled by Customer',
  CONSULTATION_RESCHEDULED_BY_CUSTOMER = 'Consultation Rescheduled by Customer',
  COMPLETED_AUTOMATED_QUESTIONS = 'Completed Automated Questions',
  JD_COMPLETED = 'JD Completed',
  CHAT_WITH_US = 'Chat with us',
  PRESCRIPTION_RECEIVED = 'Prescription Received',
  SD_CONSULTATION_STARTED = 'SD Consultation Started',
  SD_VIDEO_CALL_STARTED = 'SD Video call started',
  CONSULT_FEEDBACK_GIVEN = 'Consult feedback Given',
  DOWNLOAD_PRESCRIPTION = 'Download Prescription',
  VIEW_PRESCRIPTION_IN_CONSULT_DETAILS = 'View Prescription in Consult Details',
  CART_PRESCRIPTION_OPTION_SELECTED_PROCEED_CLICKED = 'Cart Prescription Option Selected & Proceed Click',
  ORDER_MEDICINES_FROM_PRESCRIPTION_DETAILS = 'PHR Order Meds Prescription Detail',
  ORDER_TESTS_FROM_PRESCRIPTION_DETAILS = 'PHR Order Tests Prescription Detail',
  CONSULT_CARD_CLICKED = 'Consult Card Clicked',
  CONTINUE_CONSULT_CLICKED = 'Continue Consult Clicked',
  CHAT_WITH_DOCTOR = 'Chat with Doctor',
  FILL_MEDICAL_DETAILS = 'Fill Medical Details',
  RESCHEDULE_CLICKED = 'Reschedule Clicked',
  CANCEL_CONSULTATION_CLICKED = 'Cancel Consultation Clicked',
  CONTINUE_CONSULTATION_CLICKED = 'Continue Consultation Clicked',
  NO_SLOTS_FOUND = 'No Slots Found',
  DOCTOR_RESCHEDULE_CLAIM_REFUND = 'Doctor reschedule and Claim Refund button click',
  DOCTOR_CONNECT_TAB_CLICKED = 'Doctor Connect Tab Clicked',
  APOLLO_DOCTOR_TAB_CLICKED = 'Apollo Doctor Tab Clicked',
  UPLOAD_RECORDS_CLICK_CHATROOM = 'Upload Records in chatroom clicked',
  TAKE_PHOTO_CLICK_CHATROOM = 'Take a photo in consult room clicked',
  GALLERY_UPLOAD_PHOTO_CLICK_CHATROOM = 'choose from gallery in consult room clicked',
  UPLOAD_PHR_CLICK_CHATROOM = 'Upload from PHR in consult room clicked',
  PATIENT_JOINED_CONSULT = 'Patient Joined the consult with doctor',
  PATIENT_ENDED_CONSULT = 'Patient ended the consult',
  CALL_ENDED = 'Call Ended',
  PAST_APPOINTMENT_BOOK_FOLLOW_UP_CLICKED = 'Book follow up clicked from Past appointment',
  BOOK_AGAIN_CANCELLED_APPOINTMENT = 'Book again clicked from cancelled appointment',
  VIEW_DETAILS_PAST_APPOINTMENT = 'View details clicked on past appointment',
  BOOK_APPOINTMENT_CHAT_ROOM = 'Book appointment clicked inside consult room',
  PATIENT_ANSWERED_CALL = 'Patient Answered the call',
  PATIENT_DECLINED_CALL = 'Patient Declined the call',
  PATIENT_MISSED_CALL = 'Patient Missed the call',
  CALL_DROPPED_UNKNOWN_REASON = 'Call Dropped Due to Unknown Reason',
  // Medicine Events
  PHARMACY_AUTO_SELECT_LOCATION_CLICKED = 'Pharmacy Auto Select Location Clicked',
  PHARMACY_ENTER_DELIVERY_PINCODE_CLICKED = 'Pharmacy Enter Delivery Pincode Clicked',
  PHARMACY_ENTER_DELIVERY_PINCODE_SUBMITTED = 'Pharmacy Enter Delivery Pincode Submitted ',
  PHARMACY_PINCODE_NONSERVICABLE = 'Pharmacy location nonservicable',
  PHARMACY_BANNER_CLICK = 'Pharmacy Homepage Banner click',
  CALL_THE_NEAREST_PHARMACY = 'Call the Nearest Pharmacy',
  // Payments Events
  PAYMENT_INSTRUMENT = 'Payment Instrument',
  PAYMENT_STATUS = 'Payment Status',
  CONSULT_PAYMENT_MODE_SELECTED = 'Consult booking payment mode selected',
  PAYMENT_FAILED_AND_CONVERTED_TO_COD = 'Payment Failed & Converted to COD',
  // Deeplink Events
  HOME_PAGE_VIEWED = 'Pharmacy Home page viewed',
  PRODUCT_PAGE_VIEWED = 'Product page viewed',
  CATEGORY_PAGE_VIEWED = 'Category page viewed',
  BUY_AGAIN_PAGE_VIEWED = 'Buy again page viewed',

  // HDFC events
  HDFC_HOMEPAGE_CAROUSEL_CLICKED = 'HDFC Home Page Carousel Clicked',
  HDFC_MY_MEMBERSHIP_VIEWED = 'HDFC My Membership Viewed',
  HDFC_PLAN_DETAILS_VIEWED = 'HDFC Plan Details Viewed',
  HDFC_EXPLORE_PLAN_CLICKED = 'HDFC Explore Plan Clicked',
  HDFC_HOW_TO_AVAIL_CLICKED = 'HDFC How To Avail Clicked',
  HDFC_REDEEM_CLICKED = 'HDFC Redeem Clicked',
  HDFC_DOC_ON_CALL_CLICK = 'HDFC Doc On Call Click',
  HDFC_COVID_CARE_CLICK = 'HDFC Covid Care Click',
  HDFC_DIGITIZATION_PHR_CLICK = 'HDFC Digitization PHR Click',
  HDFC_FREE_HEALTH_ASSESSMENT_CLICK = 'HDFC Free Health Assessment Click',
  HDFC_CONCIERGE_CLICK = 'HDFC Concierge Click',
  HDFC_DIETITIAN_CLICK = 'HDFC Dietitian Click',
  HDFC_DIAGNOSTIC_CLICK = 'HDFC Diagnostic Click',
  HDFC_DIGITAL_VAULT_CLICK = 'HDFC Digital Vault Click',
  HDFC_7000_DOCTORS_CLICK = 'HDFC 7000 Doctors Click',
  HDFC_FREE_MED_CHECK_CLICK = 'HDFC Free Med Check Click',
  HDFC_PLAN_SUSBCRIBED = 'HDFC Plan Subscribed',

  // Opentok Events
  DOCTOR_SUBSCRIBER_ERROR = 'Doctor Subscriber Error',
  DOCTOR_SUBSCRIBER_OTRNERROR = 'Doctor Subscriber Otrnerror',
  DOCTOR_SUBSCRIBER_DISCONNECTED = 'Doctor Subscriber Disconnected',
  DOCTOR_SUBSCRIBER_CONNECTED = 'Doctor Subscriber Connected',
  DOCTOR_SUBSCRIBER_VIDEO_DISABLED = 'Doctor Subscriber Video Disabled',
  DOCTOR_SUBSCRIBER_VIDEO_ENABLED = 'Doctor Subscriber Video Enabled',

  PATIENT_PUBLISHER_ERROR = 'Patient Publisher Error',
  PATIENT_PUBLISHER_OTRNERROR = 'Patient Publisher Otrnerror',
  PATIENT_PUBLISHER_STREAM_CREATED = 'Patient Publisher Stream Created',
  PATIENT_PUBLISHER_STREAM_DESTROYED = 'Patient Publisher Stream Destroyed',

  PATIENT_SESSION_ERROR = 'Patient Session Error',
  PATIENT_SESSION_OTRNERROR = 'Patient Session Otrnerror',
  PATIENT_SESSION_CONNECTION_CREATED = 'Patient Session Connection Created',
  PATIENT_SESSION_CONNECTION_DESTROYED = 'Patient Session Connection Destroyed',
  PATIENT_SESSION_CONNECTED = 'Patient Session Connected',
  PATIENT_SESSION_DISCONNECTED = 'Patient Session Disconnected',
  PATIENT_SESSION_RECONNECTED = 'Patient Session Reconnected',
  PATIENT_SESSION_RECONNECTING = 'Patient Session Reconnecting',
  PATIENT_SESSION_STREAM_CREATED = 'Patient Session Stream Created',
  PATIENT_SESSION_STREAM_DESTROYED = 'Patient Session Stream Destroyed',
  PATIENT_SESSION_STREAM_PROPERTY_CHANGED = 'Patient Session Stream Property Changed',
  //chatRoom Events
  PATIENT_SENT_CHAT_MESSAGE_POST_CONSULT = 'Consult Patient sent chat message post consult',
  ORDER_MEDICINES_IN_CONSULT_ROOM = 'Order meds in Consult room',
  BOOK_TESTS_IN_CONSULT_ROOM = 'Book tests in consult room',
  PATIENT_EXTERNAL_MEETING_LINK_CLICKED = 'Patient Clicked on Video Link',
  // Symptom Tracker Events
  SYMPTOM_TRACKER_PAGE_CLICKED = 'Track symptoms clicked',
  SYMPTOM_TRACKER_FOR_MYSELF = 'Myself clicked SC',
  SYMPTOM_TRACKER_SELECT_ANOTHER_MEMBER_CLICKED = 'select other member clicked SC',
  SYMPTOM_TRACKER_INFO_CLICKED = 'information sign clicked SC',
  SYMPTOM_TRACKER_MOST_TROUBLING_SYMPTOM_CLICKED = 'symptom troubling most clicked SC',
  SYMPTOM_TRACKER_SUGGESTED_SYMPTOMS_CLICKED = 'suggested symptoms clicked SC',
  SYMPTOM_TRACKER_ADD_SELECTED_SYMPTOMS_CLICKED = 'Add selected symptoms clicked SC',
  SYMPTOM_TRACKER_ADD_OTHER_SYMPTOM_CLICKED = 'Add other symptom clicked SC',
  SYMPTOM_TRACKER_NO_OTHER_SYMPTOM_CLICKED = 'No other symptom clicked SC',
  SYMPTOM_TRACKER_CONSULT_DOCTOR_CLICKED = 'user clicked on consult doc symptom check',
  SYMPTOM_TRACKER_RESTART_CLICKED = 'restart symptom checker clicked',
  SYMPTOM_TRACKER_SEARCH_SYMPTOMS = 'User searched symptom SC',
  SYMPTOM_TRACKER_CLICKED_ON_SPECIALITY_SCREEN = 'Track symptoms in speciality screen clicked',

  //Circle Plan event names
  VC_NON_CIRCLE = 'VC Non Circle Clicks on Know More at Doctor Listing',
  VC_NON_CIRCLE_ADD = 'VC Non Circle Adds Circle Plan at Doctor Listing',
  VC_NON_CIRCLE_KNOWMORE_CONSULT = 'VC Non Circle Clicks on Know More at Choose Consult Type',
  VC_NON_CIRCLE_KNOWMORE_PROFILE = 'VC Non Circle Clicks on Know More at Doctor Profile',
  VC_NON_CIRCLE_ADDS_PROFILE = 'VC Non Circle Adds Circle Plan at Doctor Profile',
  VC_CIRCLE_FILTER = 'VC Circle Filter Selected',
  VC_NON_CIRCLE_PLAN_1 = 'VC Non Circle chooses Plan 1 in Consult Web View',
  VC_NON_CIRCLE_PLAN_2 = 'VC Non Circle chooses Plan 2 in Consult Web View',
  VC_NON_CIRCLE_PLAN_3 = 'VC Non Circle chooses Plan 3 in Consult Web View',
  VC_NON_CIRCLE_ADDS_CART = 'VC Non Circle adds Circle to Cart',
  VC_NON_CIRCLE_REMOVES_CART = 'VC Non Circle removes Circle from Cart',
  CIRCLE_BENIFIT_CLICKED = 'Circle Section Benefits Clicked',
  CIRCLE_RENEW_NOW_CLICKED = 'Circle Section Renew Now Clicked',
  CIRCLE_VIEW_BENEFITS_CLICKED = 'Circle Section View Benefits Clicked',
  CIRCLE_MEMBERSHIP_RENEWED = 'Circle Membership Renewed',
  CIRCLE_MEMBERSHIP_DETAILS_VIEWED = 'Circle Membership Details Viewed',

  // Pharma Circle Events
  PHARMA_CIRCLE_BANNER_CLICKED = 'App Pharma Circle Banner Clicked',
  PHARMA_HOME_UPGRADE_TO_CIRCLE = 'App Pharma Upgrade to Circle sticky Clicked',
  PHARMA_HOME_KNOW_MORE_CLICKED_CIRCLE_POPUP = 'App Pharma Home PopUp Know More Clicked ',
  PHARMA_PRODUCT_UPGRADE_TO_CIRCLE = 'App Pharma PDP Banner Upgrade to Circle',
  PHARMA_PRODUCT_KNOW_MORE_CLICKED_CIRCLE_POPUP = 'App Pharma PDP Popup Know More Clicked',
  PHARMA_PRODUCT_ADD_TO_CART_CLICKED_CIRCLE_POPUP = 'App Pharma PDP Popup Add To Cart',
  PHARMA_CART_KNOW_MORE_CLICKED_CIRCLE_POPUP = 'App Pharma Cart PopUp Know More Clicked',
  PHARMA_CART_ADD_TO_CART_CLICKED_CIRCLE_POPUP = 'App Pharma Cart PopUp Add to Cart Clicked',
  PHARMA_CART_CIRCLE_MEMBERSHIP_REMOVED = 'App Pharma Cart Circle Plan Removed',
  PHARMA_WEBVIEW_PLAN1 = 'App Pharma Plan 1 in Pharmacy Web View',
  PHARMA_WEBVIEW_PLAN2 = 'App Pharma Plan 2 in Pharmacy Web View',
  PHARMA_WEBVIEW_PLAN3 = 'App Pharma Plan 3 in Pharmacy Web View',
  PHARMA_WEBVIEW_PLAN_SELECTED = 'App Pharma WebView Plan Selected',
  PURCHASE_CIRCLE = 'Circle Plan Purchased',

  //Diagnostic Circle Events
  DIAGNOSTICS_CIRCLE_BANNER_CLICKED = 'App Non-circle banner clicked - Diagnostics',
  DIAGNOSTICS_BUY_NOW_CLICKED_CIRCLE_POPUP = 'App Non-circle Buy Now clicked - Diagnostics',
  DIAGNOSTICS_KNOW_MORE_CLICKED_CIRCLE_POPUP = 'App Non-circle Know more clicked - Diagnostics',
  DIAGNOSTIC_OTHER_PAYMENT_OPTION_CLICKED_POPUP = 'App circle plan - other payment clicked - Diagnostics',
  DIAGNOSTIC_CIRCLE_BENIFIT_APPLIED = 'App circle benefits - Diagnostics',

  //My Membership Circle Events
  MY_MEMBERSHIP_VIEW_DETAILS_CLICKED = 'App circle - MyMembership - View Details',
  MY_MEMBERSHIP_PHARMACY_CASHBACK_BENEFITS_CLICKED = 'App circle - MemDetails - Pharma cashback clicked',
  MY_MEMBERSHIP_FREE_DELIVERY_CLICKED = 'App circle - MemDetails -  Free delivery clicked',
  MY_MEMBERSHIP_DOCTOR_HELPLINE_CLICKED = 'App circle - MemDetails - Doctor helpline clicked',
  MY_MEMBERSHIP_DIAGNOSTICS_DISCOUNTS_CLICKED = 'App circle - MemDetails - Diag discount clicked',
  MY_MEMBERSHIP_PRO_HEALTH_CLICKED = 'App circle - MemDetails - Pro Health clicked',
  MY_MEMBERSHIP_DOC_ON_CALL_CLICKED = 'App circle - MemDetails - Doc on call clicked',
  MY_MEMBERSHIP_ADVANCED_DIABETES_CLICKED = 'App circle - MemDetails - Advance Diabetes clicked',
  MY_MEMBERSHIP_COVID_CARE_CLICKED = 'App circle - MemDetails - Covid care clicked',
  MY_MEMBERSHIP_DIGITALIZATION_OF_PHR_CLICKED = 'App circle - MemDetails - Digitalization PHR clicked',
  MY_MEMBERSHIP_DIAGNOSTICS_HOME_SAMPLE_CLICKED = 'App circle - MemDetails - Diag home sample clicked',

  //HOMEPAGE BANNER
  COVID_BANNER_CLICKED = 'Recovery Clinic Banner clicked',
  NON_CIRCLE_HOMEPAGE_BANNER_CLICKED = 'App non-circle -HomePage Banner clicked',
  MEMBERSHIP_DETAILS_BANNER_CLICKED = 'App - circle - Membership Details Banner clicked',
  HOMEPAGE_DOC_ON_CALL_BANNER_CLICKED = 'App - circle - Doc on Call Banner Clicked',
  NON_CIRCLE_HOMEPAGE_VIEWED = 'App - Circle Subscription Landing Page Entry',
  NON_CIRCLE_PLAN_SELECTED = 'App - Circle Subscription Landing Plan selected',
  NON_CIRCLE_BUY_NOW_CLICKED = 'App - Circle Subscription Landing Buy Now Clicked',
  NON_CIRCLE_PAYMENT_MODE_SELECTED = 'App - Circle Subscription Landing Payment Mode Selected',
  NON_CIRCLE_PAYMENT_DONE = 'App - Circle Subscription Landing Payment done',
  HC_1CLICK_ACTIVATION = 'App - HC - 1ClickActivation',

  //Permissioon Events
  USER_ALLOWED_PERMISSION = 'User clicked on Allow for permissions',
  USER_DENIED_PERMISSION = 'User clicked on Not now for permissions',

  //Vaccination Booking
  VACCINATION_BOOKING_CONFIRMATION = 'Vaccine_Booking confirmation',
  VACCINATION_CANCELLATION = 'Vaccine_Cancellation',
  BOOK_VACCINATION_SLOT = 'Book Vaccination slot',
  VACCINATION_BOOKING_CLICKED = 'Vaccination Booking Clicked',
  BOOK_A_SLOT_CLICKED = 'Book a Slot Clicked',
  ADD_MEMBER_CLICKED = 'Add Member Clicked',
  MEMBER_DETAILS_SAVED = 'Member Details Saved',
  VACCINE_REGISTRATION_COMPLETED = 'Vaccine Registeration Completed',
  ERROR_WHILE_FETCHING_JWT_TOKEN = 'Error while Fetching JWT token',
  AUTHTOKEN_UPDATED = 'Authtoken Updated',
}

export interface PatientInfo {
  'Patient Name': string;
  'Patient UHID': string;
  Relation: string;
  'Patient Age': number;
  'Patient Gender': string;
  'Mobile Number': string;
  'Customer ID': string;
  User_Type: string;
}

export interface UserInfo {
  'Patient UHID': string;
  'Mobile Number': string;
  'Customer ID': string;
}
export interface DOHInfo {
  doctorId: string;
  doctorName: string;
  doctorType: string;
  specialtyId: string;
  specialtyName: string;
  zone: string;
  userName: string;
  userPhoneNumber: string;
}

export interface CircleUserInfo extends UserInfo {
  'Circle Member'?: 'Yes' | 'No';
  'Membership Type'?: string;
  'Circle Membership Start Date'?: Date;
  'Circle Membership End Date'?: Date;
  type?: string; //landing page
  action?: string; //landing page
  from?: string;
}

export interface CirclePurchaseInfo extends UserInfo {
  'Membership Type'?: string;
  'Membership End Date'?: string;
  'Circle Plan Price'?: string;
  Type: string;
  Source?: string;
}

export interface DiagnosticUserInfo {
  'Patient UHID': string;
  'Patient Gender': string;
  'Patient Name': string;
  'Patient Age': number;
}

export interface DiagnosticLandingPage extends DiagnosticUserInfo {
  Serviceability: 'Yes' | 'No';
  Source?: string;
  'Circle user': 'Yes' | 'No';
}

export interface DiagnosticServiceble {
  'Patient UHID': string;
  State: string;
  City: string;
  'PinCode Entered': number;
}

export interface ConsultRoomDoctorPatientInfo {
  'Patient name': string;
  'Patient UHID': string;
  'Doctor Name': string;
  'Speciality name': string;
  'Doctor ID': string;
  'Speciality ID': string;
  'Patient Age': number;
  'Patient Gender': string;
  'Hospital Name': string;
  'Hospital City': string;
}

export interface AutoSelectLocation extends UserInfo {
  Serviceability: boolean;
  pincode: string;
}

export interface PatientInfoWithSource extends PatientInfo {
  Source: 'Home Screen' | 'Menu';
  Pincode?: String;
  Serviceability?: String;
}

export interface HdfcCustomerInfo {
  'Patient UHID': string;
  'Customer ID': string;
  'Patient Name': string;
  'Mobile Number': string;
  'Date of Birth': Date | string;
  Email: string;
}

interface SymptomTrackerPatientInfo {
  'Patient UHID': string;
  'Patient ID': string;
  'Patient Name': string;
  'Mobile Number': string;
  'Date of Birth': Date | string;
  Email: string;
  Relation: string;
}

interface CircleRenewalAttributes {
  'Patient Name': string;
  'Patient UHID': string;
  Relation: string;
  'Patient Age': number;
  'Patient Gender': string;
  'Mobile Number': string;
  'Customer ID': string;
  'Circle Member': 'Yes' | 'No';
  'Circle Plan': string;
  'Circle Start Date': Date | string;
  'Circle End Date': Date | string;
  Source: string;
  Platform: string;
  'Membership State': 'Expired' | 'About to Expire' | 'Not Expiring';
}

interface CircleRenewalSubscriptionAttributes {
  'Patient Name': string;
  'Patient UHID': string;
  Relation: string;
  'Patient Age': number;
  'Patient Gender': string;
  'Mobile Number': string;
  'Customer ID': string;
  'Circle Member': 'Yes' | 'No';
  'Circle Plan': string;
  'Circle Start Date': Date | string;
  'Circle End Date': Date | string;
  Source: string;
  Platform: string;
  Type: 'Direct Payment' | 'Direct by HC';
}

interface SymptomTrackerCompleteInfo {
  'Patient UHID': string;
  'Patient ID': string;
  'Patient Name': string;
  'Mobile Number': string;
  'Date of Birth': Date | string;
  Email: string;
  Relation: string;
  symptoms: {
    id?: string;
    name: string;
  }[];
  specialities: SymptomsSpecialities[];
}

export interface HdfcCustomerPlanInfo extends HdfcCustomerInfo {
  'Partner ID': string;
  HDFCMembershipLevel: HdfcPlan;
  HDFCMembershipState: 'Active' | 'Inactive';
}

export interface HdfcBenefitInfo {
  'User ID': string;
  Plan: HdfcPlan;
}

export interface PatientInfoWithConsultId extends PatientInfo {
  'Consult ID': string;
}

export interface PatientInfoWithNeedHelp extends PatientInfo {
  Source: 'Home Screen' | 'Medicines' | 'Tests' | 'My Account' | 'Doctor Search';
}

export interface SpecialityClickedEvent extends PatientInfo {
  'Speciality Name': string;
  'Speciality ID': string;
  User_Type: string;
  'Circle Member': boolean;
  'Circle Plan type': string;
  Source: string;
}

export interface ReorderMedicines extends PatientInfo {
  source: 'Order Details' | 'PHR' | 'Medicine Home';
}

export interface ConsultedBefore extends PatientInfo {
  ConsultedBefore: 'Yes' | 'No';
}

export interface ReorderMedicine extends PatientInfo {
  source: string;
  orderType: 'Cart' | 'Non Cart' | 'Offline';
  noOfItemsNotAvailable?: number;
}

export interface ItemSearchedOnLanding extends DiagnosticUserInfo {
  'Keyword Entered': string;
  '# Results appeared': number;
  'Item in Results'?: object[];
  Popular?: 'Yes' | 'No';
}

export interface ItemClickedOnLanding extends DiagnosticUserInfo {
  'Item Clicked': object;
}

export interface DiagnosticPinCode extends DiagnosticUserInfo {
  Mode: string;
  Pincode: number | string;
  Serviceability: 'Yes' | 'No';
}

export interface DoctorFilterClick {
  'Patient Name': string;
  'Patient UHID': string;
  'Mobile Number': string;
  pincode: number | string;
  'Filter Applied': string;
  'Filter Value': string;
}

export interface FollowUpAppointment {
  'Customer ID': string;
  'Patient Name': string;
  'Patient UHID': string;
  'Patient Age': number;
  'Doctor ID': string;
  'Doctor Name': string;
  'Speciality Name': string;
  'Speciality ID': string;
  'Doctor Category': DoctorType;
  'Consult Date Time': Date;
  'Consult Mode': 'Online' | 'Physical';
  'Doctor City': string;
  'Consult ID': string;
  isConsultStarted: boolean;
  Prescription: string;
}

export interface consultCallEndData {
  'Patient User ID': string;
  'Patient name': string;
  'Patient mobile number': string;
  'Appointment Date time': Date | null;
  'Appointment display ID': number | null;
  'Appointment ID': string;
  'Doctor Name': string;
  'Speciality Name': string;
  'Speciality ID': string;
  'Doctor Type': string;
  'Mode of Call': 'Audio' | 'Video';
  Platform: 'App';
  'Doctor ID': string;
  'Doctor Number': string;
  'Doctor Facility ID': string;
  'Doctor Facility': string;
  'Session ID': string;
  'Call ID': string;
}

interface consultLocation {
  'Patient Name': string;
  'Patient UHID': string;
  Relation: string;
  'Patient Age': number;
  'Patient Gender': string;
  'Mobile Number': string;
  'Customer ID': string;
  'User location': string;
  Screen: string;
  Platform: string;
  'Doctor details': any;
  Type: 'Auto Detect' | 'Manual entry';
}
export interface WebEngageEvents {
  // ********** AppEvents ********** \\

  [WebEngageEventName.MOBILE_ENTRY]: {};
  [WebEngageEventName.MOBILE_NUMBER_ENTERED]: { mobilenumber: string };
  [WebEngageEventName.OTP_ENTERED]: { value: YesOrNo };
  [WebEngageEventName.PRE_APOLLO_CUSTOMER]: { value: YesOrNo };
  [WebEngageEventName.OTP_VERIFICATION_SUCCESS]: {
    'Mobile Number': string;
  };
  [WebEngageEventName.OTP_ON_CALL_CLICK]: {
    'Mobile Number': string;
  };
  [WebEngageEventName.REGISTRATION_DONE]: {
    'Customer ID': string;
    'Customer First Name': string;
    'Customer Last Name': string;
    'Date of Birth': Date | string;
    Gender: string;
    Email: string;
    'Referral Code'?: string;
    'Mobile Number': string;
  };
  [WebEngageEventName.NUMBER_OF_PROFILES_FETCHED]: { count: number };
  [WebEngageEventName.ORDER_MEDICINES_IN_CONSULT_ROOM]: UserInfo;
  [WebEngageEventName.BOOK_TESTS_IN_CONSULT_ROOM]: UserInfo;

  // DOH Events \\
  [WebEngageEventName.DOH_Viewed]: DOHInfo;
  [WebEngageEventName.DOH_Clicked]: DOHInfo;

  [WebEngageEventName.Patient_API_Error]: {
    'Patient Name': string;
    'Patient ID': string;
    'Patient Number': string;
    'Doctor ID': string | null;
    'Screen Name': string;
    'API Name': string;
    'Error Name': any;
  };

  // ********** Home Screen Events ********** \\

  [WebEngageEventName.BUY_MEDICINES]: {
    Source: 'Home Screen' | 'Menu';
    Pincode?: String;
    Serviceability?: String;
    'Patient Name': string;
    'Patient UHID': string;
    Relation: string;
    'Patient Age': number;
    'Patient Gender': string;
    'Mobile Number': string;
    'Customer ID': string;
    'Circle Membership Added': 'Yes' | 'No' | 'Existing';
    'Circle Membership Value': number | null;
    User_Type?: PharmaUserStatus;
  };
  [WebEngageEventName.ORDER_TESTS]: PatientInfoWithSource;
  [WebEngageEventName.MANAGE_DIABETES]: PatientInfo;
  [WebEngageEventName.TRACK_SYMPTOMS]: PatientInfo;
  [WebEngageEventName.VIEW_HELATH_RECORDS]: PatientInfoWithSource;
  [WebEngageEventName.LEARN_MORE_ABOUT_CORONAVIRUS]: { clicked: true };
  [WebEngageEventName.CHECK_YOUR_RISK_LEVEL]: { clicked: true };
  [WebEngageEventName.APOLLO_KAVACH_PROGRAM]: { clicked: true };
  [WebEngageEventName.HDFC_HEALTHY_LIFE]: {
    HDFCMembershipState: 'Active' | 'Inactive';
    HDFCMembershipLevel: HdfcPlan;
    Circle_Member: 'Yes' | 'No';
    'Patient Name': string;
    'Patient UHID': string;
    Relation: string;
    'Patient Age': number;
    'Patient Gender': string;
    'Mobile Number': string;
    'Customer ID': string;
  };
  [WebEngageEventName.NOTIFICATION_ICON]: { clicked: true };
  [WebEngageEventName.ACTIVE_APPOINTMENTS]: { clicked: true };
  [WebEngageEventName.ACTIVE_PROHEALTH_APPOINTMENTS]: { clicked: true };
  [WebEngageEventName.NEED_HELP]: PatientInfoWithNeedHelp; // source values may change later
  [WebEngageEventName.TICKET_RAISED]: { Category: string; Query: string };
  [WebEngageEventName.HELP_TICKET_SUBMITTED]: {
    Source_Page: 'My Account' | 'My Orders' | 'Order Details';
    Reason: string;
    BU: string; //  Pharmacy / Consult / Diagnostics / ..........
    Order_Status?: string;
  };
  [WebEngageEventName.MY_ACCOUNT]: PatientInfo;
  [WebEngageEventName.BOOK_DOCTOR_APPOINTMENT]: {
    'Patient Name': string;
    'Patient UHID': string;
    Relation: string;
    'Patient Age': number;
    'Patient Gender': string;
    'Mobile Number': string;
    'Customer ID': string;
    'Circle Membership Added': 'Yes' | 'No' | 'Existing';
    'Circle Membership Value': number | null;
    User_Type: string;
  };
  [WebEngageEventName.TABBAR_APPOINTMENTS_CLICKED]: PatientInfoWithSource;
  [WebEngageEventName.PAST_DOCTOR_SEARCH]: {
    'Patient UHID': string;
    'Mobile Number': string;
    'Customer ID': string;
    'Past Searches': any;
  };

  // ********** PharmaCircleEvents ********** \\
  [WebEngageEventName.PHARMA_CIRCLE_BANNER_CLICKED]: CircleUserInfo;
  [WebEngageEventName.PHARMA_HOME_UPGRADE_TO_CIRCLE]: UserInfo;
  [WebEngageEventName.PHARMA_HOME_KNOW_MORE_CLICKED_CIRCLE_POPUP]: CircleUserInfo;
  [WebEngageEventName.PHARMA_PRODUCT_UPGRADE_TO_CIRCLE]: CircleUserInfo;
  [WebEngageEventName.PHARMA_PRODUCT_KNOW_MORE_CLICKED_CIRCLE_POPUP]: UserInfo;
  [WebEngageEventName.PHARMA_PRODUCT_ADD_TO_CART_CLICKED_CIRCLE_POPUP]: UserInfo;
  [WebEngageEventName.PHARMA_CART_KNOW_MORE_CLICKED_CIRCLE_POPUP]: UserInfo;
  [WebEngageEventName.PHARMA_CART_ADD_TO_CART_CLICKED_CIRCLE_POPUP]: UserInfo;
  [WebEngageEventName.PHARMA_CART_CIRCLE_MEMBERSHIP_REMOVED]: UserInfo;
  [WebEngageEventName.PHARMA_WEBVIEW_PLAN1]: UserInfo;
  [WebEngageEventName.PHARMA_WEBVIEW_PLAN2]: UserInfo;
  [WebEngageEventName.PHARMA_WEBVIEW_PLAN3]: UserInfo;
  [WebEngageEventName.PHARMA_WEBVIEW_PLAN_SELECTED]: UserInfo;
  [WebEngageEventName.PURCHASE_CIRCLE]: CirclePurchaseInfo;

  // ********** DiagnosticCircleEvents ********** \\
  [WebEngageEventName.DIAGNOSTICS_CIRCLE_BANNER_CLICKED]: CircleUserInfo;
  [WebEngageEventName.DIAGNOSTICS_BUY_NOW_CLICKED_CIRCLE_POPUP]: CircleUserInfo;
  [WebEngageEventName.DIAGNOSTICS_KNOW_MORE_CLICKED_CIRCLE_POPUP]: CircleUserInfo;
  [WebEngageEventName.DIAGNOSTIC_OTHER_PAYMENT_OPTION_CLICKED_POPUP]: CircleUserInfo;
  [WebEngageEventName.DIAGNOSTIC_CIRCLE_BENIFIT_APPLIED]: CircleUserInfo;

  // ********** MY Membership circle events ********
  [WebEngageEventName.MY_MEMBERSHIP_VIEW_DETAILS_CLICKED]: CircleUserInfo;
  [WebEngageEventName.MY_MEMBERSHIP_PHARMACY_CASHBACK_BENEFITS_CLICKED]: CircleUserInfo;
  [WebEngageEventName.MY_MEMBERSHIP_FREE_DELIVERY_CLICKED]: CircleUserInfo;
  [WebEngageEventName.MY_MEMBERSHIP_DOCTOR_HELPLINE_CLICKED]: CircleUserInfo;
  [WebEngageEventName.MY_MEMBERSHIP_DIAGNOSTICS_DISCOUNTS_CLICKED]: CircleUserInfo;
  [WebEngageEventName.MY_MEMBERSHIP_PRO_HEALTH_CLICKED]: CircleUserInfo;
  [WebEngageEventName.MY_MEMBERSHIP_DOC_ON_CALL_CLICKED]: CircleUserInfo;
  [WebEngageEventName.MY_MEMBERSHIP_ADVANCED_DIABETES_CLICKED]: CircleUserInfo;
  [WebEngageEventName.MY_MEMBERSHIP_COVID_CARE_CLICKED]: CircleUserInfo;
  [WebEngageEventName.MY_MEMBERSHIP_DIGITALIZATION_OF_PHR_CLICKED]: CircleUserInfo;
  [WebEngageEventName.MY_MEMBERSHIP_DIAGNOSTICS_HOME_SAMPLE_CLICKED]: CircleUserInfo;

  // **** HOMEPAGE BANNER ******
  [WebEngageEventName.COVID_BANNER_CLICKED]: UserInfo;
  [WebEngageEventName.NON_CIRCLE_HOMEPAGE_BANNER_CLICKED]: CircleUserInfo;
  [WebEngageEventName.MEMBERSHIP_DETAILS_BANNER_CLICKED]: CircleUserInfo;
  [WebEngageEventName.HOMEPAGE_DOC_ON_CALL_BANNER_CLICKED]: CircleUserInfo;
  [WebEngageEventName.NON_CIRCLE_HOMEPAGE_VIEWED]: CircleUserInfo;
  [WebEngageEventName.NON_CIRCLE_PLAN_SELECTED]: CircleUserInfo;
  [WebEngageEventName.NON_CIRCLE_BUY_NOW_CLICKED]: CircleUserInfo;
  [WebEngageEventName.NON_CIRCLE_PAYMENT_MODE_SELECTED]: CircleUserInfo;
  [WebEngageEventName.NON_CIRCLE_PAYMENT_DONE]: CircleUserInfo;
  [WebEngageEventName.HC_1CLICK_ACTIVATION]: CircleUserInfo;

  // ********** PermissionEvents ********** \\
  [WebEngageEventName.USER_ALLOWED_PERMISSION]: {
    screen: 'Payment Confirmation' | 'Home Screen' | 'Appointment Screen';
  };
  [WebEngageEventName.USER_DENIED_PERMISSION]: {
    screen: 'Payment Confirmation' | 'Home Screen' | 'Appointment Screen';
  };
  // ********** PharmacyEvents ********** \\

  [WebEngageEventName.SEARCH]: {
    keyword: string;
    Source: 'Pharmacy Home' | 'Pharmacy List' | 'Pharmacy PDP';
    resultsdisplayed: number;
    User_Type?: PharmaUserStatus;
  };
  [WebEngageEventName.SEARCH_ENTER_CLICK]: {
    keyword: string;
    numberofresults: number;
    source: string;
  };
  [WebEngageEventName.PHARMACY_SEARCH_RESULTS]: {
    keyword: string;
    Source: 'Pharmacy Home' | 'Pharmacy Search';
  };
  [WebEngageEventName.PRODUCT_DETAIL_PINCODE_CHECK]: {
    'product id': string; // (SKUID)
    'product name': string;
    'customer id': string;
    pincode: number;
    Serviceable: 'Yes' | 'No';
    'Delivery TAT': number;
  };
  [WebEngageEventName.PRODUCT_DETAIL_TAB_CLICKED]: {
    tabName: string;
  };
  [WebEngageEventName.NOTIFY_ME]: {
    'product name': string;
    'product id': string; // (SKUID)
    'category ID': string;
    price: number;
    pincode: string;
    serviceable: YesOrNo;
  };

  [WebEngageEventName.CATEGORY_CLICKED]: {
    'category name': string;
    'category ID': string;
    Source: 'Home' | 'Category Tree';
    'Section Name': string;
  };
  [WebEngageEventName.CATEGORY_FILTER_CLICKED]: {
    'category name': string;
    'category ID': string;
  };
  [WebEngageEventName.CATEGORY_FILTER_APPLIED]: {
    'category name': string;
    'category ID': string;
    discount: string;
    'sort by': string;
    price: string;
  };
  [WebEngageEventName.CATEGORY_LIST_GRID_VIEW]: {
    'Category name'?: string;
    'Category id'?: string;
    Type: 'Grid' | 'List';
    Source: 'Search' | 'Category';
  };
  [WebEngageEventName.SHOW_PRESCRIPTION_AT_STORE_SELECTED]: {
    value: boolean;
  };
  [WebEngageEventName.PHARMACY_STORE_PICKUP_VIEWED]: {
    Pincode: string;
    'Store display success': YesOrNo;
  };
  [WebEngageEventName.PHARMACY_STORE_SELECTED_SUCCESS]: {
    Pincode: string;
    'Store Id': string;
    'Store Name': string;
    'Store Number': string;
    'Store Address': string;
  };
  [WebEngageEventName.PHARMACY_ADD_TO_CART]: {
    'product name': string;
    'product id': string; // (SKUID)
    Price: number;
    'Discounted Price'?: number;
    Quantity: number;
    Source:
      | 'Pharmacy Home'
      | 'Pharmacy PDP'
      | 'Pharmacy List'
      | 'Pharmacy Partial Search'
      | 'Pharmacy Full Search'
      | 'Similar Widget'
      | 'Pharmacy Cart'
      | 'Category Tree';
    Brand?: string;
    'Brand ID'?: string;
    'category name'?: string;
    'category ID'?: string;
    Section?: string;
    'Section Name'?: string;
    af_revenue: number;
    af_currency: string;
    'Circle Membership Added': 'Yes' | 'No' | 'Existing';
    'Circle Membership Value': number | null;
    'Cart Items'?: string;
  };
  [WebEngageEventName.PHARMACY_ADD_TO_CART_NONSERVICEABLE]: {
    'product name': string;
    'product id': string;
    pincode: string;
    'Mobile Number': string;
  };

  [WebEngageEventName.PHARMACY_CART_VIEWED]: {
    'Customer ID': string;
    'Total items in cart': number;
    'Sub Total': number;
    'Delivery charge': number;
    'Coupon code used'?: string;
    'Total Discount': number;
    'Net after discount': number;
    'Prescription Needed?': boolean;
    'Cart ID'?: string;
    'Cart Items': object[];
    'Service Area': 'Pharmacy' | 'Diagnostic';
    'Circle Membership Added': 'Yes' | 'No' | 'Existing';
    'Circle Membership Value': number | null;
    User_Type?: PharmaUserStatus;
  };
  [WebEngageEventName.SKU_PRICE_MISMATCH]: {
    'Mobile Number': string;
    'Sku Id': string;
    'Magento MRP': number;
    'Magento Pack Size': number;
    'Store API MRP': number;
    'Price Change In Cart': 'Yes' | 'No';
  };

  [WebEngageEventName.TAT_API_FAILURE]: {
    pincode: string | number;
    lookUp: { sku: string; qty: number }[];
    error: object;
    'Cart Items'?: string;
  };
  [WebEngageEventName.PHARMACY_PROCEED_TO_PAY_CLICKED]: {
    'Total items in cart': number;
    'Sub Total': number;
    'Delivery charge': number;
    'Net after discount': number;
    'Prescription Needed?': boolean;
    'Cart ID'?: string; // we don't have cartId before placing order
    'Mode of Delivery': 'Home' | 'Pickup' | 'Home Visit' | 'Clinic Visit';
    'Delivery Date Time'?: string; // Optional (only if Home)
    'Pin Code': string | number;
    'Service Area': 'Pharmacy' | 'Diagnostic';
    'Store Id'?: string;
    'Store Name'?: string;
    'Popup Shown'?: boolean;
    'No. of out of stock items'?: number;
    'Circle Membership Added': 'Yes' | 'No' | 'Existing';
    'Circle Membership Value': number | null;
    'Cart Items'?: string;
    User_Type?: PharmaUserStatus;
    'Split Cart'?: YesOrNo;
    'Prescription Option selected'?: PrescriptionOptions;
    Shipment_1_Value?: number; // amount after discount
    Shipment_2_Value?: number;
    Shipment_1_Items?: number; // number of items
    Shipment_2_Items?: number;
  };
  [WebEngageEventName.PHARMACY_PAYMENT_INITIATED]: {
    'Payment mode': 'Online' | 'COD';
    Amount: number;
    'Service Area': 'Pharmacy' | 'Diagnostic';
    'Cart Items': string;
    Coupon: string;
  };
  [WebEngageEventName.UPLOAD_PRESCRIPTION_CLICKED]: {
    Source: 'Home' | 'Cart';
    User_Type?: PharmaUserStatus;
  };
  [WebEngageEventName.CART_UPLOAD_PRESCRIPTION_CLICKED]: {
    'Customer ID': string;
  };
  [WebEngageEventName.ITEMS_REMOVED_FROM_CART]: {
    'Product ID': string;
    'Customer ID': string;
    'Product Name': string;
    'No. of items': number;
  };
  [WebEngageEventName.CART_APPLY_COUPON_CLCIKED]: {
    'Customer ID': string;
    'Cart Items'?: string;
  };
  [WebEngageEventName.CART_COUPON_APPLIED]: {
    'Coupon Code': string;
    'Discounted amount': string | number;
    'Customer ID': string;
    'Cart Items': string;
  };
  [WebEngageEventName.UPLOAD_PRESCRIPTION_OPTION_SELECTED]: {
    OptionSelected: 'Search and add' | 'All Medicine' | 'Call me for details';
    User_Type?: PharmaUserStatus;
  };
  [WebEngageEventName.UPLOAD_PRESCRIPTION_ADDRESS_SELECTED]: {
    Serviceable: 'Yes' | 'No';
  };
  [WebEngageEventName.UPLOAD_PRESCRIPTION_NEW_ADDRESS]: {
    Serviceable: 'Yes' | 'No';
  };
  [WebEngageEventName.UPLOAD_PRESCRIPTION_SUBMIT_CLICKED]: {
    OptionSelected: 'Search and add' | 'All Medicine' | 'Call me for details';
    NumberOfPrescriptionClicked: number;
    NumberOfPrescriptionUploaded: number;
    NumberOfEPrescriptions: number;
    User_Type?: PharmaUserStatus;
  };
  [WebEngageEventName.UPLOAD_PRESCRIPTION_IMAGE_UPLOADED]: {
    Source: 'Take a Photo' | 'Choose Gallery' | 'E-Rx';
    'Upload Source'?: UploadPrescSource;
    User_Type?: PharmaUserStatus;
  };
  [WebEngageEventName.PHARMACY_SUBMIT_PRESCRIPTION]: {
    'Order ID': string | number;
    'Delivery type': 'home' | 'store pickup';
    StoreId?: string; //(incase of store delivery)
    'Delivery address'?: string;
    Pincode: string | number;
    User_Type?: PharmaUserStatus;
  };
  [WebEngageEventName.PHARMACY_CHECKOUT_COMPLETED]: {
    'Order ID': string | number;
    'Order Type': 'Cart' | 'Non Cart';
    'Prescription Required': boolean;
    'Prescription Added': boolean;
    'Shipping information': string; // (Home/Store address)
    'Total items in cart'?: number; // Optional
    'Grand Total'?: number; // Optional
    'Total Discount %'?: number; // Optional
    'Discount Amount'?: number; // Optional
    'Delivery charge'?: number; // Optional
    'Net after discount'?: number; // Optional
    'Payment status'?: number; // Optional
    'Payment Type'?: 'COD' | 'Prepaid'; // Optional
    'Cart ID'?: string | number; // Optional
    'Service Area': 'Pharmacy' | 'Diagnostic';
    'Mode of Delivery'?: 'Home' | 'Pickup';
    'Store Id'?: string;
    'Store Name'?: string;
    'Store Number'?: string;
    'Store Address'?: string;
    af_revenue: number;
    af_currency: string;
    'Circle Membership Added': 'Yes' | 'No' | 'Existing';
    'Circle Membership Value': number | null;
    'Circle Cashback amount': number;
    'Cart Items': string;
    User_Type?: PharmaUserStatus;
    'Split Cart'?: YesOrNo;
    'Prescription Option selected'?: PrescriptionOptions;
    TransactionId?: string | number;
  };
  [WebEngageEventName.PHARMACY_DETAIL_IMAGE_CLICK]: {
    'Product ID': string;
    'Product Name': string;
  };
  [WebEngageEventName.PHARMACY_AUTO_SELECT_LOCATION_CLICKED]: AutoSelectLocation;
  [WebEngageEventName.PHARMACY_ENTER_DELIVERY_PINCODE_CLICKED]: UserInfo;
  [WebEngageEventName.PHARMACY_ENTER_DELIVERY_PINCODE_SUBMITTED]: {
    'Patient UHID': string;
    'Mobile Number': string;
    'Customer ID': string;
    Serviceable: string;
    Keyword: string;
    Source: string;
  };
  [WebEngageEventName.PHARMACY_PINCODE_NONSERVICABLE]: {
    'Mobile Number': string;
    Pincode: string;
    Servicable: boolean;
  };
  [WebEngageEventName.PHARMACY_BANNER_CLICK]: {
    BannerPosition: number;
  };
  [WebEngageEventName.CALL_THE_NEAREST_PHARMACY]: {
    pincode: string;
    'Mobile Number': string;
  };

  // ********** Diagnostic Events *******

  [WebEngageEventName.DIAGNOSTIC_LANDING_PAGE_VIEWED]: DiagnosticLandingPage;
  [WebEngageEventName.DIAGNOSTIC_LANDING_ITEM_SEARCHED]: ItemSearchedOnLanding;
  [WebEngageEventName.DIAGNOSTIC_ITEM_SEARCHED]: ItemSearchedOnLanding;
  [WebEngageEventName.DIAGNOSTIC_MY_ORDERS]: {
    //comment
    'Patient UHID': string;
    'Active Orders': number;
    'Past Orders': number;
  };
  [WebEngageEventName.DIAGNOSTIC_ADDRESS_NON_SERVICEABLE_CARTPAGE]: {
    'Patient UHID': string;
    State: string;
    City: string;
    PinCode: number;
    'Number of items in cart': number;
    'Items in cart': object[];
  };
  [WebEngageEventName.DIAGNOSTIC_ORDER_SUMMARY_VIEWED]: {
    'Order amount': string | number;
    'Order id': string;
    'Order status'?: string;
  };
  [WebEngageEventName.DIAGNOSTIC_PINCODE_ENTERED_ON_LOCATION_BAR]: DiagnosticPinCode;
  [WebEngageEventName.DIAGNOSTIC_HOME_PAGE_WIDGET_CLICKED]: {
    'Item Name'?: string;
    'Item ID'?: string;
    Source: 'Home Page';
    'Section Name': string;
    'Category Name'?: string;
  };
  [WebEngageEventName.DIAGNOSTIC_TEST_DESCRIPTION]: {
    Source:
      | 'Full Search'
      | 'Home Page'
      | 'Cart page'
      | 'Partial Search'
      | 'Deeplink'
      | 'Popular search'
      | 'Category page';
    'Item Name': string;
    'Item Type'?: string;
    'Item Code': string;
    'Patient Name': string;
    'Patient UHID': string;
    'Item ID': string | number;
    'Item Price'?: number | string;
    'Circle user'?: string;
  };

  [WebEngageEventName.DIAGNOSTIC_CART_VIEWED]: {
    //this is already done
    'Total items in cart': number;
    'Prescription Needed?': 'Yes' | 'No';
    'Delivery charge'?: number;
    'Coupon code used'?: string;
    'Total Discount': number;
    'Net after discount': number; //item total
    'Cart Items': object[];
    Pincode: string | number;
    UHID: string;
  };
  [WebEngageEventName.DIAGNOSTIC_AREA_SELECTED]: {
    'Address Pincode': number;
    'Area Selected': string;
  };
  [WebEngageEventName.DIAGNOSTIC_APPOINTMENT_TIME_SELECTED]: {
    'Address Pincode': number;
    'Area Selected': string;
    'Time Selected': string;
    'Slot selected': 'Manual' | 'Automatic';
    'Slot available': 'Yes' | 'No';
    UHID: string;
  };
  [WebEngageEventName.DIAGNOSTIC_PROCEED_TO_PAY_CLICKED]: {
    'Patient Name selected': string;
    'Total items in cart': number;
    'Sub Total': number;
    // 'Delivery charge': number;
    'Net after discount': number;
    'Prescription Uploaded?': boolean;
    'Prescription Mandatory?': boolean;
    'Mode of Sample Collection': 'Home Visit' | 'Clinic Visit';
    'Pin Code': string | number;
    'Service Area': 'Pharmacy' | 'Diagnostic';
    'Area Name': string;
    'Area id': string | number;
    'Home collection charges'?: number;
    Discount?: number;
    'Collection Time Slot': string;
  };
  [WebEngageEventName.DIAGNOSTIC_TRACK_ORDER_VIEWED]: {
    'Patient UHID': string;
    'Patient Name': string;
    'Latest Order Status': string;
    'Order id': string;
    Source: 'Home' | 'My Order' | 'Track Order' | 'Order Summary';
  };
  [WebEngageEventName.DIAGNOSTIC_VIEW_REPORT_CLICKED]: {
    'Order id'?: string;
    Source: 'Home' | 'My Order' | 'Track Order' | 'Order Summary';
    'Report generated': 'Yes' | 'No';
    'Action taken':
      | 'View Report'
      | 'Download Report PDF'
      | 'Share on Whatsapp'
      | 'Copy Link to PDF';
  };
  [WebEngageEventName.DIAGNOSTIC_FEEDBACK_GIVEN]: {
    'Patient UHID': string;
    'Patient Name': string;
    Rating: string | number;
    'Thing to Improve selected': string;
  };
  [WebEngageEventName.DIAGNOSTIC_ADD_TO_CART]: {
    'Item Name': string;
    'Item ID': string; // (SKUID)
    Source: DIAGNOSTIC_ADD_TO_CART_SOURCE_TYPE;
    Section?: string;
    'Circle user' : string; 
  };
  [WebEngageEventName.DIAGNOSTIC_CHECKOUT_COMPLETED]: {
    'Order id': string | number;
    Pincode: string | number;
    'Patient UHID': string;
    'Order amount': number; // Optional
    'Payment mode'?: 'Cash' | 'Prepaid'; // Optional
    'Circle discount'?: number;
    'Appointment Date'?: string;
    'Appointment time'?: string;
    'Item ids'?: any;
    'Total items in order': number;
    'Payment type'?: string; //for prepaid
    'Circle user': 'Yes' | 'No';
  };
  [WebEngageEventName.PAYMENT_INITIATED]: {
    Amount: number;
    LOB: string;
    type?: string;
    paymentOrderId: string;
  };
  [WebEngageEventName.PAYMENT_STATUS]: {
    status: string;
    LOB: string;
    paymentOrderId: string;
  };
  [WebEngageEventName.DIAGNOSITC_HOME_PAGE_BANNER_CLICKED]: {
    position: number;
    itemId: number;
    'Banner title': string;
  };
  [WebEngageEventName.DIAGNOSTIC_ADDRESS_SELECTED_CARTPAGE]: {
    'Selection type': 'New' | 'Existing';
    Serviceability: 'Yes' | 'No';
    Pincode: string | number;
    Source: 'Home page' | 'Cart page';
  };
  [WebEngageEventName.DIAGNOSTIC_ITEM_REMOVE_ON_CARTPAGE]: {
    'Item ID': string | number;
    'Item name': string;
    Pincode: string | number;
    Mode: 'Customer' | 'Automated';
  };
  [WebEngageEventName.DIAGNOSTIC_ITEM_ADD_ON_CARTPAGE]: {
    'Item ID'?: string | number;
    'Item name'?: string;
    Pincode: string | number;
  };
  [WebEngageEventName.DIAGNOSTIC_ORDER_RESCHEDULE]: {
    'Reschedule reason': string;
    'Slot Time': string;
    'Slot Date': string;
    'Order id': string;
  };
  [WebEngageEventName.DIAGNOSTIC_PAYMENT_PAGE_VIEWED]: {
    UHID: string;
    'Order amount': number;
  };
  [WebEngageEventName.DIAGNOSTIC_PHLEBO_FEEDBACK_SUBMITTED]: {
    Rating: string | number;
    Feedback: string | number;
    'Phlebo Name': string;
    'Order id': string | number;
    'Phlebo id': string | number;
    Comment?: string 
  };
  [WebEngageEventName.DIAGNOSTIC_PHLEBO_CALLING_CLICKED]: {
    UHID: string;
    'Order id': string | number;
    'Phlebo Name': string;
  };
  [WebEngageEventName.DIAGNOSTIC_ORDER_STATUS]: {
    'Display id': string;
    'Order id': string;
    'Order status': string;
    'Patient Name': string;
    'Payment Mode': 'Cash' | 'Prepaid';
    SlotTimeInUTC: string | Date;
    'Total price': string | number;
    UHID: string;
  };
  [WebEngageEventName.DIAGNOSTIC_TRACK_PHLEBO_CLICKED]: {
    'Order id': string | number;
    UHID: string;
    'Link opened': 'Yes' | 'No';
    Source: 'Home' | 'My Order' | 'Track Order' | 'Order Summary';
  };
  [WebEngageEventName.DIGNOSTIC_PAYMENT_ABORTED]: {
    'Order id': string;
    UHID: string;
  };
  [WebEngageEventName.DIAGNOSITC_MODIFY_CLICKED]: {
    UHID: string;
    'Order id': string;
    'Order status': string;
  };
  [WebEngageEventName.DIAGNOSTIC_MODIFY_ORDER]: {
    'No of items Added': number;
    'Item ids in array': string;
    'Old order value': number;
    'updated order value': number;
    'HC charge updated': 'Yes' | 'No';
    'payment mode': 'Prepaid' | 'Cash';
    'time of modification': string | Date;
  };

  // ********** ConsultEvents ********** \\
  [WebEngageEventName.UPLOAD_RECORDS_CLICK_CHATROOM]: ConsultRoomDoctorPatientInfo;
  [WebEngageEventName.TAKE_PHOTO_CLICK_CHATROOM]: ConsultRoomDoctorPatientInfo;
  [WebEngageEventName.GALLERY_UPLOAD_PHOTO_CLICK_CHATROOM]: ConsultRoomDoctorPatientInfo;
  [WebEngageEventName.UPLOAD_PHR_CLICK_CHATROOM]: ConsultRoomDoctorPatientInfo;
  [WebEngageEventName.APOLLO_DOCTOR_TAB_CLICKED]: UserInfo;
  [WebEngageEventName.DOCTOR_CONNECT_TAB_CLICKED]: UserInfo;
  [WebEngageEventName.CONSULT_PAYMENT_MODE_SELECTED]: {
    'Payment Mode': string;
    User_Type: string;
  };
  [WebEngageEventName.PAYMENT_FAILED_AND_CONVERTED_TO_COD]: {
    'Payment failed order id': string;
    'Payment Success Order Id'?: string;
    status: boolean;
  };
  [WebEngageEventName.DOCTOR_SEARCH]: {
    'Search Text': string;
    'Patient Name': string;
    'Patient UHID': string;
    Relation: string;
    'Patient Age': number;
    'Patient Gender': string;
    'Mobile Number': string;
    'Customer ID': string;
    User_Type: string;
  };
  [WebEngageEventName.DOCTOR_LISTING_FILTER_APPLIED]: DoctorFilterClick;
  [WebEngageEventName.SPECIALITY_CLICKED]: SpecialityClickedEvent;
  [WebEngageEventName.BOOK_APPOINTMENT]: {
    'Doctor Name': string;
    'Doctor City': string;
    'Type of Doctor': DoctorType;
    'Doctor Specialty': string;
    Source: 'Profile' | 'Listing';
    'Patient Name': string;
    'Patient UHID': string;
    Relation: string;
    'Patient Age': number;
    'Patient Gender': string;
    'Mobile Number': string;
    'Customer ID': string;
    'Doctor ID': string;
    'Speciality ID': string;
    'Hospital Name': string;
    'Hospital City': string;
    'Secretary Name': string;
    'Secretary Mobile Number': string;
    'Doctor Mobile Number': string;
    User_Type: string;
  };
  [WebEngageEventName.TYPE_OF_CONSULT_SELECTED]: {
    'Consultation Type': string;
    'Patient Name': string;
    'Patient UHID': string;
    'Doctor ID': string;
    'Speciality ID': string;
    'Doctor Speciality': string;
    Relation: string;
    'Patient Age': number;
    'Patient Gender': string;
    'Customer ID': string;
  };
  [WebEngageEventName.DOCTOR_CLICKED]: {
    'Doctor Name': string;
    Source: 'List' | 'Search';
    'Doctor ID': string;
    'Speciality ID'?: string;
    'Doctor Category': DoctorType;
    Fee: number;
    'Doctor Speciality': string;
    Rank: number;
    Is_TopDoc?: YesOrNo;
    User_Type: string;
  };
  [WebEngageEventName.DOCTOR_CARD_CONSULT_CLICK]: {
    'Patient Name': string;
    'Doctor ID': string;
    'Speciality ID': string;
    'Doctor Speciality': string;
    'Doctor Experience': number;
    'Language Known'?: string;
    'Hospital Name': string;
    'Hospital City': string | null;
    'Availability Minutes': number;
    Source: 'List' | 'Profile';
    'Patient UHID': string;
    Relation: string;
    'Patient Age': number;
    'Patient Gender': string;
    'Customer ID': string;
    Rank?: number;
    User_Type: string;
  };
  [WebEngageEventName.DOCTOR_CONNECT_CARD_CLICK]: {
    Fee: number;
    'Doctor Speciality': string;
    'Doctor Name': string;
    Source: 'List' | 'Profile';
    'Language known': string;
  };
  [WebEngageEventName.CONSULTED_WITH_DOCTOR_BEFORE]: ConsultedBefore;
  [WebEngageEventName.DOCTOR_SPECIALITY_SEARCH_NO_RESULT]: {
    'Text Searched': string;
    'Patient name': string;
    'Patient UHID': string;
    Relation: string;
    'Patient Age': number;
    'Patient Gender': string;
  };
  [WebEngageEventName.CONSULT_NOW_CLICKED]: {
    'Language Known': string; // Comma separated values
    Source: 'List' | 'Profile'; // List/Profile
    'Doctor Speciality': string;
    'Available in Minutes'?: number;
    'Consult Mode': 'Online' | 'Physical';
    specialisation: string;
    'Doctor Experience': number;
    'Consult Date Time': Date;
    'Doctor ID': string;
    'Doctor Name': string;
    'Speciality ID': string;
    'Hospital Name': string;
    'Hospital City': string;
    'Patient Name': string;
    'Patient UHID': string;
    Relation: string;
    'Patient Age': number;
    'Patient Gender': string;
    'Customer ID': string;
    User_Type: string;
  };
  [WebEngageEventName.CONSULT_TYPE_SELECTION]: {
    'Consult Type': 'Online' | 'In Person';
    'Doctor ID': string;
    'Doctor Name': string;
    'Patient Name': string;
    'Patient UHID': string;
    'Mobile Number': string;
    'Customer ID': string;
  };
  [WebEngageEventName.HOMEPAGE_WIDGET_FOLLOWUP_CLICK]: {
    'Doctor ID': string;
    'Speciality ID': string;
    'Hospital City': string;
    'Consult Mode': string;
    'Doctor Speciality': string;
    'Customer ID': string;
    'Patient Name': string;
    'Patient Age': number;
    'Patient Gender': string;
    'Patient UHID': string;
  };

  //chat room
  [WebEngageEventName.PATIENT_SENT_CHAT_MESSAGE_POST_CONSULT]: {
    'Doctor Name': string;
    'Speciality Name': string;
    'Speciality ID': string;
    'Doctor Category': DoctorType;
    'Consult Date Time': Date;
    'Consult Mode': 'Online' | 'Physical';
    'Hospital Name': string;
    'Hospital City': string;
    'Consult ID': string;
    'Patient Name': string;
    'Patient UHID': string;
    Relation: string;
    'Patient Age': number;
    'Patient Gender': string;
    'Customer ID': string;
    'Secretary Name': string;
    'Secretary Mobile Number': string;
    'Doctor Mobile Number': string;
    'Doctor ID': string;
    'Display ID': number;
    'Chat Format': 'PDF' | 'Image' | 'Text';
  };
  [WebEngageEventName.PATIENT_EXTERNAL_MEETING_LINK_CLICKED]: {
    'Doctor name': string;
    'Patient name': string;
    'Patient ID': string;
    'Doctor ID': string;
    'Appointment ID': string;
    'Link URL': string;
    'Doctor number': string;
    'Patient number': string;
    'Solution Used': string;
  };
  [WebEngageEventName.CHAT_WITH_DOCTOR]: {
    'Doctor Name': string;
    'Speciality Name': string;
    'Speciality ID': string;
    'Doctor Category': DoctorType;
    'Consult Date Time': Date;
    'Consult Mode': 'Online' | 'Physical';
    'Hospital Name': string;
    'Hospital City': string;
    'Consult ID': string;
    'Patient Name': string;
    'Patient UHID': string;
    Relation: string;
    'Patient Age': number;
    'Patient Gender': string;
    'Customer ID': string;
    'Secretary Name': string;
    'Secretary Mobile Number': string;
    'Doctor Mobile Number': string;
    'Doctor ID': string;
    'Display ID': number;
    'Chat Format': 'PDF' | 'Image' | 'Text';
  };
  // confirm the type of data for the below
  [WebEngageEventName.CONSULT_SCHEDULE_FOR_LATER_CLICKED]: {
    'Consult Mode': 'Online' | 'Physical';
    specialisation: string;
    'Doctor Experience': number;
    'Consult Date Time': Date;
    'Doctor ID': string;
    'Doctor Name': string;
    'Speciality ID': string;
    'Hospital Name': string;
    'Hospital City': string;
    'Patient Name': string;
    'Patient UHID': string;
    Relation: string;
    'Patient Age': number;
    'Patient Gender': string;
    'Customer ID': string;
  };
  [WebEngageEventName.CONSULT_SLOT_SELECTED]: {
    doctorName: string;
    specialisation: string;
    experience: number;
    'language known': string; // Comma separated values
    'Consult Mode': 'Online' | 'Physical';
    'Doctor ID': string;
    'Speciality ID': string;
    'Patient UHID': string;
    'Consult Date Time': Date;
  };
  [WebEngageEventName.CONSULT_COUPON_APPLIED]: {
    CouponCode: string;
    'Net Amount'?: number;
    'Discount Amount'?: number;
    'Coupon Applied': boolean;
  };
  [WebEngageEventName.PAY_BUTTON_CLICKED]: {
    Amount: number;
    'Doctor Name': string;
    'Doctor City': string;
    'Type of Doctor': DoctorType;
    'Doctor Specialty': string;
    // 'Appointment Date': string;
    // 'Appointment Time': string;
    'Actual Price': number;
    'Discount used ?': boolean;
    'Discount coupon'?: string;
    'Discount Amount': number;
    'Net Amount': number;
    'Customer ID': string;
    'Patient Name': string;
    'Patient Age': number;
    'Patient Gender': string;
    'Patient UHID': string;
    consultType: 'clinic' | 'online';
    'Doctor ID': string;
    'Speciality ID': string;
    'Hospital Name': string;
    'Hospital City': string;
    'Consult Date Time': Date;
    User_Type: string;
    'Booking value': number;
    'Booking Fee': string;
  };
  [WebEngageEventName.CONSULTATION_BOOKED]: {
    'Consult ID': string;
    'Display ID'?: string;
    name: string;
    specialisation: string;
    category: string;
    // time: Date | string;
    'Patient Name': string;
    'Patient UHID': string;
    Relation: string;
    'Patient Age': number;
    'Patient Gender': string;
    'Customer ID': string;
    'Speciality ID': string;
    'Consult Date Time': Date;
    'Consult Mode': 'Online' | 'Physical';
    'Hospital Name': string;
    'Hospital City': string;
    'Doctor ID': string;
    'Doctor Name': string;
    'Net Amount': number;
    af_revenue: number;
    af_currency: string;
    'Dr of hour appointment'?: YesOrNo;
    'Circle discount': number;
    User_Type: string;
  };
  [WebEngageEventName.CONSULT_FEEDBACK_GIVEN]: {
    'Doctor Name': string;
    'Speciality Name': string;
    'Speciality ID': string;
    'Doctor Category': DoctorType;
    'Consult Date Time': Date;
    'Consult Mode': 'Online' | 'Physical';
    'Hospital Name': string;
    'Hospital City': string;
    'Consult ID': string;
    'Patient Name': string;
    'Patient UHID': string;
    Relation: string;
    'Patient Age': number;
    'Patient Gender': string;
    'Customer ID': string;
    // Type: 'Consult' | 'Medicine' | 'Diagnostics';
    Rating: string;
    'Rating Reason': string;
  };
  [WebEngageEventName.PHARMACY_FEEDBACK_GIVEN]: {
    'Patient UHID': string;
    // Type: 'Consult' | 'Medicine' | 'Diagnostics';
    Rating: string;
    'Rating Reason': string;
  };
  [WebEngageEventName.MY_ORDERS_CLICKED]: {
    Source: 'Pharmacy Home' | 'Diagnostics' | 'My Account';
    'Customer ID': string;
    'Mobile Number': string;
  };
  [WebEngageEventName.ORDER_SUMMARY_CLICKED]: {
    orderId: string;
    orderDate: string;
    orderType: 'Non Cart' | 'Cart' | 'Offline';
    customerId: string;
    deliveryDate: string;
    mobileNumber: string;
    orderStatus: MEDICINE_ORDER_STATUS;
  };
  [WebEngageEventName.PHARMACY_MY_ORDER_TRACKING_CLICKED]: {
    'Customer ID': string;
    'Mobile Number': string;
    'Order ID': string;
    'Order Type': 'Cart' | 'Non Cart';
    'Order Status': MEDICINE_ORDER_STATUS; //Order Initiated / Payment Success / Orders Placed, etc.
    'Order Date': Date;
    'Delivery Date'?: Date; // TAT Promised
  };
  [WebEngageEventName.PHARMACY_ADD_NEW_ADDRESS_CLICK]: {
    Source: 'My Account' | 'Upload Prescription' | 'Cart' | 'Diagnostics Cart';
  };
  [WebEngageEventName.PHARMACY_ADD_NEW_ADDRESS_COMPLETED]: {
    Source: 'My Account' | 'Upload Prescription' | 'Cart' | 'Diagnostics Cart';
    Success?: YesOrNo; // Yes / No (If Error message shown because it is unservicable)
    'Delivery address': string;
    Pincode: string;
    'TAT Displayed'?: Date;
    'Delivery TAT'?: number;
  };
  [WebEngageEventName.PHARMACY_CART_ADDRESS_SELECTED_SUCCESS]: {
    'TAT Displayed'?: Date;
    'Delivery Successful': YesOrNo; // Yes / No (If Error message shown because it is unservicable)
    'Delivery Address': string;
    Pincode: string;
    'Delivery TAT': number;
    TAT_Hrs: number;
    'Circle Membership Added': 'Yes' | 'No' | 'Existing';
    'Circle Membership Value': number | null;
    User_Type?: PharmaUserStatus;
    'Split Cart': YesOrNo;
    'Cart Items': string;
    Shipment_1_TAT?: Date;
    Shipment_2_TAT?: Date;
    Shipment_1_Value?: number; // amount after discount
    Shipment_2_Value?: number;
    Shipment_1_Items?: number; // number of items
    Shipment_2_Items?: number;
    Shipment_1_Site_Type?: SiteType;
    Shipment_2_Site_Type?: SiteType;
  };

  [WebEngageEventName.PHARMACY_CART_ADDRESS_SELECTED_FAILURE]: {
    'TAT Displayed'?: string;
    'Delivery Successful': YesOrNo; // Yes / No (If Error message shown because it is unservicable)
    'Delivery Address': string;
    Pincode: string;
  };

  [WebEngageEventName.PHARMACY_AVAILABILITY_API_CALLED]: {
    Source: 'PDP' | 'Add_Search' | 'Add_Display' | 'Cart';
    Input_SKU: string;
    Input_Pincode: string;
    Input_MRP: number;
    No_of_items_in_the_cart: number;
    Response_Exist: YesOrNo;
    Response_MRP: number;
    Response_Qty: number;
    'Cart Items'?: string;
  };

  [WebEngageEventName.PHARMACY_TAT_API_CALLED]: {
    'Nav src': 'PDP' | 'Cart';
    'Input SKU': string;
    'Input qty': number;
    'Input lat': number;
    'Input long': number;
    'Input pincode': string;
    'Input MRP': number;
    'No of items in the cart': number;
    'Response exist': YesOrNo;
    Response_MRP: number;
    'Response qty': number;
    'Response lat': number;
    'Response long': number;
    'Response order time': number;
    'Response pincode': string;
    'Response store code': string;
    'Response store type': string;
    'Response TAT': string;
    'Response TATU': number;
  };

  [WebEngageEventName.PHARMACY_CART_SELECT_DELIVERY_ADDRESS_CLICKED]: {
    'Customer ID': string;
    'Cart Items'?: string;
  };

  [WebEngageEventName.PHARMACY_CART_UPLOAD_PRESCRIPTION_CLICKED]: {
    'Customer ID': string;
  };

  [WebEngageEventName.PHARMACY_POST_CART_PAGE_VIEWED]: {
    'Payment status': 'Success' | 'Payment Failed' | 'Payment Aborted' | 'Payment Status Not Known';
    'Payment Type': 'COD' | 'Cashless' | 'No Payment';
    'Transaction ID': number | string;
    'Order ID(s)': number | string;
    'MRP Total': number;
    'Discount Amount': number;
    'Payment Instrument': string;
    'Order Type': string;
    'Shipping Charges': number;
    'Circle Member': boolean;
    'Substitution Option Shown': YesOrNo;
  };

  [WebEngageEventName.PHARMACY_ORDER_SUBSTITUTE_OPTION_CLICKED]: {
    'Transaction ID': number | string;
    'Order ID(s)': number | string;
    'Substitute Action Taken': 'Agree' | 'Disagree';
  };

  // ********** Health Records ********** \\

  [WebEngageEventName.CONSULT_RX]: PatientInfo;

  [WebEngageEventName.MEDICAL_RECORDS]: PatientInfo;

  [WebEngageEventName.ADD_RECORD]: {
    Source:
      | 'Doctor Consultation'
      | 'Test Report'
      | 'Hospitalization'
      | 'Health Condition'
      | 'Bill'
      | 'Insurance'
      | 'Vaccination'; // List/Profile
  };

  [WebEngageEventName.UPLOAD_PRESCRIPTION]: PatientInfo;

  [WebEngageEventName.UPLOAD_PHOTO]: {
    Source: 'Take Photo' | 'Gallery'; // List/Profile
  };

  [WebEngageEventName.ITEMS_CLICKED]: {
    Source: 'Consult & RX' | 'Medical Records'; // List/Profile
    Type: 'Prescription' | 'Test Result';
  };

  [WebEngageEventName.PHR_ORDER_MEDS_TESTS]: PatientInfoWithConsultId;

  [WebEngageEventName.PHR_CONSULT_CARD_CLICK]: PatientInfoWithConsultId;

  [WebEngageEventName.RE_ORDER_MEDICINE]: ReorderMedicine;

  // ********** ConsultRoom Events ********** \\

  [WebEngageEventName.CONSULTATION_CANCELLED_BY_CUSTOMER]: {
    'Speciality Name': string;
    'Speciality ID': string;
    'Doctor Category': DoctorType;
    'Consult Date Time': Date;
    'Consult Mode': 'Online' | 'Physical';
    'Hospital Name': string;
    'Hospital City': string;
    'Consult ID': string;
    'Patient Name': string;
    'Patient UHID': string;
    Relation: string;
    'Patient Age': number;
    'Patient Gender': string;
    'Mobile Number': string;
    'Customer ID': string;
    'Secretary Name': string;
    'Secretary Mobile Number': string;
    'Doctor Mobile Number': string;
  };

  [WebEngageEventName.CONSULTATION_RESCHEDULED_BY_CUSTOMER]: {
    'Doctor Name': string;
    'Speciality Name': string;
    'Speciality ID': string;
    'Doctor Category': DoctorType;
    'Consult Date Time': Date;
    'Consult Mode': 'Online' | 'Physical';
    'Hospital Name': string;
    'Hospital City': string;
    'Consult ID': string;
    'Patient Name': string;
    'Patient UHID': string;
    Relation: string;
    'Patient Age': number;
    'Patient Gender': string;
    'Customer ID': string;
    'Secretary Name': string;
    'Secretary Mobile Number': string;
    'Doctor Mobile Number': string;
  };
  [WebEngageEventName.FILL_MEDICAL_DETAILS]: {
    'Doctor Name': string;
    'Doctor Speciality': string;
    'Consult Date Time': Date;
    'Consult Mode': 'Online' | 'Physical';
    'Consult ID': string;
    'Patient Name': string;
    'Patient UHID': string;
    Relation: string;
    'Patient Age': number;
    'Patient Gender': string;
    'Customer ID': string;
  };
  [WebEngageEventName.COMPLETED_AUTOMATED_QUESTIONS]: {
    'Doctor Name': string;
    'Doctor Speciality': string;
    'Consult Date Time': Date;
    'Consult Mode': 'Online' | 'Physical';
    'Consult ID': string;
    'Patient Name': string;
    'Patient UHID': string;
    Relation: string;
    'Patient Age': number;
    'Patient Gender': string;
    'Customer ID': string;
  };
  [WebEngageEventName.JD_COMPLETED]: {
    'Doctor Name': string;
    'Doctor Speciality': string;
    'Consult Date Time': Date;
    'Consult Mode': 'Online' | 'Physical';
    'Consult ID': string;
    'Patient Name': string;
    'Patient UHID': string;
    Relation: string;
    'Patient Age': number;
    'Patient Gender': string;
    'Customer ID': string;
  };
  [WebEngageEventName.CONTINUE_CONSULT_CLICKED]: {
    'Doctor Name': string;
    'Speciality Name': string;
    'Speciality ID': string;
    'Doctor Category': DoctorType;
    'Consult Date Time': Date;
    'Consult Mode': 'Online' | 'Physical';
    'Hospital Name': string;
    'Hospital City': string;
    'Consult ID': string;
    'Patient Name': string;
    'Patient UHID': string;
    Relation: string;
    'Patient Age': number;
    'Patient Gender': string;
    'Customer ID': string;
  };
  [WebEngageEventName.CONSULT_CARD_CLICKED]: {
    'Doctor Name': string;
    'Speciality Name': string;
    'Speciality ID': string;
    'Doctor Category': DoctorType;
    'Consult Date Time': Date;
    'Consult Mode': 'Online' | 'Physical';
    'Hospital Name': string;
    'Hospital City': string;
    'Consult ID': string;
    'Patient Name': string;
    'Patient UHID': string;
    Relation: string;
    'Patient Age': number;
    'Patient Gender': string;
    'Customer ID': string;
  };
  [WebEngageEventName.RESCHEDULE_CLICKED]: {
    'Doctor Name': string;
    'Speciality Name': string;
    'Speciality ID': string;
    'Doctor Category': DoctorType;
    'Consult Date Time': Date;
    'Consult Mode': 'Online' | 'Physical';
    'Hospital Name': string;
    'Hospital City': string;
    'Consult ID': string;
    'Patient Name': string;
    'Patient UHID': string;
    Relation: string;
    'Patient Age': number;
    'Patient Gender': string;
    'Customer ID': string;
    'Secretary Name': string;
    'Secretary Mobile Number': string;
    'Doctor Mobile Number': string;
  };
  [WebEngageEventName.CONTINUE_CONSULTATION_CLICKED]: {
    'Doctor Name': string;
    'Speciality Name': string;
    'Speciality ID': string;
    'Doctor Category': DoctorType;
    'Consult Date Time': Date;
    'Consult Mode': 'Online' | 'Physical';
    'Hospital Name': string;
    'Hospital City': string;
    'Consult ID': string;
    'Source Screen': string;
    'Patient Name': string;
    'Patient UHID': string;
    Relation: string;
    'Patient Age': number;
    'Patient Gender': string;
    'Customer ID': string;
    'Secretary Name': string;
    'Secretary Mobile Number': string;
    'Doctor Mobile Number': string;
  };
  [WebEngageEventName.CANCEL_CONSULTATION_CLICKED]: {
    'Doctor Name': string;
    'Speciality Name': string;
    'Speciality ID': string;
    'Doctor Category': DoctorType;
    'Consult Date Time': Date;
    'Consult Mode': 'Online' | 'Physical';
    'Hospital Name': string;
    'Hospital City': string;
    'Consult ID': string;
    'Source Screen': string;
    'Patient Name': string;
    'Patient UHID': string;
    Relation: string;
    'Patient Age': number;
    'Patient Gender': string;
    'Customer ID': string;
    'Secretary Name': string;
    'Secretary Mobile Number': string;
    'Doctor Mobile Number': string;
  };
  [WebEngageEventName.PRESCRIPTION_RECEIVED]: {
    'Doctor Name': string;
    'Speciality Name': string;
    'Speciality ID': string;
    'Doctor Category': DoctorType;
    'Consult Date Time': Date;
    'Consult Mode': 'Online' | 'Physical';
    'Hospital Name': string;
    'Hospital City': string;
    'Consult ID': string;
    'Source Screen': string;
    'Patient Name': string;
    'Patient UHID': string;
    Relation: string;
    'Patient Age': number;
    'Patient Gender': string;
    'Customer ID': string;
    City: string;
  };
  [WebEngageEventName.SD_CONSULTATION_STARTED]: {
    'Doctor Name': string;
    'Speciality Name': string;
    'Speciality ID': string;
    'Doctor Category': DoctorType;
    'Consult Date Time': Date;
    'Consult Mode': 'Online' | 'Physical';
    'Hospital Name': string;
    'Hospital City': string;
    'Consult ID': string;
    'Patient Name': string;
    'Patient UHID': string;
    Relation: string;
    'Patient Age': number;
    'Patient Gender': string;
    'Customer ID': string;
  };
  [WebEngageEventName.SD_VIDEO_CALL_STARTED]: {
    'Doctor Name': string;
    'Speciality Name': string;
    'Speciality ID': string;
    'Doctor Category': DoctorType;
    'Consult Date Time': Date;
    'Consult Mode': 'Online' | 'Physical';
    'Hospital Name': string;
    'Hospital City': string;
    'Consult ID': string;
    'Patient Name': string;
    'Patient UHID': string;
    Relation: string;
    'Patient Age': number;
    'Patient Gender': string;
    'Customer ID': string;
  };
  [WebEngageEventName.PATIENT_JOINED_CONSULT]: {
    'Doctor Name': string;
    'Speciality Name': string;
    'Speciality ID': string;
    'Doctor Category': DoctorType;
    'Consult Date Time': Date;
    'Consult Mode': 'Online' | 'Physical';
    'Hospital Name': string;
    'Hospital City': string;
    'Consult ID': string;
    'Patient Name': string;
    'Patient UHID': string;
    Relation: string;
    'Patient Age': number;
    'Patient Gender': string;
    'Customer ID': string;
  };
  [WebEngageEventName.PATIENT_ENDED_CONSULT]: {
    'Doctor Name': string;
    'Speciality Name': string;
    'Speciality ID': string;
    'Doctor Category': DoctorType;
    'Consult Date Time': Date;
    'Consult Mode': 'Online' | 'Physical';
    'Hospital Name': string;
    'Hospital City': string;
    'Consult ID': string;
    'Patient Name': string;
    'Patient UHID': string;
    Relation: string;
    'Patient Age': number;
    'Patient Gender': string;
    'Customer ID': string;
    'Doctor ID': string;
    'Doctor Number': string;
    'Doctor Facility ID': string;
    'Doctor Facility': string;
    'Appointment ID': string;
    'Appointment Display ID': string;
    'Patient Number': string;
    'Session ID': string;
    'Call ID': string;
    'Did doctor Join': string;
  };
  [WebEngageEventName.CALL_ENDED]: {
    'Doctor Name': string;
    'Speciality Name': string;
    'Speciality ID': string;
    'Patient Name': string;
    'Patient UHID': string;
    'Consult ID': string;
    'Consult Date Time': Date;
    'Display ID': number | null;
    'Ended by': 'Doctor' | 'Patient' | 'Senior Doctor' | 'Junior Doctor' | 'Network';
    'Call Duration': number;
  };
  [WebEngageEventName.PATIENT_ANSWERED_CALL]: consultCallEndData;
  [WebEngageEventName.PATIENT_DECLINED_CALL]: consultCallEndData;
  [WebEngageEventName.PATIENT_MISSED_CALL]: consultCallEndData;
  [WebEngageEventName.CALL_DROPPED_UNKNOWN_REASON]: consultCallEndData;
  [WebEngageEventName.PAST_APPOINTMENT_BOOK_FOLLOW_UP_CLICKED]: FollowUpAppointment;
  [WebEngageEventName.BOOK_AGAIN_CANCELLED_APPOINTMENT]: FollowUpAppointment;
  [WebEngageEventName.VIEW_DETAILS_PAST_APPOINTMENT]: FollowUpAppointment;
  [WebEngageEventName.BOOK_APPOINTMENT_CHAT_ROOM]: FollowUpAppointment;
  [WebEngageEventName.DOWNLOAD_PRESCRIPTION]: {
    'Doctor Name': string;
    'Speciality Name': string;
    'Speciality ID': string;
    'Doctor Category': DoctorType;
    'Consult Date Time': Date;
    'Consult Mode': 'Online' | 'Physical';
    'Hospital Name': string;
    'Hospital City': string;
    'Consult ID': string;
    'Download Screen': 'Chat' | 'Prescription Details';
    'Patient Name': string;
    'Patient UHID': string;
    Relation: string;
    'Patient Age': number;
    'Patient Gender': string;
    'Customer ID': string;
  };
  [WebEngageEventName.VIEW_PRESCRIPTION_IN_CONSULT_DETAILS]: {
    'Doctor Name': string;
    'Speciality Name': string;
    'Speciality ID': string;
    'Doctor Category': DoctorType;
    'Consult Date Time': Date;
    'Consult Mode': 'Online' | 'Physical';
    'Hospital Name': string;
    'Hospital City': string;
    'Consult ID': string;
    'Patient Name': string;
    'Patient UHID': string;
    Relation: string;
    'Patient Age': number;
    'Patient Gender': string;
    'Customer ID': string;
  };
  [WebEngageEventName.CART_PRESCRIPTION_OPTION_SELECTED_PROCEED_CLICKED]: {
    'Option selected': 'Prescription Now' | 'Prescription Later' | 'Doctor Consult' | 'NA';
  };
  [WebEngageEventName.ORDER_MEDICINES_FROM_PRESCRIPTION_DETAILS]: {
    'Doctor Name': string;
    'Speciality Name': string;
    'Speciality ID': string;
    'Doctor Category': DoctorType;
    'Consult Date Time': Date;
    'Consult Mode': 'Online' | 'Physical';
    'Hospital Name': string;
    'Hospital City': string;
    'Consult ID': string;
    'Patient Name': string;
    'Patient UHID': string;
    Relation: string;
    'Patient Age': number;
    'Patient Gender': string;
    'Customer ID': string;
    'Order Type': 'Cart' | 'Non-Cart';
  };
  [WebEngageEventName.ORDER_TESTS_FROM_PRESCRIPTION_DETAILS]: {
    'Doctor Name': string;
    'Speciality Name': string;
    'Speciality ID': string;
    'Doctor Category': DoctorType;
    'Consult Date Time': Date;
    'Consult Mode': 'Online' | 'Physical';
    'Hospital Name': string;
    'Hospital City': string;
    'Consult ID': string;
    'Patient Name': string;
    'Patient UHID': string;
    Relation: string;
    'Patient Age': number;
    'Patient Gender': string;
    'Customer ID': string;
  };
  [WebEngageEventName.NO_SLOTS_FOUND]: {
    'Doctor Name': string;
    'Speciality Name': string;
    'Speciality ID': string;
    'Doctor Category': DoctorType;
    'Consult Date Time': Date;
    'Consult Mode': 'Online' | 'Physical';
    'Hospital Name': string;
    'Hospital City': string;
    // 'Consult ID': string;
    'Patient Name': string;
    'Patient UHID': string;
    Relation: string;
    'Patient Age': number;
    'Patient Gender': string;
    'Customer ID': string;
  };
  [WebEngageEventName.DOCTOR_RESCHEDULE_CLAIM_REFUND]: {
    'Appointment ID': string;
    Type: string;
    'Patient Id': string;
  };
  [WebEngageEventName.LOCATION_PERMISSION]: {
    'Location permission': string;
  };
  [WebEngageEventName.HOME_PAGE_VIEWED]: {
    source: 'deeplink' | 'app home';
  };
  [WebEngageEventName.PRODUCT_PAGE_VIEWED]: {
    source: ProductPageViewedSource;
    ProductId: string;
    ProductName: string;
    Stockavailability: YesOrNo | 'Not for Sale';
    /**
     * Category ID & Category Name is applicable if customers clicks on products from any category (all categories of shop by category or health areas)
     */
    CategoryID?: string;
    CategoryName?: string;
    /**
     * Section Name is applicable if customer clicked on the product from the homepage product widgets like Hot sellers, Recommended products
     */
    SectionName?: string;
    'Circle Membership Added': 'Yes' | 'No' | 'Existing';
    'Circle Membership Value': number | null;
    User_Type?: PharmaUserStatus;
    Pincode?: string;
    serviceable: YesOrNo;
    TATDay?: number | null;
    TatHour?: number | null;
    TatDateTime?: Date | string;
    ProductType?: string;
    MaxOrderQuantity?: number;
    MRP?: number;
    SpecialPrice?: number | null;
    CircleCashback?: number;
    isMultiVariant: number;
  };
  [WebEngageEventName.DOCTOR_PROFILE_THROUGH_DEEPLINK]: {
    'Patient Name': string;
    'Patient UHID': string;
    'Patient Age': number;
    'Patient Gender': string;
    'Mobile Number': string;
    'Doctor Name': string;
    'Speciality Name': string;
    'Speciality ID': string;
    'Doctor ID': string;
    'Media Source': string;
    User_Type: string;
  };
  [WebEngageEventName.SEARCH_SUGGESTIONS]: {
    'Patient Name': string;
    'Patient UHID': string;
    Relation: string;
    'Patient Age': number;
    'Patient Gender': string;
    'Mobile Number': string;
    'Customer ID': string;
    'Text typed by the user': string;
    'Search Suggestions': string;
    Bucket: 'Speciality' | 'Doctor' | 'Procedure' | 'Symptoms' | string;
    Doctors: string;
    Symptoms: string;
    Specialities: string;
    Procedures: string;
    User_Type: string;
  };

  [WebEngageEventName.SEARCH_SUGGESTIONS_VIEW_ALL]: {
    'Patient Name': string;
    'Patient UHID': string;
    Relation: string;
    'Patient Age': number;
    'Patient Gender': string;
    'Mobile Number': string;
    'Customer ID': string;
    Bucket: 'Speciality' | 'Doctor' | 'Procedure' | 'Symptoms' | string;
    'Search suggestions in the particular bucket': string;
  };

  [WebEngageEventName.SEARCH_SUGGESTIONS_CLICKED]: {
    'Patient Name': string;
    'Patient UHID': string;
    Relation: string;
    'Patient Age': number;
    'Patient Gender': string;
    'Mobile Number': string;
    'Customer ID': string;
    Doctors: string;
    Symptoms: string;
    Specialities: string;
    Procedures: string;
    'Text typed by the user': string;
    'Search Suggestion Clicked': string;
    'Bucket Clicked': string;
    User_Type: string;
  };

  [WebEngageEventName.SHARE_CLICK_DOC_LIST_SCREEN]: {
    'Patient Name': string;
    'Patient UHID': string;
    'Patient Age': number;
    'Patient Gender': string;
    'Mobile Number': string;
    'Doctor Name': string;
    'Speciality Name': string;
    'Speciality ID': string;
    'Doctor ID': string;
    'Doctor card rank'?: number;
    'UTM parameter'?: string;
  };
  [WebEngageEventName.CATEGORY_PAGE_VIEWED]: {
    source: 'home' | 'deeplink' | 'registration';
    CategoryId: string;
    CategoryName: string;
  };
  [WebEngageEventName.BUY_AGAIN_PAGE_VIEWED]: {};
  [WebEngageEventName.CONFIRM_LOCATION]: {
    isMarkerModified: boolean;
    changedByInMeters: number;
  };
  [WebEngageEventName.HDFC_HOMEPAGE_CAROUSEL_CLICKED]: HdfcCustomerPlanInfo;
  [WebEngageEventName.HDFC_MY_MEMBERSHIP_VIEWED]: HdfcBenefitInfo;
  [WebEngageEventName.HDFC_PLAN_DETAILS_VIEWED]: HdfcBenefitInfo;
  [WebEngageEventName.HDFC_EXPLORE_PLAN_CLICKED]: HdfcBenefitInfo;
  [WebEngageEventName.HDFC_HOW_TO_AVAIL_CLICKED]: HdfcBenefitInfo;
  [WebEngageEventName.HDFC_REDEEM_CLICKED]: {
    'User ID': string;
    Benefit: string;
  };
  [WebEngageEventName.HDFC_DOC_ON_CALL_CLICK]: HdfcBenefitInfo;
  [WebEngageEventName.HDFC_COVID_CARE_CLICK]: HdfcBenefitInfo;
  [WebEngageEventName.HDFC_DIGITIZATION_PHR_CLICK]: HdfcBenefitInfo;
  [WebEngageEventName.HDFC_FREE_HEALTH_ASSESSMENT_CLICK]: HdfcBenefitInfo;
  [WebEngageEventName.HDFC_CONCIERGE_CLICK]: HdfcBenefitInfo;
  [WebEngageEventName.HDFC_DIETITIAN_CLICK]: HdfcBenefitInfo;
  [WebEngageEventName.HDFC_DIAGNOSTIC_CLICK]: HdfcBenefitInfo;
  [WebEngageEventName.HDFC_DIGITAL_VAULT_CLICK]: HdfcBenefitInfo;
  [WebEngageEventName.HDFC_7000_DOCTORS_CLICK]: HdfcBenefitInfo;
  [WebEngageEventName.HDFC_FREE_MED_CHECK_CLICK]: HdfcBenefitInfo;
  [WebEngageEventName.HDFC_PLAN_SUSBCRIBED]: {
    DOB: string;
    'Email ID': string;
    'Mobile Number': string;
    'Partner ID': string;
    'Plan Name': string;
  };

  // ********** Opentok Events ********** \\

  [WebEngageEventName.DOCTOR_SUBSCRIBER_ERROR]: {
    'Appointment ID': string;
    'Patient ID': string;
    'Doctor ID': string;
    error: string;
    'Session ID': string;
  };

  [WebEngageEventName.DOCTOR_SUBSCRIBER_OTRNERROR]: {
    'Appointment ID': string;
    'Patient ID': string;
    'Doctor ID': string;
    error: string;
    'Session ID': string;
  };

  [WebEngageEventName.DOCTOR_SUBSCRIBER_CONNECTED]: {
    'Appointment ID': string;
    'Patient ID': string;
    'Doctor ID': string;
    event: string;
  };

  [WebEngageEventName.DOCTOR_SUBSCRIBER_DISCONNECTED]: {
    'Appointment ID': string;
    'Patient ID': string;
    'Doctor ID': string;
    event: string;
  };

  [WebEngageEventName.DOCTOR_SUBSCRIBER_VIDEO_DISABLED]: {
    'Appointment ID': string;
    'Patient ID': string;
    'Doctor ID': string;
    event: string;
  };

  [WebEngageEventName.DOCTOR_SUBSCRIBER_VIDEO_ENABLED]: {
    'Appointment ID': string;
    'Patient ID': string;
    'Doctor ID': string;
    event: string;
  };

  [WebEngageEventName.PATIENT_PUBLISHER_ERROR]: {
    'Appointment ID': string;
    'Patient ID': string;
    'Doctor ID': string;
    error: string;
    'Session ID': string;
  };

  [WebEngageEventName.PATIENT_PUBLISHER_OTRNERROR]: {
    'Appointment ID': string;
    'Patient ID': string;
    'Doctor ID': string;
    error: string;
    'Session ID': string;
  };

  [WebEngageEventName.PATIENT_PUBLISHER_STREAM_CREATED]: {
    'Appointment ID': string;
    'Patient ID': string;
    'Doctor ID': string;
    event: string;
  };

  [WebEngageEventName.PATIENT_PUBLISHER_STREAM_DESTROYED]: {
    'Appointment ID': string;
    'Patient ID': string;
    'Doctor ID': string;
    event: string;
  };

  [WebEngageEventName.PATIENT_SESSION_ERROR]: {
    'Appointment ID': string;
    'Patient ID': string;
    'Doctor ID': string;
    error: string;
    'Session ID': string;
  };

  [WebEngageEventName.PATIENT_SESSION_OTRNERROR]: {
    'Appointment ID': string;
    'Patient ID': string;
    'Doctor ID': string;
    error: string;
    'Session ID': string;
  };

  [WebEngageEventName.PATIENT_SESSION_CONNECTION_CREATED]: {
    'Appointment ID': string;
    'Patient ID': string;
    'Doctor ID': string;
    event: string;
  };

  [WebEngageEventName.PATIENT_SESSION_CONNECTION_DESTROYED]: {
    'Appointment ID': string;
    'Patient ID': string;
    'Doctor ID': string;
    event: string;
  };

  [WebEngageEventName.PATIENT_SESSION_CONNECTED]: {
    'Appointment ID': string;
    'Patient ID': string;
    'Doctor ID': string;
    event: string;
  };

  [WebEngageEventName.PATIENT_SESSION_DISCONNECTED]: {
    'Appointment ID': string;
    'Patient ID': string;
    'Doctor ID': string;
    event: string;
  };

  [WebEngageEventName.PATIENT_SESSION_RECONNECTED]: {
    'Appointment ID': string;
    'Patient ID': string;
    'Doctor ID': string;
    event: string;
  };

  [WebEngageEventName.PATIENT_SESSION_RECONNECTING]: {
    'Appointment ID': string;
    'Patient ID': string;
    'Doctor ID': string;
    event: string;
  };

  [WebEngageEventName.PATIENT_SESSION_STREAM_CREATED]: {
    'Appointment ID': string;
    'Patient ID': string;
    'Doctor ID': string;
    event: string;
  };

  [WebEngageEventName.PATIENT_SESSION_STREAM_DESTROYED]: {
    'Appointment ID': string;
    'Patient ID': string;
    'Doctor ID': string;
    event: string;
  };

  [WebEngageEventName.PATIENT_SESSION_STREAM_PROPERTY_CHANGED]: {
    'Appointment ID': string;
    'Patient ID': string;
    'Doctor ID': string;
    event: string;
  };

  [WebEngageEventName.SYMPTOM_TRACKER_PAGE_CLICKED]: SymptomTrackerPatientInfo;
  [WebEngageEventName.SYMPTOM_TRACKER_INFO_CLICKED]: SymptomTrackerPatientInfo;
  [WebEngageEventName.SYMPTOM_TRACKER_ADD_OTHER_SYMPTOM_CLICKED]: SymptomTrackerPatientInfo;
  [WebEngageEventName.SYMPTOM_TRACKER_MOST_TROUBLING_SYMPTOM_CLICKED]: SymptomTrackerPatientInfo;
  [WebEngageEventName.SYMPTOM_TRACKER_NO_OTHER_SYMPTOM_CLICKED]: SymptomTrackerPatientInfo;
  [WebEngageEventName.SYMPTOM_TRACKER_CLICKED_ON_SPECIALITY_SCREEN]: SymptomTrackerPatientInfo;
  [WebEngageEventName.SYMPTOM_TRACKER_RESTART_CLICKED]: SymptomTrackerCompleteInfo;
  [WebEngageEventName.SYMPTOM_TRACKER_CONSULT_DOCTOR_CLICKED]: SymptomTrackerCompleteInfo;
  [WebEngageEventName.SYMPTOM_TRACKER_SEARCH_SYMPTOMS]: {
    'Patient UHID': string;
    'Patient ID': string;
    'Patient Name': string;
    'Mobile Number': string;
    'Date of Birth': Date | string;
    Email: string;
    Relation: string;
    'Search String': string;
  };
  [WebEngageEventName.SYMPTOM_TRACKER_SUGGESTED_SYMPTOMS_CLICKED]: {
    'Patient UHID': string;
    'Patient ID': string;
    'Patient Name': string;
    'Mobile Number': string;
    'Date of Birth': Date | string;
    Email: string;
    Relation: string;
    'Symptom Clicked': string;
  };
  [WebEngageEventName.SYMPTOM_TRACKER_ADD_SELECTED_SYMPTOMS_CLICKED]: {
    'Patient UHID': string;
    'Patient ID': string;
    'Patient Name': string;
    'Mobile Number': string;
    'Date of Birth': Date | string;
    Email: string;
    Relation: string;
    'Selected Symptoms': string;
  };
  [WebEngageEventName.SYMPTOM_TRACKER_FOR_MYSELF]: SymptomTrackerPatientInfo;
  [WebEngageEventName.CIRCLE_BENIFIT_CLICKED]: CircleRenewalAttributes;
  [WebEngageEventName.CIRCLE_RENEW_NOW_CLICKED]: CircleRenewalAttributes;
  [WebEngageEventName.CIRCLE_VIEW_BENEFITS_CLICKED]: CircleRenewalAttributes;
  [WebEngageEventName.CIRCLE_MEMBERSHIP_RENEWED]: CircleRenewalSubscriptionAttributes;
  [WebEngageEventName.CIRCLE_MEMBERSHIP_DETAILS_VIEWED]: CircleRenewalAttributes;
  [WebEngageEventName.HOME_VIEWED]: {
    'Patient Name': string;
    'Patient UHID': string;
    Relation: string;
    'Patient Age': number;
    'Patient Gender': string;
    'Mobile Number': string;
    'Customer ID': string;
    'Circle Member': 'Yes' | 'No';
    'Circle Plan type': string;
  };
  [WebEngageEventName.COVID_VACCINATION_SECTION_CLICKED]: {
    'Patient Name': string;
    'Patient UHID': string;
    Relation: string;
    'Patient Age': number;
    'Patient Gender': string;
    'Mobile Number': string;
    'Customer ID': string;
    'CTA Clicked': string;
  };
  [WebEngageEventName.USER_LOCATION_CONSULT]: consultLocation;
  [WebEngageEventName.USER_CHANGED_LOCATION]: consultLocation;
  [WebEngageEventName.USER_LOGGED_IN_WITH_TRUECALLER]: PatientInfo;
  [WebEngageEventName.TRUECALLER_EVENT_ERRORS]: {
    'Error Code': number;
    'Error Message': string;
  };
  [WebEngageEventName.TRUECALLER_APOLLO247_LOGIN_ERRORS]: {
    'Api Name': string;
    Error: any;
  };
  [WebEngageEventName.LOGIN_WITH_TRUECALLER_CLICKED]: {};
  [WebEngageEventName.MY_CONSULTED_DOCTORS_CLICKED]: {
    'Patient Name': string;
    'Patient UHID': string;
    Relation: string;
    'Patient Age': number;
    'Patient Gender': string;
    'Mobile Number': string;
    'Customer ID': string;
    User_Type: string;
    'Doctor Name': string;
    'Doctor Id': string;
    'Doctor Speciality': string;
    'Previous consult Details': {
      'Consult Date & Time': Date | string;
      'Display ID': string;
      'Appointment Id': string;
      'Hospital Id': string;
      'Hospital Name': string;
      _247_Flag: boolean | undefined;
      'Consult Mode': string;
    };
  };

  [WebEngageEventName.VIEW_PROFILE_SLOT_SCREEN]: {
    'Patient Name': string;
    'Patient UHID': string;
    Relation: string;
    'Patient Age': number;
    'Patient Gender': string;
    'Mobile Number': string;
    'Customer ID': string;
    User_Type: string;
    'Doctor Name': string;
    'Doctor Id': string;
    'Doctor Speciality': string;
  };

  [WebEngageEventName.VIEW_AVAILABLE_SLOTS]: {
    'Patient Name': string;
    'Patient UHID': string;
    Relation: string;
    'Patient Age': number;
    'Patient Gender': string;
    'Mobile Number': string;
    'Customer ID': string;
    User_Type: string;
    'Doctor Name': string;
    'Doctor Id': string;
    'Doctor Speciality': string;
    'Landing screen date': string;
  };

  [WebEngageEventName.VIEW_SLOTS_CLICKED]: {
    'Patient Name': string;
    'Patient UHID': string;
    Relation: string;
    'Patient Age': number;
    'Patient Gender': string;
    'Mobile Number': string;
    'Customer ID': string;
    User_Type: string;
    'Doctor Name': string;
    'Doctor Id': string;
    'Doctor Speciality': string;
    'Bucket viewed': string;
  };
}
