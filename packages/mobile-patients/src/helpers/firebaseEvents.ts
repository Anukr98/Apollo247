import { DoctorType } from '@aph/mobile-patients/src/graphql/types/globalTypes';

type YesOrNo = { value: 'Yes' | 'No' };

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

export enum FirebaseEventName {
  MOBILE_ENTRY = 'LoginClicked',
  OTP_DEMANDED = 'OTPDemanded',
  LOGIN = 'login',
  OTP_ENTERED = 'OTPSubmitted',
  USER_LOGGED_IN = 'UserLoggedIn',
  PRE_APOLLO_CUSTOMER = 'Pre Apollo Customer',
  OTP_VERIFICATION_SUCCESS = 'OTP Verification Success',
  OTP_VALIDATION_FAILED = 'OTPValidationFailed',
  USER_LOGGED_OUT = 'UserLoggedOut',
  PROFILE_ACCESSED = 'ProfileAccessed',
  SIGN_UP = 'sign_up',
  NUMBER_OF_PROFILES_FETCHED = 'Number of Profiles fetched',
  SEARCH = 'Pharmacy Search',
  NOTIFY_ME = 'Notify Me',
  CATEGORY_CLICKED = 'PharmacyCategoryClicked',
  PHARMACY_ADD_TO_CART = 'PharmacyAddtoCart',
  DIAGNOSTIC_ADD_TO_CART = 'ItemAddedtoCart',
  PHARMACY_CART_VIEWED = 'PharmacyCartViewed',
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
  DOCTOR_SEARCH = 'DOCTOR_SEARCH',
  SPECIALITY_CLICKED = 'SPECIALITY_CLICKED',
  DOCTOR_CLICKED = 'DOCTOR_CLICKED',
  BOOK_APPOINTMENT = 'BOOK_APPOINTMENT',
  CONSULT_NOW_CLICKED = 'CONSULT_NOW_CLICKED',
  CONSULT_SCHEDULE_FOR_LATER_CLICKED = 'Consult Schedule for Later clicked',
  CONSULT_SLOT_SELECTED = 'Consult Slot Selected',
  CONSULT_COUPON_APPLIED = 'Coupon Applied',
  PAY_BUTTON_CLICKED = 'PAY_BUTTON_CLICKED',
  CONSULTATION_BOOKED = 'CONSULTATION_BOOKED',
  RATING_GIVEN = 'Rating Given',
  APP_OPENED = 'AppOpened',
  CATEGORY_PAGE_VIEWED = 'CategoryPageViewed',
  PRODUCT_PAGE_VIEWED = 'ItemViewed',
  ITEMS_REMOVED_FROM_CART = 'ItemsRemovedFromCart',
  PHARMACY_CART_ADDRESS_SELECTED_SUCCESS = 'AddressSelected',
  ORDER_FAILED = 'OrderFailed',

  // HomePageElements Events
  FIND_A_DOCTOR = 'FIND_A_DOCTOR',
  BUY_MEDICINES = 'BUY_MEDICINES',
  ORDER_TESTS = 'ORDER_TESTS',
  MANAGE_DIABETES = 'MANAGE_DIABETES',
  PROHEALTH = 'PROHEALTH',
  TRACK_SYMPTOMS = 'TRACK_SYMPTOMS',
  VIEW_HELATH_RECORDS = 'VIEW_HELATH_RECORDS',
  ACTIVE_APPOINTMENTS = 'Active Appointments',
  NEED_HELP = 'Need Help?',
  MY_ACCOUNT = 'MY_ACCOUNT',
  TABBAR_APPOINTMENTS_CLICKED = 'TABBAR_APPOINTMENTS_CLICKED',
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

  //In App Purchase Events
  IN_APP_PURCHASE = 'In_app_purchase',

  //DoctorSearchListing Events
  ONLINE_CONSULTS_CLICKED = 'ONLINE_CONSULTS_CLICKED',
  CLINIC_VISIT_CLICKED = 'CLINIC_VISIT_CLICKED',

  // Payments Events
  PAYMENT_INSTRUMENT = 'PaymentModeSelected',
  PAYMENT_STATUS = 'PAYMENT_STATUS',

  PURCHASE = 'purchase',

  //for address crash debugging
  ADDADDRESS_LAT_LNG = 'AddAddressLatLng',
}

export interface PatientInfo {
  PatientName: string;
  PatientUHID: string;
  Relation: string;
  PatientAge: number;
  PatientGender: string;
  MobileNumber: string;
  CustomerID: string;
}

export interface defaultinfo {
  PatientName: string;
  PatientUHID: string;
  Relation: string;
  MobileNumber: string;
}

export interface PatientInfoWithSource extends PatientInfo {
  Source: 'Home Screen' | 'Menu';
}

export interface PatientInfoFirebase {
  PatientName: string;
  PatientUHID: string;
  Relation: string;
  PatientAge: number;
  PatientGender: string;
  MobileNumber: string;
  CustomerID: string;
}

export interface PatientInfoWithSourceFirebase extends PatientInfoFirebase {
  Source: 'Home Screen' | 'Menu';
  Pincode?: String;
  Serviceability?: String;
}

export interface PatientInfoWithNeedHelp extends PatientInfo {
  Source: 'Home Screen' | 'Medicines' | 'Tests' | 'My Account' | 'Doctor Search';
}

export interface SpecialityClickedEvent extends PatientInfoFirebase {
  SpecialityName: string;
  SpecialityID: string;
}

export interface FirebaseEvents {
  // ********** AppEvents ********** \\

  [FirebaseEventName.MOBILE_ENTRY]: {};
  [FirebaseEventName.OTP_DEMANDED]: { mobilenumber: string };
  [FirebaseEventName.LOGIN]: { mobilenumber: string };
  [FirebaseEventName.OTP_ENTERED]: YesOrNo;
  [FirebaseEventName.PRE_APOLLO_CUSTOMER]: YesOrNo;
  [FirebaseEventName.OTP_VERIFICATION_SUCCESS]: {
    Mobile_Number: string;
  };
  [FirebaseEventName.USER_LOGGED_IN]: {
    Type: 'Registration' | 'Login';
    userId: string;
  };
  [FirebaseEventName.PROFILE_ACCESSED]: { Type: string };
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
  [FirebaseEventName.APP_OPENED]: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
    referrer?: string;
  };

  // ********** Home Screen Events ********** \\

  [FirebaseEventName.BUY_MEDICINES]: PatientInfoWithSource;
  [FirebaseEventName.ORDER_TESTS]: PatientInfoWithSource;
  [FirebaseEventName.MANAGE_DIABETES]: PatientInfoWithSource;
  [FirebaseEventName.TRACK_SYMPTOMS]: PatientInfoWithSource;
  [FirebaseEventName.VIEW_HELATH_RECORDS]: PatientInfoWithSource;
  [FirebaseEventName.FIND_A_DOCTOR]: PatientInfoWithSource;
  [FirebaseEventName.ACTIVE_APPOINTMENTS]: { clicked: true };
  [FirebaseEventName.NEED_HELP]: PatientInfoWithNeedHelp; // source values may change later
  [FirebaseEventName.MY_ACCOUNT]: PatientInfo;
  [FirebaseEventName.TABBAR_APPOINTMENTS_CLICKED]: PatientInfoWithSource;
  [FirebaseEventName.ONLINE_CONSULTS_CLICKED]: defaultinfo;
  [FirebaseEventName.CLINIC_VISIT_CLICKED]: defaultinfo;

  // ********** PharmacyEvents ********** \\

  [FirebaseEventName.SEARCH]: {
    keyword: string;
    Source: 'Pharmacy Home' | 'Pharmacy List';
  };
  [FirebaseEventName.NOTIFY_ME]: {
    productname: string;
    productid: string; // (SKUID)
    Brand: string;
    BrandID: string;
    categoryname: string;
    categoryID: string;
  };

  [FirebaseEventName.CATEGORY_CLICKED]: {
    categoryname: string;
    categoryID: string;
    Source: 'Home'; // Home
    SectionName: string;
  };
  [FirebaseEventName.PHARMACY_ADD_TO_CART]: {
    productname: string;
    productid: string; // (SKUID)
    Price: number;
    DiscountedPrice: number | undefined;
    Quantity: number;
    Source:
      | 'Pharmacy Home'
      | 'Pharmacy PDP'
      | 'Pharmacy List'
      | 'Pharmacy Partial Search'
      | 'Pharmacy Full Search'
      | 'Similar Widget'
      | 'Pharmacy Cart';
    Brand?: string;
    BrandID?: string;
    categoryname?: string;
    categoryID?: string;
    Section?: string;
    SectionName?: string;
    af_revenue: number;
    af_currency: string;
    'Circle Membership Added': 'Yes' | 'No' | 'Existing';
    'Circle Membership Value': number | null;
  };
  [FirebaseEventName.DIAGNOSTIC_ADD_TO_CART]: {
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
  [FirebaseEventName.CATEGORY_PAGE_VIEWED]: {
    source: 'home' | 'deeplink' | 'registration';
    CategoryId: string;
    CategoryName: string;
  };
  [FirebaseEventName.PHARMACY_CART_VIEWED]: {
    CustomerID: string;
    TotalItemsInCart: number;
    SubTotal: number;
    Deliverycharge: number;
    CouponCodeUsed?: string;
    TotalDiscount: number;
    NetAfterDiscount: number;
    PrescriptionNeeded: boolean;
    CartID?: string;
    CartItems: object[];
    ServiceArea: 'Pharmacy' | 'Diagnostic';
    'Circle Membership Added': 'Yes' | 'No' | 'Existing';
    'Circle Membership Value': number | null;
  };
  [FirebaseEventName.DIAGNOSTIC_CART_VIEWED]: {
    TotalItemsInCart: number;
    SubTotal: number;
    Deliverycharge: number;
    CouponCodeUsed?: string;
    TotalDiscount: number;
    NetAfterDiscount: number;
    'PrescriptionNeeded?': boolean;
    CartID?: string;
    CartItems: object[];
    ServiceArea: 'Pharmacy' | 'Diagnostic';
  };
  [FirebaseEventName.PHARMACY_PROCEED_TO_PAY_CLICKED]: {
    TotalItemsInCart: number;
    SubTotal: number;
    Deliverycharge: number;
    NetAfterDiscount: number;
    'PrescriptionNeeded?': boolean;
    CartID?: string; // we don't have cartId before placing order
    ModeOfDelivery: 'Home' | 'Pickup' | 'Home Visit' | 'Clinic Visit';
    DeliveryDateTime?: string; // Optional (only if Home)
    PinCode: string | number;
    ServiceArea: 'Pharmacy' | 'Diagnostic';
    'Circle Membership Added': 'Yes' | 'No' | 'Existing';
    'Circle Membership Value': number | null;
  };
  [FirebaseEventName.DIAGNOSTIC_PROCEED_TO_PAY_CLICKED]: {
    TotalItemsInCart: number;
    SubTotal: number;
    Deliverycharge: number;
    NetAfterDiscount: number;
    'PrescriptionNeeded?': boolean;
    CartID?: string; // we don't have cartId before placing order
    ModeOfSampleCollection: 'Home' | 'Pickup' | 'Home Visit' | 'Clinic Visit';
    DeliveryDateTime?: string; // Optional (only if Home)
    PinCode: string | number;
    ServiceArea: 'Pharmacy' | 'Diagnostic';
  };
  [FirebaseEventName.PHARMACY_PAYMENT_INITIATED]: {
    PaymentMode: 'Online' | 'COD';
    Amount: number;
    ServiceArea: 'Pharmacy' | 'Diagnostic';
  };
  [FirebaseEventName.DIAGNOSTIC_PAYMENT_INITIATED]: {
    PaymentMode: 'Online' | 'COD';
    Amount: number;
    ServiceArea: 'Pharmacy' | 'Diagnostic';
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
    'Circle Membership Added': 'Yes' | 'No' | 'Existing';
    'Circle Membership Value': number | null;
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
    'Circle discount': number;
    "Circle user": 'Yes' | 'No';
  };

  [FirebaseEventName.PRODUCT_PAGE_VIEWED]: {
    source?: ProductPageViewedSource | string;
    ProductId?: string;
    ProductName?: string;
    Stockavailability?: 'Yes' | 'No';
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

  [FirebaseEventName.ITEMS_REMOVED_FROM_CART]: {
    ProductID: string;
    CustomerID: string;
    ProductName: string;
    'No.ofItems': number;
  };

  [FirebaseEventName.PHARMACY_CART_ADDRESS_SELECTED_SUCCESS]: {
    TATDisplayed?: Date;
    DeliverySuccessful?: 'Yes' | 'No'; // Yes / No (If Error message shown because it is unservicable)
    DeliveryAddress?: string;
    Pincode?: string;
    DeliveryTAT?: number;
    LOB?: string;
    'Circle Membership Added': 'Yes' | 'No' | 'Existing';
    'Circle Membership Value': number | null;
  };

  [FirebaseEventName.ORDER_FAILED]: {
    OrderID?: string;
    Price: number;
    CouponCode?: string | undefined;
    CouponValue?: string | undefined;
    PaymentType: string;
    LOB: string;
    Appointment_Id?: string;
  };
  // ********** ConsultEvents ********** \\

  [FirebaseEventName.DOCTOR_SEARCH]: {
    SearchText: string;
    PatientName: string;
    PatientUHID: string;
    Relation: string;
    PatientAge: number;
    PatientGender: string;
    MobileNumber: string;
    CustomerID: string;
  };
  [FirebaseEventName.SPECIALITY_CLICKED]: SpecialityClickedEvent;
  [FirebaseEventName.BOOK_APPOINTMENT]: {
    DoctorName: string;
    DoctorCity: string;
    TypeOfDoctor: string;
    DoctorSpecialty: string;
    PatientName: string;
    PatientUHID: string;
    Relation: string;
    Age: number;
    Gender: string;
    MobileNumber: string;
    CustomerID: string;
  };
  [FirebaseEventName.DOCTOR_CLICKED]: {
    DoctorName: string;
    Source: 'List' | 'Search';
    DoctorID: string;
    SpecialityID: string;
    DoctorCategory: DoctorType;
    Fee: number;
    DoctorSpeciality: string;
  };
  [FirebaseEventName.CONSULT_NOW_CLICKED]: {
    name: string;
    specialisation: string;
    experience: number;
    LanguageKnown: string; // Comma separated values
    Hospital: string;
    AvailableIn: string;
    Source: 'List' | 'Profile'; // List/Profile
    PatientName: string;
    PatientUHID: string;
    Relation: string;
    Age: number;
    Gender: string;
    MobileNumber: number;
    CustomerID: string;
    slot: string;
  };
  // confirm the type of data for the below
  [FirebaseEventName.CONSULT_SCHEDULE_FOR_LATER_CLICKED]: {
    name: string;
    specialisation: string;
    experience: number;
    LanguageKnown: string; // Comma separated values
    Hospital: string;
    Source: 'List' | 'Profile'; // List/Profile
    PatientName: string;
    PatientUHID: string;
    Relation: string;
    Age: number;
    Gender: string;
    MobileNumber: number;
    CustomerID: string;
    slot: string;
  };
  [FirebaseEventName.CONSULT_SLOT_SELECTED]: {
    slot: string;
    doctorName: string;
    specialisation: string;
    experience: number;
    LanguageKnown: string; // Comma separated values
    hospital: string;
    consultType: 'clinic' | 'online';
  };
  [FirebaseEventName.CONSULT_COUPON_APPLIED]: {
    CouponCode: string;
    NetAmount?: number;
    DiscountAmount?: number;
    CouponApplied: boolean;
  };
  [FirebaseEventName.PAY_BUTTON_CLICKED]: {
    Amount: number;
    DoctorName: string;
    DoctorCity: string;
    TypeOfDoctor: string;
    DoctorSpecialty: string;
    AppointmentDate: string;
    AppointmentTime: string;
    ActualPrice: number;
    'Discountused ?': boolean;
    Discountcoupon?: string;
    DiscountAmount: number;
    NetAmount: number;
    CustomerID: string;
    PatientName: string;
    PatientAge: number;
    PatientGender: string;
    PatientUHID: string;
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
    af_revenue: number;
    af_currency: string;
    'Circle discount': number;
  };
  [FirebaseEventName.RATING_GIVEN]: {
    PatientUHID: string;
    Type: 'Consult' | 'Medicine' | 'Diagnostics';
    RatingValue: string;
    RatingReason: string;
  };

  [FirebaseEventName.FEATURED_TEST_CLICKED]: {
    ProductName: string;
    ProductIdSKUID: string;
    Source: 'Home' | 'List';
    PatientName: string;
    PatientUHID: string;
    Relation: string;
    Age: number;
    Gender: string;
    MobileNumber: string;
    CustomerID: string;
  };

  [FirebaseEventName.DIAGNOSTIC_ITEM_VIEWED]: {
    PatientUHID: string;
    PatientName: string;
    Source: 'Search Page' | 'Landing Page' | 'Cart page';
    ItemName: string;
    ItemType: string;
    ItemCode: string;
    ItemPrice: number;
    LOB: string;
  };

  [FirebaseEventName.BROWSE_PACKAGE]: {
    PackageName: string;
    // Category: string; we don't have category for test
    Source: 'Home' | 'List';
    PatientName: string;
    PatientUHID: string;
    Relation: string;
    Age: number;
    Gender: string;
    MobileNumber: string;
    CustomerID: string;
  };

  // ********** Health Records ********** \\

  [FirebaseEventName.CONSULT_RX]: {
    PatientName: string;
    PatientUHID: string;
    Relation: string;
    Age: number;
    Gender: string;
    MobileNumber: string;
    CustomerID: string;
  };

  [FirebaseEventName.MEDICAL_RECORDS]: {
    PatientName: string;
    PatientUHID: string;
    Relation: string;
    Age: number;
    Gender: string;
    MobileNumber: string;
    CustomerID: string;
  };

  [FirebaseEventName.ADD_RECORD]: {
    Source: 'Consult & RX' | 'Medical Records'; // List/Profile
  };

  [FirebaseEventName.UPLOAD_PRESCRIPTION]: {
    PatientName: string;
    PatientUHID: string;
    Relation: string;
    Age: number;
    Gender: string;
    MobileNumber: string;
    CustomerID: string;
  };

  [FirebaseEventName.UPLOAD_PHOTO]: {
    Source: 'Take Photo' | 'Gallery'; // List/Profile
  };

  [FirebaseEventName.ITEMS_CLICKED]: {
    Source: 'Consult & RX' | 'Medical Records'; // List/Profile
    Type: 'Prescription' | 'Test Result';
  };

  [FirebaseEventName.REORDER_MEDICINES]: {
    PatientName: string;
    PatientUHID: string;
    Relation: string;
    Age: number;
    Gender: string;
    MobileNumber: string;
    CustomerID: string;
  };

  [FirebaseEventName.IN_APP_PURCHASE]: {
    type: string;
  };

  [FirebaseEventName.PURCHASE]: {
    coupon?: string;
    currency: string;
    items: any;
    transaction_id: string;
    value: number;
    LOB: string;
  };

  [FirebaseEventName.ADDADDRESS_LAT_LNG]: {
    latitude: number;
    longitude: number;
  };

  [FirebaseEventName.PAYMENT_STATUS]: {
    status: string;
    LOB: string;
    paymentOrderId: number;
  };
}
