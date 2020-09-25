import { format } from 'date-fns';
export const getDate = (date: string) => {
  let formattedDate = format(date, 'DD MMM YYYY, h:mm A');
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
