const axios = require('axios');
const Constants = require('./Constants');
const fs = require('fs');
const format = require('date-fns/format');
const addDays = require('date-fns/addDays');
const addMinutes = require('date-fns/addMinutes');
const url = require('url');

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

exports.sendUnreadMessagesNotification = (req, res) => {
  const requestJSON = {
    query: Constants.SEND_UNREAD_MESSAGES_NOTIFICATION,
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

exports.archiveMessages = (req, res) => {
  const requestJSON = {
    query: Constants.ARCHIVE_MESSAGES,
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

exports.DoctorApptReminder = (req, res) => {
  const requestJSON = {
    query: Constants.DOCTOR_APPT_REMINDER.replace(`{0}`, req.query.inNextMin),
  };
  axios.defaults.headers.common['authorization'] = Constants.AUTH_TOKEN;
  axios
    .post(process.env.API_URL, requestJSON)
    .then((response) => {
      const fileName =
        process.env.PHARMA_LOGS_PATH + new Date().toDateString() + '-doctorApptNotifications.txt';
      let content =
        new Date().toString() +
        '\n---------------------------\n' +
        response.data.data.sendDoctorReminderNotifications.apptsListCount +
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

exports.DailyAppointmentSummaryOps = (req, res) => {
  const requestJSON = {
    query: Constants.DAILY_APPOINTMENT_SUMMARY_OPS,
  };
  axios.defaults.headers.common['authorization'] = Constants.AUTH_TOKEN;
  axios
    .post(process.env.API_URL, requestJSON)
    .then((response) => {
      const fileName =
        process.env.PHARMA_LOGS_PATH +
        new Date().toDateString() +
        '-dailyAppointmentSummaryOps.txt';
      let content =
        new Date().toString() +
        '\n---------------------------\n' +
        response.data.data.sendDailyAppointmentSummaryOps +
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
    .post(process.env.DASHBOARD_API_URL, seniorDataRequestJSON)
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
      let i;
      for (i = 0; i < totalSets; i++) {
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
              .post(process.env.DASHBOARD_API_URL, updateSdSummaryRequestJSON)
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
              })
              .catch((error) => {
                console.log('error', error);
              });
          }, 5000 * i);
        }
      }
      res.send({
        apiRunningForDate: finalDate,
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
    .post(process.env.DASHBOARD_API_URL, juniorDataRequestJSON)
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
              .post(process.env.DASHBOARD_API_URL, updateJdSummaryRequestJSON)
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
              })
              .catch((error) => {
                console.log('error', error);
              });
          }, 5000 * i);
        }
      }
      res.send({
        apiRunningForDate: finalDate,
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
    .post(process.env.DASHBOARD_API_URL, seniorDataRequestJSON)
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
      let i;
      for (i = 0; i < totalSets; i++) {
        //loop for 10times
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
              .post(process.env.DASHBOARD_API_URL, updateDoctorFeeSummaryRequestJSON)
              .then((response) => {
                const fileName =
                  process.env.PHARMA_LOGS_PATH +
                  new Date().toDateString() +
                  '-updateDoctorFeeSummary.txt';
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
              })
              .catch((error) => {
                console.log('error', error);
              });
          }, 5000 * i);
        }
      }
      res.send({
        apiRunningForDate: finalDate,
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
      const doctorLimit = Constants.ES_DOC_LIMIT;
      const docLimit = doctorLimit;
      let totalSets = parseInt(finalResult / docLimit) + (finalResult % docLimit > 0 ? 1 : 0);
      let i;
      let fromDate = format(new Date(), 'yyyy-MM-dd');
      let toDate = format(addDays(new Date(), Constants.ES_ADD_DAYS), 'yyyy-MM-dd');
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
                //console.log(response.data.errors[0], 'errorr message from api');
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
                if (response.data.errors) {
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
                console.log('error', error);
                //console.log(error.response.data.errors, 'erros from api');
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

exports.refreshDoctorDeepLinks = (req, res) => {
  const requestJSON = {
    query: Constants.DOCTORS_DEEPLINK_REFRESH.replace(`{0}`, req.query.offset),
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

exports.generateDeeplinkForNewDoctors = (req, res) => {
  const requestJSON = {
    query: Constants.DOCTORS_DEEPLINK_GENERATE,
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

exports.sendCallStartNotification = (req, res) => {
  const requestJSON = {
    query: Constants.CALL_START_NOTIFICATION,
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

exports.appointmentReminderTemplate = (req, res) => {
  try {
    console.log(`\n\n url*********`, req.url);
    console.log(`\n\n headers*********`, req.headers);
    console.log(`\n\n params*********`, req.params);

    let urlObject = url.parse(req.url, true);
    const appointmentDateTime = format(
      addMinutes(new Date(urlObject.query.CustomField.split('_')[0]), 330),
      'h m a'
    );
    const appointmentType = urlObject.query.CustomField.split('_')[1];

    console.log(`Hi, You have an upcoming appointment at ${appointmentDateTime} today from Apollo 2 4 7.  
    It will be ${appointmentType} consultation. Dial 1 to repeat the same message. `);

    return res.contentType('text/plain').status(200)
      .send(`Hi, You have an upcoming appointment at ${appointmentDateTime} today from Apollo 2 4 7.
         It will be ${appointmentType} consultation. Dial 1 to repeat the same message. `);
  } catch (ex) {
    console.error(ex);
    return res.status(400).end();
  }
};

exports.saveMedicineInfoRedis = (req, res) => {
  console.log(req.body, 'input body');
  let inputData = Constants.SAVE_MEDICINE_INFO.replace('{0}', req.body.sku);
  inputData = inputData.replace('{1}', req.body.name);
  inputData = inputData.replace('{2}', req.body.status);
  inputData = inputData.replace('{3}', req.body.price);
  inputData = inputData.replace('{4}', req.body.special_price);
  inputData = inputData.replace('{5}', req.body.special_price_from);
  inputData = inputData.replace('{6}', req.body.special_price_to);
  inputData = inputData.replace('{7}', req.body.qty);
  inputData = inputData.replace('{8}', req.body.description);
  inputData = inputData.replace('{9}', req.body.url_key);
  inputData = inputData.replace('{10}', req.body.base_image);
  inputData = inputData.replace('{11}', req.body.is_prescription_required);
  inputData = inputData.replace('{12}', req.body.category_name);
  inputData = inputData.replace('{13}', req.body.product_discount_category);
  inputData = inputData.replace('{14}', req.body.sell_online);
  inputData = inputData.replace('{15}', req.body.molecules);
  inputData = inputData.replace('{16}', req.body.mou);
  inputData = inputData.replace('{17}', req.body.gallery_images);
  inputData = inputData.replace('{18}', req.body.manufacturer);
  console.log(inputData, 'input body');
  const requestJSON = {
    query: inputData,
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

exports.update247PatientProfile = (req, res) => {

  if (!(process.env && process.env.PRISM_API_KEY_FOR_247)) {
    res.status(500).send({
      errCode: "",
      errMsg: "",
      errDetail: "API key missing in environment to authenticate. Please contact Apollo 247 Team",
      err: true,
      success: false,
      data: null
    })
    res.end()
    return;
  }

  if (!(req.headers && req.headers.apikey && req.headers.apikey == process.env.PRISM_API_KEY_FOR_247)) {
    res.status(401).send({
      errCode: "UNAUTHORIZED",
      errMsg: "",
      errDetail: "UNAUTHORIZED",
      err: true,
      success: false,
      data: null
    })
    res.end()
    return;
  }

  const genderMap247Prism = {
    "male": "MALE",
    "female": "FEMALE",
    "other": "OTHER"
  }

  let queryString = `mutation syncPatientProfileUpdatesFromPRISM{
    syncPatientProfileUpdatesFromPRISM(syncPatientProfileUpdatesFromPRISMInput:{
      uhid : "${req.body.uhid}",
      mobileNumber : "${req.body.mobileNumber}",
      updateAttributes : {`

  /* Patient Profile table updates */
  if (
    (req.body && req.body.userBasicInfo && req.body.userBasicInfo.sex) ||
    (req.body && req.body.userContactInfo && req.body.userContactInfo.email1) ||
    (req.body && req.body.firstName) ||
    (req.body && req.body.lastName)
  ) {

    queryString += `patientProfile : {`

    if (req.body && req.body.firstName) {
      queryString += `firstName : "${req.body.firstName}",`
    }

    if (req.body && req.body.lastName) {
      queryString += `lastName : "${req.body.lastName}",`
    }

    if (req.body && req.body.userBasicInfo && req.body.userBasicInfo.sex && genderMap247Prism[req.body.userBasicInfo.sex]) {
      queryString += `gender : ${genderMap247Prism[req.body.userBasicInfo.sex]},`
    }

    if (req.body && req.body.userContactInfo && req.body.userContactInfo.email1) {
      queryString += `emailAddress : "${req.body.userContactInfo.email1}",`
    }

    if (req.body && req.body.userBasicInfo && req.body.userBasicInfo.dateOfBirth) {
      queryString += `dateOfBirth : "${req.body.userBasicInfo.dateOfBirth}",`
    }

    queryString += `}`
  }

  /* Patient Address table updates 
  - to be integrated later*/

  // if (
  //   (req.body && req.body.userContactInfo && req.body.userContactInfo.addressLine1) ||
  //   (req.body && req.body.userContactInfo && req.body.userContactInfo.addressLine2) ||
  //   (req.body && req.body.userContactInfo && req.body.userContactInfo.city) ||
  //   (req.body && req.body.userContactInfo && req.body.userContactInfo.state) ||
  //   (req.body && req.body.userContactInfo && req.body.userContactInfo.pincode)
  // ) {
  //   queryString += `patientAddress : {`

  //   if (req.body && req.body.userContactInfo && req.body.userContactInfo.addressLine1) {
  //     queryString += `addressLine1 : ${req.body.userContactInfo.addressLine1},`
  //   }

  //   if (req.body && req.body.userContactInfo && req.body.userContactInfo.addressLine2) {
  //     queryString += `addressLine2 : ${req.body.userContactInfo.addressLine2},`
  //   }

  //   if (req.body && req.body.userContactInfo && req.body.userContactInfo.city) {
  //     queryString += `city : ${req.body.userContactInfo.city},`
  //   }

  //   if (req.body && req.body.userContactInfo && req.body.userContactInfo.state) {
  //     queryString += `state : ${req.body.userContactInfo.state},`
  //   }

  //   if (req.body && req.body.userContactInfo && req.body.userContactInfo.pincode) {
  //     queryString += `zipcode : ${req.body.userContactInfo.pincode},`
  //   }

  //   queryString += `}`
  // }

  queryString += `}
  })
  {
    status
  }
  }`

  axios
    ({
      url: process.env.API_URL,
      method: 'post',
      data: {
        query: queryString,
      },
      headers: {
        'authorization': Constants.AUTH_TOKEN
      }
    })
    .then((response) => {
      if (response.data && !response.data.errors) {

        res.status(200).send({
          errCode: "",
          errMsg: "",
          errDetail: null,
          err: false,
          success: true,
          data: null
        })

      } else {

        res.status(500).send({
          errCode: "",
          errMsg: "",
          errDetail: response.data.errors,
          err: true,
          success: false,
          data: null
        })
      }

    })
    .catch((err) => {

      res.status(400).send({
        errCode: "",
        errMsg: "",
        errDetail: err,
        err: true,
        success: false,
        data: null
      })

    })



}