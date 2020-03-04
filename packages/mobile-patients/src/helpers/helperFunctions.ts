import { LocationData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { savePatientAddress_savePatientAddress_patientAddress } from '@aph/mobile-patients/src/graphql/types/savePatientAddress';
import {
  getPackageData,
  getPlaceInfoByLatLng,
  GooglePlacesType,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import {
  MEDICINE_ORDER_STATUS,
  Relation,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import Geolocation from '@react-native-community/geolocation';
import NetInfo from '@react-native-community/netinfo';
import moment from 'moment';
import AsyncStorage from '@react-native-community/async-storage';
import { Alert, Dimensions, Platform } from 'react-native';
import RNAndroidLocationEnabler from 'react-native-android-location-enabler';
import Geocoder from 'react-native-geocoding';
import Permissions from 'react-native-permissions';
import { DiagnosticsCartItem } from '../components/DiagnosticsCartProvider';
import { getCaseSheet_getCaseSheet_caseSheetDetails_diagnosticPrescription } from '../graphql/types/getCaseSheet';
import { apiRoutes } from './apiRoutes';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { getDiagnosticSlots_getDiagnosticSlots_diagnosticSlot_slotInfo } from '@aph/mobile-patients/src/graphql/types/getDiagnosticSlots';
import ApolloClient from 'apollo-client';
import {
  searchDiagnostics,
  searchDiagnosticsVariables,
} from '@aph/mobile-patients/src/graphql/types/searchDiagnostics';
import { SEARCH_DIAGNOSTICS } from '@aph/mobile-patients/src/graphql/profiles';

const googleApiKey = AppConfig.Configuration.GOOGLE_API_KEY;

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

const isDebugOn = AppConfig.Configuration.LOG_ENVIRONMENT == 'debug';

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

export const formatAddress = (address: savePatientAddress_savePatientAddress_patientAddress) => {
  const addrLine1 = [address.addressLine1, address.addressLine2].filter((v) => v).join(', ');
  // to resolve state value getting twice
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
    case MEDICINE_ORDER_STATUS.ITEMS_RETURNED:
      statusString = 'Items Returned';
      break;
    case MEDICINE_ORDER_STATUS.ORDER_CONFIRMED:
      statusString = 'Order Confirmed';
      break;
    case MEDICINE_ORDER_STATUS.ORDER_FAILED:
      statusString = 'Order Failed';
      break;
    case MEDICINE_ORDER_STATUS.ORDER_PLACED:
      statusString = 'Order Placed';
      break;
    case MEDICINE_ORDER_STATUS.ORDER_VERIFIED:
      statusString = 'Order Verified';
      break;
    case MEDICINE_ORDER_STATUS.OUT_FOR_DELIVERY:
      statusString = 'Order Shipped';
      break;
    case MEDICINE_ORDER_STATUS.PICKEDUP:
      statusString = 'Order Picked Up';
      break;
    case MEDICINE_ORDER_STATUS.PRESCRIPTION_CART_READY:
      statusString = 'Prescription Cart Ready';
      break;
    case MEDICINE_ORDER_STATUS.PRESCRIPTION_UPLOADED:
      statusString = 'Prescription Uploaded';
      break;
    case MEDICINE_ORDER_STATUS.QUOTE:
      statusString = 'Quote';
      break;
    case MEDICINE_ORDER_STATUS.RETURN_ACCEPTED:
      statusString = 'Return Accepted';
      break;
    case MEDICINE_ORDER_STATUS.RETURN_INITIATED:
      statusString = 'Return Requested';
      break;
    case MEDICINE_ORDER_STATUS.PAYMENT_SUCCESS:
      statusString = 'Payment Success';
      break;
    case MEDICINE_ORDER_STATUS.ORDER_INITIATED:
      statusString = 'Order Initiated';
      break;
    case MEDICINE_ORDER_STATUS.PAYMENT_FAILED:
      statusString = 'Payment Failed';
      break;
    case MEDICINE_ORDER_STATUS.READY_AT_STORE:
      statusString = 'Ready At Store';
      break;
    case 'TO_BE_DELIVERED' as any:
      statusString = 'Expected Order Delivery';
      break;
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
      return connectionInfo.isConnected && connectionInfo.isInternetReachable;
    })
    .catch((e) => {
      CommonBugFender('helperFunctions_getNetStatus', e);
    });
  return status;
};

export const nextAvailability = (nextSlot: string) => {
  const today: Date = new Date();
  const date2: Date = new Date(nextSlot);
  const secs = (date2 as any) - (today as any);
  const mins = Math.ceil(secs / (60 * 1000));
  let hours: number = 0;
  if (mins > 0 && mins < 60) {
    return `available in ${mins} min${mins > 1 ? 's' : ''}`;
  } else if (mins >= 60 && mins < 1380) {
    hours = Math.ceil(mins / 60);
    return `available in ${hours} hour${hours > 1 ? 's' : ''}`;
  } else if (mins >= 1380) {
    const days = Math.ceil(mins / (24 * 60));
    return `available in ${days} day${days > 1 ? 's' : ''}`;
  }
};

export const isEmptyObject = (object: Object) => {
  return Object.keys(object).length === 0;
};

const findAddrComponents = (
  proptoFind: GooglePlacesType,
  addrComponents: {
    long_name: string;
    short_name: string;
    types: GooglePlacesType[];
  }[]
) => {
  return (addrComponents.find((item) => item.types.indexOf(proptoFind) > -1) || { long_name: '' })
    .long_name;
};

const getlocationData = (
  resolve: (value?: LocationData | PromiseLike<LocationData> | undefined) => void,
  reject: (reason?: any) => void
) => {
  Geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      getPlaceInfoByLatLng(latitude, longitude)
        .then((response) => {
          const addrComponents =
            g(response, 'data', 'results', '0' as any, 'address_components') || [];
          if (addrComponents.length == 0) {
            console.log('er78h98r');

            reject('Unable to get location.');
          } else {
            const area = [
              findAddrComponents('route', addrComponents),
              findAddrComponents('sublocality_level_2', addrComponents),
              findAddrComponents('sublocality_level_1', addrComponents),
            ].filter((i) => i);
            resolve({
              displayName:
                (area || []).pop() ||
                findAddrComponents('locality', addrComponents) ||
                findAddrComponents('administrative_area_level_2', addrComponents),
              latitude,
              longitude,
              area: area.join(', '),
              city:
                findAddrComponents('locality', addrComponents) ||
                findAddrComponents('administrative_area_level_2', addrComponents),
              state: findAddrComponents('administrative_area_level_1', addrComponents),
              country: findAddrComponents('country', addrComponents),
              pincode: findAddrComponents('postal_code', addrComponents),
              lastUpdated: new Date().getTime(),
            });
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
          if (response === 'restricted' && Platform.OS === 'ios') {
            Alert.alert('Location', 'Enable location access form settings', [
              {
                text: 'Cancle',
                onPress: () => {
                  AsyncStorage.setItem('settingsCalled', 'false');
                },
              },
              {
                text: 'Ok',
                onPress: () => {
                  AsyncStorage.setItem('settingsCalled', 'true');
                  Permissions.openSettings();
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

export const getUserCurrentPosition = async () => {
  const item = await AsyncStorage.getItem('location');
  const location = item ? JSON.parse(item) : null;

  if (location) {
    console.log(location, 'location');

    return {
      latlong: location.latlong,
      name: location.name.toUpperCase(),
    };
  } else {
    return new Promise(async (resolve, reject) => {
      Permissions.request('location')
        .then((response) => {
          if (response === 'authorized') {
            Geolocation.getCurrentPosition(
              async (position) => {
                console.log(position, 'position');

                (Geocoder as any).init(googleApiKey);
                const jsonData = await (Geocoder as any).from(
                  position.coords.latitude,
                  position.coords.longitude
                );
                if (jsonData) {
                  const result = jsonData.results[0];
                  const addressComponent = result.address_components[1].long_name || '';
                  const pincode = result.address_components.slice(-1)[0].long_name || '';
                  console.log(jsonData, addressComponent, 'addressComponent', pincode);
                  resolve({
                    latlong: result.geometry.location,
                    name: addressComponent,
                    zipcode: pincode,
                  });
                }
                reject(null);
              },
              (error) => console.log(JSON.stringify(error)),
              { enableHighAccuracy: false, timeout: 20000 }
            );
          }
        })
        .catch((error) => {
          CommonBugFender('helperFunctions_getUserCurrentPosition', error);
          console.log(error, 'error permission');
        });
    });
  }
};

const { height } = Dimensions.get('window');

export const isIphone5s = () => height === 568;
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

export const getBuildEnvironment = () => {
  switch (apiRoutes.graphql()) {
    case 'https://aph.dev.api.popcornapps.com//graphql':
      return 'DEV';
    case 'https://aph.staging.api.popcornapps.com//graphql':
      return 'QA';
    case 'https://aph.uat.api.popcornapps.com//graphql':
      return 'UAT';
    case 'https://aph.vapt.api.popcornapps.com//graphql':
      return 'VAPT';
    case 'https://api.apollo247.com//graphql':
      return 'PROD';
    case 'https://asapi.apollo247.com//graphql':
      return 'PRF';
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
