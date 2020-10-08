import {
  DoctorType,
  MEDICINE_ORDER_STATUS,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';

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
  PHARMACY_STORE_PICKUP_VIEWED = 'Pharmacy store pickup viewed', // Every time a new pincode is entered, the event must be triggered
  PHARMACY_STORE_SELECTED_SUCCESS = 'Pharmacy store selected success',
  PHARMACY_ADD_TO_CART = 'Pharmacy Add to cart',
  PHARMACY_ADD_TO_CART_NONSERVICEABLE = 'Pharmacy Add to cart Nonserviceable',
  DIAGNOSTIC_ADD_TO_CART = 'Diagnostic Add to cart',
  PHARMACY_CART_VIEWED = 'Pharmacy Cart Viewed',
  SKU_PRICE_MISMATCH = 'SKU Price Mismatch',
  TAT_API_FAILURE = 'Tat API Failure',
  DIAGNOSTIC_CART_VIEWED = 'Diagnostic Cart Viewed',
  PHARMACY_PROCEED_TO_PAY_CLICKED = 'Pharmacy Proceed To Pay Clicked',
  DIAGNOSTIC_PROCEED_TO_PAY_CLICKED = 'Diagnostic Proceed To Pay Clicked',
  PHARMACY_PAYMENT_INITIATED = 'Pharmacy Payment Initiated',
  DIAGNOSTIC_PAYMENT_INITIATED = 'Diagnostic Payment Initiated',
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
  DIAGNOSTIC_CHECKOUT_COMPLETED = 'Diagnostic Checkout completed',
  DOCTOR_SEARCH = 'Doctor Search',
  SPECIALITY_CLICKED = 'Speciality Clicked',
  DOCTOR_CLICKED = 'Doctor Clicked',
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

  MY_ORDERS_CLICKED = 'My Orders Clicked',
  ORDER_SUMMARY_CLICKED = 'Order Summary Clicked',
  PHARMACY_MY_ORDER_TRACKING_CLICKED = 'Pharmacy My Order Tracking Clicked',
  PHARMACY_ADD_NEW_ADDRESS_CLICK = 'Pharmacy Add New Address Click', // (Once user clicks on Save)
  PHARMACY_ADD_NEW_ADDRESS_COMPLETED = 'Pharmacy Add New Address Completed', // (Event triggered Once the address is selected & TAT is displayed)
  PHARMACY_CART_ADDRESS_SELECTED_SUCCESS = 'Pharmacy Cart Address Selected Success',
  PHARMACY_CART_ADDRESS_SELECTED_FAILURE = 'Pharmacy Cart Address Selected Failure',
  PHARMACY_AVAILABILITY_API_CALLED = 'Pharmacy Availability API Called',
  PHARMACY_TAT_API_CALLED = 'Pharmacy TAT API Called',

  // HomePageElements Events
  BUY_MEDICINES = 'Buy Medicines',
  ORDER_TESTS = 'Order Tests',
  MANAGE_DIABETES = 'Manage Diabetes',
  TRACK_SYMPTOMS = 'Track Symptoms',
  VIEW_HELATH_RECORDS = 'View Helath Records',
  LEARN_MORE_ABOUT_CORONAVIRUS = 'Learn more about coronavirus',
  CHECK_YOUR_RISK_LEVEL = 'Check your risk level',
  NOTIFICATION_ICON = 'Notification Icon clicked',
  ACTIVE_APPOINTMENTS = 'Active Appointments',
  NEED_HELP = 'Need Help?',
  TICKET_RAISED = 'Ticket raised',
  MY_ACCOUNT = 'My Account',
  FIND_A_DOCTOR = 'Find a Doctor',
  TABBAR_APPOINTMENTS_CLICKED = 'Appointments Clicked on tab bar',
  APOLLO_KAVACH_PROGRAM = 'Apollo Kavach Program',

  // Diagnostics Events
  FEATURED_TEST_CLICKED = 'Featured Test Clicked',
  BROWSE_PACKAGE = 'Browse Package',
  DIAGNOSTIC_ENTER_DELIVERY_PINCODE_CLICKED = 'Diagnostic Enter Delivery Pincode Clicked',
  DIAGNOSTIC_ENTER_DELIVERY_PINCODE_SUBMITTED = 'Diagnostic Enter Delivery Pincode Submitted ',

  // Health Records
  CONSULT_RX = 'PHR Consult & RX',
  MEDICAL_RECORDS = 'PHR Medical Records',
  ADD_RECORD = 'Add Record',
  UPLOAD_PRESCRIPTION = 'Upload Prescription',
  UPLOAD_PHOTO = 'Upload Photo',
  ITEMS_CLICKED = 'Items Clicked',
  PHR_ORDER_MEDS_TESTS = 'PHR Order Meds & Tests',
  PHR_CONSULT_CARD_CLICK = 'PHR Consult Card click',
  RE_ORDER_MEDICINE = 'ReOrder Medicine',
  PHR_VIEW_PRESCRIPTIONS = 'PHR View Prescriptions - app',
  PHR_VIEW_LAB_TESTS = 'PHR View Lab Tests - app',
  PHR_VIEW_HEALTH_CHECKS = 'PHR View Health Checks - app',
  PHR_VIEW_HOSPITALIZATIONS = 'PHR View Hospitalizations - app',
  PHR_ADD_PRESCRIPTIONS = 'PHR Add Prescriptions - app',
  PHR_ADD_LAB_TESTS = 'PHR Add Lab Tests - app',
  PHR_ADD_HEALTH_CHECKS = 'PHR Add Health Checks - app',
  PHR_ADD_HOSPITALIZATIONS = 'PHR Add Hospitalizations - app',
  PHR_DOWNLOAD_PRESCRIPTIONS = 'PHR Download Prescriptions - app',
  PHR_DOWNLOAD_LAB_TESTS = 'PHR Download Lab Tests - app',
  PHR_DOWNLOAD_HEALTH_CHECKS = 'PHR Download Health Checks - app',
  PHR_DOWNLOAD_HOSPITALIZATIONS = 'PHR Download Hospitalizations - app',
  // ConsultRoom Events
  CONSULTATION_CANCELLED_BY_CUSTOMER = 'Consultation Cancelled by Customer',
  CONSULTATION_RESCHEDULED_BY_CUSTOMER = 'Consultation Rescheduled by Customer',
  COMPLETED_AUTOMATED_QUESTIONS = 'Completed Automated Questions',
  JD_COMPLETED = 'JD Completed',
  PRESCRIPTION_RECEIVED = 'Prescription Received',
  SD_CONSULTATION_STARTED = 'SD Consultation Started',
  SD_VIDEO_CALL_STARTED = 'SD Video call started',
  CONSULT_FEEDBACK_GIVEN = 'Consult feedback Given',
  DOWNLOAD_PRESCRIPTION = 'Download Prescription',
  VIEW_PRESCRIPTION_IN_CONSULT_DETAILS = 'View Prescription in Consult Details',
  ORDER_MEDICINES_FROM_PRESCRIPTION_DETAILS = 'Order Medicines from Prescription details',
  ORDER_TESTS_FROM_PRESCRIPTION_DETAILS = 'Order Tests from Prescription details',
  CONSULT_CARD_CLICKED = 'Consult Card Clicked',
  CONTINUE_CONSULT_CLICKED = 'Continue Consult Clicked',
  CHAT_WITH_DOCTOR = 'Chat with Doctor',
  FILL_MEDICAL_DETAILS = 'Fill Medical Details',
  RESCHEDULE_CLICKED = 'Reschedule Clicked', // In appointment details screen
  CANCEL_CONSULTATION_CLICKED = 'Cancel Consultation Clicked', // In appointment details screen
  CONTINUE_CONSULTATION_CLICKED = 'Continue Consultation Clicked', // In appointment details screen
  NO_SLOTS_FOUND = 'No Slots Found', // In appointment details screen
  DOCTOR_RESCHEDULE_CLAIM_REFUND = 'Doctor reschedule and Claim Refund button click',
  DOCTOR_CONNECT_TAB_CLICKED = 'Doctor Connect Tab Clicked',
  APOLLO_DOCTOR_TAB_CLICKED = 'Apollo Doctor Tab Clicked',
  UPLOAD_RECORDS_CLICK_CHATROOM = 'Upload Records in chatroom clicked',
  TAKE_PHOTO_CLICK_CHATROOM = 'Take a photo in consult room clicked',
  GALLERY_UPLOAD_PHOTO_CLICK_CHATROOM = 'choose from gallery in consult room clicked',
  UPLOAD_PHR_CLICK_CHATROOM = 'Upload from PHR in consult room clicked',
  PATIENT_JOINED_CONSULT = 'Patient Joined the consult with doctor',
  PATIENT_ENDED_CONSULT = 'Patient ended the consult',
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

  // Deeplink Events
  HOME_PAGE_VIEWED = 'Pharmacy Home page viewed',
  PRODUCT_PAGE_VIEWED = 'Product page viewed',
  CATEGORY_PAGE_VIEWED = 'Category page viewed',

  // HDFC events
  HDFC_OTP_GENERATE_CLICKED = 'HDFC Generate OTP Clicked',
  HDFC_OTP_VERIFY_CLICKED = 'HDFC Verify OTP Clicked',
  HDFC_EXPLORE_BENEFITS_CLICKED = 'HDFC Explore Benefits Clicked',
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

export interface HdfcCustomerPlanInfo extends HdfcCustomerInfo {
  'Partner ID': string;
  HDFCMembershipLevel: HdfcPlan;
  HDFCMembershipState: 'Active' | 'Inactive';
}

export interface HdfcBenefitInfo {
  'User ID': string;
  'Plan': HdfcPlan;
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

  // ********** Home Screen Events ********** \\

  [WebEngageEventName.BUY_MEDICINES]: PatientInfoWithSource;
  [WebEngageEventName.ORDER_TESTS]: PatientInfoWithSource;
  [WebEngageEventName.MANAGE_DIABETES]: PatientInfo;
  [WebEngageEventName.TRACK_SYMPTOMS]: PatientInfo;
  [WebEngageEventName.VIEW_HELATH_RECORDS]: PatientInfoWithSource;
  [WebEngageEventName.LEARN_MORE_ABOUT_CORONAVIRUS]: { clicked: true };
  [WebEngageEventName.CHECK_YOUR_RISK_LEVEL]: { clicked: true };
  [WebEngageEventName.APOLLO_KAVACH_PROGRAM]: { clicked: true };
  [WebEngageEventName.NOTIFICATION_ICON]: { clicked: true };
  [WebEngageEventName.ACTIVE_APPOINTMENTS]: { clicked: true };
  [WebEngageEventName.NEED_HELP]: PatientInfoWithNeedHelp; // source values may change later
  [WebEngageEventName.TICKET_RAISED]: { Category: string; Query: string };
  [WebEngageEventName.MY_ACCOUNT]: PatientInfo;
  [WebEngageEventName.FIND_A_DOCTOR]: PatientInfo;
  [WebEngageEventName.TABBAR_APPOINTMENTS_CLICKED]: PatientInfoWithSource;
  [WebEngageEventName.PAST_DOCTOR_SEARCH]: {
    'Patient UHID': string;
    'Mobile Number': string;
    'Customer ID': string;
    'Past Searches': any;
  };

  // ********** PharmacyEvents ********** \\

  [WebEngageEventName.SEARCH]: {
    keyword: string;
    Source: 'Pharmacy Home' | 'Pharmacy List' | 'Pharmacy PDP';
    resultsdisplayed: number;
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
    Source: 'Home'; // Home
    'Section Name': string;
    imageUrl: string;
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
      | 'Pharmacy Full Search';
    Brand?: string;
    'Brand ID'?: string;
    'category name'?: string;
    'category ID'?: string;
    Section?: string;
    'Section Name'?: string;
    af_revenue: number;
    af_currency: string;
    // 'Patient Name': string;
    // 'Patient UHID': string;
    // Relation: string;
    // 'Patient Age': number;
    // 'Patient Gender': string;
    // 'Mobile Number': string;
    // 'Customer ID': string;
  };
  [WebEngageEventName.PHARMACY_ADD_TO_CART_NONSERVICEABLE]: {
    'product name': string;
    'product id': string;
    pincode: string;
    'Mobile Number': string;
  };

  [WebEngageEventName.DIAGNOSTIC_ADD_TO_CART]: {
    'product name': string;
    'product id': string; // (SKUID)
    Price: number;
    'Discounted Price': number;
    Quantity: number;
    Source: 'Pharmacy Home' | 'Pharmacy PDP' | 'Pharmacy List' | 'Diagnostic';
    Brand?: string;
    'Brand ID'?: string;
    'category name'?: string;
    'category ID'?: string;
    // 'Patient Name': string;
    // 'Patient UHID': string;
    // Relation: string;
    // 'Patient Age': number;
    // 'Patient Gender': string;
    // 'Mobile Number': string;
    // 'Customer ID': string;
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
  [WebEngageEventName.DIAGNOSTIC_CART_VIEWED]: {
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
  };
  [WebEngageEventName.DIAGNOSTIC_PROCEED_TO_PAY_CLICKED]: {
    'Total items in cart': number;
    'Sub Total': number;
    'Delivery charge': number;
    'Net after discount': number;
    'Prescription Needed?': boolean;
    'Cart ID'?: string; // we don't have cartId before placing order
    'Mode of Sample Collection': 'Home' | 'Pickup' | 'Home Visit' | 'Clinic Visit';
    'Delivery Date Time'?: string; // Optional (only if Home)
    'Pin Code': string | number;
    'Service Area': 'Pharmacy' | 'Diagnostic';
  };
  [WebEngageEventName.PHARMACY_PAYMENT_INITIATED]: {
    'Payment mode': 'Online' | 'COD';
    Amount: number;
    'Service Area': 'Pharmacy' | 'Diagnostic';
  };
  [WebEngageEventName.DIAGNOSTIC_PAYMENT_INITIATED]: {
    'Payment mode': 'Online' | 'COD';
    Amount: number;
    'Service Area': 'Pharmacy' | 'Diagnostic';
  };
  [WebEngageEventName.UPLOAD_PRESCRIPTION_CLICKED]: {
    Source: 'Home' | 'Cart';
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
  };
  [WebEngageEventName.UPLOAD_PRESCRIPTION_IMAGE_UPLOADED]: {
    Source: 'Take a Photo' | 'Choose Gallery' | 'E-Rx';
    'Upload Source'?: 'Cart' | 'Upload Flow';
  };
  [WebEngageEventName.PHARMACY_SUBMIT_PRESCRIPTION]: {
    'Order ID': string | number;
    'Delivery type': 'home' | 'store pickup';
    StoreId?: string; //(incase of store delivery)
    'Delivery address'?: string;
    Pincode: string | number;
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
  };
  [WebEngageEventName.PHARMACY_DETAIL_IMAGE_CLICK]: {
    'Product ID': string;
    'Product Name': string;
  };
  [WebEngageEventName.DIAGNOSTIC_CHECKOUT_COMPLETED]: {
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
    'Speciality ID': string;
    'Doctor Category': DoctorType;
    'Online Price': number;
    'Physical Price': number;
    'Doctor Speciality': string;
  };
  [WebEngageEventName.DOCTOR_CARD_CONSULT_CLICK]: {
    'Patient Name': string;
    'Doctor ID': string;
    'Speciality ID': string;
    'Doctor Speciality': string;
    'Doctor Experience': number;
    'Language Known': string;
    'Hospital Name': string;
    'Hospital City': string | null;
    'Availability Minutes': number;
    Source: 'List' | 'Profile';
    'Patient UHID': string;
    Relation: string;
    'Patient Age': number;
    'Patient Gender': string;
    'Customer ID': string;
    Rank: number;
  };
  [WebEngageEventName.DOCTOR_CONNECT_CARD_CLICK]: {
    'Online Price': number;
    'Physical Price': number;
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

  [WebEngageEventName.FEATURED_TEST_CLICKED]: {
    'Product name': string;
    'Product id (SKUID)': string;
    Source: 'Home' | 'List';
    'Patient Name': string;
    'Patient UHID': string;
    Relation: string;
    'Patient Age': number;
    'Patient Gender': string;
    'Mobile Number': string;
    'Customer ID': string;
  };

  [WebEngageEventName.BROWSE_PACKAGE]: {
    'Package Name': string;
    // Category: string; we don't have category for test
    Source: 'Home' | 'List';
    'Patient Name': string;
    'Patient UHID': string;
    Relation: string;
    'Patient Age': number;
    'Patient Gender': string;
    'Mobile Number': string;
    'Customer ID': string;
  };

  // ********** Health Records ********** \\

  [WebEngageEventName.CONSULT_RX]: PatientInfo;

  [WebEngageEventName.MEDICAL_RECORDS]: PatientInfo;

  [WebEngageEventName.ADD_RECORD]: {
    Source: 'Consult & RX' | 'Medical Records'; // List/Profile
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
    'Stock availability': YesOrNo;
    /**
     * Category ID & Category Name is applicable if customers clicks on products from any category (all categories of shop by category or health areas)
     */
    'Category ID'?: string;
    'Category Name'?: string;
    /**
     * Section Name is applicable if customer clicked on the product from the homepage product widgets like Hot sellers, Recommended products
     */
    'Section Name'?: string;
  };
  [WebEngageEventName.CATEGORY_PAGE_VIEWED]: {
    source: 'home' | 'deeplink' | 'registration';
    CategoryId: string;
    CategoryName: string;
  };
  [WebEngageEventName.CONFIRM_LOCATION]: {
    isMarkerModified: boolean;
    changedByInMeters: number;
  };
  [WebEngageEventName.HDFC_OTP_GENERATE_CLICKED]: HdfcCustomerInfo;
  [WebEngageEventName.HDFC_OTP_VERIFY_CLICKED]: HdfcCustomerInfo;
  [WebEngageEventName.HDFC_EXPLORE_BENEFITS_CLICKED]: HdfcCustomerPlanInfo;
  [WebEngageEventName.HDFC_HOMEPAGE_CAROUSEL_CLICKED]: HdfcCustomerPlanInfo;
  [WebEngageEventName.HDFC_MY_MEMBERSHIP_VIEWED]: HdfcBenefitInfo;
  [WebEngageEventName.HDFC_PLAN_DETAILS_VIEWED]: HdfcBenefitInfo;
  [WebEngageEventName.HDFC_EXPLORE_PLAN_CLICKED]: HdfcBenefitInfo;
  [WebEngageEventName.HDFC_HOW_TO_AVAIL_CLICKED]: HdfcBenefitInfo;
  [WebEngageEventName.HDFC_REDEEM_CLICKED]: {
    'User ID': string;
    'Benefit': string;
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
}
