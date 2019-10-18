const PharmaApiConfig = {
  dev: {
    MED_SEARCH: ['https://www.apollopharmacy.in', 'Bearer 2o1kd4bjapqifpb27fy7tnbivu8bqo1d'],
    MED_DETAIL: ['https://uat.apollopharmacy.in', 'Bearer 2o1kd4bjapqifpb27fy7tnbivu8bqo1d'],
    MED_SEARCH_SUGGESTION: [
      'https://uat.apollopharmacy.in',
      'Bearer 2o1kd4bjapqifpb27fy7tnbivu8bqo1d',
    ],
    STORES_LIST: ['https://www.apollopharmacy.in', 'Bearer 2o1kd4bjapqifpb27fy7tnbivu8bqo1d'],
    PIN_SERVICEABILITY: [
      'https://www.apollopharmacy.in',
      'Bearer 2o1kd4bjapqifpb27fy7tnbivu8bqo1d',
    ],
    INVENTORY_CHECK: [
      'https://online.apollopharmacy.org/APOLLO247/Orderplace.svc',
      'cTfznn4yhybBR7WSrNJn1g==',
    ],
    SHOP_BY_CITY: ['https://uat.apollopharmacy.in'],
  },
  prod: {
    MED_SEARCH: ['https://www.apollopharmacy.in', 'Bearer 2o1kd4bjapqifpb27fy7tnbivu8bqo1d'],
    MED_DETAIL: ['https://www.apollopharmacy.in', 'Bearer 2o1kd4bjapqifpb27fy7tnbivu8bqo1d'],
    MED_SEARCH_SUGGESTION: [
      'https://www.apollopharmacy.in',
      'Bearer 2o1kd4bjapqifpb27fy7tnbivu8bqo1d',
    ],
    STORES_LIST: ['https://www.apollopharmacy.in', 'Bearer 2o1kd4bjapqifpb27fy7tnbivu8bqo1d'],
    PIN_SERVICEABILITY: [
      'https://www.apollopharmacy.in',
      'Bearer 2o1kd4bjapqifpb27fy7tnbivu8bqo1d',
    ],
    INVENTORY_CHECK: [
      'https://online.apollopharmacy.org/APOLLO247/Orderplace.svc',
      'cTfznn4yhybBR7WSrNJn1g==',
    ],
    SHOP_BY_CITY: ['https://www.apollopharmacy.in'],
  },
};

//Development;
// const Configuration = {
//   LOG_ENVIRONMENT: 'debug',
//   MEDICINE_PAST_SEARCHES_SHOW_COUNT: 5,
//   PAYMENT_GATEWAY_BASE_URL: 'https://aph.dev.pmt.popcornapps.com',
//   PAYMENT_GATEWAY_SUCCESS_PATH: '/mob?',
//   PAYMENT_GATEWAY_ERROR_PATH: '/mob-error?',
//   MIN_CART_VALUE_FOR_FREE_DELIVERY: 199,
//   DELIVERY_CHARGES: 25,
//   PRAKTISE_API_KEY: '4A8C9CCC-C5A3-11E9-9A19-8C85900A8328',
//   PRO_TOKBOX_KEY: '46429002',
//   PRO_PUBNUB_PUBLISH: 'pub-c-d32f262d-c014-471d-95fe-b45903651cfd',
//   PRO_PUBNUB_SUBSCRIBER: 'sub-c-015f75e4-daca-11e9-85e7-eae1db32c94a',
//   // PRO_PUBNUB_PUBLISH: 'pub-c-e3541ce5-f695-4fbd-bca5-a3a9d0f284d3',
//   // PRO_PUBNUB_SUBSCRIBER: 'sub-c-58d0cebc-8f49-11e9-8da6-aad0a85e15ac',
//   DOCUMENT_BASE_URL: 'https://apolloaphstorage.blob.core.windows.net/popaphstorage/popaphstorage/',
//   ...PharmaApiConfig.dev,
// };

// QA
const Configuration = {
  LOG_ENVIRONMENT: 'release',
  MEDICINE_PAST_SEARCHES_SHOW_COUNT: 5,
  PAYMENT_GATEWAY_BASE_URL: 'https://pmt.apollo247.com',
  PAYMENT_GATEWAY_SUCCESS_PATH: '/mob?',
  PAYMENT_GATEWAY_ERROR_PATH: '/mob-error?',
  MIN_CART_VALUE_FOR_FREE_DELIVERY: 199,
  DELIVERY_CHARGES: 25,
  PRAKTISE_API_KEY: '4A8C9CCC-C5A3-11E9-9A19-8C85900A8328',
  PRO_TOKBOX_KEY: '46429002',
  PRO_PUBNUB_PUBLISH: 'pub-c-d32f262d-c014-471d-95fe-b45903651cfd',
  PRO_PUBNUB_SUBSCRIBER: 'sub-c-015f75e4-daca-11e9-85e7-eae1db32c94a',
  DOCUMENT_BASE_URL: 'https://apolloaphstorage.blob.core.windows.net/popaphstorage/popaphstorage/',
  ...PharmaApiConfig.prod,
};

//Production
// const Configuration = {
//   LOG_ENVIRONMENT: 'release',
//   MEDICINE_PAST_SEARCHES_SHOW_COUNT: 5,
//   PAYMENT_GATEWAY_BASE_URL: 'https://pmt.apollo247.com', //PRODUCTION
//   PAYMENT_GATEWAY_SUCCESS_PATH: '/mob?',
//   PAYMENT_GATEWAY_ERROR_PATH: '/mob-error?',
//   MIN_CART_VALUE_FOR_FREE_DELIVERY: 199,
//   DELIVERY_CHARGES: 25,
//   PRAKTISE_API_KEY: 'C2B3FAEE-C576-11E9-AEF4-8C85900A8328', // PRODUCTION
//   PRO_TOKBOX_KEY: '46422952', // PRODUCTION
//   PRO_PUBNUB_PUBLISH: 'pub-c-e275fde3-09e1-44dd-bc32-5c3d04c3b2ef', // PRODUCTION
//   PRO_PUBNUB_SUBSCRIBER: 'sub-c-517dafbc-d955-11e9-aa3a-6edd521294c5', // PRODUCTION
//   DOCUMENT_BASE_URL: 'https://prodaphstorage.blob.core.windows.net/prodaphstorage/prodaphstorage/', //Production
//   ...PharmaApiConfig.prod,
// };

export const NeedHelp = [
  {
    category: 'Virtual Consult',
    options: [
      'Delay in consult',
      'No updates on delays, reschedules or cancellations of the consult',
      'Payment issues',
      'Delayed Prescription',
      'Behavior and Attitude of the doctor',
      'Application issues (bandwidth & payment errors)',
      'Doctor not available',
      'No past / Upcoming consultation details',
      'How to consult virtually – demo video',
    ],
  },
  {
    category: 'Pharmacy',
    options: [
      'Payment Issues in online pharmacy payments',
      'Area pharmacy store not found on app',
      'Difference in quantity of medicine delivered',
      'Excess amount charged on delivery Delay in Pharmacy Order',
      'Medicines not delivered',
      'Incorrect medicines',
      'Issues in Order confirmations',
      'Orders cancelled without any information',
      'Order Cancelled, No Refund',
      'Inappropriate Attitude and Behavior of Pharmacy staff',
      'Updates in Order delivery or status of the order',
      'Software - Not User Friendly',
    ],
  },
  {
    category: 'Physical Consult',
    options: [
      'Long Waiting time for Physical consult',
      'No updates on delays, reschedules or cancellations of the consult',
      'Payment issues',
      'Delayed Prescription',
      'Behavior and Attitude of the doctor',
      'Application issues(bandwidth & payment errors)',
      'Doctor not available',
      'App appointment dishonored at confirmed time slot',
      'No past / Upcoming consultation details',
      "Can't find Doctor’s name in respective list",
    ],
  },
  {
    category: 'Health Records',
    options: [
      'Incomplete health records',
      'Delay in responses to Queries',
      'Personal details are not editable',
      'Unable to see my reports',
      'No / Wrong UHID',
      'Add multiple UHID’s linked to other mobile numbers',
      'No records available for linked UHID',
      'Issues in downloading the records',
    ],
  },
  {
    category: 'Feedback',
    options: [
      'Feedback on Consultation',
      'Feedback on Health Records',
      'Feedback on Medicine Deliver',
    ],
  },
];

type SpecialitiesType = {
  [key: string]: string[];
};

const Specialities: SpecialitiesType = {
  Cardiology: ['Cardiologist', 'Cardiologists'],
  Neurology: ['Neurologist', 'Neurologists'],
  Orthopaedics: ['Orthopaedician', 'Orthopaedicians'],
  Pulmonology: ['Pulmonologist', 'Pulmonologists'],
  Obstetrics: ['Obstetrician', 'Obstetricians'],
  Gastroenterology: ['Gastroenterologist', 'Gastroenterologists'],
  'General (MBBS)': ['General Physician', 'General Physicians'],
  'General Medicine': ['General Physician', 'General Physicians'],
  Dermatology: ['Dermatologist', 'Dermatologists'],
  Diabetology: ['Diabetologist', 'Diabetologists'],
  Dietician: ['Dietician', 'Dieticians'],
  Paediatrics: ['Paediatrician', 'Paediatricians'],
  ENT: ['ENT Specialist', 'ENT Specialists'],
  Opthalmology: ['Opthalmologist', 'Opthalmologists'],
  Oncology: ['Oncologist', 'Oncologists'],
  Radiology: ['Radiologist', 'Radiologists'],
  Nephrology: ['Nephrologist', 'Nephrologists'],
  Urology: ['Urologist', 'Urologists'],
  Podiatry: ['Podiatrician', 'Podiatricians'],
  'General Surgeon': ['General Surgeon', 'General Surgeons'],
  'Vascular Surgery': ['Vascular Surgeon', 'Vascular Surgeons'],
  Gynaecology: ['Gynaecologist', 'Gynaecologists'],
};

export const AppConfig = {
  Configuration,
  Specialities,
};
