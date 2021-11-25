import {
  DoctorType,
  MEDICINE_ORDER_STATUS,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { SymptomsSpecialities } from '@aph/mobile-patients/src/helpers/apiCalls';
import {
  PharmaUserStatus,
  UploadPrescSource,
} from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { CircleEventSource } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { ShoppingCartItem } from '../components/ShoppingCartProvider';
import { DIAGNOSTIC_SLOT_TYPE } from '@aph/mobile-patients/src/helpers/webEngageEvents';

type YesOrNo = 'Yes' | 'No';
type HdfcPlan = 'SILVER' | 'GOLD' | 'PLATINUM';
type PrescriptionOptions =
  | 'Prescription Upload'
  | 'Prescription Later'
  | 'Virtual Consult'
  | 'Not Applicable';
type SiteType = 'Hub' | 'LVDC' | 'CVDC';
export type PharmacyCircleMemberValues = 'Not Added' | 'Added' | 'Existing';

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
  PDP_ALL_SUSBTITUTES = 'PDP All Substitutes',
  PDP_FAST_SUSBTITUTES = 'PDP Fast Substitutes',
  BRAND_PAGES = 'brandPages',
  SPECIAL_OFFERS = 'Special Offers',
}

export enum DiagnosticHomePageSource {
  TAB_BAR = '247 Home bottom bar',
  HOMEPAGE_CTA = '247 Home CTA',
  BANNER = '247 Home banner',
  DEEPLINK = 'Deeplink',
}

export enum CleverTapEventName {
  //Consult Events
  CONSULT_DOCTOR_PROFILE_VIEWED = 'Consult Doctor Profile viewed',
  CONSULT_PAYMENT_MODE_SELECTED = 'Consult booking payment mode selected',
  CONSULT_CARD_CLICKED = 'Consult Card clicked',
  CONSULT_REPORT_UPLOAD_IN_CHATROOM = 'Consult report upload in chatroom',
  CONSULT_FEEDBACK_GIVEN = 'Consult feedback Given',
  CONSULT_RESCHEDULED_BY_THE_PATIENT = 'Consult Reschedule by the patient',
  CONSULT_RESCHEDULE_CLICKED = 'Consult Reschedule clicked',
  CONSULT_CANCEL_CLICKED_BY_PATIENT = 'Consult cancel clicked by patient',
  CONSULT_CONTINUE_CONSULTATION_CLICKED = 'Consult continue consultation clicked',
  CONSULT_CANCELLED_BY_PATIENT = 'Consult cancelled by patient',
  CONSULT_PAST_SEARCHES_CLICKED = 'Consult past searches clicked',
  CONSULT_HOMESCREEN_BOOK_DOCTOR_APPOINTMENT_CLICKED = 'Consult Homescreen Book doctor appointment clicked',
  CONSULT_SPECIALITY_CLICKED = 'Consult Speciality Clicked',
  CONSULT_SELECT_SPECIALITY_CLICKED = 'Consult select speciality clicked',
  CONSULT_PAY_BUTTON_CLICKED = 'Consult Pay Button Clicked',
  CONSULT_SORT = 'Consult Sort',
  CONSULT_BOOK_TESTS_IN_CHATROOM = 'Consult Book tests in Chatroom',
  CONSULT_ACTIVE_APPOINTMENTS = 'Consult Active appointments',
  CONSULT_BOOK_APPOINTMENT_CONSULT_CLICKED = 'Consult book appointment clicked',
  CONSULT_NO_SLOTS_FOUND = 'Consult no slots found',
  CONSULT_BOOK_CTA_CLICKED = 'Consult Book CTA clicked',
  CONSULT_VIEW_DETAILS_ON_PAST_APPOINTMENT = 'Consult View details clicked on past appointment',
  CONSULT_SEARCH_SUGGESTIONS = 'Consult search suggestions',
  CONSULT_SEARCH_SUGGESTIONS_CLICKED = 'Consult search suggestion clicked',
  CONSULT_MODE_SELECTED = 'Consult mode selected',
  CONSULT_MY_DOCTOR_CLICKED = 'Consult my doctor clicked',
  CONSULT_DOCTOR_TAB_CLICKED = 'Consult Doctor tab clicked',
  CONSULT_TYPE_SELECTION = 'Consult Consult Type Selection',
  CONSULTATION_BOOKED = 'Consultation Booked',
  CONSULT_ORDER_MEDICINES_IN_CHATROOM_CLICKED = 'Consult order medicines in chatroom clicked',
  CONSULT_UPLOAD_PRESCRIPTION_ADDRESS_SELECTED = 'Consult Upload prescription - Address selected',
  CONSULT_SEARCH = 'Consult Search',
  CONSULT_PROCEED_CLICKED_ON_SLOT_SELECTION = 'Consult Proceed Clicked on Slot Selection',
  CONSULT_PAYMENT_INITIATED = 'Consult Payment Initiated',
  CONSULT_USER_LOCATION = 'Consult user location',
  CONSULT_LOCATION_PERMISSION = 'Consult Location permission',
  USER_CHANGED_LOCATION = 'Change location',
  CONSULT_FILTER_APPLIED = 'Consult Filter applied',
  CONSULT_MEDICAL_DETAILS_FILLED = 'Consult Medical details filled',
  VIEW_PRESCRIPTION_CLICKED_APPOINTMENT_CARD = 'View Prescription Clicked on Appointment Card',

  //DOH events
  CONSULT_DOH_Viewed = 'Consult DOH viewed',
  CONSULT_DOH_Clicked = 'Consult DOH Clicked',

  //Consult Permissioon Events
  CONSULT_PERMISSIONS = 'Consult permissions',

  //Consult Dealyed
  CONSULT_DELAYED_MESSAGE_CLICKED = 'Consult Delayed Message clicked',

  // Symptom Tracker Events
  SYMPTOM_TRACKER_SELECT_OTHER_MEMBER_CLICKED = 'Symptom_Select other member clicked',
  SYMPTOM_TRACKER_MOST_TROUBLING_SYMPTOM_CLICKED = 'Symptoms_Most troubling symptom clicked',
  SYMPTOM_TRACKER_SUGGESTED_SYMPTOMS_CLICKED = 'Symptoms_suggested symptoms clicked',
  SYMPTOM_TRACKER_INFO_CLICKED = 'Symptoms_information sign clicked',
  SYMPTOM_TRACKER_CLICKED_ON_SPECIALITY_SCREEN = 'Consult Track symptoms on speciality screen',
  SYMPTOM_TRACKER_PAGE_CLICKED = 'Track symptoms clicked',
  SYMPTOM_TRACKER_ADD_SELECTED_SYMPTOMS_CLICKED = 'Symptoms_Add selected symptoms clicked',
  SYMPTOM_TRACKER_RESTART_CLICKED = 'Symptoms_restart symptom checker clicked',
  SYMPTOM_TRACKER_NO_OTHER_SYMPTOM_CLICKED = 'Symptoms_No other symptom clicked',
  SYMPTOM_TRACKER_CONSULT_DOCTOR_CLICKED = 'Symptoms_Consult doctor clicked',
  TRACK_SYMPTOMS = 'Symptom Checker Clicked',

  //Doctor Share Events
  CONSULT_SHARE_PROFILE_CLICKED = 'Consult share profile clicked',
  CONSULT_GO_BACK_CLICKED = 'Consult_go back clicked',
  CONSULT_SHARE_ICON_CLICKED = 'Consult share icon clicked',
  DOCTOR_PROFILE_SCREEN_BY_SHARE_LINK = 'Doctor profile screen by share link',

  //Payment Events
  PAYMENT_SCREEN_LOADED = 'Payment Screen Loaded',
  PAYMENT_TXN_INITIATED = 'Payment Txn Initiated',
  PAYMENT_TXN_RESPONSE = 'Payment Txn Response',
  PAYMENT_ORDER_STATUS = 'Payment Order Status',

  //Pharmacy events
  PHARMACY_CATEGORY_VIEWED = 'Pharmacy Category Viewed',
  PHARMACY_ADD_TO_CART = 'Pharmacy Add to Cart',
  PHARMACY_CART_VIEWED = 'Pharmacy Cart Viewed',
  PHARMACY_AVAILABILITY_API_CALLED = 'Pharmacy Availability API Called',
  PHARMACY_PROCEED_TO_PAY_CLICKED = 'Pharmacy Proceed to Pay Clicked',
  PHARMACY_CHECKOUT_COMPLETED = 'Pharmacy Checkout completed',
  PHARMACY_ORDER_SUMMARY_CLICKED = 'Pharmacy Order summary clicked',
  PHARMACY_HOME_PAGE_BANNER = 'Pharmacy Home Page Banner',
  PHARMACY_SEARCH_ENTER_CLICK = 'Pharmacy Search enter clicked',
  PHARMACY_PRODUCT_PAGE_VIEWED = 'Pharmacy Product Page Viewed',
  PHARMACY_SEARCH = 'Pharmacy Search',
  PHARMACY_NOTIFY_ME = 'Pharmacy Notify Me',
  PHARMACY_UPLOAD_PRESCRIPTION_CLICKED = 'Pharmacy Upload Prescription Clicked',
  PHARMACY_TAT_API_CALLED = 'Pharmacy TAT API Called',
  PHARMACY_CART_TAT_API_CALLED = 'Pharmacy Cart TAT API Called',
  PHARMACY_PROCEED_TO_ADD_NEW_ADDRESS_CLICK = 'Pharmacy Proceed to Add Address Clicked',
  PHARMACY_PAYMENT_INSTRUMENT_SELECTED = 'Pharmacy Payment Instrument Selected',
  PHARMACY_NONCART_ORDER_SUBMIT_CLICKED = 'Pharmacy Noncart Order Submit Clicked',
  UPLOAD_PRESCRIPTION_OPTION_SELECTED = 'Upload Prescription Option Selected',
  BUY_MEDICINES = 'Pharmacy Buy Medicines Clicked',
  PHARMACY_CART_ADDRESS_SELECTED_SUCCESS = 'Pharmacy Address Selected Success',
  PHARMACY_COUPON_ACTION = 'Pharmacy Coupon Action',
  CART_COUPON_APPLIED = 'Pharmacy cart - coupon applied',
  PHARMACY_ADD_NEW_ADDRESS_COMPLETED = 'Pharmacy Add New Address Completed',
  PHARMACY_CART_SKU_PRICE_MISMATCH = 'Pharmacy Cart SKU Price Mismatch',
  PHARMACY_BUY_AGAIN_VIEWED = 'Pharmacy Buy Again Viewed',
  PHARMACY_ITEMS_REMOVED_FROM_CART = 'Pharmacy Item Removed from Cart',
  PHARMACY_HOME_PAGE_VIEWED = 'Pharmacy Home page viewed',
  PHARMACY_PAYMENT_INITIATED = 'Pharmacy Payment Initiated',
  PHARMACY_ENTER_DELIVERY_PINCODE_SUBMITTED = 'Pharmacy Enter Delivery Pincode Submitted',
  PHARMACY_AUTO_SELECT_LOCATION_CLICKED = 'Pharmacy Pincode auto-selection clicked',
  PHARMACY_RE_ORDER_MEDICINE = 'Pharmacy Reorder Clicked',
  PHARMACY_MY_ORDERS_CLICKED = 'Pharmacy My Orders Clicked',
  PHARMACY_MY_ORDER_TRACKING_CLICKED = 'Pharmacy Track Order Clicked',
  PHARMACY_FAST_SUBSTITUTES_VIEWED = 'Pharmacy Fast Substitutes Viewed',
  PHARMACY_PRESCRIPTION_OPTION_CLICKED = 'Pharmacy Prescription Option Clicked',
  PHARMACY_APPLY_COUPON_CLICKED = 'Pharmacy Apply Coupon Clicked',
  PHARMACY_SPECIAL_OFFERS_CLICKED = 'Special Offers Clicked',
  PHARMACY_CHRONIC_UPSELL_NUDGE = 'Chronic Upsell Nudge',
  PHARMACY_SEARCH_SUCCESS = 'Pharmacy Search Success',

  // Help Section Events
  BACK_NAV_ON_NEED_HELP_CLICKED = 'Back Nav On Need Help Clicked',
  VIEW_PREVIOUS_TICKETS_CTA_ON_NEED_HELP = 'View Previous Tickets CTA On Need Help Clicked',
  LATEST_CS_TICKETS_ON_NEED_HELP = 'Latest CS Ticket On Need Help Clicked',
  EDIT_EMAIL_ADDRESS_ON_NEED_HELP = 'Edit Email Address On Need Help Clicked',
  BU_MODULE_TILE_ON_NEED_HELP = 'BU/Module Tile On Need Help Clicked',
  NEED_HELP_SCROLLED = 'Need Help Screen Scrolled',
  BACK_NAV_ON_C1 = 'Back Nav On C1 Help Clicked',
  ORDER_NAV_ON_C1_HELP = 'Order Nav On C1 Help Clicked',
  ORDER_REL_ISSUES_ON_C1_HELP = 'Order Rel Issues On C1 Help Clicked',
  CANCEL_ON_C1_HELP = 'Cancel On C1 Help Clicked',
  PREV_ORDERS_TILE_ON_C1_HELP = 'Prev Orders Tile On C1 Help Clicked',
  NON_ORDER_ISSUES_ON_C1_HELP = 'Non Order Issues On C1 Help Clicked',
  DETAILS_INPUTBOX_ON_C1_HELP = 'Details Inputbox On C1 Help Clicked',
  SUBMIT_CTA_ON_C1_HELP = 'Submit CTA On C1 Help Clicked',
  TICKET_ACKNOWLEDGEMENT_ON_C1_HELP_DISPLAYED = 'Ticket Acknowledgement On C1 Help Displayed',
  C1_HELP_SCREEN_SCROLLED = 'C1 Help Screen Scrolled',
  BACK_NAV_ON_C2_HELP = 'Back Nav On C2 Help Clicked',
  DETAILS_INPUT_ON_C2_HELP = 'Details Inputbox On C2 Help Clicked',
  SUBMIT_CTA_ON_C2_HELP = 'Submit CTA On C2 Help Clicked',
  TICKET_ACKNOWLEDGEMENT_ON_C2_HELP_DISPLAYED = 'Ticket Acknowledgement On C2 Help Displayed',
  CHAT_INPUTBOX_ON_TICKET_CHAT = 'Chat Inputbox On Ticket Chat Clicked',
  SEND_BUTTON_ON_TICKET_CHAT_CLICKED = 'Send Button On Ticket Chat Clicked',
  REOPEN_CTA_ON_TICKET_CHAT = 'Reopen CTA on Ticket Chat Clicked',
  TICKET_ACKNOWLEDGEMENT_ON_CHAT_DISPLAYED = 'Ticket Acknowledgement Ticket Chat Displayed',
  TICKET_CHAT_SCREEN_SCROLLED = 'Ticket Chat Screen Scrolled',
  CS_TICKET_ON_PREVIOUS_TICKETS = 'CS Ticket On Prev Tickets Clicked',
  PREVIOUS_TICKET_SCREEN_SCROLLED = 'Prev Tickets Screen Scrolled',

  // Diagnostics Events
  DIAGNOSTIC_LANDING_PAGE_VIEWED = 'Diagnostic landing page viewed',
  DIAGNOSTIC_PINCODE_ENTERED_ON_LOCATION_BAR = 'Diagnostic pincode entered',
  DIAGNOSTIC_SEARCH_CLICKED = 'Diagnostic search clicked',
  DIAGNOSTIC_HOME_PAGE_WIDGET_CLICKED = 'Diagnostic home page widgets clicked',
  DIAGNOSTIC_TEST_DESCRIPTION = 'Diagnostic test page viewed',
  DIAGNOSTIC_ADD_TO_CART = 'Diagnostic add to cart',
  DIAGNOSTIC_CART_VIEWED = 'Diagnostic cart page viewed',
  DIAGNOSTIC_MY_ORDERS = 'Diagnostics - My Orders Viewed',
  DIAGNOSTIC_ORDER_SUMMARY_VIEWED = 'Diagnostic order summary viewed',
  DIAGNOSTIC_VIEW_REPORT_CLICKED = 'Diagnostic view reports',

  DIAGNOSTIC_PATIENT_SELECTED = 'Diagnostic patient selected',
  DIAGNOSTIC_ADDRESS_SELECTED_CARTPAGE = 'Diagnostic address selected',
  DIAGNOSTIC_ITEM_REMOVE_ON_CARTPAGE = 'Diagonstic cart item removed',
  DIAGNOSTIC_ITEM_ADD_ON_CARTPAGE = 'Diagnostic add item clicked',

  DIAGNOSTIC_ADDRESS_NON_SERVICEABLE_CARTPAGE = 'Address Non Serviceable on Diagnostic Cart Page',
  DIAGNOSTIC_APPOINTMENT_TIME_SELECTED = 'Diagnostic slot time selected',
  DIAGNOSTIC_PROCEED_TO_PAY_CLICKED = 'Diagnostic make payment clicked',
  PAYMENT_INITIATED = 'Payment Initiated',
  DIAGNOSTIC_PAYMENT_INITIATED = 'Diagnostic payment initiated',
  DIAGNOSTIC_ORDER_PLACED = 'Diagnostic order placed',
  DIAGNOSTIC_TRACK_ORDER_VIEWED = 'Diagnostic track order viewed',
  DIAGNOSTIC_ORDER_RESCHEDULE = 'Diagnostic order rescheduled',
  DIAGNOSTIC_FEEDBACK_GIVEN = 'Diagnostic feedback submitted',
  DIAGNOSITC_HOME_PAGE_BANNER_CLICKED = 'Diagnostic home page banner clicked',
  DIAGNOSTIC_PAYMENT_PAGE_VIEWED = 'Diagnostic payment page viewed',
  DIAGNOSTIC_PHLEBO_FEEDBACK_SUBMITTED = 'Diagnostic phlebo feedback submitted',
  DIAGNOSTIC_PHLEBO_CALLING_CLICKED = 'Diagnostic phlebo calling clicked',
  DIAGNOSTIC_TRACK_PHLEBO_CLICKED = 'Diagnostic track phlebo clicked',
  DIGNOSTIC_PAYMENT_ABORTED = 'Diagnostic payment aborted',
  DIAGNOSITC_MODIFY_CLICKED = 'Diagnostic modify order clicked',
  DIAGNOSTIC_MODIFY_ORDER = 'Diagnostic modify order',
  DIAGNOSTIC_PRODUCT_LISTING_PAGE_VIEWED = 'Diagnostic product listing page viewed',
  DIAGNOSTIC_PRESCRIPTION_SUBMITTED = 'Diagnostic prescription submitted',

  //Conult Package Purchase Attribite
  CONSULT_PACKAGE_CLICKED = 'Consult Package Clicked',
  CONSULT_PACKAGE_PROCEED_TO_PAY_CLICKED = 'Consult package proceed to pay clicked',
  CONSULT_PACKAGE_PAY_BUTTON_CLICKED = 'Consult package pay button clicked',
  CONSULT_PACKAGE_BOOK_CONSULT_CLICKED = 'Consult package book consult clicked',

  // Network Test
  PRE_CALL_TEST = 'Pre Call Test Completed',

  // Ask Apollo
  CLICKED_ON_APOLLO_NUMBER = 'Clicked on Apollo Number',
  SUBMITTED_QUICK_BOOK_LEAD = 'Submitted Quick Book Lead',

  // Health Records
  CONSULT_RX = 'PHR Consult & RX',
  MEDICAL_RECORDS = 'PHR Medical Records',
  ADD_RECORD = 'Add Record',
  UPLOAD_PRESCRIPTION = 'Upload Prescription',
  UPLOAD_PHOTO = 'Upload Photo',
  ITEMS_CLICKED = 'Items Clicked',
  PHR_ORDER_MEDS_TESTS = 'PHR Order Order Tests and Meds Prescription Detail',
  PHR_CONSULT_CARD_CLICK = 'PHR Consult Card click',
  PHR_CLICK_DOCTOR_CONSULTATIONS = 'PHR Click Doctor Consultations',
  PHR_CLICK_TEST_REPORTS = 'PHR Click Test Reports',
  PHR_CLICK_HOSPITALIZATIONS = 'PHR Click Hospitalizations',
  PHR_CLICK_HEALTH_CONDITIONS = 'PHR Click Health Conditions',
  PHR_CLICK_BILLS = 'PHR Click Bills',
  PHR_CLICK_INSURANCES = 'PHR Click Insurances',
  PHR_ADD_DOCTOR_CONSULTATIONS = 'PHR Add Doctor Consultation',
  PHR_ADD_TEST_REPORT = 'PHR Add Test Report',
  PHR_ADD_VACCINATION_REPORT = 'PHR Add Vaccination Report',
  PHR_DELETE_VACCINATION_REPORT = 'PHR Delete Vaccination Report',
  PHR_UPDATE_VACCINATION_REPORT = 'PHR Update Vaccination Report',
  PHR_DOWNLOAD_VACCINATION_REPORT = 'PHR Download Vaccination Report',
  PHR_BAR_CHART_VISUALISATION = 'PHR Bar Chart Visualisation',
  PHR_REAL_TIME_LAB_TEST_REPORT = 'PHR Download Real Time Lab Test Reports',
  PHR_SHARE_LAB_TEST_REPORT = 'PHR Share Lab Test Report',
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
  PHR_LOAD_HEALTH_RECORDS = 'PHR Load Health Record',
  PHR_USER_LINKING = 'PHR User Linking',
  PHR_USER_DELINKING = 'PHR User DeLinking',
  PHR_NO_OF_USERS_SEARCHED_GLOBAL = 'PHR No Of Users searched Global',
  PHR_NO_USERS_SEARCHED_LOCAL = 'PHR No Of Users searched Local {0}',
  PHR_NO_OF_USERS_CLICKED_ON_RECORDS = 'PHR users seen on records in {0}',

  // Circle Events
  CIRCLE_LANDING_PAGE_VIEWED = 'Circle Landing page viewed',
  CIRCLE_MEMBERSHIP_PAGE_VIEWED = 'Circle membership page viewed',
  CIRCLE_POP_UP_VIEWED_PLANS_ONLY = 'Circle Pop up viewed (Plans only)',
  CIRCLE_PLAN_TO_CART = 'Circle Plan to Cart',
  CIRCLE_PLAN_REMOVE_FROM_CART = 'Circle Plan Removed from cart',
  CIRCLE_PAYMENT_PAGE_VIEWED_STANDALONE_CIRCLE_PURCHASE_PAGE = 'Circle payment page viewed (Standalone circle purchase page)',
  CIRCLE_BENIFIT_CLICKED = 'Circle Benefit Clicked',

  //HomePage Events
  MANAGE_DIABETES = 'Diabetes Program Viewed',
  HOME_VIEWED = 'Home page viewed',
  MOBILE_NUMBER_ENTERED = 'Login Mobile Number Entered',
  OTP_VERIFICATION_SUCCESS = 'OTP Verification Success',
  OTP_ENTERED = 'Login OTP Submitted',
  REGISTRATION_DONE = 'Registration Done',
  USER_LOGGED_IN_WITH_TRUECALLER = 'User logged in with truecaller',
  TRUECALLER_EVENT_ERRORS = 'Truecaller event errors',
  TRUECALLER_APOLLO247_LOGIN_ERRORS = 'Apollo247 truecaller login errors',
  LOGIN_WITH_TRUECALLER_CLICKED = 'Login with truecaller clicked',

  FAQs_ARTICLES_CLICKED = 'Vaccination FAQs & Articles clicked',
  VACCINATION_CALL_A_DOCTOR_CLICKED = 'Vaccination Call a doctor clicked',
  VACCINATION_CONSULT_CLICKED = 'Vaccination Consult Clicked',
  VACCINATION_BOOK_SLOT_CLICKED = 'Vaccination Book Slot Clicked',
  READ_BLOG_VIEWED = 'Read Blog Clicked',
  CHECK_RISK_LEVEL_CLICKED = 'Check Risk Level Clicked',
  EXPLORE_CORPORATE_MEMBERSHIP_CLICKED = 'Explore Corporate Membership Clicked',
  KAVACH_PROGRAM_CLICKED = 'Kavach Program Clicked',
  MY_CART_CLICKED = 'My Cart Clicked',
  NOTIFICATION_CENTER_CLICKED = 'Notification Center Clicked',

  //My Accounts
  MY_ACCOUNT = 'My Account Clicked',
  MY_ACCOUNT_NEED_HELP_CLICKED = 'My Account Need help Clicked',
  MY_ACCOUNT_USER_LOGOUT = 'User Logout Clicked',
  MY_ACCOUNT_ABOUT = 'My Account About',
  MY_ACCOUNT_MEMBERSHIP_CLICKED = 'My Account Membership Clicked',
  MY_ACCOUNT_ONE_APOLLO_MEMBERSHIP_CLICKED = 'My Account One Apollo Membership Clicked',
  MY_ACCOUNT_PAYMENT_CLICKED = 'My Account Payment Clicked',
  MY_ACCOUNT_ORDERS_CLICKED = 'My Account Orders Clicked',
  MY_ACCOUNT_FAMILY_MEMBER_CLICK = 'My Account Family Member Clicked',
  MY_ACCOUNT_ADDRESS_BOOK_CLICKED = 'My Account  Address Book Clicked',

  // other
  MOBILE_ENTRY = 'Mobile Entry',
  PRE_APOLLO_CUSTOMER = 'Pre Apollo Customer',
  OTP_ON_CALL_CLICK = 'OTP on call clicked',
  NUMBER_OF_PROFILES_FETCHED = 'Number of Profiles fetched',
  PHARMACY_SEARCH_RESULTS = 'Pharmacy Search Results',
  PRODUCT_DETAIL_TAB_CLICKED = 'Product Detail Tab Clicked',
  PRODUCT_DETAIL_PINCODE_CHECK = 'Product Detail Pincode Check',
  CATEGORY_FILTER_CLICKED = 'Pharmacy Category Filter Clicked',
  CATEGORY_FILTER_APPLIED = 'Pharmacy Category Filter Applied',
  CATEGORY_LIST_GRID_VIEW = 'Listing view',
  SHOW_PRESCRIPTION_AT_STORE_SELECTED = 'Show prescription at store selected',
  PHARMACY_STORE_PICKUP_VIEWED = 'Pharmacy store pickup viewed',
  PHARMACY_STORE_SELECTED_SUCCESS = 'Pharmacy store selected success',
  PHARMACY_ADD_TO_CART_NONSERVICEABLE = 'Pharmacy Add to cart Nonserviceable',
  TAT_API_FAILURE = 'Tat API Failure',
  CART_UPLOAD_PRESCRIPTION_CLICKED = 'Cart - upload prescription',
  UPLOAD_PRESCRIPTION_SUBMIT_CLICKED = 'Upload Prescription Submit Clicked',
  UPLOAD_PRESCRIPTION_NEW_ADDRESS = 'Upload prescription - New address added',
  PHARMACY_DETAIL_IMAGE_CLICK = 'Product Detail page Image clicked',
  DOCTOR_CLICKED = 'Doctor card on doctor listing screen clicked',
  BOOK_APPOINTMENT = 'Book Appointment',
  CONSULT_COUPON_APPLIED = 'Coupon Applied',
  PHARMACY_FEEDBACK_GIVEN = 'Pharmacy Feedback Given',
  HOMEPAGE_WIDGET_FOLLOWUP_CLICK = 'Home Page Consult Widget Follow Up Click',
  DOCTOR_CONNECT_CARD_CLICK = 'Doctor Connect Card Click',
  CONSULTED_WITH_DOCTOR_BEFORE = 'Chat Window Consulted with doctor before alert',
  DOCTOR_SPECIALITY_SEARCH_NO_RESULT = 'Doctor Speciality Fuzzy Search No Result',
  CONFIRM_LOCATION = 'Confirm Location',
  DOCTOR_PROFILE_THROUGH_DEEPLINK = 'Doctor profile through deeplink',
  SEARCH_SUGGESTIONS_VIEW_ALL = 'User clicked on View All',
  RETURN_REQUEST_START = 'Return Request Start',
  RETURN_REQUEST_SUBMITTED = 'Return Request Submitted',
  MOVED_AWAY_FROM_HOME = 'User moved away from Homepage',
  DOCTOR_CARD_CONSULT_CLICK = 'Doctor card Consult in x minutes clicked',
  CONSULT_MODE_TOGGLE = 'Consult mode clicked',
  CONSULT_SELECT_LOCATION = 'Consult location select clicked',
  CONSULT_HOSPITAL_CLICKED = 'Consult Hospital Visit clicked',

  PHARMACY_CART_ADDRESS_SELECTED_FAILURE = 'Pharmacy Cart Address Selected Failure',
  PHARMACY_CART_SELECT_DELIVERY_ADDRESS_CLICKED = 'Pharmacy Cart - Select Delivery Address Clicked',
  PHARMACY_CART_UPLOAD_PRESCRIPTION_CLICKED = 'Pharmacy Cart - Upload Prescription Clicked',
  // HomePageElements Events
  ORDER_TESTS = 'Order Tests',
  PROHEALTH = 'Prohealth',
  VIEW_HELATH_RECORDS = 'PHR Click Health Record',
  LEARN_MORE_ABOUT_CORONAVIRUS = 'Learn more about coronavirus',
  CHECK_YOUR_RISK_LEVEL = 'Check your risk level',
  APOLLO_PRO_HEALTH = 'Apollo pro health',
  NOTIFICATION_ICON = 'Notification Icon clicked',
  ACTIVE_PROHEALTH_APPOINTMENTS = 'PROHEALTH_ACTIVE_APPOINTMENTS',
  NEED_HELP = 'Need Help?',
  TICKET_RAISED = 'Ticket raised',
  HELP_TICKET_SUBMITTED = 'Help_Ticket_Submitted',
  TABBAR_APPOINTMENTS_CLICKED = 'Appointments Clicked on tab bar',
  APOLLO_KAVACH_PROGRAM = 'Apollo Kavach Program',
  COVID_VACCINE_TRACKER = 'Covid Vaccine Tracker',
  READ_ARTICLES = 'Read Articles',
  HDFC_HEALTHY_LIFE = 'Explore HDFC Tile Clicked on Homepage',

  VACCINATION_PROCEED_TO_CONNECT_A_DOCTOR_CLICKED = 'Vaccination Call a doctor - Proceed to connect',
  VACCINATION_CHAT_WITH_US = 'Vaccination Chat with us',
  VACCINATION_TRACKER_ON_HOME_PAGE = 'Vaccine tracker on home page',
  COVID_VACCINATION_SECTION_CLICKED = 'Covid Vaccination Section Clicked',

  // ConsultRoom Events
  COMPLETED_AUTOMATED_QUESTIONS = 'Completed Automated Questions',
  JD_COMPLETED = 'JD Completed',
  CHAT_WITH_US = 'Chat with us',
  PRESCRIPTION_RECEIVED = 'Prescription Received',
  SD_CONSULTATION_STARTED = 'SD Consultation Started',
  SD_VIDEO_CALL_STARTED = 'SD Video call started',
  DOWNLOAD_PRESCRIPTION = 'Download Prescription',
  VIEW_PRESCRIPTION_IN_CONSULT_DETAILS = 'View Prescription in Consult Details',
  CART_PRESCRIPTION_OPTION_SELECTED_PROCEED_CLICKED = 'Cart Prescription Option Selected & Proceed Click',
  ORDER_MEDICINES_FROM_PRESCRIPTION_DETAILS = 'PHR Order Meds Prescription Detail',
  ORDER_TESTS_FROM_PRESCRIPTION_DETAILS = 'PHR Order Tests Prescription Detail',
  CONTINUE_CONSULT_CLICKED = 'Continue Consult Clicked',
  CHAT_WITH_DOCTOR = 'Chat with Doctor',
  OPENTOK_EVENT_RECEIVED = 'OpenTok Event Received',
  OPENTOK_ERROR_RECEIVED = 'OpenTok Error Received',
  Order_Medicine_From_View_Prescription = 'OrderMedicineFromViewPrescription',
  Book_Tests_From_View_Prescription = 'BookTestsFromViewPrescription',

  DOCTOR_RESCHEDULE_CLAIM_REFUND = 'Doctor reschedule and Claim Refund button click',
  UPLOAD_RECORDS_CLICK_CHATROOM = 'Upload Records in chatroom clicked',
  TAKE_PHOTO_CLICK_CHATROOM = 'Take a photo in consult room clicked',
  GALLERY_UPLOAD_PHOTO_CLICK_CHATROOM = 'choose from gallery in consult room clicked',
  UPLOAD_PHR_CLICK_CHATROOM = 'Upload from PHR in consult room clicked',
  PATIENT_JOINED_CONSULT = 'Patient Joined the consult with doctor',
  PATIENT_ENDED_CONSULT = 'Patient ended the consult',
  CALL_ENDED = 'Call Ended',
  PATIENT_ANSWERED_CALL = 'Patient Answered the call',
  PATIENT_DECLINED_CALL = 'Patient Declined the call',
  PATIENT_MISSED_CALL = 'Patient Missed the call',
  CALL_DROPPED_UNKNOWN_REASON = 'Call Dropped Due to Unknown Reason',
  // Medicine Events
  PHARMACY_ENTER_DELIVERY_PINCODE_CLICKED = 'Pharmacy Enter Delivery Pincode Clicked',
  PHARMACY_PINCODE_NONSERVICABLE = 'Pharmacy location nonservicable',
  CALL_THE_NEAREST_PHARMACY = 'Call the Nearest Pharmacy',
  // Payments Events
  PAYMENT_INSTRUMENT = 'Payment Instrument',
  PAYMENT_STATUS = 'Payment Status',
  PAYMENT_FAILED_AND_CONVERTED_TO_COD = 'Payment Failed & Converted to COD',
  // Deeplink Events
  CATEGORY_PAGE_VIEWED = 'Category page viewed',

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
  PATIENT_EXTERNAL_MEETING_LINK_CLICKED = 'Patient Clicked on Video Link',
  // Symptom Tracker Events
  SYMPTOM_TRACKER_FOR_MYSELF = 'Myself clicked SC',
  SYMPTOM_TRACKER_ADD_OTHER_SYMPTOM_CLICKED = 'Add other symptom clicked SC',
  SYMPTOM_TRACKER_SEARCH_SYMPTOMS = 'User searched symptom SC',

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

  //Vaccination Booking
  VACCINATION_BOOKING_CONFIRMATION = 'Vaccine_Booking confirmation',
  VACCINATION_CANCELLATION = 'Vaccine_Cancellation',
  PHR_CLICK_VACCINATION = 'PHR_CLICK_VACCINATION',

  HOME_ICON_CLICKED = 'Homepage logo Clicked',
  //Home Page Event
  USER_PROFILE_IMAGE_NAME_CLICKED = 'User Profile Image name Clicked',
  ADD_MEMBER_PROFILE_CLICKED = 'Add Members Profile Clicked',
  SAVE_MEMBER_PROFILE_CLICKED = 'Save Member Profile Clicked',
  CONFIRM_MEMBER_PROFILE_CLICKED = 'Confirm Member Profile Clicked',
  LOGIN_DONE = 'Login Done',

  //Auth Clever tap events
  GET_OTP_ON_CALL = 'Get OTP On call Clicked',
  LOGIN_VIA_TRUECALLER = 'Login Via Truecaller Clicked',
  LOGIN_WITH_TRUECALLER_CONTINUE = 'Login with true caller continue clicked',
  LOGIN_WITH_TRUECALLER_SKIPPED = 'Login with true caller skip clicked',

  //App Review and Rating on Playstore
  PLAYSTORE_APP_REVIEW_AND_RATING = 'Playstore app review and rating',
  APP_REVIEW_AND_RATING_TO_PLAYSTORE = 'Playstore review popup showed',
  APP_REVIEW_AND_RATING_TO_APPSTORE = 'Appstore review popup showed',
  //Upload Prescription
  PHARMACY_PRESCRIPTION_UPLOADED = 'Pharmacy Prescription Uploaded',
  // Custom UTM Events
  CUSTOM_UTM_VISITED = 'App launch source',
}

export interface PatientInfo {
  'Patient name': string;
  'Patient UHID': string;
  Relation: string;
  'Patient age': number;
  'Patient Gender': string;
  'Mobile Number': string;
  'Customer ID': string;
  User_Type?: string;
}

export interface UserInfo {
  'Patient UHID': string;
  'Mobile Number': string;
  'Customer ID': string;
}

export interface UserInfoWithSource extends UserInfo {
  Source: 'Apollo Doctors' | 'Partner Doctors';
}
export interface DOHInfo {
  'Doctor type': string;
  'Doctor name': string;
  'Speciality ID': string;
  'Speciality name': string;
  Zone: string;
  'Patient name': string;
  'Mobile number': string;
  'Doctor ID': string;
  'Patient UHID': string;
  'Patient age': number;
  'Patient gender': string;
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
  'User Type'?: any;
}
export interface DiagnosticLandingPage extends DiagnosticUserInfo {
  Source: DiagnosticHomePageSource;
  'Circle user'?: string;
}

export interface DiagnosticServiceble {
  'Patient UHID': string;
  State: string;
  City: string;
  'PinCode Entered': number;
}

export interface ConsultRoomDoctorPatientInfo {
  'Patient Name': string;
  'Patient UHID': string;
  'Doctor Name': string;
  'Speciality name': string;
  'Doctor ID': string;
  'Speciality ID': string;
  'Patient Age': number;
  'Patient Gender': string;
  'Hospital Name': string;
  'Hospital City': string;
  Source: 'Camera' | 'Gallery' | 'PHR Section';
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

export interface HomeScreenAttributes {
  'Patient name': string;
  'Patient UHID': string;
  Relation: string;
  'Patient age': number;
  'Patient gender': string;
  'Mobile Number': string;
  'Customer ID': string;
  User_Type: string;
  isConsulted: string;
  Source?: 'Home Screen' | 'Menu' | 'My Account Screen';
  'Page Name'?: string;
  'Nav src'?:
    | 'hero banner'
    | 'Bottom bar'
    | 'app launch'
    | 'homepage bar'
    | 'Vaccine Widget'
    | 'Blog Widget'
    | 'my account'
    | 'Top bar';
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

interface CircleAttributes {
  customer_id: string;
  circle_planid?: string;
  circle_start_date?: Date | string;
  circle_end_date?: Date | string;
  user_type?: string;
  navigation_source?: string | CircleEventSource;
  duration_in_months?: string | number;
  corporate_name?: string;
  source_identifier?: string;
  price?: number | string;
  destination?: string;
  plan_id?: string;
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

export interface SpecialityClickedEvent {
  'Patient name': string;
  'Patient UHID': string;
  Relation?: string;
  'Patient age': number;
  'Patient gender': string;
  'Mobile number': string;
  'Customer ID': string;
  'Speciality name': string;
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
  'Nav src': string;
  'Order type': 'Cart' | 'Non Cart' | 'Offline';
  'No of items not available'?: number;
}

export interface ItemSearchedOnLanding extends DiagnosticUserInfo {
  'Keyword Entered': string;
  '# Results appeared': number;
  'Item in Results'?: object[];
  Popular?: 'Yes' | 'No';
  'Circle user'?: string;
}

export interface ItemClickedOnLanding extends DiagnosticUserInfo {
  'Item Clicked': object;
}

export interface DiagnosticPinCode extends DiagnosticUserInfo {
  Pincode: number | string;
  Serviceability: 'Yes' | 'No';
  'Circle user'?: string;
}

export interface DoctorFilterClick {
  'Patient name': string;
  'Patient UHID': string;
  'Mobile Number': string;
  'Patient gender': string;
  'Patient age': number;
  pincode: number | string;
  User_Type: string;
  docCategoryTab: string;
  selectedCity: string;
  filtersApplied: string;
  'Filter Value': string;
}
export interface FollowUpAppointment {
  'Customer ID': string;
  patientName: string;
  patientUhid: string;
  patientAge: number;
  doctorId?: string;
  doctorName?: string;
  specialityName?: string;
  specialityId?: string;
  doctorCategory?: DoctorType;
  consultDateTime?: Date;
  consultMode: 'ONLINE' | 'PHYSICAL';
  doctorCity?: string;
  consultId?: string;
  isConsulted?: string;
  isConsultStarted: boolean;
  Prescription?: string;
  Source: 'Cancelled appointment' | 'Past appointment' | undefined;
  patientGender: string;
}

export interface consultCallEndData {
  'Patient User ID': string;
  'Patient Name': string;
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

interface LoginOtpAttributes {
  'Mobile Number': string;
  'Nav src': string;
  'Page Name': string;
  value?: YesOrNo;
}
export interface CleverTapEvents {
  // ********** AppEvents ********** \\

  [CleverTapEventName.MOBILE_ENTRY]: {};
  [CleverTapEventName.MOBILE_NUMBER_ENTERED]: LoginOtpAttributes;
  [CleverTapEventName.OTP_ENTERED]: LoginOtpAttributes;
  [CleverTapEventName.PRE_APOLLO_CUSTOMER]: { value: YesOrNo };
  [CleverTapEventName.OTP_VERIFICATION_SUCCESS]: LoginOtpAttributes;
  [CleverTapEventName.OTP_ON_CALL_CLICK]: {
    'Mobile Number': string;
  };
  [CleverTapEventName.REGISTRATION_DONE]: {
    'Customer ID': string;
    'Full Name': string;
    DOB?: Date | string;
    Gender?: string;
    'Email ID'?: string;
    'Referral Code'?: string;
    'Mobile Number': string;
    'Nav src': string;
    'Page Name': string;
  };
  [CleverTapEventName.NUMBER_OF_PROFILES_FETCHED]: { count: number };
  [CleverTapEventName.CONSULT_ORDER_MEDICINES_IN_CHATROOM_CLICKED]: UserInfo;
  [CleverTapEventName.CONSULT_BOOK_TESTS_IN_CHATROOM]: UserInfo;

  // DOH Events \\
  [CleverTapEventName.CONSULT_DOH_Viewed]: DOHInfo;
  [CleverTapEventName.CONSULT_DOH_Clicked]: DOHInfo;

  // ********** Home Screen Events ********** \\

  [CleverTapEventName.BUY_MEDICINES]: {
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
    'Circle Member': PharmacyCircleMemberValues;
    'Circle Membership Value'?: number | null;
    User_Type?: PharmaUserStatus;
  };
  [CleverTapEventName.ORDER_TESTS]: PatientInfoWithSource;
  [CleverTapEventName.MANAGE_DIABETES]: PatientInfo;
  [CleverTapEventName.TRACK_SYMPTOMS]: PatientInfo;
  [CleverTapEventName.VIEW_HELATH_RECORDS]: PatientInfoWithSource;
  [CleverTapEventName.LEARN_MORE_ABOUT_CORONAVIRUS]: { clicked: true };
  [CleverTapEventName.CHECK_YOUR_RISK_LEVEL]: { clicked: true };
  [CleverTapEventName.APOLLO_KAVACH_PROGRAM]: { clicked: true };
  [CleverTapEventName.HDFC_HEALTHY_LIFE]: {
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
  [CleverTapEventName.NOTIFICATION_ICON]: { clicked: true };
  [CleverTapEventName.CONSULT_ACTIVE_APPOINTMENTS]: { clicked: true };
  [CleverTapEventName.ACTIVE_PROHEALTH_APPOINTMENTS]: { clicked: true };
  [CleverTapEventName.NEED_HELP]: PatientInfoWithNeedHelp; // source values may change later
  [CleverTapEventName.TICKET_RAISED]: { Category: string; Query: string };
  [CleverTapEventName.HELP_TICKET_SUBMITTED]: {
    Source_Page: 'My Account' | 'My Orders' | 'Order Details';
    Reason: string;
    BU: string; //  Pharmacy / Consult / Diagnostics / ..........
    Order_Status?: string;
  };
  [CleverTapEventName.MY_ACCOUNT]: PatientInfo;
  [CleverTapEventName.CONSULT_HOMESCREEN_BOOK_DOCTOR_APPOINTMENT_CLICKED]: {
    'Patient name': string;
    'Patient UHID': string;
    Relation: string;
    'Patient age': number;
    'Patient gender': string;
    'Mobile number': string;
    'Customer ID': string;
    User_Type: string;
    isConsulted: string;
    Source?: 'Home Screen' | 'Menu';
    'Page Name': string;
    'Nav src': string;
    'Circle Member': string;
    'Circle Plan type': string;
    'Mode of consult'?: 'Hospital Visit' | 'Video Consult';
    CTA?: 'Primary' | 'Secondary';
  };
  [CleverTapEventName.TABBAR_APPOINTMENTS_CLICKED]: PatientInfoWithSource;
  [CleverTapEventName.CONSULT_PAST_SEARCHES_CLICKED]: {
    'Patient name': string;
    'Patient UHID': string;
    'Patient age': number;
    'Patient gender': string;
    User_Type?: string;
    doctorName?: string;
    doctorId?: string;
    specialtyName?: string;
    specialtyId?: string;
    fee?: number;
    languages?: string;
    doctorHospital?: string;
    city?: string;
    address?: string;
    isConsulted?: string;
  };

  // ********** PharmaCircleEvents ********** \\
  [CleverTapEventName.PHARMA_CIRCLE_BANNER_CLICKED]: CircleUserInfo;
  [CleverTapEventName.PHARMA_HOME_UPGRADE_TO_CIRCLE]: UserInfo;
  [CleverTapEventName.PHARMA_HOME_KNOW_MORE_CLICKED_CIRCLE_POPUP]: CircleUserInfo;
  [CleverTapEventName.PHARMA_PRODUCT_UPGRADE_TO_CIRCLE]: CircleUserInfo;
  [CleverTapEventName.PHARMA_PRODUCT_KNOW_MORE_CLICKED_CIRCLE_POPUP]: UserInfo;
  [CleverTapEventName.PHARMA_PRODUCT_ADD_TO_CART_CLICKED_CIRCLE_POPUP]: UserInfo;
  [CleverTapEventName.PHARMA_CART_KNOW_MORE_CLICKED_CIRCLE_POPUP]: UserInfo;
  [CleverTapEventName.PHARMA_CART_ADD_TO_CART_CLICKED_CIRCLE_POPUP]: UserInfo;
  [CleverTapEventName.PHARMA_CART_CIRCLE_MEMBERSHIP_REMOVED]: UserInfo;
  [CleverTapEventName.PHARMA_WEBVIEW_PLAN1]: UserInfo;
  [CleverTapEventName.PHARMA_WEBVIEW_PLAN2]: UserInfo;
  [CleverTapEventName.PHARMA_WEBVIEW_PLAN3]: UserInfo;
  [CleverTapEventName.PHARMA_WEBVIEW_PLAN_SELECTED]: UserInfo;
  [CleverTapEventName.PURCHASE_CIRCLE]: CirclePurchaseInfo;

  // ********** DiagnosticCircleEvents ********** \\
  [CleverTapEventName.DIAGNOSTICS_CIRCLE_BANNER_CLICKED]: CircleUserInfo;
  [CleverTapEventName.DIAGNOSTICS_BUY_NOW_CLICKED_CIRCLE_POPUP]: CircleUserInfo;
  [CleverTapEventName.DIAGNOSTICS_KNOW_MORE_CLICKED_CIRCLE_POPUP]: CircleUserInfo;
  [CleverTapEventName.DIAGNOSTIC_OTHER_PAYMENT_OPTION_CLICKED_POPUP]: CircleUserInfo;
  [CleverTapEventName.DIAGNOSTIC_CIRCLE_BENIFIT_APPLIED]: CircleUserInfo;

  // ********** MY Membership circle events ********
  [CleverTapEventName.MY_MEMBERSHIP_VIEW_DETAILS_CLICKED]: CircleUserInfo;
  [CleverTapEventName.MY_MEMBERSHIP_PHARMACY_CASHBACK_BENEFITS_CLICKED]: CircleUserInfo;
  [CleverTapEventName.MY_MEMBERSHIP_FREE_DELIVERY_CLICKED]: CircleUserInfo;
  [CleverTapEventName.MY_MEMBERSHIP_DOCTOR_HELPLINE_CLICKED]: CircleUserInfo;
  [CleverTapEventName.MY_MEMBERSHIP_DIAGNOSTICS_DISCOUNTS_CLICKED]: CircleUserInfo;
  [CleverTapEventName.MY_MEMBERSHIP_PRO_HEALTH_CLICKED]: CircleUserInfo;
  [CleverTapEventName.MY_MEMBERSHIP_DOC_ON_CALL_CLICKED]: CircleUserInfo;
  [CleverTapEventName.MY_MEMBERSHIP_ADVANCED_DIABETES_CLICKED]: CircleUserInfo;
  [CleverTapEventName.MY_MEMBERSHIP_COVID_CARE_CLICKED]: CircleUserInfo;
  [CleverTapEventName.MY_MEMBERSHIP_DIGITALIZATION_OF_PHR_CLICKED]: CircleUserInfo;
  [CleverTapEventName.MY_MEMBERSHIP_DIAGNOSTICS_HOME_SAMPLE_CLICKED]: CircleUserInfo;

  // **** HOMEPAGE BANNER ******
  [CleverTapEventName.COVID_BANNER_CLICKED]: UserInfo;
  [CleverTapEventName.NON_CIRCLE_HOMEPAGE_BANNER_CLICKED]: CircleUserInfo;
  [CleverTapEventName.MEMBERSHIP_DETAILS_BANNER_CLICKED]: CircleUserInfo;
  [CleverTapEventName.HOMEPAGE_DOC_ON_CALL_BANNER_CLICKED]: CircleUserInfo;
  [CleverTapEventName.NON_CIRCLE_HOMEPAGE_VIEWED]: CircleUserInfo;
  [CleverTapEventName.NON_CIRCLE_PLAN_SELECTED]: CircleUserInfo;
  [CleverTapEventName.NON_CIRCLE_BUY_NOW_CLICKED]: CircleUserInfo;
  [CleverTapEventName.NON_CIRCLE_PAYMENT_MODE_SELECTED]: CircleUserInfo;
  [CleverTapEventName.NON_CIRCLE_PAYMENT_DONE]: CircleUserInfo;
  [CleverTapEventName.HC_1CLICK_ACTIVATION]: CircleUserInfo;

  // ********** PermissionEvents ********** \\
  [CleverTapEventName.CONSULT_PERMISSIONS]: {
    'Screen Name': 'Payment Confirmation Screen' | 'Home Screen' | 'Appointment Screen';
    Camera?: boolean;
    Microphone?: boolean;
  };

  // ********** Network Test ********** \\
  [CleverTapEventName.PRE_CALL_TEST]: {
    'Device Details': string;
    'Test Result': string;
    'Patient Name': string;
    'Patient Number': string;
    'Doctor Name': string;
    'Doctor Number': string;
    'Consult ID': string;
    'Consult Display ID': string | number;
    'Doctor Type': string;
    'Doctor Speciality': string;
  };

  // ********** Ask Apollo  ********** \\
  [CleverTapEventName.CLICKED_ON_APOLLO_NUMBER]: {
    'Screen type': string;
    'Speciality ID'?: string;
    'Speciality Name'?: string;
    'Doctor ID'?: string;
    'Doctor Name'?: string;
    'Doctor Type'?: string;
    'Doctor Hospital Id'?: string;
    'Doctor Hospital Name'?: string;
    'Patient Number': string;
  };

  [CleverTapEventName.SUBMITTED_QUICK_BOOK_LEAD]: {
    'Screen type': string;
    'Speciality ID'?: string;
    'Speciality Name'?: string;
    'Doctor ID'?: string;
    'Doctor Name'?: string;
    'Doctor Type'?: string;
    'Doctor Hospital Id'?: string;
    'Doctor Hospital Name'?: string;
    'Patient Number'?: string;
    'Entered Name'?: string;
    'Entered Email'?: string;
    'Entered Mobile Number'?: string;
  };

  // *********** Delayed Reminder Event ******* \\
  [CleverTapEventName.CONSULT_DELAYED_MESSAGE_CLICKED]: {
    'Doctor Name': string;
    'Doctor Number': string;
    'Doctor ID': string;
    'Display Speciality Name': string;
    'Display ID': number | null;
    'Patient Name': string;
    'Patient Phone Number': string;
    'Phone number clicked': string;
  };
  // ********** PharmacyEvents ********** \\

  [CleverTapEventName.PHARMACY_SEARCH]: {
    keyword: string;
    source: 'Pharmacy Home' | 'Pharmacy List' | 'Pharmacy PDP';
    results: number;
    'User Type'?: PharmaUserStatus;
  };
  [CleverTapEventName.PHARMACY_SEARCH_ENTER_CLICK]: {
    keyword: string;
    'No of results': number;
    source: string;
  };
  [CleverTapEventName.PHARMACY_SEARCH_RESULTS]: {
    keyword: string;
    Source: 'Pharmacy Home' | 'Pharmacy Search';
  };
  [CleverTapEventName.PRODUCT_DETAIL_PINCODE_CHECK]: {
    'product id': string; // (SKUID)
    'product name': string;
    'customer id': string;
    pincode: number;
    Serviceable: 'Yes' | 'No';
    'Delivery TAT': number;
  };
  [CleverTapEventName.PRODUCT_DETAIL_TAB_CLICKED]: {
    tabName: string;
  };
  [CleverTapEventName.PHARMACY_NOTIFY_ME]: {
    'Product name': string;
    'SKU ID': string; // (SKUID)
    'Category ID': string;
    Price: number;
    Pincode: string;
    Serviceability: YesOrNo;
  };

  [CleverTapEventName.PHARMACY_CATEGORY_VIEWED]: {
    'Category name'?: string;
    'Category ID'?: string;
    'Nav src': 'Home' | 'Category Tree';
    'Section name'?: string;
  };
  [CleverTapEventName.CATEGORY_FILTER_CLICKED]: {
    'Category Name': string;
    'Category ID': string;
  };
  [CleverTapEventName.CATEGORY_FILTER_APPLIED]: {
    'Category Name': string;
    'Category ID': string;
    discount: string;
    'sort by': string;
    price: string;
  };
  [CleverTapEventName.CATEGORY_LIST_GRID_VIEW]: {
    'Category Name'?: string;
    'Category ID'?: string;
    Type: 'Grid' | 'List';
    Source: 'Search' | 'Category';
  };
  [CleverTapEventName.SHOW_PRESCRIPTION_AT_STORE_SELECTED]: {
    value: boolean;
  };
  [CleverTapEventName.PHARMACY_STORE_PICKUP_VIEWED]: {
    Pincode: string;
    'Store display success': YesOrNo;
  };
  [CleverTapEventName.PHARMACY_STORE_SELECTED_SUCCESS]: {
    Pincode: string;
    'Store ID': string;
    'Store Name': string;
    'Store Number': string;
    'Store Address': string;
  };
  [CleverTapEventName.PHARMACY_ADD_TO_CART]: {
    'Product name': string;
    'SKU ID': string; // (SKUID)
    Price: number;
    'Discounted price'?: number;
    Quantity: number;
    'Nav src':
      | 'Pharmacy Home'
      | 'Pharmacy PDP'
      | 'Pharmacy List'
      | 'Pharmacy Partial Search'
      | 'Pharmacy Full Search'
      | 'Similar Widget'
      | 'Pharmacy Cart'
      | 'Category Tree'
      | 'PDP All Substitutes'
      | 'PDP Fast Substitutes'
      | 'Special Offers'
      | 'Chronic Upsell Nudge';
    Brand?: string;
    'Brand ID'?: string;
    'Category name'?: string;
    'Category ID'?: string;
    Section?: string;
    'Section name'?: string;
    'AF revenue'?: number;
    'AF currency'?: string;
    'Circle member': PharmacyCircleMemberValues;
    'Circle membership value'?: number | null;
    'Cart items'?: number;
  };
  [CleverTapEventName.PHARMACY_ADD_TO_CART_NONSERVICEABLE]: {
    'product name': string;
    'product id': string;
    pincode: string;
    'Mobile Number': string;
  };

  [CleverTapEventName.PHARMACY_CART_VIEWED]: {
    'Customer ID': string;
    'Total items in cart': number;
    'Sub total': number;
    'Shipping charges': number;
    'Coupon code used'?: string;
    'Total discount': number;
    'Order value': number;
    'Prescription required'?: YesOrNo;
    'Cart ID'?: string;
    'Cart items'?: ShoppingCartItem[];
    'Service area': 'Pharmacy' | 'Diagnostic';
    'Circle member': PharmacyCircleMemberValues;
    'Circle membership value'?: number | null;
    'User type'?: PharmaUserStatus;
  };
  [CleverTapEventName.PHARMACY_CART_SKU_PRICE_MISMATCH]: {
    'Mobile number': string;
    'SKU ID': string;
    'Magento MRP': number;
    'Magento pack size': number;
    'Store API MRP': number;
    'Price change in cart': 'Yes' | 'No';
  };

  [CleverTapEventName.TAT_API_FAILURE]: {
    pincode: string | number;
    lookUp: { sku: string; qty: number }[];
    error: object;
    'Cart Items'?: string;
  };
  [CleverTapEventName.PHARMACY_PROCEED_TO_PAY_CLICKED]: {
    'Total items in cart': number;
    'Sub Total': number;
    'Delivery charge': number;
    'Shipping Charges': number;
    'Net after discount': number;
    'Prescription Required?': YesOrNo;
    'Cart ID'?: string; // we don't have cartId before placing order
    'Mode of Delivery': 'Home' | 'Pickup' | 'Home Visit' | 'Clinic Visit';
    'Delivery Date Time'?: string; // Optional (only if Home)
    Pincode: string | number;
    'Service Area': 'Pharmacy' | 'Diagnostic';
    'Store ID'?: string;
    'Store Name'?: string;
    'Popup Shown'?: boolean;
    'No. of out of stock items'?: number;
    'Circle Member': PharmacyCircleMemberValues;
    'Circle Membership Value'?: number | null;
    'User Type'?: PharmaUserStatus;
    'Split Cart'?: YesOrNo;
    'Coupon Applied'?: string;
    'Prescription Option selected'?: PrescriptionOptions;
    Shipment_1_Value?: number; // amount after discount
    Shipment_2_Value?: number;
    Shipment_1_Items?: number; // number of items
    Shipment_2_Items?: number;
  };
  [CleverTapEventName.PHARMACY_PAYMENT_INITIATED]: {
    paymentMode: string;
    amount: number;
    serviceArea: 'pharmacy' | 'Diagnostic';
    'Cart Items'?: number;
    Coupon?: string;
    paymentOrderId: string;
    'Payment Instrument': string;
  };
  [CleverTapEventName.PHARMACY_UPLOAD_PRESCRIPTION_CLICKED]: {
    'Nav src': 'Home' | 'Cart';
    'User type'?: PharmaUserStatus;
  };
  [CleverTapEventName.CART_UPLOAD_PRESCRIPTION_CLICKED]: {
    'Customer ID': string;
  };
  [CleverTapEventName.PHARMACY_ITEMS_REMOVED_FROM_CART]: {
    'Product ID': string;
    'Customer ID': string;
    'Product name': string;
    'No of items': number;
  };
  [CleverTapEventName.PHARMACY_COUPON_ACTION]: {
    'Coupon code'?: string;
    'Coupon description'?: string;
    Action?: string;
  };
  [CleverTapEventName.CART_COUPON_APPLIED]: {
    'Coupon code'?: string;
    'Discounted amount': string | number;
    'Customer ID': string;
    'Cart items'?: string;
    'Coupon description'?: string;
  };
  [CleverTapEventName.UPLOAD_PRESCRIPTION_OPTION_SELECTED]: {
    OptionSelected: 'Search and add' | 'All Medicine' | 'Call me for details';
    'User Type'?: PharmaUserStatus;
  };
  [CleverTapEventName.CONSULT_UPLOAD_PRESCRIPTION_ADDRESS_SELECTED]: {
    Serviceable: 'Yes' | 'No';
  };
  [CleverTapEventName.UPLOAD_PRESCRIPTION_NEW_ADDRESS]: {
    Serviceable: 'Yes' | 'No';
  };
  [CleverTapEventName.UPLOAD_PRESCRIPTION_SUBMIT_CLICKED]: {
    OptionSelected: 'Search and add' | 'All Medicine' | 'Call me for details';
    NumberOfPrescriptionClicked: number;
    NumberOfPrescriptionUploaded: number;
    NumberOfEPrescriptions: number;
    User_Type?: PharmaUserStatus;
  };
  [CleverTapEventName.PHARMACY_NONCART_ORDER_SUBMIT_CLICKED]: {
    'Order ID': string | number;
    'Delivery type': 'home' | 'store pickup';
    'Store ID'?: string; //(incase of store delivery)
    'Delivery address'?: string;
    Pincode: string | number;
    'User Type'?: PharmaUserStatus;
  };
  [CleverTapEventName.PHARMACY_CHECKOUT_COMPLETED]: {
    'Transaction ID'?: string | number;
    'Order type': 'Cart' | 'Non Cart';
    'Prescription required'?: YesOrNo;
    'Prescription added': boolean;
    'Shipping information'?: string; // (Home/Store address)
    'Total items in cart'?: number; // Optional
    'Grand total'?: number; // Optional
    'Total discount %'?: number; // Optional
    'Discount amount'?: number; // Optional
    'Shipping charges'?: number; // Optional
    'Net after discount'?: number; // Optional
    'Payment status'?: number; // Optional
    'Payment type'?: 'COD' | 'Prepaid'; // Optional
    'Cart ID'?: string | number; // Optional
    'Service area': 'Pharmacy' | 'Diagnostic';
    'Mode of delivery'?: 'Home' | 'Pickup';
    'Store ID'?: string;
    'Store name'?: string;
    'Store number'?: string;
    'Store address'?: string;
    'AF revenue': number;
    'AF currency'?: string;
    'Circle member'?: PharmacyCircleMemberValues;
    'Circle membership value'?: number | null;
    'Circle cashback amount': number;
    'Cart items'?: string | undefined;
    'User type'?: PharmaUserStatus;
    'Split cart'?: YesOrNo;
    'Prescription option selected'?: PrescriptionOptions;
    'Coupon applied'?: string;
    Pincode?: string | number;
    'Payment instrument'?: string;
    'Order ID(s)'?: string;
  };
  [CleverTapEventName.PHARMACY_DETAIL_IMAGE_CLICK]: {
    'Product ID': string;
    'Product Name': string;
  };
  [CleverTapEventName.PHARMACY_AUTO_SELECT_LOCATION_CLICKED]: AutoSelectLocation;
  [CleverTapEventName.PHARMACY_ENTER_DELIVERY_PINCODE_CLICKED]: UserInfo;
  [CleverTapEventName.PHARMACY_ENTER_DELIVERY_PINCODE_SUBMITTED]: {
    'Patient UHID': string;
    'Mobile number': string;
    'Customer ID': string;
    Serviceability: string;
    Pincode: string;
    'Nav src': string;
    'Auto selected': YesOrNo;
  };
  [CleverTapEventName.PHARMACY_PINCODE_NONSERVICABLE]: {
    'Mobile Number': string;
    Pincode: string;
    Servicable: boolean;
  };
  [CleverTapEventName.PHARMACY_HOME_PAGE_BANNER]: {
    'Nav src': 'Home Page' | 'Special Offers';
    'Banner position': number;
    Name: string;
    'IP ID': string | undefined;
    'IP section name': string | undefined;
  };
  [CleverTapEventName.CALL_THE_NEAREST_PHARMACY]: {
    pincode: string;
    'Mobile Number': string;
  };
  [CleverTapEventName.PHARMACY_PRESCRIPTION_OPTION_CLICKED]: {
    Option: 'Search and add' | 'All Medicine' | 'Call me for details';
  };
  [CleverTapEventName.PHARMACY_APPLY_COUPON_CLICKED]: {};
  [CleverTapEventName.PHARMACY_SPECIAL_OFFERS_CLICKED]: {
    'Nav src': string;
  };
  [CleverTapEventName.PHARMACY_CHRONIC_UPSELL_NUDGE]: {
    'SKU ID': string;
    'Quantity shown': number | null;
  };

  [CleverTapEventName.PHARMACY_SEARCH_SUCCESS]: {
    'Nav src': string;
    Status: 'Success' | 'Carry';
    Keyword: string;
    'Suggested keyword'?: string;
    Position: number;
    'Suggested keyword position'?: number;
    Source?: 'Full search' | 'Partial search';
    Action?: 'Add to cart' | 'Product detail page viewed';
    'Product availability'?: 'Is in stock' | 'Out of stock' | '';
    'Product position'?: number;
    'Results shown'?: number;
    'SKU ID'?: string;
    'Product name'?: string;
    Discount?: string;
  };

  // ********** Diagnostic Events *******
  [CleverTapEventName.DIAGNOSTIC_LANDING_PAGE_VIEWED]: DiagnosticLandingPage;
  [CleverTapEventName.DIAGNOSTIC_SEARCH_CLICKED]: ItemSearchedOnLanding;
  [CleverTapEventName.DIAGNOSTIC_MY_ORDERS]: {
    //comment
    'Patient UHID': string;
    'Active Orders': number;
    'Past Orders': number;
  };
  [CleverTapEventName.DIAGNOSTIC_ADDRESS_NON_SERVICEABLE_CARTPAGE]: {
    'Patient UHID': string;
    State: string;
    City: string;
    PinCode: number;
    'Number of items in cart': number;
    'Items in cart': object[];
  };
  [CleverTapEventName.DIAGNOSTIC_ORDER_SUMMARY_VIEWED]: {
    'Order amount': string | number;
    'Order ID': string;
    'Order status'?: string;
    'Circle user'?: string;
  };
  [CleverTapEventName.DIAGNOSTIC_PINCODE_ENTERED_ON_LOCATION_BAR]: DiagnosticPinCode;
  [CleverTapEventName.DIAGNOSTIC_HOME_PAGE_WIDGET_CLICKED]: {
    'Item Name'?: string;
    'Item ID'?: string;
    Source: 'Home Page';
    'Section Name': string;
    'Category Name'?: string;
    'Circle user'?: string;
  };
  [CleverTapEventName.DIAGNOSTIC_TEST_DESCRIPTION]: {
    Source:
      | 'Full Search'
      | 'Home Page'
      | 'Cart Page'
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
  [CleverTapEventName.DIAGNOSTIC_CART_VIEWED]: {
    'Page source': string;
    'Total items in cart': number;
    'Cart Items': object[];
    'Circle user': 'Yes' | 'No';
    Pincode: string | number;
    city: string;
    UHID: string;
    'Prescription Needed'?: 'Yes' | 'No';
    'Net after discount'?: number; //item total
    'Delivery charge'?: number;
    'Coupon code used'?: string;
    'Coupon Discount'?: number;
  };
  [CleverTapEventName.DIAGNOSTIC_APPOINTMENT_TIME_SELECTED]: {
    'Slot time': string;
    'No. of slots': number;
    'Slot date': string;
    Type: DIAGNOSTIC_SLOT_TYPE;
    'Circle user': string;
  };
  [CleverTapEventName.DIAGNOSTIC_PROCEED_TO_PAY_CLICKED]: {
    'No. of patients': number;
    'No. of slots': number;
    'Slot type': DIAGNOSTIC_SLOT_TYPE;
    'Total items in cart': number;
    'Sub Total': number;
    'Net after discount': number;
    'Pin Code': string | number;
    Address: string;
    'Home collection charges'?: number;
    'Collection Time Slot': string;
    'Collection Date Slot': string | Date;
    'Circle user': string;
  };
  [CleverTapEventName.DIAGNOSTIC_TRACK_ORDER_VIEWED]: {
    'Patient UHID': string;
    'Patient Name': string;
    'Latest Order Status': string;
    'Order id': string;
    Source: 'Home' | 'My Order' | 'Track Order' | 'Order Summary';
  };
  [CleverTapEventName.DIAGNOSTIC_VIEW_REPORT_CLICKED]: {
    'Order id'?: string;
    Source: 'Home' | 'My Order' | 'Track Order' | 'Order Summary';
    'Report generated': 'Yes' | 'No';
    'Action taken':
      | 'View Report'
      | 'Download Report PDF'
      | 'Share on Whatsapp'
      | 'Copy Link to PDF';
    'Circle user'?: string;
  };
  [CleverTapEventName.DIAGNOSTIC_FEEDBACK_GIVEN]: {
    Rating: string | number;
    'Thing to Improve selected': string;
    'Circle user'?: string;
  };
  [CleverTapEventName.DIAGNOSTIC_ADD_TO_CART]: {
    'Item Name': string;
    'Item ID': string; // (SKUID)
    Source:
      | 'Home page'
      | 'Full search'
      | 'Details page'
      | 'Partial search'
      | 'Listing page'
      | 'Popular search'
      | 'Category page'
      | 'Prescription';
    Section?: string;
    'Circle user'?: string;
  };
  [CleverTapEventName.DIAGNOSTIC_ORDER_PLACED]: {
    'Order id': string | number;
    Pincode: string | number;
    'Patient UHID': string;
    'Order amount': number; // Optional
    'Payment Mode'?: 'Cash' | 'Prepaid'; // Optional
    'Circle discount'?: number;
    'Appointment Date'?: string;
    'Appointment time'?: string;
    'Item ids'?: any;
    'Total items in order': number;
    'Payment type'?: string; //for prepaid
    'Circle user': 'Yes' | 'No';
  };
  [CleverTapEventName.PAYMENT_INITIATED]: {
    Amount: number;
    LOB: string;
    type?: string;
  };
  [CleverTapEventName.DIAGNOSTIC_PAYMENT_INITIATED]: {
    'Order Amount': number;
    LOB: string;
    type?: string;
    'Order id'?: string;
    'Payment mode'?: string;
  };
  [CleverTapEventName.CONSULT_PAYMENT_INITIATED]: {
    Amount: number;
    LOB: string;
    Paymentmode?: string;
    paymentOrderId: string;
  };
  [CleverTapEventName.DIAGNOSITC_HOME_PAGE_BANNER_CLICKED]: {
    position: number;
    itemId: number;
    'Banner title': string;
    'Circle user': string;
  };
  [CleverTapEventName.DIAGNOSTIC_ADDRESS_SELECTED_CARTPAGE]: {
    'Selection type': 'New' | 'Existing';
    Serviceability: 'Yes' | 'No';
    Pincode: string | number;
    Source: 'Home page' | 'Cart page';
    'Circle user': string;
  };
  [CleverTapEventName.DIAGNOSTIC_ITEM_REMOVE_ON_CARTPAGE]: {
    'Item ID': string | number;
    'Item name': string;
    Pincode: string | number;
    Mode: 'Customer' | 'Automated';
  };
  [CleverTapEventName.DIAGNOSTIC_ITEM_ADD_ON_CARTPAGE]: {
    'Item ID'?: string | number;
    'Item name'?: string;
    Pincode: string | number;
    'Circle user'?: string;
  };
  [CleverTapEventName.DIAGNOSTIC_ORDER_RESCHEDULE]: {
    'Reschedule reason': string;
    'Slot Time': string;
    'Slot Date': string;
    'Order id': string;
    'Circle user': string;
  };
  [CleverTapEventName.DIAGNOSTIC_PAYMENT_PAGE_VIEWED]: {
    UHID: string;
    'Order amount': number;
    'Circle user': string;
  };
  [CleverTapEventName.DIAGNOSTIC_PHLEBO_FEEDBACK_SUBMITTED]: {
    Rating: string | number;
    Feedback: string | number;
    'Phlebo Name': string;
    'Order id': string | number;
    'Phlebo id': string | number;
    Comment: string;
  };
  [CleverTapEventName.DIAGNOSTIC_PHLEBO_CALLING_CLICKED]: {
    UHID: string;
    'Order id': string | number;
    'Phlebo Name': string;
    'Circle user'?: string;
  };
  [CleverTapEventName.DIAGNOSTIC_TRACK_PHLEBO_CLICKED]: {
    'Order id': string | number;
    UHID: string;
    'Link opened': 'Yes' | 'No';
    Source: 'Home' | 'My Order' | 'Track Order' | 'Order Summary';
    'Circle user'?: string;
  };
  [CleverTapEventName.DIGNOSTIC_PAYMENT_ABORTED]: {
    'Order id': string;
    UHID: string;
  };
  [CleverTapEventName.DIAGNOSITC_MODIFY_CLICKED]: {
    UHID: string;
    'Order id': string;
    'Order status': string;
    'Circle user': string;
  };
  [CleverTapEventName.DIAGNOSTIC_PRODUCT_LISTING_PAGE_VIEWED]: {
    Type: 'Category' | 'Widget';
    Source: 'Home' | 'Deeplink' | 'Details page' | 'Cart page';
    'Category Name': string;
    'Section name': string;
  };
  [CleverTapEventName.DIAGNOSTIC_PRESCRIPTION_SUBMITTED]: {
    Source: string;
    'Patient MobileNumber'?: any;
    PrescriptionUrl?: any;
    'Item Name': string;
    'Circle user': string;
    'User Type': any;
  };
  [CleverTapEventName.DIAGNOSTIC_PATIENT_SELECTED]: {
    'No. of patients': number;
    'Patient UHID': string;
    'Patient name': string;
  };

  // ********** ConsultEvents ********** \\
  [CleverTapEventName.CONSULT_REPORT_UPLOAD_IN_CHATROOM]: ConsultRoomDoctorPatientInfo;
  [CleverTapEventName.UPLOAD_RECORDS_CLICK_CHATROOM]: ConsultRoomDoctorPatientInfo;
  [CleverTapEventName.TAKE_PHOTO_CLICK_CHATROOM]: ConsultRoomDoctorPatientInfo;
  [CleverTapEventName.GALLERY_UPLOAD_PHOTO_CLICK_CHATROOM]: ConsultRoomDoctorPatientInfo;
  [CleverTapEventName.UPLOAD_PHR_CLICK_CHATROOM]: ConsultRoomDoctorPatientInfo;
  [CleverTapEventName.CONSULT_DOCTOR_TAB_CLICKED]: UserInfoWithSource;
  [CleverTapEventName.CONSULT_PAYMENT_MODE_SELECTED]: {
    'Payment Mode': string;
    User_Type: string;
  };
  [CleverTapEventName.PAYMENT_FAILED_AND_CONVERTED_TO_COD]: {
    'Payment failed order id': string;
    'Payment Success Order Id'?: string;
    status: boolean;
  };
  [CleverTapEventName.CONSULT_SEARCH]: {
    Keyword: string;
    'Patient name': string;
    'Patient UHID': string;
    Relation: string;
    'Patient age': number;
    'Patient gender': string;
    'Patient Number': string;
    'Customer ID': string;
    User_Type: string;
    Source: 'speciality screen' | 'Doctor listing screen';
    'Search result success': YesOrNo;
    'Circle Member': boolean;
    'Circle Plan type': string;
  };
  [CleverTapEventName.CONSULT_FILTER_APPLIED]: DoctorFilterClick;
  [CleverTapEventName.CONSULT_SPECIALITY_CLICKED]: SpecialityClickedEvent;
  [CleverTapEventName.CONSULT_SELECT_SPECIALITY_CLICKED]: {
    'Patient name': string | '';
    'Patient UHID': string | '';
    'Patient age': number;
    'Mobile number': string | '';
    'Location details': string | '';
    'Consult mode': 'Hospital Visit' | 'Video Consult';
  };
  [CleverTapEventName.BOOK_APPOINTMENT]: {
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
  [CleverTapEventName.CONSULT_MODE_SELECTED]: {
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
  [CleverTapEventName.DOCTOR_CLICKED]: {
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
  [CleverTapEventName.CONSULT_BOOK_APPOINTMENT_CONSULT_CLICKED]: {
    'Patient name': string;
    'Doctor name'?: string;
    'Doctor ID'?: string;
    'Speciality ID'?: string;
    'Speciality name'?: string;
    Experience?: number;
    Languages?: string;
    'Doctor hospital'?: string;
    'Doctor city'?: string | null;
    'Available in mins'?: number;
    Source: 'Doctor card doctor listing screen' | 'doctor profile' | 'Inside Consult Room';
    'Patient UHID': string;
    Relation: string;
    'Patient age': number;
    'Patient gender': string;
    'Customer ID': string;
    rank?: number;
    User_Type: string;
    'Online consult fee'?: number;
    'Physical consult fee'?: number;
    'Doctor category': string;
    'Is consulted'?: boolean;
    'Consult ID': string;
    'Appointment datetime': Date;
    'Consult mode': string;
    'Is consult started': boolean;
    'Mobile number': string;
    'Circle Member': boolean;
    'Circle Plan type': string;
  };
  [CleverTapEventName.DOCTOR_CONNECT_CARD_CLICK]: {
    Fee: number;
    'Doctor Speciality': string;
    'Doctor Name': string;
    Source: 'List' | 'Profile';
    'Language known': string;
  };
  [CleverTapEventName.CONSULTED_WITH_DOCTOR_BEFORE]: ConsultedBefore;
  [CleverTapEventName.DOCTOR_SPECIALITY_SEARCH_NO_RESULT]: {
    'Text Searched': string;
    'Patient Name': string;
    'Patient UHID': string;
    Relation: string;
    'Patient Age': number;
    'Patient Gender': string;
  };
  [CleverTapEventName.CONSULT_TYPE_SELECTION]: {
    'Consult Type': 'Online' | 'In Person';
    'Doctor ID': string;
    'Doctor Name': string;
    'Patient Name': string;
    'Patient UHID': string;
    'Mobile Number': string;
    'Customer ID': string;
  };
  [CleverTapEventName.HOMEPAGE_WIDGET_FOLLOWUP_CLICK]: {
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
  [CleverTapEventName.PATIENT_SENT_CHAT_MESSAGE_POST_CONSULT]: {
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
  [CleverTapEventName.PATIENT_EXTERNAL_MEETING_LINK_CLICKED]: {
    'Doctor name': string;
    'Patient Name': string;
    'Patient ID': string;
    'Doctor ID': string;
    'Appointment ID': string;
    'Link URL': string;
    'Doctor number': string;
    'Patient number': string;
    'Solution Used': string;
  };
  [CleverTapEventName.CHAT_WITH_DOCTOR]: {
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
  [CleverTapEventName.OPENTOK_ERROR_RECEIVED]: {
    'Doctor ID': string;
    'Doctor Name': string;
    'Doctor Number': string;
    'Doctor Type': string;
    'Doctor Speciality ID': string;
    'Doctor Speciality': string;
    'Doctor Facility ID': string;
    'Doctor Facility': string;
    'Appointment ID': string;
    'Appointment Display ID': string;
    'Patient Name': string;
    'Patient Number': string;
    'Session ID': string;
    'Call ID': string;
    'Error Name': string;
    'Error Data': string;
    reason: string;
  };
  [CleverTapEventName.OPENTOK_EVENT_RECEIVED]: {
    'Doctor ID': string;
    'Doctor Name': string;
    'Doctor Number': string;
    'Doctor Type': string;
    'Doctor Speciality ID': string;
    'Doctor Speciality': string;
    'Doctor Facility ID': string;
    'Doctor Facility': string;
    'Appointment ID': string;
    'Appointment Display ID': string;
    'Patient Name': string;
    'Patient Number': string;
    'Session ID': string;
    'Call ID': string;
    'Event Name': string;
    'Event Data': string;
    reason: string;
  };
  // confirm the type of data for the below
  [CleverTapEventName.CONSULT_PROCEED_CLICKED_ON_SLOT_SELECTION]: {
    'Doctor name': string;
    'Speciality name': string;
    Experience: number;
    Languages: string; // Comma separated values
    'Consult type': 'ONLINE' | 'PHYSICAL';
    'Doctor ID': string;
    'Speciality ID': string;
    'Patient UHID': string;
    'Patient name': string;
    'Patient gender': string;
    'Patient age': number;
    'Appointment date time': Date;
    'Online consult fee'?: number;
    'Physical consult fee'?: number;
    Source: 'Consult Now' | 'Schedule for Later';
    User_Type: string;
    'Actual amount'?: number;
    'Doctor hospital'?: string;
    'Doctor city'?: string | null;
    'Customer ID': string;
    'Mobile number': string;
    'Circle member': boolean;
    'Circle plan type': string;
    'Doctor type': string;
  };
  [CleverTapEventName.CONSULT_COUPON_APPLIED]: {
    CouponCode: string;
    'Net Amount'?: number;
    'Discount Amount'?: number;
    'Coupon Applied': boolean;
  };
  [CleverTapEventName.CONSULT_PAY_BUTTON_CLICKED]: {
    'Doctor name': string;
    'Doctor city': string;
    'Doctor category': DoctorType;
    'Speciality name': string;
    Discount: string;
    'Coupon applied'?: string;
    'Discount amount': number;
    'Net amount': number;
    'Customer ID': string;
    'Patient name': string;
    'Patient age': number;
    'Patient gender': string;
    'Patient UHID': string;
    'Consult type': 'CLINIC' | 'ONLINE';
    'Doctor ID': string;
    'Speciality ID': string;
    'Hospital name': string;
    'Hospital city': string;
    'Appointment datetime': Date;
    'Booking fee': string;
    'Booking value': number;
    User_Type: string;
  };
  [CleverTapEventName.CONSULT_MODE_TOGGLE]: {
    'Patient name': string;
    'Patient UHID': string;
    'Patient age': number;
    'Mobile number': number;
    'Location details': string;
    'Initial consult mode': 'Hospital Visit' | 'Video consult' | 'Direct' | 'Unknown';
    CTA: 'Primary' | 'Secondary' | 'NA';
    'Speciality name': string;
    'Speciality ID': string;
  };
  [CleverTapEventName.CONSULT_SELECT_LOCATION]: {
    'Patient name': string;
    'Patient UHID': string;
    'Patient age': number;
    'Mobile number': number;
    'Speciality name': string;
    'Location details': string;
    'Consult mode': 'Video Consult' | 'Hospital Visit';
    'Speciality ID': string;
  };
  [CleverTapEventName.CONSULT_HOSPITAL_CLICKED]: {
    'Patient name': string;
    'Patient UHID': string;
    'Patient age': number;
    'Mobile number': number;
  };
  [CleverTapEventName.CONSULTATION_BOOKED]: {
    'Consult ID': string;
    'Display ID'?: string;
    specialisation: string;
    'Doctor category': string;
    'Patient name': string;
    'Patient UHID': string;
    Relation: string;
    'Patient age': number;
    'Patient gender': string;
    'Customer ID': string;
    'Speciality ID': string;
    'Appointment datetime': Date;
    'Consult mode': 'ONLINE' | 'PHYSICAL';
    'Hospital name': string;
    'Doctor city': string;
    'Doctor ID': string;
    'Doctor name': string;
    'Net amount': number;
    af_revenue: number;
    af_currency: string;
    'Dr of hour appointment'?: YesOrNo;
    'Circle savings': number;
    User_type: string;
    'Secretary number': string;
    'Secretary name': string;
    'Patient number': string;
    'Doctor number': string;
    'Consult Mode': 'Online' | 'Physical';
  };
  [CleverTapEventName.CONSULT_FEEDBACK_GIVEN]: {
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
    Rating: string;
    'Rating Reason': string;
  };
  [CleverTapEventName.PHARMACY_FEEDBACK_GIVEN]: {
    'Patient UHID': string;
    // Type: 'Consult' | 'Medicine' | 'Diagnostics';
    Rating: string;
    'Rating Reason': string;
  };

  [CleverTapEventName.PHARMACY_ORDER_SUMMARY_CLICKED]: {
    'Order ID(s)': string;
    'Order date'?: string;
    'Order type': 'Non Cart' | 'Cart' | 'Offline';
    'Customer ID': string;
    'Delivery Date'?: string;
    'Mobile number': string;
    'Order status': MEDICINE_ORDER_STATUS;
  };
  [CleverTapEventName.PHARMACY_MY_ORDER_TRACKING_CLICKED]: {
    'Customer ID': string;
    'Mobile number': string;
    'Order ID': string;
    'Order type': 'Cart' | 'Non Cart';
    'Order status': MEDICINE_ORDER_STATUS; //Order Initiated / Payment Success / Orders Placed, etc.
    'Order date': string;
    'Delivery date'?: string; // TAT Promised
  };
  [CleverTapEventName.PHARMACY_PROCEED_TO_ADD_NEW_ADDRESS_CLICK]: {
    Source: 'My Account' | 'Upload Prescription' | 'Cart' | 'Diagnostics Cart';
  };
  [CleverTapEventName.PHARMACY_ADD_NEW_ADDRESS_COMPLETED]: {
    'Nav src': 'My Account' | 'Upload Prescription' | 'Cart' | 'Diagnostics Cart' | 'PDP';
    Success?: YesOrNo; // Yes / No (If Error message shown because it is unservicable)
    'Delivery address': string;
    Pincode: string;
    'TAT displayed'?: string;
    'Delivery TAT'?: number;
  };
  [CleverTapEventName.PHARMACY_CART_ADDRESS_SELECTED_SUCCESS]: {
    'TAT displayed'?: string;
    'Delivery successful': YesOrNo; // Yes / No (If Error message shown because it is unservicable)
    'Delivery address': string;
    Pincode: string;
    'Delivery TAT': number;
    'TAT hrs': number;
    'Circle membership added': 'Yes' | 'No' | 'Existing';
    'Circle membership value': number | null;
    'User type'?: PharmaUserStatus;
    'Split cart': YesOrNo;
    'Cart items': string;
    'Shipment1 TAT'?: Date;
    'Shipment2 TAT'?: Date;
    'Shipment1 value'?: number; // amount after discount
    'Shipment2 value'?: number;
    'Shipment1 items'?: number; // number of items
    'Shipment2 items'?: number;
    'Shipment1 site type'?: SiteType;
    'Shipment2 site yype'?: SiteType;
  };

  [CleverTapEventName.PHARMACY_CART_ADDRESS_SELECTED_FAILURE]: {
    'TAT Displayed'?: string;
    'Delivery Successful': YesOrNo; // Yes / No (If Error message shown because it is unservicable)
    'Delivery Address': string;
    Pincode: string;
  };

  [CleverTapEventName.PHARMACY_AVAILABILITY_API_CALLED]: {
    'Nav src': 'PDP' | 'Add_Search' | 'Add_Display' | 'Cart';
    'Input SKU'?: string;
    'Input pincode': string;
    'Input MRP': number;
    'No of items in the cart': number;
    'Response exist': YesOrNo;
    'Response MRP': number;
    'Response qty': number;
    'Cart items'?: string;
  };

  [CleverTapEventName.PHARMACY_TAT_API_CALLED]: {
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
  [CleverTapEventName.PHARMACY_CART_TAT_API_CALLED]: {
    'TAT 1 day'?: number;
    'TAT 1 hour'?: number;
    'TAT 1 items'?: string;
    'TAT 1 amount'?: number;
    'TAT 2 day'?: number;
    'TAT 2 hour'?: number;
    'TAT 2 items'?: string;
    'TAT 2 amount'?: number;
    'Split cart': YesOrNo;
    Status: 'Success' | 'Failure';
  };

  [CleverTapEventName.PHARMACY_CART_SELECT_DELIVERY_ADDRESS_CLICKED]: {
    'Customer ID': string;
    'Cart Items'?: string;
  };

  [CleverTapEventName.PHARMACY_CART_UPLOAD_PRESCRIPTION_CLICKED]: {
    'Customer ID': string;
  };

  // ********** Health Records ********** \\

  [CleverTapEventName.CONSULT_RX]: PatientInfo;

  [CleverTapEventName.MEDICAL_RECORDS]: PatientInfo;

  [CleverTapEventName.ADD_RECORD]: {
    Source:
      | 'Doctor Consultation'
      | 'Test Report'
      | 'Hospitalization'
      | 'Health Condition'
      | 'Bill'
      | 'Insurance'; // List/Profile
  };

  [CleverTapEventName.UPLOAD_PRESCRIPTION]: PatientInfo;

  [CleverTapEventName.UPLOAD_PHOTO]: {
    Source: 'Take Photo' | 'Gallery'; // List/Profile
  };

  [CleverTapEventName.ITEMS_CLICKED]: {
    Source: 'Consult & RX' | 'Medical Records'; // List/Profile
    Type: 'Prescription' | 'Test Result';
  };

  [CleverTapEventName.PHR_ORDER_MEDS_TESTS]: PatientInfoWithConsultId;

  [CleverTapEventName.PHR_CONSULT_CARD_CLICK]: PatientInfoWithConsultId;

  [CleverTapEventName.PHARMACY_RE_ORDER_MEDICINE]: ReorderMedicine;

  // ********** ConsultRoom Events ********** \\

  [CleverTapEventName.CONSULT_CANCEL_CLICKED_BY_PATIENT]: {
    'Doctor name': string;
    'Speciality name': string;
    'Speciality ID': string;
    'Doctor Category': DoctorType;
    'Appointment datetime': Date;
    'Consult mode': 'Online' | 'Physical';
    'Hospital name': string;
    'Hospital city': string;
    'Doctor ID': string;
    'Patient name': string;
    'Patient UHID': string;
    Relation: string;
    'Patient age': number;
    'Patient gender': string;
    'Customer ID': string;
    'Secretary name': string;
    'Secretary number': string;
    'Patient number': string;
    'Doctor number': string;
  };

  [CleverTapEventName.CONSULT_RESCHEDULED_BY_THE_PATIENT]: {
    'Doctor name': string;
    'Speciality name': string;
    'Speciality ID': string;
    'Doctor category': DoctorType;
    'Consult Date Time': Date;
    'Consult mode': 'Online' | 'Physical';
    'Hospital name': string;
    'Hospital city': string;
    'Doctor ID': string;
    'Patient name': string;
    'Patient UHID': string;
    Relation: string;
    'Patient age': number;
    'Patient gender': string;
    'Customer ID': string;
    'Secretary name': string;
    'Secretary number': string;
    'Mobile number': string;
    'Doctor number': string;
  };
  [CleverTapEventName.CONSULT_MEDICAL_DETAILS_FILLED]: {
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
  [CleverTapEventName.VIEW_PRESCRIPTION_CLICKED_APPOINTMENT_CARD]: {
    'Doctor Name': string;
    'Doctor Phone Number': string;
    'Doctor ID': string;
    'Doctor Speciality Name': string;
    'Doctor Category': string;
    'Patient Name': string;
    'Patient Phone Number': string;
    'Display ID': string;
  };
  [CleverTapEventName.COMPLETED_AUTOMATED_QUESTIONS]: {
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
  [CleverTapEventName.JD_COMPLETED]: {
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
  [CleverTapEventName.CONTINUE_CONSULT_CLICKED]: {
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
  [CleverTapEventName.CONSULT_CARD_CLICKED]: {
    doctorName: string;
    specialityName?: string;
    specialityId?: string;
    'Doctor Category': DoctorType;
    'Consult Date Time': Date;
    'Consult Mode': 'Online' | 'Physical';
    hospitalName?: string;
    hospitalCity?: string;
    doctorId?: string;
    patientName: string;
    patientUhid: string;
    Relation: string;
    patientAge: number;
    patientGender: string;
    'Customer ID': string;
  };
  [CleverTapEventName.CONSULT_RESCHEDULE_CLICKED]: {
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
  [CleverTapEventName.CONSULT_CONTINUE_CONSULTATION_CLICKED]: {
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
  [CleverTapEventName.CONSULT_CANCELLED_BY_PATIENT]: {
    'Doctor name': string;
    'Speciality name': string;
    'Speciality ID': string;
    'Doctor category': DoctorType;
    'Appointment datetime': Date;
    'Consult mode': 'Online' | 'Physical';
    'Hospital name': string;
    'Hospital city': string;
    'Consult ID': string;
    'Source screen': string;
    'Patient name': string;
    'Patient UHID': string;
    Relation: string;
    'Patient age': number;
    'Patient gender': string;
    'Customer ID': string;
    'Secretary name': string;
    'Secretary number': string;
    'Doctor number': string;
  };
  [CleverTapEventName.PRESCRIPTION_RECEIVED]: {
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
  [CleverTapEventName.SD_CONSULTATION_STARTED]: {
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
  [CleverTapEventName.SD_VIDEO_CALL_STARTED]: {
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
  [CleverTapEventName.PATIENT_JOINED_CONSULT]: {
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
  [CleverTapEventName.PATIENT_ENDED_CONSULT]: {
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
  [CleverTapEventName.CALL_ENDED]: {
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
  [CleverTapEventName.PATIENT_ANSWERED_CALL]: consultCallEndData;
  [CleverTapEventName.PATIENT_DECLINED_CALL]: consultCallEndData;
  [CleverTapEventName.PATIENT_MISSED_CALL]: consultCallEndData;
  [CleverTapEventName.CALL_DROPPED_UNKNOWN_REASON]: consultCallEndData;
  [CleverTapEventName.CONSULT_BOOK_CTA_CLICKED]: FollowUpAppointment;
  [CleverTapEventName.CONSULT_VIEW_DETAILS_ON_PAST_APPOINTMENT]: FollowUpAppointment;
  [CleverTapEventName.DOWNLOAD_PRESCRIPTION]: {
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
  [CleverTapEventName.VIEW_PRESCRIPTION_IN_CONSULT_DETAILS]: {
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
  [CleverTapEventName.CART_PRESCRIPTION_OPTION_SELECTED_PROCEED_CLICKED]: {
    'Option selected': 'Prescription Now' | 'Prescription Later' | 'Doctor Consult' | 'NA';
  };
  [CleverTapEventName.ORDER_MEDICINES_FROM_PRESCRIPTION_DETAILS]: {
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
  [CleverTapEventName.ORDER_TESTS_FROM_PRESCRIPTION_DETAILS]: {
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
  [CleverTapEventName.CONSULT_NO_SLOTS_FOUND]: {
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
  [CleverTapEventName.DOCTOR_RESCHEDULE_CLAIM_REFUND]: {
    'Appointment ID': string;
    Type: string;
    'Patient Id': string;
  };
  [CleverTapEventName.CONSULT_LOCATION_PERMISSION]: {
    'Location permission': string;
  };
  [CleverTapEventName.PHARMACY_HOME_PAGE_VIEWED]: {
    'Nav src': 'deeplink' | 'app home';
  };
  [CleverTapEventName.PHARMACY_PRODUCT_PAGE_VIEWED]: {
    'Nav src': ProductPageViewedSource;
    'SKU ID': string;
    'Product name': string;
    'Stock availability': YesOrNo | 'Not for Sale';
    /**
     * Category ID & Category Name is applicable if customers clicks on products from any category (all categories of shop by category or health areas)
     */
    'Category ID'?: string;
    'Category name'?: string;
    /**
     * Section Name is applicable if customer clicked on the product from the homepage product widgets like Hot sellers, Recommended products
     */
    'Section name'?: string;
    'Circle member'?: PharmacyCircleMemberValues;
    'Circle membership value'?: number | null;
    'User type'?: PharmaUserStatus;
    Pincode?: string;
    Serviceability: YesOrNo;
    'TAT day'?: number | null;
    'TAT hour'?: number | null;
    'TAT date time'?: Date | string;
    'Product type'?: string;
    'Max order quantity'?: number;
    MRP?: number;
    'Special price'?: number | null;
    'Sub category': string;
    SpecialPrice?: number | null;
    'Circle cashback'?: number;
    SubCategory: string;
    'Multivariants available': YesOrNo;
    'No of variants'?: number | null;
    'Substitutes available'?: YesOrNo;
    'No of substitutes'?: number | null;
  };
  [CleverTapEventName.DOCTOR_PROFILE_THROUGH_DEEPLINK]: {
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
  [CleverTapEventName.CONSULT_DOCTOR_PROFILE_VIEWED]: {
    'Patient name': string;
    'Patient UHID': string;
    'Patient age': number;
    'Patient gender': string;
    'Mobile number': string;
    'Doctor name': string;
    'Speciality name': string;
    'Speciality ID': string;
    'Doctor ID': string;
    'Media source': string;
    User_Type: string;
    Experience: string;
    'Customer ID': string;
    'Available in mins': string;
    'Doctor city': string;
    'Hospital name': string;
    Relation: string;
    'Circle Membership added': string;
    'Circle discount': number;
    'Circle Cashback': number;
    Languages: string;
    Fee: number;
    'Doctor category': DoctorType;
    Rank: number | string;
    Is_TopDoc?: YesOrNo;
    Source:
      | 'Deeplink'
      | 'Doctor Card clicked'
      | 'Search'
      | 'My Doctors'
      | 'Appointment CTA'
      | 'Direct'
      | 'Past search clicked';
    'Doctor card clicked': YesOrNo;
    DOTH: 'T' | 'F';
    'Doctor tab': 'Apollo Tab' | 'Partner' | 'NA';
    'Search screen': 'Speciality listing' | 'Doctor listing' | 'NA';
    'Appointment CTA': 'Cancelled' | 'Past' | 'Active' | 'Inside consult room' | 'NA';
  };
  [CleverTapEventName.CONSULT_SEARCH_SUGGESTIONS]: {
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
    Source: 'Speciality screen' | 'Doctor list screen';
    'search result success': YesOrNo;
  };

  [CleverTapEventName.SEARCH_SUGGESTIONS_VIEW_ALL]: {
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

  [CleverTapEventName.CONSULT_SEARCH_SUGGESTIONS_CLICKED]: {
    'Patient name': string;
    'Patient UHID': string;
    Relation: string;
    'Patient age': number;
    'Patient gender': string;
    'Mobile number': string;
    'Customer ID': string;
    Doctors: string;
    Symptoms: string;
    Specialities: string;
    Procedures: string;
    Source: string;
    Bucket: string;
    Keyword: string;
    'Search suggestion clicked': string;
    'Bucket clicked': string;
    'Search suggestions': string;
    User_Type: string;
    'Speciality name': string;
    'Circle Member': boolean;
    'Circle Plan type': string;
  };

  [CleverTapEventName.CONSULT_SHARE_ICON_CLICKED]: {
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
    Source: 'Doctor profile' | 'Doctor listing';
  };
  [CleverTapEventName.CATEGORY_PAGE_VIEWED]: {
    source: 'home' | 'deeplink' | 'registration';
    CategoryId: string;
    CategoryName: string;
  };
  [CleverTapEventName.PHARMACY_BUY_AGAIN_VIEWED]: {};
  [CleverTapEventName.CONFIRM_LOCATION]: {
    isMarkerModified: boolean;
    changedByInMeters: number;
  };
  [CleverTapEventName.HDFC_HOMEPAGE_CAROUSEL_CLICKED]: HdfcCustomerPlanInfo;
  [CleverTapEventName.HDFC_MY_MEMBERSHIP_VIEWED]: HdfcBenefitInfo;
  [CleverTapEventName.HDFC_PLAN_DETAILS_VIEWED]: HdfcBenefitInfo;
  [CleverTapEventName.HDFC_EXPLORE_PLAN_CLICKED]: HdfcBenefitInfo;
  [CleverTapEventName.HDFC_HOW_TO_AVAIL_CLICKED]: HdfcBenefitInfo;
  [CleverTapEventName.HDFC_REDEEM_CLICKED]: {
    'User ID': string;
    Benefit: string;
  };
  [CleverTapEventName.HDFC_DOC_ON_CALL_CLICK]: HdfcBenefitInfo;
  [CleverTapEventName.HDFC_COVID_CARE_CLICK]: HdfcBenefitInfo;
  [CleverTapEventName.HDFC_DIGITIZATION_PHR_CLICK]: HdfcBenefitInfo;
  [CleverTapEventName.HDFC_FREE_HEALTH_ASSESSMENT_CLICK]: HdfcBenefitInfo;
  [CleverTapEventName.HDFC_CONCIERGE_CLICK]: HdfcBenefitInfo;
  [CleverTapEventName.HDFC_DIETITIAN_CLICK]: HdfcBenefitInfo;
  [CleverTapEventName.HDFC_DIAGNOSTIC_CLICK]: HdfcBenefitInfo;
  [CleverTapEventName.HDFC_DIGITAL_VAULT_CLICK]: HdfcBenefitInfo;
  [CleverTapEventName.HDFC_7000_DOCTORS_CLICK]: HdfcBenefitInfo;
  [CleverTapEventName.HDFC_FREE_MED_CHECK_CLICK]: HdfcBenefitInfo;
  [CleverTapEventName.HDFC_PLAN_SUSBCRIBED]: {
    DOB: string;
    'Email ID': string;
    'Mobile Number': string;
    'Partner ID': string;
    'Plan Name': string;
  };

  // ********** Opentok Events ********** \\

  [CleverTapEventName.DOCTOR_SUBSCRIBER_ERROR]: {
    'Appointment ID': string;
    'Patient ID': string;
    'Doctor ID': string;
    error: string;
    'Session ID': string;
  };

  [CleverTapEventName.DOCTOR_SUBSCRIBER_OTRNERROR]: {
    'Appointment ID': string;
    'Patient ID': string;
    'Doctor ID': string;
    error: string;
    'Session ID': string;
  };

  [CleverTapEventName.DOCTOR_SUBSCRIBER_CONNECTED]: {
    'Appointment ID': string;
    'Patient ID': string;
    'Doctor ID': string;
    event: string;
  };

  [CleverTapEventName.DOCTOR_SUBSCRIBER_DISCONNECTED]: {
    'Appointment ID': string;
    'Patient ID': string;
    'Doctor ID': string;
    event: string;
  };

  [CleverTapEventName.DOCTOR_SUBSCRIBER_VIDEO_DISABLED]: {
    'Appointment ID': string;
    'Patient ID': string;
    'Doctor ID': string;
    event: string;
  };

  [CleverTapEventName.DOCTOR_SUBSCRIBER_VIDEO_ENABLED]: {
    'Appointment ID': string;
    'Patient ID': string;
    'Doctor ID': string;
    event: string;
  };

  [CleverTapEventName.PATIENT_PUBLISHER_ERROR]: {
    'Appointment ID': string;
    'Patient ID': string;
    'Doctor ID': string;
    error: string;
    'Session ID': string;
  };

  [CleverTapEventName.PATIENT_PUBLISHER_OTRNERROR]: {
    'Appointment ID': string;
    'Patient ID': string;
    'Doctor ID': string;
    error: string;
    'Session ID': string;
  };

  [CleverTapEventName.PATIENT_PUBLISHER_STREAM_CREATED]: {
    'Appointment ID': string;
    'Patient ID': string;
    'Doctor ID': string;
    event: string;
  };

  [CleverTapEventName.PATIENT_PUBLISHER_STREAM_DESTROYED]: {
    'Appointment ID': string;
    'Patient ID': string;
    'Doctor ID': string;
    event: string;
  };

  [CleverTapEventName.PATIENT_SESSION_ERROR]: {
    'Appointment ID': string;
    'Patient ID': string;
    'Doctor ID': string;
    error: string;
    'Session ID': string;
  };

  [CleverTapEventName.PATIENT_SESSION_OTRNERROR]: {
    'Appointment ID': string;
    'Patient ID': string;
    'Doctor ID': string;
    error: string;
    'Session ID': string;
  };

  [CleverTapEventName.PATIENT_SESSION_CONNECTION_CREATED]: {
    'Appointment ID': string;
    'Patient ID': string;
    'Doctor ID': string;
    event: string;
  };

  [CleverTapEventName.PATIENT_SESSION_CONNECTION_DESTROYED]: {
    'Appointment ID': string;
    'Patient ID': string;
    'Doctor ID': string;
    event: string;
  };

  [CleverTapEventName.PATIENT_SESSION_CONNECTED]: {
    'Appointment ID': string;
    'Patient ID': string;
    'Doctor ID': string;
    event: string;
  };

  [CleverTapEventName.PATIENT_SESSION_DISCONNECTED]: {
    'Appointment ID': string;
    'Patient ID': string;
    'Doctor ID': string;
    event: string;
  };

  [CleverTapEventName.PATIENT_SESSION_RECONNECTED]: {
    'Appointment ID': string;
    'Patient ID': string;
    'Doctor ID': string;
    event: string;
  };

  [CleverTapEventName.PATIENT_SESSION_RECONNECTING]: {
    'Appointment ID': string;
    'Patient ID': string;
    'Doctor ID': string;
    event: string;
  };

  [CleverTapEventName.PATIENT_SESSION_STREAM_CREATED]: {
    'Appointment ID': string;
    'Patient ID': string;
    'Doctor ID': string;
    event: string;
  };

  [CleverTapEventName.PATIENT_SESSION_STREAM_DESTROYED]: {
    'Appointment ID': string;
    'Patient ID': string;
    'Doctor ID': string;
    event: string;
  };

  [CleverTapEventName.PATIENT_SESSION_STREAM_PROPERTY_CHANGED]: {
    'Appointment ID': string;
    'Patient ID': string;
    'Doctor ID': string;
    event: string;
  };

  [CleverTapEventName.SYMPTOM_TRACKER_PAGE_CLICKED]: SymptomTrackerPatientInfo;
  [CleverTapEventName.SYMPTOM_TRACKER_INFO_CLICKED]: SymptomTrackerPatientInfo;
  [CleverTapEventName.SYMPTOM_TRACKER_ADD_OTHER_SYMPTOM_CLICKED]: SymptomTrackerPatientInfo;
  [CleverTapEventName.SYMPTOM_TRACKER_MOST_TROUBLING_SYMPTOM_CLICKED]: SymptomTrackerPatientInfo;
  [CleverTapEventName.SYMPTOM_TRACKER_NO_OTHER_SYMPTOM_CLICKED]: SymptomTrackerPatientInfo;
  [CleverTapEventName.SYMPTOM_TRACKER_CLICKED_ON_SPECIALITY_SCREEN]: SymptomTrackerPatientInfo;
  [CleverTapEventName.SYMPTOM_TRACKER_RESTART_CLICKED]: SymptomTrackerCompleteInfo;
  [CleverTapEventName.SYMPTOM_TRACKER_CONSULT_DOCTOR_CLICKED]: SymptomTrackerCompleteInfo;
  [CleverTapEventName.SYMPTOM_TRACKER_SEARCH_SYMPTOMS]: {
    'Patient UHID': string;
    'Patient ID': string;
    'Patient Name': string;
    'Mobile Number': string;
    'Date of Birth': Date | string;
    Email: string;
    Relation: string;
    'Search String': string;
  };
  [CleverTapEventName.SYMPTOM_TRACKER_SUGGESTED_SYMPTOMS_CLICKED]: {
    'Patient UHID': string;
    'Patient ID': string;
    'Patient Name': string;
    'Mobile Number': string;
    'Date of Birth': Date | string;
    Email: string;
    Relation: string;
    'Symptom Clicked': string;
  };
  [CleverTapEventName.SYMPTOM_TRACKER_ADD_SELECTED_SYMPTOMS_CLICKED]: {
    'Patient UHID': string;
    'Patient ID': string;
    'Patient Name': string;
    'Mobile Number': string;
    'Date of Birth': Date | string;
    Email: string;
    Relation: string;
    'Selected Symptoms': string;
  };
  [CleverTapEventName.CIRCLE_LANDING_PAGE_VIEWED]: CircleAttributes;
  [CleverTapEventName.CIRCLE_POP_UP_VIEWED_PLANS_ONLY]: CircleAttributes;
  [CleverTapEventName.CIRCLE_MEMBERSHIP_PAGE_VIEWED]: CircleAttributes;
  [CleverTapEventName.CIRCLE_PLAN_TO_CART]: CircleAttributes;
  [CleverTapEventName.CIRCLE_PAYMENT_PAGE_VIEWED_STANDALONE_CIRCLE_PURCHASE_PAGE]: CircleAttributes;
  [CleverTapEventName.CIRCLE_BENIFIT_CLICKED]: CircleAttributes;

  [CleverTapEventName.SYMPTOM_TRACKER_FOR_MYSELF]: SymptomTrackerPatientInfo;
  [CleverTapEventName.CIRCLE_RENEW_NOW_CLICKED]: CircleRenewalAttributes;
  [CleverTapEventName.CIRCLE_VIEW_BENEFITS_CLICKED]: CircleRenewalAttributes;
  [CleverTapEventName.CIRCLE_MEMBERSHIP_RENEWED]: CircleRenewalSubscriptionAttributes;
  [CleverTapEventName.CIRCLE_MEMBERSHIP_DETAILS_VIEWED]: CircleRenewalAttributes;
  [CleverTapEventName.HOME_VIEWED]: {
    'Patient name': string;
    'Patient UHID': string;
    Relation: string;
    'Patient age': number;
    'Patient gender': string;
    'Mobile number': string;
    'Customer ID': string;
    'Circle Member': 'Yes' | 'No';
    'Circle Plan type': string;
  };
  [CleverTapEventName.COVID_VACCINATION_SECTION_CLICKED]: {
    'Patient Name': string;
    'Patient UHID': string;
    Relation: string;
    'Patient Age': number;
    'Patient Gender': string;
    'Mobile Number': string;
    'Customer ID': string;
    'CTA Clicked': string;
  };
  [CleverTapEventName.CONSULT_USER_LOCATION]:
    | consultLocation
    | {
        'Patient name': string;
        'Patient UHID': string;
        'Patient age': number;
        'Mobile number': number;
        'Speciality name': string;
        Screen: 'Speciality Screen' | 'Doctor list';
        'Location details': string;
      };
  [CleverTapEventName.USER_CHANGED_LOCATION]: consultLocation;
  [CleverTapEventName.USER_LOGGED_IN_WITH_TRUECALLER]: PatientInfo;
  [CleverTapEventName.TRUECALLER_EVENT_ERRORS]: {
    'Error Code': number;
    'Error Message': string;
  };
  [CleverTapEventName.TRUECALLER_APOLLO247_LOGIN_ERRORS]: {
    'Api Name': string;
    Error: any;
  };
  [CleverTapEventName.LOGIN_WITH_TRUECALLER_CLICKED]: {};
  [CleverTapEventName.CONSULT_MY_DOCTOR_CLICKED]: {
    'Patient name': string;
    'Patient UHID': string;
    Relation: string;
    'Patient age': number;
    'Patient gender': string;
    'Mobile number': string;
    'Customer ID': string;
    User_Type: string;
    'Doctor name': string;
    'Doctor Id': string;
    'Doctor Speciality': string;
    'Page Name': string;
    'Nav src': string;
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

  [CleverTapEventName.PLAYSTORE_APP_REVIEW_AND_RATING]: {
    'Patient Name': string;
    'Patient UHID': string;
    'User Type': string;
    'Patient Age': number;
    'Patient Gender': string;
    'Mobile Number': string;
    'Customer ID': string;
    'CT Source': string;
    'Device ID': string;
    'Circle Member': string;
    'Page Name': string;
    'NAV Source': 'Pharmacy' | 'Consult' | 'Dignostic';
  };

  [CleverTapEventName.PHARMACY_FAST_SUBSTITUTES_VIEWED]: {
    'Product Code': string;
    'Product Name': string;
    'Stock type': 'In stock' | 'Out of stock';
    Type: string;
  };

  [CleverTapEventName.PHARMACY_PRESCRIPTION_UPLOADED]: {
    Location: 'Cart' | 'Non-Cart';
    Source: 'Gallery' | 'Camera' | 'My Prescription' | 'Consult Room' | 'Health Records';
  };

  [CleverTapEventName.DOCTOR_CARD_CONSULT_CLICK]: {
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
    'Mode of consult'?: 'Hospital Visit' | 'Video Consult';
  };
  [CleverTapEventName.PAYMENT_SCREEN_LOADED]: {
    'Phone Number': string;
    vertical: string;
    'Vertical Internal Order Id': string;
    'Payment Order Id': string;
    'Total Amount': number;
    "isHC's": boolean;
    NumSavedCards: number;
    'Eligible Payment Methods': String[];
    'Num UPI Intent Apps': number;
    'UPI Intent App Names': String[];
    "HC's Balance": number;
    isPaymentLinkTxn: boolean;
  };
  [CleverTapEventName.PAYMENT_TXN_INITIATED]: {
    'Phone Number': string;
    vertical: string;
    'Vertical Internal Order Id': string;
    'Payment Order Id': string;
    'Total Amount': number;
    "HC's Balance": number;
    "HC's Redeemed": number;
    'COD Amount': number;
    'Prepaid Amount': number;
    'Payment Method Type': string;
    'Payment Method': string;
    'App Redirection': string | null;
    isSavedCard: boolean;
    TxnType: string;
    ifNewCardSaved: boolean;
    isPaymentLinkTxn: boolean;
    'Wallet Balance': any;
  };
  [CleverTapEventName.PAYMENT_TXN_RESPONSE]: {
    'Phone Number': string;
    vertical: string;
    'Vertical Internal Order Id': string;
    'Payment Order Id': string;
    'Total Amount': number;
    'Payment Method Type': string;
    JuspayResponseCode: string;
    Response: string;
    Status: string;
  };
  [CleverTapEventName.PAYMENT_ORDER_STATUS]: {
    'Phone Number': string;
    vertical: string;
    'Vertical Internal Order Id': string;
    'Payment Order Id': string;
    'Payment Method Type': string;
    BackendPaymentStatus: string;
    JuspayResponseCode: string;
    Response: string;
    Status: string;
  };
}
