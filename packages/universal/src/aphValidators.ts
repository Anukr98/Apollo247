import isMobilePhone from 'validator/lib/isMobilePhone';
import isEmail from 'validator/lib/isEmail';

export const isEmailValid = isEmail;

export const isMobileNumberValid = (number: string) => isMobilePhone(number, 'en-IN');

export const isNameValid = (name: string) => {
  let inBetween = false;
  for (let i = 0; i < name.length; i++) {
    if (name[i] === "'" && name[i + 1] === "'" && name[i] === ' ' && name[i + 1] === "'") {
      inBetween = true;
    }
  }
  return (
    /^[A-Za-z\/\s\.'-]+$/.test(name.trim()) &&
    name.trim().length > 0 &&
    name.charAt(0) != "'" &&
    name.charAt(name.length - 1) != "'" &&
    !inBetween
  );

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

  const dateParts = ddmmyyyy.split('/');
  const dd = dateParts[0];
  const mm = dateParts[1];
  const yyyy = dateParts[2];
  const dateStr = `${yyyy}-${mm}-${dd}`;
  const isValidJsDate = !isNaN(new Date(dateStr).valueOf());
  // https://stackoverflow.com/questions/12756159/regex-and-iso8601-formatted-datetime
  const isValidCalendarDate = /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[13-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/.test(
    ddmmyyyy
  );
  return isValidJsDate && isValidCalendarDate;
};
