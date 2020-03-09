type YesOrNo = { value: 'Yes' | 'No' };

export interface WebEngageEvents {
  // ********** AppEvents ********** \\

  'Mobile Number Entered': { mobilenumber: string };
  'OTP Entered': YesOrNo;
  'Pre Apollo Customer': YesOrNo;
  'Registration Done': {
    'Customer ID': string;
    'Customer First Name': string;
    'Customer Last Name': string;
    'Date of Birth': string;
    Gender: string;
    Email: string;
    'Referral Code'?: string;
  };
  'Number of Profiles fetched': { count: number };

  // ********** PharmacyEvents ********** \\

  Search: { keyword: string };
  'Product Clicked': {
    'product name': string;
    'product id': string; // (SKUID)
    Brand: string;
    'Brand ID': string;
    'category name': string;
    'category ID': string;
    Source: 'Home' | 'List';
    'Section Name': string;
  };
  'Category Clicked': {
    'category name': string;
    'category ID': string;
    Source: 'Home'; // Home
    'Section Name': string;
  };
  'Add to cart': {
    'product name': string;
    'product id': string; // (SKUID)
    Brand: string;
    'Brand ID': string;
    'category name': string;
    'category ID': string;
    Price: number;
    'Discounted Price': number;
    Quantity: number;
  };
  'Buy Now': {
    'product name': string;
    'product id': string; // (SKUID)
    Brand: string;
    'Brand ID': string;
    'category name': string;
    'category ID': string;
    Price: number;
    'Discounted Price': number;
    Quantity: number;
  };
  'Cart Viewed': {
    'Total items in cart': number;
    'Sub Total': number;
    'Delivery charge': number;
    'Coupon code used': string;
    'Total Discount': number;
    'Net after discount': number;
    'Prescription Needed?': boolean;
    'Cart ID'?: string;
    'Cart Items': object[];
  };
  'Procced To Pay Clicked': {
    'Total items in cart': number;
    'Sub Total': number;
    'Delivery charge': number;
    'Net after discount': number;
    'Prescription Needed?': boolean;
    'Cart ID'?: string;
    'Mode of Delivery': 'Home' | 'Pickup';
    'Delivery Date Time'?: string; // Optional (only if Home)
    'Pin Code': string | number;
  };
  'Payment Initiated': {
    'Payment mode': 'Online' | 'COD';
    Amount: number;
  };
  'Upload Prescription Clicked': {
    Source: 'Home' | 'Cart';
  };
  'Submit Prescription': {
    'Order ID': string | number;
    'Delivery type': 'home' | 'store pickup';
    'Store id'?: number; //(incase of store delivery)
    'Delivery address'?: string;
    Pincode: string | number;
  };
  'Checkout completed': {
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
    'Cart ID'?: string | number; // Optional
  };

  // ********** ConsultEvents ********** \\

  'Start Consultation Search': {
    'Find a Doctor': string;
    'Track Symptoms': string;
    'Patient Name': string;
    'Patient UHID': string;
    Relation: string;
    Age: number;
    Gender: string;
    'Mobile Number': string;
    'Customer ID': string;
  };
  'Doctor profile viewed for consultation': {
    name: string;
    specialisation: string;
    experience: number;
    'language known': string; //Comma separated values
    Hospital: string;
    'Available in': string;
  };
  'Consult Now clicked': {
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
  'Schedule for Later clicked': {
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
  'Slot Selected': {
    slot: string;
    doctorName: string;
    specialisation: string;
    experience: number;
    'language known': string; // Comma separated values
    hospital: string;
    consultType: 'clinic' | 'online';
  };
  'Coupon Applied': {
    CouponCode: string;
    Discount: number;
    RevisedAmount: number;
  };
  'Pay Button Clicked': {
    Amount: number;
    'Consultation ID': string;
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
    'Patient ID': string;
    'Patient Name': string;
    'Patient Age': number;
    'Patient Gender': string;
    'Patient UHID': string;
  };
  'Consultation booked': {
    name: string;
    specialisation: string;
    category: string;
    time: Date | string;
    type: 'online' | 'clinic';
    'clinic name': string;
    'clinic address': string;
    'Patient Name': string;
    'Patient UHID': string;
    Relation: string;
    Age: number;
    Gender: string;
    'Mobile Number': number;
    'Customer ID': string;
  };
}
