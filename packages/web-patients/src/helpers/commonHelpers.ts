import { DEVICETYPE } from 'graphql/types/globalTypes';

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

const PharmaStateCodeMapping: PharmaStateCodeMappingType = {
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

export {
  sortByProperty,
  locationRoutesBlackList,
  getDeviceType,
  getPaymentMethodFullName,
  PharmaStateCodeMapping,
};
