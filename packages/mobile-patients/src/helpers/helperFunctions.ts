import { LocationData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { savePatientAddress_savePatientAddress_patientAddress } from '@aph/mobile-patients/src/graphql/types/savePatientAddress';
import {
  getPlaceInfoByLatLng,
  GooglePlacesType,
  MedicineProduct,
  PlacesApiResponse,
  medCartItemsDetailsApi,
  MedicineOrderBilledItem,
  availabilityApi247,
  validateConsultCoupon,
  getDiagnosticDoctorPrescriptionResults,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import {
  MEDICINE_ORDER_STATUS,
  Relation,
  MEDICINE_UNIT,
  SaveSearchInput,
  STATUS,
  Gender,
  DIAGNOSTIC_ORDER_STATUS,
  REFUND_STATUSES,
  MedicalRecordType,
  MEDICINE_TIMINGS,
  MEDICINE_CONSUMPTION_DURATION,
  TEST_COLLECTION_TYPE,
  APPOINTMENT_TYPE,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import Geolocation from 'react-native-geolocation-service';
import NetInfo from '@react-native-community/netinfo';
import moment from 'moment';
import AsyncStorage from '@react-native-community/async-storage';
import {
  Alert,
  Dimensions,
  Platform,
  Linking,
  NativeModules,
  PermissionsAndroid,
  ToastAndroid,
} from 'react-native';
import RNAndroidLocationEnabler from 'react-native-android-location-enabler';
import Permissions from 'react-native-permissions';
import { DiagnosticsCartItem } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { getCaseSheet_getCaseSheet_caseSheetDetails_diagnosticPrescription } from '../graphql/types/getCaseSheet';
import { apiRoutes } from './apiRoutes';
import {
  CommonBugFender,
  setBugFenderLog,
  CommonLogEvent,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { getDiagnosticSlots_getDiagnosticSlots_diagnosticSlot_slotInfo } from '@aph/mobile-patients/src/graphql/types/getDiagnosticSlots';
import { getMedicineOrderOMSDetails_getMedicineOrderOMSDetails_medicineOrderDetails_medicineOrderLineItems } from '@aph/mobile-patients/src/graphql/types/getMedicineOrderOMSDetails';
import {
  getPatientAllAppointments_getPatientAllAppointments_activeAppointments_caseSheet,
  getPatientAllAppointments_getPatientAllAppointments_activeAppointments,
} from '@aph/mobile-patients/src/graphql/types/getPatientAllAppointments';
import { DoctorType } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import ApolloClient from 'apollo-client';
import { saveSearch, saveSearchVariables } from '@aph/mobile-patients/src/graphql/types/saveSearch';
import { SAVE_SEARCH } from '@aph/mobile-patients/src/graphql/profiles';
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
  useShoppingCart,
  PharmacyCircleEvent,
  PharmaCoupon,
  CouponProducts,
} from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { UIElementsContextProps } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { NavigationScreenProp, NavigationRoute } from 'react-navigation';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { getLatestMedicineOrder_getLatestMedicineOrder_medicineOrderDetails } from '@aph/mobile-patients/src/graphql/types/getLatestMedicineOrder';
import { getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails } from '@aph/mobile-patients/src/graphql/types/getMedicineOrderOMSDetailsWithAddress';
import { getDiagnosticSlotsWithAreaID_getDiagnosticSlotsWithAreaID_slots } from '@aph/mobile-patients/src/graphql/types/getDiagnosticSlotsWithAreaID';
import { getUserNotifyEvents_getUserNotifyEvents_phr_newRecordsCount } from '@aph/mobile-patients/src/graphql/types/getUserNotifyEvents';
import { getPackageInclusions } from '@aph/mobile-patients/src/helpers/clientCalls';
import { NavigationActions, StackActions } from 'react-navigation';
import { differenceInYears, parse } from 'date-fns';
import stripHtml from 'string-strip-html';
import isLessThan from 'semver/functions/lt';
import coerce from 'semver/functions/coerce';
import RNFetchBlob from 'rn-fetch-blob';
import { mimeType } from '@aph/mobile-patients/src/helpers/mimeType';
import { HEALTH_CREDITS } from '../utils/AsyncStorageKey';
import { getPatientByMobileNumber_getPatientByMobileNumber_patients } from '@aph/mobile-patients/src/graphql/types/getPatientByMobileNumber';
import CleverTap from 'clevertap-react-native';
import {
  CleverTapEvents,
  CleverTapEventName,
  ReorderMedicines,
  PharmacyCircleMemberValues,
} from '@aph/mobile-patients/src/helpers/CleverTapEvents';
import Share from 'react-native-share';

const width = Dimensions.get('window').width;

const { RNAppSignatureHelper } = NativeModules;
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

type ConsultPermissionScreenName =
  | 'Home Screen'
  | 'Payment Confirmation Screen'
  | 'Appointment Screen';

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

export enum EDIT_DELETE_TYPE {
  EDIT = 'Edit Details',
  DELETE = 'Delete Data',
  DELETE_PRESCRIPTION = 'Delete Prescription',
  DELETE_TEST_REPORT = 'Delete Test Report',
  DELETE_DISCHARGE_SUMMARY = 'Delete Discharge Summary',
  DELETE_HEALTH_CONDITION = 'Delete Health Condition',
  DELETE_BILL = 'Delete Bill',
  DELETE_INSURANCE = 'Delete Insurance',
}

type EditDeleteArray = {
  key: EDIT_DELETE_TYPE;
  title: string;
};

export enum HEALTH_CONDITIONS_TITLE {
  ALLERGY = 'ALLERGIES DETAIL',
  MEDICATION = 'MEDICATION',
  HEALTH_RESTRICTION = 'RESTRICTION',
  MEDICAL_CONDITION = 'MEDICAL CONDITION',
  FAMILY_HISTORY = 'FAMILY HISTORY',
}

export const getPhrHighlightText = (highlightText: string) => {
  return stripHtml(highlightText?.replace(/[\{["]/gi, '')) || '';
};

export const ConsultRxEditDeleteArray: EditDeleteArray[] = [
  { key: EDIT_DELETE_TYPE.EDIT, title: EDIT_DELETE_TYPE.EDIT },
  { key: EDIT_DELETE_TYPE.DELETE, title: EDIT_DELETE_TYPE.DELETE },
];

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

export const getDoctorShareMessage = (doctorData: any) => {
  const hospitalName = g(doctorData, 'doctorHospital', '0', 'facility', 'name')
    ? g(doctorData, 'doctorHospital', '0', 'facility', 'name') + ', '
    : '';
  const hospitalCity = g(doctorData, 'doctorHospital', '0', 'facility', 'city') || '';
  return `Recommending ${doctorData?.displayName} \n\n${
    doctorData?.displayName
  } from ${doctorData?.doctorfacility ||
    hospitalName + hospitalCity} is one of the top ${doctorData?.specialtydisplayName ||
    doctorData?.specialty?.name ||
    ''} doctors in the country. \n\nI strongly recommend ${
    doctorData?.gender ? (doctorData?.gender === Gender.FEMALE ? 'her' : 'him') : ''
  } for any relevant health issues!\n\nYou can easily consult with ${
    doctorData?.displayName
  } online over Apollo 247 App and Website. Click ${doctorData?.profile_deeplink || ''} to book!`;
};

export const formatAddressWithLandmark = (
  address: savePatientAddress_savePatientAddress_patientAddress
) => {
  const addrLine1 = removeConsecutiveComma(
    [address?.addressLine1, address?.addressLine2].filter((v) => v).join(', ')
  );
  const landmark = [address?.landmark];
  // to handle state value getting twice
  const addrLine2 = removeConsecutiveComma(
    [address?.city, address?.state]
      .filter((v) => v)
      .join(', ')
      .split(',')
      .map((v) => v.trim())
      .filter((item, idx, array) => array.indexOf(item) === idx)
      .join(', ')
  );
  const formattedZipcode = address?.zipcode ? ` - ${address?.zipcode}` : '';
  if (address?.landmark != '') {
    return `${addrLine1},\nLandmark: ${landmark}\n${addrLine2}${formattedZipcode}`;
  } else {
    return `${addrLine1}\n${addrLine2}${formattedZipcode}`;
  }
};

export const getAge = (dob: string) => {
  const now = new Date();
  let age = parse(dob);
  return differenceInYears(now, age);
};

export function isAddressLatLngInValid(address: any) {
  let isInvalid =
    address?.latitude == null ||
    address?.longitude == null ||
    address?.latitude == 0 ||
    address?.longitude == 0;

  return isInvalid;
}

export const formatAddressBookAddress = (
  address: savePatientAddress_savePatientAddress_patientAddress
) => {
  const addrLine1 = removeConsecutiveComma(
    [address?.addressLine1, address?.addressLine2, address?.city].filter((v) => v).join(', ')
  );
  const landmark = [address?.landmark];
  const state = [address?.state];
  const formattedZipcode = address?.zipcode ? ` - ${address?.zipcode}` : '';
  if (address?.landmark != '') {
    return `${addrLine1},\n${landmark}\n${state}${formattedZipcode}`;
  } else {
    return `${addrLine1},\n${state}${formattedZipcode}`;
  }
};

export const formatAddressForApi = (
  address: savePatientAddress_savePatientAddress_patientAddress
) => {
  const addrLine1 = [address?.addressLine1, address?.addressLine2, address?.landmark, address?.city]
    .filter((v) => v)
    .join(', ');
  const state = [address?.state];
  const formattedZipcode = address?.zipcode ? `${address?.zipcode}` : '';
  const formattedAddress = removeConsecutiveComma(
    addrLine1 + ', ' + state + ', ' + formattedZipcode
  );
  return formattedAddress;
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
    | (getPatientAllAppointments_getPatientAllAppointments_activeAppointments_caseSheet | null)[]
    | null,
  item: getPatientAllAppointments_getPatientAllAppointments_activeAppointments
) => {
  const case_sheet = followUpChatDaysCaseSheet(caseSheet);
  const caseSheetChatDays = g(case_sheet, '0' as any, 'followUpAfterInDays');
  const followUpAfterInDays = caseSheetChatDays ? Number(caseSheetChatDays) : 7;
  return (
    item?.status === STATUS.CANCELLED ||
    moment(new Date(item?.appointmentDateTime))
      .add(followUpAfterInDays, 'days')
      .isSameOrBefore(moment(new Date()))
  );
};

export const followUpChatDaysCaseSheet = (
  caseSheet:
    | (getPatientAllAppointments_getPatientAllAppointments_activeAppointments_caseSheet | null)[]
    | null
) => {
  const case_sheet =
    caseSheet &&
    caseSheet
      .filter((j) => j && j.doctorType !== DoctorType.JUNIOR)
      .sort((a, b) => (b ? b.version || 1 : 1) - (a ? a.version || 1 : 1));
  return case_sheet;
};

const foundDataIndex = (key: string, finalData: { key: string; data: any[] }[]) => {
  return finalData?.findIndex((data: { key: string; data: any[] }) => data?.key === key);
};

const sortByDays = (
  key: string,
  finalData: { key: string; data: any[] }[],
  dataExistsAt: number,
  dataObject: any[]
) => {
  const dataArray = finalData;
  if (dataArray.length === 0 || dataExistsAt === -1) {
    dataArray.push({ key, data: [dataObject] });
  } else {
    const array = dataArray[dataExistsAt].data;
    array.push(dataObject);
    dataArray[dataExistsAt].data = array;
  }
  return dataArray;
};

export const editDeleteData = (recordType: MedicalRecordType) => {
  let editDeleteArray: EditDeleteArray[] = [];
  switch (recordType) {
    case MedicalRecordType.PRESCRIPTION:
      editDeleteArray = [
        { key: EDIT_DELETE_TYPE.EDIT, title: EDIT_DELETE_TYPE.EDIT },
        {
          key: EDIT_DELETE_TYPE.DELETE_PRESCRIPTION,
          title: EDIT_DELETE_TYPE.DELETE_PRESCRIPTION,
        },
      ];
      break;
    case MedicalRecordType.TEST_REPORT:
      editDeleteArray = [
        { key: EDIT_DELETE_TYPE.EDIT, title: EDIT_DELETE_TYPE.EDIT },
        {
          key: EDIT_DELETE_TYPE.DELETE_TEST_REPORT,
          title: EDIT_DELETE_TYPE.DELETE_TEST_REPORT,
        },
      ];
      break;
    case MedicalRecordType.HOSPITALIZATION:
      editDeleteArray = [
        { key: EDIT_DELETE_TYPE.EDIT, title: EDIT_DELETE_TYPE.EDIT },
        {
          key: EDIT_DELETE_TYPE.DELETE_DISCHARGE_SUMMARY,
          title: EDIT_DELETE_TYPE.DELETE_DISCHARGE_SUMMARY,
        },
      ];
      break;
    case MedicalRecordType.ALLERGY:
      editDeleteArray = [
        { key: EDIT_DELETE_TYPE.EDIT, title: EDIT_DELETE_TYPE.EDIT },
        {
          key: EDIT_DELETE_TYPE.DELETE_HEALTH_CONDITION,
          title: EDIT_DELETE_TYPE.DELETE_HEALTH_CONDITION,
        },
      ];
      break;
    case MedicalRecordType.MEDICALBILL:
      editDeleteArray = [
        { key: EDIT_DELETE_TYPE.EDIT, title: EDIT_DELETE_TYPE.EDIT },
        {
          key: EDIT_DELETE_TYPE.DELETE_BILL,
          title: EDIT_DELETE_TYPE.DELETE_BILL,
        },
      ];
      break;
    case MedicalRecordType.MEDICALINSURANCE:
      editDeleteArray = [
        { key: EDIT_DELETE_TYPE.EDIT, title: EDIT_DELETE_TYPE.EDIT },
        {
          key: EDIT_DELETE_TYPE.DELETE_INSURANCE,
          title: EDIT_DELETE_TYPE.DELETE_INSURANCE,
        },
      ];
      break;
  }
  return editDeleteArray?.map((i) => {
    return { key: i?.key, value: i?.title };
  });
};

export const getPhrNotificationAllCount = (
  phrNotificationData: getUserNotifyEvents_getUserNotifyEvents_phr_newRecordsCount
) => {
  return (
    (phrNotificationData?.Prescription || 0) +
    (phrNotificationData?.LabTest || 0) +
    (phrNotificationData?.HealthCheck || 0) +
    (phrNotificationData?.Hospitalization || 0) +
    (phrNotificationData?.Allergy || 0) +
    (phrNotificationData?.MedicalCondition || 0) +
    (phrNotificationData?.Medication || 0) +
    (phrNotificationData?.Restriction || 0) +
    (phrNotificationData?.Bill || 0) +
    (phrNotificationData?.Insurance || 0)
  );
};

export const phrSortByDate = (array: { type: string; data: any }[]) => {
  return array.sort(({ data: data1 }, { data: data2 }) => {
    let date1 = new Date(data1.date || data1.bookingDate || data1.quoteDateTime);
    let date2 = new Date(data2.date || data2.bookingDate || data2.quoteDateTime);
    return date1 > date2 ? -1 : date1 < date2 ? 1 : data2.id - data1.id;
  });
};

export const phrSortWithDate = (array: any) => {
  return array?.sort(
    (a: any, b: any) =>
      moment(b?.date || b?.billDateTime || b?.startDateTime || b?.recordDateTime)
        .toDate()
        .getTime() -
      moment(a?.date || a?.billDateTime || a?.startDateTime || a?.recordDateTime)
        .toDate()
        .getTime()
  );
};

export const getSourceName = (
  labTestSource: string,
  siteDisplayName: string = '',
  healthCheckSource: string = ''
) => {
  if (
    labTestSource === 'self' ||
    labTestSource === '247self' ||
    labTestSource === '247selfConsultation' ||
    siteDisplayName === 'self' ||
    siteDisplayName === '247self' ||
    healthCheckSource === 'self' ||
    healthCheckSource === '247self' ||
    healthCheckSource === '247selfConsultation'
  ) {
    return string.common.clicnical_document_text;
  }
  return labTestSource || siteDisplayName || healthCheckSource;
};

const getConsiderDate = (type: string, dataObject: any) => {
  switch (type) {
    case 'consults':
      return dataObject?.data?.patientId
        ? dataObject?.data?.appointmentDateTime
        : dataObject?.data?.date;
    case 'lab-results':
      return dataObject?.data?.date;
    case 'hospitalizations':
      return dataObject?.date;
    case 'insurance':
      return dataObject?.startDateTime;
    case 'bills':
      return dataObject?.billDateTime;
    case 'health-conditions':
      return dataObject?.startDateTime || dataObject?.recordDateTime;
    case 'immunization':
      return dataObject?.dateOfImmunization;
  }
};

const getFinalSortData = (key: string, finalData: any[], dataObject: any) => {
  const dataExistsAt = foundDataIndex(key, finalData);
  return sortByDays(key, finalData, dataExistsAt, dataObject);
};

export const initialSortByDays = (
  type: string,
  filteredData: any[],
  toBeFinalData: { key: string; data: any[] }[]
) => {
  let finalData = toBeFinalData;
  filteredData?.forEach((dataObject: any) => {
    const startDate = moment().set({
      hour: 23,
      minute: 59,
    });
    const dateToConsider = getConsiderDate(type, dataObject);
    const dateDifferenceInDays = moment(startDate).diff(dateToConsider, 'days');
    const dateDifferenceInMonths = moment(startDate).diff(dateToConsider, 'months');
    const dateDifferenceInYears = moment(startDate).diff(dateToConsider, 'years');

    if (dateDifferenceInDays <= 0 && dateDifferenceInMonths <= 0 && dateDifferenceInYears <= 0) {
      finalData = getFinalSortData('Upcoming', finalData, dataObject);
    } else if (dateDifferenceInYears !== 0) {
      if (dateDifferenceInYears >= 5) {
        finalData = getFinalSortData('More than 5 years', finalData, dataObject);
      } else if (dateDifferenceInYears >= 2) {
        finalData = getFinalSortData('Past 5 years', finalData, dataObject);
      } else if (dateDifferenceInYears >= 1) {
        finalData = getFinalSortData('Past 2 years', finalData, dataObject);
      } else {
        finalData = getFinalSortData('Past 12 months', finalData, dataObject);
      }
    } else if (dateDifferenceInMonths > 1) {
      if (dateDifferenceInMonths >= 6) {
        finalData = getFinalSortData('Past 12 months', finalData, dataObject);
      } else if (dateDifferenceInMonths >= 2) {
        finalData = getFinalSortData('Past 6 months', finalData, dataObject);
      } else {
        finalData = getFinalSortData('Past 2 months', finalData, dataObject);
      }
    } else {
      if (dateDifferenceInDays > 30) {
        finalData = getFinalSortData('Past 2 months', finalData, dataObject);
      } else {
        finalData = getFinalSortData('Past 30 days', finalData, dataObject);
      }
    }
  });
  return finalData;
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

export const getPrescriptionDate = (date: string) => {
  let prev_date = new Date();
  prev_date.setDate(prev_date.getDate() - 1);
  if (moment(new Date()).format('DD/MM/YYYY') === moment(new Date(date)).format('DD/MM/YYYY')) {
    return 'Today';
  } else if (
    moment(prev_date).format('DD/MM/YYYY') === moment(new Date(date)).format('DD/MM/YYYY')
  ) {
    return 'Yesterday';
  }
  return moment(new Date(date)).format('DD MMM');
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
      statusString = 'Out for Delivery';
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
    case MEDICINE_ORDER_STATUS.DELIVERY_ATTEMPTED:
      statusString = 'Delivery Attempted';
      break;
    case MEDICINE_ORDER_STATUS.RVP_ASSIGNED:
      statusString = 'Return Pickup Assigned';
      break;
    case MEDICINE_ORDER_STATUS.RETURN_PICKUP:
      statusString = 'Return Successful';
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

export const generateTimeSlots = (availableSlots: string[], date: Date) => {
  const todayDate = moment(new Date()).format('YYYY-MM-DD');

  const array: TimeArray = [
    { label: '12 AM - 6 AM', time: [] },
    { label: '6 AM - 12 PM', time: [] },
    { label: '12 PM - 6 PM', time: [] },
    { label: '6 PM - 12 AM', time: [] },
  ];

  const morningStartTime = moment('00:00', 'HH:mm');
  const morningEndTime = moment('05:59', 'HH:mm');
  const afternoonStartTime = moment('06:00', 'HH:mm');
  const afternoonEndTime = moment('11:59', 'HH:mm');
  const eveningStartTime = moment('12:00', 'HH:mm');
  const eveningEndTime = moment('17:59', 'HH:mm');
  const nightStartTime = moment('18:00', 'HH:mm');
  const nightEndTime = moment('23:59', 'HH:mm');

  availableSlots.forEach((slot) => {
    const IOSFormat = slot; //`${date.toISOString().split('T')[0]}T${slot}:00.000Z`;

    const formatedSlot = moment(IOSFormat)
      .local()
      .format('HH:mm'); //.format('HH:mm');
    const slotTime = moment(formatedSlot, 'HH:mm');
    if (
      todayDate === moment(date).format('YYYY-MM-DD') &&
      todayDate !== moment(IOSFormat).format('YYYY-MM-DD')
    ) {
    } else {
      if (new Date() < new Date(IOSFormat)) {
        if (
          slotTime.isBetween(morningStartTime, morningEndTime) ||
          slotTime.isSame(morningStartTime)
        ) {
          array[0] = {
            label: '12 AM - 6 AM',
            time: [...array[0]?.time, slot],
          };
        } else if (
          slotTime.isBetween(afternoonStartTime, afternoonEndTime) ||
          slotTime.isSame(afternoonStartTime)
        ) {
          array[1] = {
            ...array[1],
            time: [...array[1]?.time, slot],
          };
        } else if (
          slotTime.isBetween(eveningStartTime, eveningEndTime) ||
          slotTime.isSame(eveningStartTime)
        ) {
          array[2] = {
            ...array[2],
            time: [...array[2]?.time, slot],
          };
        } else if (
          slotTime.isBetween(nightStartTime, nightEndTime) ||
          slotTime.isSame(nightStartTime)
        ) {
          array[3] = {
            ...array[3],
            time: [...array[3]?.time, slot],
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
export const timeDiffDaysFromNow = (toDate: string) => {
  let timeDiff: Number = 0;
  const today: Date = new Date();
  const date2: Date = new Date(toDate);
  if (date2 && today) {
    timeDiff = Math.ceil(((date2 as any) - (today as any)) / (60000 * 60 * 24));
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
    const d = new Date();
    const current = moment(d);
    const hoursPassedToday = d.getHours();
    const minPassedToday = hoursPassedToday * 60 + d.getMinutes();
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
    } else if (isTomorrow && differenceMinute < 2880 - minPassedToday) {
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
  return Object.keys(object)?.length === 0 && object?.constructor === Object;
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
  latLngOnly?: boolean,
  modifyAddress?: boolean
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
            reject('Unable to get location.');
          } else {
            resolve(
              getFormattedLocation(
                addrComponents,
                { lat: latitude, lng: longitude },
                '',
                modifyAddress
              )
            );
          }
        })
        .catch((e) => {
          CommonBugFender('helperFunctions_getlocationData', e);
          reject('Unable to get location.');
        });
    },
    (error) => {
      reject('Unable to get location.');
    },
    { accuracy: { android: 'balanced', ios: 'best' }, enableHighAccuracy: true, timeout: 10000 }
  );
};

export const doRequestAndAccessLocationModified = (
  latLngOnly?: boolean,
  modifyAddress?: boolean
): Promise<LocationData> => {
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
                getlocationData(resolve, reject, latLngOnly, modifyAddress);
              })
              .catch((e: Error) => {
                CommonBugFender('helperFunctions_RNAndroidLocationEnabler', e);
                reject('Unable to get location.');
              });
          } else {
            getlocationData(resolve, reject, latLngOnly, modifyAddress);
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

export const doRequestAndAccessLocation = (isModifyAddress?: boolean): Promise<LocationData> => {
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
                getlocationData(resolve, reject, false, isModifyAddress);
              })
              .catch((e: Error) => {
                CommonBugFender('helperFunctions_RNAndroidLocationEnabler', e);
                reject('Unable to get location.');
              });
          } else {
            getlocationData(resolve, reject, false, isModifyAddress);
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

export const isValidImageUrl = (value: string) =>
  /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|png|JPG|PNG|jpeg|JPEG)/.test(value);

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

export const getUserType = (allCurrentPatients: any) => {
  const isConsulted = allCurrentPatients?.filter(
    (patient: getPatientByMobileNumber_getPatientByMobileNumber_patients) =>
      patient?.isConsulted === true
  );
  const userType: string = isConsulted?.length > 0 ? 'Repeat' : 'New';
  return userType;
};

export const reOrderMedicines = async (
  order:
    | getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails
    | getLatestMedicineOrder_getLatestMedicineOrder_medicineOrderDetails,
  currentPatient: any,
  source: ReorderMedicines['source']
) => {
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
  const appointmentIds = (order?.appointmentId || '')
    .split(',')
    .map((item) => item.trim())
    .filter((v) => v);
  const medicineNames = (billedLineItems
    ? billedLineItems.filter((item) => item.itemName).map((item) => item.itemName)
    : lineItems.filter((item) => item.medicineName).map((item) => item.medicineName!)
  ).join(',');
  const prescriptionsToAdd = prescriptionUrls.map(
    (item, index) =>
      ({
        id: appointmentIds?.[index],
        appointmentId: appointmentIds?.[index],
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
  pincode?: string,
  setLoading?: UIElementsContextProps['setLoading']
) => {
  const detailQuery = async (itemId: string) =>
    await getPackageInclusions(apolloClient, [Number(itemId)]);
  try {
    setLoading?.(true);
    const items = testPrescription?.filter((val) => val?.itemname)?.map((item) => item?.itemname);
    const formattedItemNames = items?.map((item) => item)?.join('|');
    const searchQueries: any = await getDiagnosticDoctorPrescriptionResults(
      formattedItemNames,
      AppConfig.Configuration.DIAGNOSTIC_DEFAULT_CITYID
    );

    if (searchQueries?.data?.success) {
      const searchResults = searchQueries?.data?.data;
      const searchQueriesData = searchResults?.filter((item: any) => !!item);
      const detailQueries = Promise.all(
        searchQueriesData?.map((item: any) => detailQuery(`${item.itemId}`))
      );
      const detailQueriesData = (await detailQueries)?.map(
        (item: any) => g(item, 'data', 'getInclusionsOfMultipleItems', 'inclusions', 'length') || 1 // updating testsIncluded
      );
      setLoading?.(false);
      const finalArray: DiagnosticsCartItem[] = Array.from({
        length: searchQueriesData?.length,
      }).map((_, index) => {
        const s = searchQueriesData?.[index];
        const testIncludedCount = detailQueriesData?.[index];
        return {
          id: `${s?.diagnostic_item_id}`,
          name: s?.diagnostic_item_name,
          price: 0,
          specialPrice: undefined,
          mou: testIncludedCount,
          thumbnail: '',
          collectionMethod: TEST_COLLECTION_TYPE.HC,
          inclusions: s?.inclusions == null ? [Number(s?.diagnostic_item_id)] : s?.inclusions,
        } as DiagnosticsCartItem;
      });
      return finalArray;
    } else {
      setLoading?.(false);
      return [];
    }
  } catch (error) {
    CommonBugFender('helperFunctions_addTestsToCart', error);
    setLoading?.(false);
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
    case 'https://aph-dev-api.apollo247.com//graphql':
      return 'DEV';
    case 'https://aph-staging-api.apollo247.com//graphql':
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
    webengage.track(eventName, attributes);
  } catch (error) {}
};

export const postCleverTapEvent = (eventName: CleverTapEventName, attributes: Object) => {
  try {
    CleverTap.recordEvent(eventName, attributes);
  } catch (error) {}
};

export const onCleverTapUserLogin = async (_currentPatient: any) => {
  try {
    const _userProfile = {
      Name: _currentPatient?.firstName + ' ' + (_currentPatient?.lastName || ''),
      UHID: _currentPatient?.uhid || '',
      Identity: _currentPatient?.mobileNumber || '',
      MobileNumber: _currentPatient?.mobileNumber || '',
      Firstname: _currentPatient?.firstName || '',
      ...(_currentPatient?.lastName && { Lastname: _currentPatient?.lastName }),
      Relation: _currentPatient?.relation || '',
      Gender:
        _currentPatient?.gender == Gender.MALE
          ? 'M'
          : _currentPatient?.gender == Gender.FEMALE
          ? 'F'
          : '',
      DOB: new Date(_currentPatient?.dateOfBirth),
      ...(_currentPatient?.emailAddress && { Email: _currentPatient?.emailAddress }),
      ...(_currentPatient?.photoUrl && { Photo: _currentPatient?.photoUrl }),
      ...(_currentPatient?.createdDate && { CreatedDate: _currentPatient?.createdDate }),
    };
    CleverTap.onUserLogin(_userProfile);
  } catch (error) {
    CommonBugFender('setCleverTapUserLogin', error);
  }
};

export type CircleEventSource =
  | 'Circle Popup Plan only'
  | 'Landing Home Page banners'
  | 'Medicine Home page banners'
  | 'Medicine Homepage Sticky'
  | 'Diagnostic Home page Banner'
  | 'VC Doctor Profile'
  | 'Cart(Pharma)'
  | 'Cart(VC)'
  | 'Membership Details'
  | 'Landing Home Page'
  | 'My Account-My membership section'
  | 'Corporate Membership Page'
  | 'Circle Membership page'
  | 'VC Doctor Card';

export const getCircleNoSubscriptionText = () => string.common.circleNoSubscriptionText;

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
  categoryName?: WebEngageEvents[WebEngageEventName.PHARMACY_ADD_TO_CART]['category name'],
  pharmacyCircleAttributes?: PharmacyCircleEvent
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
    ...pharmacyCircleAttributes,
  };
  postWebEngageEvent(WebEngageEventName.PHARMACY_ADD_TO_CART, eventAttributes);
  const cleverTapEventAttributes: CleverTapEvents[CleverTapEventName.PHARMACY_ADD_TO_CART] = {
    'product name': name,
    'product id (SKUID)': sku,
    'category name': categoryName || undefined,
    'Section Name': sectionName || undefined,
    'category ID': category_id || undefined,
    Price: price,
    'Discounted Price': Number(special_price) || undefined,
    Quantity: 1,
    Source: source,
    'Circle Member':
      getCleverTapCircleMemberValues(pharmacyCircleAttributes?.['Circle Membership Added']!) ||
      undefined,
    'Circle Membership Value': pharmacyCircleAttributes?.['Circle Membership Value'] || undefined,
  };
  postCleverTapEvent(CleverTapEventName.PHARMACY_ADD_TO_CART, cleverTapEventAttributes);
};

export const getCleverTapCircleMemberValues = (
  pharmacyCircleMemeber: PharmacyCircleEvent['Circle Membership Added']
): PharmacyCircleMemberValues => {
  return pharmacyCircleMemeber == 'Yes'
    ? 'Added'
    : pharmacyCircleMemeber == 'No'
    ? 'Not Added'
    : 'Existing';
};

export const postAppointmentCleverTapEvents = (
  type:
    | CleverTapEventName.CONSULT_RESCHEDULE_CLICKED
    | CleverTapEventName.CONSULT_CANCEL_CLICKED_BY_PATIENT
    | CleverTapEventName.CONSULT_CONTINUE_CONSULTATION_CLICKED
    | CleverTapEventName.CONSULT_CANCELLED_BY_PATIENT
    | CleverTapEventName.CONSULT_RESCHEDULED_BY_THE_PATIENT,
  data: any,
  currentPatient: any,
  secretaryData: any
) => {
  const eventAttributes:
    | CleverTapEvents[CleverTapEventName.CONSULT_RESCHEDULE_CLICKED]
    | CleverTapEvents[CleverTapEventName.CONSULT_CANCEL_CLICKED_BY_PATIENT]
    | CleverTapEvents[CleverTapEventName.CONSULT_CONTINUE_CONSULTATION_CLICKED]
    | CleverTapEvents[CleverTapEventName.CONSULT_CANCELLED_BY_PATIENT]
    | CleverTapEvents[CleverTapEventName.CONSULT_RESCHEDULED_BY_THE_PATIENT] = {
    doctorName: g(data, 'doctorInfo', 'fullName')!,
    'Speciality ID': g(data, 'doctorInfo', 'specialty', 'id')!,
    'Speciality Name': g(data, 'doctorInfo', 'specialty', 'name')!,
    'Doctor Category': g(data, 'doctorInfo', 'doctorType')!,
    'Consult Date Time': moment(g(data, 'appointmentDateTime')).toDate(),
    'Consult Mode': g(data, 'appointmentType') == APPOINTMENT_TYPE.ONLINE ? 'Online' : 'Physical',
    'Hospital Name': g(data, 'doctorInfo', 'doctorHospital', '0' as any, 'facility', 'name')!,
    'Hospital City': g(data, 'doctorInfo', 'doctorHospital', '0' as any, 'facility', 'city')!,
    docId: g(data, 'doctorId') || undefined,
    patientName: `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
    'Patient UHID': g(currentPatient, 'uhid'),
    Relation: g(currentPatient, 'relation'),
    'Patient Age': Math.round(moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)),
    'Patient Gender': g(currentPatient, 'gender'),
    'Customer ID': g(currentPatient, 'id'),
    secretaryName: g(secretaryData, 'name'),
    secretaryNumber: g(secretaryData, 'mobileNumber'),
    doctorNumber: g(data, 'doctorInfo', 'mobileNumber')!,
    patientNumber: g(currentPatient, 'mobileNumber') || undefined,
  };
  postCleverTapEvent(type, eventAttributes);
};

export function getTimeDiff(nextSlot: any) {
  let timeDiff: number = 0;
  const today: Date = new Date();
  const date2: Date = new Date(nextSlot);
  if (date2 && today) {
    timeDiff = Math.round(((date2 as any) - (today as any)) / 60000);
  }
  return timeDiff;
}

export const postConsultSearchCleverTapEvent = (
  searchInput: string,
  currentPatient: any,
  allCurrentPatients: any,
  noResults: boolean,
  source: 'speciality screen' | 'Doctor listing screen'
) => {
  const eventAttributes: CleverTapEvents[CleverTapEventName.CONSULT_SEARCH] = {
    textSearched: searchInput,
    'Patient name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
    'Patient UHID': g(currentPatient, 'uhid'),
    Relation: g(currentPatient, 'relation'),
    'Patient age': Math.round(moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)),
    'Patient gender': g(currentPatient, 'gender'),
    'Mobile Number': g(currentPatient, 'mobileNumber'),
    'Customer ID': g(currentPatient, 'id'),
    User_Type: getUserType(allCurrentPatients),
    Source: source,
    'search result success': noResults ? 'No' : 'Yes',
  };
  postCleverTapEvent(CleverTapEventName.CONSULT_SEARCH, eventAttributes);
};

export const postConsultPastSearchSpecialityClicked = (
  currentPatient: any,
  allCurrentPatients: any,
  rowData: any
) => {
  const cleverTapEventAttributes: CleverTapEvents[CleverTapEventName.CONSULT_PAST_SEARCHES_CLICKED] = {
    'Patient name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
    'Patient UHID': g(currentPatient, 'uhid'),
    'Patient age': Math.round(moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)),
    'Patient gender': g(currentPatient, 'gender'),
    User_Type: getUserType(allCurrentPatients) || undefined,
    isConsulted: getUserType(allCurrentPatients) || undefined,
    specialtyId: rowData?.typeId || undefined,
    specialtyName: rowData?.name || undefined,
  };
  postCleverTapEvent(CleverTapEventName.CONSULT_PAST_SEARCHES_CLICKED, cleverTapEventAttributes);
};

export const postCleverTapPHR = (
  currentPatient: any,
  cleverTapEventName: CleverTapEventName,
  source: string = '',
  data: any = {}
) => {
  const eventAttributes: CleverTapEvents[CleverTapEventName.MEDICAL_RECORDS] = {
    ...removeObjectNullUndefinedProperties(data),
    Source: source,
    ...removeObjectNullUndefinedProperties(currentPatient),
  };
  postWebEngageEvent(cleverTapEventName, eventAttributes);
  postCleverTapEvent(cleverTapEventName, eventAttributes);
};

export const phrSearchCleverTapEvents = (
  cleverTapEventName: CleverTapEventName,
  currentPatient: any,
  searchKey: string
) => {
  const eventAttributes = {
    searchKey,
    'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
    'Patient UHID': g(currentPatient, 'uhid'),
    Relation: g(currentPatient, 'relation'),
    'Patient Age': Math.round(moment().diff(currentPatient.dateOfBirth, 'years', true)),
    'Patient Gender': g(currentPatient, 'gender'),
    'Mobile Number': g(currentPatient, 'mobileNumber'),
    'Customer ID': g(currentPatient, 'id'),
  };
  postWebEngageEvent(cleverTapEventName, eventAttributes);
  postCleverTapEvent(cleverTapEventName, eventAttributes);
};

export const getUsageKey = (type: string) => {
  switch (type) {
    case 'Doctor Consults':
      return 'consults-usage';
    case 'Test Report':
      return 'testReports-usage';
    case 'Hospitalization':
      return 'hospitalizations-usage';
    case 'Allergy':
    case 'Medication':
    case 'Restriction':
    case 'Family History':
    case 'MedicalCondition':
      return 'healthConditions-usage';
    case 'Bill':
      return 'bills-usage';
    case 'Insurance':
      return 'insurance-usage';
  }
};

export const postCleverTapIfNewSession = (
  type: string,
  currentPatient: any,
  data: any,
  phrSession: string,
  setPhrSession: ((value: string) => void) | null
) => {
  let session = phrSession;
  let sessionId;
  if (!session) {
    sessionId = `${+new Date()}`;
    const obj: any = {
      'consults-usage': null,
      'testReports-usage': null,
      'hospitalizations-usage': null,
      'healthConditions-usage': null,
      'bills-usage': null,
      'insurance-usage': null,
    };
    const usageKey = getUsageKey(type);
    obj[usageKey] = sessionId;
    setPhrSession?.(JSON.stringify(obj));
    postCleverTapPHR(
      currentPatient,
      CleverTapEventName.PHR_NO_OF_USERS_CLICKED_ON_RECORDS.replace(
        '{0}',
        type
      ) as CleverTapEventName,
      type,
      {
        sessionId,
        ...data,
      }
    );
  } else {
    const sessionObj = JSON.parse(session);
    const usageKey = getUsageKey(type);
    sessionId = sessionObj[usageKey];
    if (!sessionId) {
      sessionId = `${+new Date()}`;
      const newSessionObj = { ...sessionObj };
      newSessionObj[usageKey] = sessionId;
      setPhrSession?.(JSON.stringify(newSessionObj));
      postCleverTapPHR(
        currentPatient,
        CleverTapEventName.PHR_NO_OF_USERS_CLICKED_ON_RECORDS.replace(
          '{0}',
          type
        ) as CleverTapEventName,
        type,
        {
          sessionId,
          ...data,
        }
      );
    }
  }
};

export const removeObjectProperty = (object: any, property: string) => {
  return _.omit(object, property);
};

export function removeObjectNullUndefinedProperties(_object: any) {
  for (let propName in _object) {
    if (_object[propName] === null || _object[propName] === undefined || _object[propName] === '') {
      delete _object[propName];
    }
  }
  return _object;
}

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
  webengage.user.setAttribute('whatsapp_opt_in', whatsAppAllow); //WhatsApp
};

export const postWEGReferralCodeEvent = (ReferralCode: string) => {
  webengage.user.setAttribute('Referral Code', ReferralCode); //Referralcode
};

export const postDoctorShareWEGEvents = (
  doctorData: any,
  eventName: WebEngageEventName,
  currentPatient: any,
  specialityId: string,
  rank: number = 1
) => {
  const eventAttributes: WebEngageEvents[WebEngageEventName.SHARE_CLICK_DOC_LIST_SCREEN] = {
    'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
    'Patient UHID': g(currentPatient, 'uhid'),
    'Patient Age': Math.round(moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)),
    'Patient Gender': g(currentPatient, 'gender'),
    'Mobile Number': g(currentPatient, 'mobileNumber'),
    'Doctor ID': g(doctorData, 'id')!,
    'Doctor Name': g(doctorData, 'displayName')!,
    'Speciality Name': g(doctorData, 'specialtydisplayName')!,
    'Doctor card rank': rank,
    'Speciality ID': specialityId,
  };
  postWebEngageEvent(eventName, eventAttributes);
};

export const postDoctorShareCleverTapEvents = (
  doctorData: any,
  eventName: CleverTapEventName,
  currentPatient: any,
  specialityId: string,
  rank: number = 1
) => {
  const eventAttributes: CleverTapEvents[CleverTapEventName.CONSULT_SHARE_ICON_CLICKED] = {
    'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
    'Patient UHID': g(currentPatient, 'uhid'),
    'Patient Age': Math.round(moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)),
    'Patient Gender': g(currentPatient, 'gender'),
    'Mobile Number': g(currentPatient, 'mobileNumber'),
    'Doctor ID': g(doctorData, 'id')!,
    'Doctor Name': g(doctorData, 'displayName')!,
    'Speciality Name': g(doctorData, 'specialtydisplayName')!,
    'Doctor card rank': rank,
    'Speciality ID': specialityId,
    Source: 'Doctor listing',
  };
  postCleverTapEvent(eventName, eventAttributes);
};

export const permissionHandler = (
  permission: string,
  deniedMessage: string,
  doRequest: () => void,
  screenName?: ConsultPermissionScreenName
) => {
  Permissions.request(permission)
    .then((message) => {
      if (message === 'authorized') {
        doRequest();
        permission === 'camera' && consultPermissionCameraCleverTapEvents(screenName, true);
        permission === 'microphone' && consultPermissionCleverTapEvents(screenName, true);
      } else if (message === 'denied' || message === 'restricted') {
        permission === 'camera' && consultPermissionCameraCleverTapEvents(screenName, false);
        permission === 'microphone' && consultPermissionCleverTapEvents(screenName, false);
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
    .catch((e) => {});
};

const consultPermissionCleverTapEvents = (
  screenName?: ConsultPermissionScreenName,
  microphoneAuth?: boolean
) => {
  const eventAttributes: CleverTapEvents[CleverTapEventName.CONSULT_PERMISSIONS] = {
    'Screen Name': screenName!,
    Microphone: microphoneAuth,
  };
  postCleverTapEvent(CleverTapEventName.CONSULT_PERMISSIONS, eventAttributes);
};

const consultPermissionCameraCleverTapEvents = (
  screenName?: ConsultPermissionScreenName,
  cameraAuth?: boolean
) => {
  const eventAttributes: CleverTapEvents[CleverTapEventName.CONSULT_PERMISSIONS] = {
    'Screen Name': screenName!,
    Camera: cameraAuth,
  };
  postCleverTapEvent(CleverTapEventName.CONSULT_PERMISSIONS, eventAttributes);
};

export const callPermissions = (
  doRequest?: () => void,
  screenName?: ConsultPermissionScreenName
) => {
  permissionHandler(
    'camera',
    'Enable camera from settings for calls during consultation.',
    () => {
      permissionHandler(
        'microphone',
        'Enable microphone from settings for calls during consultation.',
        () => {
          doRequest && doRequest();
        },
        screenName
      );
    },
    screenName
  );
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
  onInstallConversionDataCanceller = appsFlyer.onInstallConversionData((res) => {
    if (JSON.parse(res.data.is_first_launch || 'null') == true) {
      try {
        if (res.data.af_dp !== undefined) {
          AsyncStorage.setItem('deeplink', res.data.af_dp);
        }
        if (res.data.af_sub1 !== null) {
          AsyncStorage.setItem('deeplinkReferalCode', res.data.af_sub1);
        }

        setBugFenderLog('APPS_FLYER_DEEP_LINK', res.data.af_dp);
        setBugFenderLog('APPS_FLYER_DEEP_LINK_Referral_Code', res.data.af_sub1);

        setBugFenderLog('APPS_FLYER_DEEP_LINK_COMPLETE', res.data);
      } catch (error) {}

      if (res.data.af_status === 'Non-organic') {
        const media_source = res.data.media_source;
        const campaign = res.data.campaign;
      } else if (res.data.af_status === 'Organic') {
      }
    } else {
    }
  });

  appsFlyer.initSdk(
    {
      devKey: 'pP3MjHNkZGiMCamkJ7YpbH',
      isDebug: false,
      appId: Platform.OS === 'ios' ? '1496740273' : '',
    },
    (result) => {},
    (error) => {}
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

        setBugFenderLog('onAppOpenAttribution_APPS_FLYER_DEEP_LINK', res.data.af_dp);
        setBugFenderLog(
          'onAppOpenAttribution_APPS_FLYER_DEEP_LINK_Referral_Code',
          res.data.af_sub1
        );

        setBugFenderLog('onAppOpenAttribution_APPS_FLYER_DEEP_LINK_COMPLETE', res.data);
      } catch (error) {}
    }
  });
};

export const UnInstallAppsFlyer = (newFirebaseToken: string) => {
  appsFlyer.updateServerUninstallToken(newFirebaseToken, (success) => {});
};

export const APPStateActive = () => {
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
    appsFlyer.logEvent(
      eventName,
      attributes,
      (res) => {},
      (err) => {}
    );
  } catch (error) {}
};

export const setCleverTapAppsFlyerCustID = () => {
  try {
    CleverTap.profileGetCleverTapAttributionIdentifier((err, res) => {
      const userId = res;
      SetAppsFlyerCustID(userId?.toString());
    });
  } catch (error) {}
};

export const SetAppsFlyerCustID = (patientId: string) => {
  try {
    appsFlyer.setCustomerUserId(patientId, (res) => {});
  } catch (error) {}
};

export const postAppsFlyerAddToCartEvent = (
  {
    sku,
    type_id,
    price,
    special_price,
  }: Pick<MedicineProduct, 'sku' | 'type_id' | 'price' | 'special_price'>,
  id: string,
  pharmacyCircleAttributes?: PharmacyCircleEvent
) => {
  const eventAttributes: AppsFlyerEvents[AppsFlyerEventName.PHARMACY_ADD_TO_CART] = {
    'customer id': id,
    af_revenue: Number(special_price) || price,
    af_currency: 'INR',
    item_type: type_id == 'Pharma' ? 'Drugs' : 'FMCG',
    sku: sku,
    ...pharmacyCircleAttributes,
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
    analytics().logEvent(eventName, attributes);
  } catch (error) {}
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
  sectionName?: string,
  pharmacyCircleAttributes?: PharmacyCircleEvent
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
      ...pharmacyCircleAttributes,
    };
    postFirebaseEvent(FirebaseEventName.PHARMACY_ADD_TO_CART, eventAttributes);
  } catch (error) {}
};

export const nameFormater = (
  name: string,
  caseFormat?: 'lower' | 'upper' | 'title' | 'camel' | 'default'
) => {
  if (caseFormat === 'title') {
    return _.startCase(name?.toLowerCase());
  } else if (caseFormat === 'camel') {
    return _.camelCase(name!);
  } else if (caseFormat === 'lower') {
    return _.lowerCase(name!);
  } else if (caseFormat === 'upper') {
    return _.upperCase(name!);
  } else {
    return _.capitalize(name?.replace(/_/g, ' '));
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
  pincode?: string,
  isModifyAddress?: boolean
) => {
  const { lat, lng } = latLang || {};
  let area;
  if (isModifyAddress) {
    area = [
      findAddrComponents('sublocality_level_2', addrComponents),
      findAddrComponents('sublocality_level_1', addrComponents),
      findAddrComponents('locality', addrComponents),
    ]?.filter((i) => i);
  } else {
    [
      findAddrComponents('route', addrComponents),
      findAddrComponents('sublocality_level_2', addrComponents),
      findAddrComponents('sublocality_level_1', addrComponents),
    ]?.filter((i) => i);
  }
  return {
    displayName: isModifyAddress
      ? findAddrComponents('locality', addrComponents) ||
        findAddrComponents('administrative_area_level_2', addrComponents)
      : (area || []).pop() ||
        findAddrComponents('locality', addrComponents) ||
        findAddrComponents('administrative_area_level_2', addrComponents),

    latitude: lat,
    longitude: lng,
    area: area?.join(', '),
    city:
      findAddrComponents('locality', addrComponents) ||
      findAddrComponents('administrative_area_level_2', addrComponents),
    state: findAddrComponents('administrative_area_level_1', addrComponents),
    stateCode: findAddrComponents('administrative_area_level_1', addrComponents, 'short_name'),
    country: findAddrComponents('country', addrComponents),
    pincode: (pincode != '' && pincode) || findAddrComponents('postal_code', addrComponents),
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

const getDaysCount = (type: MEDICINE_CONSUMPTION_DURATION | null) => {
  return type == MEDICINE_CONSUMPTION_DURATION.MONTHS
    ? 30
    : type == MEDICINE_CONSUMPTION_DURATION.WEEKS
    ? 7
    : 1;
};

export const getPrescriptionItemQuantity = (
  medicineUnit: MEDICINE_UNIT | null,
  medicineTimings: (MEDICINE_TIMINGS | null)[] | null,
  medicineDosage: string | null,
  medicineCustomDosage: string | null /** E.g: (1-0-1/2-0.5), (1-0-2\3-3) etc.*/,
  medicineConsumptionDurationInDays: string | null,
  medicineConsumptionDurationUnit: MEDICINE_CONSUMPTION_DURATION | null,
  mou: number // how many tablets per strip
) => {
  if (medicineUnit == MEDICINE_UNIT.TABLET || medicineUnit == MEDICINE_UNIT.CAPSULE) {
    const medicineDosageMapping = medicineCustomDosage
      ? medicineCustomDosage.split('-').map((item) => {
          if (item.indexOf('/') > -1) {
            const dosage = item.split('/').map((item) => Number(item));
            return (dosage[0] || 1) / (dosage[1] || 1);
          } else if (item.indexOf('\\') > -1) {
            const dosage = item.split('\\').map((item) => Number(item));
            return (dosage[0] || 1) / (dosage[1] || 1);
          } else {
            return Number(item);
          }
        })
      : medicineDosage
      ? Array.from({ length: 4 }).map(() => Number(medicineDosage))
      : [1, 1, 1, 1];

    const medicineTimingsPerDayCount =
      (medicineTimings || []).reduce(
        (currTotal, currItem) =>
          currTotal +
          (currItem == MEDICINE_TIMINGS.MORNING
            ? medicineDosageMapping[0]
            : currItem == MEDICINE_TIMINGS.NOON
            ? medicineDosageMapping[1]
            : currItem == MEDICINE_TIMINGS.EVENING
            ? medicineDosageMapping[2]
            : currItem == MEDICINE_TIMINGS.NIGHT
            ? medicineDosageMapping[3]
            : 1),
        0
      ) || 1;

    const totalTabletsNeeded =
      medicineTimingsPerDayCount *
      Number(medicineConsumptionDurationInDays || '1') *
      getDaysCount(medicineConsumptionDurationUnit);

    return Math.ceil(totalTabletsNeeded / mou);
  } else {
    // 1 for other than tablet or capsule
    return 1;
  }
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
  url_key,
}: MedicineProduct): ShoppingCartItem => {
  return {
    id: sku,
    name: name,
    price: price,
    specialPrice: Number(special_price) || undefined,
    mou: mou,
    quantity: 1,
    prescriptionRequired: is_prescription_required == '1',
    isMedicine: getIsMedicine(type_id?.toLowerCase()) || 0,
    thumbnail: thumbnail || image,
    maxOrderQty: MaxOrderQty,
    productType: type_id,
    isInStock: is_in_stock == 1,
    unavailableOnline: sell_online == 0,
    url_key,
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
  itemsInCart?: string,
  onComplete?: () => void,
  pharmacyCircleAttributes?: PharmacyCircleEvent,
  onAddedSuccessfully?: () => void
) => {
  const outOfStockMsg = 'Sorry, this item is out of stock in your area.';

  const navigate = () => {
    navigation.push(AppRoutes.ProductDetailPage, {
      sku: cartItem.id,
      urlKey: cartItem?.url_key,
      deliveryError: outOfStockMsg,
    });
  };

  const addToCart = () => {
    addCartItem!(cartItem);
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
      otherInfo?.categoryName,
      pharmacyCircleAttributes!
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
      g(otherInfo, 'section'),
      '',
      pharmacyCircleAttributes!
    );
    postAppsFlyerAddToCartEvent(
      {
        sku: cartItem.id,
        name: cartItem.name,
        price: cartItem.price,
        special_price: cartItem.specialPrice,
        category_id: g(otherInfo, 'categoryId'),
      },
      g(currentPatient, 'id')!,
      pharmacyCircleAttributes!
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
        onAddedSuccessfully?.();
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
          'Cart Items': JSON.stringify(itemsInCart) || '',
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

const onPressAllow = () => {
  const eventAttributes: WebEngageEvents[WebEngageEventName.USER_ALLOWED_PERMISSION] = {
    screen: 'Appointment Screen',
  };
  postWebEngageEvent(WebEngageEventName.USER_ALLOWED_PERMISSION, eventAttributes);
};

const onPressDeny = () => {
  const eventAttributes: WebEngageEvents[WebEngageEventName.USER_DENIED_PERMISSION] = {
    screen: 'Appointment Screen',
  };
  postWebEngageEvent(WebEngageEventName.USER_DENIED_PERMISSION, eventAttributes);
};

export const overlyCallPermissions = (
  patientName: string,
  doctorName: string,
  showAphAlert: any,
  hideAphAlert: any,
  isDissmiss: boolean,
  callback?: () => void | null,
  screenName?: ConsultPermissionScreenName
) => {
  if (Platform.OS === 'android') {
    const showPermissionPopUp = (description: string, onPressCallback: () => void) => {
      showAphAlert!({
        unDismissable: isDissmiss,
        title: `Hi ${patientName} :)`,
        description: description,
        ctaContainerStyle: { justifyContent: 'flex-end' },
        CTAs: [
          {
            text: 'NOT NOW',
            type: 'orange-link',
            onPress: () => {
              hideAphAlert!();
              onPressDeny();
              callback?.();
            },
          },
          {
            text: 'ALLOW',
            type: 'orange-link',
            onPress: () => {
              hideAphAlert!();
              onPressAllow();
              callback?.();
              onPressCallback();
            },
          },
        ],
      });
    };
    Permissions.checkMultiple(['camera', 'microphone'])
      .then((response) => {
        const { camera, microphone } = response;
        const cameraNo = camera === 'denied' || camera === 'undetermined';
        const microphoneNo = microphone === 'denied' || microphone === 'undetermined';
        const cameraYes = camera === 'authorized';
        const microphoneYes = microphone === 'authorized';
        // Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
        if (cameraNo && microphoneNo) {
          // ----------- dont delete this commented  overlay permission block incase we decide to use again
          // RNAppSignatureHelper.isRequestOverlayPermissionGranted((status: any) => {
          //   if (status) {
          //     showPermissionPopUp(
          //       string.callRelatedPermissions.allPermissions.replace('{0}', doctorName),
          //       () => callPermissions(() => RNAppSignatureHelper.requestOverlayPermission())
          //     );
          //   }
          // });

          showPermissionPopUp(
            string.callRelatedPermissions.camAndMPPermission.replace('{0}', doctorName),
            () => callPermissions(() => {}, screenName)
          );
        } else if (cameraYes && microphoneNo) {
          showPermissionPopUp(
            string.callRelatedPermissions.onlyMPPermission.replace('{0}', doctorName),
            () => callPermissions(() => {}, screenName)
          );
        } else if (cameraNo && microphoneYes) {
          showPermissionPopUp(
            string.callRelatedPermissions.onlyCameraPermission.replace('{0}', doctorName),
            () => callPermissions(() => {}, screenName)
          );
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
                text: 'NOT NOW',
                type: 'orange-link',
                onPress: () => {
                  hideAphAlert!();
                  onPressDeny();
                  callback?.();
                },
              },
              {
                text: 'ALLOW',
                type: 'orange-link',
                onPress: () => {
                  hideAphAlert!();
                  onPressAllow();
                  callback?.();
                  callPermissions(() => {}, screenName);
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

export const getCareCashback = (price: number, type_id: string | null | undefined) => {
  const { circleCashback } = useShoppingCart();
  let typeId = !!type_id ? type_id.toUpperCase() : '';
  let cashback = 0;
  if (!!circleCashback && !!circleCashback[typeId]) {
    cashback = price * (circleCashback[typeId] / 100);
  }
  return cashback;
};

export const readableParam = (param: string) => {
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

export const monthDiff = (dateFrom: Date, dateTo: Date) => {
  return (
    dateTo.getMonth() - dateFrom.getMonth() + 12 * (dateTo.getFullYear() - dateFrom.getFullYear())
  );
};

export const setCircleMembershipType = (fromDate: Date, toDate: Date) => {
  const diffInMonth = monthDiff(new Date(fromDate!), new Date(toDate!));
  let circleMembershipType;
  if (diffInMonth < 6) {
    circleMembershipType = 'Monthly';
  } else if (diffInMonth == 6) {
    circleMembershipType = 'Half Yearly';
  } else {
    circleMembershipType = 'Annual';
  }
  return circleMembershipType;
};

export const filterHtmlContent = (content: string = '') => {
  return content
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;rnt/g, '>')
    .replace(/&gt;rn/g, '>')
    .replace(/&gt;r/g, '>')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, '</>')
    .replace(/\.t/g, '.')
    .replace(/<\/>/gi, '');
};
export const isProductInStock = (product: MedicineProduct) => {
  const { dc_availability, is_in_contract } = product;
  if (dc_availability?.toLowerCase() === 'no' && is_in_contract?.toLowerCase() === 'no') {
    return false;
  } else {
    return true;
  }
};

export const takeToHomePage = (props: any) => {
  props.navigation.dispatch(
    StackActions.reset({
      index: 0,
      key: null,
      actions: [
        NavigationActions.navigate({
          routeName: AppRoutes.ConsultRoom,
        }),
      ],
    })
  );
};

export const navigateToHome = (
  navigation: NavigationScreenProp<NavigationRoute<object>, object>,
  params?: any,
  forceRedirect?: boolean
) => {
  if (forceRedirect) {
    goToConsultRoom(navigation, params);
  } else {
    const navigate = navigation.popToTop();
    if (!navigate) {
      goToConsultRoom(navigation, params);
    }
  }
};

const goToConsultRoom = (
  navigation: NavigationScreenProp<NavigationRoute<object>, object>,
  params?: any
) => {
  navigation.dispatch(
    StackActions.reset({
      index: 0,
      key: null,
      actions: [
        NavigationActions.navigate({
          routeName: AppRoutes.ConsultRoom,
          params,
        }),
      ],
    })
  );
};

export const navigateToScreenWithEmptyStack = (
  navigation: NavigationScreenProp<NavigationRoute<object>, object>,
  screenName: string,
  params?: any
) => {
  const navigate = navigation.popToTop({ immediate: true });
  if (navigate) {
    setTimeout(() => {
      navigation.navigate(screenName, params);
    }, 0);
  } else {
    navigation.dispatch(
      StackActions.reset({
        index: 0,
        key: null,
        actions: [
          NavigationActions.navigate({
            routeName: screenName,
            params,
          }),
        ],
      })
    );
  }
};

export const apiCallEnums = {
  circleSavings: 'GetCircleSavingsOfUserByMobile',
  getAllBanners: 'GetAllGroupBannersOfUser',
  getUserSubscriptions: 'GetSubscriptionsOfUserByStatus',
  getUserSubscriptionsV2: 'GetAllUserSubscriptionsWithPlanBenefitsV2',
  oneApollo: 'getOneApolloUser',
  pharmacyUserType: 'getUserProfileType',
  getPlans: 'GetPlanDetailsByPlanId',
  plansCashback: 'GetCashbackDetailsOfPlanById',
  patientAppointments: 'getPatientPersonalizedAppointments',
  patientAppointmentsCount: 'getPatientFutureAppointmentCount',
};

export const isSmallDevice = width < 370;

//customText needs to be shown for itemId = 8
export const getTestOrderStatusText = (status: string, customText?: boolean) => {
  let statusString = '';
  switch (status) {
    case DIAGNOSTIC_ORDER_STATUS.ORDER_CANCELLED:
    case 'ORDER_CANCELLED_AFTER_REGISTRATION':
    case DIAGNOSTIC_ORDER_STATUS.ORDER_CANCELLED_REQUEST:
      statusString = 'Order cancelled';
      break;
    case DIAGNOSTIC_ORDER_STATUS.ORDER_FAILED:
      statusString = 'Order failed';
      break;
    case DIAGNOSTIC_ORDER_STATUS.ORDER_INITIATED:
      statusString = 'Order initiated';
      break;
    case DIAGNOSTIC_ORDER_STATUS.PICKUP_REQUESTED:
      statusString = 'Order confirmed';
      break;
    case DIAGNOSTIC_ORDER_STATUS.PICKUP_CONFIRMED:
    case DIAGNOSTIC_ORDER_STATUS.PHLEBO_CHECK_IN:
      statusString = 'Phlebo is on the way';
      break;
    case DIAGNOSTIC_ORDER_STATUS.PHLEBO_COMPLETED:
      statusString = 'Sample collected';
      break;
    case DIAGNOSTIC_ORDER_STATUS.ORDER_RESCHEDULED:
    case DIAGNOSTIC_ORDER_STATUS.ORDER_RESCHEDULED_REQUEST:
      statusString = 'Order rescheduled';
      break;
    //first status has been added
    //last two status => report awaited (need not show in ui, so showing previous)
    case DIAGNOSTIC_ORDER_STATUS.SAMPLE_SUBMITTED:
    case DIAGNOSTIC_ORDER_STATUS.SAMPLE_COLLECTED:
    case DIAGNOSTIC_ORDER_STATUS.SAMPLE_COLLECTED_IN_LAB:
    case DIAGNOSTIC_ORDER_STATUS.SAMPLE_RECEIVED_IN_LAB:
    case DIAGNOSTIC_ORDER_STATUS.SAMPLE_TESTED:
      statusString = 'Sample submitted';
      break;
    case DIAGNOSTIC_ORDER_STATUS.SAMPLE_NOT_COLLECTED_IN_LAB:
      statusString = !!customText ? '2nd Sample pending' : 'Sample submitted';
      break;
    case DIAGNOSTIC_ORDER_STATUS.REPORT_GENERATED:
      statusString = 'Report generated';
      break;
    case DIAGNOSTIC_ORDER_STATUS.SAMPLE_REJECTED_IN_LAB:
      statusString = 'Sample rejected';
      break;
    case DIAGNOSTIC_ORDER_STATUS.ORDER_COMPLETED:
      statusString = 'Order completed';
      break;
    case DIAGNOSTIC_ORDER_STATUS.PAYMENT_PENDING:
      statusString = 'Payment pending';
      break;
    case DIAGNOSTIC_ORDER_STATUS.PAYMENT_FAILED:
      statusString = 'Payment failed';
      break;
    case DIAGNOSTIC_ORDER_STATUS.PAYMENT_SUCCESSFUL:
      statusString = 'Payment successful';
      break;
    case REFUND_STATUSES.SUCCESS:
      statusString = 'Refund proccessed';
      break;
    case REFUND_STATUSES.PENDING:
    case REFUND_STATUSES.FAILURE:
    case REFUND_STATUSES.REFUND_REQUEST_NOT_SENT:
    case REFUND_STATUSES.MANUAL_REVIEW:
      statusString = 'Refund initiated';
      break;
    case DIAGNOSTIC_ORDER_STATUS.PARTIAL_ORDER_COMPLETED:
      statusString = 'Partial Order Completed';
      break;
    default:
      statusString = status || '';
      statusString?.replace(/[_]/g, ' ');
  }
  return statusString;
};

export const getShipmentPrice = (shipmentItems: any, cartItems: any) => {
  let total = 0;
  if (shipmentItems?.length) {
    shipmentItems?.forEach((order: any) => {
      let sku = order?.sku;
      cartItems?.map((item: any) => {
        if (sku.includes(item?.id)) {
          const price = item?.price * item?.quantity;
          total = total + Number(Number(price).toFixed(2));
        }
      });
    });
  }
  return total;
};

export const paymentModeVersionCheck = (minSupportedVersion: string) => {
  const { iOS_Version, Android_Version } = AppConfig.Configuration;
  const isIOS = Platform.OS === 'ios';
  const appVersion = coerce(isIOS ? iOS_Version : Android_Version)?.version;
  const versionSupports = !(
    appVersion &&
    minSupportedVersion &&
    isLessThan(appVersion, minSupportedVersion)
  );
  return versionSupports;
};

const setCouponFreeProducts = (
  products: any,
  setCouponProducts: ((items: CouponProducts[]) => void) | null,
  cartItems: ShoppingCartItem[]
) => {
  const freeProducts = products.filter((product) => {
    return product.couponFree === 1;
  });
  freeProducts.forEach((item, index) => {
    const filteredProduct = cartItems.filter((product) => {
      return product.id === item.sku;
    });
    if (filteredProduct.length) {
      item.quantity = filteredProduct[0].quantity;
    }
  });
  setCouponProducts!(freeProducts);
};

export const validateCoupon = async (
  coupon: string,
  message: string | undefined,
  pharmacyPincode: any,
  mobileNumber: string,
  setCoupon: ((coupon: PharmaCoupon | null) => void) | null,
  cartTotal: number,
  productDiscount: number,
  cartItems: ShoppingCartItem[],
  setCouponProducts: ((items: CouponProducts[]) => void) | null,
  packageId: string[]
) => {
  CommonLogEvent(AppRoutes.ApplyCouponScene, 'Apply coupon');
  const data = {
    mobile: mobileNumber,
    billAmount: (cartTotal - productDiscount).toFixed(2),
    coupon: coupon,
    pinCode: pharmacyPincode,
    products: cartItems.map((item) => ({
      sku: item.id,
      categoryId: item.productType,
      mrp: item.price,
      quantity: item.quantity,
      specialPrice: item.specialPrice !== undefined ? item.specialPrice : item.price,
    })),
    packageIds: packageId,
  };
  return new Promise(async (res, rej) => {
    try {
      const response = await validateConsultCoupon(data);
      if (response.data.errorCode == 0) {
        if (response.data.response.valid) {
          setCoupon!({ ...response?.data?.response, message: message ? message : '' });
          res('success');
        } else {
          rej(response.data.response.reason);
        }

        // set coupon free products again (in case when price of sku is changed)
        const products = response?.data?.response?.products;
        if (products && products.length) {
          setCouponFreeProducts(products, setCouponProducts, cartItems);
        }
      } else {
        CommonBugFender('validatingPharmaCoupon', response.data.errorMsg);
        rej(response.data.errorMsg);
      }
    } catch (error) {
      CommonBugFender('validatingPharmaCoupon', error);
      rej('Sorry, unable to validate coupon right now.');
    }
  });
};

export const setAsyncPharmaLocation = (address: any) => {
  if (address) {
    const saveAddress = {
      pincode: address?.zipcode || address?.pincode,
      id: address?.id,
      city: address?.city,
      state: address?.state,
    };
    AsyncStorage.setItem('PharmacyLocationPincode', JSON.stringify(saveAddress));
  }
};

export const getPatientNameById = (allCurrentPatients: any, patientId: string) => {
  const patientSelected = allCurrentPatients?.find(
    (patient: { id: string }) => patient?.id === patientId
  );

  return patientSelected ? `${patientSelected?.firstName} ${patientSelected?.lastName}` : '';
};

export const requestReadSmsPermission = async () => {
  try {
    const resuts = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
    ]);
    if (resuts) {
      return resuts;
    }
  } catch (error) {
    CommonBugFender('HelperFunction_requestReadSmsPermission_try', error);
  }
};

export const storagePermissionsToDownload = (doRequest?: () => void) => {
  permissionHandler(
    'storage',
    'Enable storage from settings for downloading the test report',
    () => {
      doRequest && doRequest();
    }
  );
};

export async function downloadDiagnosticReport(
  setLoading: UIElementsContextProps['setLoading'],
  pdfUrl: string,
  appointmentDate: string,
  patientName: string,
  showToast: boolean,
  downloadFileName?: string
) {
  setLoading?.(true);
  let result = Platform.OS === 'android' && (await requestReadSmsPermission());
  try {
    if (
      (result &&
        Platform.OS == 'android' &&
        result?.[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        result?.[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] ===
          PermissionsAndroid.RESULTS.GRANTED) ||
      Platform.OS == 'ios'
    ) {
      const dirs = RNFetchBlob.fs.dirs;
      const reportName = !!downloadFileName
        ? downloadFileName
        : `Apollo247_${appointmentDate}_${patientName}.pdf`;
      const downloadPath =
        Platform.OS === 'ios'
          ? (dirs.DocumentDir || dirs.MainBundleDir) + '/' + reportName
          : dirs.DownloadDir + '/' + reportName;

      let msg = 'File is downloading..';
      if (showToast && Platform.OS === 'android') {
        ToastAndroid.show(msg, ToastAndroid.SHORT);
      }
      RNFetchBlob.config({
        fileCache: true,
        path: downloadPath,
        addAndroidDownloads: {
          title: reportName,
          useDownloadManager: true,
          notification: true,
          path: downloadPath,
          mime: mimeType(downloadPath),
          description: 'File downloaded by download manager.',
        },
      })
        .fetch('GET', pdfUrl, {})
        .then((res) => {
          setLoading?.(false);
          Platform.OS === 'ios'
            ? RNFetchBlob.ios.previewDocument(res.path())
            : RNFetchBlob.android.actionViewIntent(res.path(), mimeType(res.path()));
        })
        .catch((err) => {
          setLoading?.(false);
          CommonBugFender('TestOrderDetails_ViewReport', err);
          handleGraphQlError(err);
          throw new Error('Something went wrong');
        });
    } else {
      if (
        result &&
        Platform.OS == 'android' &&
        result?.[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE] !==
          PermissionsAndroid.RESULTS.DENIED &&
        result?.[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] !==
          PermissionsAndroid.RESULTS.DENIED
      ) {
        storagePermissionsToDownload(() => {
          downloadDiagnosticReport(setLoading, pdfUrl, appointmentDate, patientName, true);
        });
      }
    }
  } catch (error) {
    setLoading?.(false);
    CommonBugFender('YourOrderTests_downloadLabTest', error);
    throw new Error('Something went wrong');
  }
}

export const persistHealthCredits = (healthCredit: number) => {
  var healthCreditObj = {
    healthCredit: healthCredit,
    age: new Date().getTime(),
  };
  AsyncStorage.setItem(HEALTH_CREDITS, JSON.stringify(healthCreditObj));
};

export const getHealthCredits = async () => {
  try {
    var healthCreditObj: any = await AsyncStorage.getItem(HEALTH_CREDITS);

    if (healthCreditObj != null && healthCreditObj != '') {
      var healthCredit = JSON.parse?.(healthCreditObj);

      if (healthCredit !== null) {
        var age = healthCredit.age;
        var ageDate = moment(age);
        var nowDate = moment(new Date());
        var duration = moment.duration(nowDate.diff(ageDate)).asMinutes();

        if (duration < 0 || duration > AppConfig.Configuration.Health_Credit_Expiration_Time) {
          return null; //Expired
        } else {
          return healthCredit;
        }
      } else {
        return null;
      }
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
};

export const getPackageIds = (activeUserSubscriptions: any) => {
  let packageIds: string[] = [];
  activeUserSubscriptions &&
    Object.keys(activeUserSubscriptions)?.forEach((subscription: string) => {
      activeUserSubscriptions?.[subscription]?.forEach((item) => {
        if (item?.status?.toLowerCase() === 'active')
          packageIds.push(`${subscription?.toUpperCase()}:${item?.plan_id}`);
      });
    });
  return packageIds;
};

export const isSatisfyingEmailRegex = (value: string) =>
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
    value
  );

export const getDiagnosticCityLevelPaymentOptions = (cityId: string) => {
  let remoteData = AppConfig.Configuration.DIAGNOSTICS_CITY_LEVEL_PAYMENT_OPTION;
  const getConfigPaymentValue = remoteData?.find((item) => Number(item?.cityId) === Number(cityId));
  const paymentValues = {
    prepaid: !!getConfigPaymentValue
      ? getConfigPaymentValue?.prepaid
      : AppConfig.Configuration.Enable_Diagnostics_Prepaid,
    cod: !!getConfigPaymentValue
      ? getConfigPaymentValue.cod
      : AppConfig.Configuration.Enable_Diagnostics_COD,
  };
  return paymentValues;
};

export const downloadDocument = (
  fileUrl: string = '',
  type: string = 'application/pdf',
  orderId: number
) => {
  let filePath: string | null = null;
  let file_url_length = fileUrl.length;
  let viewReportOrderId = orderId;
  const configOptions = { fileCache: true };
  RNFetchBlob.config(configOptions)
    .fetch('GET', fileUrl)
    .then((resp) => {
      filePath = resp.path();
      return resp.readFile('base64');
    })
    .then(async (base64Data) => {
      base64Data = `data:${type};base64,` + base64Data;
      await Share.open({ title: '', url: base64Data });
      // remove the image or pdf from device's storage
      // await RNFS.unlink(filePath);
    })
    .catch((err) => {
      console.log('err', err);
    });

  return viewReportOrderId;
};
export const getIsMedicine = (typeId: string) => {
  const medicineType = {
    fmcg: '0',
    pharma: '1',
    pl: '2',
  };
  return medicineType[typeId] || '0';
};
