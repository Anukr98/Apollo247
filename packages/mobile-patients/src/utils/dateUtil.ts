import { format } from 'date-fns';
export const getDate = (date: string) => {
  let formattedDate = format(date, 'DD MMM YYYY, h:mm a');
  return formattedDate;
};

export const findDateType = (date: string) => {
  const currentDate = new Date();
};
