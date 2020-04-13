module.exports = Object.freeze({
  AUTH_TOKEN: `Bearer 3d1833da7020e0602165529446587434`,
  AUTO_SUBMIT_JD_CASESHEET: `query { autoSubmitJDCasesheet }`,
  NO_SHOW_REMINDER: `query {noShowReminderNotification {status apptsListCount noCaseSheetCount}}`,
  APPT_REMINDER: `query { sendApptReminderNotification(inNextMin: {0} ){status apptsListCount }}`,
  FOLLOW_UP_NOTIFICATION: `query { sendFollowUpNotification }`,
  DAILY_APPOINTMENT_SUMMARY: `query { sendDailyAppointmentSummary }`,
  PHYSICAL_APPT_REMINDER: `query { sendPhysicalApptReminderNotification(inNextMin: {0} ){status apptsListCount }}`,
  UPDATE_SD_SUMMARY: `mutation{ updateSdSummary(summaryDate:"{0}",doctorId:"0",docLimit: {1} ,docOffset: {2} ){ doctorId doctorName appointmentDateTime totalConsultation } }`,
  UPDATE_JD_SUMMARY: `mutation{ updateJdSummary(summaryDate:"{0}",doctorId:"0",docLimit: {1} ,docOffset: {2} ){ doctorId doctorName appointmentDateTime totalConsultation } }`,
  UPDATE_DOCTOR_FEE_SUMMARY: `mutation{ updateDoctorFeeSummary(summaryDate:"{0}",doctorId:"0",docLimit:{1},docOffset:{2}){ status } }`,
});