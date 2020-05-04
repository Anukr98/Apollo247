'use strict';

const common = {
  add: 'Add',
  availableNow: 'AVAILABLE NOW',
  chooseDoctorHeaderText: 'Here are few doctors available for your appointment —',
};

const login = {
  hello: 'hello!',
  please_enter_no: 'Please enter your mobile number to login',
  otp_sent_to: 'OTP will be sent to this number',
  wrong_number: 'This seems like a wrong number',
  numberPrefix: '+91',
  great: 'great!',
  type_otp_text: 'Now type in the OTP sent to you for authentication',
  resend_otp_text: 'Type in the OTP that has been resent to your mobile number',
  resend_opt: 'RESEND OTP',
  enter_correct_opt: 'Please enter the correct OTP',
  welcome_text: 'welcome\nto apollo 24/7',
  welcome_desc: 'Let us quickly get to know you so that we can get you the best help :)',
  multi_signup_desc:
    'We have found 1 account registered with this mobile number. Please tell us who is who? :)',
  oops: 'oops!',
  incorrect_otp_message: 'You seem to have entered an incorrect OTP 3 times.',
  incorrect_otp_description: 'Incorrect OTP. You have {0} more {1}.',
  try_again: 'Try again after  —  {0}',
  okay: 'okay!',
  best_general_physicians_text: 'Here are our best General Physicians',
  all_consults: 'All Consults',
  distance: 'Distance',
};
const Appointment = {
  cancelconsult: 'CANCEL CONSULT',
  reschduleinsted: 'RESCHEDULE INSTEAD',
  cancelMessage:
    'Since you’re cancelling 15 minutes before your appointment, we’ll issue you a full refund!',
  ok: 'OK, GOT IT',
  errorMessage: 'Opps ! The selected slot is unavailable. Please choose a different one',
  hi: 'Hi:)',
  startConsult: 'START CONSULTATION',
  reschdule: 'RESCHEDULE',
  payment: 'Payment',
  order: 'ORDER SUMMARY',
  amount: 'Amount Paid',
  upcoming: 'UPCOMING ONLINE VISIT',
  cancel: 'Cancel',
};
const Notification = {
  address: 'Address Book',
  Notification: 'Notification Settings',
};
const AddFile = {
  photo: 'TAKE A PHOTO',
  gallery: 'CHOOSE FROM GALLERY',
  instructions: 'Instructions For Uploading Files',
  clearPicture: 'Take clear Picture of your entire file.',
  details: ' Doctor details & date of the prescription should be clearly visible.',
  jpg: ' Use JPG and PNG file format only.',
  mb: 'File should not be of more than 5mb.',
};


export const LocalStrings = {
  ...common,
  ...login,
  ...Appointment,
  ...Notification,
  ...AddFile,
};
