import isMobilePhone from 'validator/lib/isMobilePhone';
import isEmail from 'validator/lib/isEmail';

export const isEmailValid = isEmail;

export const isMobileNumberValid = (number: string) => isMobilePhone(number, 'en-IN');

export const isNameValid = (name: string) => {
  return /^[a-zA-Z ']*$/.test(name.trim()) && name.trim().length > 1;
};

export const aphClientDateFormat = /^([0-9]{2})\/([0-9]{2})\/([0-9]{4})$/;

export const toIsoString = (ddmmyyyy: string) => {
  const dateParts = ddmmyyyy.split('/');
  const dd = dateParts[0];
  const mm = dateParts[1];
  const yyyy = dateParts[2];
  return `${yyyy}-${mm}-${dd}`;
};

export const isDobValid = (ddmmyyyy: string) => {
  if (!isDateValid(ddmmyyyy)) return false;
  const isoStr = toIsoString(ddmmyyyy);
  const date = new Date(isoStr);
  const isInPast = new Date() > date;
  return isInPast;
};

export const isDateValid = (ddmmyyyy: string) => {
  const isCorrectFormat = aphClientDateFormat.test(ddmmyyyy);
  if (!isCorrectFormat) return false;
  const isoStr = toIsoString(ddmmyyyy); //
  const date = new Date(isoStr);
  const isValidJsDate = !isNaN(date.valueOf());
  // https://stackoverflow.com/questions/12756159/regex-and-iso8601-formatted-datetime
  const isValidCalendarDate = /(?:19|20)[0-9]{2}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-9])|(?:(?!02)(?:0[1-9]|1[0-2])-(?:30))|(?:(?:0[13578]|1[02])-31))/.test(
    isoStr
  );
  return isValidJsDate && isValidCalendarDate;
};
