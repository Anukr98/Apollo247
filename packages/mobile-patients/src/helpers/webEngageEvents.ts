import {
  DoctorType,
  MEDICINE_ORDER_STATUS,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { SymptomsSpecialities } from '@aph/mobile-patients/src/helpers/apiCalls';
import { UserEvent } from 'pubnub';
import { PharmaUserStatus } from '@aph/mobile-patients/src/components/AppCommonDataProvider';

type YesOrNo = 'Yes' | 'No';
type HdfcPlan = 'SILVER' | 'GOLD' | 'PLATINUM';

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
}

export enum WebEngageEventName {
  MOBILE_ENTRY = 'Mobile Entry',
  MOBILE_NUMBER_ENTERED = 'Mobile Number Entered',
  OTP_ENTERED = 'OTP Entered',
  PRE_APOLLO_CUSTOMER = 'Pre Apollo Customer',
  OTP_VERIFICATION_SUCCESS = 'OTP Verification Success',
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
  // HomePageElements Events
  BUY_MEDICINES = 'Buy Medicines',
  ORDER_TESTS = 'Order Tests',
  MANAGE_DIABETES = 'Manage Diabetes',
  TRACK_SYMPTOMS = 'Track Symptoms',
  VIEW_HELATH_RECORDS = 'PHR Click Health records - app',
  LEARN_MORE_ABOUT_CORONAVIRUS = 'Learn more about coronavirus',
  CHECK_YOUR_RISK_LEVEL = 'Check your risk level',
  APOLLO_PRO_HEALTH = 'Apollo pro health',
  NOTIFICATION_ICON = 'Notification Icon clicked',
  ACTIVE_APPOINTMENTS = 'Active Appointments',
  NEED_HELP = 'Need Help?',
  TICKET_RAISED = 'Ticket raised',
  MY_ACCOUNT = 'My Account',
  BOOK_DOCTOR_APPOINTMENT = 'Book Doctor Appointment clicked on homescreen',
  TABBAR_APPOINTMENTS_CLICKED = 'Appointments Clicked on tab bar',
  APOLLO_KAVACH_PROGRAM = 'Apollo Kavach Program',
  COVID_VACCINE_TRACKER = 'Covid Vaccine Tracker',
  READ_ARTICLES = 'Read Articles',
  HDFC_HEALTHY_LIFE = 'Explore HDFC Tile Clicked on Homepage',

  // Diagnostics Events
  DIAGNOSTIC_LANDING_PAGE_VIEWED = 'Diagnostic landing page viewed',
  DIAGNOSTIC_PINCODE_ENTERED_ON_LOCATION_BAR = 'Diagnostic pincode entered',
  DIAGNOSTIC_LANDING_ITEM_SEARCHED = 'Diagnostic partial search',
  DIAGNOSTIC_ITEM_SEARCHED = 'Diagnostic full search',
  DIAGNOSTIC_HOME_PAGE_WIDGET_CLICKED = 'Diagnostic home page widgets',
  DIAGNOSTIC_TEST_DESCRIPTION = 'Diagnostic test page viewed',
  DIAGNOSTIC_ADD_TO_CART = 'Diagnostic add to cart',
  DIAGNOSTIC_CART_VIEWED = 'Diagnostic Cart page viewed',
  DIAGNOSTIC_CHECKOUT_COMPLETED = 'Diagnostic Checkout completed',
  DIAGNOSTIC_MY_ORDERS = 'Diagnostics - My Orders Viewed',
  DIAGNOSTIC_ORDER_SUMMARY_VIEWED = 'Diagnostic Order summary viewed',
  DIAGNOSTIC_VIEW_REPORT_CLICKED = 'Diagnostic view report clicked',

  DIAGNOSTIC_ADDRESS_NON_SERVICEABLE_CARTPAGE = 'Address Non Serviceable on Diagnostic Cart Page',
  DIAGNOSTIC_AREA_SELECTED = 'Area Selected on Cart',
  DIAGNOSTIC_APPOINTMENT_TIME_SELECTED = 'Appointment time slot selected',
  DIAGNOSTIC_PROCEED_TO_PAY_CLICKED = 'Diagnostic proceed to pay clicked',
  DIAGNOSTIC_TRACK_ORDER_VIEWED = 'Diagnostic track Order viewed',
  DIAGNOSTIC_FEEDBACK_GIVEN = 'Diagnostic feedback submitted',
  DIAGNOSTIC_PAYMENT_INITIATED = 'Diagnostic Payment Initiated',
  DIAGNOSITC_HOME_PAGE_BANNER_CLICKED = 'Diagnostic home page banner',

  // Health Records
  CONSULT_RX = 'PHR Consult & RX',
  MEDICAL_RECORDS = 'PHR Medical Records',
  ADD_RECORD = 'Add Record',
  UPLOAD_PRESCRIPTION = 'Upload Prescription',
  UPLOAD_PHOTO = 'Upload Photo',
  ITEMS_CLICKED = 'Items Clicked',
  PHR_ORDER_MEDS_TESTS = 'PHR Order Tests and Meds Prescription - app',
  PHR_CONSULT_CARD_CLICK = 'PHR Consult Card click',
  RE_ORDER_MEDICINE = 'ReOrder Medicine',
  PHR_CLICK_DOCTOR_CONSULTATIONS = 'PHR Click Doctor Consultations - app',
  PHR_CLICK_TEST_REPORTS = 'PHR Click Test Reports - app',
  PHR_CLICK_HOSPITALIZATIONS = 'PHR Click Hospitalizations - app',
  PHR_CLICK_HEALTH_CONDITIONS = 'PHR Click Health Conditions - app',
  PHR_CLICK_BILLS = 'PHR Click Bills - app',
  PHR_CLICK_INSURANCES = 'PHR Click Insurances - app',
  PHR_ADD_DOCTOR_CONSULTATIONS = 'PHR Add Doctor Consultation - app',
  PHR_ADD_TEST_REPORT = 'PHR Add Test Report - app',
  PHR_ADD_HOSPITALIZATIONS = 'PHR Add Hospitalization - app',
  PHR_ADD_ALLERGY = 'PHR Add Allergy - app',
  PHR_ADD_FAMILY_HISTORY = 'PHR Add Family History - app',
  PHR_ADD_MEDICATION = 'PHR Add Medication - app',
  PHR_ADD_HEALTH_RESTRICTIONS = 'PHR Add Health Restriction - app',
  PHR_ADD_MEDICAL_CONDITION = 'PHR Add Medical Condition - app',
  PHR_ADD_BILLS = 'PHR Add Bills - app',
  PHR_ADD_INSURANCE = 'PHR Add Insurance - app',
  PHR_ADD_HEIGHT = 'PHR Add Height - app',
  PHR_ADD_WEIGHT = 'PHR Add Weight - app',
  PHR_ADD_BLOOD_GROUP = 'PHR Add BloodGroup - app',
  PHR_DOWNLOAD_DOCTOR_CONSULTATION = 'PHR Download Doctor Consultation - app',
  PHR_DOWNLOAD_TEST_REPORT = 'PHR Download Test Report - app',
  PHR_DOWNLOAD_HEALTH_CHECKS = 'PHR Download Health Check - app',
  PHR_DOWNLOAD_HOSPITALIZATIONS = 'PHR Download Hospitalization - app',
  PHR_DOWNLOAD_ALLERGY = 'PHR Download Allergy - app',
  PHR_DOWNLOAD_FAMILY_HISTORY = 'PHR Download Family History - app',
  PHR_DOWNLOAD_MEDICAL_CONDITION = 'PHR Download Medical Condition - app',
  PHR_DOWNLOAD_BILLS = 'PHR Download Bill - app',
  PHR_DOWNLOAD_INSURANCE = 'PHR Download Insurance - app',
  PHR_UPDATE_DOCTOR_CONSULTATION = 'PHR Update Doctor Consultation - app',
  PHR_UPDATE_TEST_REPORT = 'PHR Update Test Report - app',
  PHR_UPDATE_HOSPITALIZATIONS = 'PHR Update Hospitalization - app',
  PHR_UPDATE_ALLERGY = 'PHR Update Allergy - app',
  PHR_UPDATE_FAMILY_HISTORY = 'PHR Update Family History - app',
  PHR_UPDATE_MEDICATION = 'PHR Update Medication - app',
  PHR_UPDATE_HEALTH_RESTRICTIONS = 'PHR Update Health Restriction - app',
  PHR_UPDATE_MEDICAL_CONDITION = 'PHR Update Medical Condition - app',
  PHR_UPDATE_BILLS = 'PHR Update Bill - app',
  PHR_UPDATE_INSURANCE = 'PHR Update Insurance - app',
  PHR_UPDATE_HEIGHT = 'PHR Update Height - app',
  PHR_UPDATE_WEIGHT = 'PHR Update Weight - app',
  PHR_UPDATE_BLOOD_GROUP = 'PHR Update BloodGroup - app',
  PHR_DELETE_DOCTOR_CONSULTATION = 'PHR Delete Doctor Consultation - app',
  PHR_DELETE_TEST_REPORT = 'PHR Delete Test Report - app',
  PHR_DELETE_HOSPITALIZATIONS = 'PHR Delete Hospitalization - app',
  PHR_DELETE_ALLERGY = 'PHR Delete Allergy - app',
  PHR_DELETE_FAMILY_HISTORY = 'PHR Delete Family History - app',
  PHR_DELETE_MEDICATION = 'PHR Delete Medication - app',
  PHR_DELETE_HEALTH_RESTRICTIONS = 'PHR Delete Health Restriction - app',
  PHR_DELETE_MEDICAL_CONDITION = 'PHR Delete Medical Condition - app',
  PHR_DELETE_BILLS = 'PHR Delete Bill - app',
  PHR_DELETE_INSURANCE = 'PHR Delete Insurance - app',
  PHR_LOAD_HEALTH_RECORDS = 'PHR Load Health Records - app',
  PHR_USER_LINKING = 'PHR User Linking - app',
  PHR_USER_DELINKING = 'PHR User DeLinking -app',
  PHR_NO_OF_USERS_SEARCHED_GLOBAL = 'PHR No Of Users searched Global - app',
  PHR_NO_USERS_SEARCHED_LOCAL = 'PHR No Of Users searched Local {0} - app',
  PHR_NO_OF_USERS_CLICKED_ON_RECORDS = 'PHR No. of users clicked on records in {0} - app',

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
  ORDER_MEDICINES_FROM_PRESCRIPTION_DETAILS = 'PHR Order Meds Prescription Detail - app',
  ORDER_TESTS_FROM_PRESCRIPTION_DETAILS = 'PHR Order Tests Prescription Detail - app',
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
  PATIENT_SENT_CHAT_MESSAGE_POST_CONSULT = 'Patient sent chat message post consult',
  ORDER_MEDICINES_IN_CONSULT_ROOM = 'Order meds in Consult room',
  BOOK_TESTS_IN_CONSULT_ROOM = 'Book tests in consult room',
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
}

export interface PatientInfo {
  'Patient Name': string;
  'Patient UHID': string;
  Relation: string;
  'Patient Age': number;
  'Patient Gender': string;
  'Mobile Number': string;
  'Customer ID': string;
}

export interface UserInfo {
  'Patient UHID': string;
  'Mobile Number': string;
  'Customer ID': string;
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
  [WebEngageEventName.REGISTRATION_DONE]: {
    'Customer ID': string;
    'Customer First Name': string;
    'Customer Last Name': string;
    'Date of Birth': Date | string;
    Gender: string;
    Email: string;
    'Referral Code'?: string;
  };
  [WebEngageEventName.NUMBER_OF_PROFILES_FETCHED]: { count: number };
  [WebEngageEventName.ORDER_MEDICINES_IN_CONSULT_ROOM]: UserInfo;
  [WebEngageEventName.BOOK_TESTS_IN_CONSULT_ROOM]: UserInfo;
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
  [WebEngageEventName.NEED_HELP]: PatientInfoWithNeedHelp; // source values may change later
  [WebEngageEventName.TICKET_RAISED]: { Category: string; Query: string };
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
    Brand: string;
    'Brand ID': string;
    'category name': string;
    'category ID': string;
    pincode: string;
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
    User_Type?: PharmaUserStatus;
  };
  [WebEngageEventName.PHARMACY_PAYMENT_INITIATED]: {
    'Payment mode': 'Online' | 'COD';
    Amount: number;
    'Service Area': 'Pharmacy' | 'Diagnostic';
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
  };
  [WebEngageEventName.CART_COUPON_APPLIED]: {
    'Coupon Code': string;
    'Discounted amount': string | number;
    'Customer ID': string;
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
    'Upload Source'?: 'Cart' | 'Upload Flow';
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
    User_Type?: PharmaUserStatus;
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
    'Order Amount': string | number;
    'Order id:': string;
    'Order status'?: string;
    'Sample Collection Date': string; //Date
  };
  [WebEngageEventName.DIAGNOSTIC_PINCODE_ENTERED_ON_LOCATION_BAR]: DiagnosticPinCode;
  [WebEngageEventName.DIAGNOSTIC_HOME_PAGE_WIDGET_CLICKED]: {
    'Item Name': string;
    'Item ID': string;
    Source: 'Home Page';
    'Section Name': string;
  };
  [WebEngageEventName.DIAGNOSTIC_TEST_DESCRIPTION]: {
    Source: 'Full Search' | 'Home Page' | 'Cart Page' | 'Partial Search';
    'Item Name': string;
    'Item Type': string;
    'Item Code': string;
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
  };
  [WebEngageEventName.DIAGNOSTIC_AREA_SELECTED]: {
    'Address Pincode': number;
    'Area Selected': string;
    Servicability: 'Yes' | 'No';
  };
  [WebEngageEventName.DIAGNOSTIC_APPOINTMENT_TIME_SELECTED]: {
    'Address Pincode': number;
    'Area Selected': string;
    'Time Selected': string;
    'No of Days ahead of Order Date selected': number;
  };
  [WebEngageEventName.DIAGNOSTIC_PROCEED_TO_PAY_CLICKED]: {
    //already exists
    'Patient Name selected': string;
    'Total items in cart': number;
    'Sub Total': number;
    // 'Delivery charge': number;
    'Net after discount': number;
    'Prescription Uploaded?': boolean;
    'Prescription Mandatory?': boolean;
    'Mode of Sample Collection': 'Home' | 'Pickup' | 'Home Visit' | 'Clinic Visit';
    'Delivery Date Time'?: string | Date; // Optional (only if Home)
    'Pin Code': string | number;
    'Service Area': 'Pharmacy' | 'Diagnostic';
    'Area Name': string;
    'No of Days ahead of Order Date selected': number;
    'Home collection charges'?: number;
    Discount?: number;
    'Collection Time Slot': string;
  };
  [WebEngageEventName.DIAGNOSTIC_TRACK_ORDER_VIEWED]: {
    'Patient UHID': string;
    'Patient Name': string;
    'Latest Order Status': string;
    'Order ID': string;
  };
  [WebEngageEventName.DIAGNOSTIC_VIEW_REPORT_CLICKED]: {
    'Patient UHID': string;
    'Patient Name': string;
    'Order ID': string;
    'Order Date': Date;
    'Reports Generated On': Date;
  };
  [WebEngageEventName.DIAGNOSTIC_FEEDBACK_GIVEN]: {
    'Patient UHID': string;
    'Patient Name': string;
    Rating: string | number;
    'Thing to Imporve selected': string;
  };

  [WebEngageEventName.DIAGNOSTIC_ADD_TO_CART]: {
    'Item Name': string;
    'Item ID': string; // (SKUID)
    Source: 'Home page' | 'Full search' | 'Details page' | 'Partial search' | 'Listing page';
    Section?: string;
  };
  [WebEngageEventName.DIAGNOSTIC_CHECKOUT_COMPLETED]: {
    'Order ID': string | number;
    Pincode: string | number;
    'Patient UHID': string;
    'Total items in cart'?: number; // Optional
    'Order Amount': number; // Optional
    'Payment mode'?: 'Cash' | 'Prepaid'; // Optional
    'Circle discount'?: number;
    'Appointment Date'?: string;
    'Appointment time'?: string;
    'Item ids'?: any;
  };
  [WebEngageEventName.DIAGNOSTIC_PAYMENT_INITIATED]: {
    Paymentmode?: 'Prepaid' | 'Cash';
    Amount: number;
    ServiceArea: 'Pharmacy' | 'Diagnostic';
    LOB: string;
  };
  [WebEngageEventName.DIAGNOSITC_HOME_PAGE_BANNER_CLICKED]: {
    position: number;
    itemId: number;
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
    'TAT Displayed': Date;
    'Delivery TAT': number;
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
  };

  [WebEngageEventName.PHARMACY_TAT_API_CALLED]: {
    Source: 'PDP' | 'Cart';
    Input_sku: string;
    Input_qty: number;
    Input_lat: number;
    Input_long: number;
    Input_pincode: string;
    Input_MRP: number;
    No_of_items_in_the_cart: number;
    Response_Exist: YesOrNo;
    Response_MRP: number;
    Response_Qty: number;
    Response_lat: number;
    Response_lng: number;
    Response_ordertime: number;
    Response_pincode: string;
    Response_storeCode: string;
    Response_storeType: string;
    Response_tat: string;
    Response_tatU: number;
  };

  [WebEngageEventName.PHARMACY_CART_SELECT_DELIVERY_ADDRESS_CLICKED]: {
    'Customer ID': string;
  };

  [WebEngageEventName.PHARMACY_CART_UPLOAD_PRESCRIPTION_CLICKED]: {
    'Customer ID': string;
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
      | 'Insurance'; // List/Profile
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
  [WebEngageEventName.HOME_PAGE_VIEWED]: {
    source: 'deeplink' | 'app home';
  };
  [WebEngageEventName.PRODUCT_PAGE_VIEWED]: {
    source: ProductPageViewedSource;
    ProductId: string;
    ProductName: string;
    Stockavailability: YesOrNo;
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
    'Search Suggestion Clicked': string;
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
}
