import isEmail from './lib/isEmail';

import isIP from './lib/isIP';

import isFQDN from './lib/isFQDN';

import isNumeric from './lib/isNumeric';

import isByteLength from './lib/isByteLength';

import isMobilePhone, { locales as isMobilePhoneLocales } from './lib/isMobilePhone';

const validator = {
  isEmail,
  isIP,
  isFQDN,
  isNumeric,
  isByteLength,
  isMobilePhone,
  isMobilePhoneLocales,
};

export default validator;
