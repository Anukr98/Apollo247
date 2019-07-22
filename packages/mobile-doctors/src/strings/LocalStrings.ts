'use strict';

const common = {
  add: 'Add',
  availableNow: 'AVAILABLE NOW',
};

const login = {
  hello: 'hello!',
  please_enter_no: 'Please enter your mobile number to login',
  otp_sent_to: 'OTP will be sent to this number',
  wrong_number: 'This seems like the wrong number',
  numberPrefix: '+91',
  great: 'great',
  type_otp_text: 'Enter the OTP sent to you, to authenticate',
  resend_otp_text: 'Enter the OTP sent to you, to authenticate',
  resend_opt: 'RESEND OTP',
  enter_correct_opt: 'Please enter the correct OTP',
  welcome_text: 'welcome\nto apollo 24/7',
  welcome_desc: 'Let us quickly get to know you so that we can get you the best help :)',
  multi_signup_desc:
    'We have found 1 account registered with this mobile number. Please tell us who is who? :)',
  oops: 'oops!',
  incorrect_otp_message: 'You entered an incorrect OTP 3 times.',
  try_again: 'Try again after  —  {0}',
  okay: 'okay!',
  best_general_physicians_text: 'Here are our best General Physicians',
  all_consults: 'All Consults',
  distance: 'Distance',
  needhelp: 'need help?',
  callback: 'You can request a call back for us to resolve your issue ASAP',
  gethelp: 'GET HELP',
};

export const LocalStrings = {
  ...common,
  ...login,
};
