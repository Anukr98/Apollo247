import { format } from 'date-fns';
export const getDate = (date: string) => {
  let formattedDate = format(date || new Date(), 'DD MMM YYYY, h:mm A');
  return formattedDate;
};

export const findDateType = (date: string) => {
  let currentDate = new Date();
  let nowTimeStamp = currentDate.getTime();
  let dateTimeStamp = format(date, 'x');
  if (nowTimeStamp > Number(dateTimeStamp)) {
    return 'future';
  } else {
    return 'past';
  }
};

export const convertMinsToHrsMins = (min: number) => {
  var hours = min / 60;
  var rhours = Math.floor(hours);
  var minutes = (hours - rhours) * 60;
  var rminutes = Math.round(minutes);
  return (
    rhours +
    ` ${
      rminutes !== 0 && rhours > 1
        ? 'hrs'
        : rhours === 1 && rminutes !== 0
        ? `hr${rhours === 1 ? '' : 's'}`
        : rhours === 1
        ? 'hour'
        : 'hours'
    } ${
      rminutes !== 0
        ? rhours > 0
          ? `${rminutes} min${rminutes === 1 ? '' : 's'}`
          : `${rminutes} ${rminutes === 1 ? 'minute' : 'minutes'}`
        : ''
    }`
  );
};

export const dateFormatter = (dateTime: Date) => {
  let tommorowDate = new Date();
  tommorowDate.setDate(tommorowDate.getDate() + 1);

  if (new Date(dateTime).toLocaleDateString() == new Date().toLocaleDateString()) {
    return `Today, ${format(dateTime, 'h:mm A')}`;
  } else if (new Date(dateTime).toLocaleDateString() == tommorowDate.toLocaleDateString()) {
    return `Tomorrow, ${format(dateTime, 'h:mm A')}`;
  } else {
    return `${format(dateTime, 'DD MMM YYYY, h:mm A')}`;
  }
};

export const dateFormatterDDMM = (dateTime: string, form: string) => {
  let dateF = new Date(dateTime);
    return `${format(dateF, form)}`;
};

/**
 * Function to calculate the time(days) difference between two timeStamps
 * @param T1 (number)
 * @param T2 (number)
 */
export const timeDifferenceInDays = (T1: number, T2: number) => {
  return (T1 - T2) / (1000 * 3600 * 24);
}
