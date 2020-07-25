import { DEVICETYPE } from 'graphql/types/globalTypes';
import { GetDoctorDetailsById_getDoctorDetailsById_consultHours } from 'graphql/types/GetDoctorDetailsById';
import moment from 'moment';
import { GooglePlacesType } from 'components/LocationProvider';
import { CouponCategoryApplicable } from 'graphql/types/globalTypes';
import _lowerCase from 'lodash/lowerCase';
import _upperFirst from 'lodash/upperFirst';
import { MEDICINE_ORDER_STATUS } from 'graphql/types/globalTypes';

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
const kavachHelpline = '18605000202';

const readableParam = (param: string) => {
  const a = 'àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;';
  const b = 'aaaaaaaaaacccddeeeeeeeegghiiiiiilmnnnnoooooooooprrsssssttuuuuuuuuuwxyyzzz------';
  const p = new RegExp(a.split('').join('|'), 'g');

  return param
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(p, (c) => b.charAt(a.indexOf(c))) // Replace special characters
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word characters
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
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
    const nextAvailabilityTime = moment(new Date(nextAvailability));
    const currentTime = moment(new Date());
    const differenceInDays = nextAvailabilityTime.diff(currentTime, 'days');
    return differenceInDays;
  } else {
    return 0;
  }
};
const getDiffInMinutes = (doctorAvailableSlots: string) => {
  if (doctorAvailableSlots && doctorAvailableSlots.length > 0) {
    const nextAvailabilityTime = moment(doctorAvailableSlots);
    const currentTime = moment(new Date());
    const differenceInMinutes = currentTime.diff(nextAvailabilityTime, 'minutes') * -1;
    return differenceInMinutes + 1; // for some reason moment is returning 1 second less. so that 1 is added.;
  } else {
    return 0;
  }
};

const getDiffInHours = (doctorAvailableSlots: string) => {
  if (doctorAvailableSlots && doctorAvailableSlots.length > 0) {
    const nextAvailabilityTime = moment(doctorAvailableSlots);
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

const getSymptoms = (symptoms: string) => {
  const symptomsList = symptoms.split(', ');
  const structuredSymptomString = symptomsList.map((symptom: string) => {
    return _upperFirst(symptom.trim());
  });
  return structuredSymptomString.join(', ');
};

const getStatus = (status: MEDICINE_ORDER_STATUS) => {
  let statusString = '';
  switch (status) {
    case MEDICINE_ORDER_STATUS.CANCELLED:
      return 'Order Cancelled';
    case MEDICINE_ORDER_STATUS.CANCEL_REQUEST:
      return 'Cancel Requested';
    case MEDICINE_ORDER_STATUS.DELIVERED:
      return 'Order Delivered';
    case MEDICINE_ORDER_STATUS.ITEMS_RETURNED:
      return 'Items Returned';
    case MEDICINE_ORDER_STATUS.ORDER_INITIATED:
      return 'Order Initiated';
    case MEDICINE_ORDER_STATUS.ORDER_BILLED:
      return 'Order Billed and Packed';
    case MEDICINE_ORDER_STATUS.ORDER_CONFIRMED:
      return 'Order Confirmed';
    case MEDICINE_ORDER_STATUS.ORDER_FAILED:
      return 'Order Failed';
    case MEDICINE_ORDER_STATUS.ORDER_PLACED:
      return 'Order Placed';
    case MEDICINE_ORDER_STATUS.ORDER_VERIFIED:
      return 'Order Verified';
    case MEDICINE_ORDER_STATUS.OUT_FOR_DELIVERY:
      return 'Order Dispatched';
    case MEDICINE_ORDER_STATUS.PAYMENT_FAILED:
      return 'Payment Failed';
    case MEDICINE_ORDER_STATUS.PAYMENT_PENDING:
      return 'Payment Pending';
    case MEDICINE_ORDER_STATUS.PAYMENT_SUCCESS:
      return 'Payment Success';
    case MEDICINE_ORDER_STATUS.PICKEDUP:
      return 'Order Picked Up';
    case MEDICINE_ORDER_STATUS.PRESCRIPTION_CART_READY:
      return 'Prescription Cart Ready';
    case MEDICINE_ORDER_STATUS.PRESCRIPTION_UPLOADED:
      return 'Prescription Uploaded';
    case MEDICINE_ORDER_STATUS.RETURN_ACCEPTED:
      return 'Return Accepted';
    case MEDICINE_ORDER_STATUS.RETURN_INITIATED:
      return 'Return Requested';
    case MEDICINE_ORDER_STATUS.READY_AT_STORE:
      return 'Ready At Store';
    case 'TO_BE_DELIVERED' as any:
      return 'Expected Order Delivery';
    default:
      statusString = status
        .split('_')
        .map((item) => `${item.slice(0, 1).toUpperCase()}${item.slice(1).toLowerCase()}`)
        .join(' ');
      return statusString;
  }
};

const isRejectedStatus = (status: MEDICINE_ORDER_STATUS) => {
  return (
    status === MEDICINE_ORDER_STATUS.CANCELLED || status === MEDICINE_ORDER_STATUS.PAYMENT_FAILED
  );
};

const getAvailability = (nextAvailability: string, differenceInMinutes: number, type: string) => {
  const nextAvailabilityMoment = moment(nextAvailability);
  const tomorrowAvailabilityHourTime = moment('06:00', 'HH:mm');
  const tomorrowAvailabilityTime = moment()
    .add('days', 1)
    .set({
      hour: tomorrowAvailabilityHourTime.get('hour'),
      minute: tomorrowAvailabilityHourTime.get('minute'),
    });
  const diffInHoursForTomorrowAvailabilty = nextAvailabilityMoment.diff(
    tomorrowAvailabilityTime,
    'minutes'
  );
  const isAvailableTomorrow =
    diffInHoursForTomorrowAvailabilty > 0 && diffInHoursForTomorrowAvailabilty < 1440;
  const isAvailableAfterTomorrow = diffInHoursForTomorrowAvailabilty >= 1440;
  const isAvailableAfterMonth = nextAvailabilityMoment.diff(moment(), 'days') > 30;
  const message = type === 'doctorInfo' ? 'consult' : 'available';
  if (differenceInMinutes > 0 && differenceInMinutes < 120) {
    return `${message} in ${differenceInMinutes} ${differenceInMinutes === 1 ? 'min' : 'mins'}`;
  } else if (isAvailableAfterMonth && type === 'consultType') {
    // only applies for consultType
    return `Available after a month`;
  } else if (isAvailableTomorrow) {
    return type === 'doctorInfo' || type === 'markup'
      ? `${message} tomorrow`
      : `${message} tomorrow at ${nextAvailabilityMoment.format('hh:mm A')}`;
  } else if (isAvailableAfterTomorrow) {
    return `${message} in ${
      nextAvailabilityMoment.diff(tomorrowAvailabilityTime, 'days') + 1 // intentionally added + 1 as we need to consider 6 am as next day
    } days`;
  } else if (!isAvailableTomorrow && differenceInMinutes >= 120) {
    return `${message} at ${nextAvailabilityMoment.format('hh:mm A')}`;
  } else {
    return type === 'doctorInfo' ? 'Book Consult' : 'Available';
  }
};

export {
  getAvailability,
  isRejectedStatus,
  getStatus,
  getSymptoms,
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
  getTypeOfProduct,
  kavachHelpline,
};
