export const getDate = (date: string) => {
  const toDate = new Date(date);
  const formattedDate = toDate.toDateString() + '  ' + toDate.toLocaleTimeString();
  return formattedDate;
};
