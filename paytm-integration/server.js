const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');
const ejs = require('ejs');
const app = express();
const session = require('express-session');
const stripTags = require('striptags');
const crypto = require('crypto');
const azure = require('azure-sb');
const fs = require('fs');
const deeplink = require('node-deeplink');
const format = require('date-fns/format');
require('dotenv').config();

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    cookie: { maxAge: 6000000 },
    resave: false,
    saveUninitialized: true,
  })
);

const PORT = process.env.PORT || 7000;

const { initPayment } = require('./paytm/services/index');

const cronTabs = require('./cronTabs');

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname + '/views'));
app.set('view engine', 'ejs');

app.get(
  '/deeplink',
  deeplink({
    fallback: 'https://apollo247.com',
    android_package_name: 'com.apollo.patientapp',
  })
);

app.get('/invokeAutoSubmitJDCasesheet', cronTabs.autoSubmitJDCasesheet);
app.get('/invokeNoShowReminder', cronTabs.noShowReminder);
app.get('/invokeFollowUpNotification', cronTabs.FollowUpNotification);
app.get('/invokeApptReminder', cronTabs.ApptReminder);
app.get('/invokeDailyAppointmentSummary', cronTabs.DailyAppointmentSummary);
app.get('/invokePhysicalApptReminder', cronTabs.PhysicalApptReminder);
app.get('/updateSdSummary', cronTabs.updateSdSummary);
app.get('/updateJdSummary', cronTabs.updateJdSummary);
app.get('/updateDoctorFeeSummary', cronTabs.updateDoctorFeeSummary);
app.get('/invokeDashboardSummaries', (req, res) => {
  const currentDate = format(new Date(), 'yyyy-MM-dd');
  const updatePhrDocSummaryRequestJSON = {
    query: `mutation{
        updatePhrDocSummary(summaryDate:"${currentDate}"){
          apptDocCount
          medDocCount
        }
      }`,
  };
  const getAvailableDoctorsCountRequestJSON = {
    query: `{
      getAvailableDoctorsCount(availabilityDate:"${currentDate}"){
        count{
          speciality
          morning
          afternoon
          evening
          night
        }
      }
    }`,
  };
  const updateConsultRatingRequestJSON = {
    query: `mutation{
      updateConsultRating(summaryDate:"${currentDate}"){
        ratingRowsCount
      }
    }`,
  };
  axios.defaults.headers.common['authorization'] = Constants.AUTH_TOKEN;
  //updatePhrDocSummary api call
  axios
    .post(process.env.API_URL, updatePhrDocSummaryRequestJSON)
    .then((response) => {
      console.log(response);
      console.log(response.data.data.updatePhrDocSummary, 'Summary response is....');
      const fileName =
        process.env.PHARMA_LOGS_PATH + new Date().toDateString() + '-dashboardSummary.txt';
      let content =
        new Date().toString() +
        '\n---------------------------\n' +
        '\nupdatePhrDocSummary Response\n' +
        response.data.data.updatePhrDocSummary +
        '\n-------------------\n';
      fs.appendFile(fileName, content, function(err) {
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

  //getAvailableDoctorsCount api call
  axios
    .post(process.env.API_URL, getAvailableDoctorsCountRequestJSON)
    .then((response) => {
      console.log(response);
      console.log(response.data.data.getAvailableDoctorsCount, 'Summary response is....');
      const fileName =
        process.env.PHARMA_LOGS_PATH + new Date().toDateString() + '-dashboardSummary.txt';
      let content =
        new Date().toString() +
        '\n---------------------------\n' +
        '\ngetAvailableDoctorsCount Response\n' +
        response.data.data.getAvailableDoctorsCount +
        '\n-------------------\n';
      fs.appendFile(fileName, content, function(err) {
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

  //updateConsultRating api call
  axios
    .post(process.env.API_URL, updateConsultRatingRequestJSON)
    .then((response) => {
      console.log(response);
      console.log(response.data.data.updateConsultRating, 'Summary response is....');
      const fileName =
        process.env.PHARMA_LOGS_PATH + new Date().toDateString() + '-dashboardSummary.txt';
      let content =
        new Date().toString() +
        '\n---------------------------\n' +
        '\nupdateConsultRating Response\n' +
        response.data.data.updateConsultRating +
        '\n-------------------\n';
      fs.appendFile(fileName, content, function(err) {
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
});
app.get('/getCmToken', (req, res) => {
  axios.defaults.headers.common['authorization'] =
    'ServerOnly eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6ImFwb2xsb18yNF83IiwiaWF0IjoxNTcyNTcxOTIwLCJleHAiOjE1ODA4Mjg0ODUsImlzcyI6IlZpdGFDbG91ZC1BVVRIIiwic3ViIjoiVml0YVRva2VuIn0.ZGuLAK3M_O2leBCyCsPyghUKTGmQOgGX-j9q4SuLF-Y';
  axios
    .get(
      process.env.CM_API_URL +
        '?appId=apollo_24_7&appUserId=' +
        req.query.appUserId +
        '&name=' +
        req.query.userName +
        '&gender=' +
        req.query.gender +
        '&emailId=' +
        req.query.emailId +
        '&phoneNumber=' +
        req.query.phoneNumber
    )
    .then((response) => {
      res.send({
        status: 'success',
        message: response.data.message,
        vitaToken: response.data.vitaToken,
      });
    })
    .catch((err) => {
      console.log(err, 'error');
      res.send({
        status: 'failure',
        message: '',
        vitaToken: '',
      });
    });
});

app.get('/consulttransaction', (req, res) => {
  /*save response in apollo24x7*/
  axios.defaults.headers.common['authorization'] = 'Bearer 3d1833da7020e0602165529446587434';
  const date = new Date(new Date().toUTCString()).toISOString();
  const txnId = req.query.CompleteResponse.replace('TXNID=', '');
  // this needs to be altered later.
  const requestJSON = {
    query:
      'mutation { makeAppointmentPayment(paymentInput: { amountPaid: ' +
      req.query.TXNAMOUNT +
      ', paymentRefId: "' +
      txnId +
      '", paymentStatus: "' +
      req.query.STATUS +
      '", paymentDateTime: "' +
      date +
      '", responseCode: "' +
      req.query.RESPCODE +
      '", responseMessage: "' +
      req.query.RESPMSG +
      '", orderId: "' +
      req.query.ORDERID +
      '", bankTxnId: "' +
      req.query.BANKTXNID +
      '" }){appointment { id appointment{ id } } }}',
  };
  const fileName = process.env.PHARMA_LOGS_PATH + new Date().toDateString() + '-apptPayments.txt';
  let content =
    new Date().toString() +
    '\n---------------------------\n' +
    'appt id:' +
    req.query.ORDERID +
    '\n' +
    txnId +
    ' - ' +
    req.query.STATUS +
    ' - ' +
    req.query.RESPCODE +
    ' - ' +
    req.query.RESPMSG +
    '\n-------------------\n';
  fs.appendFile(fileName, content, function(err) {
    if (err) throw err;
    console.log('Updated!');
  });
  axios
    .post(process.env.API_URL, requestJSON)
    .then((response) => {
      let content = new Date().toString() + '\n---------------------------\nupdate response:';
      response.data.data.makeAppointmentPayment.appointment.id + '\n-------------------\n';
      fs.appendFile(fileName, content, function(err) {
        if (err) throw err;
        console.log('Updated!');
      });
      console.log(response.data.data.makeAppointmentPayment.appointment.id, 'response is....');
      if (req.query.STATUS == 'TXN_SUCCESS') {
        if (req.session.source == 'WEB') {
          const redirectUrl = `${process.env.PORTAL_URL_APPOINTMENTS}?apptid=${response.data.data.makeAppointmentPayment.appointment.appointment.id}`;
          res.redirect(redirectUrl);
        } else {
          res.redirect(
            `/consultpg-success?tk=${response.data.data.makeAppointmentPayment.appointment.id}&status=${req.query.STATUS}`
          );
        }
      } else {
        if (req.session.source == 'WEB') {
          const redirectUrl = `${process.env.PORTAL_URL_APPOINTMENTS}?status=failed`;
          res.redirect(redirectUrl);
        } else {
          res.redirect(`/consultpg-error?tk=${req.query.ORDERID}&status=${req.query.STATUS}`);
        }
      }
    })
    .catch((error) => {
      console.log('error', error);
    });

  //res.send('payment response');
});

app.get('/consultpg-success', (req, res) => {
  const payloadToken = req.query.tk;
  const reqSource = req.session.source;
  if (payloadToken) {
    res.statusCode = 200;
    res.send({
      status: 'success',
      orderId: payloadToken,
    });
    if (reqSource === 'web') {
      const redirectUrl = `${process.env.NAVIGATE_URL}/success`;
      res.redirect(redirectUrl);
    }
  } else {
    res.statusCode = 401;
    res.send({
      status: 'failed',
      reason: 'Unauthorized',
      code: '800',
    });
  }
});

app.get('/consultpg-error', (req, res) => {
  res.send({
    status: 'failed',
  });
});

app.get('/consultpayment', (req, res) => {
  //res.send('consult payment');
  let source = 'MOBILE';
  if (req.query.source) {
    source = req.query.source;
  }
  axios.defaults.headers.common['authorization'] = 'Bearer 3d1833da7020e0602165529446587434';
  // validate the order and token.
  axios({
    url: process.env.API_URL,
    method: 'post',
    data: {
      query: `
          query {
            getAthsToken(patientId:"${req.query.patientId}") {
              patient {
                id
                emailAddress
                athsToken
                lastName
                firstName
                dateOfBirth
                gender
              }
            }
          }
        `,
    },
  })
    .then((response) => {
      console.log(response, response.data, response.data.data.getAthsToken, 'get patient details');
      if (
        response &&
        response.data &&
        response.data.data &&
        response.data.data.getAthsToken &&
        response.data.data.getAthsToken.patient
      ) {
        const responsePatientId = response.data.data.getAthsToken.patient.id;
        console.log(
          responsePatientId,
          'responsePatientId',
          response.data.data.getAthsToken.patient.athsToken
        );
        if (responsePatientId == '') {
          res.statusCode = 401;
          res.send({
            status: 'failed',
            reason: 'Invalid parameters',
            code: '10000',
          });
        } else {
          axios
            .post(process.env.CONSULT_MERCHANT_URL, {
              AdminId: process.env.CONSULT_MERCHANT_ADMINID,
              AdminPassword: process.env.CONSULT_MERCHANT_ADMINID,
              sourceApp: process.env.CONSULT_SOURCE_APP,
            })
            .then((resp) => {
              console.log(resp.data, resp.data.Result);
              const merchantId = resp.data.result;
              const requestJSON = {
                query:
                  'mutation { updatePaymentOrderId(appointmentId:"' +
                  req.query.appointmentId +
                  '",orderId:"' +
                  resp.data.Result +
                  '",source:"' +
                  source +
                  '"){ status } }',
              };
              axios.post(process.env.API_URL, requestJSON).then((updateResp) => {
                const getAptRequestJson = {
                  query:
                    'query { getAppointmentData(appointmentId:"' +
                    req.query.appointmentId +
                    '"){ appointmentsHistory { discountedAmount paymentOrderId patientInfo { mobileNumber firstName } } } }',
                };
                axios
                  .post(process.env.API_URL, getAptRequestJson)
                  .then((aptResp) => {
                    console.log(
                      aptResp.data.data.getAppointmentData.appointmentsHistory,
                      aptResp.data.data.getAppointmentData.appointmentsHistory[0].discountedAmount,
                      'appoint resp',
                      aptResp.data.data.getAppointmentData.appointmentsHistory[0].patientInfo
                        .mobileNumber
                    );
                    req.session.appointmentId = req.query.appointmentId;
                    req.session.source = source;
                    res.render('consults.ejs', {
                      athsToken: response.data.data.getAthsToken.patient.athsToken,
                      merchantId:
                        aptResp.data.data.getAppointmentData.appointmentsHistory[0].paymentOrderId,
                      price:
                        aptResp.data.data.getAppointmentData.appointmentsHistory[0]
                          .discountedAmount,
                      patientId: req.query.patientId,
                      patientName:
                        aptResp.data.data.getAppointmentData.appointmentsHistory[0].patientInfo
                          .firstName,
                      mobileNumber:
                        aptResp.data.data.getAppointmentData.appointmentsHistory[0].patientInfo
                          .mobileNumber,
                      baseUrl: process.env.APP_BASE_URL,
                      pgUrl: process.env.CONSULT_PG_URL,
                    });
                  })
                  .catch((err) => {
                    console.log(err);
                    res.send(err, 'Appointment id error');
                  });
              });
            })
            .catch((err) => {
              console.log(err);
              res.send(err, 'merchant id error');
            });
        }
      }
    })
    .catch((error) => {
      // no need to explicitly saying details about error for clients.
      // console.log(error);
      res.statusCode = 401;
      return res.send({
        status: 'failed',
        reason: 'Invalid parameters',
        code: '10001',
      });
    });
});

app.get('/paymed', (req, res) => {
  const requestedSources = ['mobile', 'web'];

  req.session.token = stripTags(req.query.token);
  req.session.orderAutoId = stripTags(req.query.oid);
  req.session.patientId = stripTags(req.query.pid);
  req.session.amount = stripTags(req.query.amount);
  req.session.source = stripTags(req.query.source);

  // if there is any invalid source throw error.
  if (requestedSources.indexOf(req.session.source) < 0) {
    // fake source. through error.
    res.statusCode = 401;
    return res.send({
      status: 'failed',
      reason: 'Invalid device',
    });
  }

  axios.defaults.headers.common['authorization'] = req.session.token;

  // validate the order and token.
  axios({
    url: process.env.API_URL,
    method: 'post',
    data: {
      query: `
          query {
            getMedicineOrderDetails(patientId:"${req.session.patientId}", orderAutoId:${req.session.orderAutoId}) {
              MedicineOrderDetails {
                id
                orderAutoId
                estimatedAmount
              }
            }
          }
        `,
    },
  })
    .then((response) => {
      if (
        response &&
        response.data &&
        response.data.data &&
        response.data.data.getMedicineOrderDetails &&
        response.data.data.getMedicineOrderDetails.MedicineOrderDetails
      ) {
        const responseOrderId =
          response.data.data.getMedicineOrderDetails.MedicineOrderDetails.orderAutoId;
        const responseAmount =
          response.data.data.getMedicineOrderDetails.MedicineOrderDetails.estimatedAmount;
        if (responseOrderId !== req.query.orderAutoId || responseAmount !== req.query.amount) {
          res.statusCode = 401;
          res.send({
            status: 'failed',
            reason: 'Invalid parameters',
            code: '10000',
          });
        }
      }
    })
    .catch((error) => {
      // no need to explicitly saying details about error for clients.
      // console.log(error);
      res.statusCode = 401;
      return res.send({
        status: 'failed',
        reason: 'Invalid parameters',
        code: '10001',
      });
    });

  initPayment(req.session.orderAutoId, req.session.amount).then(
    (success) => {
      res.render('paytmRedirect.ejs', {
        resultData: success,
        paytmFinalUrl: process.env.PAYTM_FINAL_URL,
      });
    },
    (error) => {
      // console.log(error);
      return res.send(error);
    }
  );
});

app.post('/paymed-response', (req, res) => {
  const payload = req.body;
  const token = 'Bearer 3d1833da7020e0602165529446587434';
  const date = new Date(new Date().toUTCString()).toISOString();
  //const reqSource = req.session.source;

  /* make success and failure response */
  const transactionStatus = payload.STATUS === 'TXN_SUCCESS' || 'success' ? 'success' : 'failed';
  const responseMessage = payload.RESPMSG;
  const responseCode = payload.RESPCODE;
  const fileName = process.env.PHARMA_LOGS_PATH + new Date().toDateString() + '-pharmaResp.txt';
  let content =
    new Date().toString() +
    '\n---------------------------\n' +
    'pharma order id:' +
    payload.ORDERID +
    '\n' +
    transactionStatus +
    ' - ' +
    responseMessage +
    ' - ' +
    responseCode +
    '\n-------------------\n';
  fs.appendFile(fileName, content, function(err) {
    if (err) throw err;
    console.log('Updated!', payload.ORDERID);
  });
  console.log(process.env.API_URL);
  axios.defaults.headers.common['authorization'] = token;
  axios({
    url: process.env.API_URL,
    method: 'post',
    data: {
      query: `
            query {
              getMedicineOrderDetails(orderAutoId:${payload.ORDERID}) {
                MedicineOrderDetails {
                  id
                  shopId
                  orderAutoId
                  devliveryCharges
                  deliveryType
                  bookingSource
                  currentStatus
                }
              }
            }
          `,
    },
  }).then(async (response) => {
    console.log(response, response.data.errors, 'response');
    if (
      response &&
      response.data &&
      response.data.data &&
      response.data.data.getMedicineOrderDetails &&
      response.data.data.getMedicineOrderDetails.MedicineOrderDetails
    ) {
      console.log(
        response.data.data.getMedicineOrderDetails.MedicineOrderDetails,
        '======order details======='
      );
      const bookingsourcefromDb =
        response.data.data.getMedicineOrderDetails.MedicineOrderDetails.bookingSource;

      let bookingSource = 'mobile';
      if (bookingsourcefromDb) {
        bookingSource = bookingsourcefromDb;
      }
      if (transactionStatus === 'failed') {
        /* never execute a transaction if the payment status is failed */
        if (bookingSource === 'WEB') {
          const redirectUrl = `${process.env.PORTAL_FAILED_URL}/${payload.ORDERID}/${transactionStatus}`;
          res.redirect(redirectUrl);
        } else {
          res.redirect(
            `/mob-error?tk=${token}&status=${transactionStatus}&responseMessage=${responseMessage}&responseCode=${responseCode}`
          );
        }
      }

      /*save response in apollo24x7*/
      axios.defaults.headers.common['authorization'] = token;

      // this needs to be altered later.
      const requestJSON = {
        query:
          'mutation { SaveMedicineOrderPaymentMq(medicinePaymentMqInput: { orderId: "0", orderAutoId: ' +
          payload.ORDERID +
          ', paymentType: CASHLESS, amountPaid: ' +
          payload.TXNAMOUNT +
          ', paymentRefId: "' +
          payload.TXNID +
          '", paymentStatus: "' +
          payload.STATUS +
          '", paymentDateTime: "' +
          date +
          '", responseCode: "' +
          payload.RESPCODE +
          '", responseMessage: "' +
          payload.RESPMSG +
          '", bankTxnId: "' +
          payload.BANKTXNID +
          '" }){ errorCode, errorMessage,orderStatus }}',
      };

      /// write medicineoirder
      axios
        .post(process.env.API_URL, requestJSON)
        .then((response) => {
          console.log(response, 'response is....');
          if (bookingSource === 'WEB') {
            const redirectUrl = `${process.env.PORTAL_URL}/${payload.ORDERID}/${transactionStatus}`;
            res.redirect(redirectUrl);
          } else {
            res.redirect(`/mob?tk=${token}&status=${transactionStatus}`);
          }
        })
        .catch((error) => {
          console.log('error', error);
          if (bookingSource === 'WEB') {
            const redirectUrl = `${process.env.PORTAL_URL}/${payload.ORDERID}/${transactionStatus}`;
            res.redirect(redirectUrl);
          } else {
            res.redirect(`/mob-error?tk=${token}&status=${transactionStatus}`);
          }
        });
    }
  });
});

app.get('/mob', (req, res) => {
  const payloadToken = req.query.tk;
  const sessionToken = req.session.token;
  if (payloadToken === sessionToken) {
    res.statusCode = 200;
    res.send({
      status: 'success',
    });
  } else {
    res.statusCode = 401;
    res.send({
      status: 'failed',
      reason: 'Unauthorized',
      code: '800',
    });
  }
});

app.get('/mob-error', (req, res) => {
  const payloadToken = req.query.tk;
  const sessionToken = req.session.token;
  if (payloadToken === sessionToken) {
    res.statusCode = 200;
    res.send({
      status: 'failed',
    });
  } else {
    res.statusCode = 401;
    res.send({
      status: 'failed',
      reason: 'Unauthorized',
      code: '800',
    });
  }
});

//diagnostic payment apis
app.get('/diagnosticpayment', (req, res) => {
  axios.defaults.headers.common['authorization'] = 'Bearer 3d1833da7020e0602165529446587434';

  if (!req.query.patientId || !req.query.orderId || !req.query.price) {
    res.statusCode = 401;
    return res.send({
      status: 'failed',
      reason: 'Invalid parameters',
      code: '10001',
    });
  }

  console.log('request query params => ', req.query);

  req.session.diagnosticOrderId = stripTags(req.query.orderId);

  console.log('Query API URL: ', process.env.API_URL);

  // validate the order and token.
  axios({
    url: process.env.API_URL,
    method: 'post',
    data: {
      query: `
          query {
            getPatientById(patientId:"${req.query.patientId}") {
              patient {
                id
                emailAddress
                firstName
                lastName
                dateOfBirth
                gender
                athsToken
                mobileNumber
              }
            }
          }
        `,
    },
  })
    .then((response) => {
      console.log('graphQL response', response);
      if (
        response &&
        response.data &&
        response.data.data &&
        response.data.data.getPatientById &&
        response.data.data.getPatientById.patient
      ) {
        const responsePatientId = response.data.data.getPatientById.patient.id;
        console.log('responsePatientId', response.data.data.getPatientById.patient);
        if (responsePatientId == '') {
          res.statusCode = 401;
          res.send({
            status: 'failed',
            reason: 'Invalid parameters',
            code: '10000',
          });
        } else {
          req.session.orderId = req.query.orderId;
          const {
            emailAddress,
            mobileNumber,
            firstName,
            lastName,
          } = response.data.data.getPatientById.patient;

          const code = `gtKFFx|APL-${req.query.orderId}|${parseFloat(
            req.query.price
          )}|APOLLO247|${firstName}|${emailAddress}|||||||||||eCwWELxi`;

          const hash = crypto
            .createHash('sha512')
            .update(code)
            .digest('hex');

          console.log('paymentCode==>', code);
          console.log('paymentHash==>', hash);

          console.log('rendering==> diagnosticsPayment.ejs');
          res.render('diagnosticsPayment.ejs', {
            athsToken: response.data.data.getPatientById.patient.athsToken,
            orderId: req.query.orderId,
            totalPrice: parseFloat(req.query.price),
            patientId: req.query.patientId,
            firstName,
            lastName,
            emailAddress,
            mobileNumber,
            hash,
            //baseUrl: 'http://localhost:7000',
            baseUrl: 'https://aph.dev.pmt.popcornapps.com',
          });
        }
      }
    })
    .catch((error) => {
      // no need to explicitly saying details about error for clients.
      console.log('error', error);
      res.statusCode = 401;
      return res.send({
        status: 'failed',
        reason: 'Invalid parameters',
        code: '10001',
      });
    });
});

app.post('/diagnostic-pg-success-url', (req, res) => {
  console.log('diagnostisPaymentSuccess=>', req.body);
  const paymentStatus = req.body.status;
  const mihpayid = req.body.mihpayid;
  saveDiagnosticOrderPaymentResponse(req, (status) => {
    console.log(status);
    if (paymentStatus == 'success') {
      res.redirect(`/diagnostic-pg-success?tk=${mihpayid}&status=${paymentStatus}`);
    } else {
      res.redirect(`/diagnostic-pg-error?tk=${mihpayid}&status=${paymentStatus}`);
    }
  });
});

const saveDiagnosticOrderPaymentResponse = (req, callback) => {
  const paymentResponse = req.body;
  console.log('session', req.session);
  const paymentDate = new Date(new Date(paymentResponse.addedon).toUTCString()).toISOString();
  console.log('paymentResponse=>', paymentResponse);
  console.log(paymentDate);

  const requestJSON = {
    query:
      'mutation { saveDiagnosticOrderPayment(diagnosticPaymentInput: { diagnosticOrderId: "' +
      req.session.diagnosticOrderId +
      '", amountPaid: ' +
      paymentResponse.amount +
      ', bankRefNum: "' +
      paymentResponse.bank_ref_num +
      '", errorCode: "' +
      paymentResponse.error +
      '", errorMessage: "' +
      paymentResponse.error_Message +
      '", mihpayid: "' +
      paymentResponse.mihpayid +
      '", netAmountDebit: "' +
      paymentResponse.net_amount_debit +
      '", paymentDateTime: "' +
      paymentDate +
      '", paymentStatus: "' +
      paymentResponse.status +
      '", txnId: "' +
      paymentResponse.txnid +
      '", hash: "' +
      paymentResponse.hash +
      '", paymentSource: "' +
      paymentResponse.payment_source +
      '", discount: "' +
      paymentResponse.discount +
      '", bankCode: "' +
      paymentResponse.bankcode +
      '", issuingBank: "' +
      paymentResponse.issuing_bank +
      '", cardType: "' +
      paymentResponse.card_type +
      '", mode: "' +
      paymentResponse.mode +
      '" }){status}}',
  };

  axios
    .post(process.env.API_URL, requestJSON)
    .then((response) => {
      console.log('save diagnosticPayment response....', JSON.stringify(response.data));
      callback(true);
    })
    .catch((error) => {
      console.log('save diagnosticPayment error', error);
    });
};

app.post('/diagnostic-pg-error-url', (req, res) => {
  console.log('diagnostisPaymentErrorResponse=>', req.body);
  const paymentStatus = req.body.status;
  const mihpayid = req.body.mihpayid;
  saveDiagnosticOrderPaymentResponse(req, (status) => {
    console.log('response from payment save', status);
    res.redirect(`/diagnostic-pg-error?tk=${mihpayid}&status=${paymentStatus}`);
  });
});

app.post('/diagnostic-pg-cancel-url', (req, res) => {
  console.log('diagnostisPaymentCancelResponse', req.body, req);
  res.send({
    status: 'failed',
  });
});

app.get('/diagnostic-pg-success', (req, res) => {
  const payloadToken = req.query.tk;
  if (payloadToken) {
    res.statusCode = 200;
    res.send({
      status: 'success',
      orderId: payloadToken,
    });
  } else {
    res.statusCode = 401;
    res.send({
      status: 'failed',
      reason: 'Unauthorized',
      code: '800',
    });
  }
});

app.get('/diagnostic-pg-error', (req, res) => {
  res.send({
    status: 'failed',
  });
});

app.get('/processOrders', (req, res) => {
  let deliveryCity = 'Kakinada',
    deliveryZipcode = '500045',
    deliveryAddress = 'Kakinada';
  function getAddressDetails(addressId) {
    return new Promise(async (resolve, reject) => {
      axios({
        url: process.env.API_URL,
        method: 'post',
        data: {
          query: `
        query {
          getPatientAddressById(id:"${addressId}") {
            patientAddress{
                id
                city
                state
                zipcode
                addressLine1
                addressLine2
                landmark
              }
          }
        }
      `,
        },
      })
        .then((response) => {
          deliveryCity = response.data.data.getPatientAddressById.patientAddress.city;
          deliveryZipcode = response.data.data.getPatientAddressById.patientAddress.zipcode;
          deliveryAddress =
            response.data.data.getPatientAddressById.patientAddress.addressLine1 +
            ' ' +
            response.data.data.getPatientAddressById.patientAddress.addressLine2;
          console.log(
            response,
            response.data.data.getPatientAddressById.patientAddress.state,
            'address resp'
          );
          resolve(deliveryAddress);
        })
        .catch((error) => {
          console.log(error, 'address error');
        });
    });
  }
  let queueMessage = '';
  const serviceBusConnectionString = process.env.AZURE_SERVICE_BUS_CONNECTION_STRING;
  const azureServiceBus = azure.createServiceBusService(serviceBusConnectionString);
  azureServiceBus.receiveSubscriptionMessage(
    process.env.AZURE_SERVICE_BUS_QUEUE_NAME,
    process.env.AZURE_SERVICE_BUS_SUBSCRIBER,
    { isPeekLock: false },
    (subscriptionError, result) => {
      if (subscriptionError) {
        console.log('read error', subscriptionError);
        res.send({
          status: 'failed',
          reason: subscriptionError,
          code: '10001',
        });
      } else {
        console.log('message from topic', result.body);
        queueMessage = result.body;
        const queueDetails = queueMessage.split(':');
        axios.defaults.headers.common['authorization'] = 'Bearer 3d1833da7020e0602165529446587434';
        console.log(queueDetails, 'order details');
        axios({
          url: process.env.API_URL,
          method: 'post',
          data: {
            query: `
            query {
              getMedicineOrderDetails(patientId:"${queueDetails[2]}", orderAutoId:${queueDetails[1]}) {
                MedicineOrderDetails {
                  id
                  shopId
                  orderAutoId
                  estimatedAmount
                  pharmaRequest
                  devliveryCharges
                  deliveryType
                  patientAddressId
                  prescriptionImageUrl
                  orderType
                  currentStatus
                  patient{
                    mobileNumber
                    firstName
                    lastName
                    emailAddress
                    dateOfBirth
                  }
                  medicineOrderLineItems{
                    medicineSKU
                    medicineName
                    mrp
                    mou
                    price
                    quantity        
                    isMedicine
                  }
                  medicineOrderPayments{
                    id
                    bankTxnId
                    paymentType
                    amountPaid
                    paymentRefId
                    paymentStatus
                  }
                }
              }
            }
          `,
          },
        })
          .then(async (response) => {
            if (
              response &&
              response.data &&
              response.data.data &&
              response.data.data.getMedicineOrderDetails &&
              response.data.data.getMedicineOrderDetails.MedicineOrderDetails
            ) {
              if (
                response.data.data.getMedicineOrderDetails.MedicineOrderDetails.currentStatus !=
                'CANCELLED'
              ) {
                if (
                  response.data.data.getMedicineOrderDetails.MedicineOrderDetails
                    .patientAddressId != '' &&
                  response.data.data.getMedicineOrderDetails.MedicineOrderDetails
                    .patientAddressId != null
                ) {
                  await getAddressDetails(
                    response.data.data.getMedicineOrderDetails.MedicineOrderDetails.patientAddressId
                  );
                }
                const responseOrderId =
                  response.data.data.getMedicineOrderDetails.MedicineOrderDetails.orderAutoId;
                const responseAmount =
                  response.data.data.getMedicineOrderDetails.MedicineOrderDetails.pharmaRequest;
                const orderLineItems = [];
                const orderPrescriptionUrl = [];
                let fmcgCount = 0,
                  pharmaCount = 0;
                let orderType = 'FMCG';
                response.data.data.getMedicineOrderDetails.MedicineOrderDetails.medicineOrderLineItems.map(
                  (item) => {
                    const lineItem = {
                      ItemID: item.medicineSKU,
                      ItemName: item.medicineName,
                      Qty: item.quantity * item.mou,
                      Pack: item.quantity,
                      MOU: item.mou,
                      Price: item.price,
                      Status: true,
                    };
                    console.log(item.isMedicine, item.medicineSKU, 'is medicine');
                    if (item.isMedicine == '0') fmcgCount++;
                    else pharmaCount++;
                    orderLineItems.push(lineItem);
                  }
                );
                if (fmcgCount > 0 && pharmaCount > 0) orderType = 'Both';
                else if (fmcgCount > 0 && pharmaCount == 0) orderType = 'FMCG';
                else orderType = 'Pharma';
                //logic to add delivery charges line item starts here
                const orderDetails =
                  response.data.data.getMedicineOrderDetails.MedicineOrderDetails;
                if (orderDetails.orderType == 'CART_ORDER') {
                  const amountPaid = orderDetails.deliveryCharges;
                  if (amountPaid > 0) {
                    orderLineItems.push(getDeliveryChargesLineItem());
                  }
                }
                //console.log('orderLineItems-------', orderLineItems);
                //logic to add delivery charges line item ends here

                let prescriptionImages = [];

                if (
                  response.data.data.getMedicineOrderDetails.MedicineOrderDetails
                    .prescriptionImageUrl != '' &&
                  response.data.data.getMedicineOrderDetails.MedicineOrderDetails
                    .prescriptionImageUrl != null
                ) {
                  prescriptionImages = response.data.data.getMedicineOrderDetails.MedicineOrderDetails.prescriptionImageUrl.split(
                    ','
                  );
                }
                if (prescriptionImages.length > 0) {
                  prescriptionImages.map((imageUrl) => {
                    const url = {
                      url: imageUrl,
                    };
                    orderPrescriptionUrl.push(url);
                  });
                }
                let payStatus =
                  response.data.data.getMedicineOrderDetails.MedicineOrderDetails
                    .medicineOrderPayments[0].paymentStatus;
                if (
                  response.data.data.getMedicineOrderDetails.MedicineOrderDetails
                    .medicineOrderPayments[0].paymentType == 'COD'
                ) {
                  payStatus = '';
                }
                //axios.defaults.headers.common['token'] = '9f15bdd0fcd5423190c2e877ba0228A24';
                let patientAge = 30;
                let selShopId = '16001';
                if (
                  response.data.data.getMedicineOrderDetails.MedicineOrderDetails.shopId != '' &&
                  response.data.data.getMedicineOrderDetails.MedicineOrderDetails.shopId != null
                ) {
                  selShopId =
                    response.data.data.getMedicineOrderDetails.MedicineOrderDetails.shopId;
                }
                const pharmaInput = {
                  tpdetails: {
                    OrderId:
                      response.data.data.getMedicineOrderDetails.MedicineOrderDetails.orderAutoId,
                    ShopId: selShopId,
                    ShippingMethod:
                      response.data.data.getMedicineOrderDetails.MedicineOrderDetails.deliveryType,
                    RequestType: 'CART',
                    PaymentMethod:
                      response.data.data.getMedicineOrderDetails.MedicineOrderDetails
                        .medicineOrderPayments[0].paymentType,
                    VendorName: '*****',
                    DotorName: 'Apollo',
                    OrderType: orderType,
                    StateCode: 'TS',
                    TAT: null,
                    CouponCode: 'MED10',
                    OrderDate: new Date(),
                    CustomerDetails: {
                      MobileNo: response.data.data.getMedicineOrderDetails.MedicineOrderDetails.patient.mobileNumber.substr(
                        3
                      ),
                      Comm_addr: deliveryAddress,
                      Del_addr: deliveryAddress,
                      FirstName:
                        response.data.data.getMedicineOrderDetails.MedicineOrderDetails.patient
                          .firstName,
                      LastName:
                        response.data.data.getMedicineOrderDetails.MedicineOrderDetails.patient
                          .lastName,
                      City: deliveryCity,
                      PostCode: deliveryZipcode,
                      MailId: '',
                      Age: patientAge,
                      CardNo: null,
                      PatientName:
                        response.data.data.getMedicineOrderDetails.MedicineOrderDetails.patient
                          .firstName,
                    },
                    PaymentDetails: {
                      TotalAmount:
                        response.data.data.getMedicineOrderDetails.MedicineOrderDetails
                          .medicineOrderPayments[0].amountPaid,
                      PaymentSource:
                        response.data.data.getMedicineOrderDetails.MedicineOrderDetails
                          .medicineOrderPayments[0].paymentType,
                      PaymentStatus: payStatus,
                      PaymentOrderId:
                        response.data.data.getMedicineOrderDetails.MedicineOrderDetails
                          .medicineOrderPayments[0].paymentRefId,
                    },
                    ItemDetails: orderLineItems,
                    PrescUrl: orderPrescriptionUrl,
                  },
                };
                console.log('pharmaInput==========>', pharmaInput, '<===============pharmaInput');
                const fileName =
                  process.env.PHARMA_LOGS_PATH + new Date().toDateString() + '-pharmaLogs.txt';
                let content =
                  new Date().toString() +
                  '\n---------------------------\n' +
                  JSON.stringify(pharmaInput) +
                  '\n-------------------\n';
                fs.appendFile(fileName, content, function(err) {
                  if (err) throw err;
                  console.log('Updated!');
                });
                axios
                  .post(process.env.PHARMA_ORDER_PLACE_URL, JSON.stringify(pharmaInput), {
                    headers: {
                      token: process.env.PHARMA_TOKEN,
                      'Content-Type': 'application/json',
                    },
                  })
                  .then((resp) => {
                    console.log('pharma resp', resp, resp.data.ordersResult);
                    //const orderData = JSON.parse(resp.data);
                    content = resp.data.ordersResult + '\n==================================\n';
                    fs.appendFile(fileName, content, function(err) {
                      if (err) throw err;
                      console.log('Updated!');
                    });
                    //console.log(orderData, 'order data');
                    if (resp.data.ordersResult.Status == true) {
                      const requestJSON = {
                        query:
                          'mutation { saveOrderPlacedStatus(orderPlacedInput: { orderAutoId: ' +
                          queueDetails[1] +
                          ' }){ message }}',
                      };

                      console.log(requestJSON, 'reqest json');
                      axios
                        .post(process.env.API_URL, requestJSON)
                        .then((placedResponse) => {
                          console.log(placedResponse, 'placed respose');
                          azureServiceBus.deleteMessage(result, (deleteError) => {
                            if (deleteError) {
                              console.log('delete error', deleteError);
                            }
                            console.log('message deleted');
                          });
                        })
                        .catch((placedError) => {
                          console.log(placedError, 'placed error');
                          azureServiceBus.deleteMessage(result, (deleteError) => {
                            if (deleteError) {
                              console.log('delete error', deleteError);
                            }
                            console.log('message deleted');
                          });
                        });
                    }
                    res.send({
                      status: 'success',
                      reason: '',
                      code: responseOrderId + ', ' + responseAmount,
                    });
                  })
                  .catch((pharmaerror) => {
                    console.log('pharma error', pharmaerror);
                    res.send({
                      status: 'Failed',
                      reason: '',
                      code: responseOrderId + ', ' + responseAmount,
                    });
                  });
              }
            }
          })
          .catch((error) => {
            // no need to explicitly saying details about error for clients.
            console.log(error);
            //res.statusCode = 401;
            return res.send({
              status: 'failed',
              reason: 'Invalid parameters',
              code: '10001',
            });
          });
      }
    }
  );
});

app.get('/processOrderById', (req, res) => {
  let deliveryCity = 'Kakinada',
    deliveryZipcode = '500045',
    deliveryAddress = 'Kakinada';
  const patientId = req.query.patientId;
  const orderId = req.query.orderId;
  function getAddressDetails(addressId) {
    return new Promise(async (resolve, reject) => {
      axios({
        url: process.env.API_URL,
        method: 'post',
        data: {
          query: `
        query {
          getPatientAddressById(id:"${addressId}") {
            patientAddress{
                id
                city
                state
                zipcode
                addressLine1
                addressLine2
                landmark
              }
          }
        }
      `,
        },
      })
        .then((response) => {
          console.log('response________________', response);
          deliveryCity = response.data.data.getPatientAddressById.patientAddress.city;
          deliveryZipcode = response.data.data.getPatientAddressById.patientAddress.zipcode;
          deliveryAddress =
            response.data.data.getPatientAddressById.patientAddress.addressLine1 +
            ' ' +
            response.data.data.getPatientAddressById.patientAddress.addressLine2;
          console.log(
            response,
            response.data.data.getPatientAddressById.patientAddress.state,
            'address resp'
          );
          resolve(deliveryAddress);
        })
        .catch((error) => {
          console.log(error, 'address error');
        });
    });
  }

  axios.defaults.headers.common['authorization'] = 'Bearer 3d1833da7020e0602165529446587434';
  axios({
    url: process.env.API_URL,
    method: 'post',
    data: {
      query: `
            query {
              getMedicineOrderDetails(patientId:"${patientId}", orderAutoId:${orderId}) {
                MedicineOrderDetails {
                  id
                  shopId
                  orderAutoId
                  estimatedAmount
                  pharmaRequest
                  devliveryCharges
                  deliveryType
                  patientAddressId
                  prescriptionImageUrl
                  orderType
                  currentStatus
                  patient{
                    mobileNumber
                    firstName
                    lastName
                    emailAddress
                    dateOfBirth
                  }
                  medicineOrderLineItems{
                    medicineSKU
                    medicineName
                    mrp
                    mou
                    price
                    quantity        
                  }
                  medicineOrderPayments{
                    id
                    bankTxnId
                    paymentType
                    amountPaid
                    paymentRefId
                    paymentStatus
                  }
                }
              }
            }
          `,
    },
  })
    .then(async (response) => {
      if (
        response &&
        response.data &&
        response.data.data &&
        response.data.data.getMedicineOrderDetails &&
        response.data.data.getMedicineOrderDetails.MedicineOrderDetails
      ) {
        console.log(
          response.data.data.getMedicineOrderDetails.MedicineOrderDetails.currentStatus,
          'order details233'
        );
        if (
          response.data.data.getMedicineOrderDetails.MedicineOrderDetails.currentStatus !=
          'CANCELLED'
        ) {
          if (
            response.data.data.getMedicineOrderDetails.MedicineOrderDetails.patientAddressId !=
              '' &&
            response.data.data.getMedicineOrderDetails.MedicineOrderDetails.patientAddressId != null
          ) {
            await getAddressDetails(
              response.data.data.getMedicineOrderDetails.MedicineOrderDetails.patientAddressId
            );
          }
          const responseOrderId =
            response.data.data.getMedicineOrderDetails.MedicineOrderDetails.orderAutoId;
          const responseAmount =
            response.data.data.getMedicineOrderDetails.MedicineOrderDetails.pharmaRequest;
          const orderLineItems = [];
          const orderPrescriptionUrl = [];
          let requestType = 'NONCART';

          const orderDetails = response.data.data.getMedicineOrderDetails.MedicineOrderDetails;
          if (orderDetails.orderType == 'CART_ORDER') {
            requestType = 'CART';

            orderDetails.medicineOrderLineItems.map((item) => {
              const lineItem = {
                ItemID: item.medicineSKU,
                ItemName: item.medicineName,
                Qty: item.quantity * item.mou,
                Pack: item.quantity,
                MOU: item.mou,
                Price: item.price,
                Status: true,
              };
              orderLineItems.push(lineItem);
            });

            //logic to add delivery charges lineItem starts here
            const amountPaid = orderDetails.deliveryCharges;
            console.log('AmtPaid===', amountPaid);
            //console.log('isDeliveryChargeable===', isDeliveryChargeApplicable(amountPaid));
            if (amountPaid > 0) {
              //console.log('inside if===');
              orderLineItems.push(getDeliveryChargesLineItem());
            }
            //console.log('orderLineItems------', orderLineItems);
            //logic to add delivery charges lineItem ends here
          }
          //console.log('orderLineItems======', orderLineItems);
          //logic to add delivery charges lineItem ends here
        }
        let prescriptionImages = [];
        let orderType = 'FMCG';
        if (
          response.data.data.getMedicineOrderDetails.MedicineOrderDetails.prescriptionImageUrl !=
            '' &&
          response.data.data.getMedicineOrderDetails.MedicineOrderDetails.prescriptionImageUrl !=
            null
        ) {
          prescriptionImages = response.data.data.getMedicineOrderDetails.MedicineOrderDetails.prescriptionImageUrl.split(
            ','
          );
          orderType = 'Pharma';
        }
        if (prescriptionImages.length > 0) {
          orderType = 'Pharma';
          prescriptionImages.map((imageUrl) => {
            const url = {
              url: imageUrl,
            };
            orderPrescriptionUrl.push(url);
          });
        }
        let paymentDets = {};
        let paymentMethod = 'COD';
        let payStatus = '';
        if (
          response.data.data.getMedicineOrderDetails.MedicineOrderDetails.orderType == 'CART_ORDER'
        ) {
          payStatus =
            response.data.data.getMedicineOrderDetails.MedicineOrderDetails.medicineOrderPayments[0]
              .paymentStatus;
          paymentMethod =
            response.data.data.getMedicineOrderDetails.MedicineOrderDetails.medicineOrderPayments[0]
              .paymentType;
          if (
            response.data.data.getMedicineOrderDetails.MedicineOrderDetails.prescriptionImageUrl !=
              '' &&
            response.data.data.getMedicineOrderDetails.MedicineOrderDetails.prescriptionImageUrl !=
              null
          ) {
            prescriptionImages = response.data.data.getMedicineOrderDetails.MedicineOrderDetails.prescriptionImageUrl.split(
              ','
            );
            orderType = 'Pharma';
          }
          if (prescriptionImages.length > 0) {
            orderType = 'Pharma';
            prescriptionImages.map((imageUrl) => {
              const url = {
                url: imageUrl,
              };
              orderPrescriptionUrl.push(url);
            });
          }
          let paymentDets = {};
          let paymentMethod = 'COD';
          let payStatus = '';
          if (
            response.data.data.getMedicineOrderDetails.MedicineOrderDetails.orderType ==
            'CART_ORDER'
          ) {
            payStatus =
              response.data.data.getMedicineOrderDetails.MedicineOrderDetails
                .medicineOrderPayments[0].paymentStatus;
            paymentMethod =
              response.data.data.getMedicineOrderDetails.MedicineOrderDetails
                .medicineOrderPayments[0].paymentType;
            if (
              response.data.data.getMedicineOrderDetails.MedicineOrderDetails
                .medicineOrderPayments[0].paymentType == 'COD'
            ) {
              payStatus = '';
            }
            paymentDets = {
              TotalAmount:
                response.data.data.getMedicineOrderDetails.MedicineOrderDetails
                  .medicineOrderPayments[0].amountPaid,
              PaymentSource:
                response.data.data.getMedicineOrderDetails.MedicineOrderDetails
                  .medicineOrderPayments[0].paymentType,
              PaymentStatus: payStatus,
              PaymentOrderId:
                response.data.data.getMedicineOrderDetails.MedicineOrderDetails
                  .medicineOrderPayments[0].paymentRefId,
            };
          }

          //axios.defaults.headers.common['token'] = '9f15bdd0fcd5423190c2e877ba0228A24';
          let patientAge = 30;
          let selShopId = '16001';
          if (
            response.data.data.getMedicineOrderDetails.MedicineOrderDetails.shopId != '' &&
            response.data.data.getMedicineOrderDetails.MedicineOrderDetails.shopId != null
          ) {
            selShopId = response.data.data.getMedicineOrderDetails.MedicineOrderDetails.shopId;
          }

          const pharmaInput = {
            tpdetails: {
              OrderId: response.data.data.getMedicineOrderDetails.MedicineOrderDetails.orderAutoId,
              ShopId: selShopId,
              ShippingMethod:
                response.data.data.getMedicineOrderDetails.MedicineOrderDetails.deliveryType,
              RequestType: requestType,
              PaymentMethod: paymentMethod,
              VendorName: '*****',
              DotorName: 'Apollo',
              OrderType: orderType,
              StateCode: 'TS',
              TAT: null,
              CouponCode: 'MED10',
              OrderDate: new Date(),
              CustomerDetails: {
                MobileNo: response.data.data.getMedicineOrderDetails.MedicineOrderDetails.patient.mobileNumber.substr(
                  3
                ),
                Comm_addr: deliveryAddress,
                Del_addr: deliveryAddress,
                FirstName:
                  response.data.data.getMedicineOrderDetails.MedicineOrderDetails.patient.firstName,
                LastName:
                  response.data.data.getMedicineOrderDetails.MedicineOrderDetails.patient.lastName,
                City: deliveryCity,
                PostCode: deliveryZipcode,
                MailId: '',
                Age: patientAge,
                CardNo: null,
                PatientName:
                  response.data.data.getMedicineOrderDetails.MedicineOrderDetails.patient.firstName,
              },
              PaymentDetails: paymentDets,
              ItemDetails: orderLineItems,
              PrescUrl: orderPrescriptionUrl,
            },
          };
          console.log(
            'pharmaInput ------------->',
            JSON.stringify(pharmaInput),
            '<--------------pharmaInput'
          );
          const fileName =
            process.env.PHARMA_LOGS_PATH + new Date().toDateString() + '-pharmaLogs.txt';
          let content =
            new Date().toString() +
            '\n---------------------------\n' +
            JSON.stringify(pharmaInput) +
            '\n-------------------\n';
          fs.appendFile(fileName, content, function(err) {
            if (err) throw err;
            console.log('Updated!');
          });
          axios
            .post(process.env.PHARMA_ORDER_PLACE_URL, JSON.stringify(pharmaInput), {
              headers: {
                token: process.env.PHARMA_TOKEN,
                'Content-Type': 'application/json',
              },
            })
            .then((resp) => {
              console.log('pharma resp', resp, resp.data.ordersResult);
              //const orderData = JSON.parse(resp.data);
              content = resp.data.ordersResult + '\n==================================\n';
              fs.appendFile(fileName, content, function(err) {
                if (err) throw err;
                console.log('Updated!');
              });
              //console.log(orderData, 'order data');
              if (resp.data.ordersResult.Status == true) {
                const requestJSON = {
                  query:
                    'mutation { saveOrderPlacedStatus(orderPlacedInput: { orderAutoId: ' +
                    orderId +
                    ' }){ message }}',
                };

                console.log(requestJSON, 'reqest json');
                axios
                  .post(process.env.API_URL, requestJSON)
                  .then((placedResponse) => {
                    console.log(placedResponse, 'placed respose');
                  })
                  .catch((placedError) => {
                    console.log(placedError, 'placed error');
                  });
              }
              res.send({
                status: 'success',
                reason: '',
                code: responseOrderId + ', ' + responseAmount,
              });
            })
            .catch((pharmaerror) => {
              console.log('pharma error', pharmaerror);
              res.send({
                status: 'Failed',
                reason: '',
                code: responseOrderId + ', ' + responseAmount,
              });
            });
        }
      }
    })
    .catch((error) => {
      // no need to explicitly saying details about error for clients.
      console.log(error);
      //res.statusCode = 401;
      return res.send({
        status: 'failed',
        reason: 'Invalid parameters',
        code: '10001',
      });
    });
});

const isDeliveryChargeApplicable = (totalAmountPaid) => {
  if (totalAmountPaid === null || totalAmountPaid === '' || isNaN(totalAmountPaid)) {
    totalAmountPaid = 0;
  }

  //return parseFloat(totalAmountPaid) - 25 < 200 ? true : false;
  return parseFloat(totalAmountPaid) < 300 ? true : false;
};

//returns constant response object
const getDeliveryChargesLineItem = () => {
  return {
    ItemID: 'ESH0002',
    ItemName: 'E SHOP SHIPPING CHARGE',
    Qty: 2, //Pack* MOU
    Pack: 1,
    MOU: 1,
    Price: 25.0,
    Status: true,
  };
};

//prism queue
app.get('/getPrismData', (req, res) => {
  let queueMessage = '';
  const serviceBusConnectionString = process.env.AZURE_SERVICE_BUS_CONNECTION_STRING;
  const azureServiceBus = azure.createServiceBusService(serviceBusConnectionString);
  console.log(
    'AZURE_SERVICE_BUS_SUBSCRIBER_PATIENTS::',
    process.env.AZURE_SERVICE_BUS_SUBSCRIBER_PATIENTS
  );
  azureServiceBus.receiveSubscriptionMessage(
    process.env.AZURE_SERVICE_BUS_QUEUE_NAME_PATIENTS,
    process.env.AZURE_SERVICE_BUS_SUBSCRIBER_PATIENTS,
    { isPeekLock: false },
    (subscriptionError, result) => {
      if (subscriptionError) {
        console.log('read error getPrismData', subscriptionError);
        res.send({
          status: 'failed',
          reason: subscriptionError,
          code: '10001',
        });
      } else {
        console.log('message from topic getPrismData', result.body);
        queueMessage = result.body;
        const queueDetails = queueMessage.split(':');
        axios.defaults.headers.common['authorization'] = 'Bearer 3d1833da7020e0602165529446587434';
        console.log(queueDetails, ':Pism get patient details');
        axios({
          url: process.env.API_URL,
          method: 'post',
          data: {
            query: `
            mutation {
              registerPatientsFromPrism(mobileNumber:"${queueDetails[1]}") {
                patients {
                  id                  
                    mobileNumber
                    firstName
                    lastName
                    emailAddress
                    dateOfBirth                  
                }
              }
            }
          `,
          },
        })
          .then(async (response) => {
            if (response) {
              console.log(response, '======prism response=======');
            }
          })
          .catch((error) => {
            // no need to explicitly saying details about error for clients.
            console.log('======prism error response=======', error);
          });
      }
    }
  );
});

app.listen(PORT, () => {
  console.log('Running on ' + PORT);
});
