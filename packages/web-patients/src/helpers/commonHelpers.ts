import { DEVICETYPE } from 'graphql/types/globalTypes';
import { GetDoctorDetailsById_getDoctorDetailsById_consultHours } from 'graphql/types/GetDoctorDetailsById';
import moment from 'moment';
import { GooglePlacesType } from 'components/LocationProvider';
import { CouponCategoryApplicable } from 'graphql/types/globalTypes';
import _lowerCase from 'lodash/lowerCase';
import _upperFirst from 'lodash/upperFirst';

declare global {
  interface Window {
    opera: any;
    vendor: any;
  }
}

interface paymentMethodInterface {
  [key: string]: string;
}

interface PharmaStateCodeMappingType {
  [key: string]: string;
}

const paymentMethodStrings: paymentMethodInterface = {
  DEBIT_CARD: 'Debit Card',
  CREDIT_CARD: 'Credit Card',
  NET_BANKING: 'Net Banking',
  PAYTM_WALLET: 'Paytm Wallet',
  CREDIT_CARD_EMI: 'Credit Card EMI',
  UPI: 'UPI',
  PAYTM_POSTPAID: 'Paytm Postpaid',
  COD: 'COD',
  EMI: 'EMI',
};

const locationRoutesBlackList: string[] = [
  '/covid19',
  '/track-symptoms',
  '/terms',
  '/privacy',
  '/contact',
  '/my-account',
  '/health-records',
  '/address-book',
  '/aboutUs',
  '/appointments',
  '/faq',
  '/needHelp',
  '/my-payments',
];

const MEDICINE_QUANTITY: number = 20;

const sortByProperty = (arr: any[], property: string) =>
  arr.sort((a, b) => parseFloat(a[property]) - parseFloat(b[property]));

const getDeviceType = (): DEVICETYPE => {
  var userAgent = navigator.userAgent || navigator.vendor || window.opera;
  if (!navigator || !navigator.userAgent) return;
  if (screen.width < 768) {
    //mobile
    return /Android/i.test(userAgent)
      ? DEVICETYPE.ANDROID
      : /iPhone/i.test(userAgent)
      ? DEVICETYPE.IOS
      : null;
  } else {
    return DEVICETYPE.DESKTOP;
  }
};

const getPaymentMethodFullName = (paymentMethodName: string) => {
  if (paymentMethodStrings[paymentMethodName]) return paymentMethodStrings[paymentMethodName];
  return paymentMethodName;
};

const pharmaStateCodeMapping: PharmaStateCodeMappingType = {
  'Andaman and Nicobar Islands': 'AN',
  'Andhra Pradesh': 'AP',
  'Arunachal Pradesh': 'AR',
  Assam: 'AS',
  Bihar: 'BR',
  Chandigarh: 'CH',
  Chhattisgarh: 'CT',
  'Daman and Diu': 'DD',
  Delhi: 'DL',
  'Dadra and Nagar Haveli': 'DN',
  Goa: 'GA',
  Gujarat: 'GJ',
  'Himachal Pradesh': 'HP',
  Haryana: 'HR',
  Jharkhand: 'JH',
  'Jammu and Kashmir': 'JK',
  Karnataka: 'KA',
  Kerala: 'KL',
  Lakshadweep: 'LD',
  Maharashtra: 'MH',
  Meghalaya: 'ML',
  Manipur: 'MN',
  'Madhya Pradesh': 'MP',
  Mizoram: 'MZ',
  Nagaland: 'NL',
  Odisha: 'OR',
  Punjab: 'PB',
  Puducherry: 'PY',
  Rajasthan: 'RJ',
  Sikkim: 'SK',
  'Tamil Nadu': 'TN',
  Tripura: 'TR',
  Telangana: 'TS',
  'Uttar Pradesh': 'UP',
  Uttarakhand: 'UT',
  'West Bengal': 'WB',
};

const customerCareNumber = '04048217222';

const readableParam = (param: string) => {
  const replaceSpace =
    param && param.includes('-')
      ? param.replace(/-/g, ' ')
      : param.replace(/\s+/g, '-').toLowerCase();
  return (replaceSpace && replaceSpace.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '')) || '';
};

const dayMapping = {
  MONDAY: 'Mo',
  TUESDAY: 'Tu',
  WEDNESDAY: 'We',
  THURSDAY: 'Th',
  FRIDAY: 'Fr',
  SATURDAY: 'SA',
  SUNDAY: 'Su',
};

const getOpeningHrs = (
  consultHours: (GetDoctorDetailsById_getDoctorDetailsById_consultHours | null)[]
) => {
  return consultHours.map((consult) => {
    const { startTime, endTime, weekDay } = consult;
    return `${dayMapping[weekDay]} ${startTime}-${endTime}`;
  });
};

const toBase64 = (file: any) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.onerror = (error) => reject(error);
  });

const getDiffInDays = (nextAvailability: string) => {
  if (nextAvailability && nextAvailability.length > 0) {
    const nextAvailabilityTime = nextAvailability && moment(nextAvailability);
    const currentTime = moment(new Date());
    const differenceInDays = nextAvailabilityTime.diff(currentTime, 'days');
    return differenceInDays;
  } else {
    return 0;
  }
};
const getDiffInMinutes = (doctorAvailablePhysicalSlots: string) => {
  if (doctorAvailablePhysicalSlots && doctorAvailablePhysicalSlots.length > 0) {
    const nextAvailabilityTime =
      doctorAvailablePhysicalSlots && moment(doctorAvailablePhysicalSlots);
    const currentTime = moment(new Date());
    const differenceInMinutes = currentTime.diff(nextAvailabilityTime, 'minutes') * -1;
    return differenceInMinutes + 1; // for some reason moment is returning 1 second less. so that 1 is added.;
  } else {
    return 0;
  }
};

const getDiffInHours = (doctorAvailablePhysicalSlots: string) => {
  if (doctorAvailablePhysicalSlots && doctorAvailablePhysicalSlots.length > 0) {
    const nextAvailabilityTime =
      doctorAvailablePhysicalSlots && moment(doctorAvailablePhysicalSlots);
    const currentTime = moment(new Date());
    const differenceInHours = currentTime.diff(nextAvailabilityTime, 'hours') * -1;
    return Math.round(differenceInHours) + 1;
  } else {
    return 0;
  }
};
const acceptedFilesNamesForFileUpload = ['png', 'jpg', 'jpeg', 'pdf'];
const MAX_FILE_SIZE_FOR_UPLOAD = 2000000;
const INVALID_FILE_SIZE_ERROR = 'Invalid File Size. File size must be less than 2MB';
const INVALID_FILE_TYPE_ERROR =
  'Invalid File Extension. Only files with .jpg, .png or .pdf extensions are allowed.';
const NO_SERVICEABLE_MESSAGE = 'Sorry, not serviceable in your area';
const TAT_API_TIMEOUT_IN_MILLI_SEC = 10000; // in milli sec

const findAddrComponents = (
  proptoFind: GooglePlacesType,
  addrComponents: {
    long_name: string;
    short_name: string;
    types: GooglePlacesType[];
  }[]
) => {
  const findItem = addrComponents.find((item) => item.types.indexOf(proptoFind) > -1);
  return findItem ? findItem.short_name || findItem.long_name : '';
};

const ORDER_BILLING_STATUS_STRINGS = {
  TOTAL_ORDER_BILLED: 'Total Ordered Value',
  TOTAL_BILLED_VALUE: 'Total Billed Value',
  COD_AMOUNT_TO_PAY: 'COD amount to Pay',
  REFUND_TO_BE_INITIATED: 'Refund to be initiated',
  AMOUNT_TO_BE_PAID_ON_DELIVERY: 'Amount to be paid on delivery',
};

// Starting of doctors list based on specialty related changes

enum DOCTOR_CATEGORY {
  APOLLO = 'APOLLO',
  PARTNER = 'PARTNER',
}

interface SearchObject {
  searchKeyword: string;
  cityName: string[] | null;
  experience: string[] | null;
  availability: string[] | null;
  fees: string[] | null;
  gender: string[] | null;
  language: string[] | null;
  dateSelected: string;
  specialtyName: string;
  prakticeSpecialties: string | null;
}

const feeInRupees = ['100 - 500', '500 - 1000', '1000+'];
const experienceList = [
  { key: '0-5', value: '0 - 5' },
  { key: '6-10', value: '6 - 10' },
  { key: '11-15', value: '11 - 15' },
  { key: '16+', value: '16 +' },
];
const genderList = [
  { key: 'MALE', value: 'Male' },
  { key: 'FEMALE', value: 'Female' },
];
const languageList = ['English', 'Telugu'];
const availabilityList = ['Now', 'Today', 'Tomorrow', 'Next 3 days'];

// End of doctors list based on specialty related changes

const getTypeOfProduct = (type: string) => {
  switch (_lowerCase(type)) {
    case 'pharma':
      return CouponCategoryApplicable.PHARMA;
    case 'fmcg':
      return CouponCategoryApplicable.FMCG;
    default:
      return CouponCategoryApplicable.FMCG;
  }
};

const getSymptoms = (symptoms: string) => {
  const symptomsList = symptoms.split(', ');
  const structuredSymptomString = symptomsList.map((symptom: string) => {
    return _upperFirst(symptom.trim());
  });
  return structuredSymptomString.join(', ');
};

export {
  getSymptoms,
  getTypeOfProduct,
  feeInRupees,
  experienceList,
  genderList,
  languageList,
  availabilityList,
  SearchObject,
  DOCTOR_CATEGORY,
  getDiffInDays,
  getDiffInMinutes,
  getDiffInHours,
  NO_SERVICEABLE_MESSAGE,
  sortByProperty,
  locationRoutesBlackList,
  getDeviceType,
  getPaymentMethodFullName,
  pharmaStateCodeMapping,
  customerCareNumber,
  MEDICINE_QUANTITY,
  readableParam,
  getOpeningHrs,
  acceptedFilesNamesForFileUpload,
  MAX_FILE_SIZE_FOR_UPLOAD,
  INVALID_FILE_SIZE_ERROR,
  INVALID_FILE_TYPE_ERROR,
  toBase64,
  TAT_API_TIMEOUT_IN_MILLI_SEC,
  findAddrComponents,
  ORDER_BILLING_STATUS_STRINGS,
};
