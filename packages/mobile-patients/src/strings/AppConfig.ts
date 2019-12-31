const pharmaToken201 = 'Bearer 2o1kd4bjapqifpb27fy7tnbivu8bqo1d';
const pharmaTokenYXV = 'YXV0aF91c2VyOnN1cGVyc2VjcmV0X3Rhd';
const pharmaTokencTf = 'cTfznn4yhybBR7WSrNJn1g==';
const pharmaTokendp5 = 'Bearer dp50h14gpxtqf8gi1ggnctqcrr0io6ms';
const apolloProdBaseUrl = 'https://www.apollopharmacy.in';
const apolloUatBaseUrl = 'https://uat.apollopharmacy.in';

enum AppEnv {
  DEV = 'DEV',
  QA = 'QA',
  PROD = 'PROD',
}

const APP_ENV: AppEnv = AppEnv.PROD as AppEnv; //Change to AppEnv.(DEV, QA, PROD) for respective API environments in the app. Also don't forget to change src/helpers/apiRoutes.ts

const PharmaApiConfig = {
  dev: {
    MED_SEARCH: [apolloProdBaseUrl, pharmaToken201], //later cahnge to UAT
    MED_DETAIL: [apolloUatBaseUrl, pharmaToken201], // change to PROD
    MED_SEARCH_SUGGESTION: [apolloUatBaseUrl, pharmaToken201], // change to PROD
    STORES_LIST: [apolloProdBaseUrl, pharmaToken201],
    PIN_SERVICEABILITY: [apolloProdBaseUrl, pharmaToken201],
    INVENTORY_CHECK: ['https://online.apollopharmacy.org/APOLLO247/Orderplace.svc', pharmaTokencTf],
    SHOP_BY_CITY: [apolloUatBaseUrl],
    IMAGES_BASE_URL: [`${apolloProdBaseUrl}/pub/media`],
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
    GET_TEST_PACKAGES: [
      `https://report.apollodiagnostics.in/Apollo/AskApollo.aspx?cmd=getpackagedata`,
    ],
    GET_PACKAGE_DATA: [
      `https://report.apollodiagnostics.in/Apollo/AskApollo.aspx?cmd=getpackagedetail`,
    ],
    GET_CLINICS: ['https://report.apollodiagnostics.in/Apollo/CronJob/GetCentreDetail.aspx'],
  },
};

//Development;
const ConfigurationDev = {
  LOG_ENVIRONMENT: 'debug',
  ANALYTICAL_ENIVRONMENT: 'debug',
  MEDICINE_PAST_SEARCHES_SHOW_COUNT: 5,
  PAYMENT_GATEWAY_BASE_URL: 'https://aph.dev.pmt.popcornapps.com',
  PAYMENT_GATEWAY_SUCCESS_PATH: '/mob?',
  PAYMENT_GATEWAY_ERROR_PATH: '/mob-error?',
  CONSULT_PG_BASE_URL: 'https://aph.dev.pmt.popcornapps.com',
  CONSULT_PG_SUCCESS_PATH: '/consultpg-success?',
  CONSULT_PG_ERROR_PATH: '/consultpg-error?',
  DIAGNOSTICS_PG_BASE_URL: 'https://aph.dev.pmt.popcornapps.com',
  DIAGNOSTICS_PG_SUCCESS_PATH: '/diagnostic-pg-success?',
  DIAGNOSTICS_PG_ERROR_PATH: '/diagnostic-pg-error?',
  DIAGNOSTICS_PG_CANCEL_PATH: '/diagnostic-pg-cancel-url',
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
  iOS_Version: '1.7',
  Android_Version: '1.16',
};

// QA
const ConfigurationQA = {
  LOG_ENVIRONMENT: 'release',
  ANALYTICAL_ENIVRONMENT: 'release',
  MEDICINE_PAST_SEARCHES_SHOW_COUNT: 5,
  PAYMENT_GATEWAY_BASE_URL: 'https://aph.staging.pmt.popcornapps.com',
  PAYMENT_GATEWAY_SUCCESS_PATH: '/mob?',
  PAYMENT_GATEWAY_ERROR_PATH: '/mob-error?',
  CONSULT_PG_BASE_URL: 'https://aph.staging.pmt.popcornapps.com',
  CONSULT_PG_SUCCESS_PATH: '/consultpg-success?',
  CONSULT_PG_ERROR_PATH: '/consultpg-error?',
  DIAGNOSTICS_PG_BASE_URL: 'https://aph.staging.pmt.popcornapps.com',
  DIAGNOSTICS_PG_SUCCESS_PATH: '/diagnostic-pg-success?',
  DIAGNOSTICS_PG_ERROR_PATH: '/diagnostic-pg-error?',
  DIAGNOSTICS_PG_CANCEL_PATH: '/diagnostic-pg-cancel-url',
  MIN_CART_VALUE_FOR_FREE_DELIVERY: 199,
  DELIVERY_CHARGES: 25,
  DIASGNOS_DELIVERY_CHARGES: 0,
  PRAKTISE_API_KEY: '4A8C9CCC-C5A3-11E9-9A19-8C85900A8328',
  PRO_TOKBOX_KEY: '46429002',
  PRO_PUBNUB_PUBLISH: 'pub-c-75e6dc17-2d81-4969-8410-397064dae70e',
  PRO_PUBNUB_SUBSCRIBER: 'sub-c-9cc337b6-e0f4-11e9-8d21-f2f6e193974b',
  DOCUMENT_BASE_URL: 'https://apolloaphstorage.blob.core.windows.net/popaphstorage/popaphstorage/',
  GOOGLE_API_KEY: 'AIzaSyCu4uyf9ln--tU-8V32nnFyfk8GN4koLI0',
  ...PharmaApiConfig.prod,
  iOS_Version: '1.7',
  Android_Version: '1.16',
};

//Production
const ConfigurationProd = {
  LOG_ENVIRONMENT: 'release',
  ANALYTICAL_ENIVRONMENT: 'release',
  MEDICINE_PAST_SEARCHES_SHOW_COUNT: 5,
  PAYMENT_GATEWAY_BASE_URL: 'https://pmt.apollo247.com', //PRODUCTION
  PAYMENT_GATEWAY_SUCCESS_PATH: '/mob?',
  PAYMENT_GATEWAY_ERROR_PATH: '/mob-error?',
  CONSULT_PG_BASE_URL: 'https://pmt.apollo247.com',
  CONSULT_PG_SUCCESS_PATH: '/consultpg-success?',
  CONSULT_PG_ERROR_PATH: '/consultpg-error?',
  DIAGNOSTICS_PG_BASE_URL: 'https://pmt.apollo247.com',
  DIAGNOSTICS_PG_SUCCESS_PATH: '/diagnostic-pg-success?',
  DIAGNOSTICS_PG_ERROR_PATH: '/diagnostic-pg-error?',
  DIAGNOSTICS_PG_CANCEL_PATH: '/diagnostic-pg-cancel-url',
  MIN_CART_VALUE_FOR_FREE_DELIVERY: 199,
  DELIVERY_CHARGES: 25,
  DIASGNOS_DELIVERY_CHARGES: 0,
  PRAKTISE_API_KEY: 'C2B3FAEE-C576-11E9-AEF4-8C85900A8328', // PRODUCTION
  PRO_TOKBOX_KEY: '46422952', // PRODUCTION
  PRO_PUBNUB_PUBLISH: 'pub-c-e275fde3-09e1-44dd-bc32-5c3d04c3b2ef', // PRODUCTION
  PRO_PUBNUB_SUBSCRIBER: 'sub-c-517dafbc-d955-11e9-aa3a-6edd521294c5', // PRODUCTION
  DOCUMENT_BASE_URL: 'https://prodaphstorage.blob.core.windows.net/prodaphstorage/prodaphstorage/', //Production
  GOOGLE_API_KEY: 'AIzaSyCu4uyf9ln--tU-8V32nnFyfk8GN4koLI0',
  ...PharmaApiConfig.prod,
  iOS_Version: '1.7',
  Android_Version: '1.16',
};

const Configuration =
  APP_ENV == AppEnv.PROD
    ? ConfigurationProd
    : APP_ENV == AppEnv.QA
    ? ConfigurationQA
    : ConfigurationDev;

export const MedicineFeedBackData = {
  POOR: {
    question: 'What went wrong?',
    options: [
      'Delivery person was impolite',
      'Packaging',
      'Delivery time',
      'Difficulty in using the App',
      'Medicine unavailability',
      'Comparatively better offers on other portals',
      'Payment-related issues on App',
      'Medicine delivered was nearing expiry date',
      'Incorrect medicines delivered',
      'Unvailability of some medicines',
      'Others',
    ],
  },
  OKAY: {
    question: 'What could have been improved?',
    options: [
      'Delivery time',
      'Medicine options to choose from ',
      'Ordering experience',
      'Better offers',
      'Better packaging',
      'Others',
    ],
  },
  GOOD: {
    question: 'Thanks! How can we make this a Great experience for you?',
    options: [
      'Add more medicines to choose from',
      'Simplify ordering experience',
      'Better offers',
      'Improve packaging',
      'Improve delivery time',
      'Others',
    ],
  },
  GREAT: {
    question: 'What went well?',
    options: [
      'Ordering experience',
      'Variety and options to choose from',
      'Delivery time',
      'Delivery person was friendly and polite',
      'Great offers and prices',
      'Others',
    ],
  },
};

export const ConsultFeedBackData = {
  POOR: {
    question: 'What went wrong?',
    options: [
      'Doctor did not ask enough questions',
      'Delay in starting consult',
      'Doctor replied late and kept me waiting',
      'Difficulty while using the application',
      'Doctor took a long time in sharing the prescription',
      'Doctor was impolite',
      'Doctor was in a hurry',
      'I could not find the doctor I was looking for',
      'Doctor was not available immediately',
      'I found better service on other portals',
      'I would prefer to see doctor in person at his clinic',
      'App-related issues (bandwidth/ payment errors)',
      'Others',
    ],
  },
  OKAY: {
    question: 'What could have been improved?',
    options: [
      'Doctor consultation experience',
      'Number of doctors to choose from ',
      'Booking experience',
      'Chat/ Audio/ Video experience',
      'Experience with the Doctor’s Team ',
      'Others',
    ],
  },
  GOOD: {
    question: 'Thanks! How can we make this a Great experience for you?',
    options: [
      'Improve doctor consultation experience',
      'Add more doctors to choose from ',
      'Simplify booking experience',
      'Improve Chat/ Audio/ Video experience',
      'Improve experience with the Doctor’s team ',
      'Others',
    ],
  },
  GREAT: {
    question: 'What went well?',
    options: [
      'Doctor explained everything in detail',
      'Doctor was exceptionally knowledgeable',
      'Doctor was answering all my questions promptly',
      'Smooth Chat/ Audio/ Video experience',
      'Doctor was immediately available',
      'Others',
    ],
  },
};

export const TestsFeedBackData = {
  POOR: {
    question: 'What went wrong?',
    options: [
      'The pick-up person was impolite',
      'The pick-up person was ill-trained/ ill-equipped',
      'Pick-up person was late',
      'Delay in report generation',
      'Difficulty in using the App',
      'I could not find the tests I was looking for',
      'I found better offers on other portals',
      'Payment-related issues on App',
      'Unavailability of preferred slots',
      'Unavailability of some tests',
      'Others',
    ],
  },
  OKAY: {
    question: 'What could have been improved?',
    options: [
      'Report generation time',
      'Options of tests to choose from',
      'Ordering experience',
      'Offers',
      'The pick-up person’s training',
      'Pick-up person’s punctuality',
      'Number of slots for pick-up time to choose from',
      'Others',
    ],
  },
  GOOD: {
    question: 'Thanks! What could make this a Great experience for you?',
    options: [
      'More tests to choose from',
      'Simpler booking',
      'Better offers',
      'Quicker report generation time',
      'Better trained pick-up person ',
      'More punctual pick-up person',
      'Others',
    ],
  },
  GREAT: {
    question: 'What went well?',
    options: [
      'Booking experience',
      'Variety and options to choose from',
      'Timely pick-up',
      'Offers and prices',
      'Friendly and polite delivery person',
      'Others',
    ],
  },
};

export const NeedHelp = [
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
    category: 'Feedback',
    options: [
      'Feedback on Consultation',
      'Feedback on Health Records',
      'Feedback on Medicine Deliver',
    ],
  },
  {
    category: 'Diagnostics',
    options: [
      'Payment Issues while ordering',
      'Sample pick up related',
      'Excess amount related',
      'Issues in Order confirmation',
      'Pickup cancelled without any information',
      'Pickup Cancelled, No Refund',
      'Report not received',
      'Wrong report received',
      'Sample pick up staff related',
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
