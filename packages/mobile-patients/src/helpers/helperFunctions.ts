import moment from 'moment';

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

  const todayDate = new Date().toDateString().split('T')[0];

  availableSlots.forEach((slot) => {
    const IOSFormat = `${date.toISOString().split('T')[0]}T${slot}:00.000Z`;

    const formatedSlot = moment(new Date(IOSFormat), 'HH:mm:ss.SSSz').format('HH:mm');
    const slotTime = moment(formatedSlot, 'HH:mm');
    if (
      todayDate === date.toDateString().split('T')[0] &&
      todayDate !== new Date(IOSFormat).toDateString().split('T')[0]
    ) {
      console.log('today past');
    } else {
      if (new Date() < new Date(IOSFormat)) {
        if (slotTime.isBetween(nightEndTime, afternoonStartTime)) {
          array[0] = {
            label: 'Morning',
            time: [...array[0].time, formatedSlot],
          };
        } else if (slotTime.isBetween(morningEndTime, eveningStartTime)) {
          array[1] = {
            ...array[1],
            time: [...array[1].time, formatedSlot],
          };
        } else if (slotTime.isBetween(afternoonEndTime, nightStartTime)) {
          array[2] = {
            ...array[2],
            time: [...array[2].time, formatedSlot],
          };
        } else if (
          slotTime.isBetween(eveningEndTime, moment('23:59', 'HH:mm')) ||
          slotTime.isSame(moment('00:00', 'HH:mm')) ||
          slotTime.isBetween(moment('00:00', 'HH:mm'), morningStartTime)
        ) {
          array[3] = {
            ...array[3],
            time: [...array[3].time, formatedSlot],
          };
        }
      }
    }
  });
  return array;
};

export const timeTo12HrFormat = (time: string) => {
  const time_array = time.split(':');
  let ampm = 'am';
  if (Number(time_array[0]) >= 12) {
    ampm = 'pm';
  }
  if (Number(time_array[0]) > 12) {
    time_array[0] = (Number(time_array[0]) - 12).toString();
  }
  return time_array[0].replace(/^00/, '12').replace(/^0/, '') + ':' + time_array[1] + ' ' + ampm;
};
