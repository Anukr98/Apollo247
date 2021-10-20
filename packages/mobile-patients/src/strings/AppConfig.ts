import string from '@aph/mobile-patients/src/strings/strings.json';
import { PharmaStateCodeMapping } from '@aph/mobile-patients/src/strings/PharmaStateCodeMapping';
import DeviceInfo from 'react-native-device-info';
import {
  DIAGNOSTIC_ORDER_STATUS,
  REFUND_STATUSES,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { Platform } from 'react-native';

export enum AppEnv {
  DEV = 'DEV',
  QA = 'QA',
  QA2 = 'QA2',
  QA3 = 'QA3',
  QA4 = 'QA4',
  QA5 = 'QA5',
  PROD = 'PROD',
  PERFORM = 'PERFORM',
  VAPT = 'VAPT',
  DEVReplica = 'DEVReplica',
  QA6 = 'QA6',
}

const APP_ENV: AppEnv = AppEnv.QA5 as AppEnv; // For respective API environments in the app.

const paymentGatewayBaseUrl: string =
  APP_ENV == AppEnv.PROD
    ? 'https://pmt.apollo247.com'
    : APP_ENV == AppEnv.QA
    ? 'https://aph-staging-pmt.apollo247.com'
    : APP_ENV == AppEnv.QA2
    ? 'https://qapmt.apollo247.com'
    : APP_ENV == AppEnv.QA3
    ? 'https://qathreepmt.apollo247.com'
    : APP_ENV == AppEnv.QA4
    ? 'https://qa4pmt.apollo247.com'
    : APP_ENV == AppEnv.QA5
    ? 'https://qa5pmt.apollo247.com'
    : APP_ENV == AppEnv.PERFORM
    ? 'https://perfpmt.apollo247.com'
    : APP_ENV == AppEnv.VAPT
    ? 'https://stagingpmt.apollo247.com'
    : APP_ENV == AppEnv.DEV
    ? 'https://aph-dev-pmt.apollo247.com'
    : APP_ENV == AppEnv.DEVReplica
    ? 'https://devpmt.apollo247.com'
    : APP_ENV == AppEnv.QA6
    ? 'https://qa6pmt.apollo247.com '
    : 'https://aph-staging-pmt.apollo247.com';

const pharmaToken201 = 'Bearer 2o1kd4bjapqifpb27fy7tnbivu8bqo1d';
const pharmaTokenYXV = 'YXV0aF91c2VyOnN1cGVyc2VjcmV0X3Rhd';
const tatTokenDev = 'GWjKtviqHa4r4kiQmcVH';
const tatTokenProd = '8nBs8ucvbqlCGShwDr7oHv0mePqwhE';
const apolloProdBaseUrl = 'https://magento.apollo247.com';
const apolloUatBaseUrl = 'https://uat.apollopharmacy.in';
const tagalysBaseUrl = 'https://api-r1.tagalys.com/v1';
const drupalAuthTokenDev = 'Basic Y29udGVudDp3YWxtYXJ0TlVUdG9reW9IZWlzdA==';
const drupalAuthTokenProd = 'Basic Y29udGVudDp3YWxtYXJ0TlVUdG9reW9IZWlzdA==';

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

const specialOffersWidgetApiCredentials = {
  Username: 'content',
  Password: 'walmartNUTtokyoHeist',
};

const loginSection = {
  bannerUrl: 'https://newassets.apollo247.com/images/banners/FirstTransactionOffer.png',
  mainTitle: 'Why choose Apollo 247?',
  data: [
    {
      title: 'Express Medicine Delivery',
      description: '5 lakh happy customers every day',
      iconUrl: 'https://newassets.apollo247.com/images/onboarding_doorstep.png',
    },
    {
      title: 'Consult with Apollo Doctors',
      description: '7000+ doctors available online in 15 min',
      iconUrl: 'https://newassets.apollo247.com/images/onboarding_anytime.png',
    },
    {
      title: 'Up to 60% off on Medical Checkup',
      description: 'Diagnostic tests starting at 199',
      iconUrl: 'https://newassets.apollo247.com/images/onboarding_healthrecord.png',
    },
  ],
};

const covidVaccineSection = {
  mainTitle: 'For COVID-19 Vaccination related queries',
  data: [
    {
      title: 'Vaccine Related Link',
      url: 'https://www.apollo247.com/specialties/vaccine-related-consult',
      iconPath: 'https://newassets.apollo247.com/images/vaccineTracker.png',
      reverse: true,
    },
    {
      title: 'Vaccine Queries',
      url: 'https://www.apollo247.com/specialties/vaccine-related-consult',
      iconPath: 'https://newassets.apollo247.com/images/vaccineTracker.png',
      reverse: false,
    },
    {
      title: 'Chat With Us',
      url: 'https://www.apollo247.com/chat/chat-bot-vaccine.html',
      iconPath: 'https://newassets.apollo247.com/images/vaccineTracker.png',
      reverse: false,
    },
    {
      title: 'FAQs & Articles',
      url: 'https://www.apollo247.com/blog/covid19-vaccines',
      iconPath: 'https://newassets.apollo247.com/images/vaccineTracker.png',
      reverse: false,
    },
  ],
};

const QA_covid_items = [2596, 2598, 2462, 2388, 2419, 2411, 2410, 2539, 2446, 2614, 2462, 2613];
const Prod_covid_items = [2539, 2446, 2410, 2411, 2419, 2613];
const covidMaxSlotDays = 7;
const nonCovidMaxSlotDays = 4;
const QA_DIABETES_MGMT_CM_KEY = '7729FD68-C552-4C90-B31E-98AA6C84FEBF~247Android';
const Prod_DIABETES_MGMT_CM_KEY = '4d4efe1a-cec8-4647-939f-09c25492721e~Apollo247';
const QA_PROHEALTH_MGMT_CM_KEY = '85bb5f00-5f45-464b-8965-1f0a7e331d29~AskApolloAndroid';
const Prod_PROHEALTH_MGMT_CM_KEY = '85bb5f00-5f45-464b-8965-1f0a7e331d29~AskApolloAndroid';

const appStaticVariables = {
  iOS_Version: DeviceInfo.getVersion(),
  Android_Version: DeviceInfo.getVersion(),
  ENABLE_CONDITIONAL_MANAGEMENT: true,
  MED_DELIVERY_DATE_API_FORMAT: 'DD-MMM-YYYY hh:mm',
  MED_DELIVERY_DATE_TAT_API_FORMAT: 'DD-MMM-YYYY hh:mm A',
  MED_DELIVERY_DATE_DISPLAY_FORMAT: 'D MMM YYYY | hh:mm A',
  TAT_API_RESPONSE_DATE_FORMAT: 'DD-MMM-YYYY HH:mm',
  CASESHEET_PRESCRIPTION_DATE_FORMAT: 'DD MMM YYYY',
  CASESHEET_PRESCRIPTION_TIME_FORMAT: 'hh:mm A',
  TAT_UNSERVICEABLE_DAY_COUNT: 10, // no. of days upto which cart item is considered as serviceable
  TAT_API_TIMEOUT_IN_SEC: 10,
  DOCTOR_PARTNER_TEXT: 'Doctor Partners',
  MIN_VALUE_TO_NUDGE_USERS_TO_AVAIL_FREE_DELIVERY: 0,
  CART_UPDATE_PRICE_CONFIG: {
    updatePrices: 'ByPercentage' as 'Yes' | 'No' | 'ByPercentage',
    percentage: 30,
  },
  EXOTEL_CALL_API_URL:
    'https://157e9636faf8c1b7296a749deb8789fa84314b27598eb7a9:82ac24fd451cbf85373a4ea90f083c9d321040ee9c3d26ed@api.exotel.com/v1/Accounts/apollo2471/Calls/connect.json',
  EXOTEL_CALLER_ID: '04049171522',
  HOME_SCREEN_COVID_HEADER_TEXT: string.common.covidHeading,
  HOME_SCREEN_COVID_CONTACT_TEXT: string.common.covidContactText,
  HOME_SCREEN_COVIDSCAN_BANNER_TEXT: string.common.covidScanBannerText,
  CRYPTO_SECRET_KEY: 'z2iQxQAuyLC0j2GNryyZ2JuGLTQyT0mK',
  PHARMA_STATE_CODE_MAPPING: PharmaStateCodeMapping,
  CART_ITEM_MAX_QUANTITY: 10, // max. allowed qty to add to cart
  HOME_SCREEN_KAVACH_TEXT: string.common.KavachText,
  MED_ORDERS_CUSTOMER_CARE_WHATSAPP_LINK: 'https://bit.ly/apollo247medicines',
  MED_TRACK_SHIPMENT_URL: 'https://www.delhivery.com/track/#package/{{shipmentNumber}}',
  COVID_VACCINE_TRACKER_URL: 'https://www.apollo247.com/covid-vaccine-tracker',
  CHAT_WITH_US: 'https://www.apollo247.com/chat/chat-bot-vaccine.html',
  Doctors_Page_Size: 25,
  CUSTOMER_CARE_HELP_TEXT: string.common.customerCareHelpText,
  CUSTOMER_CARE_NUMBER: string.common.customerCareNumber,
  CIRCLE_PLAN_ID: 'CIRCLEPlan',
  CIRCLE_STATIC_MONTHLY_SAVINGS: '848',
  PRODUCT_SUGGESTIONS_COUNT: 15,
  HELP_SECTION_CUSTOM_QUERIES: {
    pharmacy: '5df80ade-4eba-4ad3-9caf-e1169fcaeb32',
    consult: 'd70e6ee8-ecf1-4c75-ae00-2f968641f260',
    returnOrder: 'e2fc95ff-3ef5-4a9d-8fed-31609e426cbc',
    diagnostic: '6ce8d555-9be5-48b5-b4de-06480f9c9cab',
    deliveryStatus: '3df5b586-ce39-478a-a5ec-1e525f5dc42a',
    vaccination: 'd73f3dc4-bc92-11eb-8529-0242ac130003',
    refund: '9ae4ad26-f559-4350-b81d-8f751be8e33b',
  },
  MED_ORDER_NON_CART_CALL_ME_OPTION_WHATSAPP_LINK:
    'https://api.whatsapp.com/send?phone=914041894343&text=I%20want%20to%20inform%20the%20pharmacist%20regarding%20my%20medicines',
  MED_ORDER_ON_HOLD_ORDER_WHATSAPP_LINK:
    'https://api.whatsapp.com/send?phone=914041894343&text=On-hold%20order:%20I%20want%20to%20chat%20with%20the%20pharmacist',
  MED_ORDER_POST_ORDER_VERIFICATION_WHATSAPP_LINK:
    'https://api.whatsapp.com/send?phone=914041894343&text=I%20have%20a%20query%20regarding%20the%20items%20in%20my%20verified%20order',
  SUBSCRIPTION_PG_SUCCESS: '/subscriptionpg-success?',
  clientId: Platform.OS == 'android' ? 'apollo247_android' : 'apollo247_ios',
  merchantId: 'apollo247',
  jusPayService: 'in.juspay.ec',
  returnUrl: 'https://www.apollo247.com',
  jusPaybaseUrl: 'https://api.juspay.in/cardbins',
  HdfcHealthLifeText: string.common.HdfcHealthLifeText,
  CorporateMembershipText: string.common.CorporateMembershipText,
  EXPRESS_MAXIMUM_HOURS: 6,
  PACKAGING_CHARGES: 0,
  MIN_CART_VALUE_FOR_FREE_PACKAGING: 300,
  COVID_UPDATES: 'https://www.apollo247.com/blog/covid19-vaccines',
  APOLLO_TERMS_CONDITIONS: 'https://www.apollo247.com/terms?isMobile=true',
  APOLLO_PRIVACY_POLICY: 'https://www.apollo247.com/privacy?isMobile=true',
  LOGIN_SECTION: loginSection,
  COVID_VACCINE_SECTION: covidVaccineSection,
  CART_PRESCRIPTION_OPTIONS: [
    {
      id: 'havePrescription',
      title: 'I have a Prescription',
      visible: true,
    },
    {
      id: 'sharePrescriptionLater',
      title: 'Share Prescription later',
      visible: true,
    },
    {
      id: 'noPrescriptionDoConsult',
      title: 'I don’t have a Prescription',
      visible: true,
    },
  ],
  FollowUp_Chat_Limit: 4,
  Covid_Items: QA_covid_items,
  Covid_Max_Slot_Days: covidMaxSlotDays,
  Non_Covid_Max_Slot_Days: nonCovidMaxSlotDays,
  QA_DIABETES_MGMT_HashKey: QA_DIABETES_MGMT_CM_KEY,
  QA_PROHEALTH_MGMT_HashKey: QA_PROHEALTH_MGMT_CM_KEY,
  Prod_DIABETES_MGMT_HashKey: Prod_DIABETES_MGMT_CM_KEY,
  Prod_PROHEALTH_MGMT_HashKey: Prod_PROHEALTH_MGMT_CM_KEY,
  DIABETES_MGMT_CM_PROGRAM_ID: 'diabetes_24_7',
  PROHEALTH_MGMT_CM_PROGRAM_ID: 'prohealth',
  Health_Credit_Expiration_Time: 60, //default health credit expiration time 60 mins
  Reopen_Help_Max_Time: 24, // hrs
  Helpdesk_Chat_Confim_Msg:
    'Thank you for reaching out. As we are experiencing a heavy load, our team will get back to you in 24 to 48 hours.',
  Used_Up_Alotted_Slot_Msg:
    'Sorry! You have used up all your allotted booking slots under corporate vaccination. You can still continue to book payable slots under pay by self option.',
  Vaccination_Cities_List: ['Delhi', 'Mumbai'],
  Vaccine_Type: ['Covaxin', 'Covishield'],
  Cancel_Threshold_Pre_Vaccination: 12, //hrs
  Enable_Diagnostics_COD: true,
  Enable_Diagnostics_Cancellation_Policy: false,
  Diagnostics_Cancel_Policy_Text_Msg:
    'For a full refund, you must cancel at least 6 hours before the appointment time. Cancellations made within 6 hours of appointment time will incur a fee of up to ₹ 200.',
  RTPCR_Google_Form:
    'https://docs.google.com/forms/d/e/1FAIpQLSd6VaqQ0GTQOdpBYMyh-wZwv8HHrr3W1Q_XCVSaooHXQGVsJQ/viewform',
  MaxCallRetryAttempt: 5,
  DIAGNOSTIC_DEFAULT_CITYID: 9,
  Enable_Diagnostics_Prepaid: true,
  DIAGNOSTICS_CITY_LEVEL_PAYMENT_OPTION: [
    {
      cityId: '9',
      prepaid: false,
      cod: true,
    },
    {
      cityId: '287',
      prepaid: false,
      cod: true,
    },
  ],
  DIAGNOSTIC_DEFAULT_ICON: 'https://newassets.apollo247.com/organs/ic_blood.png',
  DIAGNOSTIC_DEFAULT_LOCATION: {
    displayName: 'Hyderabad',
    latitude: 17.3202127,
    longitude: 78.4020322,
    area: '',
    city: 'Hyderabad',
    state: 'Telangana',
    stateCode: 'TG',
    country: 'India',
    pincode: '500030',
  },
  DEFAULT_ITEM_SELECTION_FLAG: true,
  Diagnostics_Help_NonOrder_Queries: [
    '96b606f4-dd13-46ff-8bce-85315efee053',
    '78c2dc50-dc16-44c6-bd2d-d4b14c97b521',
    '10788a46-512c-41c0-8c59-e31ff7eebbe4',
  ],
  DEFAULT_PHELBO_ETA: 45,
  MAX_PATIENT_SELECTION: 6,
  CIRCLE_PLAN_PRESELECTED: false,
  CIRCLE_FACTS:
    '<b>#CircleFact:</b> On an average Circle members <b>save upto ₹400 every month</b>',
  enableCredWebView: false,
  DIAGNOSTICS_REPORT_TAT_BREACH_TEXT: "Reports are delayed by a few hours, but should be available any time soon.",
  TrueCaller_Login_Enabled: false,
  DIAGNOSTICS_NO_CIRCLE_SAVINGS_TEXT : 'Extra 15% off on lab tests and cashback on medicine orders',
  DIAGNOSTICS_CITY_LEVEL_CALL_TO_ORDER : {
    "ctaDetailsOnCityId": [
      {
        "ctaCityId": "9",
        "ctaProductPageArray": ["HOME","TESTLISTING","TESTCART","TESTDETAIL"],
        "ctaDelaySeconds": 0,
        "ctaPhoneNumber": "040-4821-3009"
      }
    ],
    "ctaDetailsDefault": {
      "ctaProductPageArray": ["HOME","TESTLISTING","TESTCART","TESTDETAIL"],
      "ctaDelaySeconds": 3,
      "ctaPhoneNumber": "040-4821-3322"
    }
  }
};

const DEV_top_specialties = [
  {
    speciality_id: '4145727e-e3a4-4219-814b-d0f10df9b2f1',
    speciality_order: '1',
    speciality_name: 'General Physician/ Internal Medicine',
    gender: 'UNISEX',
  },
  {
    speciality_id: 'bf0cc02f-1422-45e6-86ee-4ab2b35ffc02',
    speciality_order: '6',
    speciality_name: 'Cardiology',
    gender: 'UNISEX',
  },
  {
    speciality_id: '3ea4faf5-05b2-4c58-8e00-f6ee71f4eb7d',
    speciality_order: '7',
    speciality_name: 'Gastroenterology/ GI Medicine',
    gender: 'UNISEX',
  },
  {
    speciality_id: 'e3ede210-b0bb-4100-919d-2086afdbe89e',
    speciality_order: '4',
    speciality_name: 'Dermatology',
    gender: 'UNISEX',
  },
  {
    speciality_id: '22bd8220-327c-433f-a112-2a2f89216859',
    speciality_order: '2',
    speciality_name: 'Obstetrics & Gynaecology',
    gender: 'FEMALE',
  },
  {
    speciality_id: '0735146e-bd51-4b7c-b7a1-234efc1b259d',
    speciality_order: '5',
    speciality_name: 'Paediatrics',
    gender: 'UNISEX',
  },
  {
    speciality_id: '03457e8f-d8e2-4647-ae7a-16028f754df8',
    speciality_order: '3',
    speciality_name: 'Urology',
    gender: 'MALE',
  },
];

const QA_top_specialties = [
  {
    speciality_id: '4145727e-e3a4-4219-814b-d0f10df9b2f1',
    speciality_order: '1',
    speciality_name: 'General Physician/ Internal Medicine',
    gender: 'UNISEX',
  },
  {
    speciality_id: 'bf0cc02f-1422-45e6-86ee-4ab2b35ffc02',
    speciality_order: '6',
    speciality_name: 'Cardiology',
    gender: 'UNISEX',
  },
  {
    speciality_id: '3ea4faf5-05b2-4c58-8e00-f6ee71f4eb7d',
    speciality_order: '7',
    speciality_name: 'Gastroenterology/ GI Medicine',
    gender: 'UNISEX',
  },
  {
    speciality_id: 'e3ede210-b0bb-4100-919d-2086afdbe89e',
    speciality_order: '5',
    speciality_name: 'Dermatology',
    gender: 'UNISEX',
  },
  {
    speciality_id: '22bd8220-327c-433f-a112-2a2f89216859',
    speciality_order: '2',
    speciality_name: 'Obstetrics & Gynaecology',
    gender: 'FEMALE',
  },
  {
    speciality_id: '0735146e-bd51-4b7c-b7a1-234efc1b259d',
    speciality_order: '4',
    speciality_name: 'Paediatrics',
    gender: 'UNISEX',
  },
  {
    speciality_id: '03457e8f-d8e2-4647-ae7a-16028f754df8',
    speciality_order: '3',
    speciality_name: 'Urology',
    gender: 'MALE',
  },
];

const top_specialties = [
  {
    speciality_id: '615ebc75-4172-4f46-9ba0-b3688c053fcc',
    speciality_order: '1',
    speciality_name: 'General Physician/ Internal Medicine',
    gender: 'UNISEX',
  },
  {
    speciality_id: 'f325ede7-8710-49a6-b0ea-32ddc06f2b4c',
    speciality_order: '6',
    speciality_name: 'Cardiology',
    gender: 'UNISEX',
  },
  {
    speciality_id: '789b2a65-1d81-4023-92c8-39959ca8a7ed',
    speciality_order: '7',
    speciality_name: 'Gastroenterology/ GI Medicine',
    gender: 'UNISEX',
  },
  {
    speciality_id: '73dae7a6-ec1f-45c4-98bd-0c8acb6e4eca',
    speciality_order: '4',
    speciality_name: 'Dermatology',
    gender: 'UNISEX',
  },
  {
    speciality_id: 'd67d4978-a14a-46c8-8af8-697823bfcadf',
    speciality_order: '2',
    speciality_name: 'Obstetrics & Gynaecology',
    gender: 'FEMALE',
  },
  {
    speciality_id: '1f110338-87d5-430c-b10a-8b3eddd54732',
    speciality_order: '5',
    speciality_name: 'Paediatrics',
    gender: 'UNISEX',
  },
  {
    speciality_id: 'd188a910-996b-4478-b014-72a8ec54312e',
    speciality_order: '3',
    speciality_name: 'Urology',
    gender: 'MALE',
  },
];

export const updateAppConfig = (key: keyof typeof Configuration, value: object) => {
  Configuration[key] = value as never;
};

const Apollo247Config = {
  dev: {
    UATTAT_CONFIG: ['https://uattat.apollo247.com', tatTokenDev],
    DRUPAL_CONFIG: ['https://uatcms.apollo247.com/api', drupalAuthTokenDev],
  },
  prod: {
    UATTAT_CONFIG: ['https://tat.apollo247.com', tatTokenProd],
    DRUPAL_CONFIG: ['https://cms.apollo247.com/api', drupalAuthTokenProd],
  },
};

const ServiceabiltyAvailabilityConfig = {
  dev: {
    SERVICEABLE_CONFIG: ['https://serviceabilty.apollo247.com/pincode', tatTokenProd],
    AVAILABILITY_CONFIG: ['https://uatavail.apollo247.com', tatTokenDev],
  },
  prod: {
    SERVICEABLE_CONFIG: ['https://serviceabilty.apollo247.com/pincode', tatTokenProd],
    AVAILABILITY_CONFIG: ['https://avail.apollo247.com', tatTokenProd],
  },
};

export const ReturnOrderSubReason = [
  {
    subReasonID: 1,
    subReason: 'Damaged Items',
  },
  {
    subReasonID: 2,
    subReason: 'Wrong Items were delivered',
  },
  {
    subReasonID: 3,
    subReason: 'Wrong quantity received',
  },
  {
    subReasonID: 4,
    subReason: 'Items are near expiry date',
  },
  {
    subReasonID: 5,
    subReason: 'Other issues',
  },
];

const PharmaApiConfig = {
  dev: {
    TRACK_EVENT: [`${tagalysBaseUrl}/analytics/events/track`],
    MED_SEARCH: [`${apolloProdBaseUrl}/popcsrchprd_api.php`, pharmaToken201],
    GET_SKU: [`${apolloUatBaseUrl}/popcsrchsku_api.php`, pharmaToken201],
    MED_DETAIL: [apolloProdBaseUrl, pharmaToken201],
    MED_SEARCH_SUGGESTION: [`${apolloProdBaseUrl}/popcsrchss_api.php`, pharmaToken201],
    STORES_LIST: [apolloUatBaseUrl, pharmaToken201],
    GET_STORE_INVENTORY: [
      `https://online.apollopharmacy.org/TAT/Apollo/GetStoreInventory`,
      pharmaTokenYXV,
    ],
    PIN_SERVICEABILITY: [apolloProdBaseUrl, pharmaToken201],
    MED_CART_ITEMS_DETAILS: [`${apolloUatBaseUrl}/popcscrchcart_api.php`, pharmaToken201],
    IMAGES_BASE_URL: [`https://newassets.apollo247.com/pub/media`],
    SPECIAL_OFFERS_IMAGES_BASE_URL: [`https://newassets.apollo247.com/pub/media`],
    COUPON_IMAGES_BASE_URL: [`https://newassets.apollo247.com`],
    GET_DELIVERY_TIME: [
      'http://online.apollopharmacy.org:8085/IEngine/webresources/Inventory/getDeliveryTimePartial',
      pharmaTokenYXV,
    ],
    GET_DELIVERY_TIME_HEADER_TAT: [
      'https://online.apollopharmacy.org/UATTAT/Apollo/GetHeaderTat',
      pharmaTokenYXV,
    ],
    GET_SUBSTITUTES: [`${apolloUatBaseUrl}/popcsrchprdsubt_api.php`, pharmaToken201],
    PRODUCTS_BY_CATEGORY: [`${apolloProdBaseUrl}/categoryproducts_api.php`, pharmaToken201],
    MEDICINE_PAGE: [`${apolloUatBaseUrl}/apollo_24x7_api.php?version=v2`, pharmaToken201],
    BOUGHT_TOGETHER: [`${apolloUatBaseUrl}/popsrchboughttogether_api.php`, pharmaToken201],
    SPECIAL_OFFERS_PAGE_WIDGETS: [
      'https://uatcms.apollo247.com/api/special-offer/getwidget',
      specialOffersWidgetApiCredentials,
    ],
    SPECIAL_OFFERS_PAGE_COUPONS: ['https://uatvalidcoupon.apollo247.com/offers'],
    SPECIAL_OFFERS_CATEGORY: [`${apolloUatBaseUrl}/specialoffercategory_api.php`, pharmaToken201],
    SPECIAL_OFFERS_BRANDS: [`${apolloUatBaseUrl}/specialofferbrand_api.php`, pharmaToken201],
    SPECIAL_OFFERS_BRANDS_PRODUCTS: [
      `${apolloUatBaseUrl}/popcsrchspecialoffer_api.php`,
      pharmaToken201,
    ],
    ALL_BRANDS: [`${apolloUatBaseUrl}/allbrands_api.php`, pharmaToken201],
    GET_TEST_PACKAGES: [
      `http://uatlims.apollohl.in/ApolloLive/AskApollo.aspx?cmd=getpackagedata`,
      testApiCredentialsDev,
    ],
    GET_PACKAGE_DATA: [
      // `http://uatlims.apollohl.in/ApolloLive/AskApollo.aspx?cmd=getpackagedetail`
      `https://report.apollodiagnostics.in/Apollo/AskApollo.aspx?cmd=getpackagedetail`,
    ],
    PRODUCT_SUGGESTIONS_CATEGORYID: '41920',
    SPECIAL_OFFERS_CATEGORY_ID: '42372',
    MIN_CART_VALUE_FOR_FREE_DELIVERY: 300,
    DELIVERY_CHARGES: 50,
    pharmaMerchantId: 'apollopharm' /*  pharma merchantId staging - apollopharm */,
    assetsBaseurl: 'https://newassets-test.apollo247.com/files',
    CIRCLE_PLAN_PRESELECTED: false,
  },
  prod: {
    TRACK_EVENT: [`${tagalysBaseUrl}/analytics/events/track`],
    MED_SEARCH: [`${apolloProdBaseUrl}/popcsrchprd_api.php`, pharmaToken201],
    GET_SKU: [`${apolloProdBaseUrl}/popcsrchsku_api.php`, pharmaToken201],
    MED_DETAIL: [apolloProdBaseUrl, pharmaToken201],
    MED_SEARCH_SUGGESTION: [`${apolloProdBaseUrl}/popcsrchss_api.php`, pharmaToken201],
    STORES_LIST: [apolloProdBaseUrl, pharmaToken201],
    GET_STORE_INVENTORY: [
      `https://online.apollopharmacy.org/TAT/Apollo/GetStoreInventory`,
      pharmaTokenYXV,
    ],
    PIN_SERVICEABILITY: [apolloProdBaseUrl, pharmaToken201],
    MED_CART_ITEMS_DETAILS: [`${apolloProdBaseUrl}/popcscrchcart_api.php`, pharmaToken201],
    IMAGES_BASE_URL: [`https://newassets.apollo247.com/pub/media`],
    SPECIAL_OFFERS_IMAGES_BASE_URL: [`https://newassets.apollo247.com/pub/media`],
    COUPON_IMAGES_BASE_URL: [`https://newassets.apollo247.com`],
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
    MEDICINE_PAGE: [`${apolloProdBaseUrl}/apollo_24x7_api.php?version=v2`, pharmaToken201],
    BOUGHT_TOGETHER: [`${apolloProdBaseUrl}/popsrchboughttogether_api.php`, pharmaToken201],
    SPECIAL_OFFERS_PAGE_WIDGETS: [
      'https://cms.apollo247.com/api/special-offer/getwidget',
      specialOffersWidgetApiCredentials,
    ],
    SPECIAL_OFFERS_PAGE_COUPONS: ['https://validcoupon.apollo247.com/offers'],
    SPECIAL_OFFERS_CATEGORY: [`${apolloProdBaseUrl}/specialoffercategory_api.php`, pharmaToken201],
    SPECIAL_OFFERS_BRANDS: [`${apolloProdBaseUrl}/specialofferbrand_api.php`, pharmaToken201],
    SPECIAL_OFFERS_BRANDS_PRODUCTS: [
      `${apolloProdBaseUrl}/popcsrchspecialoffer_api.php`,
      pharmaToken201,
    ],
    ALL_BRANDS: [`${apolloProdBaseUrl}/allbrands_api.php`, pharmaToken201],
    GET_TEST_PACKAGES: [
      `https://report.apollodiagnostics.in/Apollo/AskApollo.aspx?cmd=getpackagedata`,
      testApiCredentialsProd,
    ],
    GET_PACKAGE_DATA: [
      `https://report.apollodiagnostics.in/Apollo/AskApollo.aspx?cmd=getpackagedetail`,
    ],
    PRODUCT_SUGGESTIONS_CATEGORYID: '2252',
    SPECIAL_OFFERS_CATEGORY_ID: '2255',
    MIN_CART_VALUE_FOR_FREE_DELIVERY: 300,
    DELIVERY_CHARGES: 50,
    pharmaMerchantId: 'apollo_hospitals' /*  pharma merchantId prod - apollo_hospitals */,
    assetsBaseurl: 'https://newassets.apollo247.com/files',
    CIRCLE_PLAN_PRESELECTED: false,
  },
};

//Development;
const ConfigurationDev = {
  TAGALYS_API_KEY: '050343bfa6dae87212fd64ee7809c2c8',
  TAGALYS_CLIENT_CODE: 'A029C7273776C78A',
  CODE_PUSH_DEPLOYMENT_KEY_ANDROID: 'ztcR3MB6vWyWtIAzpnsOczanc57pCQeMAIhUS',
  CODE_PUSH_DEPLOYMENT_KEY_IOS: 't1yzL4Cj0zDKiAUuKVZt_zIYuwHrleGaNVihE',
  PAYMENT_GATEWAY_BASE_URL: paymentGatewayBaseUrl,
  PAYMENT_GATEWAY_SUCCESS_PATH: '/mob?',
  PAYMENT_GATEWAY_ERROR_PATH: '/mob-error?',
  CONSULT_PG_BASE_URL: paymentGatewayBaseUrl,
  CONSULT_PG_SUCCESS_PATH: '/consultpg-success',
  CONSULT_PG_ERROR_PATH: '/consultpg-error',
  CONSULT_PG_PENDING_PATH: '/consultpg-pending',
  CONSULT_PG_REDIRECT_PATH: '/consultpg-redirect?',
  DIAGNOSTICS_PG_BASE_URL: paymentGatewayBaseUrl,
  DIAGNOSTICS_PG_SUCCESS_PATH: '/diagnostic-pg-success?',
  DIAGNOSTICS_PG_ERROR_PATH: '/diagnostic-pg-error?',
  DIAGNOSTICS_PG_CANCEL_PATH: '/diagnostic-pg-cancel-url',
  DIASGNOS_DELIVERY_CHARGES: 0,
  PRAKTISE_API_KEY: 'AFF2F0D8-5320-4E4D-A673-33626CD1C3F2', //'4A8C9CCC-C5A3-11E9-9A19-8C85900A8328',
  PRO_TOKBOX_KEY: '46429002',
  PRO_PUBNUB_PUBLISH: 'pub-c-75e6dc17-2d81-4969-8410-397064dae70e',
  PRO_PUBNUB_SUBSCRIBER: 'sub-c-9cc337b6-e0f4-11e9-8d21-f2f6e193974b',
  DOCUMENT_BASE_URL: 'https://devaphstorage.blob.core.windows.net/popaphstorage/popaphstorage/',
  GOOGLE_API_KEY: 'AIzaSyCu4uyf9ln--tU-8V32nnFyfk8GN4koLI0',
  TOP_SPECIALITIES: DEV_top_specialties,
  ...PharmaApiConfig.dev,
  ...appStaticVariables,
  ...Apollo247Config.dev,
  ...ServiceabiltyAvailabilityConfig.dev,
  RETURN_ORDER_SUB_REASON: ReturnOrderSubReason,
  CONDITIONAL_MANAGENET_BASE_URL: paymentGatewayBaseUrl,
  COVID_RISK_LEVEL_URL: 'https://www.apollo247.com/covid19/cough-scan?utm_source=mobile_app',
  COVID_LATEST_ARTICLES_URL:
    'https://aph-dev-web-patients.apollo247.com/covid19?utm_source=mobile_app&utm_medium=Webview&utm_campaign=Covid19%20Content',
  CONSULT_COUPON_BASE_URL: 'https://uatvalidcoupon.apollo247.com',
  KAVACH_URL: 'https://www.apollo247.com/covid19/kavach?utm_source=mobile_app&utm_medium=Webview',
  SYMPTOM_TRACKER: 'https://sympai.apollo247.com/api/v1/chatbot',
  COVID_VACCINE_TRACKER_URL: 'https://www.apollo247.com/covid-vaccine-tracker',
  BLOG_URL: 'https://www.apollo247.com/blog',
  CIRCLE_CONSULT_URL: 'https://aph-staging-web-patients.apollo247.com/consult-landing?header=false',
  CIRLCE_PHARMA_URL: 'https://aph-staging-web-patients.apollo247.com/pharma-landing?header=false',
  CIRCLE_TEST_URL: 'https://aph-staging-web-patients.apollo247.com/test-landing?header=false',
  CIRCLE_LANDING_URL: 'https://aph-staging-web-patients.apollo247.com/circle?header=false',
  APOLLO_PRO_HEALTH_URL:
    'https://www.apollo247.com/apollo-pro-health?utm_source=mobile_app&utm_medium=Webview&utm_campaign=Apollo%20Pro%20Health%20Content',
  HDFC_HEALTHY_LIFE_URL: 'https://www.apollo247.com/partners/hdfc',
  PROCEDURE_SYMPTOMS_SEARCH_URL: 'https://sympai.apollo247.com/api/v1/clinicalsearch',
  jusPayenvironment: 'sandbox',
  Covid_Items: QA_covid_items,
  CONDITIONAL_MANAGEMENT_PROHEALTH_BASE_URL: 'https://auth.play.vitacloud.io',
  PROHEALTH_BOOKING_URL: 'https://aph-staging-web-patients.apollo247.com/apollo-prohealth',
  baseUrl: 'https://aph-staging-web-patients.apollo247.com',
  CIRCLE_PLAN_PRESELECTED: false,
  PROHEALTH_BANNER_IMAGE : "https://newassets-test.apollo247.com/images/banners/ProHealthAppLanding.jpg",
};

// QA
const ConfigurationQA = {
  TAGALYS_API_KEY: '050343bfa6dae87212fd64ee7809c2c8',
  TAGALYS_CLIENT_CODE: 'A029C7273776C78A',
  CODE_PUSH_DEPLOYMENT_KEY_ANDROID: '8njVNeiezjGyi0BjIuIWOWm_N3zo2uVb5Z5_B',
  CODE_PUSH_DEPLOYMENT_KEY_IOS: 'IwojMQex0fbTUlvY1ydYzMT5l7hrLrbLy0ciH',
  PAYMENT_GATEWAY_BASE_URL: paymentGatewayBaseUrl,
  PAYMENT_GATEWAY_SUCCESS_PATH: '/mob?',
  PAYMENT_GATEWAY_ERROR_PATH: '/mob-error?',
  CONSULT_PG_BASE_URL: paymentGatewayBaseUrl,
  CONSULT_PG_SUCCESS_PATH: '/consultpg-success?',
  CONSULT_PG_ERROR_PATH: '/consultpg-error?',
  CONSULT_PG_PENDING_PATH: '/consultpg-pending',
  CONSULT_PG_REDIRECT_PATH: '/consultpg-redirect?',
  DIAGNOSTICS_PG_BASE_URL: paymentGatewayBaseUrl,
  DIAGNOSTICS_PG_SUCCESS_PATH: '/diagnostic-pg-success?',
  DIAGNOSTICS_PG_ERROR_PATH: '/diagnostic-pg-error?',
  DIAGNOSTICS_PG_CANCEL_PATH: '/diagnostic-pg-cancel-url',
  DIASGNOS_DELIVERY_CHARGES: 0,
  PHR_BASE_URL: 'https://ora.phrdemo.com/data',
  PRAKTISE_API_KEY: 'AFF2F0D8-5320-4E4D-A673-33626CD1C3F2', //'4A8C9CCC-C5A3-11E9-9A19-8C85900A8328',
  PRO_TOKBOX_KEY: '46429002',
  PRO_PUBNUB_PUBLISH: 'pub-c-75e6dc17-2d81-4969-8410-397064dae70e',
  PRO_PUBNUB_SUBSCRIBER: 'sub-c-9cc337b6-e0f4-11e9-8d21-f2f6e193974b',
  DOCUMENT_BASE_URL: 'https://devaphstorage.blob.core.windows.net/popaphstorage/popaphstorage/',
  GOOGLE_API_KEY: 'AIzaSyCu4uyf9ln--tU-8V32nnFyfk8GN4koLI0',
  TOP_SPECIALITIES: QA_top_specialties,
  ...PharmaApiConfig.dev,
  ...appStaticVariables,
  ...Apollo247Config.dev,
  ...ServiceabiltyAvailabilityConfig.dev,
  RETURN_ORDER_SUB_REASON: ReturnOrderSubReason,
  CONDITIONAL_MANAGENET_BASE_URL: paymentGatewayBaseUrl,
  COVID_RISK_LEVEL_URL:
    'https://aph-staging-web-patients.apollo247.com/covid19/cough-scan?utm_source=mobile_app',
  COVID_LATEST_ARTICLES_URL:
    'https://aph-staging-web-patients.apollo247.com/covid19?utm_source=mobile_app&utm_medium=Webview&utm_campaign=Covid19%20Content',
  CONSULT_COUPON_BASE_URL: 'https://uatvalidcoupon.apollo247.com',
  KAVACH_URL:
    'https://aph-staging-web-patients.apollo247.com/covid19/kavach?utm_source=mobile_app&utm_medium=Webview',
  SYMPTOM_TRACKER: 'https://sympai-staging.apollo247.com/api/v1/chatbot',
  COVID_VACCINE_TRACKER_URL: 'https://aph-staging-web-patients.apollo247.com/covid-vaccine-tracker',
  BLOG_URL: 'https://aph-staging-web-patients.apollo247.com/blog',
  CIRCLE_CONSULT_URL: 'https://aph-staging-web-patients.apollo247.com/consult-landing?header=false',
  CIRLCE_PHARMA_URL: 'https://aph-staging-web-patients.apollo247.com/pharma-landing?header=false',
  CIRCLE_TEST_URL: 'https://aph-staging-web-patients.apollo247.com/test-landing?header=false',
  CIRCLE_LANDING_URL: 'https://aph-staging-web-patients.apollo247.com/circle?header=false',
  APOLLO_PRO_HEALTH_URL:
    'https://aph-staging-web-patients.apollo247.com/apollo-pro-health?utm_source=mobile_app&utm_medium=Webview&utm_campaign=Apollo%20Pro%20Health%20Content',
  HDFC_HEALTHY_LIFE_URL: 'https://aph-staging-web-patients.apollo247.com/partners/hdfc',
  PROCEDURE_SYMPTOMS_SEARCH_URL: 'https://sympai-staging.apollo247.com/api/v1/clinicalsearch',
  jusPayenvironment: 'sandbox',
  CONDITIONAL_MANAGEMENT_PROHEALTH_BASE_URL: 'https://auth.play.vitacloud.io',
  PROHEALTH_BOOKING_URL: 'https://aph-staging-web-patients.apollo247.com/apollo-prohealth',
  baseUrl: 'https://aph-staging-web-patients.apollo247.com/ordersuccess',
  CIRCLE_PLAN_PRESELECTED: false,
  PROHEALTH_BANNER_IMAGE : "https://newassets-test.apollo247.com/images/banners/ProHealthAppLanding.jpg",
};

// QA2
const ConfigurationQA2 = {
  TAGALYS_API_KEY: '050343bfa6dae87212fd64ee7809c2c8',
  TAGALYS_CLIENT_CODE: 'A029C7273776C78A',
  CODE_PUSH_DEPLOYMENT_KEY_ANDROID: 'kq-NXsLvHNu_EYzKBlZOuk2vbQKepRdBSndmo',
  CODE_PUSH_DEPLOYMENT_KEY_IOS: 'h6JJUbQWK4JEItmav-kH852x-3pneo4vcZNkg',
  PAYMENT_GATEWAY_BASE_URL: paymentGatewayBaseUrl,
  PAYMENT_GATEWAY_SUCCESS_PATH: '/mob?',
  PAYMENT_GATEWAY_ERROR_PATH: '/mob-error?',
  CONSULT_PG_BASE_URL: paymentGatewayBaseUrl,
  CONSULT_PG_SUCCESS_PATH: '/consultpg-success?',
  CONSULT_PG_ERROR_PATH: '/consultpg-error?',
  CONSULT_PG_PENDING_PATH: '/consultpg-pending',
  CONSULT_PG_REDIRECT_PATH: '/consultpg-redirect?',
  DIAGNOSTICS_PG_BASE_URL: paymentGatewayBaseUrl,
  DIAGNOSTICS_PG_SUCCESS_PATH: '/diagnostic-pg-success?',
  DIAGNOSTICS_PG_ERROR_PATH: '/diagnostic-pg-error?',
  DIAGNOSTICS_PG_CANCEL_PATH: '/diagnostic-pg-cancel-url',
  DIASGNOS_DELIVERY_CHARGES: 0,
  PHR_BASE_URL: 'https://ora.phrdemo.com/data',
  PRAKTISE_API_KEY: 'AFF2F0D8-5320-4E4D-A673-33626CD1C3F2', //'4A8C9CCC-C5A3-11E9-9A19-8C85900A8328',
  PRO_TOKBOX_KEY: '46429002',
  PRO_PUBNUB_PUBLISH: 'pub-c-75e6dc17-2d81-4969-8410-397064dae70e',
  PRO_PUBNUB_SUBSCRIBER: 'sub-c-9cc337b6-e0f4-11e9-8d21-f2f6e193974b',
  DOCUMENT_BASE_URL: 'https://devaphstorage.blob.core.windows.net/popaphstorage/popaphstorage/',
  GOOGLE_API_KEY: 'AIzaSyCu4uyf9ln--tU-8V32nnFyfk8GN4koLI0',
  TOP_SPECIALITIES: QA_top_specialties,
  ...PharmaApiConfig.dev,
  ...appStaticVariables,
  ...Apollo247Config.dev,
  ...ServiceabiltyAvailabilityConfig.dev,
  RETURN_ORDER_SUB_REASON: ReturnOrderSubReason,
  CONDITIONAL_MANAGENET_BASE_URL: paymentGatewayBaseUrl,
  COVID_RISK_LEVEL_URL: 'https://www.apollo247.com/covid19/cough-scan?utm_source=mobile_app',
  COVID_LATEST_ARTICLES_URL:
    'https://qapatients.apollo247.com/covid19?utm_source=mobile_app&utm_medium=Webview&utm_campaign=Covid19%20Content',
  CONSULT_COUPON_BASE_URL: 'https://uatvalidcoupon.apollo247.com',
  KAVACH_URL: 'https://www.apollo247.com/covid19/kavach?utm_source=mobile_app&utm_medium=Webview',
  SYMPTOM_TRACKER: 'https://sympai.apollo247.com/api/v1/chatbot',
  COVID_VACCINE_TRACKER_URL: 'https://www.apollo247.com/covid-vaccine-tracker',
  BLOG_URL: 'https://www.apollo247.com/blog',
  CIRCLE_CONSULT_URL: 'https://aph-staging-web-patients.apollo247.com/consult-landing?header=false',
  CIRLCE_PHARMA_URL: 'https://aph-staging-web-patients.apollo247.com/pharma-landing?header=false',
  CIRCLE_TEST_URL: 'https://aph-staging-web-patients.apollo247.com/test-landing?header=false',
  CIRCLE_LANDING_URL: 'https://aph-staging-web-patients.apollo247.com/circle?header=false',
  APOLLO_PRO_HEALTH_URL:
    'https://www.apollo247.com/apollo-pro-health?utm_source=mobile_app&utm_medium=Webview&utm_campaign=Apollo%20Pro%20Health%20Content',
  HDFC_HEALTHY_LIFE_URL: 'https://www.apollo247.com/partners/hdfc',
  PROCEDURE_SYMPTOMS_SEARCH_URL: 'https://sympai.apollo247.com/api/v1/clinicalsearch',
  jusPayenvironment: 'sandbox',
  CONDITIONAL_MANAGEMENT_PROHEALTH_BASE_URL: 'https://auth.play.vitacloud.io',
  PROHEALTH_BOOKING_URL: 'https://aph-staging-web-patients.apollo247.com/apollo-prohealth',
  baseUrl: 'https://aph-staging-web-patients.apollo247.com',
  CIRCLE_PLAN_PRESELECTED: false,
  PROHEALTH_BANNER_IMAGE : "https://newassets-test.apollo247.com/images/banners/ProHealthAppLanding.jpg",
};

// QA3
const ConfigurationQA3 = {
  TAGALYS_API_KEY: '050343bfa6dae87212fd64ee7809c2c8',
  TAGALYS_CLIENT_CODE: 'A029C7273776C78A',
  CODE_PUSH_DEPLOYMENT_KEY_ANDROID: 'QEuQRL5_DKsdca021jR9bpVrQf9x3rF6hOADA',
  CODE_PUSH_DEPLOYMENT_KEY_IOS: '_9aJEBfuTc3Vki4DZUAbC3X0YEHff4D-lR28l',
  PAYMENT_GATEWAY_BASE_URL: paymentGatewayBaseUrl,
  PAYMENT_GATEWAY_SUCCESS_PATH: '/mob?',
  PAYMENT_GATEWAY_ERROR_PATH: '/mob-error?',
  CONSULT_PG_BASE_URL: paymentGatewayBaseUrl,
  CONSULT_PG_SUCCESS_PATH: '/consultpg-success?',
  CONSULT_PG_ERROR_PATH: '/consultpg-error?',
  CONSULT_PG_PENDING_PATH: '/consultpg-pending',
  CONSULT_PG_REDIRECT_PATH: '/consultpg-redirect?',
  DIAGNOSTICS_PG_BASE_URL: paymentGatewayBaseUrl,
  DIAGNOSTICS_PG_SUCCESS_PATH: '/diagnostic-pg-success?',
  DIAGNOSTICS_PG_ERROR_PATH: '/diagnostic-pg-error?',
  DIAGNOSTICS_PG_CANCEL_PATH: '/diagnostic-pg-cancel-url',
  DIASGNOS_DELIVERY_CHARGES: 0,
  PHR_BASE_URL: 'https://ora.phrdemo.com/data',
  PRAKTISE_API_KEY: 'AFF2F0D8-5320-4E4D-A673-33626CD1C3F2', //'4A8C9CCC-C5A3-11E9-9A19-8C85900A8328',
  PRO_TOKBOX_KEY: '46429002',
  PRO_PUBNUB_PUBLISH: 'pub-c-75e6dc17-2d81-4969-8410-397064dae70e',
  PRO_PUBNUB_SUBSCRIBER: 'sub-c-9cc337b6-e0f4-11e9-8d21-f2f6e193974b',
  DOCUMENT_BASE_URL: 'https://devaphstorage.blob.core.windows.net/popaphstorage/popaphstorage/',
  GOOGLE_API_KEY: 'AIzaSyCu4uyf9ln--tU-8V32nnFyfk8GN4koLI0',
  TOP_SPECIALITIES: QA_top_specialties,
  ...PharmaApiConfig.dev,
  ...appStaticVariables,
  ...Apollo247Config.dev,
  ...ServiceabiltyAvailabilityConfig.dev,
  RETURN_ORDER_SUB_REASON: ReturnOrderSubReason,
  CONDITIONAL_MANAGENET_BASE_URL: paymentGatewayBaseUrl,
  COVID_RISK_LEVEL_URL: 'https://www.apollo247.com/covid19/cough-scan?utm_source=mobile_app',
  COVID_LATEST_ARTICLES_URL:
    'https://qapatients.apollo247.com/covid19?utm_source=mobile_app&utm_medium=Webview&utm_campaign=Covid19%20Content',
  CONSULT_COUPON_BASE_URL: 'https://uatvalidcoupon.apollo247.com',
  KAVACH_URL: 'https://www.apollo247.com/covid19/kavach?utm_source=mobile_app&utm_medium=Webview',
  SYMPTOM_TRACKER: 'https://sympai.apollo247.com/api/v1/chatbot',
  COVID_VACCINE_TRACKER_URL: 'https://www.apollo247.com/covid-vaccine-tracker',
  BLOG_URL: 'https://www.apollo247.com/blog',
  HDFC_HEALTHY_LIFE_URL: 'https://www.apollo247.com/partners/hdfc',
  PROCEDURE_SYMPTOMS_SEARCH_URL: 'https://sympai.apollo247.com/api/v1/clinicalsearch',
  jusPayenvironment: 'sandbox',
  Covid_Items: QA_covid_items,
  CONDITIONAL_MANAGEMENT_PROHEALTH_BASE_URL: 'https://auth.play.vitacloud.io',
  PROHEALTH_BOOKING_URL: 'https://aph-staging-web-patients.apollo247.com/apollo-prohealth',
  APOLLO_PRO_HEALTH_URL:
    'https://www.apollo247.com/apollo-pro-health?utm_source=mobile_app&utm_medium=Webview&utm_campaign=Apollo%20Pro%20Health%20Content',
  baseUrl: 'https://aph-staging-web-patients.apollo247.com',
  CIRCLE_CONSULT_URL: 'https://qathreepatients.apollo247.com/consult-landing?header=false',
  CIRLCE_PHARMA_URL: 'https://qathreepatients.apollo247.com/pharma-landing?header=false',
  CIRCLE_TEST_URL: 'https://qathreepatients.apollo247.com/test-landing?header=false',
  CIRCLE_LANDING_URL: 'https://qathreepatients.apollo247.com/circle?header=false',
  CIRCLE_PLAN_PRESELECTED: false,
  PROHEALTH_BANNER_IMAGE : "https://newassets-test.apollo247.com/images/banners/ProHealthAppLanding.jpg",
};

const ConfigurationQA5 = {
  TAGALYS_API_KEY: '050343bfa6dae87212fd64ee7809c2c8',
  TAGALYS_CLIENT_CODE: 'A029C7273776C78A',
  CODE_PUSH_DEPLOYMENT_KEY_ANDROID: 'wUOCVT2QKBM9LZ3dBesTBDxpNgAE_9Tn7Nb-H',
  CODE_PUSH_DEPLOYMENT_KEY_IOS: 'ObNcIEaY1zvcPntqgEcb3PgopY5NH6pGHuvwo',
  PAYMENT_GATEWAY_BASE_URL: paymentGatewayBaseUrl,
  PAYMENT_GATEWAY_SUCCESS_PATH: '/mob?',
  PAYMENT_GATEWAY_ERROR_PATH: '/mob-error?',
  CONSULT_PG_BASE_URL: paymentGatewayBaseUrl,
  CONSULT_PG_SUCCESS_PATH: '/consultpg-success?',
  CONSULT_PG_ERROR_PATH: '/consultpg-error?',
  CONSULT_PG_PENDING_PATH: '/consultpg-pending',
  CONSULT_PG_REDIRECT_PATH: '/consultpg-redirect?',
  DIAGNOSTICS_PG_BASE_URL: paymentGatewayBaseUrl,
  DIAGNOSTICS_PG_SUCCESS_PATH: '/diagnostic-pg-success?',
  DIAGNOSTICS_PG_ERROR_PATH: '/diagnostic-pg-error?',
  DIAGNOSTICS_PG_CANCEL_PATH: '/diagnostic-pg-cancel-url',
  DIASGNOS_DELIVERY_CHARGES: 0,
  PHR_BASE_URL: 'https://ora.phrdemo.com/data',
  PRAKTISE_API_KEY: 'AFF2F0D8-5320-4E4D-A673-33626CD1C3F2', //'4A8C9CCC-C5A3-11E9-9A19-8C85900A8328',
  PRO_TOKBOX_KEY: '46429002',
  PRO_PUBNUB_PUBLISH: 'pub-c-75e6dc17-2d81-4969-8410-397064dae70e',
  PRO_PUBNUB_SUBSCRIBER: 'sub-c-9cc337b6-e0f4-11e9-8d21-f2f6e193974b',
  DOCUMENT_BASE_URL: 'https://devaphstorage.blob.core.windows.net/popaphstorage/popaphstorage/',
  GOOGLE_API_KEY: 'AIzaSyCu4uyf9ln--tU-8V32nnFyfk8GN4koLI0',
  TOP_SPECIALITIES: QA_top_specialties,
  ...PharmaApiConfig.dev,
  ...appStaticVariables,
  ...Apollo247Config.dev,
  ...ServiceabiltyAvailabilityConfig.dev,
  RETURN_ORDER_SUB_REASON: ReturnOrderSubReason,
  CONDITIONAL_MANAGENET_BASE_URL: paymentGatewayBaseUrl,
  COVID_RISK_LEVEL_URL:
    'https://qa5patients.apollo247.com/covid19/cough-scan?utm_source=mobile_app',
  COVID_LATEST_ARTICLES_URL:
    'https://qa5patients.apollo247.com/covid19?utm_source=mobile_app&utm_medium=Webview&utm_campaign=Covid19%20Content',
  CONSULT_COUPON_BASE_URL: 'https://uatvalidcoupon.apollo247.com',
  KAVACH_URL:
    'https://qa5patients.apollo247.com/covid19/kavach?utm_source=mobile_app&utm_medium=Webview',
  SYMPTOM_TRACKER: 'https://sympai.apollo247.com/api/v1/chatbot',
  COVID_VACCINE_TRACKER_URL: 'https://www.apollo247.com/covid-vaccine-tracker',
  BLOG_URL: 'https://qa5patients.apollo247.com/blog',
  HDFC_HEALTHY_LIFE_URL: 'https://qa5patients.apollo247.com/partners/hdfc',
  PROCEDURE_SYMPTOMS_SEARCH_URL: 'https://sympai.apollo247.com/api/v1/clinicalsearch',
  jusPayenvironment: 'sandbox',
  Covid_Items: QA_covid_items,
  CONDITIONAL_MANAGEMENT_PROHEALTH_BASE_URL: 'https://auth.play.vitacloud.io',
  PROHEALTH_BOOKING_URL: 'https://qa5patients.apollo247.com/apollo-prohealth',
  APOLLO_PRO_HEALTH_URL:
    'https://qa5patients.apollo247.com/apollo-pro-health?utm_source=mobile_app&utm_medium=Webview&utm_campaign=Apollo%20Pro%20Health%20Content',
  baseUrl: 'https://aph-staging-web-patients.apollo247.com/ordersuccess',
  CIRCLE_CONSULT_URL: 'https://aph-staging-web-patients.apollo247.com/consult-landing?header=false',
  CIRLCE_PHARMA_URL: 'https://aph-staging-web-patients.apollo247.com/pharma-landing?header=false',
  CIRCLE_TEST_URL: 'https://aph-staging-web-patients.apollo247.com/test-landing?header=false',
  CIRCLE_LANDING_URL: 'https://aph-staging-web-patients.apollo247.com/circle?header=false',
  CIRCLE_PLAN_PRESELECTED: false,
  PROHEALTH_BANNER_IMAGE : "https://newassets-test.apollo247.com/images/banners/ProHealthAppLanding.jpg",
};

const ConfigurationQA6 = {
  TAGALYS_API_KEY: '050343bfa6dae87212fd64ee7809c2c8',
  TAGALYS_CLIENT_CODE: 'A029C7273776C78A',
  CODE_PUSH_DEPLOYMENT_KEY_ANDROID: 'JLaLv98G4Bb8Gn5NP0oOqr3FWc4SSSdWxWOiV',
  CODE_PUSH_DEPLOYMENT_KEY_IOS: 'm0knQzi26hpgMeHPX_Qm4qzcJkMjwv2fjH2CV',
  PAYMENT_GATEWAY_BASE_URL: paymentGatewayBaseUrl,
  PAYMENT_GATEWAY_SUCCESS_PATH: '/mob?',
  PAYMENT_GATEWAY_ERROR_PATH: '/mob-error?',
  CONSULT_PG_BASE_URL: paymentGatewayBaseUrl,
  CONSULT_PG_SUCCESS_PATH: '/consultpg-success?',
  CONSULT_PG_ERROR_PATH: '/consultpg-error?',
  CONSULT_PG_PENDING_PATH: '/consultpg-pending',
  CONSULT_PG_REDIRECT_PATH: '/consultpg-redirect?',
  DIAGNOSTICS_PG_BASE_URL: paymentGatewayBaseUrl,
  DIAGNOSTICS_PG_SUCCESS_PATH: '/diagnostic-pg-success?',
  DIAGNOSTICS_PG_ERROR_PATH: '/diagnostic-pg-error?',
  DIAGNOSTICS_PG_CANCEL_PATH: '/diagnostic-pg-cancel-url',
  DIASGNOS_DELIVERY_CHARGES: 0,
  PHR_BASE_URL: 'https://ora.phrdemo.com/data',
  PRAKTISE_API_KEY: 'AFF2F0D8-5320-4E4D-A673-33626CD1C3F2', //'4A8C9CCC-C5A3-11E9-9A19-8C85900A8328',
  PRO_TOKBOX_KEY: '46429002',
  PRO_PUBNUB_PUBLISH: 'pub-c-75e6dc17-2d81-4969-8410-397064dae70e',
  PRO_PUBNUB_SUBSCRIBER: 'sub-c-9cc337b6-e0f4-11e9-8d21-f2f6e193974b',
  DOCUMENT_BASE_URL: 'https://devaphstorage.blob.core.windows.net/popaphstorage/popaphstorage/',
  GOOGLE_API_KEY: 'AIzaSyCu4uyf9ln--tU-8V32nnFyfk8GN4koLI0',
  TOP_SPECIALITIES: QA_top_specialties,
  ...PharmaApiConfig.dev,
  ...appStaticVariables,
  ...Apollo247Config.dev,
  ...ServiceabiltyAvailabilityConfig.dev,
  RETURN_ORDER_SUB_REASON: ReturnOrderSubReason,
  CONDITIONAL_MANAGENET_BASE_URL: paymentGatewayBaseUrl,
  COVID_RISK_LEVEL_URL:
    'https://aph-staging-web-patients.apollo247.com/covid19/cough-scan?utm_source=mobile_app',
  COVID_LATEST_ARTICLES_URL:
    'https://aph-staging-web-patients.apollo247.com/covid19?utm_source=mobile_app&utm_medium=Webview&utm_campaign=Covid19%20Content',
  CONSULT_COUPON_BASE_URL: 'https://uatvalidcoupon.apollo247.com',
  KAVACH_URL:
    'https://aph-staging-web-patients.apollo247.com/covid19/kavach?utm_source=mobile_app&utm_medium=Webview',
  SYMPTOM_TRACKER: 'https://sympai-staging.apollo247.com/api/v1/chatbot',
  COVID_VACCINE_TRACKER_URL: 'https://aph-staging-web-patients.apollo247.com/covid-vaccine-tracker',
  BLOG_URL: 'https://aph-staging-web-patients.apollo247.com/blog',
  CIRCLE_CONSULT_URL: 'https://aph-staging-web-patients.apollo247.com/consult-landing?header=false',
  CIRLCE_PHARMA_URL: 'https://aph-staging-web-patients.apollo247.com/pharma-landing?header=false',
  CIRCLE_TEST_URL: 'https://aph-staging-web-patients.apollo247.com/test-landing?header=false',
  CIRCLE_LANDING_URL: 'https://aph-staging-web-patients.apollo247.com/circle?header=false',
  APOLLO_PRO_HEALTH_URL:
    'https://aph-staging-web-patients.apollo247.com/apollo-pro-health?utm_source=mobile_app&utm_medium=Webview&utm_campaign=Apollo%20Pro%20Health%20Content',
  HDFC_HEALTHY_LIFE_URL: 'https://aph-staging-web-patients.apollo247.com/partners/hdfc',
  PROCEDURE_SYMPTOMS_SEARCH_URL: 'https://sympai-staging.apollo247.com/api/v1/clinicalsearch',
  jusPayenvironment: 'sandbox',
  CONDITIONAL_MANAGEMENT_PROHEALTH_BASE_URL: 'https://auth.play.vitacloud.io',
  PROHEALTH_BOOKING_URL: 'https://aph-staging-web-patients.apollo247.com/apollo-prohealth',
  baseUrl: 'https://aph-staging-web-patients.apollo247.com/ordersuccess',
  CIRCLE_PLAN_PRESELECTED: false,
  PROHEALTH_BANNER_IMAGE : "https://newassets-test.apollo247.com/images/banners/ProHealthAppLanding.jpg",
};

// VAPT
const ConfigurationVAPT = {
  TAGALYS_API_KEY: '050343bfa6dae87212fd64ee7809c2c8',
  TAGALYS_CLIENT_CODE: 'A029C7273776C78A',
  CODE_PUSH_DEPLOYMENT_KEY_ANDROID: 'WjmvQNubbydD5MzGoj0wJDBBQM5j0QnYlE6fq',
  CODE_PUSH_DEPLOYMENT_KEY_IOS: 'I2C97PsUTffeO7krrfYjxOxQ_uebYPeOPdLqG',
  PAYMENT_GATEWAY_BASE_URL: paymentGatewayBaseUrl,
  PAYMENT_GATEWAY_SUCCESS_PATH: '/mob?',
  PAYMENT_GATEWAY_ERROR_PATH: '/mob-error?',
  CONSULT_PG_BASE_URL: paymentGatewayBaseUrl,
  CONSULT_PG_SUCCESS_PATH: '/consultpg-success?',
  CONSULT_PG_ERROR_PATH: '/consultpg-error?',
  CONSULT_PG_PENDING_PATH: '/consultpg-pending',
  CONSULT_PG_REDIRECT_PATH: '/consultpg-redirect?',
  DIAGNOSTICS_PG_BASE_URL: paymentGatewayBaseUrl,
  DIAGNOSTICS_PG_SUCCESS_PATH: '/diagnostic-pg-success?',
  DIAGNOSTICS_PG_ERROR_PATH: '/diagnostic-pg-error?',
  DIAGNOSTICS_PG_CANCEL_PATH: '/diagnostic-pg-cancel-url',
  DIASGNOS_DELIVERY_CHARGES: 0,
  PHR_BASE_URL: 'https://ora.phrdemo.com/data',
  PRAKTISE_API_KEY: 'AFF2F0D8-5320-4E4D-A673-33626CD1C3F2', //'4A8C9CCC-C5A3-11E9-9A19-8C85900A8328',
  PRO_TOKBOX_KEY: '46429002',
  PRO_PUBNUB_PUBLISH: 'pub-c-75e6dc17-2d81-4969-8410-397064dae70e',
  PRO_PUBNUB_SUBSCRIBER: 'sub-c-9cc337b6-e0f4-11e9-8d21-f2f6e193974b',
  DOCUMENT_BASE_URL: 'https://devaphstorage.blob.core.windows.net/popaphstorage/popaphstorage/',
  GOOGLE_API_KEY: 'AIzaSyCu4uyf9ln--tU-8V32nnFyfk8GN4koLI0',
  TOP_SPECIALITIES: QA_top_specialties,
  ...PharmaApiConfig.dev,
  ...appStaticVariables,
  ...Apollo247Config.dev,
  ...ServiceabiltyAvailabilityConfig.dev,
  RETURN_ORDER_SUB_REASON: ReturnOrderSubReason,
  CONDITIONAL_MANAGENET_BASE_URL: paymentGatewayBaseUrl,
  COVID_RISK_LEVEL_URL: 'https://staging.patients.apollo247.com/covid19/scan?utm_source=mobile_app',
  COVID_LATEST_ARTICLES_URL:
    'https://staging.patients.apollo247.com/covid19?utm_source=mobile_app&utm_medium=Webview&utm_campaign=Covid19%20Content',
  CONSULT_COUPON_BASE_URL: 'https://uatvalidcoupon.apollo247.com',
  KAVACH_URL: 'https://www.apollo247.com/covid19/kavach?utm_source=mobile_app&utm_medium=Webview',
  SYMPTOM_TRACKER: 'https://sympai.apollo247.com/api/v1/chatbot',
  COVID_VACCINE_TRACKER_URL: 'https://www.apollo247.com/covid-vaccine-tracker',
  BLOG_URL: 'https://www.apollo247.com/blog',
  CIRCLE_CONSULT_URL: 'https://aph-staging-web-patients.apollo247.com/consult-landing?header=false',
  CIRLCE_PHARMA_URL: 'https://aph-staging-web-patients.apollo247.com/pharma-landing?header=false',
  CIRCLE_TEST_URL: 'https://aph-staging-web-patients.apollo247.com/test-landing?header=false',
  CIRCLE_LANDING_URL: 'https://aph-staging-web-patients.apollo247.com/circle?header=false',
  APOLLO_PRO_HEALTH_URL:
    'https://www.apollo247.com/apollo-pro-health?utm_source=mobile_app&utm_medium=Webview&utm_campaign=Apollo%20Pro%20Health%20Content',
  HDFC_HEALTHY_LIFE_URL: 'https://www.apollo247.com/partners/hdfc',
  PROCEDURE_SYMPTOMS_SEARCH_URL: 'https://sympai.apollo247.com/api/v1/clinicalsearch',
  jusPayenvironment: 'sandbox',
  Covid_Items: QA_covid_items,
  CONDITIONAL_MANAGEMENT_PROHEALTH_BASE_URL: 'https://auth.play.vitacloud.io',
  PROHEALTH_BOOKING_URL: 'https://stagingpatients.apollo247.com//apollo-prohealth',
  baseUrl: 'https://aph-staging-web-patients.apollo247.com',
  CIRCLE_PLAN_PRESELECTED: false,
  PROHEALTH_BANNER_IMAGE : "https://newassets-test.apollo247.com/images/banners/ProHealthAppLanding.jpg",
};
//Production
const ConfigurationProd = {
  TAGALYS_API_KEY: 'e961d4cd04dbd2f095d2f4bc76fcea06',
  TAGALYS_CLIENT_CODE: '93D966E474D9A823',
  CODE_PUSH_DEPLOYMENT_KEY_ANDROID: 'ncBcxm590r0jEGT4BjQFTAW0_rkHKvF5xYUDX',
  CODE_PUSH_DEPLOYMENT_KEY_IOS: 'N9LT5oUoB9DUv394XXz05Tywn3LKgHsugfl3i',
  PAYMENT_GATEWAY_BASE_URL: paymentGatewayBaseUrl, //PRODUCTION
  PAYMENT_GATEWAY_SUCCESS_PATH: '/mob?',
  PAYMENT_GATEWAY_ERROR_PATH: '/mob-error?',
  CONSULT_PG_BASE_URL: paymentGatewayBaseUrl,
  CONSULT_PG_SUCCESS_PATH: '/consultpg-success?',
  CONSULT_PG_ERROR_PATH: '/consultpg-error?',
  CONSULT_PG_PENDING_PATH: '/consultpg-pending',
  CONSULT_PG_REDIRECT_PATH: '/consultpg-redirect?',
  DIAGNOSTICS_PG_BASE_URL: paymentGatewayBaseUrl,
  DIAGNOSTICS_PG_SUCCESS_PATH: '/diagnostic-pg-success?',
  DIAGNOSTICS_PG_ERROR_PATH: '/diagnostic-pg-error?',
  DIAGNOSTICS_PG_CANCEL_PATH: '/diagnostic-pg-cancel-url',
  DIASGNOS_DELIVERY_CHARGES: 0,
  PHR_BASE_URL: 'https://base.apolloprism.com',
  PRAKTISE_API_KEY: 'FD7632C8-AF22-4534-91ED-4C197E1662F4', // PRODUCTION
  PRO_TOKBOX_KEY: '46422952', // PRODUCTION
  PRO_PUBNUB_PUBLISH: 'pub-c-e275fde3-09e1-44dd-bc32-5c3d04c3b2ef', // PRODUCTION
  PRO_PUBNUB_SUBSCRIBER: 'sub-c-517dafbc-d955-11e9-aa3a-6edd521294c5', // PRODUCTION
  DOCUMENT_BASE_URL: 'https://prodaphstorage.blob.core.windows.net/prodaphstorage/prodaphstorage/', //Production
  GOOGLE_API_KEY: 'AIzaSyCu4uyf9ln--tU-8V32nnFyfk8GN4koLI0',
  TOP_SPECIALITIES: top_specialties,
  ...PharmaApiConfig.prod,
  ...appStaticVariables,
  ...Apollo247Config.prod,
  ...ServiceabiltyAvailabilityConfig.prod,
  RETURN_ORDER_SUB_REASON: ReturnOrderSubReason,
  CONDITIONAL_MANAGENET_BASE_URL: paymentGatewayBaseUrl,
  COVID_RISK_LEVEL_URL: 'https://www.apollo247.com/covid19/cough-scan?utm_source=mobile_app',
  COVID_LATEST_ARTICLES_URL:
    'https://www.apollo247.com/covid19?utm_source=mobile_app&utm_medium=Webview&utm_campaign=Covid19%20Content',
  CONSULT_COUPON_BASE_URL: 'https://validcoupon.apollo247.com',
  KAVACH_URL: 'https://www.apollo247.com/covid19/kavach?utm_source=mobile_app&utm_medium=Webview',
  SYMPTOM_TRACKER: 'https://sympai.apollo247.com/api/v1/chatbot',
  COVID_VACCINE_TRACKER_URL: 'https://www.apollo247.com/covid-vaccine-tracker',
  BLOG_URL: 'https://www.apollo247.com/blog',
  CIRCLE_CONSULT_URL: 'https://www.apollo247.com/consult-landing?header=false',
  CIRLCE_PHARMA_URL: 'https://www.apollo247.com/pharma-landing?header=false',
  CIRCLE_TEST_URL: 'https://www.apollo247.com/test-landing?header=false',
  CIRCLE_LANDING_URL: 'https://www.apollo247.com/circle?header=false',
  APOLLO_PRO_HEALTH_URL:
    'https://www.apollo247.com/apollo-pro-health?utm_source=mobile_app&utm_medium=Webview&utm_campaign=Apollo%20Pro%20Health%20Content',
  HDFC_HEALTHY_LIFE_URL: 'https://www.apollo247.com/partners/hdfc',
  PROCEDURE_SYMPTOMS_SEARCH_URL: 'https://sympai.apollo247.com/api/v1/clinicalsearch',
  jusPayenvironment: 'prod',
  Covid_Items: Prod_covid_items,
  CONDITIONAL_MANAGEMENT_PROHEALTH_BASE_URL: 'https://auth.prod.vitacloud.io',
  PROHEALTH_BOOKING_URL: 'https://www.apollo247.com/apollo-prohealth',
  baseUrl: 'https://www.apollo247.com',
  CIRCLE_PLAN_PRESELECTED: false,
  PROHEALTH_BANNER_IMAGE : "https://newassets.apollo247.com/images/banners/ProHealthAppLanding.jpg",
};

//PERFORMANCE
const ConfigurationPERFORM = {
  TAGALYS_API_KEY: '050343bfa6dae87212fd64ee7809c2c8',
  TAGALYS_CLIENT_CODE: 'A029C7273776C78A',
  CODE_PUSH_DEPLOYMENT_KEY_ANDROID: 'b72foAZYvb6d0xOaqdvE_LHyaYiW5rsh_wGKM',
  CODE_PUSH_DEPLOYMENT_KEY_IOS: 'of-02CUYoW4JfbgDXp4TwRN2mYfaZghf22hF-',
  PAYMENT_GATEWAY_BASE_URL: paymentGatewayBaseUrl,
  PAYMENT_GATEWAY_SUCCESS_PATH: '/mob?',
  PAYMENT_GATEWAY_ERROR_PATH: '/mob-error?',
  CONSULT_PG_BASE_URL: paymentGatewayBaseUrl,
  CONSULT_PG_SUCCESS_PATH: '/consultpg-success?',
  CONSULT_PG_ERROR_PATH: '/consultpg-error?',
  CONSULT_PG_PENDING_PATH: '/consultpg-pending',
  CONSULT_PG_REDIRECT_PATH: '/consultpg-redirect?',
  DIAGNOSTICS_PG_BASE_URL: paymentGatewayBaseUrl,
  DIAGNOSTICS_PG_SUCCESS_PATH: '/diagnostic-pg-success?',
  DIAGNOSTICS_PG_ERROR_PATH: '/diagnostic-pg-error?',
  DIAGNOSTICS_PG_CANCEL_PATH: '/diagnostic-pg-cancel-url',
  DIASGNOS_DELIVERY_CHARGES: 0,
  PHR_BASE_URL: 'https://ora.phrdemo.com/data',
  PRAKTISE_API_KEY: 'FD7632C8-AF22-4534-91ED-4C197E1662F4', //'AFF2F0D8-5320-4E4D-A673-33626CD1C3F2', //'4A8C9CCC-C5A3-11E9-9A19-8C85900A8328',
  PRO_TOKBOX_KEY: '46429002',
  PRO_PUBNUB_PUBLISH: 'pub-c-75e6dc17-2d81-4969-8410-397064dae70e',
  PRO_PUBNUB_SUBSCRIBER: 'sub-c-9cc337b6-e0f4-11e9-8d21-f2f6e193974b',
  DOCUMENT_BASE_URL: 'https://devaphstorage.blob.core.windows.net/popaphstorage/popaphstorage/',
  GOOGLE_API_KEY: 'AIzaSyCu4uyf9ln--tU-8V32nnFyfk8GN4koLI0',
  TOP_SPECIALITIES: DEV_top_specialties,
  ...PharmaApiConfig.dev,
  ...appStaticVariables,
  ...Apollo247Config.dev,
  ...ServiceabiltyAvailabilityConfig.dev,
  RETURN_ORDER_SUB_REASON: ReturnOrderSubReason,
  CONDITIONAL_MANAGENET_BASE_URL: paymentGatewayBaseUrl,
  COVID_RISK_LEVEL_URL:
    'https://aph-staging-web-patients.apollo247.com/covid19/cough-scan?utm_source=mobile_app',
  COVID_LATEST_ARTICLES_URL:
    'https://aph-staging-web-patients.apollo247.com/covid19?utm_source=mobile_app&utm_medium=Webview&utm_campaign=Covid19%20Content',
  CONSULT_COUPON_BASE_URL: 'https://uatvalidcoupon.apollo247.com',
  KAVACH_URL: 'https://www.apollo247.com/covid19/kavach?utm_source=mobile_app&utm_medium=Webview',
  SYMPTOM_TRACKER: 'https://sympai.apollo247.com/api/v1/chatbot',
  COVID_VACCINE_TRACKER_URL: 'https://www.apollo247.com/covid-vaccine-tracker',
  BLOG_URL: 'https://www.apollo247.com/blog',
  CIRCLE_CONSULT_URL: 'https://aph-staging-web-patients.apollo247.com/consult-landing?header=false',
  CIRLCE_PHARMA_URL: 'https://aph-staging-web-patients.apollo247.com/pharma-landing?header=false',
  CIRCLE_TEST_URL: 'https://aph-staging-web-patients.apollo247.com/test-landing?header=false',
  CIRCLE_LANDING_URL: 'https://aph-staging-web-patients.apollo247.com/circle?header=false',
  APOLLO_PRO_HEALTH_URL:
    'https://aph-staging-web-patients.apollo247.com/apollo-pro-health?utm_source=mobile_app&utm_medium=Webview&utm_campaign=Apollo%20Pro%20Health%20Content',
  HDFC_HEALTHY_LIFE_URL: 'https://www.apollo247.com/partners/hdfc',
  PROCEDURE_SYMPTOMS_SEARCH_URL: 'https://sympai.apollo247.com/api/v1/clinicalsearch',
  jusPayenvironment: 'sandbox',
  Covid_Items: QA_covid_items,
  CONDITIONAL_MANAGEMENT_PROHEALTH_BASE_URL: 'https://auth.play.vitacloud.io',
  PROHEALTH_BOOKING_URL: 'https://aph-staging-web-patients.apollo247.com/apollo-prohealth',
  baseUrl: 'https://aph-staging-web-patients.apollo247.com',
  CIRCLE_PLAN_PRESELECTED: false,PROHEALTH_BANNER_IMAGE : "https://newassets-test.apollo247.com/images/banners/ProHealthAppLanding.jpg",
};

//DevelopmentReplica
const ConfigurationDevReplica = {
  TAGALYS_API_KEY: '050343bfa6dae87212fd64ee7809c2c8',
  TAGALYS_CLIENT_CODE: 'A029C7273776C78A',
  CODE_PUSH_DEPLOYMENT_KEY_ANDROID: '',
  CODE_PUSH_DEPLOYMENT_KEY_IOS: '',
  PAYMENT_GATEWAY_BASE_URL: paymentGatewayBaseUrl,
  PAYMENT_GATEWAY_SUCCESS_PATH: '/mob?',
  PAYMENT_GATEWAY_ERROR_PATH: '/mob-error?',
  CONSULT_PG_BASE_URL: paymentGatewayBaseUrl,
  CONSULT_PG_SUCCESS_PATH: '/consultpg-success?',
  CONSULT_PG_ERROR_PATH: '/consultpg-error?',
  CONSULT_PG_PENDING_PATH: '/consultpg-pending',
  CONSULT_PG_REDIRECT_PATH: '/consultpg-redirect?',
  DIAGNOSTICS_PG_BASE_URL: paymentGatewayBaseUrl,
  DIAGNOSTICS_PG_SUCCESS_PATH: '/diagnostic-pg-success?',
  DIAGNOSTICS_PG_ERROR_PATH: '/diagnostic-pg-error?',
  DIAGNOSTICS_PG_CANCEL_PATH: '/diagnostic-pg-cancel-url',
  DIASGNOS_DELIVERY_CHARGES: 0,
  PHR_BASE_URL: 'https://ora.phrdemo.com/data',
  PRAKTISE_API_KEY: 'AFF2F0D8-5320-4E4D-A673-33626CD1C3F2', //'4A8C9CCC-C5A3-11E9-9A19-8C85900A8328',
  PRO_TOKBOX_KEY: '46429002',
  PRO_PUBNUB_PUBLISH: 'pub-c-75e6dc17-2d81-4969-8410-397064dae70e',
  PRO_PUBNUB_SUBSCRIBER: 'sub-c-9cc337b6-e0f4-11e9-8d21-f2f6e193974b',
  DOCUMENT_BASE_URL: 'https://devaphstorage.blob.core.windows.net/popaphstorage/popaphstorage/',
  GOOGLE_API_KEY: 'AIzaSyCu4uyf9ln--tU-8V32nnFyfk8GN4koLI0',
  TOP_SPECIALITIES: QA_top_specialties,
  ...PharmaApiConfig.dev,
  ...appStaticVariables,
  ...Apollo247Config.dev,
  ...ServiceabiltyAvailabilityConfig.dev,
  RETURN_ORDER_SUB_REASON: ReturnOrderSubReason,
  CONDITIONAL_MANAGENET_BASE_URL: paymentGatewayBaseUrl,
  COVID_RISK_LEVEL_URL:
    'https://aph-staging-web-patients.apollo247.com/covid19/cough-scan?utm_source=mobile_app',
  COVID_LATEST_ARTICLES_URL:
    'https://aph-staging-web-patients.apollo247.com/covid19?utm_source=mobile_app&utm_medium=Webview&utm_campaign=Covid19%20Content',
  CONSULT_COUPON_BASE_URL: 'https://uatvalidcoupon.apollo247.com',
  KAVACH_URL: 'https://www.apollo247.com/covid19/kavach?utm_source=mobile_app&utm_medium=Webview',
  SYMPTOM_TRACKER: 'https://sympai.apollo247.com/api/v1/chatbot',
  COVID_VACCINE_TRACKER_URL: 'https://www.apollo247.com/covid-vaccine-tracker',
  BLOG_URL: 'https://www.apollo247.com/blog',
  CIRCLE_CONSULT_URL: 'https://aph-staging-web-patients.apollo247.com/consult-landing?header=false',
  CIRLCE_PHARMA_URL: 'https://aph-staging-web-patients.apollo247.com/pharma-landing?header=false',
  CIRCLE_TEST_URL: 'https://aph-staging-web-patients.apollo247.com/test-landing?header=false',
  CIRCLE_LANDING_URL: 'https://aph-staging-web-patients.apollo247.com/circle?header=false',
  APOLLO_PRO_HEALTH_URL:
    'https://aph-staging-web-patients.apollo247.com/apollo-pro-health?utm_source=mobile_app&utm_medium=Webview&utm_campaign=Apollo%20Pro%20Health%20Content',
  HDFC_HEALTHY_LIFE_URL: 'https://www.apollo247.com/partners/hdfc',
  PROCEDURE_SYMPTOMS_SEARCH_URL: 'https://sympai.apollo247.com/api/v1/clinicalsearch',
  jusPayenvironment: 'sandbox',
  Covid_Items: QA_covid_items,
  CONDITIONAL_MANAGEMENT_PROHEALTH_BASE_URL: 'https://auth.play.vitacloud.io',
  PROHEALTH_BOOKING_URL: 'https://aph-staging-web-patients.apollo247.com/apollo-prohealth',
  baseUrl: 'https://aph-staging-web-patients.apollo247.com',
  CIRCLE_PLAN_PRESELECTED: false,
  PROHEALTH_BANNER_IMAGE : "https://newassets-test.apollo247.com/images/banners/ProHealthAppLanding.jpg",
};

const Configuration =
  APP_ENV == AppEnv.PROD
    ? ConfigurationProd
    : APP_ENV == AppEnv.QA
    ? ConfigurationQA
    : APP_ENV == AppEnv.QA2
    ? ConfigurationQA2
    : APP_ENV == AppEnv.QA3
    ? ConfigurationQA3
    : APP_ENV == AppEnv.QA5
    ? ConfigurationQA5
    : APP_ENV == AppEnv.PERFORM
    ? ConfigurationPERFORM
    : APP_ENV == AppEnv.VAPT
    ? ConfigurationVAPT
    : APP_ENV == AppEnv.DEVReplica
    ? ConfigurationDevReplica
    : APP_ENV == AppEnv.QA6
    ? ConfigurationQA6
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
      'Number of doctors to choose from',
      'Booking experience',
      'Chat/ Audio/ Video experience',
      'Experience with the Doctor’s Team',
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
      'Improve experience with the Doctor’s team',
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

export const SequenceForDiagnosticStatus = [
  DIAGNOSTIC_ORDER_STATUS.ORDER_FAILED,
  DIAGNOSTIC_ORDER_STATUS.ORDER_PLACED,
  DIAGNOSTIC_ORDER_STATUS.ORDER_INITIATED,
  DIAGNOSTIC_ORDER_STATUS.PAYMENT_FAILED,
  DIAGNOSTIC_ORDER_STATUS.PAYMENT_SUCCESSFUL,
  DIAGNOSTIC_ORDER_STATUS.PICKUP_REQUESTED,
  DIAGNOSTIC_ORDER_STATUS.ORDER_CANCELLED,
  DIAGNOSTIC_ORDER_STATUS.PICKUP_CONFIRMED,
  DIAGNOSTIC_ORDER_STATUS.SAMPLE_COLLECTED,
  DIAGNOSTIC_ORDER_STATUS.SAMPLE_RECEIVED_IN_LAB,
  DIAGNOSTIC_ORDER_STATUS.REPORT_GENERATED,
  DIAGNOSTIC_ORDER_STATUS.ORDER_COMPLETED,
];

export const DIAGNOSTIC_ORDER_FAILED_STATUS = [
  DIAGNOSTIC_ORDER_STATUS.ORDER_CANCELLED,
  DIAGNOSTIC_ORDER_STATUS.ORDER_FAILED,
  DIAGNOSTIC_ORDER_STATUS.PAYMENT_FAILED,
];
export const DIAGNOSTIC_ORDER_FOR_PREPDATA = [
  DIAGNOSTIC_ORDER_STATUS.ORDER_INITIATED,
  DIAGNOSTIC_ORDER_STATUS.PICKUP_REQUESTED,
  DIAGNOSTIC_ORDER_STATUS.PICKUP_CONFIRMED,
  DIAGNOSTIC_ORDER_STATUS.PHLEBO_CHECK_IN,
  DIAGNOSTIC_ORDER_STATUS.PHLEBO_COMPLETED,
  DIAGNOSTIC_ORDER_STATUS.ORDER_RESCHEDULED,
  DIAGNOSTIC_ORDER_STATUS.ORDER_RESCHEDULED_REQUEST,
  DIAGNOSTIC_ORDER_STATUS.PAYMENT_PENDING,
  DIAGNOSTIC_ORDER_STATUS.PAYMENT_SUCCESSFUL,
];

export const DIAGNOSTIC_JUSPAY_REFUND_STATUS = [
  REFUND_STATUSES.FAILURE,
  REFUND_STATUSES.PENDING,
  REFUND_STATUSES.SUCCESS,
  REFUND_STATUSES.MANUAL_REVIEW,
  REFUND_STATUSES.REFUND_REQUEST_NOT_SENT,
];

export const DIAGNOSTIC_JUSPAY_INVALID_REFUND_STATUS = [
  REFUND_STATUSES.FAILURE,
  REFUND_STATUSES.MANUAL_REVIEW,
  REFUND_STATUSES.REFUND_REQUEST_NOT_SENT,
];

export const DIAGNOSTIC_COMPLETED_STATUS = [
  DIAGNOSTIC_ORDER_STATUS.REPORT_GENERATED,
  DIAGNOSTIC_ORDER_STATUS.SAMPLE_REJECTED_IN_LAB,
  REFUND_STATUSES.SUCCESS,
];

export const DIAGNOSTIC_CONFIRMED_STATUS = [
  DIAGNOSTIC_ORDER_STATUS.PICKUP_CONFIRMED,
  DIAGNOSTIC_ORDER_STATUS.PHLEBO_CHECK_IN,
];

export const DIAGNOSTIC_COLLECTION_STATUS = [
  DIAGNOSTIC_ORDER_STATUS.SAMPLE_COLLECTED,
  DIAGNOSTIC_ORDER_STATUS.PHLEBO_COMPLETED,
];

export const DIAGNOSTIC_LAB_COLLECTION_STATUS = [
  DIAGNOSTIC_ORDER_STATUS.SAMPLE_COLLECTED_IN_LAB,
  DIAGNOSTIC_ORDER_STATUS.SAMPLE_NOT_COLLECTED_IN_LAB,
];

export const DIAGNOSTIC_LAB_TESTING_STATUS = [
  DIAGNOSTIC_ORDER_STATUS.SAMPLE_RECEIVED_IN_LAB,
  DIAGNOSTIC_ORDER_STATUS.SAMPLE_TESTED,
];

export const DIAGNOSTIC_SAMPLE_COLLECTED_STATUS = [
  DIAGNOSTIC_ORDER_STATUS.SAMPLE_SUBMITTED,
  DIAGNOSTIC_ORDER_STATUS.SAMPLE_COLLECTED,
  DIAGNOSTIC_ORDER_STATUS.SAMPLE_COLLECTED_IN_LAB,
  DIAGNOSTIC_ORDER_STATUS.SAMPLE_RECEIVED_IN_LAB,
  DIAGNOSTIC_ORDER_STATUS.SAMPLE_TESTED,
];

export const DIAGNOSTIC_VERTICAL_STATUS_TO_SHOW = [
  DIAGNOSTIC_ORDER_STATUS.ORDER_INITIATED,
  DIAGNOSTIC_ORDER_STATUS.PAYMENT_PENDING,
  DIAGNOSTIC_ORDER_STATUS.ORDER_FAILED,
  DIAGNOSTIC_ORDER_STATUS.ORDER_PLACED,
  DIAGNOSTIC_ORDER_STATUS.PAYMENT_SUCCESSFUL,
  DIAGNOSTIC_ORDER_STATUS.PAYMENT_FAILED,
  DIAGNOSTIC_ORDER_STATUS.ORDER_INITIATED,
  DIAGNOSTIC_ORDER_STATUS.PICKUP_REQUESTED,
  DIAGNOSTIC_ORDER_STATUS.PICKUP_CONFIRMED,
  DIAGNOSTIC_ORDER_STATUS.ORDER_RESCHEDULED,
  DIAGNOSTIC_ORDER_STATUS.PHLEBO_CHECK_IN,
  DIAGNOSTIC_ORDER_STATUS.PHLEBO_COMPLETED,
  DIAGNOSTIC_ORDER_STATUS.SAMPLE_COLLECTED_IN_LAB,
  DIAGNOSTIC_ORDER_STATUS.SAMPLE_COLLECTED,
  DIAGNOSTIC_ORDER_STATUS.SAMPLE_NOT_COLLECTED_IN_LAB,
  DIAGNOSTIC_ORDER_STATUS.REPORT_GENERATED,
  DIAGNOSTIC_ORDER_STATUS.ORDER_CANCELLED,
  DIAGNOSTIC_ORDER_STATUS.ORDER_COMPLETED,
  DIAGNOSTIC_ORDER_STATUS.ORDER_RESCHEDULED_REQUEST,
  DIAGNOSTIC_ORDER_STATUS.ORDER_CANCELLED_REQUEST,
  'ORDER_CANCELLED_AFTER_REGISTRATION',
  DIAGNOSTIC_ORDER_STATUS.SAMPLE_REJECTED_IN_LAB,
  DIAGNOSTIC_ORDER_STATUS.SAMPLE_SUBMITTED,
  DIAGNOSTIC_ORDER_STATUS.PARTIAL_ORDER_COMPLETED,
  REFUND_STATUSES.PENDING,
  REFUND_STATUSES.SUCCESS,
];

export const DIAGNOSTIC_HORIZONTAL_STATUS_TO_SHOW = [
  DIAGNOSTIC_ORDER_STATUS.PAYMENT_SUCCESSFUL,
  DIAGNOSTIC_ORDER_STATUS.ORDER_INITIATED,
  DIAGNOSTIC_ORDER_STATUS.PICKUP_REQUESTED,
  DIAGNOSTIC_ORDER_STATUS.PICKUP_CONFIRMED,
  DIAGNOSTIC_ORDER_STATUS.PHLEBO_CHECK_IN,
  DIAGNOSTIC_ORDER_STATUS.PHLEBO_COMPLETED,
  DIAGNOSTIC_ORDER_STATUS.SAMPLE_COLLECTED_IN_LAB,
  DIAGNOSTIC_ORDER_STATUS.SAMPLE_COLLECTED,
  'SAMPLE_NOT_COLLECTED_IN_LAB',
  DIAGNOSTIC_ORDER_STATUS.SAMPLE_RECEIVED_IN_LAB,
  DIAGNOSTIC_ORDER_STATUS.SAMPLE_TESTED,
  DIAGNOSTIC_ORDER_STATUS.REPORT_GENERATED,
  'ORDER_CANCELLED_AFTER_REGISTRATION',
  DIAGNOSTIC_ORDER_STATUS.SAMPLE_REJECTED_IN_LAB,
];

export const DIAGNOSTIC_FAILURE_STATUS_ARRAY = [
  DIAGNOSTIC_ORDER_STATUS.ORDER_CANCELLED,
  DIAGNOSTIC_ORDER_STATUS.ORDER_FAILED,
  DIAGNOSTIC_ORDER_STATUS.PAYMENT_FAILED,
  DIAGNOSTIC_ORDER_STATUS.SAMPLE_REJECTED_IN_LAB,
];

export const DIAGNOSTIC_FULLY_DONE_STATUS_ARRAY = [
  DIAGNOSTIC_ORDER_STATUS.REPORT_GENERATED,
  DIAGNOSTIC_ORDER_STATUS.ORDER_COMPLETED,
];

export const DIAGNOSTIC_REPORT_GENERATED_STATUS_ARRAY = [
  DIAGNOSTIC_ORDER_STATUS.REPORT_GENERATED,
  DIAGNOSTIC_ORDER_STATUS.ORDER_COMPLETED,
  DIAGNOSTIC_ORDER_STATUS.PARTIAL_ORDER_COMPLETED,
];

export const DIAGNOSTIC_SAMPLE_SUBMITTED_STATUS_ARRAY = [
  DIAGNOSTIC_ORDER_STATUS.SAMPLE_SUBMITTED,
  DIAGNOSTIC_ORDER_STATUS.SAMPLE_COLLECTED,
  DIAGNOSTIC_ORDER_STATUS.SAMPLE_COLLECTED_IN_LAB,
  DIAGNOSTIC_ORDER_STATUS.SAMPLE_RECEIVED_IN_LAB,
  DIAGNOSTIC_ORDER_STATUS.SAMPLE_NOT_COLLECTED_IN_LAB,
  DIAGNOSTIC_ORDER_STATUS.SAMPLE_TESTED,
];

export const DIAGNOSTIC_STATUS_BEFORE_SUBMITTED = [
  DIAGNOSTIC_ORDER_STATUS.ORDER_INITIATED,
  DIAGNOSTIC_ORDER_STATUS.ORDER_FAILED,
  DIAGNOSTIC_ORDER_STATUS.PAYMENT_PENDING,
  DIAGNOSTIC_ORDER_STATUS.PAYMENT_SUCCESSFUL,
  DIAGNOSTIC_ORDER_STATUS.ORDER_RESCHEDULED,
  DIAGNOSTIC_ORDER_STATUS.PICKUP_REQUESTED,
  DIAGNOSTIC_ORDER_STATUS.PICKUP_CONFIRMED,
  DIAGNOSTIC_ORDER_STATUS.PHLEBO_CHECK_IN,
  DIAGNOSTIC_ORDER_STATUS.PHLEBO_COMPLETED,
];

export const DIAGNOSITC_PHELBO_TRACKING_STATUS = [
  DIAGNOSTIC_ORDER_STATUS.PHLEBO_CHECK_IN,
  DIAGNOSTIC_ORDER_STATUS.PHLEBO_COMPLETED,
];

export const DIAGNOSTIC_SHOW_OTP_STATUS = [
  DIAGNOSTIC_ORDER_STATUS.PICKUP_REQUESTED,
  DIAGNOSTIC_ORDER_STATUS.PICKUP_CONFIRMED,
  DIAGNOSTIC_ORDER_STATUS.PHLEBO_CHECK_IN,
];

export const DIAGNOSTIC_PAYMENT_MODE_STATUS_ARRAY = [
  DIAGNOSTIC_ORDER_STATUS.ORDER_FAILED,
  DIAGNOSTIC_ORDER_STATUS.PAYMENT_FAILED,
];
export const DIAGNOSTIC_SUB_STATUS_TO_SHOW = [
  DIAGNOSTIC_ORDER_STATUS.ORDER_FAILED,
  DIAGNOSTIC_ORDER_STATUS.PAYMENT_FAILED,
  DIAGNOSTIC_ORDER_STATUS.PAYMENT_PENDING,
];

export const TestsNewFeedbackData = {
  options: [
    'Wrong Report recieved',
    'Delayed Report generation',
    'Did not get the required time slot',
    'Inappropriate behaviour of diagnostics staff',
    'Insufficient communication to customer',
    'Difficulty in finding the test while booking order',
    'Others (Please specify)',
  ],
};

export const TestsFeedBackData = {
  POOR: {
    question: 'What went wrong?',
    options: [
      'Wrong Report received',
      'Delayed Report generation',
      'Did not get the required time slot',
      'Inappropriate behaviour of pick up person',
      'Insufficient communication to customer',
      'Difficulty in finding the test while booking order',
      'Others',
    ],
  },
  OKAY: {
    question: 'What could have been improved?',
    options: [
      'Report generation time',
      "Sample Pick up person's training and punctuality",
      'Number of time slots to choose from',
      'Options of Tests to choose from',
      'Communication to customer',
      'Order Booking Process',
      'Others',
    ],
  },
  GOOD: {
    question: 'Thanks! What could make this a Great experience for you?',
    options: [
      'More tests to choose from',
      'Simpler booking process',
      'Quicker report generation time',
      'Better trained pick-up person',
      'More punctual pick-up person',
      'Others',
    ],
  },
  GREAT: {
    question: 'Thanks! What went well?',
    options: [
      'Booking experience',
      'Variety and options to choose from',
      'Timely sample pick-up',
      'Friendly and polite delivery person',
    ],
  },
};

export const CancelConsultation = {
  reason: [
    string.ReasonFor_Cancel_Consultation.doctorDidNotJoin,
    string.ReasonFor_Cancel_Consultation.bookedForWrongUser,
    string.ReasonFor_Cancel_Consultation.doctorDeniedMode,
    string.ReasonFor_Cancel_Consultation.audioVideoIssue,
    string.ReasonFor_Cancel_Consultation.otherReasons,
  ],
};

export const stepsToBookArray = [
  {
    heading: string.diagnostics.bookOnline,
    subtext: string.diagnostics.bookOnlineSubText,
    image: require('@aph/mobile-patients/src/components/ui/icons/stepsForBooking_1.webp'),
  },
  {
    heading: string.diagnostics.hcSample,
    subtext: string.diagnostics.hcSampleSubText,
    image: require('@aph/mobile-patients/src/components/ui/icons/stepsForBooking_2.webp'),
  },
  {
    heading: string.diagnostics.fastReport,
    subtext: string.diagnostics.fastReportSubText,
    image: require('@aph/mobile-patients/src/components/ui/icons/stepsForBooking_3.webp'),
  },
];

export const BLACK_LIST_CANCEL_STATUS_ARRAY = [
  DIAGNOSTIC_ORDER_STATUS.PHLEBO_CHECK_IN,
  DIAGNOSTIC_ORDER_STATUS.PHLEBO_COMPLETED,
  DIAGNOSTIC_ORDER_STATUS.ORDER_FAILED,
  DIAGNOSTIC_ORDER_STATUS.PAYMENT_FAILED,
  DIAGNOSTIC_ORDER_STATUS.SAMPLE_COLLECTED,
  DIAGNOSTIC_ORDER_STATUS.SAMPLE_COLLECTED_IN_LAB,
  DIAGNOSTIC_ORDER_STATUS.SAMPLE_RECEIVED_IN_LAB,
  DIAGNOSTIC_ORDER_STATUS.SAMPLE_REJECTED_IN_LAB,
  DIAGNOSTIC_ORDER_STATUS.SAMPLE_NOT_COLLECTED_IN_LAB,
  DIAGNOSTIC_ORDER_STATUS.SAMPLE_TESTED,
  DIAGNOSTIC_ORDER_STATUS.REPORT_GENERATED,
  DIAGNOSTIC_ORDER_STATUS.ORDER_CANCELLED,
  DIAGNOSTIC_ORDER_STATUS.ORDER_COMPLETED,
  DIAGNOSTIC_ORDER_STATUS.PAYMENT_PENDING,
  'ORDER_CANCELLED_AFTER_REGISTRATION',
  DIAGNOSTIC_ORDER_STATUS.PARTIAL_ORDER_COMPLETED,
  DIAGNOSTIC_ORDER_STATUS.SAMPLE_SUBMITTED,
];

export const BLACK_LIST_RESCHEDULE_STATUS_ARRAY = [
  DIAGNOSTIC_ORDER_STATUS.PHLEBO_CHECK_IN,
  DIAGNOSTIC_ORDER_STATUS.PHLEBO_COMPLETED,
  DIAGNOSTIC_ORDER_STATUS.ORDER_FAILED,
  DIAGNOSTIC_ORDER_STATUS.PAYMENT_FAILED,
  DIAGNOSTIC_ORDER_STATUS.SAMPLE_COLLECTED,
  DIAGNOSTIC_ORDER_STATUS.SAMPLE_COLLECTED_IN_LAB,
  DIAGNOSTIC_ORDER_STATUS.SAMPLE_NOT_COLLECTED_IN_LAB,
  DIAGNOSTIC_ORDER_STATUS.SAMPLE_RECEIVED_IN_LAB,
  DIAGNOSTIC_ORDER_STATUS.SAMPLE_REJECTED_IN_LAB,
  DIAGNOSTIC_ORDER_STATUS.SAMPLE_TESTED,
  DIAGNOSTIC_ORDER_STATUS.REPORT_GENERATED,
  DIAGNOSTIC_ORDER_STATUS.ORDER_CANCELLED,
  DIAGNOSTIC_ORDER_STATUS.ORDER_COMPLETED,
  DIAGNOSTIC_ORDER_STATUS.PAYMENT_PENDING,
  'ORDER_CANCELLED_AFTER_REGISTRATION',
  DIAGNOSTIC_ORDER_STATUS.PARTIAL_ORDER_COMPLETED,
  DIAGNOSTIC_ORDER_STATUS.SAMPLE_SUBMITTED,
];

export const DIAGNOSTIC_ONLINE_PAYMENT_STATUS = [
  DIAGNOSTIC_ORDER_STATUS.PAYMENT_FAILED,
  DIAGNOSTIC_ORDER_STATUS.PAYMENT_PENDING,
  DIAGNOSTIC_ORDER_STATUS.PAYMENT_SUCCESSFUL,
];

export const DIAGNOSTIC_EDIT_PROFILE_ARRAY = [
  DIAGNOSTIC_ORDER_STATUS.PICKUP_REQUESTED,
  DIAGNOSTIC_ORDER_STATUS.PICKUP_CONFIRMED,
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
