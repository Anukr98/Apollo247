import moment from 'moment';
import NetInfo from '@react-native-community/netinfo';
import { MEDICINE_UNIT } from '@aph/mobile-doctors/src/graphql/types/globalTypes';
import { apiRoutes } from '@aph/mobile-doctors/src/helpers/apiRoutes';
import Permissions, { PERMISSIONS, Permission } from 'react-native-permissions';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';

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

export const timeTo12HrFormat = (time: string) => {
  return moment(time).format('h:mm a');
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

export const getNetStatus = async () => {
  const status = await NetInfo.fetch().then((connectionInfo) => {
    return connectionInfo.type !== 'none';
  });
  return status;
};

export const isValidSearch = (value: string) => /^([^ ]+[ ]{0,1}[^ ]*)*$/.test(value);

export const nameFormater = (name: string) => {
  const val = name.replace(/_/g, ' ');
  return val[0].toUpperCase() + val.slice(1).toLowerCase();
};

export const medUsageType = (med: MEDICINE_UNIT | null) => {
  switch (med) {
    case MEDICINE_UNIT.POWDER:
    case MEDICINE_UNIT.CREAM:
    case MEDICINE_UNIT.SOAP:
    case MEDICINE_UNIT.GEL:
    case MEDICINE_UNIT.LOTION:
    case MEDICINE_UNIT.SPRAY:
    case MEDICINE_UNIT.SOLUTION:
    case MEDICINE_UNIT.OINTMENT:
      return 'Apply';
    case MEDICINE_UNIT.SYRUP:
    case MEDICINE_UNIT.DROPS:
    case MEDICINE_UNIT.CAPSULE:
    case MEDICINE_UNIT.INJECTION:
    case MEDICINE_UNIT.TABLET:
    case MEDICINE_UNIT.BOTTLE:
    case MEDICINE_UNIT.SUSPENSION:
    case MEDICINE_UNIT.ROTACAPS:
    case MEDICINE_UNIT.SACHET:
    case MEDICINE_UNIT.ML:
      return 'Take';
    default:
      return 'Apply';
  }
};

export const formatInt = (value: string) => {
  const number = value.indexOf('-') === value.length - 1 ? value : parseInt(value, 10);
  return number || 0;
};

export const messageCodes = {
  videoCallMsg: '^^callme`video^^',
  audioCallMsg: '^^callme`audio^^',
  acceptedCallMsg: '^^callme`accept^^',
  startConsultMsg: '^^#startconsult',
  stopConsultMsg: '^^#stopconsult',
  typingMsg: '^^#typing',
  endCallMsg: '^^callme`stop^^',
  covertVideoMsg: '^^convert`video^^',
  covertAudioMsg: '^^convert`audio^^',
  rescheduleconsult: '^^#rescheduleconsult',
  followupconsult: '^^#followupconsult',
  consultPatientStartedMsg: '^^#PatientConsultStarted',
  firstMessage: '^^#firstMessage',
  secondMessage: '^^#secondMessage',
  languageQue: '^^#languageQue',
  jdThankyou: '^^#jdThankyou',
  imageconsult: '^^#DocumentUpload',
  stopConsultJr: '^^#stopconsultJr',
  startConsultjr: '^^#startconsultJr',
  callAbandonment: '^^#callAbandonment',
  appointmentComplete: '^^#appointmentComplete',
  cancelConsultInitiated: '^^#cancelConsultInitiated',
};

export const formatFloating = (value: string) => {
  const number =
    value.indexOf('.') === value.length - 1 ||
    value.indexOf('0', value.length - 1) === value.length - 1 ||
    value.indexOf('-') === value.length - 1
      ? value
      : parseFloat(value);
  return number || 0;
};
export const getDateArray = (start: Date, end: Date) => {
  const arr = [];
  const dt = new Date(start);
  arr.push(new Date(dt));
  while (dt < end) {
    dt.setDate(dt.getDate() + 1);
    arr.push(new Date(dt));
  }
  return arr;
};

export const ConvertTimeToLocal = (time: string /* HH:mm:ss */) => {
  return moment
    .utc(time, 'HH:mm:ss')
    .local()
    .format('HH:mm:ss');
};

export const ConvertDateToWeekDay = (date: Date, format: string = 'dddd') => {
  return moment(date)
    .format(format)
    .toUpperCase();
};

export const ConvertDateTimeToUtc = (date: string /* YYYY-MM-DD */, time: string /* HH:mm:s */) => {
  return moment(date + ConvertTimeToLocal(time), 'YYYY-MM-DDHH:mm:ss').toISOString();
};

export const FormatDateToString = (date: Date, format: string = 'YYYY-MM-DD') => {
  return moment(date).format(format);
};

export const isValidImageUrl = (url: string | undefined | null) => {
  return url && url.match(/\.(jpeg|jpg|gif|png)$/);
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
/*eslint-disable */
export function g(obj: any, ...props: string[]) {
  return obj && props.reduce((result, prop) => (result == null ? undefined : result[prop]), obj);
}
/*eslint-enable */

export const permissionHandler = (
  permission: Permission,
  deniedMessage: string,
  doRequest: () => void
) => {
  Permissions.request(permission)
    .then((message) => {
      console.log(message, 'sdhu');

      if (message === 'granted') {
        doRequest();
      } else if (message === 'denied' || message === 'blocked') {
        Alert.alert((permission.split('.').pop() || 'permission').toUpperCase(), deniedMessage, [
          {
            text: 'Cancle',
            onPress: () => {},
          },
          {
            text: 'Ok',
            onPress: () => {
              Permissions.openSettings();
              AsyncStorage.setItem('permissionHandler', 'true');
            },
          },
        ]);
      }
    })
    .catch((e) => console.log(e, 'dsvunacimkl'));
};

export const callPermissions = (doRequest?: () => void) => {
  permissionHandler(
    Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA,
    'Enable camera from settings for calls during consultation.',
    () => {
      permissionHandler(
        Platform.OS === 'ios' ? PERMISSIONS.IOS.MICROPHONE : PERMISSIONS.ANDROID.RECORD_AUDIO,
        'Enable microphone from settings for calls during consultation.',
        () => {
          doRequest && doRequest();
        }
      );
    }
  );
};
