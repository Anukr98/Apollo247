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
  return /^[a-zA-Z ]*$/.test(name.trim());
};

export const isDobValid = (ddmmyyyy: string) => {
  const isCorrectFormat = /^(?=\d)(?:(?:31(?!.(?:0?[2469]|11))|(?:30|29)(?!.0?2)|29(?=.0?2.(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00)))(?:\x20|$))|(?:2[0-8]|1\d|0?[1-9]))([-.\/])(?:1[012]|0?[1-9])\1(?:1[6-9]|[2-9]\d)?\d\d(?:(?=\x20\d)\x20|$))?(((0?[1-9]|1[012])(:[0-5]\d){0,2}(\x20[AP]M))|([01]\d|2[0-3])(:[0-5]\d){1,2})?$/.test(
    ddmmyyyy
  );
  if (!isCorrectFormat) return false;
  return (
    ddmmyyyy
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
