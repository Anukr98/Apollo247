export const getDateFormat = (_date: string /*"2019-08-08T20:30:00.000Z"*/) => {
  const dateTime = _date.split('T');
  const date = dateTime[0].split('-');
  const time = dateTime[1].substring(0, 4).split(':');
  return new Date(
    parseInt(date[0]),
    parseInt(date[1]) - 1,
    parseInt(date[2]),
    parseInt(time[0]),
    parseInt(time[1])
  );
};
