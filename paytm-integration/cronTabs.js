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
  axios.defaults.headers.common['authorization'] = Constants.AUTH_TOKEN;
  const docCountQuery = Constants.DOCTOR_COUNT_SENIOR;
  const seniorDataRequestJSON = {
    query: docCountQuery,
  };
  axios
    .post(process.env.API_URL, seniorDataRequestJSON)
    .then((response) => {
      //if summaryDate in url empty it will take currentDate
      //if pass anyDate in url summaryDate that date records will update if exist, otherwise insert
      let finalDate =
        req.query.summaryDate && req.query.summaryDate != ''
          ? req.query.summaryDate
          : format(new Date(), 'yyyy-MM-dd');
      let docCount = response.data.data;
      let finalResult = docCount.seniorDoctorCount;
      const doctorLimit = req.query.docLimit;
      const docLimit = doctorLimit;
      let totalSets = parseInt(finalResult / docLimit) + (finalResult % docLimit > 0 ? 1 : 0);
      console.log('totalSets===>', totalSets);
      let i;
      //const currentDate = format(new Date(), 'yyyy-MM-dd');
      for (i = 0; i < totalSets; i++) {
        console.log('running set', i);
        //loop for 10times
        const docOffset = i * docLimit;
        task(i);
        function task(i) {
          setTimeout(() => {
            let Query = Constants.UPDATE_SD_SUMMARY.replace('{0}', finalDate);
            (Query = Query.replace('{1}', req.query.docLimit)),
              (Query = Query.replace('{2}', docOffset));
            const updateSdSummaryRequestJSON = {
              query: Query,
            };
            axios
              .post(process.env.API_URL, updateSdSummaryRequestJSON)
              .then((response) => {
                const fileName =
                  process.env.PHARMA_LOGS_PATH + new Date().toDateString() + '-updateSdSummary.txt';
                let content =
                  new Date().toString() +
                  '\n---------------------------\n' +
                  '\nupdateSdSummary Response\n' +
                  JSON.stringify(response.data.data.updateSdSummary) +
                  '\n-------------------\n';
                console.log(response.data.data);
                fs.appendFile(fileName, content, function (err) {
                  if (err) throw err;
                  console.log('Updated!');
                });
                // res.send({
                //   status: 'success',
                //   message: response.data,
                // });
              })
              .catch((error) => {
                console.log('error', error);
              });
          }, 5000 * i);
        }
      }
      res.send({
        apiRunningForDate: finalDate,
        totalSets: totalSets,
        docCount: docCount.seniorDoctorCount,
        status: 'success',
        message: response.data,
      });
    })
    .catch((error) => {
      console.log('error', error);
    });
};
exports.updateJdSummary = (req, res) => {
  axios.defaults.headers.common['authorization'] = Constants.AUTH_TOKEN;
  const docCountQuery = Constants.DOCTOR_COUNT_JUNIOR;
  const juniorDataRequestJSON = {
    query: docCountQuery,
  };
  axios
    .post(process.env.API_URL, juniorDataRequestJSON)
    .then((response) => {
      //if summaryDate in url empty it will take currentDate
      //if pass anyDate in url summaryDate that date records will update if exist, otherwise insert
      let finalDate =
        req.query.summaryDate && req.query.summaryDate != ''
          ? req.query.summaryDate
          : format(new Date(), 'yyyy-MM-dd');
      let docCount = response.data.data;
      let finalResult = docCount.juniorDoctorCount;
      const doctorLimit = req.query.docLimit;
      const docLimit = doctorLimit;
      let totalSets = parseInt(finalResult / docLimit) + (finalResult % docLimit > 0 ? 1 : 0);
      let i;
      //const currentDate = format(new Date(), 'yyyy-MM-dd');
      for (i = 0; i < totalSets; i++) {
        //loop for 10times
        const docOffset = i * docLimit;
        task(i);
        function task(i) {
          setTimeout(() => {
            let Query = Constants.UPDATE_JD_SUMMARY.replace('{0}', finalDate);
            (Query = Query.replace('{1}', req.query.docLimit)),
              (Query = Query.replace('{2}', docOffset));
            const updateJdSummaryRequestJSON = {
              query: Query,
            };
            axios
              .post(process.env.API_URL, updateJdSummaryRequestJSON)
              .then((response) => {
                const fileName =
                  process.env.PHARMA_LOGS_PATH + new Date().toDateString() + '-updateJdSummary.txt';
                let content =
                  new Date().toString() +
                  '\n---------------------------\n' +
                  '\nupdateJdSummary Response\n' +
                  JSON.stringify(response.data.data.updateJdSummary) +
                  '\n-------------------\n';
                console.log(response.data.data);
                fs.appendFile(fileName, content, function (err) {
                  if (err) throw err;
                  console.log('Updated!');
                });
                // res.send({
                //   status: 'success',
                //   message: response.data,
                // });
              })
              .catch((error) => {
                console.log('error', error);
              });
          }, 5000 * i);
        }
      }
      res.send({
        apiRunningForDate: finalDate,
        totalSets: totalSets,
        docCount: docCount.seniorDoctorCount,
        status: 'success',
        message: response.data,
      });
    })
    .catch((error) => {
      console.log('error', error);
    });
};

exports.updateDoctorFeeSummary = (req, res) => {
  axios.defaults.headers.common['authorization'] = Constants.AUTH_TOKEN;
  const docCountQuery = Constants.DOCTOR_COUNT_SENIOR;
  const seniorDataRequestJSON = {
    query: docCountQuery,
  };
  axios
    .post(process.env.API_URL, seniorDataRequestJSON)
    .then((response) => {
      //if summaryDate in url empty it will take currentDate
      //if pass anyDate in url summaryDate that date records will update if exist, otherwise insert
      let finalDate =
        req.query.summaryDate && req.query.summaryDate != ''
          ? req.query.summaryDate
          : format(new Date(), 'yyyy-MM-dd');
      let docCount = response.data.data;
      let finalResult = docCount.seniorDoctorCount;
      const doctorLimit = req.query.docLimit;
      const docLimit = doctorLimit;
      let totalSets = parseInt(finalResult / docLimit) + (finalResult % docLimit > 0 ? 1 : 0);
      console.log('totalSets', totalSets);
      let i;
      //const currentDate = format(new Date(), 'yyyy-MM-dd');
      for (i = 0; i < totalSets; i++) {
        //loop for 10times
        console.log('running set==>', i);
        const docOffset = i * docLimit;
        task(i);
        function task(i) {
          setTimeout(() => {
            let Query = Constants.UPDATE_DOCTOR_FEE_SUMMARY.replace('{0}', finalDate);
            (Query = Query.replace('{1}', req.query.docLimit)),
              (Query = Query.replace('{2}', docOffset));
            const updateDoctorFeeSummaryRequestJSON = {
              query: Query,
            };
            axios
              .post(process.env.API_URL, updateDoctorFeeSummaryRequestJSON)
              .then((response) => {
                const fileName =
                  process.env.PHARMA_LOGS_PATH +
                  new Date().toDateString() +
                  '-updateDoctorFeeSummary_test.txt';
                let content =
                  new Date().toString() +
                  '\n---------------------------\n' +
                  '\nupdateDoctorFeeSummary Response\n' +
                  '\noffset=' +
                  docOffset +
                  '\n' +
                  JSON.stringify(response.data.data.updateDoctorFeeSummary) +
                  '\n-------------------\n';
                console.log(response.data.data);
                fs.appendFile(fileName, content, function (err) {
                  if (err) throw err;
                  console.log('Updated!');
                });
                // res.send({
                //   status: 'success',
                //   message: response.data,
                // });
              })
              .catch((error) => {
                console.log('error', error);
              });
          }, 5000 * i);
        }
      }
      res.send({
        status: 'success',
        message: response.data,
      });
    })
    .catch((error) => {
      console.log('error', error);
    });
};

exports.updateDoctorSlotsEs = (req, res) => {
  axios.defaults.headers.common['authorization'] = Constants.AUTH_TOKEN;
  const docCountQuery = Constants.DOCTOR_COUNT_SENIOR;
  const seniorDataRequestJSON = {
    query: docCountQuery,
  };
  axios
    .post(process.env.API_URL, seniorDataRequestJSON)
    .then((response) => {
      //let summaryDate = req.query.summaryDate;
      //if summaryDate in url empty it will take currentDate
      //if pass anyDate in url summaryDate that date records will update if exist, otherwise insert
      let docCount = response.data.data;
      let finalResult = docCount.seniorDoctorCount;
      const doctorLimit = 50;
      const docLimit = doctorLimit;
      let totalSets = parseInt(finalResult / docLimit) + (finalResult % docLimit > 0 ? 1 : 0);
      let i;
      let fromDate = format(new Date(), 'yyyy-MM-dd');
      let toDate = format(addDays(new Date(), 5), 'yyyy-MM-dd');
      console.log(fromDate, toDate, 'dates of slots');
      for (i = 0; i < totalSets; i++) {
        //loop for 10times
        const docOffset = i * docLimit;
        task(i);
        function task(i) {
          setTimeout(() => {
            Query = Constants.UPDATE_DOC_SLOTS_ES.replace('{0}', fromDate);
            (Query = Query.replace('{1}', toDate)),
              (Query = Query.replace('{2}', docLimit)),
              (Query = Query.replace('{3}', docOffset));
            const updateDoctorFeeSummaryRequestJSON = {
              query: Query,
            };
            axios
              .post(process.env.API_URL, updateDoctorFeeSummaryRequestJSON)
              .then((response) => {
                console.log(response.data.errors[0], 'errorr message from api');
                const fileName =
                  process.env.PHARMA_LOGS_PATH +
                  new Date().toDateString() +
                  '-updateDoctorSlotsEs.txt';
                let content =
                  new Date().toString() +
                  '\n---------------------------\n' +
                  '\nupdateDoctorSlotsEs Response\n' +
                  response.data.data.addAllDoctorSlotsElastic +
                  '\n-------------------\n';
                if (response.data.errors[0]) {
                  content +=
                    response.data.errors[0].message +
                    ', ' +
                    response.data.errors[0].extensions.exception.meta.body.error.root_cause[0]
                      .reason;
                }
                console.log(response.data.data.addAllDoctorSlotsElastic);
                fs.appendFile(fileName, content, function (err) {
                  if (err) throw err;
                  console.log('Updated!');
                });
              })
              .catch((error) => {
                //console.log('error', error);
                console.log(error.response.data.errors, 'erros from api');
              });
          }, 5000 * i);
        }
      }
      res.send({
        status: 'success',
        message: response.data,
      });
    })
    .catch((error) => {
      console.log('error', error);
    });
};
