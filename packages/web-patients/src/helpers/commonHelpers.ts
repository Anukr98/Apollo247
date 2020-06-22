import { DEVICETYPE } from 'graphql/types/globalTypes';
import { GetDoctorDetailsById_getDoctorDetailsById_consultHours } from 'graphql/types/GetDoctorDetailsById';
import moment from 'moment';
import { GooglePlacesType } from 'components/LocationProvider';
import { CouponCategoryApplicable } from 'graphql/types/globalTypes';
import _lowerCase from 'lodash/lowerCase';

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
  const first =
    param && param.includes('-')
      ? param.replace(/-/g, ' ')
      : param.replace(/\s+/g, '-').toLowerCase();
  const second =
    first && first.includes('/') ? first.replace(/[\/]/g, '_') : first.replace(/_/g, '/');
  return first && second ? second.replace(/\./, '') : '';
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

export {
  getTypeOfProduct,
  getDiffInDays,
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
};
