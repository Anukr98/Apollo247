const pharmaToken201 = 'Bearer 2o1kd4bjapqifpb27fy7tnbivu8bqo1d';
const pharmaTokenYXV = 'YXV0aF91c2VyOnN1cGVyc2VjcmV0X3Rhd';
const pharmaTokencTf = 'cTfznn4yhybBR7WSrNJn1g==';
const pharmaTokendp5 = 'Bearer dp50h14gpxtqf8gi1ggnctqcrr0io6ms';
const apolloProdBaseUrl = 'https://www.apollopharmacy.in';
const apolloUatBaseUrl = 'https://uat.apollopharmacy.in';

const PharmaApiConfig = {
  dev: {
    MED_SEARCH: [apolloProdBaseUrl, pharmaToken201],
    MED_DETAIL: [apolloUatBaseUrl, pharmaToken201],
    MED_SEARCH_SUGGESTION: [apolloUatBaseUrl, pharmaToken201],
    STORES_LIST: [apolloProdBaseUrl, pharmaToken201],
    PIN_SERVICEABILITY: [apolloProdBaseUrl, pharmaToken201],
    INVENTORY_CHECK: ['https://online.apollopharmacy.org/APOLLO247/Orderplace.svc', pharmaTokencTf],
    SHOP_BY_CITY: [apolloUatBaseUrl],
    IMAGES_BASE_URL: [`${apolloUatBaseUrl}/pub/media`],
    GET_DELIVERY_TIME: [
      'http://tpuat.apollopharmacy.org:9090/IEngine/webresources/Inventory/getDeliveryTimePartial',
      pharmaTokenYXV,
    ],
    GET_SUBSTITUTES: [`${apolloUatBaseUrl}/popcsrchprdsubt_api.php`, pharmaToken201],
    PRODUCTS_BY_CATEGORY: [`${apolloUatBaseUrl}/apollo_api.php`, pharmaToken201],
    MEDICINE_PAGE: [`${apolloUatBaseUrl}/apollo_24x7_api.php`, pharmaToken201],
    ALL_BRANDS: [`${apolloUatBaseUrl}/allbrands_api.php`, pharmaToken201],
    GET_TEST_PACKAGES: [`http://uatlims.apollohl.in/ApolloLive/AskApollo.aspx?cmd=getpackagedata`],
    GET_PACKAGE_DATA: [`http://uatlims.apollohl.in/ApolloLive/AskApollo.aspx?cmd=getpackagedetail`],
    GET_CLINICS: ['http://uatlims.apollohl.in/ApolloLive/CronJob/GetCentreDetail.aspx'],
  },
  prod: {
    MED_SEARCH: [apolloProdBaseUrl, pharmaToken201],
    MED_DETAIL: [apolloProdBaseUrl, pharmaToken201],
    MED_SEARCH_SUGGESTION: [apolloProdBaseUrl, pharmaToken201],
    STORES_LIST: [apolloProdBaseUrl, pharmaToken201],
    PIN_SERVICEABILITY: [apolloProdBaseUrl, pharmaToken201],
    INVENTORY_CHECK: ['https://online.apollopharmacy.org/APOLLO247/Orderplace.svc', pharmaTokencTf],
    SHOP_BY_CITY: [apolloProdBaseUrl],
    IMAGES_BASE_URL: [`${apolloProdBaseUrl}/pub/media`],
    GET_DELIVERY_TIME: [
      'http://online.apollopharmacy.org:8085/IEngine/webresources/Inventory/getDeliveryTimePartial',
      pharmaTokenYXV,
    ],
    GET_SUBSTITUTES: [`${apolloProdBaseUrl}/popcsrchprdsubt_api.php`, pharmaToken201],
    PRODUCTS_BY_CATEGORY: [`${apolloProdBaseUrl}/categoryproducts_api.php`, pharmaToken201],
    MEDICINE_PAGE: [`${apolloProdBaseUrl}/apollo_24x7_api.php`, pharmaToken201],
    ALL_BRANDS: [`${apolloProdBaseUrl}/allbrands_api.php`, pharmaToken201],
    GET_TEST_PACKAGES: [`http://uatlims.apollohl.in/ApolloLive/AskApollo.aspx?cmd=getpackagedata`],
    GET_PACKAGE_DATA: [`http://uatlims.apollohl.in/ApolloLive/AskApollo.aspx?cmd=getpackagedetail`],
    GET_CLINICS: ['http://uatlims.apollohl.in/ApolloLive/CronJob/GetCentreDetail.aspx'],
  },
};

//Development;
const Configuration = {
  LOG_ENVIRONMENT: 'debug',
  ANALYTICAL_ENIVRONMENT: 'debug',
  MEDICINE_PAST_SEARCHES_SHOW_COUNT: 5,
  PAYMENT_GATEWAY_BASE_URL: 'https://aph.dev.pmt.popcornapps.com',
  PAYMENT_GATEWAY_SUCCESS_PATH: '/mob?',
  PAYMENT_GATEWAY_ERROR_PATH: '/mob-error?',
  MIN_CART_VALUE_FOR_FREE_DELIVERY: 199,
  DELIVERY_CHARGES: 25,
  DIASGNOS_DELIVERY_CHARGES: 0,
  PRAKTISE_API_KEY: '4A8C9CCC-C5A3-11E9-9A19-8C85900A8328',
  PRO_TOKBOX_KEY: '46429002',
  PRO_PUBNUB_PUBLISH: 'pub-c-75e6dc17-2d81-4969-8410-397064dae70e',
  PRO_PUBNUB_SUBSCRIBER: 'sub-c-9cc337b6-e0f4-11e9-8d21-f2f6e193974b',
  DOCUMENT_BASE_URL: 'https://apolloaphstorage.blob.core.windows.net/popaphstorage/popaphstorage/',
  GOOGLE_API_KEY: 'AIzaSyCu4uyf9ln--tU-8V32nnFyfk8GN4koLI0',
  ...PharmaApiConfig.dev,
};

// QA
// const Configuration = {
//   LOG_ENVIRONMENT: 'release',
//   ANALYTICAL_ENIVRONMENT: 'debug',
//   MEDICINE_PAST_SEARCHES_SHOW_COUNT: 5,
//   PAYMENT_GATEWAY_BASE_URL: 'https://pmt.apollo247.com',
//   PAYMENT_GATEWAY_SUCCESS_PATH: '/mob?',
//   PAYMENT_GATEWAY_ERROR_PATH: '/mob-error?',
//   MIN_CART_VALUE_FOR_FREE_DELIVERY: 199,
//   DELIVERY_CHARGES: 25,
//   DIASGNOS_DELIVERY_CHARGES: 0,
//   PRAKTISE_API_KEY: '4A8C9CCC-C5A3-11E9-9A19-8C85900A8328',
//   PRO_TOKBOX_KEY: '46429002',
//   PRO_PUBNUB_PUBLISH: 'pub-c-75e6dc17-2d81-4969-8410-397064dae70e',
//   PRO_PUBNUB_SUBSCRIBER: 'sub-c-9cc337b6-e0f4-11e9-8d21-f2f6e193974b',
//   DOCUMENT_BASE_URL: 'https://apolloaphstorage.blob.core.windows.net/popaphstorage/popaphstorage/',
//   GOOGLE_API_KEY: 'AIzaSyCu4uyf9ln--tU-8V32nnFyfk8GN4koLI0',
//   ...PharmaApiConfig.prod,
// };

//Production
// const Configuration = {
//   LOG_ENVIRONMENT: 'release',
//   ANALYTICAL_ENIVRONMENT: 'release',
//   MEDICINE_PAST_SEARCHES_SHOW_COUNT: 5,
//   PAYMENT_GATEWAY_BASE_URL: 'https://pmt.apollo247.com', //PRODUCTION
//   PAYMENT_GATEWAY_SUCCESS_PATH: '/mob?',
//   PAYMENT_GATEWAY_ERROR_PATH: '/mob-error?',
//   MIN_CART_VALUE_FOR_FREE_DELIVERY: 199,
//   DELIVERY_CHARGES: 25,
//   DIASGNOS_DELIVERY_CHARGES: 0,
//   PRAKTISE_API_KEY: 'C2B3FAEE-C576-11E9-AEF4-8C85900A8328', // PRODUCTION
//   PRO_TOKBOX_KEY: '46422952', // PRODUCTION
//   PRO_PUBNUB_PUBLISH: 'pub-c-e275fde3-09e1-44dd-bc32-5c3d04c3b2ef', // PRODUCTION
//   PRO_PUBNUB_SUBSCRIBER: 'sub-c-517dafbc-d955-11e9-aa3a-6edd521294c5', // PRODUCTION
//   DOCUMENT_BASE_URL: 'https://prodaphstorage.blob.core.windows.net/prodaphstorage/prodaphstorage/', //Production
//   GOOGLE_API_KEY: 'AIzaSyCu4uyf9ln--tU-8V32nnFyfk8GN4koLI0',
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
