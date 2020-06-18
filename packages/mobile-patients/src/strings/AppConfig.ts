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
  PROD = 'PROD',
  PERFORM = 'PERFORM',
  VAPT = 'VAPT',
  DEVReplica = 'DEVReplica',
}

const APP_ENV: AppEnv = AppEnv.DEV as AppEnv; //Change to AppEnv.(DEV, QA, PROD) for respective API environments in the app. Also don't forget to change src/helpers/apiRoutes.ts

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
  TAT_API_TIMEOUT_IN_SEC: 20,
  PACKAGING_CHARGES: 0,
  MIN_VALUE_TO_NUDGE_USERS_TO_AVAIL_FREE_DELIVERY: 0,
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
      section_key: 'healthareas',
      section_name: 'SHOP BY HEALTH AREAS',
      section_position: '1',
      visible: true,
    },
    {
      section_key: 'deals_of_the_day',
      section_name: 'DEALS OF THE DAY',
      section_position: '2',
      visible: true,
    },
    {
      section_key: 'hot_sellers',
      section_name: 'HOT SELLERS',
      section_position: '3',
      visible: true,
    },
    {
      section_key: 'shop_by_category',
      section_name: 'SHOP BY CATEGORY',
      section_position: '4',
      visible: true,
    },
    {
      section_key: 'monsoon_essentials',
      section_name: 'MONSOON ESSENTIALS',
      section_position: '5',
      visible: true,
    },
    {
      section_key: 'widget_2',
      section_name: 'IMMUNITY BOOSTERS',
      section_position: '6',
      visible: true,
    },
    {
      section_key: 'widget_3',
      section_name: 'BABY CARE',
      section_position: '7',
      visible: true,
    },
    {
      section_key: 'shop_by_brand',
      section_name: 'SHOP BY BRAND',
      section_position: '8',
      visible: true,
    },
  ] as PharmacyHomepageInfo[],
};

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
  LOG_ENVIRONMENT: 'debug',
  ANALYTICAL_ENIVRONMENT: 'debug',
  MEDICINE_PAST_SEARCHES_SHOW_COUNT: 5,
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
  ...PharmaApiConfig.dev,
  ...appStaticVariables,
  iOS_Version: '2.5131',
  Android_Version: '2.5151',
  CONDITIONAL_MANAGENET_BASE_URL: 'https://aph.staging.pmt.popcornapps.com',
  BUGSNAG_KEY: '53a0b9fd23719632a22d2c262a06bb4e', //7839e425f4acbd8e6ff3f907281addca <-- popcornapps key
  COVID_RISK_LEVEL_URL:
    'https://aph.staging.web-patients.popcornapps.com/covid19/scan?utm_source=mobile_app',
  COVID_LATEST_ARTICLES_URL:
    'https://aph.dev.web-patients.popcornapps.com/covid19?utm_source=mobile_app&utm_medium=Webview&utm_campaign=Covid19%20Content',
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
  ...PharmaApiConfig.dev,
  ...appStaticVariables,
  iOS_Version: '2.541',
  Android_Version: '2.541',
  CONDITIONAL_MANAGENET_BASE_URL: 'https://aph.staging.pmt.popcornapps.com',
  BUGSNAG_KEY: '53a0b9fd23719632a22d2c262a06bb4e',
  COVID_RISK_LEVEL_URL:
    'https://aph.staging.web-patients.popcornapps.com/covid19/scan?utm_source=mobile_app',
  COVID_LATEST_ARTICLES_URL:
    'https://aph.staging.web-patients.popcornapps.com/covid19?utm_source=mobile_app&utm_medium=Webview&utm_campaign=Covid19%20Content',
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
  ...PharmaApiConfig.prod,
  ...appStaticVariables,
  iOS_Version: '2.54',
  Android_Version: '2.54',
  CONDITIONAL_MANAGENET_BASE_URL: 'https://pmt.apollo247.com',
  BUGSNAG_KEY: '53a0b9fd23719632a22d2c262a06bb4e',
  COVID_RISK_LEVEL_URL: 'https://www.apollo247.com/covid19/scan?utm_source=mobile_app',
  COVID_LATEST_ARTICLES_URL:
    'https://www.apollo247.com/covid19?utm_source=mobile_app&utm_medium=Webview&utm_campaign=Covid19%20Content',
};

//PERFORMANCE
const ConfigurationPERFORM = {
  LOG_ENVIRONMENT: 'perform',
  ANALYTICAL_ENIVRONMENT: 'perform',
  MEDICINE_PAST_SEARCHES_SHOW_COUNT: 5,
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
  ...PharmaApiConfig.dev,
  ...appStaticVariables,
  iOS_Version: '1.7',
  Android_Version: '1.83',
  CONDITIONAL_MANAGENET_BASE_URL: 'https://aph.dev.pmt.popcornapps.com',
  BUGSNAG_KEY: '53a0b9fd23719632a22d2c262a06bb4e', //7839e425f4acbd8e6ff3f907281addca <-- popcornapps key
  COVID_RISK_LEVEL_URL:
    'https://aph.staging.web-patients.popcornapps.com/covid19/scan?utm_source=mobile_app',
  COVID_LATEST_ARTICLES_URL:
    'https://aph.staging.web-patients.popcornapps.com/covid19?utm_source=mobile_app&utm_medium=Webview&utm_campaign=Covid19%20Content',
};

//VAPT
const ConfigurationVAPT = {
  LOG_ENVIRONMENT: 'VAPT',
  ANALYTICAL_ENIVRONMENT: 'VAPT',
  MEDICINE_PAST_SEARCHES_SHOW_COUNT: 5,
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
  ...PharmaApiConfig.dev,
  ...appStaticVariables,
  iOS_Version: '2.112',
  Android_Version: '2.112',
  CONDITIONAL_MANAGENET_BASE_URL: 'http://aph.vapt.pmt.popcornapps.com',
  BUGSNAG_KEY: '53a0b9fd23719632a22d2c262a06bb4e', //7839e425f4acbd8e6ff3f907281addca <-- popcornapps key
  COVID_RISK_LEVEL_URL:
    'https://aph.staging.web-patients.popcornapps.com/covid19/scan?utm_source=mobile_app',
  COVID_LATEST_ARTICLES_URL:
    'https://aph.staging.web-patients.popcornapps.com/covid19?utm_source=mobile_app&utm_medium=Webview&utm_campaign=Covid19%20Content',
};

//DevelopmentReplica
const ConfigurationDevReplica = {
  LOG_ENVIRONMENT: 'debug',
  ANALYTICAL_ENIVRONMENT: 'debug',
  MEDICINE_PAST_SEARCHES_SHOW_COUNT: 5,
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
  ...PharmaApiConfig.dev,
  ...appStaticVariables,
  iOS_Version: '1.811',
  Android_Version: '1.913',
  CONDITIONAL_MANAGENET_BASE_URL: 'https://aph.staging.pmt.popcornapps.com',
  BUGSNAG_KEY: '53a0b9fd23719632a22d2c262a06bb4e', //7839e425f4acbd8e6ff3f907281addca <-- popcornapps key
  COVID_RISK_LEVEL_URL:
    'https://aph.staging.web-patients.popcornapps.com/covid19/scan?utm_source=mobile_app',
  COVID_LATEST_ARTICLES_URL:
    'https://aph.staging.web-patients.popcornapps.com/covid19?utm_source=mobile_app&utm_medium=Webview&utm_campaign=Covid19%20Content',
};

const Configuration =
  APP_ENV == AppEnv.PROD
    ? ConfigurationProd
    : APP_ENV == AppEnv.QA
    ? ConfigurationQA
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
      'Others',
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
