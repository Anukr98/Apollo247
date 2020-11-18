import { LocationData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { savePatientAddress_savePatientAddress_patientAddress } from '@aph/mobile-patients/src/graphql/types/savePatientAddress';
import {
  getPackageData,
  getPlaceInfoByLatLng,
  GooglePlacesType,
  MedicineProduct,
  PlacesApiResponse,
  medCartItemsDetailsApi,
  MedicineOrderBilledItem,
  availabilityApi247,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import {
  MEDICINE_ORDER_STATUS,
  Relation,
  MEDICINE_UNIT,
  SaveSearchInput,
  STATUS,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import Geolocation from '@react-native-community/geolocation';
import NetInfo from '@react-native-community/netinfo';
import moment from 'moment';
import AsyncStorage from '@react-native-community/async-storage';
import { Alert, Dimensions, Platform, Linking, NativeModules } from 'react-native';
import RNAndroidLocationEnabler from 'react-native-android-location-enabler';
import Permissions from 'react-native-permissions';
import { DiagnosticsCartItem } from '../components/DiagnosticsCartProvider';
import { getCaseSheet_getCaseSheet_caseSheetDetails_diagnosticPrescription } from '../graphql/types/getCaseSheet';
import { apiRoutes } from './apiRoutes';
import {
  CommonBugFender,
  setBugFenderLog,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { getDiagnosticSlots_getDiagnosticSlots_diagnosticSlot_slotInfo } from '@aph/mobile-patients/src/graphql/types/getDiagnosticSlots';
import {
  getMedicineOrderOMSDetails_getMedicineOrderOMSDetails_medicineOrderDetails,
  getMedicineOrderOMSDetails_getMedicineOrderOMSDetails_medicineOrderDetails_medicineOrderLineItems,
} from '@aph/mobile-patients/src/graphql/types/getMedicineOrderOMSDetails';
import {
  getPatientAllAppointments_getPatientAllAppointments_appointments_caseSheet,
  getPatientAllAppointments_getPatientAllAppointments_appointments,
} from '@aph/mobile-patients/src/graphql/types/getPatientAllAppointments';
import { DoctorType } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import ApolloClient from 'apollo-client';
import {
  searchDiagnostics,
  searchDiagnosticsVariables,
} from '@aph/mobile-patients/src/graphql/types/searchDiagnostics';
import { saveSearch, saveSearchVariables } from '@aph/mobile-patients/src/graphql/types/saveSearch';
import {
  searchDiagnosticsByCityID,
  searchDiagnosticsByCityIDVariables,
  searchDiagnosticsByCityID_searchDiagnosticsByCityID_diagnostics,
} from '@aph/mobile-patients/src/graphql/types/searchDiagnosticsByCityID';
import {
  SAVE_SEARCH,
  SEARCH_DIAGNOSTICS,
  SEARCH_DIAGNOSTICS_BY_CITY_ID,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  WebEngageEvents,
  WebEngageEventName,
  ReorderMedicines,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import WebEngage from 'react-native-webengage';
import { GetCurrentPatients_getCurrentPatients_patients } from '@aph/mobile-patients/src/graphql/types/GetCurrentPatients';
import appsFlyer from 'react-native-appsflyer';
import { AppsFlyerEventName, AppsFlyerEvents } from './AppsFlyerEvents';
import { FirebaseEventName, FirebaseEvents } from './firebaseEvents';
import analytics from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';
import _ from 'lodash';
import string from '@aph/mobile-patients/src/strings/strings.json';
import {
  ShoppingCartItem,
  ShoppingCartContextProps,
  EPrescription,
} from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { UIElementsContextProps } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { NavigationScreenProp, NavigationRoute } from 'react-navigation';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { getLatestMedicineOrder_getLatestMedicineOrder_medicineOrderDetails } from '@aph/mobile-patients/src/graphql/types/getLatestMedicineOrder';
import { getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails } from '@aph/mobile-patients/src/graphql/types/getMedicineOrderOMSDetailsWithAddress';
import { Tagalys } from '@aph/mobile-patients/src/helpers/Tagalys';
import { handleUniversalLinks } from './UniversalLinks';
import { getDiagnosticSlotsWithAreaID_getDiagnosticSlotsWithAreaID_slots } from '../graphql/types/getDiagnosticSlotsWithAreaID';

const { RNAppSignatureHelper } = NativeModules;
const googleApiKey = AppConfig.Configuration.GOOGLE_API_KEY;
let onInstallConversionDataCanceller: any;
let onAppOpenAttributionCanceller: any;

interface AphConsole {
  error(message?: any, ...optionalParams: any[]): void;
  info(message?: any, ...optionalParams: any[]): void;
  log(message?: any, ...optionalParams: any[]): void;
  warn(message?: any, ...optionalParams: any[]): void;
  trace(message?: any, ...optionalParams: any[]): void;
  debug(message?: any, ...optionalParams: any[]): void;
  table(...data: any[]): void;
}

export interface TestSlot {
  employeeCode: string;
  employeeName: string;
  diagnosticBranchCode: string;
  date: Date;
  slotInfo: getDiagnosticSlots_getDiagnosticSlots_diagnosticSlot_slotInfo;
}

export interface TestSlotWithArea {
  employeeCode: string;
  employeeName: string;
  diagnosticBranchCode: string;
  date: Date;
  slotInfo: getDiagnosticSlotsWithAreaID_getDiagnosticSlotsWithAreaID_slots;
}

const isDebugOn = __DEV__;

export const aphConsole: AphConsole = {
  error: (message?: any, ...optionalParams: any[]) => {
    isDebugOn && console.log(message, ...optionalParams);
  },
  log: (message?: any, ...optionalParams: any[]) => {
    isDebugOn && console.log(message, ...optionalParams);
  },
  info: (message?: any, ...optionalParams: any[]) => {
    isDebugOn && console.info(message, ...optionalParams);
  },
  warn: (message?: any, ...optionalParams: any[]) => {
    isDebugOn && console.warn(message, ...optionalParams);
  },
  trace: (message?: any, ...optionalParams: any[]) => {
    isDebugOn && console.trace(message, ...optionalParams);
  },
  debug: (message?: any, ...optionalParams: any[]) => {
    isDebugOn && console.debug(message, ...optionalParams);
  },
  table: (...data: any[]) => {
    isDebugOn && console.table(...data);
  },
};

export const productsThumbnailUrl = (filePath: string, baseUrl?: string) =>
  (filePath || '').startsWith('http')
    ? filePath
    : `${baseUrl || AppConfig.Configuration.IMAGES_BASE_URL[0]}${filePath}`;

export const formatAddress = (address: savePatientAddress_savePatientAddress_patientAddress) => {
  const addrLine1 = [address.addressLine1, address.addressLine2].filter((v) => v).join(', ');
  const landmark = [address.landmark];
  // to handle state value getting twice
  const addrLine2 = [address.city, address.state]
    .filter((v) => v)
    .join(', ')
    .split(',')
    .map((v) => v.trim())
    .filter((item, idx, array) => array.indexOf(item) === idx)
    .join(', ');
  const formattedZipcode = address.zipcode ? ` - ${address.zipcode}` : '';
  return `${addrLine1}\n${addrLine2}${formattedZipcode}`;
};

export const formatAddressWithLandmark = (
  address: savePatientAddress_savePatientAddress_patientAddress
) => {
  const addrLine1 = removeConsecutiveComma(
    [address.addressLine1, address.addressLine2].filter((v) => v).join(', ')
  );
  const landmark = [address.landmark];
  // to handle state value getting twice
  const addrLine2 = removeConsecutiveComma(
    [address.city, address.state]
      .filter((v) => v)
      .join(', ')
      .split(',')
      .map((v) => v.trim())
      .filter((item, idx, array) => array.indexOf(item) === idx)
      .join(', ')
  );
  const formattedZipcode = address.zipcode ? ` - ${address.zipcode}` : '';
  if (address.landmark != '') {
    return `${addrLine1},\nLandmark: ${landmark}\n${addrLine2}${formattedZipcode}`;
  } else {
    return `${addrLine1}\n${addrLine2}${formattedZipcode}`;
  }
};

export const formatNameNumber = (address: savePatientAddress_savePatientAddress_patientAddress) => {
  if (address.name!) {
    return `${address.name}\n${address.mobileNumber}`;
  } else {
    return `${address.mobileNumber}`;
  }
};

export const isPastAppointment = (
  caseSheet:
    | (getPatientAllAppointments_getPatientAllAppointments_appointments_caseSheet | null)[]
    | null,
  item: getPatientAllAppointments_getPatientAllAppointments_appointments
) => {
  const case_sheet = followUpChatDaysCaseSheet(caseSheet);
  const caseSheetChatDays = g(case_sheet, '0' as any, 'followUpAfterInDays');
  const followUpAfterInDays =
    caseSheetChatDays || caseSheetChatDays === '0'
      ? caseSheetChatDays === '0'
        ? 0
        : Number(caseSheetChatDays) - 1
      : 6;
  return (
    item?.status === STATUS.CANCELLED ||
    !moment(new Date(item?.appointmentDateTime))
      .add(followUpAfterInDays, 'days')
      .startOf('day')
      .isSameOrAfter(moment(new Date()).startOf('day'))
  );
};

export const followUpChatDaysCaseSheet = (
  caseSheet:
    | (getPatientAllAppointments_getPatientAllAppointments_appointments_caseSheet | null)[]
    | null
) => {
  const case_sheet =
    caseSheet &&
    caseSheet
      .filter((j) => j && j.doctorType !== DoctorType.JUNIOR)
      .sort((a, b) => (b ? b.version || 1 : 1) - (a ? a.version || 1 : 1));
  return case_sheet;
};

export const formatOrderAddress = (
  address: savePatientAddress_savePatientAddress_patientAddress
) => {
  // to handle state value getting twice
  const addrLine = [address.addressLine1, address.addressLine2, address.city, address.state]
    .filter((v) => v)
    .join(', ')
    .split(',')
    .map((v) => v.trim())
    .filter((item, idx, array) => array.indexOf(item) === idx)
    .join(', ');
  const formattedZipcode = address.zipcode ? ` - ${address.zipcode}` : '';
  return `${addrLine}${formattedZipcode}`;
};

export const formatSelectedAddress = (
  address: savePatientAddress_savePatientAddress_patientAddress
) => {
  const formattedAddress = [
    address?.addressLine1,
    address?.addressLine2,
    address?.city,
    address?.state,
    address?.zipcode,
  ]
    .filter((item) => item)
    .join(', ');
  return formattedAddress;
};

export const formatAddressToLocation = (
  address: savePatientAddress_savePatientAddress_patientAddress
): LocationData => ({
  displayName: address?.city!,
  latitude: address?.latitude!,
  longitude: address?.longitude!,
  area: '',
  city: address?.city!,
  state: address?.state!,
  stateCode: address?.stateCode!,
  country: '',
  pincode: address?.zipcode!,
  lastUpdated: new Date().getTime(),
});

export const getUuidV4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const getOrderStatusText = (status: MEDICINE_ORDER_STATUS): string => {
  let statusString = '';
  switch (status) {
    case MEDICINE_ORDER_STATUS.CANCELLED:
      statusString = 'Order Cancelled';
      break;
    case MEDICINE_ORDER_STATUS.CANCEL_REQUEST:
      statusString = 'Cancel Requested';
      break;
    case MEDICINE_ORDER_STATUS.DELIVERED:
      statusString = 'Order Delivered';
      break;
    case MEDICINE_ORDER_STATUS.OUT_FOR_DELIVERY:
      statusString = 'Order Dispatched';
      break;
    case MEDICINE_ORDER_STATUS.ORDER_BILLED:
      statusString = 'Order Billed and Packed';
      break;
    case MEDICINE_ORDER_STATUS.PICKEDUP:
      statusString = 'Order Picked Up';
      break;
    case MEDICINE_ORDER_STATUS.READY_AT_STORE:
      statusString = 'Order Ready at Store';
      break;
    case MEDICINE_ORDER_STATUS.RETURN_INITIATED:
      statusString = 'Return Requested';
      break;
    case MEDICINE_ORDER_STATUS.PURCHASED_IN_STORE:
      statusString = 'Purchased In-store';
      break;
    case 'TO_BE_DELIVERED' as any:
      statusString = 'Expected Order Delivery';
      break;
    default:
      statusString = (status || '')
        .split('_')
        .map((item) => `${item.slice(0, 1).toUpperCase()}${item.slice(1).toLowerCase()}`)
        .join(' ');
  }
  return statusString;
};

export const getParameterByName = (name: string, url: string) => {
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
};

export const getDateFormat = (_date: string /*"2019-08-08T20:30:00.000Z"*/) => {
  const dateTime = _date.split('T');
  const date = dateTime[0].split('-');
  const time = dateTime[1].substring(0, 4).split(':');
  return new Date(
    parseInt(date[0], 10),
    parseInt(date[1], 10) - 1,
    parseInt(date[2], 10),
    parseInt(time[0], 10),
    parseInt(time[1], 10)
  );
};

type TimeArray = {
  label: string;
  time: string[];
}[];

export const divideSlots = (availableSlots: string[], date: Date) => {
  // const todayDate = new Date().toDateString().split('T')[0];
  const todayDate = moment(new Date()).format('YYYY-MM-DD');

  const array: TimeArray = [
    { label: 'Morning', time: [] },
    { label: 'Afternoon', time: [] },
    { label: 'Evening', time: [] },
    { label: 'Night', time: [] },
  ];

  const morningStartTime = moment('06:00', 'HH:mm');
  const morningEndTime = moment('12:00', 'HH:mm');
  const afternoonStartTime = moment('12:01', 'HH:mm');
  const afternoonEndTime = moment('17:00', 'HH:mm');
  const eveningStartTime = moment('17:01', 'HH:mm');
  const eveningEndTime = moment('21:00', 'HH:mm');
  const nightStartTime = moment('21:01', 'HH:mm');
  const nightEndTime = moment('05:59', 'HH:mm');

  availableSlots.forEach((slot) => {
    const IOSFormat = slot; //`${date.toISOString().split('T')[0]}T${slot}:00.000Z`;

    const formatedSlot = moment(IOSFormat)
      .local()
      .format('HH:mm'); //.format('HH:mm');
    const slotTime = moment(formatedSlot, 'HH:mm');

    if (
      todayDate === moment(date).format('YYYY-MM-DD') && //date.toDateString().split('T')[0] &&
      todayDate !== moment(IOSFormat).format('YYYY-MM-DD') //new Date(IOSFormat).toDateString().split('T')[0])
    ) {
      // console.log('today past');
    } else {
      if (new Date() < new Date(IOSFormat)) {
        if (slotTime.isBetween(nightEndTime, afternoonStartTime)) {
          array[0] = {
            label: 'Morning',
            time: [...array[0].time, slot],
          };
        } else if (slotTime.isBetween(morningEndTime, eveningStartTime)) {
          array[1] = {
            ...array[1],
            time: [...array[1].time, slot],
          };
        } else if (slotTime.isBetween(afternoonEndTime, nightStartTime)) {
          array[2] = {
            ...array[2],
            time: [...array[2].time, slot],
          };
        } else if (
          slotTime.isBetween(eveningEndTime, moment('23:59', 'HH:mm')) ||
          slotTime.isSame(moment('00:00', 'HH:mm')) ||
          slotTime.isBetween(moment('00:00', 'HH:mm'), morningStartTime)
        ) {
          array[3] = {
            ...array[3],
            time: [...array[3].time, slot],
          };
        }
      }
    }
  });
  return array;
};

export const handleGraphQlError = (
  error: any,
  message: string = 'Oops! seems like we are having an issue. Please try again.'
) => {
  console.log({ error });
  Alert.alert('Uh oh.. :(', message);
};

export const timeTo12HrFormat = (time: string) => {
  return moment(time).format('h:mm A');
};

export const timeDiffFromNow = (toDate: string) => {
  let timeDiff: Number = 0;
  const today: Date = new Date();
  const date2: Date = new Date(toDate);
  if (date2 && today) {
    timeDiff = Math.ceil(((date2 as any) - (today as any)) / 60000);
  }
  return timeDiff;
};

export function g<T, P1 extends keyof NonNullable<T>>(
  obj: T,
  prop1: P1
): NonNullable<T>[P1] | undefined;

export function g<
  T,
  P1 extends keyof NonNullable<T>,
  P2 extends keyof NonNullable<NonNullable<T>[P1]>
>(obj: T, prop1: P1, prop2: P2): NonNullable<NonNullable<T>[P1]>[P2] | undefined;

export function g<
  T,
  P1 extends keyof NonNullable<T>,
  P2 extends keyof NonNullable<NonNullable<T>[P1]>,
  P3 extends keyof NonNullable<NonNullable<NonNullable<T>[P1]>[P2]>
>(
  obj: T,
  prop1: P1,
  prop2: P2,
  prop3: P3
): NonNullable<NonNullable<NonNullable<T>[P1]>[P2]>[P3] | undefined;

export function g<
  T,
  P1 extends keyof NonNullable<T>,
  P2 extends keyof NonNullable<NonNullable<T>[P1]>,
  P3 extends keyof NonNullable<NonNullable<NonNullable<T>[P1]>[P2]>,
  P4 extends keyof NonNullable<NonNullable<NonNullable<NonNullable<T>[P1]>[P2]>[P3]>
>(
  obj: T,
  prop1: P1,
  prop2: P2,
  prop3: P3,
  prop4: P4
): NonNullable<NonNullable<NonNullable<NonNullable<T>[P1]>[P2]>[P3]>[P4] | undefined;

export function g<
  T,
  P1 extends keyof NonNullable<T>,
  P2 extends keyof NonNullable<NonNullable<T>[P1]>,
  P3 extends keyof NonNullable<NonNullable<NonNullable<T>[P1]>[P2]>,
  P4 extends keyof NonNullable<NonNullable<NonNullable<NonNullable<T>[P1]>[P2]>[P3]>,
  P5 extends keyof NonNullable<
    NonNullable<NonNullable<NonNullable<NonNullable<T>[P1]>[P2]>[P3]>[P4]
  >
>(
  obj: T,
  prop1: P1,
  prop2: P2,
  prop3: P3,
  prop4: P4,
  prop5: P5
):
  | NonNullable<NonNullable<NonNullable<NonNullable<NonNullable<T>[P1]>[P2]>[P3]>[P4]>[P5]
  | undefined;

// ...and so on...

/**
 *
 * @param obj
 * @param props
 */
export function g(obj: any, ...props: string[]) {
  return obj && props.reduce((result, prop) => (result == null ? undefined : result[prop]), obj);
}

export const getNetStatus = async () => {
  const status = await NetInfo.fetch()
    .then((connectionInfo) => {
      // console.log(connectionInfo, 'connectionInfo');
      return connectionInfo.isConnected;
    })
    .catch((e) => {
      CommonBugFender('helperFunctions_getNetStatus', e);
    });
  return status;
};

export const getDiffInDays = (nextAvailability: string) => {
  if (nextAvailability) {
    const nextAvailabilityTime = moment(new Date(nextAvailability));
    const currentTime = moment(new Date());
    const differenceInDays = nextAvailabilityTime.diff(currentTime, 'days');
    return differenceInDays;
  } else {
    return 0;
  }
};

export const getDiffInMinutes = (doctorAvailableSlots: string) => {
  if (doctorAvailableSlots && doctorAvailableSlots.length > 0) {
    const nextAvailabilityTime = moment(doctorAvailableSlots);
    const currentTime = moment(new Date());
    const differenceInMinutes = currentTime.diff(nextAvailabilityTime, 'minutes') * -1;
    return differenceInMinutes + 1; // for some reason moment is returning 1 second less. so that 1 is added.;
  } else {
    return 0;
  }
};

export const nextAvailability = (nextSlot: string, type: 'Available' | 'Consult' = 'Available') => {
  const isValidTime = moment(nextSlot).isValid();
  if (isValidTime) {
    const current = moment(new Date());
    const difference = moment.duration(moment(nextSlot).diff(current));
    const differenceMinute = Math.ceil(difference.asMinutes());
    const diffDays = Math.ceil(difference.asDays());
    const isTomorrow = moment(nextSlot).isAfter(
      current
        .add(1, 'd')
        .startOf('d')
        .set({
          hour: moment('06:00', 'HH:mm').get('hour'),
          minute: moment('06:00', 'HH:mm').get('minute'),
        })
    );
    if (differenceMinute < 60 && differenceMinute > 0) {
      return `${type} in ${differenceMinute} min${differenceMinute !== 1 ? 's' : ''}`;
    } else if (differenceMinute <= 0) {
      return 'BOOK APPOINTMENT';
    } else if (differenceMinute >= 60 && !isTomorrow) {
      return `${type} at ${moment(nextSlot).format('hh:mm A')}`;
    } else if (isTomorrow && diffDays < 2) {
      return `${type} Tomorrow${
        type === 'Available' ? ` at ${moment(nextSlot).format('hh:mm A')}` : ''
      }`;
    } else if ((diffDays >= 2 && diffDays <= 30) || type == 'Consult') {
      return `${type} in ${diffDays} days`;
    } else {
      return `${type} after a month`;
    }
  } else {
    return type === 'Available' ? 'Available' : 'Book Consult';
  }
};

export const mhdMY = (
  time: string,
  mText: string = 'minute',
  hText: string = 'hour',
  dText: string = 'day',
  MText: string = 'month',
  YText: string = 'year'
) => {
  const current = moment(new Date());
  const difference = moment.duration(moment(time).diff(current));
  const min = Math.ceil(difference.asMinutes());
  const hours = Math.ceil(difference.asHours());
  const days = Math.ceil(difference.asDays());
  const months = Math.ceil(difference.asMonths());
  const year = Math.ceil(difference.asYears());
  if (min > 0 && min < 60) {
    return `${min} ${mText}${min !== 1 ? 's' : ''}`;
  } else if (hours > 0 && hours < 24) {
    return `${hours} ${hText}${hours !== 1 ? 's' : ''}`;
  } else if (days > 0 && days < 30) {
    return `${days} ${dText}${days !== 1 ? 's' : ''}`;
  } else if (months > 0 && months < 12) {
    return `${months} ${MText}${months !== 1 ? 's' : ''}`;
  } else if (year > 0 && year < 30) {
    return `${year} ${YText}${year !== 1 ? 's' : ''}`;
  }
};

export const isEmptyObject = (object: Object) => {
  return Object.keys(object).length === 0;
};

export const findAddrComponents = (
  proptoFind: GooglePlacesType,
  addrComponents: PlacesApiResponse['results'][0]['address_components'],
  key?: 'long_name' | 'short_name' // default long_name
) => {
  const _key = key || 'long_name';
  return (addrComponents.find((item) => item.types.indexOf(proptoFind) > -1) || { [_key]: '' })[
    _key
  ];
};

/**
 * Calculates great-circle distances between the two points – that is, the shortest distance over the earth’s surface – using the ‘Haversine’ formula.
 */
export const distanceBwTwoLatLng = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const deg2rad = (deg: number) => deg * (Math.PI / 180);
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1); // deg2rad below
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  console.log(`Distance in km(s): ${d}`);
  return d;
};

export const getlocationDataFromLatLang = async (latitude: number, longitude: number) => {
  const placeInfo = await getPlaceInfoByLatLng(latitude, longitude);
  const addrComponents = g(placeInfo, 'data', 'results', '0' as any, 'address_components') || [];
  if (addrComponents.length == 0) {
    throw 'Unable to get location.';
  } else {
    return getFormattedLocation(addrComponents, { lat: latitude, lng: longitude });
  }
};

const getlocationData = (
  resolve: (value?: LocationData | PromiseLike<LocationData> | undefined) => void,
  reject: (reason?: any) => void,
  latLngOnly?: boolean
) => {
  Geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      if (latLngOnly) {
        resolve({ latitude, longitude } as LocationData);
        return;
      }
      getPlaceInfoByLatLng(latitude, longitude)
        .then((response) => {
          const addrComponents =
            g(response, 'data', 'results', '0' as any, 'address_components') || [];
          if (addrComponents.length == 0) {
            console.log('Unable to get location info using latitude & longitude from Google API.');
            reject('Unable to get location.');
          } else {
            resolve(getFormattedLocation(addrComponents, { lat: latitude, lng: longitude }));
          }
        })
        .catch((e) => {
          CommonBugFender('helperFunctions_getlocationData', e);
          reject('Unable to get location.');
        });
    },
    (error) => {
      console.log('err5', error);

      reject('Unable to get location.');
    },
    { enableHighAccuracy: false, timeout: 5000 }
  );
};

export const doRequestAndAccessLocationModified = (latLngOnly?: boolean): Promise<LocationData> => {
  return new Promise((resolve, reject) => {
    Permissions.request('location')
      .then((response) => {
        if (response === 'authorized') {
          if (Platform.OS === 'android') {
            RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({
              interval: 10000,
              fastInterval: 5000,
            })
              .then(() => {
                getlocationData(resolve, reject, latLngOnly);
              })
              .catch((e: Error) => {
                CommonBugFender('helperFunctions_RNAndroidLocationEnabler', e);
                reject('Unable to get location.');
              });
          } else {
            getlocationData(resolve, reject, latLngOnly);
          }
        } else {
          if (response === 'denied' || response === 'restricted') {
            Alert.alert('Location', 'Enable location access from settings', [
              {
                text: 'Cancel',
                onPress: () => {
                  AsyncStorage.setItem('settingsCalled', 'false');
                },
              },
              {
                text: 'Ok',
                onPress: () => {
                  AsyncStorage.setItem('settingsCalled', 'true');
                  Linking.openSettings();
                },
              },
            ]);
            reject('Unable to get location, permission denied.');
          } else {
            reject('Unable to get location.');
          }
        }
      })
      .catch((e) => {
        CommonBugFender('helperFunctions_doRequestAndAccessLocation', e);
        reject('Unable to get location.');
      });
  });
};

export const doRequestAndAccessLocation = (): Promise<LocationData> => {
  return new Promise((resolve, reject) => {
    Permissions.request('location')
      .then((response) => {
        if (response === 'authorized') {
          if (Platform.OS === 'android') {
            RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({
              interval: 10000,
              fastInterval: 5000,
            })
              .then(() => {
                getlocationData(resolve, reject);
              })
              .catch((e: Error) => {
                CommonBugFender('helperFunctions_RNAndroidLocationEnabler', e);
                reject('Unable to get location.');
              });
          } else {
            getlocationData(resolve, reject);
          }
        } else {
          if (response === 'denied' || response === 'restricted') {
            Alert.alert('Location', 'Enable location access from settings', [
              {
                text: 'Cancel',
                onPress: () => {
                  AsyncStorage.setItem('settingsCalled', 'false');
                },
              },
              {
                text: 'Ok',
                onPress: () => {
                  AsyncStorage.setItem('settingsCalled', 'true');
                  Linking.openSettings();
                },
              },
            ]);
            resolve(undefined);
          } else {
            reject('Unable to get location.');
          }
        }
      })
      .catch((e) => {
        CommonBugFender('helperFunctions_doRequestAndAccessLocation', e);
        reject('Unable to get location.');
      });
  });
};

const { height } = Dimensions.get('window');

// export const isIphone5s = () => height === 568;
export const statusBarHeight = () =>
  Platform.OS === 'ios' ? (height === 812 || height === 896 ? 44 : 20) : 0;

export const isValidSearch = (value: string) => /^([^ ]+[ ]{0,1}[^ ]*)*$/.test(value);

export const isValidText = (value: string) =>
  /^([a-zA-Z0-9]+[ ]{0,1}[a-zA-Z0-9\-.\\/?,&]*)*$/.test(value);

export const isValidName = (value: string) =>
  value == ' '
    ? false
    : value == '' || /^[a-zA-Z]+((['’ ][a-zA-Z])?[a-zA-Z]*)*$/.test(value)
    ? true
    : false;

export const isValidPhoneNumber = (value: string) => {
  const isValidNumber = !/^[6-9]{1}\d{0,9}$/.test(value)
    ? !/^(234){1}\d{0,9}$/.test(value)
      ? false
      : true
    : true;
  return isValidNumber;
};

export const extractUrlFromString = (text: string): string | undefined => {
  const urlRegex = /(https?:\/\/[^ ]*)/;
  return (text.match(urlRegex) || [])[0];
};

export const reOrderMedicines = async (
  order:
    | getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails
    | getLatestMedicineOrder_getLatestMedicineOrder_medicineOrderDetails,
  currentPatient: any,
  source: ReorderMedicines['source']
) => {
  // Medicines
  // use billedItems for delivered orders
  const billedItems = g(
    order,
    'medicineOrderShipments',
    '0' as any,
    'medicineOrderInvoice',
    '0' as any,
    'itemDetails'
  );
  const billedLineItems = billedItems
    ? (JSON.parse(billedItems) as MedicineOrderBilledItem[])
    : null;
  const isOfflineOrder = !!g(order, 'billNumber');
  const lineItems = (g(order, 'medicineOrderLineItems') ||
    []) as getMedicineOrderOMSDetails_getMedicineOrderOMSDetails_medicineOrderDetails_medicineOrderLineItems[];
  const lineItemsSkus = billedLineItems
    ? billedLineItems.filter((item) => item.itemId).map((item) => item.itemId)
    : lineItems.filter((item) => item.medicineSKU).map((item) => item.medicineSKU!);

  const lineItemsDetails = (await medCartItemsDetailsApi(lineItemsSkus)).data.productdp.filter(
    (m) => m.sku && m.name
  );
  const availableLineItemsSkus = lineItemsDetails.map((v) => v.sku);
  const cartItemsToAdd = lineItemsDetails.map(
    (item, index) =>
      ({
        ...formatToCartItem(item),
        quantity: Math.ceil(
          (billedLineItems
            ? billedLineItems[index].issuedQty
            : isOfflineOrder
            ? Math.ceil(
                lineItems[index].price! / lineItems[index].mrp! / lineItems[index].quantity!
              )
            : lineItems[index].quantity) || 1
        ),
      } as ShoppingCartItem)
  );
  const unavailableItems = billedLineItems
    ? billedLineItems
        .filter((item) => !availableLineItemsSkus.includes(item.itemId))
        .map((item) => item.itemName)
    : lineItems
        .filter((item) => !availableLineItemsSkus.includes(item.medicineSKU!))
        .map((item) => item.medicineName!);

  const eventAttributes: WebEngageEvents[WebEngageEventName.RE_ORDER_MEDICINE] = {
    orderType: 'Cart',
    noOfItemsNotAvailable: unavailableItems.length,
    source,
    'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
    'Patient UHID': g(currentPatient, 'uhid'),
    Relation: g(currentPatient, 'relation'),
    'Patient Age': Math.round(moment().diff(currentPatient.dateOfBirth, 'years', true)),
    'Patient Gender': g(currentPatient, 'gender'),
    'Mobile Number': g(currentPatient, 'mobileNumber'),
    'Customer ID': g(currentPatient, 'id'),
  };
  postWebEngageEvent(WebEngageEventName.RE_ORDER_MEDICINE, eventAttributes);

  // Prescriptions
  const prescriptionUrls = (order.prescriptionImageUrl || '')
    .split(',')
    .map((item) => item.trim())
    .filter((v) => v);
  const medicineNames = (billedLineItems
    ? billedLineItems.filter((item) => item.itemName).map((item) => item.itemName)
    : lineItems.filter((item) => item.medicineName).map((item) => item.medicineName!)
  ).join(',');
  const prescriptionsToAdd = prescriptionUrls.map(
    (item) =>
      ({
        id: item,
        date: moment(g(order, 'createdDate')).format('DD MMM YYYY'),
        doctorName: `Meds Rx ${(order.id && order.id.substring(0, order.id.indexOf('-'))) || ''}`,
        forPatient: g(currentPatient, 'firstName') || '',
        medicines: medicineNames,
        uploadedUrl: item,
      } as EPrescription)
  );

  return {
    items: cartItemsToAdd,
    unavailableItems: unavailableItems,
    prescriptions: prescriptionsToAdd,
    totalItemsCount: lineItems.length,
    unavailableItemsCount: unavailableItems.length,
  };
};

export const addTestsToCart = async (
  testPrescription: getCaseSheet_getCaseSheet_caseSheetDetails_diagnosticPrescription[], // testsIncluded will not come from API
  apolloClient: ApolloClient<object>,
  city: string
) => {
  const searchQuery = (name: string, city: string) =>
    apolloClient.query<searchDiagnostics, searchDiagnosticsVariables>({
      query: SEARCH_DIAGNOSTICS,
      variables: {
        searchText: name,
        city: city,
        patientId: '',
      },
      fetchPolicy: 'no-cache',
    });
  const detailQuery = (itemId: string) => getPackageData(itemId);

  try {
    const items = testPrescription.filter((val) => val.itemname).map((item) => item.itemname);

    console.log('\n\n\n\n\ntestPrescriptionNames\n', items, '\n\n\n\n\n');

    const searchQueries = Promise.all(items.map((item) => searchQuery(item!, city)));
    const searchQueriesData = (await searchQueries)
      .map((item) => g(item, 'data', 'searchDiagnostics', 'diagnostics', '0' as any)!)
      .filter((item, index) => g(item, 'itemName')! == items[index])
      .filter((item) => !!item);
    const detailQueries = Promise.all(
      searchQueriesData.map((item) => detailQuery(`${item.itemId}`))
    );
    const detailQueriesData = (await detailQueries).map(
      (item) => g(item, 'data', 'data', 'length') || 1 // updating testsIncluded
    );

    const finalArray: DiagnosticsCartItem[] = Array.from({
      length: searchQueriesData.length,
    }).map((_, index) => {
      const s = searchQueriesData[index];
      const testIncludedCount = detailQueriesData[index];
      return {
        id: `${s.itemId}`,
        name: s.itemName,
        price: s.rate,
        specialPrice: undefined,
        mou: testIncludedCount,
        thumbnail: '',
        collectionMethod: s.collectionType,
      } as DiagnosticsCartItem;
    });

    console.log('\n\n\n\n\n\nfinalArray-testPrescriptionNames\n', finalArray, '\n\n\n\n\n');
    return finalArray;
  } catch (error) {
    CommonBugFender('helperFunctions_addTestsToCart', error);
    throw 'error';
  }
};

export const getDiscountPercentage = (price: number | string, specialPrice?: number | string) => {
  const discountPercent = !specialPrice
    ? 0
    : Number(price) == Number(specialPrice)
    ? 0
    : ((Number(price) - Number(specialPrice)) / Number(price)) * 100;
  return discountPercent != 0 ? Number(Number(discountPercent).toFixed(1)) : 0;
};

export const getBuildEnvironment = () => {
  switch (apiRoutes.graphql()) {
    case 'https://aph.dev.api.popcornapps.com//graphql':
      return 'DEV';
    case 'https://aph.staging.api.popcornapps.com//graphql':
      return 'QA';
    case 'https://stagingapi.apollo247.com//graphql':
      return 'VAPT';
    case 'https://aph.uat.api.popcornapps.com//graphql':
      return 'UAT';
    case 'https://api.apollo247.com//graphql':
      return 'PROD';
    case 'https://asapi.apollo247.com//graphql':
      return 'PRF';
    case 'https://devapi.apollo247.com//graphql':
      return 'DEVReplica';
    default:
      return '';
  }
};

export const getRelations = (self?: string) => {
  type RelationArray = {
    key: Relation;
    title: string;
  };
  let a: RelationArray[] = [];
  a.push({ key: Relation.ME, title: self || 'Self' });
  for (let k in Relation) {
    if (k !== Relation.ME && k !== Relation.OTHER) {
      a.push({
        key: k as Relation,
        title: k[0] + k.substr(1).toLowerCase(),
      });
    }
  }
  a.push({
    key: Relation.OTHER,
    title: Relation.OTHER[0] + Relation.OTHER.substr(1).toLowerCase(),
  });

  return a;
};

export const formatTestSlot = (slotTime: string) => moment(slotTime, 'HH:mm').format('hh:mm A');

export const formatTestSlotWithBuffer = (slotTime: string) => {
  const startTime = slotTime.split('-')[0];
  const endTime = moment(startTime, 'HH:mm')
    .add(30, 'minutes')
    .format('HH:mm');

  const newSlot = [startTime, endTime];
  return newSlot.map((item) => moment(item.trim(), 'hh:mm').format('hh:mm A')).join(' - ');
};

export const isValidTestSlot = (
  slot: getDiagnosticSlots_getDiagnosticSlots_diagnosticSlot_slotInfo,
  date: Date
) => {
  return (
    slot.status != 'booked' &&
    (moment(date)
      .format('DMY')
      .toString() ===
    moment()
      .format('DMY')
      .toString()
      ? moment(slot.startTime!.trim(), 'HH:mm').isSameOrAfter(
          moment(new Date()).add(
            AppConfig.Configuration.DIAGNOSTIC_SLOTS_LEAD_TIME_IN_MINUTES,
            'minutes'
          )
        )
      : true) &&
    moment(slot.endTime!.trim(), 'HH:mm').isSameOrBefore(
      moment(AppConfig.Configuration.DIAGNOSTIC_MAX_SLOT_TIME.trim(), 'HH:mm')
    )
  );
};

export const isValidTestSlotWithArea = (
  slot: getDiagnosticSlotsWithAreaID_getDiagnosticSlotsWithAreaID_slots,
  date: Date
) => {
  return (
    (moment(date)
      .format('DMY')
      .toString() ===
    moment()
      .format('DMY')
      .toString()
      ? moment(slot.Timeslot!.trim(), 'HH:mm').isSameOrAfter(
          moment(new Date()).add(
            AppConfig.Configuration.DIAGNOSTIC_SLOTS_LEAD_TIME_IN_MINUTES,
            'minutes'
          )
        )
      : true) &&
    moment(slot.Timeslot!.trim(), 'HH:mm').isSameOrBefore(
      moment(AppConfig.Configuration.DIAGNOSTIC_MAX_SLOT_TIME.trim(), 'HH:mm')
    )
  );
};

export const getTestSlotDetailsByTime = (slots: TestSlot[], startTime: string, endTime: string) => {
  return slots.find(
    (item) => item.slotInfo.startTime == startTime && item.slotInfo.endTime == endTime
  )!;
};

export const getUniqueTestSlots = (slots: TestSlot[]) => {
  return slots
    .filter(
      (item, idx, array) =>
        array.findIndex(
          (_item) =>
            _item.slotInfo.startTime == item.slotInfo.startTime &&
            _item.slotInfo.endTime == item.slotInfo.endTime
        ) == idx
    )
    .map((val) => ({
      startTime: val.slotInfo.startTime!,
      endTime: val.slotInfo.endTime!,
    }))
    .sort((a, b) => {
      if (moment(a.startTime.trim(), 'HH:mm').isAfter(moment(b.startTime.trim(), 'HH:mm')))
        return 1;
      else if (moment(b.startTime.trim(), 'HH:mm').isAfter(moment(a.startTime.trim(), 'HH:mm')))
        return -1;
      return 0;
    });
};

export const getUniqueTestSlotsWithArea = (slots: TestSlotWithArea[]) => {
  return slots
    .filter(
      (item, idx, array) =>
        array.findIndex((_item) => _item.slotInfo.Timeslot == item.slotInfo.Timeslot) == idx
    )
    .map((val) => ({
      startTime: val.slotInfo.Timeslot!,
      endTime: val.slotInfo.Timeslot!,
    }))
    .sort((a, b) => {
      if (moment(a.startTime.trim(), 'HH:mm').isAfter(moment(b.startTime.trim(), 'HH:mm')))
        return 1;
      else if (moment(b.startTime.trim(), 'HH:mm').isAfter(moment(a.startTime.trim(), 'HH:mm')))
        return -1;
      return 0;
    });
};

const webengage = new WebEngage();

export const postWebEngageEvent = (eventName: WebEngageEventName, attributes: Object) => {
  try {
    const logContent = `[WebEngage Event] ${eventName}`;
    console.log(logContent);
    webengage.track(eventName, attributes);
  } catch (error) {
    console.log('********* Unable to post WebEngageEvent *********', { error });
  }
};

export const postwebEngageAddToCartEvent = (
  {
    sku,
    name,
    price,
    special_price,
    category_id,
  }: Pick<MedicineProduct, 'sku' | 'name' | 'price' | 'special_price' | 'category_id'>,
  source: WebEngageEvents[WebEngageEventName.PHARMACY_ADD_TO_CART]['Source'],
  sectionName?: WebEngageEvents[WebEngageEventName.PHARMACY_ADD_TO_CART]['Section Name'],
  categoryName?: WebEngageEvents[WebEngageEventName.PHARMACY_ADD_TO_CART]['category name']
) => {
  const eventAttributes: WebEngageEvents[WebEngageEventName.PHARMACY_ADD_TO_CART] = {
    'product name': name,
    'product id': sku,
    Brand: '',
    'Brand ID': '',
    'category name': categoryName || '',
    'Section Name': sectionName || '',
    'category ID': category_id || '',
    Price: price,
    'Discounted Price': Number(special_price) || undefined,
    Quantity: 1,
    Source: source,
    af_revenue: Number(special_price) || price,
    af_currency: 'INR',
  };
  postWebEngageEvent(WebEngageEventName.PHARMACY_ADD_TO_CART, eventAttributes);
};

export const postWebEngagePHR = (source: string, webEngageEventName: WebEngageEventName) => {
  const eventAttributes = {
    Source: source,
  };
  postWebEngageEvent(webEngageEventName, eventAttributes);
};

export const postWEGNeedHelpEvent = (
  currentPatient: GetCurrentPatients_getCurrentPatients_patients,
  source: WebEngageEvents[WebEngageEventName.NEED_HELP]['Source']
) => {
  const eventAttributes: WebEngageEvents[WebEngageEventName.NEED_HELP] = {
    'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
    'Patient UHID': g(currentPatient, 'uhid')!,
    Relation: g(currentPatient, 'relation')!,
    'Patient Age': Math.round(moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)),
    'Patient Gender': g(currentPatient, 'gender')!,
    'Mobile Number': g(currentPatient, 'mobileNumber')!,
    'Customer ID': g(currentPatient, 'id')!,
    Source: source,
  };
  postWebEngageEvent(WebEngageEventName.NEED_HELP, eventAttributes);
};

export const postWEGWhatsAppEvent = (whatsAppAllow: boolean) => {
  console.log(whatsAppAllow, 'whatsAppAllow');
  webengage.user.setAttribute('whatsapp_opt_in', whatsAppAllow); //WhatsApp
};

export const postWEGReferralCodeEvent = (ReferralCode: string) => {
  console.log(ReferralCode, 'Referral Code');
  webengage.user.setAttribute('Referral Code', ReferralCode); //Referralcode
};

export const permissionHandler = (
  permission: string,
  deniedMessage: string,
  doRequest: () => void
) => {
  Permissions.request(permission)
    .then((message) => {
      console.log(message, 'sdhu');

      if (message === 'authorized') {
        doRequest();
      } else if (message === 'denied' || message === 'restricted') {
        Alert.alert(permission.toUpperCase(), deniedMessage, [
          {
            text: 'Cancel',
            onPress: () => {},
          },
          {
            text: 'Ok',
            onPress: () => {
              Linking.openSettings();
              AsyncStorage.setItem('permissionHandler', 'true');
            },
          },
        ]);
      }
    })
    .catch((e) => console.log(e, 'dsvunacimkl'));
};

export const callPermissions = (doRequest?: () => void) => {
  permissionHandler('camera', 'Enable camera from settings for calls during consultation.', () => {
    permissionHandler(
      'microphone',
      'Enable microphone from settings for calls during consultation.',
      () => {
        doRequest && doRequest();
      }
    );
  });
};

export const storagePermissions = (doRequest?: () => void) => {
  permissionHandler(
    'storage',
    'Enable storage from settings for uploading documents during consultation.',
    () => {
      doRequest && doRequest();
    }
  );
};

export const InitiateAppsFlyer = (
  navigation: NavigationScreenProp<NavigationRoute<object>, object>
) => {
  console.log('InitiateAppsFlyer');
  onInstallConversionDataCanceller = appsFlyer.onInstallConversionData((res) => {
    if (JSON.parse(res.data.is_first_launch || 'null') == true) {
      console.log('res.data', res.data);
      // if (res.data.af_dp !== undefined) {
      try {
        if (res.data.af_dp !== undefined) {
          AsyncStorage.setItem('deeplink', res.data.af_dp);
        }
        if (res.data.af_sub1 !== null) {
          AsyncStorage.setItem('deeplinkReferalCode', res.data.af_sub1);
        }

        console.log('res.data.af_dp', decodeURIComponent(res.data.af_dp));
        setBugFenderLog('APPS_FLYER_DEEP_LINK', res.data.af_dp);
        setBugFenderLog('APPS_FLYER_DEEP_LINK_Referral_Code', res.data.af_sub1);

        // setBugFenderLog('APPS_FLYER_DEEP_LINK_decode', decodeURIComponent(res.data.af_dp));
        setBugFenderLog('APPS_FLYER_DEEP_LINK_COMPLETE', res.data);
      } catch (error) {}

      // } else {
      //   setBugFenderLog('APPS_FLYER_DEEP_LINK_decode_else');
      // }

      if (res.data.af_status === 'Non-organic') {
        const media_source = res.data.media_source;
        const campaign = res.data.campaign;
        console.log('media_source', media_source);
        console.log('campaign', campaign);

        // Alert.alert(
        //   'This is first launch and a Non-Organic install. Media source: ' +
        //     media_source +
        //     ' Campaign: ' +
        //     campaign
        // );
      } else if (res.data.af_status === 'Organic') {
        // Alert.alert('This is first launch and a Organic Install');
      }
    } else {
      // Alert.alert('This is not first launch');
    }
  });

  appsFlyer.initSdk(
    {
      devKey: 'pP3MjHNkZGiMCamkJ7YpbH',
      isDebug: false,
      appId: Platform.OS === 'ios' ? '1496740273' : '',
    },
    (result) => {
      console.log('result', result);
    },
    (error) => {
      console.error('error', error);
    }
  );

  onAppOpenAttributionCanceller = appsFlyer.onAppOpenAttribution(async (res) => {
    // for iOS universal links
    if (Platform.OS === 'ios') {
      try {
        if (res.data.af_dp !== undefined) {
          AsyncStorage.setItem('deeplink', res.data.af_dp);
        }
        if (res.data.af_sub1 !== null) {
          AsyncStorage.setItem('deeplinkReferalCode', res.data.af_sub1);
        }

        console.log('res.data.af_dp_onAppOpenAttribution', decodeURIComponent(res.data.af_dp));
        setBugFenderLog('onAppOpenAttribution_APPS_FLYER_DEEP_LINK', res.data.af_dp);
        setBugFenderLog(
          'onAppOpenAttribution_APPS_FLYER_DEEP_LINK_Referral_Code',
          res.data.af_sub1
        );

        setBugFenderLog('onAppOpenAttribution_APPS_FLYER_DEEP_LINK_COMPLETE', res.data);
      } catch (error) {}

      const userLoggedIn = await AsyncStorage.getItem('userLoggedIn');
      if (userLoggedIn == 'true') {
        handleUniversalLinks(res.data, navigation);
      }
    }
  });
};

export const UnInstallAppsFlyer = (newFirebaseToken: string) => {
  // console.log('UnInstallAppsFlyer', newFirebaseToken);
  appsFlyer.updateServerUninstallToken(newFirebaseToken, (success) => {
    // console.log('UnInstallAppsFlyersuccess', success);
  });
};

export const APPStateInActive = () => {
  if (Platform.OS === 'ios') {
    console.log('APPStateInActive');

    appsFlyer.trackAppLaunch();
  }
};

export const APPStateActive = () => {
  console.log('APPStateActive');

  if (onInstallConversionDataCanceller) {
    onInstallConversionDataCanceller();
    onInstallConversionDataCanceller = null;
  }
  if (onAppOpenAttributionCanceller) {
    onAppOpenAttributionCanceller();
    onAppOpenAttributionCanceller = null;
  }
};

export const postAppsFlyerEvent = (eventName: AppsFlyerEventName, attributes: Object) => {
  try {
    const logContent = `[AppsFlyer Event] ${eventName}`;
    console.log(logContent);
    appsFlyer.trackEvent(
      eventName,
      attributes,
      (res) => {
        console.log('AppsFlyerEventSuccess', res);
      },
      (err) => {
        console.error('AppsFlyerEventError', err);
      }
    );
  } catch (error) {
    console.log('********* Unable to post AppsFlyerEvent *********', { error });
  }
};

export const SetAppsFlyerCustID = (patientId: string) => {
  try {
    console.log('\n********* SetAppsFlyerCustID Start *********\n');
    console.log(`SetAppsFlyerCustID ${patientId}`);
    console.log('\n********* SetAppsFlyerCustID End *********\n');

    appsFlyer.setCustomerUserId(patientId, (res) => {
      console.log('AppsFlyerEventSuccess', res);
    });
  } catch (error) {
    console.log('********* Unable to post AppsFlyerEvent *********', { error });
  }
};

export const postAppsFlyerAddToCartEvent = (
  {
    sku,
    type_id,
    price,
    special_price,
  }: Pick<MedicineProduct, 'sku' | 'type_id' | 'price' | 'special_price'>,
  id: string
) => {
  const eventAttributes: AppsFlyerEvents[AppsFlyerEventName.PHARMACY_ADD_TO_CART] = {
    'customer id': id,
    af_revenue: Number(special_price) || price,
    af_currency: 'INR',
    item_type: type_id == 'Pharma' ? 'Drugs' : 'FMCG',
    sku: sku,
  };
  postAppsFlyerEvent(AppsFlyerEventName.PHARMACY_ADD_TO_CART, eventAttributes);
};

export const setFirebaseUserId = (userId: string) => {
  try {
    analytics().setUserId(userId);
  } catch (error) {}
};

export const setCrashlyticsAttributes = async (
  currentPatient: GetCurrentPatients_getCurrentPatients_patients
) => {
  try {
    await Promise.all([
      crashlytics().setUserId(currentPatient?.mobileNumber),
      crashlytics().setAttributes({
        firstName: currentPatient?.firstName!,
        lastName: currentPatient?.lastName!,
      }),
    ]);
  } catch (error) {}
};

export const postFirebaseEvent = (eventName: FirebaseEventName, attributes: Object) => {
  try {
    const logContent = `[Firebase Event] ${eventName}`;
    console.log(logContent);
    analytics().logEvent(eventName, attributes);
  } catch (error) {
    console.log('********* Unable to post FirebaseEvent *********', { error });
  }
};

export const postFirebaseAddToCartEvent = (
  {
    sku,
    name,
    price,
    special_price,
    category_id,
  }: Pick<MedicineProduct, 'sku' | 'name' | 'price' | 'special_price' | 'category_id'>,
  source: FirebaseEvents[FirebaseEventName.PHARMACY_ADD_TO_CART]['Source'],
  section?: FirebaseEvents[FirebaseEventName.PHARMACY_ADD_TO_CART]['Section'],
  sectionName?: string
) => {
  try {
    const eventAttributes: FirebaseEvents[FirebaseEventName.PHARMACY_ADD_TO_CART] = {
      productname: name,
      productid: sku,
      Brand: '',
      BrandID: '',
      categoryname: '',
      categoryID: category_id || '',
      Price: price,
      DiscountedPrice: typeof special_price == 'string' ? Number(special_price) : special_price,
      Quantity: 1,
      Source: source,
      af_revenue: Number(special_price) || price,
      af_currency: 'INR',
      Section: section ? section : '',
      SectionName: sectionName || '',
    };
    postFirebaseEvent(FirebaseEventName.PHARMACY_ADD_TO_CART, eventAttributes);
  } catch (error) {}
};

export const nameFormater = (
  name: string,
  caseFormat?: 'lower' | 'upper' | 'title' | 'camel' | 'default'
) => {
  if (caseFormat === 'title') {
    return _.startCase(name.toLowerCase());
  } else if (caseFormat === 'camel') {
    return _.camelCase(name);
  } else if (caseFormat === 'lower') {
    return _.lowerCase(name);
  } else if (caseFormat === 'upper') {
    return _.upperCase(name);
  } else {
    return _.capitalize(name.replace(/_/g, ' '));
  }
};

export const medUnitFormatArray = Object.values(MEDICINE_UNIT).map((item) => {
  let formatedValue = nameFormater(item, 'lower');
  const existsIndex = string.muiltdosages.findIndex((i) => i.single === formatedValue);
  if (existsIndex > -1) {
    formatedValue = string.muiltdosages[existsIndex].multiple;
  }
  return {
    key: item,
    value: formatedValue,
  };
});

export const getFormattedLocation = (
  addrComponents: PlacesApiResponse['results'][0]['address_components'],
  latLang: PlacesApiResponse['results'][0]['geometry']['location'],
  pincode?: string
) => {
  const { lat, lng } = latLang || {};

  const area = [
    findAddrComponents('route', addrComponents),
    findAddrComponents('sublocality_level_2', addrComponents),
    findAddrComponents('sublocality_level_1', addrComponents),
  ].filter((i) => i);

  return {
    displayName:
      (area || []).pop() ||
      findAddrComponents('locality', addrComponents) ||
      findAddrComponents('administrative_area_level_2', addrComponents),
    latitude: lat,
    longitude: lng,
    area: area.join(', '),
    city:
      findAddrComponents('locality', addrComponents) ||
      findAddrComponents('administrative_area_level_2', addrComponents),
    state: findAddrComponents('administrative_area_level_1', addrComponents),
    stateCode: findAddrComponents('administrative_area_level_1', addrComponents, 'short_name'),
    country: findAddrComponents('country', addrComponents),
    pincode: pincode || findAddrComponents('postal_code', addrComponents),
    lastUpdated: new Date().getTime(),
  } as LocationData;
};

export const trimTextWithEllipsis = (text: string, count: number) =>
  text.length > count ? `${text.slice(0, count)}...` : text;

export const parseNumber = (number: string | number, decimalPoints?: number) =>
  Number(Number(number).toFixed(decimalPoints || 2));

export const getMaxQtyForMedicineItem = (qty?: number | string) => {
  return qty ? Number(qty) : AppConfig.Configuration.CART_ITEM_MAX_QUANTITY;
};

export const formatToCartItem = ({
  sku,
  name,
  price,
  special_price,
  mou,
  is_prescription_required,
  MaxOrderQty,
  type_id,
  is_in_stock,
  thumbnail,
  image,
  sell_online,
}: MedicineProduct): ShoppingCartItem => {
  return {
    id: sku,
    name: name,
    price: price,
    specialPrice: Number(special_price) || undefined,
    mou: mou,
    quantity: 1,
    prescriptionRequired: is_prescription_required == '1',
    isMedicine: (type_id || '').toLowerCase() == 'pharma',
    thumbnail: thumbnail || image,
    maxOrderQty: MaxOrderQty,
    productType: type_id,
    isInStock: is_in_stock == 1,
    unavailableOnline: sell_online == 0,
  };
};

export const savePastSearch = (client: ApolloClient<object>, input: SaveSearchInput) => {
  try {
    client.mutate<saveSearch, saveSearchVariables>({
      mutation: SAVE_SEARCH,
      variables: { saveSearchInput: input },
    });
  } catch (error) {}
};

export const addPharmaItemToCart = (
  cartItem: ShoppingCartItem,
  pincode: string,
  addCartItem: ShoppingCartContextProps['addCartItem'],
  setLoading: UIElementsContextProps['setLoading'],
  navigation: NavigationScreenProp<NavigationRoute<object>, object>,
  currentPatient: GetCurrentPatients_getCurrentPatients_patients,
  isLocationServeiceable: boolean,
  otherInfo: {
    source: WebEngageEvents[WebEngageEventName.PHARMACY_ADD_TO_CART]['Source'];
    section?: WebEngageEvents[WebEngageEventName.PHARMACY_ADD_TO_CART]['Section'];
    categoryId?: WebEngageEvents[WebEngageEventName.PHARMACY_ADD_TO_CART]['category ID'];
    categoryName?: WebEngageEvents[WebEngageEventName.PHARMACY_ADD_TO_CART]['category name'];
  },
  onComplete?: () => void
) => {
  const outOfStockMsg = 'Sorry, this item is out of stock in your area.';

  const navigate = () => {
    navigation.push(AppRoutes.MedicineDetailsScene, {
      sku: cartItem.id,
      deliveryError: outOfStockMsg,
    });
  };

  const addToCart = () => {
    addCartItem!(cartItem);
    console.log('>>>otherInfo?.categoryName', otherInfo?.categoryName);

    postwebEngageAddToCartEvent(
      {
        sku: cartItem.id,
        name: cartItem.name,
        price: cartItem.price,
        special_price: cartItem.specialPrice,
        category_id: otherInfo?.categoryId,
      },
      otherInfo?.source,
      otherInfo?.section,
      otherInfo?.categoryName
    );
    postFirebaseAddToCartEvent(
      {
        sku: cartItem.id,
        name: cartItem.name,
        price: cartItem.price,
        special_price: cartItem.specialPrice,
        category_id: g(otherInfo, 'categoryId'),
      },
      g(otherInfo, 'source')!,
      g(otherInfo, 'section')
    );
    postAppsFlyerAddToCartEvent(
      {
        sku: cartItem.id,
        name: cartItem.name,
        price: cartItem.price,
        special_price: cartItem.specialPrice,
        category_id: g(otherInfo, 'categoryId'),
      },
      g(currentPatient, 'id')!
    );
  };

  if (!isLocationServeiceable) {
    const eventAttributes: WebEngageEvents[WebEngageEventName.PHARMACY_ADD_TO_CART_NONSERVICEABLE] = {
      'product name': cartItem.name,
      'product id': cartItem.id,
      pincode: pincode,
      'Mobile Number': g(currentPatient, 'mobileNumber')!,
    };
    postWebEngageEvent(WebEngageEventName.PHARMACY_ADD_TO_CART_NONSERVICEABLE, eventAttributes);
    onComplete && onComplete();
    navigate();
    return;
  }

  setLoading && setLoading(true);
  availabilityApi247(pincode, cartItem.id)
    .then((res) => {
      const availability = g(res, 'data', 'response', '0' as any, 'exist');
      if (availability) {
        addToCart();
      } else {
        navigate();
      }
      try {
        const { mrp, exist, qty } = res.data.response[0];
        const eventAttributes: WebEngageEvents[WebEngageEventName.PHARMACY_AVAILABILITY_API_CALLED] = {
          Source: setLoading ? 'Add_Display' : 'Add_Search',
          Input_SKU: cartItem.id,
          Input_Pincode: pincode,
          Input_MRP: cartItem.price,
          No_of_items_in_the_cart: 1,
          Response_Exist: exist ? 'Yes' : 'No',
          Response_MRP: mrp,
          Response_Qty: qty,
        };
        postWebEngageEvent(WebEngageEventName.PHARMACY_AVAILABILITY_API_CALLED, eventAttributes);
      } catch (error) {}
    })
    .catch(() => {
      addToCart();
    })
    .finally(() => {
      setLoading && setLoading(false);
      onComplete && onComplete();
    });
};

export const dataSavedUserID = async (key: string) => {
  let userId: any = await AsyncStorage.getItem(key);
  userId = JSON.parse(userId || 'null');
  return userId;
};

export const setWebEngageScreenNames = (screenName: string) => {
  webengage.screen(screenName);
};

export const overlyCallPermissions = (
  patientName: string,
  doctorName: string,
  showAphAlert: any,
  hideAphAlert: any,
  isDissmiss: boolean,
  callback?: () => void | null
) => {
  if (Platform.OS === 'android') {
    Permissions.checkMultiple(['camera', 'microphone'])
      .then((response) => {
        console.log('Response===>', response);
        const { camera, microphone } = response;
        const cameraNo = camera === 'denied' || camera === 'undetermined';
        const microphoneNo = microphone === 'denied' || microphone === 'undetermined';
        const cameraYes = camera === 'authorized';
        const microphoneYes = microphone === 'authorized';
        // Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
        if (cameraNo && microphoneNo) {
          RNAppSignatureHelper.isRequestOverlayPermissionGranted((status: any) => {
            if (status) {
              showAphAlert!({
                unDismissable: isDissmiss,
                title: `Hi ${patientName} :)`,
                description: string.callRelatedPermissions.allPermissions.replace(
                  '{0}',
                  doctorName
                ),
                ctaContainerStyle: { justifyContent: 'flex-end' },
                CTAs: [
                  {
                    text: 'OK, GOT IT',
                    type: 'orange-link',
                    onPress: () => {
                      hideAphAlert!();
                      callback && callback();
                      callPermissions(() => {
                        RNAppSignatureHelper.requestOverlayPermission();
                      });
                    },
                  },
                ],
              });
            } else {
              showAphAlert!({
                unDismissable: isDissmiss,
                title: `Hi ${patientName} :)`,
                description: string.callRelatedPermissions.camAndMPPermission.replace(
                  '{0}',
                  doctorName
                ),
                ctaContainerStyle: { justifyContent: 'flex-end' },
                CTAs: [
                  {
                    text: 'OK, GOT IT',
                    type: 'orange-link',
                    onPress: () => {
                      hideAphAlert!();
                      callback && callback();
                      callPermissions();
                    },
                  },
                ],
              });
            }
          });
        } else if (cameraYes && microphoneNo) {
          RNAppSignatureHelper.isRequestOverlayPermissionGranted((status: any) => {
            if (status) {
              showAphAlert!({
                unDismissable: isDissmiss,
                title: `Hi ${patientName} :)`,
                description: string.callRelatedPermissions.mpAndOverlayPermission.replace(
                  '{0}',
                  doctorName
                ),
                ctaContainerStyle: { justifyContent: 'flex-end' },
                CTAs: [
                  {
                    text: 'OK, GOT IT',
                    type: 'orange-link',
                    onPress: () => {
                      hideAphAlert!();
                      callback && callback();
                      callPermissions(() => {
                        RNAppSignatureHelper.requestOverlayPermission();
                      });
                    },
                  },
                ],
              });
            } else {
              showAphAlert!({
                unDismissable: isDissmiss,
                title: `Hi ${patientName} :)`,
                description: string.callRelatedPermissions.onlyMPPermission.replace(
                  '{0}',
                  doctorName
                ),
                ctaContainerStyle: { justifyContent: 'flex-end' },
                CTAs: [
                  {
                    text: 'OK, GOT IT',
                    type: 'orange-link',
                    onPress: () => {
                      hideAphAlert!();
                      callback && callback();
                      callPermissions();
                    },
                  },
                ],
              });
            }
          });
        } else if (cameraNo && microphoneYes) {
          RNAppSignatureHelper.isRequestOverlayPermissionGranted((status: any) => {
            if (status) {
              showAphAlert!({
                unDismissable: isDissmiss,
                title: `Hi ${patientName} :)`,
                description: string.callRelatedPermissions.camAndOverlayPermission.replace(
                  '{0}',
                  doctorName
                ),
                ctaContainerStyle: { justifyContent: 'flex-end' },
                CTAs: [
                  {
                    text: 'OK, GOT IT',
                    type: 'orange-link',
                    onPress: () => {
                      hideAphAlert!();
                      callback && callback();
                      callPermissions(() => {
                        RNAppSignatureHelper.requestOverlayPermission();
                      });
                    },
                  },
                ],
              });
            } else {
              showAphAlert!({
                unDismissable: isDissmiss,
                title: `Hi ${patientName} :)`,
                description: string.callRelatedPermissions.onlyCameraPermission.replace(
                  '{0}',
                  doctorName
                ),
                ctaContainerStyle: { justifyContent: 'flex-end' },
                CTAs: [
                  {
                    text: 'OK, GOT IT',
                    type: 'orange-link',
                    onPress: () => {
                      hideAphAlert!();
                      callback && callback();
                      callPermissions();
                    },
                  },
                ],
              });
            }
          });
        } else if (cameraYes && microphoneYes) {
          RNAppSignatureHelper.isRequestOverlayPermissionGranted((status: any) => {
            if (status) {
              showAphAlert!({
                unDismissable: isDissmiss,
                title: `Hi ${patientName} :)`,
                description: string.callRelatedPermissions.onlyOverlayPermission.replace(
                  '{0}',
                  doctorName
                ),
                ctaContainerStyle: { justifyContent: 'flex-end' },
                CTAs: [
                  {
                    text: 'OK, GOT IT',
                    type: 'orange-link',
                    onPress: () => {
                      hideAphAlert!();
                      callback && callback();
                      RNAppSignatureHelper.requestOverlayPermission();
                    },
                  },
                ],
              });
            }
          });
        }
      })
      .catch((e) => {});
  } else {
    Permissions.checkMultiple(['camera', 'microphone'])
      .then((response) => {
        const { camera, microphone } = response;
        const cameraNo = camera === 'denied' || camera === 'undetermined';
        const microphoneNo = microphone === 'denied' || microphone === 'undetermined';
        const cameraYes = camera === 'authorized';
        const microphoneYes = microphone === 'authorized';
        // Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
        const description =
          cameraNo && microphoneNo
            ? string.callRelatedPermissions.camAndMPPermission
            : cameraYes && microphoneNo
            ? string.callRelatedPermissions.onlyMPPermission
            : cameraNo && microphoneYes
            ? string.callRelatedPermissions.onlyCameraPermission
            : '';
        if (description) {
          showAphAlert!({
            unDismissable: true,
            title: `Hi ${patientName} :)`,
            description: description.replace('{0}', doctorName),
            ctaContainerStyle: { justifyContent: 'flex-end' },
            CTAs: [
              {
                text: 'OK, GOT IT',
                type: 'orange-link',
                onPress: () => {
                  hideAphAlert!();
                  callback && callback();
                  callPermissions();
                },
              },
            ],
          });
        }
      })
      .catch((e) => {});
  }
};

export const checkPermissions = (permissions: string[]) => {
  return new Promise((resolve, reject) => {
    Permissions.checkMultiple(permissions).then((response) => {
      if (response) {
        resolve(response);
      } else {
        reject('Unable to get permissions.');
      }
    });
  });
};

export const removeConsecutiveComma = (value: string) => {
  return value.replace(/^,|,$|,(?=,)/g, '');
};
