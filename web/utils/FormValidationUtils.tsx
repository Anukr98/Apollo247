export const isMobileNumberValid = (mobileNumber: string) => {
  if (
    mobileNumber.length === 10 &&
    (mobileNumber[0] === '6' ||
      mobileNumber[0] === '7' ||
      mobileNumber[0] === '8' ||
      mobileNumber[0] === '9')
  ) {
    return true;
  }
  return false;
};

export const isDigit = (char: string) => {
  return /^[0-9\b]+$/.test(char);
};

export const isNameValid = (name: string) => {
  return /^[a-zA-Z ]*$/.test(name);
};

export const isDobValid = (dob: string) => {
  if (/^([0-9]{2})\/([0-9]{2})\/([0-9]{4})$/.test(dob)) {
    const dbString = new Date(dob);
  }
  return false;
};

export const isEmailValid = (email: string) => {
  return /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/.test(email);
};
