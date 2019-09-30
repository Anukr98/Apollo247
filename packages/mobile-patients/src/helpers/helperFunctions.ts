import { MEDICINE_ORDER_STATUS } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { GraphQLError } from 'graphql';
import moment from 'moment';
import { Alert, NetInfo } from 'react-native';

interface AphConsole {
  error(message?: any, ...optionalParams: any[]): void;
  info(message?: any, ...optionalParams: any[]): void;
  log(message?: any, ...optionalParams: any[]): void;
  warn(message?: any, ...optionalParams: any[]): void;
  trace(message?: any, ...optionalParams: any[]): void;
  debug(message?: any, ...optionalParams: any[]): void;
  table(...data: any[]): void;
}

const isDebugOn = AppConfig.Configuration.LOG_ENVIRONMENT == 'debug';

export const aphConsole: AphConsole = {
  error: (message?: any, ...optionalParams: any[]) => {
    isDebugOn && console.error(message, ...optionalParams);
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
      statusString = 'Out For Delivery';
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
  }
  return statusString;
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

  console.log(availableSlots, 'availableSlots divideSlots');
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
    console.log(
      todayDate,
      'todayDate',
      moment(new Date()).format('YYYY-MM-DD'),
      new Date(IOSFormat).toDateString().split('T')[0]
    );

    if (
      todayDate === moment(date).format('YYYY-MM-DD') && //date.toDateString().split('T')[0] &&
      todayDate !== moment(IOSFormat).format('YYYY-MM-DD') //new Date(IOSFormat).toDateString().split('T')[0])
    ) {
      console.log('today past');
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
  message: string = 'Uh oh! An Unknown Error Occurred.'
) => {
  console.log({ error });

  let formattedError = message;
  if (typeof error == 'string') {
    formattedError = error;
  } else if (typeof error == 'object') {
    try {
      const graphqlErr = (error as GraphQLError).message;
      formattedError = graphqlErr;
    } catch (e) {
      console.log({ e });
    }
  }
  Alert.alert('Alert', formattedError);
};

export const timeTo12HrFormat = (time: string) => {
  return moment(time).format('h:mm a');
};

export const timeDiffFromNow = (toDate: string) => {
  let timeDiff: Number = 0;
  const today: Date = new Date();
  const date2: Date = new Date(toDate);
  if (date2 && today) {
    timeDiff = Math.round(((date2 as any) - (today as any)) / 60000);
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
  const status = await NetInfo.getConnectionInfo().then((connectionInfo) => {
    console.log(connectionInfo, 'connectionInfo');
    return connectionInfo.type !== 'none';
  });
  return status;
};
