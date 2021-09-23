import { PharmaUserStatus } from '@aph/mobile-patients/src/components/AppCommonDataProvider';

type YesOrNo = { value: 'Yes' | 'No' };

export type CircleNavigationSource =
  | 'Circle Popup Plan only'
  | 'Landing Home Page banners'
  | 'Medicine Home page banners'
  | 'Medicine Homepage Sticky'
  | 'Diagnostic Home page Banner'
  | 'VC Doctor Profile'
  | 'Cart(Pharma)'
  | 'Cart(VC)'
  | 'Membership Details'
  | 'Landing Home Page'
  | 'My Account-My membership section'
  | 'Corporate Membership Page'
  | 'Circle Membership page'
  | 'VC Doctor Card'
  | 'Diagnostic Review page'

export type CIRCLE_EVENT_DATA = {
  userId: string;
  navigation_source: string | CircleNavigationSource;
  price: number;
  duration_in_month: number;
  circle_plan_id: string;
  corporate_name?: string;
  source_identifier?: string;
  circle_start_date?: Date | string;
  circle_end_date?: Date | string;
  af_currency: string;
  af_revenue: number;
  special_price_enabled?: 'Yes' | 'No';
};

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

export enum AppsFlyerEventName {
  MOBILE_ENTRY = 'LoginClicked',
  OTP_DEMANDED = 'OTPDemanded',
  MOBILE_NUMBER_ENTERED = 'Mobile Number Entered',
  OTP_ENTERED = 'OTPSubmitted',
  OTP_VERIFICATION_SUCCESS = 'OTP Verification Success',
  OTP_VALIDATION_FAILED = 'OTPValidationFailed',
  USER_LOGGED_IN = 'UserLoggedIn',
  PRE_APOLLO_CUSTOMER = 'Pre Apollo Customer',
  REGISTRATION_DONE = 'Registration Done',
  USER_LOGGED_OUT = 'UserLoggedOut',
  PROFILE_ACCESSED = 'ProfileAccessed',
  NUMBER_OF_PROFILES_FETCHED = 'Number of Profiles fetched',
  SEARCH = 'Pharmacy Search',
  CATEGORY_CLICKED = 'Pharmacy Category Clicked',
  PHARMACY_ADD_TO_CART = 'Pharmacy Add to cart',
  DIAGNOSTIC_ADD_TO_CART = 'ItemAddedtoCart',
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
  BOOK_APPOINTMENT = 'Book Appointment',
  CONSULT_NOW_CLICKED = 'Consult Now clicked',
  CONSULT_SCHEDULE_FOR_LATER_CLICKED = 'Consult Schedule for Later clicked',
  CONSULT_SLOT_SELECTED = 'Consult Slot Selected',
  CONSULT_COUPON_APPLIED = 'Coupon Applied',
  PAY_BUTTON_CLICKED = 'Pay Button Clicked',
  CONSULTATION_BOOKED = 'Consultation booked',
  CATEGORY_PAGE_VIEWED = 'CategoryPageViewed',
  PRODUCT_PAGE_VIEWED = 'ItemViewed',
  ITEMS_REMOVED_FROM_CART = 'Items removed from cart',
  PHARMACY_CART_ADDRESS_SELECTED_SUCCESS = 'AddressSelected',
  ORDER_FAILED = 'OrderFailed',
  // HomePageElements Events
  BUY_MEDICINES = 'Buy Medicines',
  ORDER_TESTS = 'Order Tests',
  MANAGE_DIABETES = 'Manage Diabetes',
  TRACK_SYMPTOMS = 'Track Symptoms',
  VIEW_HELATH_RECORDS = 'View Helath Records',
  ACTIVE_APPOINTMENTS = 'Active Appointments',
  NEED_HELP = 'Need Help?',
  MY_ACCOUNT = 'My Account',
  FIND_A_DOCTOR = 'Find a Doctor',

  // Diagnostics Events
  FEATURED_TEST_CLICKED = 'Featured Test Clicked',
  BROWSE_PACKAGE = 'Browse Package',
  DIAGNOSTIC_ITEM_VIEWED = 'DiagnosticItemViewed',
  DIAGNOSTIC_CART_ADDRESS_SELECTED_SUCCESS = 'AddressSelected',

  // Health Records
  CONSULT_RX = 'Consult & RX',
  MEDICAL_RECORDS = 'Medical Records',
  ADD_RECORD = 'Add Record',
  UPLOAD_PRESCRIPTION = 'Upload Prescription',
  UPLOAD_PHOTO = 'Upload Photo',
  ITEMS_CLICKED = 'Items Clicked',
  REORDER_MEDICINES = 'Reorder Medicines',

  // Payments Events
  PAYMENT_INSTRUMENT = 'PaymentModeSelected',
  PAYMENT_STATUS = 'Payment Status',

  PURCHASE = 'purchase',

  // Circle Events
  CIRCLE_ADD_TO_CART = 'Circle Plan Add to Cart',
  CIRCLE_REMOVE_FROM_CART = 'Circle Plan Remove from Cart',
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

export interface PatientInfoWithNeedHelp extends PatientInfo {
  Source: 'Home Screen' | 'Medicines' | 'Tests' | 'My Account' | 'Doctor Search';
}

export interface SpecialityClickedEvent extends PatientInfo {
  'Speciality Name': string;
}

export interface AppsFlyerEvents {
  // ********** AppEvents ********** \\

  [AppsFlyerEventName.OTP_DEMANDED]: { mobilenumber: string };
  [AppsFlyerEventName.MOBILE_NUMBER_ENTERED]: { mobilenumber: string };
  [AppsFlyerEventName.OTP_ENTERED]: YesOrNo;
  [AppsFlyerEventName.PRE_APOLLO_CUSTOMER]: YesOrNo;
  [AppsFlyerEventName.REGISTRATION_DONE]: {
    'customer id': string;
    'referral code'?: string;
  };
  [AppsFlyerEventName.NUMBER_OF_PROFILES_FETCHED]: { count: number };
  [AppsFlyerEventName.OTP_VERIFICATION_SUCCESS]: {
    'customer id': string;
  };
  [AppsFlyerEventName.USER_LOGGED_IN]: {
    Type: 'Registration' | 'Login';
    userId: string;
  };
  [AppsFlyerEventName.PROFILE_ACCESSED]: { Type: string };

  // ********** Home Screen Events ********** \\

  [AppsFlyerEventName.BUY_MEDICINES]: {
    'Patient Name': string;
    'Patient UHID': string;
    Relation: string;
    'Patient Age': number;
    'Patient Gender': string;
    'Mobile Number': string;
    'Customer ID': string;
    Source: 'Home Screen' | 'Menu';
    'Circle Membership Added': 'Yes' | 'No' | 'Existing';
    'Circle Membership Value': number | null;
  };
  [AppsFlyerEventName.ORDER_TESTS]: PatientInfoWithSource;
  [AppsFlyerEventName.MANAGE_DIABETES]: PatientInfo;
  [AppsFlyerEventName.TRACK_SYMPTOMS]: PatientInfo;
  [AppsFlyerEventName.VIEW_HELATH_RECORDS]: PatientInfoWithSource;
  [AppsFlyerEventName.ACTIVE_APPOINTMENTS]: { clicked: true };
  [AppsFlyerEventName.NEED_HELP]: PatientInfoWithNeedHelp; // source values may change later
  [AppsFlyerEventName.MY_ACCOUNT]: PatientInfo;
  [AppsFlyerEventName.FIND_A_DOCTOR]: PatientInfo;

  // ********** PharmacyEvents ********** \\

  [AppsFlyerEventName.SEARCH]: {
    keyword: string;
    Source: 'Pharmacy Home' | 'Pharmacy List';
  };
  [AppsFlyerEventName.CATEGORY_CLICKED]: {
    'category name': string;
    'category ID': string;
    Source: 'Home'; // Home
    'Section Name': string;
    imageUrl: string;
  };
  [AppsFlyerEventName.PHARMACY_ADD_TO_CART]: {
    'customer id': string;
    af_revenue: number;
    af_currency: string;
    item_type: string;
    brand?: string;
    sku: string;
    'Circle Membership Added': 'Yes' | 'No' | 'Existing';
    'Circle Membership Value': number | null;
  };
  [AppsFlyerEventName.DIAGNOSTIC_ADD_TO_CART]: {
    productname: string;
    productid: string; // (SKUID)
    Price: number;
    DiscountedPrice: number;
    Quantity: number;
    Source: 'Pharmacy Home' | 'Pharmacy PDP' | 'Pharmacy List' | 'Diagnostic';
    Brand?: string;
    BrandID?: string;
    categoryname?: string;
    categoryID?: string;
  };
  [AppsFlyerEventName.PHARMACY_CART_VIEWED]: {
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
  };
  [AppsFlyerEventName.CATEGORY_PAGE_VIEWED]: {
    source: 'home' | 'deeplink' | 'registration';
    CategoryId: string;
    CategoryName: string;
  };
  [AppsFlyerEventName.DIAGNOSTIC_CART_VIEWED]: {
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
  [AppsFlyerEventName.PHARMACY_PROCEED_TO_PAY_CLICKED]: {
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
    'Circle Membership Added': 'Yes' | 'No' | 'Existing';
    'Circle Membership Value': number | null;
  };
  [AppsFlyerEventName.DIAGNOSTIC_PROCEED_TO_PAY_CLICKED]: {
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
  [AppsFlyerEventName.PHARMACY_PAYMENT_INITIATED]: {
    'Payment mode': 'Online' | 'COD';
    Amount: number;
    'Service Area': 'Pharmacy' | 'Diagnostic';
  };
  [AppsFlyerEventName.DIAGNOSTIC_PAYMENT_INITIATED]: {
    'Payment mode': 'Online' | 'COD';
    Amount: number;
    'Service Area': 'Pharmacy' | 'Diagnostic';
  };
  [AppsFlyerEventName.UPLOAD_PRESCRIPTION_CLICKED]: {
    Source: 'Home' | 'Cart';
  };
  [AppsFlyerEventName.UPLOAD_PRESCRIPTION_IMAGE_UPLOADED]: {
    Source: 'Take a Photo' | 'Choose Gallery' | 'E-Rx';
  };
  [AppsFlyerEventName.PHARMACY_SUBMIT_PRESCRIPTION]: {
    'Order ID': string | number;
    'Delivery type': 'home' | 'store pickup';
    StoreId?: string; //(incase of store delivery)
    'Delivery address'?: string;
    Pincode: string | number;
  };
  [AppsFlyerEventName.PHARMACY_CHECKOUT_COMPLETED]: {
    'customer id'?: string;
    'cart size': number;
    af_revenue: number;
    af_currency: string;
    'order id': string;
    orderAutoId?: string;
    'coupon applied': boolean;
    'Circle Membership Added': 'Yes' | 'No' | 'Existing';
    'Circle Membership Value': number | null;
    'Circle Cashback amount': number;
    User_Type?: PharmaUserStatus;
    TransactionId?: string | number;
  };
  [AppsFlyerEventName.DIAGNOSTIC_CHECKOUT_COMPLETED]: {
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
    'Circle discount': number;
    'Circle user': 'Yes' | 'No';
  };
  [AppsFlyerEventName.PRODUCT_PAGE_VIEWED]: {
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
    PatientName?: string;
    PatientUHID?: string;
    ItemName?: string;
    ItemType?: string;
    ItemCode?: string;
    ItemPrice?: number;
    LOB?: string;
    'Circle Membership Added': 'Yes' | 'No' | 'Existing';
    'Circle Membership Value': number | null;
  };

  [AppsFlyerEventName.ITEMS_REMOVED_FROM_CART]: {
    'Product ID': string;
    'Customer ID': string;
    'Product Name': string;
    'No. of items': number;
  };

  [AppsFlyerEventName.PHARMACY_CART_ADDRESS_SELECTED_SUCCESS]: {
    TATDisplayed?: Date;
    DeliverySuccessful?: YesOrNo; // Yes / No (If Error message shown because it is unservicable)
    DeliveryAddress?: string;
    Pincode?: string;
    DeliveryTAT?: number;
    LOB?: string;
    'Circle Membership Added': 'Yes' | 'No' | 'Existing';
    'Circle Membership Value': number | null;
  };

  [AppsFlyerEventName.ORDER_FAILED]: {
    OrderID?: string;
    Price: number;
    CouponCode?: string | undefined;
    CouponValue?: string | undefined;
    PaymentType: string;
    LOB: string;
    Appointment_Id?: string;
  };
  // ********** ConsultEvents ********** \\

  [AppsFlyerEventName.DOCTOR_SEARCH]: {
    'Search Text': string;
    'Patient Name': string;
    'Patient UHID': string;
    Relation: string;
    'Patient Age': number;
    'Patient Gender': string;
    'Mobile Number': string;
    'Customer ID': string;
  };
  [AppsFlyerEventName.SPECIALITY_CLICKED]: SpecialityClickedEvent;
  [AppsFlyerEventName.BOOK_APPOINTMENT]: {
    'customer id': string;
  };
  [AppsFlyerEventName.DOCTOR_CLICKED]: {
    'customer id': string;
    'doctor id': string;
    'specialty id': string;
  };
  [AppsFlyerEventName.CONSULT_NOW_CLICKED]: {
    'customer id': string;
    'doctor id': string;
    'specialty id': string;
  };
  // confirm the type of data for the below
  [AppsFlyerEventName.CONSULT_SCHEDULE_FOR_LATER_CLICKED]: {
    name: string;
    specialisation: string;
    experience: number;
    'language known': string; // Comma separated values
    Hospital: string;
    Source: 'List' | 'Profile'; // List/Profile
    'Patient Name': string;
    'Patient UHID': string;
    Relation: string;
    'Patient Age': number;
    'Patient Gender': string;
    'Mobile Number': number;
    'Customer ID': string;
    slot: string;
  };
  [AppsFlyerEventName.CONSULT_SLOT_SELECTED]: {
    slot: string;
    doctorName: string;
    specialisation: string;
    experience: number;
    'language known': string; // Comma separated values
    hospital: string;
    consultType: 'clinic' | 'online';
  };
  [AppsFlyerEventName.CONSULT_COUPON_APPLIED]: {
    CouponCode: string;
    'Net Amount'?: number;
    'Discount Amount'?: number;
    'Coupon Applied': boolean;
  };
  [AppsFlyerEventName.PAY_BUTTON_CLICKED]: {
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
  [AppsFlyerEventName.CONSULTATION_BOOKED]: {
    'customer id': string;
    'doctor id': string;
    'specialty id': string;
    'consult type': 'online' | 'clinic';
    af_revenue: number;
    af_currency: string;
    'consult id': string;
    displayId: string;
    'coupon applied': boolean;
    'Circle discount': number;
    User_Type: string;
  };

  [AppsFlyerEventName.FEATURED_TEST_CLICKED]: {
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

  [AppsFlyerEventName.DIAGNOSTIC_ITEM_VIEWED]: {
    PatientUHID: string;
    PatientName: string;
    Source: 'Search Page' | 'Landing Page' | 'Cart page';
    ItemName: string;
    ItemType: string;
    ItemCode: string;
    ItemPrice: number;
    LOB: string;
  };

  [AppsFlyerEventName.BROWSE_PACKAGE]: {
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

  [AppsFlyerEventName.CONSULT_RX]: {
    'Patient Name': string;
    'Patient UHID': string;
    Relation: string;
    'Patient Age': number;
    'Patient Gender': string;
    'Mobile Number': string;
    'Customer ID': string;
  };

  [AppsFlyerEventName.MEDICAL_RECORDS]: {
    'Patient Name': string;
    'Patient UHID': string;
    Relation: string;
    'Patient Age': number;
    'Patient Gender': string;
    'Mobile Number': string;
    'Customer ID': string;
  };

  [AppsFlyerEventName.ADD_RECORD]: {
    Source: 'Consult & RX' | 'Medical Records'; // List/Profile
  };

  [AppsFlyerEventName.UPLOAD_PRESCRIPTION]: {
    'Patient Name': string;
    'Patient UHID': string;
    Relation: string;
    'Patient Age': number;
    'Patient Gender': string;
    'Mobile Number': string;
    'Customer ID': string;
  };

  [AppsFlyerEventName.UPLOAD_PHOTO]: {
    Source: 'Take Photo' | 'Gallery'; // List/Profile
  };

  [AppsFlyerEventName.ITEMS_CLICKED]: {
    Source: 'Consult & RX' | 'Medical Records'; // List/Profile
    Type: 'Prescription' | 'Test Result';
  };

  [AppsFlyerEventName.REORDER_MEDICINES]: {
    'Patient Name': string;
    'Patient UHID': string;
    Relation: string;
    'Patient Age': number;
    'Patient Gender': string;
    'Mobile Number': string;
    'Customer ID': string;
  };

  [AppsFlyerEventName.PURCHASE]: {
    coupon?: string;
    currency: string;
    items: any;
    transaction_id: string;
    af_revenue: number;
    af_currency: string;
  };

  // circle events
  [AppsFlyerEventName.CIRCLE_ADD_TO_CART]: CIRCLE_EVENT_DATA;
  [AppsFlyerEventName.CIRCLE_REMOVE_FROM_CART]: CIRCLE_EVENT_DATA;

  [AppsFlyerEventName.PAYMENT_STATUS]: {
    status: string;
    LOB: string;
    paymentOrderId: number;
  };
}
