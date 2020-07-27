import string from '@aph/mobile-patients/src/strings/strings.json';
import { ChennaiDeliveryPinCodes } from '@aph/mobile-patients/src/strings/ChennaiDeliveryPinCodes';
import { PharmaStateCodeMapping } from '@aph/mobile-patients/src/strings/PharmaStateCodeMapping';

export type PharmacyHomepageInfo = {
  section_key: string;
  section_name: string;
  section_position: string;
  visible: boolean;
};

export enum AppEnv {
  DEV = 'DEV',
  QA = 'QA',
  QA2 = 'QA2',
  STAGING = 'STAGING',
  PROD = 'PROD',
  PERFORM = 'PERFORM',
  VAPT = 'VAPT',
  DEVReplica = 'DEVReplica',
}

const APP_ENV: AppEnv = AppEnv.QA2 as AppEnv; // For respective API environments in the app.

const pharmaToken201 = 'Bearer 2o1kd4bjapqifpb27fy7tnbivu8bqo1d';
const pharmaTokenYXV = 'YXV0aF91c2VyOnN1cGVyc2VjcmV0X3Rhd';
const pharmaTokencTf = 'cTfznn4yhybBR7WSrNJn1g==';
const pharmaTokendp5 = 'Bearer dp50h14gpxtqf8gi1ggnctqcrr0io6ms';
const apolloProdBaseUrl = 'https://magento.apollo247.com';
const apolloUatBaseUrl = 'https://uat.apollopharmacy.in';
const testApiCredentialsDev = {
  UserName: 'ASKAPOLLO',
  Password: '3HAQbAb9wrsykr8TMLnV',
  InterfaceClient: 'ASKAPOLLO',
};
const testApiCredentialsProd = {
  Username: 'MCKINSEY',
  Password: 'ERVEYCWTALAOHELEEBRY',
  InterfaceClient: 'MCKINSEY',
};

const appStaticVariables = {
  DIAGNOSTIC_SLOTS_LEAD_TIME_IN_MINUTES: 60, // slots visible after this period for current date
  DIAGNOSTIC_SLOTS_MAX_FORWARD_DAYS: 2, // slots can be booked upto this period
  DIAGNOSTIC_MAX_SLOT_TIME: '12:00', // 24 hours format
  TAT_UNSERVICEABLE_DAY_COUNT: 10, // no. of days upto which cart item is considered as serviceable
  TAT_API_TIMEOUT_IN_SEC: 10,
  PACKAGING_CHARGES: 0,
  MIN_VALUE_TO_NUDGE_USERS_TO_AVAIL_FREE_DELIVERY: 0,
  EXOTEL_CALL_API_URL:
    'https://157e9636faf8c1b7296a749deb8789fa84314b27598eb7a9:82ac24fd451cbf85373a4ea90f083c9d321040ee9c3d26ed@api.exotel.com/v1/Accounts/apollo2471/Calls/connect.json',
  EXOTEL_CALLER_ID: '04049171522',
  HOME_SCREEN_COVID_HEADER_TEXT: string.common.covidHeading,
  HOME_SCREEN_EMERGENCY_BANNER_TEXT: string.common.emergencyBannerText,
  HOME_SCREEN_COVID_CONTACT_TEXT: string.common.covidContactText,
  HOME_SCREEN_COVIDSCAN_BANNER_TEXT: string.common.covidScanBannerText,
  HOME_SCREEN_EMERGENCY_BANNER_NUMBER: string.common.emergencyBannerPhoneNumber,
  CHENNAI_PHARMA_DELIVERY_PINCODES: ChennaiDeliveryPinCodes,
  CRYPTO_SECRET_KEY: 'z2iQxQAuyLC0j2GNryyZ2JuGLTQyT0mK',
  PHARMA_STATE_CODE_MAPPING: PharmaStateCodeMapping,
  PHARMACY_HOMEPAGE_INFO: [
    {
      section_key: 'banners',
      section_name: 'BANNERS',
      section_position: '1',
      visible: true,
    },
    {
      section_key: 'orders',
      section_name: 'ORDERS',
      section_position: '2',
      visible: true,
    },
    {
      section_key: 'upload_prescription',
      section_name: 'UPLOAD PRESCRIPTION',
      section_position: '3',
      visible: true,
    },
    {
      section_key: 'recommended_products',
      section_name: 'RECOMMENDED PRODUCTS',
      section_position: '4',
      visible: true,
    },
    {
      section_key: 'healthareas',
      section_name: 'SHOP BY HEALTH AREAS',
      section_position: '5',
      visible: true,
    },
    {
      section_key: 'deals_of_the_day',
      section_name: 'DEALS OF THE DAY',
      section_position: '6',
      visible: true,
    },
    {
      section_key: 'hot_sellers',
      section_name: 'HOT SELLERS',
      section_position: '7',
      visible: true,
    },
    {
      section_key: 'shop_by_category',
      section_name: 'SHOP BY CATEGORY',
      section_position: '8',
      visible: true,
    },
    {
      section_key: 'monsoon_essentials',
      section_name: 'MONSOON ESSENTIALS',
      section_position: '9',
      visible: true,
    },
    {
      section_key: 'widget_2',
      section_name: 'IMMUNITY BOOSTERS',
      section_position: '10',
      visible: true,
    },
    {
      section_key: 'widget_3',
      section_name: 'BABY CARE',
      section_position: '11',
      visible: true,
    },
    {
      section_key: 'shop_by_brand',
      section_name: 'SHOP BY BRAND',
      section_position: '12',
      visible: true,
    },
  ] as PharmacyHomepageInfo[],
  CART_ITEM_MAX_QUANTITY: 10, // max. allowed qty to add to cart
  HOME_SCREEN_KAVACH_TEXT: string.common.KavachText,
  MED_ORDERS_CUSTOMER_CARE_WHATSAPP_LINK: 'https://bit.ly/apollo247medicines',
};

const DEV_top6_specailties = [
  {
    speciality_id: '4dc1c5de-e062-4b3b-aec9-090389687865',
    speciality_order: '1',
    speciality_name: 'General Physician/ Internal Medicine',
  },
  {
    speciality_id: 'dfe0b6a4-d0d4-4f54-a4b0-9f5c9bd7b39c',
    speciality_order: '5',
    speciality_name: 'Cardiology',
  },
  {
    speciality_id: '4fc00d0f-95d9-4040-a1d4-41515a2aaa0e',
    speciality_order: '6',
    speciality_name: 'Gastroenterology/ GI Medicine',
  },
  {
    speciality_id: 'fba32e11-eb1c-4e18-8d45-8c25f45d7672',
    speciality_order: '3',
    speciality_name: 'Dermatology',
  },
  {
    speciality_id: '3b69e637-684d-4545-aace-91810bc5739d',
    speciality_order: '2',
    speciality_name: 'Obstetrics & Gynaecology',
  },
  {
    speciality_id: '91cee893-55cf-41fd-9d6b-73157c6518a9',
    speciality_order: '4',
    speciality_name: 'Paediatrics',
  },
];

const QA_top6_specailties = [
  {
    speciality_id: '4145727e-e3a4-4219-814b-d0f10df9b2f1',
    speciality_order: '1',
    speciality_name: 'General Physician/ Internal Medicine',
  },
  {
    speciality_id: 'bf0cc02f-1422-45e6-86ee-4ab2b35ffc02',
    speciality_order: '5',
    speciality_name: 'Cardiology',
  },
  {
    speciality_id: '3ea4faf5-05b2-4c58-8e00-f6ee71f4eb7d',
    speciality_order: '6',
    speciality_name: 'Gastroenterology/ GI Medicine',
  },
  {
    speciality_id: 'e3ede210-b0bb-4100-919d-2086afdbe89e',
    speciality_order: '3',
    speciality_name: 'Dermatology',
  },
  {
    speciality_id: '22bd8220-327c-433f-a112-2a2f89216859',
    speciality_order: '2',
    speciality_name: 'Obstetrics & Gynaecology',
  },
  {
    speciality_id: '0735146e-bd51-4b7c-b7a1-234efc1b259d',
    speciality_order: '4',
    speciality_name: 'Paediatrics',
  },
];

const top6_specailties = [
  {
    speciality_id: '615ebc75-4172-4f46-9ba0-b3688c053fcc',
    speciality_order: '1',
    speciality_name: 'General Physician/ Internal Medicine',
  },
  {
    speciality_id: 'f325ede7-8710-49a6-b0ea-32ddc06f2b4c',
    speciality_order: '5',
    speciality_name: 'Cardiology',
  },
  {
    speciality_id: '789b2a65-1d81-4023-92c8-39959ca8a7ed',
    speciality_order: '6',
    speciality_name: 'Gastroenterology/ GI Medicine',
  },
  {
    speciality_id: '73dae7a6-ec1f-45c4-98bd-0c8acb6e4eca',
    speciality_order: '3',
    speciality_name: 'Dermatology',
  },
  {
    speciality_id: 'd67d4978-a14a-46c8-8af8-697823bfcadf',
    speciality_order: '2',
    speciality_name: 'Obstetrics & Gynaecology',
  },
  {
    speciality_id: '1f110338-87d5-430c-b10a-8b3eddd54732',
    speciality_order: '4',
    speciality_name: 'Paediatrics',
  },
];

export const updateAppConfig = (key: keyof typeof Configuration, value: object) => {
  Configuration[key] = value as never;
};

const PharmaApiConfig = {
  dev: {
    MED_SEARCH: [apolloUatBaseUrl, pharmaToken201], //later cahnge to UAT
    MED_DETAIL: [apolloUatBaseUrl, pharmaToken201], // change to PROD
    MED_SEARCH_SUGGESTION: [apolloUatBaseUrl, pharmaToken201], // change to PROD
    STORES_LIST: [apolloUatBaseUrl, pharmaToken201],
    GET_STORE_INVENTORY: [
      `https://online.apollopharmacy.org/TAT/Apollo/GetStoreInventory`,
      pharmaTokenYXV,
    ],
    PIN_SERVICEABILITY: [apolloProdBaseUrl, pharmaToken201],
    MED_CART_ITEMS_DETAILS: [`${apolloUatBaseUrl}/popcscrchcart_api.php`, pharmaToken201],
    SHOP_BY_CITY: [apolloUatBaseUrl],
    IMAGES_BASE_URL: [`https://uat.apollopharmacy.in/pub/media`],
    GET_DELIVERY_TIME: [
      'http://online.apollopharmacy.org:8085/IEngine/webresources/Inventory/getDeliveryTimePartial',
      pharmaTokenYXV,
    ],
    GET_DELIVERY_TIME_HEADER_TAT: [
      'https://online.apollopharmacy.org/UATTAT/Apollo/GetHeaderTat',
      pharmaTokenYXV,
    ],
    GET_SUBSTITUTES: [`${apolloUatBaseUrl}/popcsrchprdsubt_api.php`, pharmaToken201],
    PRODUCTS_BY_CATEGORY: [`${apolloUatBaseUrl}/categoryproducts_api.php`, pharmaToken201],
    MEDICINE_PAGE: [`${apolloUatBaseUrl}/apollo_24x7_api.php`, pharmaToken201],
    ALL_BRANDS: [`${apolloUatBaseUrl}/allbrands_api.php`, pharmaToken201],
    GET_TEST_PACKAGES: [
      `http://uatlims.apollohl.in/ApolloLive/AskApollo.aspx?cmd=getpackagedata`,
      testApiCredentialsDev,
    ],
    GET_PACKAGE_DATA: [
      // `http://uatlims.apollohl.in/ApolloLive/AskApollo.aspx?cmd=getpackagedetail`
      `https://report.apollodiagnostics.in/Apollo/AskApollo.aspx?cmd=getpackagedetail`,
    ],
    GET_CLINICS: [
      'http://uatlims.apollohl.in/ApolloLive/CronJob/GetCentreDetail.aspx',
      testApiCredentialsDev,
    ],
  },
  prod: {
    MED_SEARCH: [apolloProdBaseUrl, pharmaToken201],
    MED_DETAIL: [apolloProdBaseUrl, pharmaToken201],
    MED_SEARCH_SUGGESTION: [apolloProdBaseUrl, pharmaToken201],
    STORES_LIST: [apolloProdBaseUrl, pharmaToken201],
    GET_STORE_INVENTORY: [
      `https://online.apollopharmacy.org/TAT/Apollo/GetStoreInventory`,
      pharmaTokenYXV,
    ],
    PIN_SERVICEABILITY: [apolloProdBaseUrl, pharmaToken201],
    MED_CART_ITEMS_DETAILS: [`${apolloProdBaseUrl}/popcscrchcart_api.php`, pharmaToken201],
    SHOP_BY_CITY: [apolloProdBaseUrl],
    IMAGES_BASE_URL: [`https://d27zlipt1pllog.cloudfront.net/pub/media`],
    GET_DELIVERY_TIME: [
      'http://online.apollopharmacy.org:8085/IEngine/webresources/Inventory/getDeliveryTimePartial',
      pharmaTokenYXV,
    ],
    GET_DELIVERY_TIME_HEADER_TAT: [
      'https://online.apollopharmacy.org/TAT/Apollo/GetHeaderTat',
      pharmaTokenYXV,
    ],
    GET_SUBSTITUTES: [`${apolloProdBaseUrl}/popcsrchprdsubt_api.php`, pharmaToken201],
    PRODUCTS_BY_CATEGORY: [`${apolloProdBaseUrl}/categoryproducts_api.php`, pharmaToken201],
    MEDICINE_PAGE: [`${apolloProdBaseUrl}/apollo_24x7_api.php`, pharmaToken201],
    ALL_BRANDS: [`${apolloProdBaseUrl}/allbrands_api.php`, pharmaToken201],
    GET_TEST_PACKAGES: [
      `https://report.apollodiagnostics.in/Apollo/AskApollo.aspx?cmd=getpackagedata`,
      testApiCredentialsProd,
    ],
    GET_PACKAGE_DATA: [
      `https://report.apollodiagnostics.in/Apollo/AskApollo.aspx?cmd=getpackagedetail`,
    ],
    GET_CLINICS: [
      'https://report.apollodiagnostics.in/Apollo/CronJob/GetCentreDetail.aspx',
      testApiCredentialsProd,
    ],
  },
};

//Development;
const ConfigurationDev = {
  CODE_PUSH_DEPLOYMENT_KEY_ANDROID: 'ztcR3MB6vWyWtIAzpnsOczanc57pCQeMAIhUS',
  CODE_PUSH_DEPLOYMENT_KEY_IOS: 't1yzL4Cj0zDKiAUuKVZt_zIYuwHrleGaNVihE',
  PAYMENT_GATEWAY_BASE_URL: 'https://aph.dev.pmt.popcornapps.com',
  PAYMENT_GATEWAY_SUCCESS_PATH: '/mob?',
  PAYMENT_GATEWAY_ERROR_PATH: '/mob-error?',
  CONSULT_PG_BASE_URL: 'https://aph.dev.pmt.popcornapps.com',
  CONSULT_PG_SUCCESS_PATH: '/consultpg-success',
  CONSULT_PG_ERROR_PATH: '/consultpg-error',
  CONSULT_PG_PENDING_PATH: '/consultpg-pending',
  CONSULT_PG_REDIRECT_PATH: '/consultpg-redirect?',
  DIAGNOSTICS_PG_BASE_URL: 'https://aph.dev.pmt.popcornapps.com',
  DIAGNOSTICS_PG_SUCCESS_PATH: '/diagnostic-pg-success?',
  DIAGNOSTICS_PG_ERROR_PATH: '/diagnostic-pg-error?',
  DIAGNOSTICS_PG_CANCEL_PATH: '/diagnostic-pg-cancel-url',
  MIN_CART_VALUE_FOR_FREE_DELIVERY: 200,
  DELIVERY_CHARGES: 25,
  DIASGNOS_DELIVERY_CHARGES: 0,
  PRAKTISE_API_KEY: 'AFF2F0D8-5320-4E4D-A673-33626CD1C3F2', //'4A8C9CCC-C5A3-11E9-9A19-8C85900A8328',
  PRO_TOKBOX_KEY: '46429002',
  PRO_PUBNUB_PUBLISH: 'pub-c-75e6dc17-2d81-4969-8410-397064dae70e',
  PRO_PUBNUB_SUBSCRIBER: 'sub-c-9cc337b6-e0f4-11e9-8d21-f2f6e193974b',
  DOCUMENT_BASE_URL: 'https://apolloaphstorage.blob.core.windows.net/popaphstorage/popaphstorage/',
  GOOGLE_API_KEY: 'AIzaSyCu4uyf9ln--tU-8V32nnFyfk8GN4koLI0',
  TOP_SPECIALITIES: DEV_top6_specailties,
  ...PharmaApiConfig.dev,
  ...appStaticVariables,
  iOS_Version: '2.631',
  Android_Version: '2.631',
  CONDITIONAL_MANAGENET_BASE_URL: 'https://aph.staging.pmt.popcornapps.com',
  BUGSNAG_KEY: '53a0b9fd23719632a22d2c262a06bb4e', //7839e425f4acbd8e6ff3f907281addca <-- popcornapps key
  COVID_RISK_LEVEL_URL:
    'https://aph.staging.web-patients.popcornapps.com/covid19/cough-scan?utm_source=mobile_app',
  COVID_LATEST_ARTICLES_URL:
    'https://aph.dev.web-patients.popcornapps.com/covid19?utm_source=mobile_app&utm_medium=Webview&utm_campaign=Covid19%20Content',
  CONSULT_COUPON_BASE_URL: 'https://uatvalidcoupon.apollo247.com',
  KAVACH_URL: 'https://www.apollo247.com/covid19/kavach?utm_source=mobile_app&utm_medium=Webview',
};

// QA
const ConfigurationQA = {
  CODE_PUSH_DEPLOYMENT_KEY_ANDROID: '8njVNeiezjGyi0BjIuIWOWm_N3zo2uVb5Z5_B',
  CODE_PUSH_DEPLOYMENT_KEY_IOS: 'IwojMQex0fbTUlvY1ydYzMT5l7hrLrbLy0ciH',
  PAYMENT_GATEWAY_BASE_URL: 'https://aph.staging.pmt.popcornapps.com',
  PAYMENT_GATEWAY_SUCCESS_PATH: '/mob?',
  PAYMENT_GATEWAY_ERROR_PATH: '/mob-error?',
  CONSULT_PG_BASE_URL: 'https://aph.staging.pmt.popcornapps.com',
  CONSULT_PG_SUCCESS_PATH: '/consultpg-success?',
  CONSULT_PG_ERROR_PATH: '/consultpg-error?',
  CONSULT_PG_PENDING_PATH: '/consultpg-pending',
  CONSULT_PG_REDIRECT_PATH: '/consultpg-redirect?',
  DIAGNOSTICS_PG_BASE_URL: 'https://aph.staging.pmt.popcornapps.com',
  DIAGNOSTICS_PG_SUCCESS_PATH: '/diagnostic-pg-success?',
  DIAGNOSTICS_PG_ERROR_PATH: '/diagnostic-pg-error?',
  DIAGNOSTICS_PG_CANCEL_PATH: '/diagnostic-pg-cancel-url',
  MIN_CART_VALUE_FOR_FREE_DELIVERY: 200,
  DELIVERY_CHARGES: 25,
  DIASGNOS_DELIVERY_CHARGES: 0,
  PRAKTISE_API_KEY: 'AFF2F0D8-5320-4E4D-A673-33626CD1C3F2', //'4A8C9CCC-C5A3-11E9-9A19-8C85900A8328',
  PRO_TOKBOX_KEY: '46429002',
  PRO_PUBNUB_PUBLISH: 'pub-c-75e6dc17-2d81-4969-8410-397064dae70e',
  PRO_PUBNUB_SUBSCRIBER: 'sub-c-9cc337b6-e0f4-11e9-8d21-f2f6e193974b',
  DOCUMENT_BASE_URL: 'https://apolloaphstorage.blob.core.windows.net/popaphstorage/popaphstorage/',
  GOOGLE_API_KEY: 'AIzaSyCu4uyf9ln--tU-8V32nnFyfk8GN4koLI0',
  TOP_SPECIALITIES: QA_top6_specailties,
  ...PharmaApiConfig.dev,
  ...appStaticVariables,
  iOS_Version: '2.631',
  Android_Version: '2.631',
  CONDITIONAL_MANAGENET_BASE_URL: 'https://aph.staging.pmt.popcornapps.com',
  BUGSNAG_KEY: '53a0b9fd23719632a22d2c262a06bb4e',
  COVID_RISK_LEVEL_URL:
    'https://aph.staging.web-patients.popcornapps.com/covid19/cough-scan?utm_source=mobile_app',
  COVID_LATEST_ARTICLES_URL:
    'https://aph.staging.web-patients.popcornapps.com/covid19?utm_source=mobile_app&utm_medium=Webview&utm_campaign=Covid19%20Content',
  CONSULT_COUPON_BASE_URL: 'https://uatvalidcoupon.apollo247.com',
  KAVACH_URL: 'https://www.apollo247.com/covid19/kavach?utm_source=mobile_app&utm_medium=Webview',
};

// QA2
const ConfigurationQA2 = {
  CODE_PUSH_DEPLOYMENT_KEY_ANDROID: 'kq-NXsLvHNu_EYzKBlZOuk2vbQKepRdBSndmo',
  CODE_PUSH_DEPLOYMENT_KEY_IOS: 'h6JJUbQWK4JEItmav-kH852x-3pneo4vcZNkg',
  PAYMENT_GATEWAY_BASE_URL: 'https://qapmt.apollo247.com',
  PAYMENT_GATEWAY_SUCCESS_PATH: '/mob?',
  PAYMENT_GATEWAY_ERROR_PATH: '/mob-error?',
  CONSULT_PG_BASE_URL: 'https://qapmt.apollo247.com',
  CONSULT_PG_SUCCESS_PATH: '/consultpg-success?',
  CONSULT_PG_ERROR_PATH: '/consultpg-error?',
  CONSULT_PG_PENDING_PATH: '/consultpg-pending',
  CONSULT_PG_REDIRECT_PATH: '/consultpg-redirect?',
  DIAGNOSTICS_PG_BASE_URL: 'https://qapmt.apollo247.com',
  DIAGNOSTICS_PG_SUCCESS_PATH: '/diagnostic-pg-success?',
  DIAGNOSTICS_PG_ERROR_PATH: '/diagnostic-pg-error?',
  DIAGNOSTICS_PG_CANCEL_PATH: '/diagnostic-pg-cancel-url',
  MIN_CART_VALUE_FOR_FREE_DELIVERY: 200,
  DELIVERY_CHARGES: 25,
  DIASGNOS_DELIVERY_CHARGES: 0,
  PRAKTISE_API_KEY: 'AFF2F0D8-5320-4E4D-A673-33626CD1C3F2', //'4A8C9CCC-C5A3-11E9-9A19-8C85900A8328',
  PRO_TOKBOX_KEY: '46429002',
  PRO_PUBNUB_PUBLISH: 'pub-c-75e6dc17-2d81-4969-8410-397064dae70e',
  PRO_PUBNUB_SUBSCRIBER: 'sub-c-9cc337b6-e0f4-11e9-8d21-f2f6e193974b',
  DOCUMENT_BASE_URL: 'https://apolloaphstorage.blob.core.windows.net/popaphstorage/popaphstorage/',
  GOOGLE_API_KEY: 'AIzaSyCu4uyf9ln--tU-8V32nnFyfk8GN4koLI0',
  TOP_SPECIALITIES: QA_top6_specailties,
  ...PharmaApiConfig.dev,
  ...appStaticVariables,
  iOS_Version: '2.631',
  Android_Version: '2.631',
  CONDITIONAL_MANAGENET_BASE_URL: 'https://aph.staging.pmt.popcornapps.com',
  BUGSNAG_KEY: '53a0b9fd23719632a22d2c262a06bb4e',
  COVID_RISK_LEVEL_URL: 'https://qapatients.apollo247.com/covid19/cough-scan?utm_source=mobile_app',
  COVID_LATEST_ARTICLES_URL:
    'https://qapatients.apollo247.com/covid19?utm_source=mobile_app&utm_medium=Webview&utm_campaign=Covid19%20Content',
  CONSULT_COUPON_BASE_URL: 'https://validcoupon.apollo247.com',
  KAVACH_URL: 'https://www.apollo247.com/covid19/kavach?utm_source=mobile_app&utm_medium=Webview',
};

// staging
const ConfigurationStaging = {
  CODE_PUSH_DEPLOYMENT_KEY_ANDROID: '8njVNeiezjGyi0BjIuIWOWm_N3zo2uVb5Z5_B',
  CODE_PUSH_DEPLOYMENT_KEY_IOS: 'IwojMQex0fbTUlvY1ydYzMT5l7hrLrbLy0ciH',
  PAYMENT_GATEWAY_BASE_URL: 'https://stagingpmt.apollo247.com',
  PAYMENT_GATEWAY_SUCCESS_PATH: '/mob?',
  PAYMENT_GATEWAY_ERROR_PATH: '/mob-error?',
  CONSULT_PG_BASE_URL: 'https://stagingpmt.apollo247.com',
  CONSULT_PG_SUCCESS_PATH: '/consultpg-success?',
  CONSULT_PG_ERROR_PATH: '/consultpg-error?',
  CONSULT_PG_PENDING_PATH: '/consultpg-pending',
  CONSULT_PG_REDIRECT_PATH: '/consultpg-redirect?',
  DIAGNOSTICS_PG_BASE_URL: 'https://stagingpmt.apollo247.com',
  DIAGNOSTICS_PG_SUCCESS_PATH: '/diagnostic-pg-success?',
  DIAGNOSTICS_PG_ERROR_PATH: '/diagnostic-pg-error?',
  DIAGNOSTICS_PG_CANCEL_PATH: '/diagnostic-pg-cancel-url',
  MIN_CART_VALUE_FOR_FREE_DELIVERY: 200,
  DELIVERY_CHARGES: 25,
  DIASGNOS_DELIVERY_CHARGES: 0,
  PRAKTISE_API_KEY: 'AFF2F0D8-5320-4E4D-A673-33626CD1C3F2', //'4A8C9CCC-C5A3-11E9-9A19-8C85900A8328',
  PRO_TOKBOX_KEY: '46429002',
  PRO_PUBNUB_PUBLISH: 'pub-c-75e6dc17-2d81-4969-8410-397064dae70e',
  PRO_PUBNUB_SUBSCRIBER: 'sub-c-9cc337b6-e0f4-11e9-8d21-f2f6e193974b',
  DOCUMENT_BASE_URL: 'https://apolloaphstorage.blob.core.windows.net/popaphstorage/popaphstorage/',
  GOOGLE_API_KEY: 'AIzaSyCu4uyf9ln--tU-8V32nnFyfk8GN4koLI0',
  TOP_SPECIALITIES: QA_top6_specailties,
  ...PharmaApiConfig.dev,
  ...appStaticVariables,
  iOS_Version: '2.613',
  Android_Version: '2.613',
  CONDITIONAL_MANAGENET_BASE_URL: 'https://stagingpmt.apollo247.com',
  BUGSNAG_KEY: '53a0b9fd23719632a22d2c262a06bb4e',
  COVID_RISK_LEVEL_URL: 'https://staging.patients.apollo247.com/covid19/scan?utm_source=mobile_app',
  COVID_LATEST_ARTICLES_URL:
    'https://staging.patients.apollo247.com/covid19?utm_source=mobile_app&utm_medium=Webview&utm_campaign=Covid19%20Content',
  KAVACH_URL: 'https://www.apollo247.com/covid19/kavach?utm_source=mobile_app&utm_medium=Webview',
};
//Production
const ConfigurationProd = {
  CODE_PUSH_DEPLOYMENT_KEY_ANDROID: 'ncBcxm590r0jEGT4BjQFTAW0_rkHKvF5xYUDX',
  CODE_PUSH_DEPLOYMENT_KEY_IOS: 'N9LT5oUoB9DUv394XXz05Tywn3LKgHsugfl3i',
  PAYMENT_GATEWAY_BASE_URL: 'https://pmt.apollo247.com', //PRODUCTION
  PAYMENT_GATEWAY_SUCCESS_PATH: '/mob?',
  PAYMENT_GATEWAY_ERROR_PATH: '/mob-error?',
  CONSULT_PG_BASE_URL: 'https://pmt.apollo247.com',
  CONSULT_PG_SUCCESS_PATH: '/consultpg-success?',
  CONSULT_PG_ERROR_PATH: '/consultpg-error?',
  CONSULT_PG_PENDING_PATH: '/consultpg-pending',
  CONSULT_PG_REDIRECT_PATH: '/consultpg-redirect?',
  DIAGNOSTICS_PG_BASE_URL: 'https://pmt.apollo247.com',
  DIAGNOSTICS_PG_SUCCESS_PATH: '/diagnostic-pg-success?',
  DIAGNOSTICS_PG_ERROR_PATH: '/diagnostic-pg-error?',
  DIAGNOSTICS_PG_CANCEL_PATH: '/diagnostic-pg-cancel-url',
  MIN_CART_VALUE_FOR_FREE_DELIVERY: 200,
  DELIVERY_CHARGES: 25,
  DIASGNOS_DELIVERY_CHARGES: 0,
  PRAKTISE_API_KEY: 'FD7632C8-AF22-4534-91ED-4C197E1662F4', // PRODUCTION
  PRO_TOKBOX_KEY: '46422952', // PRODUCTION
  PRO_PUBNUB_PUBLISH: 'pub-c-e275fde3-09e1-44dd-bc32-5c3d04c3b2ef', // PRODUCTION
  PRO_PUBNUB_SUBSCRIBER: 'sub-c-517dafbc-d955-11e9-aa3a-6edd521294c5', // PRODUCTION
  DOCUMENT_BASE_URL: 'https://prodaphstorage.blob.core.windows.net/prodaphstorage/prodaphstorage/', //Production
  GOOGLE_API_KEY: 'AIzaSyCu4uyf9ln--tU-8V32nnFyfk8GN4koLI0',
  TOP_SPECIALITIES: top6_specailties,
  ...PharmaApiConfig.prod,
  ...appStaticVariables,
  iOS_Version: '2.63',
  Android_Version: '2.63',
  CONDITIONAL_MANAGENET_BASE_URL: 'https://pmt.apollo247.com',
  BUGSNAG_KEY: '53a0b9fd23719632a22d2c262a06bb4e',
  COVID_RISK_LEVEL_URL: 'https://www.apollo247.com/covid19/cough-scan?utm_source=mobile_app',
  COVID_LATEST_ARTICLES_URL:
    'https://www.apollo247.com/covid19?utm_source=mobile_app&utm_medium=Webview&utm_campaign=Covid19%20Content',
  CONSULT_COUPON_BASE_URL: 'https://validcoupon.apollo247.com',
  KAVACH_URL: 'https://www.apollo247.com/covid19/kavach?utm_source=mobile_app&utm_medium=Webview',
};

//PERFORMANCE
const ConfigurationPERFORM = {
  CODE_PUSH_DEPLOYMENT_KEY_ANDROID: '',
  CODE_PUSH_DEPLOYMENT_KEY_IOS: '',
  PAYMENT_GATEWAY_BASE_URL: 'https://aspmt.apollo247.com',
  PAYMENT_GATEWAY_SUCCESS_PATH: '/mob?',
  PAYMENT_GATEWAY_ERROR_PATH: '/mob-error?',
  CONSULT_PG_BASE_URL: 'https://aspmt.apollo247.com',
  CONSULT_PG_SUCCESS_PATH: '/consultpg-success?',
  CONSULT_PG_ERROR_PATH: '/consultpg-error?',
  CONSULT_PG_PENDING_PATH: '/consultpg-pending',
  CONSULT_PG_REDIRECT_PATH: '/consultpg-redirect?',
  DIAGNOSTICS_PG_BASE_URL: 'https://aspmt.apollo247.com',
  DIAGNOSTICS_PG_SUCCESS_PATH: '/diagnostic-pg-success?',
  DIAGNOSTICS_PG_ERROR_PATH: '/diagnostic-pg-error?',
  DIAGNOSTICS_PG_CANCEL_PATH: '/diagnostic-pg-cancel-url',
  MIN_CART_VALUE_FOR_FREE_DELIVERY: 200,
  DELIVERY_CHARGES: 25,
  DIASGNOS_DELIVERY_CHARGES: 0,
  PRAKTISE_API_KEY: 'FD7632C8-AF22-4534-91ED-4C197E1662F4', //'AFF2F0D8-5320-4E4D-A673-33626CD1C3F2', //'4A8C9CCC-C5A3-11E9-9A19-8C85900A8328',
  PRO_TOKBOX_KEY: '46429002',
  PRO_PUBNUB_PUBLISH: 'pub-c-75e6dc17-2d81-4969-8410-397064dae70e',
  PRO_PUBNUB_SUBSCRIBER: 'sub-c-9cc337b6-e0f4-11e9-8d21-f2f6e193974b',
  DOCUMENT_BASE_URL: 'https://apolloaphstorage.blob.core.windows.net/popaphstorage/popaphstorage/',
  GOOGLE_API_KEY: 'AIzaSyCu4uyf9ln--tU-8V32nnFyfk8GN4koLI0',
  TOP_SPECIALITIES: DEV_top6_specailties,
  ...PharmaApiConfig.dev,
  ...appStaticVariables,
  iOS_Version: '1.7',
  Android_Version: '1.83',
  CONDITIONAL_MANAGENET_BASE_URL: 'https://aph.dev.pmt.popcornapps.com',
  BUGSNAG_KEY: '53a0b9fd23719632a22d2c262a06bb4e', //7839e425f4acbd8e6ff3f907281addca <-- popcornapps key
  COVID_RISK_LEVEL_URL:
    'https://aph.staging.web-patients.popcornapps.com/covid19/cough-scan?utm_source=mobile_app',
  COVID_LATEST_ARTICLES_URL:
    'https://aph.staging.web-patients.popcornapps.com/covid19?utm_source=mobile_app&utm_medium=Webview&utm_campaign=Covid19%20Content',
  CONSULT_COUPON_BASE_URL: 'https://uatvalidcoupon.apollo247.com',
  KAVACH_URL: 'https://www.apollo247.com/covid19/kavach?utm_source=mobile_app&utm_medium=Webview',
};

//VAPT
const ConfigurationVAPT = {
  CODE_PUSH_DEPLOYMENT_KEY_ANDROID: '',
  CODE_PUSH_DEPLOYMENT_KEY_IOS: '',
  PAYMENT_GATEWAY_BASE_URL: 'http://aph.vapt.pmt.popcornapps.com',
  PAYMENT_GATEWAY_SUCCESS_PATH: '/mob?',
  PAYMENT_GATEWAY_ERROR_PATH: '/mob-error?',
  CONSULT_PG_BASE_URL: 'http://aph.vapt.pmt.popcornapps.com',
  CONSULT_PG_SUCCESS_PATH: '/consultpg-success?',
  CONSULT_PG_ERROR_PATH: '/consultpg-error?',
  CONSULT_PG_PENDING_PATH: '/consultpg-pending',
  CONSULT_PG_REDIRECT_PATH: '/consultpg-redirect?',
  DIAGNOSTICS_PG_BASE_URL: 'http://aph.vapt.pmt.popcornapps.com',
  DIAGNOSTICS_PG_SUCCESS_PATH: '/diagnostic-pg-success?',
  DIAGNOSTICS_PG_ERROR_PATH: '/diagnostic-pg-error?',
  DIAGNOSTICS_PG_CANCEL_PATH: '/diagnostic-pg-cancel-url',
  MIN_CART_VALUE_FOR_FREE_DELIVERY: 200,
  DELIVERY_CHARGES: 25,
  DIASGNOS_DELIVERY_CHARGES: 0,
  PRAKTISE_API_KEY: 'FD7632C8-AF22-4534-91ED-4C197E1662F4', //'AFF2F0D8-5320-4E4D-A673-33626CD1C3F2', //'4A8C9CCC-C5A3-11E9-9A19-8C85900A8328',
  PRO_TOKBOX_KEY: '46429002',
  PRO_PUBNUB_PUBLISH: 'pub-c-75e6dc17-2d81-4969-8410-397064dae70e',
  PRO_PUBNUB_SUBSCRIBER: 'sub-c-9cc337b6-e0f4-11e9-8d21-f2f6e193974b',
  DOCUMENT_BASE_URL: 'https://apolloaphstorage.blob.core.windows.net/popaphstorage/popaphstorage/',
  GOOGLE_API_KEY: 'AIzaSyCu4uyf9ln--tU-8V32nnFyfk8GN4koLI0',
  TOP_SPECIALITIES: DEV_top6_specailties,
  ...PharmaApiConfig.dev,
  ...appStaticVariables,
  iOS_Version: '2.112',
  Android_Version: '2.112',
  CONDITIONAL_MANAGENET_BASE_URL: 'http://aph.vapt.pmt.popcornapps.com',
  BUGSNAG_KEY: '53a0b9fd23719632a22d2c262a06bb4e', //7839e425f4acbd8e6ff3f907281addca <-- popcornapps key
  COVID_RISK_LEVEL_URL:
    'https://aph.staging.web-patients.popcornapps.com/covid19/cough-scan?utm_source=mobile_app',
  COVID_LATEST_ARTICLES_URL:
    'https://aph.staging.web-patients.popcornapps.com/covid19?utm_source=mobile_app&utm_medium=Webview&utm_campaign=Covid19%20Content',
  CONSULT_COUPON_BASE_URL: 'https://uatvalidcoupon.apollo247.com',
  KAVACH_URL: 'https://www.apollo247.com/covid19/kavach?utm_source=mobile_app&utm_medium=Webview',
};

//DevelopmentReplica
const ConfigurationDevReplica = {
  CODE_PUSH_DEPLOYMENT_KEY_ANDROID: '',
  CODE_PUSH_DEPLOYMENT_KEY_IOS: '',
  PAYMENT_GATEWAY_BASE_URL: 'https://devpmt.apollo247.com',
  PAYMENT_GATEWAY_SUCCESS_PATH: '/mob?',
  PAYMENT_GATEWAY_ERROR_PATH: '/mob-error?',
  CONSULT_PG_BASE_URL: 'https://devpmt.apollo247.com',
  CONSULT_PG_SUCCESS_PATH: '/consultpg-success?',
  CONSULT_PG_ERROR_PATH: '/consultpg-error?',
  CONSULT_PG_PENDING_PATH: '/consultpg-pending',
  CONSULT_PG_REDIRECT_PATH: '/consultpg-redirect?',
  DIAGNOSTICS_PG_BASE_URL: 'https://devpmt.apollo247.com',
  DIAGNOSTICS_PG_SUCCESS_PATH: '/diagnostic-pg-success?',
  DIAGNOSTICS_PG_ERROR_PATH: '/diagnostic-pg-error?',
  DIAGNOSTICS_PG_CANCEL_PATH: '/diagnostic-pg-cancel-url',
  MIN_CART_VALUE_FOR_FREE_DELIVERY: 200,
  DELIVERY_CHARGES: 25,
  DIASGNOS_DELIVERY_CHARGES: 0,
  PRAKTISE_API_KEY: 'AFF2F0D8-5320-4E4D-A673-33626CD1C3F2', //'4A8C9CCC-C5A3-11E9-9A19-8C85900A8328',
  PRO_TOKBOX_KEY: '46429002',
  PRO_PUBNUB_PUBLISH: 'pub-c-75e6dc17-2d81-4969-8410-397064dae70e',
  PRO_PUBNUB_SUBSCRIBER: 'sub-c-9cc337b6-e0f4-11e9-8d21-f2f6e193974b',
  DOCUMENT_BASE_URL: 'https://apolloaphstorage.blob.core.windows.net/popaphstorage/popaphstorage/',
  GOOGLE_API_KEY: 'AIzaSyCu4uyf9ln--tU-8V32nnFyfk8GN4koLI0',
  TOP_SPECIALITIES: QA_top6_specailties,
  ...PharmaApiConfig.dev,
  ...appStaticVariables,
  iOS_Version: '1.811',
  Android_Version: '1.913',
  CONDITIONAL_MANAGENET_BASE_URL: 'https://aph.staging.pmt.popcornapps.com',
  BUGSNAG_KEY: '53a0b9fd23719632a22d2c262a06bb4e', //7839e425f4acbd8e6ff3f907281addca <-- popcornapps key
  COVID_RISK_LEVEL_URL:
    'https://aph.staging.web-patients.popcornapps.com/covid19/cough-scan?utm_source=mobile_app',
  COVID_LATEST_ARTICLES_URL:
    'https://aph.staging.web-patients.popcornapps.com/covid19?utm_source=mobile_app&utm_medium=Webview&utm_campaign=Covid19%20Content',
  CONSULT_COUPON_BASE_URL: 'https://uatvalidcoupon.apollo247.com',
  KAVACH_URL: 'https://www.apollo247.com/covid19/kavach?utm_source=mobile_app&utm_medium=Webview',
};

const Configuration =
  APP_ENV == AppEnv.PROD
    ? ConfigurationProd
    : APP_ENV == AppEnv.QA
    ? ConfigurationQA
    : APP_ENV == AppEnv.QA2
    ? ConfigurationQA2
    : APP_ENV == AppEnv.STAGING
    ? ConfigurationStaging
    : APP_ENV == AppEnv.PERFORM
    ? ConfigurationPERFORM
    : APP_ENV == AppEnv.VAPT
    ? ConfigurationVAPT
    : APP_ENV == AppEnv.DEVReplica
    ? ConfigurationDevReplica
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
      'I want to cancel my medicine order with a refund',
      'The order was successfully placed but medicines not yet delivered',
      'I was not able to make the payment due to technical errors',
      'My money got deducted but no order confirmation received',
      'My order got canceled with no prior notice hence, need the refund',
      'There is a mismatch in the quantity of medicines ordered and delivered',
      'The medicines delivered are not the ones which were ordered by me',
      'The app is crashing/ website is working too slow',
      'The excess amount charged for medicine delivery',
      'Inappropriate attitude or behaviour of delivery staff',
    ],
  },
  {
    category: 'Virtual/Online Consult',
    options: [
      'My doctor is not listed on the platform',
      'There is no slot available for the doctor appointment',
      'The doctor did not start the consultation on time',
      'The doctor did not start the consultation. Want a refund.',
      'My money got deducted but no confirmation on the doctor appointment',
      'I faced technical issues during my appointment ',
      'I want to reschedule/cancel my appointment ',
      'I haven’t received the prescription',
      'Coupon code did not work for booking doctor appointment',
    ],
  },
  {
    category: 'Health Records',
    options: [
      'Add multiple UHID’s linked to other mobile numbers',
      'Delay in responses to queries',
      'Incomplete health records',
      'Issues in downloading the records',
      'No / Wrong UHID',
      'No records available for linked UHID',
      'Personal details are not editable',
      'Unable to see my reports',
      'Unable to add family members',
    ],
  },
  {
    category: 'Physical Consult',
    options: [
      'App appointment dishonored at confirmed time slot',
      'Application issues(bandwidth & payment errors)',
      'Behavior and attitude of the doctor',
      "Can't find doctor’s name in respective list",
      'Delayed prescription',
      'Doctor not available',
      'Long waiting time for physical consult',
      'No past / upcoming consultation details',
      'No updates on delays, reschedules or cancellations of the consult',
      'Payment issues',
      'Require reschedule',
      'Refund required',
      'Discount / Promotions / Voucher issues',
    ],
  },
  {
    category: 'Feedback',
    options: [
      'Feedback on app',
      'Feedback on consultation',
      'Feedback on health records',
      'Feedback on medicine deliver',
    ],
  },
  {
    category: 'Diagnostics',
    options: [
      'Excess amount related',
      'Issues in order confirmation',
      'Payment issues while ordering',
      'Pickup cancelled without any information',
      'Pickup cancelled, no refund',
      'Report not received',
      'Require reschedule',
      'Sample pick up related',
      'Sample pick up staff related',
      'Wrong report received',
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
  APP_ENV,
  Configuration,
  Specialities,
};
