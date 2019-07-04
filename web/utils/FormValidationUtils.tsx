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
  if (/^[a-zA-Z ]*$/.test(name) && name.length > 2) {
    return true;
  } else {
    return false;
  }
};

export const isDobValid = (dob: string) => {
  const dobArray = dob.split('/');
  if (
    dobArray[0] !== '' &&
    !isNaN(parseInt(dobArray[0])) &&
    dobArray[1] !== '' &&
    !isNaN(parseInt(dobArray[1])) &&
    dobArray[2] !== '' &&
    !isNaN(parseInt(dobArray[2])) &&
    dobArray[2].length === 4
  ) {
    const dateString = new Date(`${dobArray[1]}/${dobArray[0]}/${dobArray[2]}`);
    return JSON.stringify(dateString) !== 'null' ? true : false;
  } else {
    return false;
  }
  // return /^([0-9]{2})\/([0-9]{2})\/([0-9]{4})$/.test(dob);
};

export const isEmailValid = (email: string) => {
  return /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/.test(email);
};
