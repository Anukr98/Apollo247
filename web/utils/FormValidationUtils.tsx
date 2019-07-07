export const isMobileNumberValid = (mobileNumber: string) => {
  const ValidFirstDigits: string[] = ['6', '7', '8', '9'];
  if (mobileNumber.length === 10 && ValidFirstDigits.indexOf(mobileNumber[0]) > -1) {
    return true;
  }
  if (
    mobileNumber.length > 0 &&
    mobileNumber.length < 10 &&
    ValidFirstDigits.indexOf(mobileNumber[0]) > -1
  ) {
    return true;
  }
  return false;
};

export const isDigit = (char: string) => {
  return /^[0-9\b]+$/.test(char);
};

export const isNameValid = (name: string) => {
  return /^[a-zA-Z ]*$/.test(name.trim()) && name.trim().length > 2;
};

export const isDobValid = (ddmmyyyy: string) => {
  const isCorrectFormat = /^([0-9]{2})\/([0-9]{2})\/([0-9]{4})$/.test(ddmmyyyy);
  if (!isCorrectFormat) return false;

  const dateParts = ddmmyyyy.split('/');
  const dd = parseInt(dateParts[0]),
    mm = parseInt(dateParts[1]),
    yyyy = parseInt(dateParts[2]);

  const date = new Date(yyyy, mm, dd);

  const isInvalid = isNaN(date.valueOf());
  if (isInvalid) return false;

  const isPastdate = date < new Date();
  return isPastdate;
};

export const isEmailValid = (email: string) => {
  return /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/.test(email);
};
