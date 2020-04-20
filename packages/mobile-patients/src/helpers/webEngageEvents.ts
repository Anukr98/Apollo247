type YesOrNo = { value: 'Yes' | 'No' };

export enum WebEngageEventName {
  ONBOARDING_SCREEN_1 = 'Onboarding Screen 1',
  ONBOARDING_SCREEN_2 = 'Onboarding Screen 2',
  ONBOARDING_SCREEN_3 = 'Onboarding Screen 3',
  ONBOARDING_SCREEN_4 = 'Onboarding Screen 4',
  ONBOARDING_SKIP_CLICKED = 'Onboarding Skip Clicked',
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
  RATING_GIVEN = 'Rating Given',

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
  CONSULT_RX = 'Consult & RX',
  MEDICAL_RECORDS = 'Medical Records',
  ADD_RECORD = 'Add Record',
  UPLOAD_PRESCRIPTION = 'Upload Prescription',
  UPLOAD_PHOTO = 'Upload Photo',
  ITEMS_CLICKED = 'Items Clicked',
  REORDER_MEDICINES = 'Reorder Medicines',
}

export interface PatientInfo {
  'Patient Name': string;
  'Patient UHID': string;
  Relation: string;
  Age: number;
  Gender: string;
  'Mobile Number': string;
  'Customer ID': string;
}

export interface PatientInfoWithSource extends PatientInfo {
  Source: 'Home Screen' | 'Menu';
}

export interface PatientInfoWithNeedHelp extends PatientInfo {
  Source: 'Home Screen' | 'Medicines' | 'Tests' | 'My Account' | 'Doctor Search';
}

export interface SpecialityClickedEvent extends PatientInfo {
  'Speciality Name': string;
}

export interface WebEngageEvents {
  // ********** AppEvents ********** \\

  [WebEngageEventName.ONBOARDING_SCREEN_1]: {};
  [WebEngageEventName.ONBOARDING_SCREEN_2]: {};
  [WebEngageEventName.ONBOARDING_SCREEN_3]: {};
  [WebEngageEventName.ONBOARDING_SCREEN_4]: {};
  [WebEngageEventName.ONBOARDING_SKIP_CLICKED]: {};
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
    'Date of Birth': string;
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
    // Age: number;
    // Gender: string;
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
    // Age: number;
    // Gender: string;
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
    Age: number;
    Gender: string;
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
    'Available in': string;
  };
  [WebEngageEventName.BOOK_APPOINTMENT]: {
    'Doctor Name': string;
    'Doctor City': string;
    'Type of Doctor': string;
    'Doctor Specialty': string;
    'Patient Name': string;
    'Patient UHID': string;
    Relation: string;
    Age: number;
    Gender: string;
    'Mobile Number': string;
    'Customer ID': string;
  };
  [WebEngageEventName.DOCTOR_CLICKED]: {
    'Doctor Name': string;
    Source: 'List' | 'Search';
  };
  [WebEngageEventName.CONSULT_NOW_CLICKED]: {
    name: string;
    specialisation: string;
    experience: number;
    'language known': string; // Comma separated values
    Hospital: string;
    'Available in': string;
    Source: 'List' | 'Profile'; // List/Profile
    'Patient Name': string;
    'Patient UHID': string;
    Relation: string;
    Age: number;
    Gender: string;
    'Mobile Number': number;
    'Customer ID': string;
    slot: string;
  };
  // confirm the type of data for the below
  [WebEngageEventName.CONSULT_SCHEDULE_FOR_LATER_CLICKED]: {
    name: string;
    specialisation: string;
    experience: number;
    'language known': string; // Comma separated values
    Hospital: string;
    Source: 'List' | 'Profile'; // List/Profile
    'Patient Name': string;
    'Patient UHID': string;
    Relation: string;
    Age: number;
    Gender: string;
    'Mobile Number': number;
    'Customer ID': string;
    slot: string;
  };
  [WebEngageEventName.CONSULT_SLOT_SELECTED]: {
    slot: string;
    doctorName: string;
    specialisation: string;
    experience: number;
    'language known': string; // Comma separated values
    hospital: string;
    consultType: 'clinic' | 'online';
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
    'Type of Doctor': string;
    'Doctor Specialty': string;
    'Appointment Date': string;
    'Appointment Time': string;
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
  };
  [WebEngageEventName.CONSULTATION_BOOKED]: {
    'Consult ID': string;
    name: string;
    specialisation: string;
    category: string;
    time: Date | string;
    consultType: 'online' | 'clinic';
    'clinic name': string;
    'clinic address': string; // whole address
    'Patient Name': string;
    'Patient UHID': string;
    Relation: string;
    Age: number;
    Gender: string;
    'Mobile Number': number;
    'Customer ID': string;
  };
  [WebEngageEventName.RATING_GIVEN]: {
    'Patient UHID': string;
    Type: 'Consult' | 'Medicine' | 'Diagnostics';
    'Rating Value': string;
    'Rating Reason': string;
  };

  [WebEngageEventName.FEATURED_TEST_CLICKED]: {
    'Product name': string;
    'Product id (SKUID)': string;
    Source: 'Home' | 'List';
    'Patient Name': string;
    'Patient UHID': string;
    Relation: string;
    Age: number;
    Gender: string;
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
    Age: number;
    Gender: string;
    'Mobile Number': string;
    'Customer ID': string;
  };

  // ********** Health Records ********** \\

  [WebEngageEventName.CONSULT_RX]: {
    'Patient Name': string;
    'Patient UHID': string;
    Relation: string;
    Age: number;
    Gender: string;
    'Mobile Number': string;
    'Customer ID': string;
  };

  [WebEngageEventName.MEDICAL_RECORDS]: {
    'Patient Name': string;
    'Patient UHID': string;
    Relation: string;
    Age: number;
    Gender: string;
    'Mobile Number': string;
    'Customer ID': string;
  };

  [WebEngageEventName.ADD_RECORD]: {
    Source: 'Consult & RX' | 'Medical Records'; // List/Profile
  };

  [WebEngageEventName.UPLOAD_PRESCRIPTION]: {
    'Patient Name': string;
    'Patient UHID': string;
    Relation: string;
    Age: number;
    Gender: string;
    'Mobile Number': string;
    'Customer ID': string;
  };

  [WebEngageEventName.UPLOAD_PHOTO]: {
    Source: 'Take Photo' | 'Gallery'; // List/Profile
  };

  [WebEngageEventName.ITEMS_CLICKED]: {
    Source: 'Consult & RX' | 'Medical Records'; // List/Profile
    Type: 'Prescription' | 'Test Result';
  };

  [WebEngageEventName.REORDER_MEDICINES]: {
    'Patient Name': string;
    'Patient UHID': string;
    Relation: string;
    Age: number;
    Gender: string;
    'Mobile Number': string;
    'Customer ID': string;
  };
}
