import { DoctorType } from '@aph/mobile-patients/src/graphql/types/globalTypes';

type YesOrNo = { value: 'Yes' | 'No' };

export enum WebEngageEventName {
  MOBILE_ENTRY = 'Mobile Entry',
  MOBILE_NUMBER_ENTERED = 'Mobile Number Entered',
  OTP_ENTERED = 'OTP Entered',
  PRE_APOLLO_CUSTOMER = 'Pre Apollo Customer',
  OTP_VERIFICATION_SUCCESS = 'OTP Verification Success',
  REGISTRATION_DONE = 'Registration Done',
  NUMBER_OF_PROFILES_FETCHED = 'Number of Profiles fetched',
  SEARCH = 'Pharmacy Search',
  PHARMACY_PRODUCT_CLICKED = 'Pharmacy Product Clicked',
  NOTIFY_ME = 'Notify Me',
  CATEGORY_CLICKED = 'Pharmacy Category Clicked',
  PHARMACY_ADD_TO_CART = 'Pharmacy Add to cart',
  DIAGNOSTIC_ADD_TO_CART = 'Diagnostic Add to cart',
  BUY_NOW = 'Buy Now',
  PHARMACY_CART_VIEWED = 'Pharmacy Cart Viewed',
  DIAGNOSTIC_CART_VIEWED = 'Diagnostic Cart Viewed',
  PHARMACY_PROCEED_TO_PAY_CLICKED = 'Pharmacy Proceed To Pay Clicked',
  DIAGNOSTIC_PROCEED_TO_PAY_CLICKED = 'Diagnostic Proceed To Pay Clicked',
  PHARMACY_PAYMENT_INITIATED = 'Pharmacy Payment Initiated',
  DIAGNOSTIC_PAYMENT_INITIATED = 'Diagnostic Payment Initiated',
  UPLOAD_PRESCRIPTION_CLICKED = 'Pharmacy Upload Prescription Clicked',
  UPLOAD_PRESCRIPTION_IMAGE_UPLOADED = 'Upload Prescription Image Uploaded',
  PHARMACY_SUBMIT_PRESCRIPTION = 'Pharmacy Submit Prescription',
  PHARMACY_CHECKOUT_COMPLETED = 'Pharmacy Checkout completed',
  DIAGNOSTIC_CHECKOUT_COMPLETED = 'Diagnostic Checkout completed',
  DOCTOR_SEARCH = 'Doctor Search',
  SPECIALITY_CLICKED = 'Speciality Clicked',
  DOCTOR_CLICKED = 'Doctor Clicked',
  DOCTOR_PROFILE_VIEWED = 'Doctor Profile Viewed',
  BOOK_APPOINTMENT = 'Book Appointment',
  CONSULT_NOW_CLICKED = 'Consult Now clicked',
  CONSULT_SCHEDULE_FOR_LATER_CLICKED = 'Consult Schedule for Later clicked',
  CONSULT_SLOT_SELECTED = 'Consult Slot Selected',
  CONSULT_COUPON_APPLIED = 'Coupon Applied',
  PAY_BUTTON_CLICKED = 'Pay Button Clicked',
  CONSULTATION_BOOKED = 'Consultation booked',
  PHARMACY_FEEDBACK_GIVEN = 'Pharmacy Feedback Given',

  // HomePageElements Events
  BUY_MEDICINES = 'Buy Medicines',
  ORDER_TESTS = 'Order Tests',
  MANAGE_DIABETES = 'Manage Diabetes',
  TRACK_SYMPTOMS = 'Track Symptoms',
  VIEW_HELATH_RECORDS = 'View Helath Records',
  CORONA_VIRUS_TALK_TO_OUR_EXPERT = 'Corona Virus?Talk to our expert',
  ACTIVE_APPOINTMENTS = 'Active Appointments',
  NEED_HELP = 'Need Help?',
  MY_ACCOUNT = 'My Account',
  FIND_A_DOCTOR = 'Find a Doctor',

  // Diagnostics Events
  FEATURED_TEST_CLICKED = 'Featured Test Clicked',
  BROWSE_PACKAGE = 'Browse Package',

  // Health Records
  CONSULT_RX = 'PHR Consult & RX',
  MEDICAL_RECORDS = 'PHR Medical Records',
  ADD_RECORD = 'Add Record',
  UPLOAD_PRESCRIPTION = 'Upload Prescription',
  UPLOAD_PHOTO = 'Upload Photo',
  ITEMS_CLICKED = 'Items Clicked',
  REORDER_MEDICINES = 'Reorder Medicines',
  PHR_ORDER_MEDS_TESTS = 'PHR Order Meds & Tests',
  PHR_CONSULT_CARD_CLICK = 'PHR Consult Card click',

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

export interface PatientInfoWithSource extends PatientInfo {
  Source: 'Home Screen' | 'Menu';
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

export interface WebEngageEvents {
  // ********** AppEvents ********** \\

  [WebEngageEventName.MOBILE_ENTRY]: {};
  [WebEngageEventName.MOBILE_NUMBER_ENTERED]: { mobilenumber: string };
  [WebEngageEventName.OTP_ENTERED]: YesOrNo;
  [WebEngageEventName.PRE_APOLLO_CUSTOMER]: YesOrNo;
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
  [WebEngageEventName.CORONA_VIRUS_TALK_TO_OUR_EXPERT]: { clicked: true };
  [WebEngageEventName.ACTIVE_APPOINTMENTS]: { clicked: true };
  [WebEngageEventName.NEED_HELP]: PatientInfoWithNeedHelp; // source values may change later
  [WebEngageEventName.MY_ACCOUNT]: PatientInfo;
  [WebEngageEventName.FIND_A_DOCTOR]: PatientInfo;

  // ********** PharmacyEvents ********** \\

  [WebEngageEventName.SEARCH]: {
    keyword: string;
    Source: 'Pharmacy Home' | 'Pharmacy List';
  };
  [WebEngageEventName.PHARMACY_PRODUCT_CLICKED]: {
    'product name': string;
    'product id': string; // (SKUID)
    Brand: string;
    'Brand ID': string;
    'category name': string;
    'category ID': string;
    Source: 'Home' | 'List' | 'Search';
    'Section Name': string;
  };
  [WebEngageEventName.NOTIFY_ME]: {
    'product name': string;
    'product id': string; // (SKUID)
    Brand: string;
    'Brand ID': string;
    'category name': string;
    'category ID': string;
  };

  [WebEngageEventName.CATEGORY_CLICKED]: {
    'category name': string;
    'category ID': string;
    Source: 'Home'; // Home
    'Section Name': string;
  };
  [WebEngageEventName.PHARMACY_ADD_TO_CART]: {
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
  [WebEngageEventName.BUY_NOW]: {
    'product name': string;
    'product id': string; // (SKUID)
    Brand: string;
    'Brand ID': string;
    'category name': string;
    'category ID': string;
    Price: number;
    'Discounted Price': number;
    Quantity: number;
    'Service Area': 'Pharmacy' | 'Diagnostic';
  };
  [WebEngageEventName.PHARMACY_CART_VIEWED]: {
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
  [WebEngageEventName.UPLOAD_PRESCRIPTION_IMAGE_UPLOADED]: {
    Source: 'Take a Photo' | 'Choose Gallery' | 'E-Rx';
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

  // ********** ConsultEvents ********** \\

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
  [WebEngageEventName.DOCTOR_PROFILE_VIEWED]: {
    name: string;
    specialisation: string;
    experience: number;
    'language known': string; //Comma separated values
    Hospital: string;
    'Doctor Category': DoctorType;
    'Doctor ID': string;
    'Speciality ID': string;
    'Available in Minutes'?: number;
  };
  [WebEngageEventName.BOOK_APPOINTMENT]: {
    'Doctor Name': string;
    'Doctor City': string;
    'Type of Doctor': DoctorType;
    'Doctor Specialty': string;
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

  [WebEngageEventName.REORDER_MEDICINES]: PatientInfo;

  [WebEngageEventName.PHR_ORDER_MEDS_TESTS]: PatientInfoWithConsultId;

  [WebEngageEventName.PHR_CONSULT_CARD_CLICK]: PatientInfoWithConsultId;

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
}
