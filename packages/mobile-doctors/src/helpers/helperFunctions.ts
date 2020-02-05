import moment from 'moment';
import NetInfo from '@react-native-community/netinfo';
import { MEDICINE_UNIT } from '@aph/mobile-doctors/src/graphql/types/globalTypes';

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
    //console.log(connectionInfo, 'connectionInfo');
    return connectionInfo.type !== 'none';
  });
  return status;
};

export const isValidSearch = (value: string) => /^([^ ]+[ ]{0,1}[^ ]*)*$/.test(value);

export const nameFormater = (name: string) => {
  const val = name.replace(/_/g, ' ');
  return val[0].toUpperCase() + val.slice(1).toLowerCase();
};

export const medUsageType = (med: MEDICINE_UNIT) => {
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
  let number = value.indexOf('-') === value.length - 1 ? value : parseInt(value);
  return number || 0;
};

export const formatFloating = (value: string) => {
  let number =
    value.indexOf('.') === value.length - 1 ||
    value.indexOf('0', value.length - 1) === value.length - 1 ||
    value.indexOf('-') === value.length - 1
      ? value
      : parseFloat(value);
  return number || 0;
};
