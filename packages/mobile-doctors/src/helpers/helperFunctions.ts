import moment from 'moment';
import NetInfo from '@react-native-community/netinfo';
import {
  MEDICINE_UNIT,
  MEDICINE_FORM_TYPES,
  MEDICINE_TIMINGS,
  MEDICINE_TO_BE_TAKEN,
} from '@aph/mobile-doctors/src/graphql/types/globalTypes';
import Permissions, { PERMISSIONS, Permission } from 'react-native-permissions';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import _ from 'lodash';
import { string } from '@aph/mobile-doctors/src/strings/string';
import { GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription } from '@aph/mobile-doctors/src/graphql/types/GetCaseSheet';
import { GetDoctorFavouriteMedicineList_getDoctorFavouriteMedicineList_medicineList } from '@aph/mobile-doctors/src/graphql/types/GetDoctorFavouriteMedicineList';
import { AppConfig } from '@aph/mobile-doctors/src/helpers/AppConfig';

export const getBuildEnvironment = () => {
  return AppConfig.APP_ENV as string;
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
  const existsIndex = string.smartPrescr.muiltdosages.findIndex((i) => i.single === formatedValue);
  if (existsIndex > -1) {
    formatedValue = string.smartPrescr.muiltdosages[existsIndex].multiple;
  }
  return {
    key: item,
    value: formatedValue,
  };
});

export const medicineDescription = (
  item:
    | GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription
    | GetDoctorFavouriteMedicineList_getDoctorFavouriteMedicineList_medicineList
) => {
  const type = item.medicineFormTypes === MEDICINE_FORM_TYPES.OTHERS ? 'Take' : 'Apply';
  const customDosage = item.medicineCustomDosage
    ? item.medicineCustomDosage.split('-').filter((i) => i !== '')
    : [];
  const medTimingsArray = [
    MEDICINE_TIMINGS.MORNING,
    MEDICINE_TIMINGS.NOON,
    MEDICINE_TIMINGS.EVENING,
    MEDICINE_TIMINGS.NIGHT,
    MEDICINE_TIMINGS.AS_NEEDED,
  ];
  const medicineTimings = medTimingsArray
    .map((i) => {
      if (item.medicineTimings && item.medicineTimings.includes(i)) {
        return i;
      } else {
        return null;
      }
    })
    .filter((i) => i !== null);
  const unit: string =
    (medUnitFormatArray.find((i) => i.key === item.medicineUnit) || {}).value || 'others';
  return `${type + ' '}${
    customDosage.length > 0
      ? `${customDosage.join(' ' + unit + ' - ') + ' ' + unit + ' '}${
          medicineTimings && medicineTimings.length
            ? '(' +
              (medicineTimings.length > 1
                ? medicineTimings
                    .slice(0, -1)
                    .map((i: MEDICINE_TIMINGS | null) => nameFormater(i || '', 'lower'))
                    .join(', ') +
                  ' & ' +
                  nameFormater(medicineTimings[medicineTimings.length - 1] || '', 'lower')
                : medicineTimings
                    .map((i: MEDICINE_TIMINGS | null) => nameFormater(i || '', 'lower'))
                    .join(', ')) +
              ') '
            : ''
        }${
          item.medicineConsumptionDurationInDays
            ? `for ${item.medicineConsumptionDurationInDays} ${
                item.medicineConsumptionDurationUnit
                  ? `${item.medicineConsumptionDurationUnit.slice(0, -1).toLowerCase()}(s) `
                  : ``
              }`
            : ''
        }${
          item.medicineToBeTaken && item.medicineToBeTaken.length
            ? item.medicineToBeTaken
                .map((i: MEDICINE_TO_BE_TAKEN | null) => nameFormater(i || '', 'lower'))
                .join(', ') + '.'
            : ''
        }`
      : `${item.medicineDosage ? item.medicineDosage : ''} ${item.medicineUnit ? unit + ' ' : ''}${
          item.medicineFrequency ? nameFormater(item.medicineFrequency, 'lower') + ' ' : ''
        }${
          item.medicineConsumptionDurationInDays
            ? `for ${item.medicineConsumptionDurationInDays} ${
                item.medicineConsumptionDurationUnit
                  ? `${item.medicineConsumptionDurationUnit.slice(0, -1).toLowerCase()}(s) `
                  : ``
              }`
            : ''
        }${
          item.medicineToBeTaken && item.medicineToBeTaken.length
            ? item.medicineToBeTaken
                .map((i: MEDICINE_TO_BE_TAKEN | null) => nameFormater(i || '', 'lower'))
                .join(', ') + ' '
            : ''
        }${
          medicineTimings && medicineTimings.length
            ? `${
                medicineTimings.includes(MEDICINE_TIMINGS.AS_NEEDED) && medicineTimings.length === 1
                  ? ''
                  : 'in the '
              }` +
              (medicineTimings.length > 1
                ? medicineTimings
                    .slice(0, -1)
                    .map((i: MEDICINE_TIMINGS | null) => nameFormater(i || '', 'lower'))
                    .join(', ') +
                  ' & ' +
                  nameFormater(medicineTimings[medicineTimings.length - 1] || '', 'lower') +
                  ' '
                : medicineTimings
                    .map((i: MEDICINE_TIMINGS | null) => nameFormater(i || '', 'lower'))
                    .join(', ') + ' ')
            : ''
        }`
  }${
    item.routeOfAdministration
      ? `\nTo be taken: ${nameFormater(item.routeOfAdministration, 'title')}`
      : ''
  }${item.medicineInstructions ? '\nInstuctions: ' + item.medicineInstructions : ''}`;
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
export const formatFractionalNumber = (value: string) => {
  return (value.match(/[0-9]+[.]?[0-9]*([\/]){0,1}([0-9]+[.]?[0-9]*)*/) || [''])[0];
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
