const axios = require('axios');
const Constants = require('./Constants');
const fs = require('fs');
const format = require('date-fns/format');

exports.autoSubmitJDCasesheet = (req, res) => {
  const requestJSON = {
    query: Constants.AUTO_SUBMIT_JD_CASESHEET,
  };
  axios.defaults.headers.common['authorization'] = Constants.AUTH_TOKEN;
  axios
    .post(process.env.API_URL, requestJSON)
    .then((response) => {
      res.send({
        status: 'success',
        message: response.data,
      });
    })
    .catch((error) => {
      console.log('error', error);
    });
};
exports.noShowReminder = (req, res) => {
  const requestJSON = {
    query: Constants.NO_SHOW_REMINDER,
  };
  axios.defaults.headers.common['authorization'] = Constants.AUTH_TOKEN;
  axios
    .post(process.env.API_URL, requestJSON)
    .then((response) => {
      const fileName =
        process.env.PHARMA_LOGS_PATH +
        new Date().getFullYear() +
        '-' +
        (new Date().getMonth() + 1) +
        '-' +
        new Date().getDate() +
        '-apptNotifications.txt';
      let content =
        new Date().toString() +
        '\n---------------------------\n' +
        response.data.data.noShowReminderNotification.noCaseSheetCount +
        ' - ' +
        response.data.data.noShowReminderNotification.apptsListCount;
      ('\n-------------------\n');
      fs.appendFile(fileName, content, function (err) {
        if (err) throw err;
        console.log('Updated!');
      });
      res.send({
        status: 'success',
        message: response.data,
      });
    })
    .catch((error) => {
      console.log('error', error);
    });
};

exports.FollowUpNotification = (req, res) => {
  const requestJSON = {
    query: Constants.FOLLOW_UP_NOTIFICATION,
  };
  axios.defaults.headers.common['authorization'] = Constants.AUTH_TOKEN;
  axios
    .post(process.env.API_URL, requestJSON)
    .then((response) => {
      const fileName =
        process.env.PHARMA_LOGS_PATH + new Date().toDateString() + '-followUpNotifications.txt';
      let content =
        new Date().toString() +
        '\n---------------------------\n' +
        response.data.data.sendFollowUpNotification +
        '\n-------------------\n';
      fs.appendFile(fileName, content, function (err) {
        if (err) throw err;
        console.log('Updated!');
      });
      res.send({
        status: 'success',
        message: response.data,
      });
    })
    .catch((error) => {
      console.log('error', error);
    });
};

exports.ApptReminder = (req, res) => {
  const requestJSON = {
    query: Constants.APPT_REMINDER.replace(`{0}`, req.query.inNextMin),
  };
  axios.defaults.headers.common['authorization'] = Constants.AUTH_TOKEN;
  axios
    .post(process.env.API_URL, requestJSON)
    .then((response) => {
      const fileName =
        process.env.PHARMA_LOGS_PATH + new Date().toDateString() + '-apptNotifications.txt';
      let content =
        new Date().toString() +
        '\n---------------------------\n' +
        response.data.data.sendApptReminderNotification.apptsListCount +
        '\n-------------------\n';
      fs.appendFile(fileName, content, function (err) {
        if (err) throw err;
        console.log('Updated!');
      });
      res.send({
        status: 'success',
        message: response.data,
      });
    })
    .catch((error) => {
      console.log('error', error);
    });
};

exports.DailyAppointmentSummary = (req, res) => {
  const requestJSON = {
    query: Constants.DAILY_APPOINTMENT_SUMMARY,
  };
  axios.defaults.headers.common['authorization'] = Constants.AUTH_TOKEN;
  axios
    .post(process.env.API_URL, requestJSON)
    .then((response) => {
      const fileName =
        process.env.PHARMA_LOGS_PATH + new Date().toDateString() + '-dailyAppointmentSummary.txt';
      let content =
        new Date().toString() +
        '\n---------------------------\n' +
        response.data.data.sendDailyAppointmentSummary +
        '\n-------------------\n';
      fs.appendFile(fileName, content, function (err) {
        if (err) throw err;
        console.log('Updated!');
      });
      res.send({
        status: 'success',
        message: response.data,
      });
    })
    .catch((error) => {
      console.log('error', error);
    });
};

exports.PhysicalApptReminder = (req, res) => {
  const requestJSON = {
    query: Constants.PHYSICAL_APPT_REMINDER.replace('{0}', req.query.inNextMin),
  };
  axios.defaults.headers.common['authorization'] = Constants.AUTH_TOKEN;
  axios
    .post(process.env.API_URL, requestJSON)
    .then((response) => {
      console.log(response);
      const fileName =
        process.env.PHARMA_LOGS_PATH + new Date().toDateString() + '-apptNotifications.txt';
      let content =
        new Date().toString() +
        '\n---------------------------\n' +
        response.data.data.sendPhysicalApptReminderNotification.apptsListCount +
        '\n-------------------\n';
      fs.appendFile(fileName, content, function (err) {
        if (err) throw err;
        console.log('Updated!');
      });
      res.send({
        status: 'success',
        message: response.data,
      });
    })
    .catch((error) => {
      console.log('error', error);
    });
};
exports.updateSdSummary = (req, res) => {
  const currentDate = format(new Date(), 'yyyy-MM-dd');
  let Query = Constants.UPDATE_SD_SUMMARY.replace('{0}', currentDate);
  (Query = Query.replace('{1}', req.query.docLimit)),
    (Query = Query.replace('{2}', req.query.docOffset));
  const updateSdSummaryRequestJSON = {
    query: Query,
  };
  axios.defaults.headers.common['authorization'] = Constants.AUTH_TOKEN;
  axios
    .post(process.env.API_URL, updateSdSummaryRequestJSON)
    .then((response) => {
      const fileName =
        process.env.PHARMA_LOGS_PATH + new Date().toDateString() + '-updateSdSummary.txt';
      let content =
        new Date().toString() +
        '\n---------------------------\n' +
        '\nupdateSdSummary Response\n' +
        response.data.data.updateSdSummary +
        '\n-------------------\n';
      fs.appendFile(fileName, content, function (err) {
        if (err) throw err;
        console.log('Updated!');
      });
      res.send({
        status: 'success',
        message: response.data,
      });
    })
    .catch((error) => {
      console.log('error', error);
    });
};
exports.updateJdSummary = (req, res) => {
  const currentDate = format(new Date(), 'yyyy-MM-dd');
  let Query = Constants.UPDATE_JD_SUMMARY.replace('{0}', currentDate);
  (Query = Query.replace('{1}', req.query.docLimit)),
    (Query = Query.replace('{2}', req.query.docOffset));
  const updateJdSummaryRequestJSON = {
    query: Query,
  };
  axios.defaults.headers.common['authorization'] = Constants.AUTH_TOKEN;
  axios
    .post(process.env.API_URL, updateJdSummaryRequestJSON)
    .then((response) => {
      const fileName =
        process.env.PHARMA_LOGS_PATH + new Date().toDateString() + '-updateJdSummary.txt';
      let content =
        new Date().toString() +
        '\n---------------------------\n' +
        '\nupdateJdSummary Response\n' +
        response.data.data.updateJdSummary +
        '\n-------------------\n';
      fs.appendFile(fileName, content, function (err) {
        if (err) throw err;
        console.log('Updated!');
      });
      res.send({
        status: 'success',
        message: response.data,
      });
    })
    .catch((error) => {
      console.log('error', error);
    });
};

exports.updateDoctorFeeSummary = (req, res) => {
  const currentDate = format(new Date(), 'yyyy-MM-dd');
  let Query = Constants.UPDATE_DOCTOR_FEE_SUMMARY.replace('{0}', currentDate);
  (Query = Query.replace('{1}', req.query.docLimit)),
    (Query = Query.replace('{2}', req.query.docOffset));
  const updateDoctorFeeSummaryRequestJSON = {
    query: Query,
  };
  axios.defaults.headers.common['authorization'] = Constants.AUTH_TOKEN;
  //updateDoctorFeeSummary api call
  axios
    .post(process.env.API_URL, updateDoctorFeeSummaryRequestJSON)
    .then((response) => {
      const fileName =
        process.env.PHARMA_LOGS_PATH + new Date().toDateString() + '-updateDoctorFeeSummary.txt';
      let content =
        new Date().toString() +
        '\n---------------------------\n' +
        '\nupdateDoctorFeeSummary Response\n' +
        response.data.data.updateDoctorFeeSummary +
        '\n-------------------\n';
      fs.appendFile(fileName, content, function (err) {
        if (err) throw err;
        console.log('Updated!');
      });
      res.send({
        status: 'success',
        message: response.data,
      });
    })
    .catch((error) => {
      console.log('error', error);
    });
};
