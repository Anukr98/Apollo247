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

export const isDobValid = (dob: string) => {
  return (
    /^([0-9]{2})\/([0-9]{2})\/([0-9]{4})$/.test(dob) &&
    dob
      .split('/')
      .reverse()
      .join('/') <
      new Date()
        .toLocaleDateString('en-GB', { year: 'numeric', month: 'numeric', day: 'numeric' })
        .replace(/ /g, '/')
        .split('/')
        .reverse()
        .join('/')
  );
};

export const isEmailValid = (email: string) => {
  return /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/.test(email);
};
