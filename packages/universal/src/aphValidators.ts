import isMobilePhone from 'validator/lib/isMobilePhone';
import isEmail from 'validator/lib/isEmail';

export const isEmailValid = isEmail;

export const isMobileNumberValid = (number: string) => isMobilePhone(number, 'en-IN');

export const isNameValid = (name: string) => {
  return /^[a-zA-Z ']*$/.test(name.trim()) && name.trim().length > 1;
};

export const aphClientDateFormat = /^([0-9]{2})\/([0-9]{2})\/([0-9]{4})$/;

export const isDobValid = (ddmmyyyy: string) => {
  const toIsoString = (ddmmyyyy: string) => {
    const dateParts = ddmmyyyy.split('/');
    const dd = dateParts[0];
    const mm = dateParts[1];
    const yyyy = dateParts[2];
    return `${yyyy}-${mm}-${dd}`;
  };

  const today = new Date();
  const dob = new Date(toIsoString(ddmmyyyy));
  return today > dob;
};

export const isDateValid = (ddmmyyyy: string) => {
  const isCorrectFormat = aphClientDateFormat.test(ddmmyyyy);
  console.log('DATE INPUT IS: ', ddmmyyyy);
  console.log('IS CORRECT FORMAT? : ', isCorrectFormat);
  if (!isCorrectFormat) return false;

  const dateParts = ddmmyyyy.split('/');
  const dd = dateParts[0];
  const mm = dateParts[1];
  const yyyy = dateParts[2];
  const dateStr = `${yyyy}-${mm}-${dd}`;
  const isValidJsDate = !isNaN(new Date(dateStr).valueOf());
  // https://stackoverflow.com/questions/12756159/regex-and-iso8601-formatted-datetime
  const isValidCalendarDate = /(?:19|20)[0-9]{2}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-9])|(?:(?!02)(?:0[1-9]|1[0-2])-(?:30))|(?:(?:0[13578]|1[02])-31))/.test(
    dateStr
  );
  return isValidJsDate && isValidCalendarDate;
};
