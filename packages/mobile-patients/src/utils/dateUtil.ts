import { format } from 'date-fns';
export const getDate = (date: string) => {
  let formattedDate = format(date, 'DD MMM YYYY, h:mm a');
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
