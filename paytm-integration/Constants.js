module.exports = Object.freeze({
  AUTH_TOKEN: `Bearer 3d1833da7020e0602165529446587434`,
  ES_ADD_DAYS: 7,
  ES_DOC_LIMIT: 50,
  AUTO_SUBMIT_JD_CASESHEET: `query { autoSubmitJDCasesheet }`,
  SEND_UNREAD_MESSAGES_NOTIFICATION: `query { sendUnreadMessagesNotification }`,
  ARCHIVE_MESSAGES: `query { archiveMessages }`,
  NO_SHOW_REMINDER: `query {noShowReminderNotification {status apptsListCount noCaseSheetCount}}`,
  APPT_REMINDER: `query { sendApptReminderNotification(inNextMin: {0} ){status apptsListCount }}`,
  FOLLOW_UP_NOTIFICATION: `query { sendFollowUpNotification }`,
  DAILY_APPOINTMENT_SUMMARY: `query { sendDailyAppointmentSummary }`,
  PHYSICAL_APPT_REMINDER: `query { sendPhysicalApptReminderNotification(inNextMin: {0} ){status apptsListCount }}`,
  UPDATE_SD_SUMMARY: `mutation{ updateSdSummary(summaryDate:"{0}",doctorId:"0",docLimit: {1} ,docOffset: {2} ){ doctorId doctorName appointmentDateTime totalConsultation } }`,
  UPDATE_JD_SUMMARY: `mutation{ updateJdSummary(summaryDate:"{0}",doctorId:"0",docLimit: {1} ,docOffset: {2} ){ doctorId doctorName appointmentDateTime totalConsultation } }`,
  UPDATE_DOCTOR_FEE_SUMMARY: `mutation{ updateDoctorFeeSummary(summaryDate:"{0}",doctorId:"0",docLimit:{1},docOffset:{2}){ status,totalDoctors } }`,
  DOCTOR_COUNT_SENIOR: `query {seniorDoctorCount}`,
  DOCTOR_COUNT_JUNIOR: `query {juniorDoctorCount}`,
  UPDATE_DOC_SLOTS_ES: `mutation{ addAllDoctorSlotsElastic(id: "0",fromSlotDate:"{0}",toSlotDate:"{1}",limit: {2} ,offset: {3} ) }`,
  POSSIBLE_PAYMENT_TYPES: ['CC', 'DC', 'NB', 'PPI', 'EMI', 'UPI', 'PAYTM_DIGITAL_CREDIT'],
  PAYMENT_REQUEST_FAILURE_INVALID_PARAMETERS: 'Invalid parameters',
  PAYMENT_REQUEST_FAILURE_UNKNOWN_REASON: 'Something went wrong, please try again!',
  PAYMENT_MODE_ONLY_TRUE: 'YES'

});
