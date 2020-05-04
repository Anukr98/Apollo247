type YesOrNo = { value: 'Yes' | 'No' };

export enum FirebaseEventName {
  MOBILE_ENTRY = 'Mobile Entry',
  LOGIN = 'login',
  OTP_ENTERED = 'OTP Entered',
  PRE_APOLLO_CUSTOMER = 'Pre Apollo Customer',
  OTP_VERIFICATION_SUCCESS = 'OTP Verification Success',
  SIGN_UP = 'sign_up',
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
  PHARMACY_SUBMIT_PRESCRIPTION = 'PHARMACY_SUBMIT_PRESCRIPTION',
  PHARMACY_CHECKOUT_COMPLETED = 'PHARMACY_CHECKOUT_COMPLETED',
  DIAGNOSTIC_CHECKOUT_COMPLETED = 'DIAGNOSTIC_CHECKOUT_COMPLETED',
  DOCTOR_SEARCH = 'Doctor Search',
  SPECIALITY_CLICKED = 'Speciality Clicked',
  DOCTOR_CLICKED = 'Doctor Clicked',
  BOOK_APPOINTMENT = 'Book Appointment',
  CONSULT_NOW_CLICKED = 'Consult Now clicked',
  CONSULT_SCHEDULE_FOR_LATER_CLICKED = 'Consult Schedule for Later clicked',
  CONSULT_SLOT_SELECTED = 'Consult Slot Selected',
  CONSULT_COUPON_APPLIED = 'Coupon Applied',
  PAY_BUTTON_CLICKED = 'Pay Button Clicked',
  CONSULTATION_BOOKED = 'CONSULTATION_BOOKED',
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

  //In App Purchase Events
  IN_APP_PURCHASE = 'In_app_purchase',
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

export interface FirebaseEvents {
  // ********** AppEvents ********** \\

  [FirebaseEventName.MOBILE_ENTRY]: {};
  [FirebaseEventName.LOGIN]: { mobilenumber: string };
  [FirebaseEventName.OTP_ENTERED]: YesOrNo;
  [FirebaseEventName.PRE_APOLLO_CUSTOMER]: YesOrNo;
  [FirebaseEventName.OTP_VERIFICATION_SUCCESS]: {
    Mobile_Number: string;
  };
  [FirebaseEventName.SIGN_UP]: {
    Customer_ID: string;
    Customer_First_Name: string;
    Customer_Last_Name: string;
    Date_of_Birth?: Date | string;
    Gender?: string;
    Email?: string;
    Referral_Code?: string;
  };
  [FirebaseEventName.NUMBER_OF_PROFILES_FETCHED]: { count: number };

  // ********** Home Screen Events ********** \\

  [FirebaseEventName.BUY_MEDICINES]: PatientInfoWithSource;
  [FirebaseEventName.ORDER_TESTS]: PatientInfoWithSource;
  [FirebaseEventName.MANAGE_DIABETES]: PatientInfo;
  [FirebaseEventName.TRACK_SYMPTOMS]: PatientInfo;
  [FirebaseEventName.VIEW_HELATH_RECORDS]: PatientInfoWithSource;
  [FirebaseEventName.CORONA_VIRUS_TALK_TO_OUR_EXPERT]: { clicked: true };
  [FirebaseEventName.ACTIVE_APPOINTMENTS]: { clicked: true };
  [FirebaseEventName.NEED_HELP]: PatientInfoWithNeedHelp; // source values may change later
  [FirebaseEventName.MY_ACCOUNT]: PatientInfo;
  [FirebaseEventName.FIND_A_DOCTOR]: PatientInfo;

  // ********** PharmacyEvents ********** \\

  [FirebaseEventName.SEARCH]: {
    keyword: string;
    Source: 'Pharmacy Home' | 'Pharmacy List';
  };
  [FirebaseEventName.PHARMACY_PRODUCT_CLICKED]: {
    'product name': string;
    'product id': string; // (SKUID)
    Brand: string;
    'Brand ID': string;
    'category name': string;
    'category ID': string;
    Source: 'Home' | 'List' | 'Search';
    'Section Name': string;
  };
  [FirebaseEventName.NOTIFY_ME]: {
    'product name': string;
    'product id': string; // (SKUID)
    Brand: string;
    'Brand ID': string;
    'category name': string;
    'category ID': string;
  };

  [FirebaseEventName.CATEGORY_CLICKED]: {
    'category name': string;
    'category ID': string;
    Source: 'Home'; // Home
    'Section Name': string;
  };
  [FirebaseEventName.PHARMACY_ADD_TO_CART]: {
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
  [FirebaseEventName.DIAGNOSTIC_ADD_TO_CART]: {
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
  [FirebaseEventName.BUY_NOW]: {
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
  [FirebaseEventName.PHARMACY_CART_VIEWED]: {
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
  [FirebaseEventName.DIAGNOSTIC_CART_VIEWED]: {
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
  [FirebaseEventName.PHARMACY_PROCEED_TO_PAY_CLICKED]: {
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
  [FirebaseEventName.DIAGNOSTIC_PROCEED_TO_PAY_CLICKED]: {
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
  [FirebaseEventName.PHARMACY_PAYMENT_INITIATED]: {
    'Payment mode': 'Online' | 'COD';
    Amount: number;
    'Service Area': 'Pharmacy' | 'Diagnostic';
  };
  [FirebaseEventName.DIAGNOSTIC_PAYMENT_INITIATED]: {
    'Payment mode': 'Online' | 'COD';
    Amount: number;
    'Service Area': 'Pharmacy' | 'Diagnostic';
  };
  [FirebaseEventName.UPLOAD_PRESCRIPTION_CLICKED]: {
    Source: 'Home' | 'Cart';
  };
  [FirebaseEventName.UPLOAD_PRESCRIPTION_IMAGE_UPLOADED]: {
    Source: 'Take a Photo' | 'Choose Gallery' | 'E-Rx';
  };
  [FirebaseEventName.PHARMACY_SUBMIT_PRESCRIPTION]: {
    Order_ID: string | number;
    Delivery_type: 'home' | 'store_pickup';
    StoreId?: string; //(incase of store delivery)
    Delivery_address?: string;
    Pincode: string | number;
  };
  [FirebaseEventName.PHARMACY_CHECKOUT_COMPLETED]: {
    Order_ID: string | number;
    Order_Type: 'Cart' | 'Non_Cart';
    Prescription_Required: boolean;
    Prescription_Added: boolean;
    Shipping_information: string; // (Home/Store address)
    Total_items_in_cart?: number; // Optional
    Grand_Total?: number; // Optional
    Total_Discount_percentage?: number; // Optional
    Discount_Amount?: number; // Optional
    Delivery_charge?: number; // Optional
    Net_after_discount?: number; // Optional
    Payment_status?: number; // Optional
    Payment_Type?: 'COD' | 'Prepaid'; // Optional
    Cart_ID?: string | number; // Optional
    Service_Area: 'Pharmacy' | 'Diagnostic';
  };
  [FirebaseEventName.DIAGNOSTIC_CHECKOUT_COMPLETED]: {
    Order_ID: string | number;
    Order_Type: 'Cart' | 'Non_Cart';
    Prescription_Required: boolean;
    Prescription_Added: boolean;
    Shipping_information: string; // (Home/Store address)
    Total_items_in_cart?: number; // Optional
    Grand_Total?: number; // Optional
    Total_Discount_percentage?: number; // Optional
    Discount_Amount?: number; // Optional
    Delivery_charge?: number; // Optional
    Net_after_discount?: number; // Optional
    Payment_status?: number; // Optionals
    Payment_Type?: 'COD' | 'Prepaid'; // Optional
    Cart_ID?: string | number; // Optional
    Service_Area: 'Pharmacy' | 'Diagnostic';
  };

  // ********** ConsultEvents ********** \\

  [FirebaseEventName.DOCTOR_SEARCH]: {
    'Search Text': string;
    'Patient Name': string;
    'Patient UHID': string;
    Relation: string;
    Age: number;
    Gender: string;
    'Mobile Number': string;
    'Customer ID': string;
  };
  [FirebaseEventName.SPECIALITY_CLICKED]: SpecialityClickedEvent;
  [FirebaseEventName.BOOK_APPOINTMENT]: {
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
  [FirebaseEventName.DOCTOR_CLICKED]: {
    'Doctor Name': string;
    Source: 'List' | 'Search';
  };
  [FirebaseEventName.CONSULT_NOW_CLICKED]: {
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
  [FirebaseEventName.CONSULT_SCHEDULE_FOR_LATER_CLICKED]: {
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
  [FirebaseEventName.CONSULT_SLOT_SELECTED]: {
    slot: string;
    doctorName: string;
    specialisation: string;
    experience: number;
    'language known': string; // Comma separated values
    hospital: string;
    consultType: 'clinic' | 'online';
  };
  [FirebaseEventName.CONSULT_COUPON_APPLIED]: {
    CouponCode: string;
    'Net Amount'?: number;
    'Discount Amount'?: number;
    'Coupon Applied': boolean;
  };
  [FirebaseEventName.PAY_BUTTON_CLICKED]: {
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
  [FirebaseEventName.CONSULTATION_BOOKED]: {
    Consult_ID: string;
    name: string;
    specialisation: string;
    category: string;
    time: Date | string;
    consultType: 'online' | 'clinic';
    clinic_name: string;
    clinic_address: string; // whole address
    Patient_Name: string;
    Patient_UHID: string;
    Relation: string;
    Age: number;
    Gender: string;
    Mobile_Number: number;
    Customer_ID: string;
  };
  [FirebaseEventName.RATING_GIVEN]: {
    'Patient UHID': string;
    Type: 'Consult' | 'Medicine' | 'Diagnostics';
    'Rating Value': string;
    'Rating Reason': string;
  };

  [FirebaseEventName.FEATURED_TEST_CLICKED]: {
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

  [FirebaseEventName.BROWSE_PACKAGE]: {
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

  [FirebaseEventName.CONSULT_RX]: {
    'Patient Name': string;
    'Patient UHID': string;
    Relation: string;
    Age: number;
    Gender: string;
    'Mobile Number': string;
    'Customer ID': string;
  };

  [FirebaseEventName.MEDICAL_RECORDS]: {
    'Patient Name': string;
    'Patient UHID': string;
    Relation: string;
    Age: number;
    Gender: string;
    'Mobile Number': string;
    'Customer ID': string;
  };

  [FirebaseEventName.ADD_RECORD]: {
    Source: 'Consult & RX' | 'Medical Records'; // List/Profile
  };

  [FirebaseEventName.UPLOAD_PRESCRIPTION]: {
    'Patient Name': string;
    'Patient UHID': string;
    Relation: string;
    Age: number;
    Gender: string;
    'Mobile Number': string;
    'Customer ID': string;
  };

  [FirebaseEventName.UPLOAD_PHOTO]: {
    Source: 'Take Photo' | 'Gallery'; // List/Profile
  };

  [FirebaseEventName.ITEMS_CLICKED]: {
    Source: 'Consult & RX' | 'Medical Records'; // List/Profile
    Type: 'Prescription' | 'Test Result';
  };

  [FirebaseEventName.REORDER_MEDICINES]: {
    'Patient Name': string;
    'Patient UHID': string;
    Relation: string;
    Age: number;
    Gender: string;
    'Mobile Number': string;
    'Customer ID': string;
  };

  [FirebaseEventName.IN_APP_PURCHASE]: {
    type: string;
  };
}
