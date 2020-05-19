const express = require('express');
const bodyParser = require('body-parser');
const Constants = require('./Constants');
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
const { parseISO, format, differenceInYears, addMinutes } = require('date-fns');
const logger = require('./winston-logger')('Universal-Error-Logs');
const {
  paymedRequest,
  paymedResponse,
  mob,
  mobError,
  pharmaWebhook,
} = require('./pharma-integrations/controllers');

const {
  consultPayRequest,
  consultPayResponse,
  consultsPgSuccess,
  consultsPgError,
  consultWebhook,
} = require('./consult-integrations/controllers');

const listOfPaymentMethods = require('./consult-integrations/helpers/list-of-payment-method');

const { getAddressDetails } = require('./commons/getAddressDetails');
const { getMedicineOrderQuery } = require('./pharma-integrations/helpers/medicine-order-query');

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

app.get('/invokeArchiveMessages', cronTabs.archiveMessages);
app.get('/invokesendUnreadMessagesNotification', cronTabs.sendUnreadMessagesNotification);
app.get('/invokeAutoSubmitJDCasesheet', cronTabs.autoSubmitJDCasesheet);
app.get('/invokeNoShowReminder', cronTabs.noShowReminder);
app.get('/invokeNoShowReminder30Min', cronTabs.noShowReminder30Min);
app.get('/invokeFollowUpNotification', cronTabs.FollowUpNotification);
app.get('/invokeApptReminder', cronTabs.ApptReminder);
app.get('/invokeDailyAppointmentSummary', cronTabs.DailyAppointmentSummary);
app.get('/invokePhysicalApptReminder', cronTabs.PhysicalApptReminder);
app.get('/updateSdSummary', cronTabs.updateSdSummary);
app.get('/updateJdSummary', cronTabs.updateJdSummary);
app.get('/updateDoctorFeeSummary', cronTabs.updateDoctorFeeSummary);
app.get('/updateDoctorSlotsEs', cronTabs.updateDoctorSlotsEs);
app.get('/invokeDashboardSummaries', (req, res) => {
  const currentDate = format(new Date(), 'yyyy-MM-dd');

  const updateSpecialtyCountRequestJSON = {
    query: `mutation{
      updateSpecialtyCount(specialityId:"0"){
        updated
      }
    }`,
  };
  const updateUtilizationCapacityRequestJSON = {
    query: `mutation{
      updateUtilizationCapacity(specialityId:"0"){
        updated
      }
    }`,
  };
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
  axios.defaults.headers.common['authorization'] = process.env.API_TOKEN;
  //updateUtilizationCapacity api call
  axios
    .post(process.env.API_URL, updateUtilizationCapacityRequestJSON)
    .then((response) => {
      console.log(response.data.data.updateUtilizationCapacity, 'Summary response is....');
      const fileName =
        process.env.PHARMA_LOGS_PATH + new Date().toDateString() + '-dashboardSummary.txt';
      let content =
        new Date().toString() +
        '\n---------------------------\n' +
        '\nupdateUtilizationCapacity Response\n' +
        JSON.stringify(response.data.data.updateUtilizationCapacity) +
        '\n-------------------\n';
      fs.appendFile(fileName, content, function (err) {
        if (err) throw err;
        console.log('Updated!');
      });
    })
    .catch((error) => {
      console.log('error', error);
    });
  //updateSpecilaityCount api call
  axios
    .post(process.env.API_URL, updateSpecialtyCountRequestJSON)
    .then((response) => {
      console.log(response.data.data.updateSpecialtyCount, 'Summary response is....');
      const fileName =
        process.env.PHARMA_LOGS_PATH + new Date().toDateString() + '-dashboardSummary.txt';
      let content =
        new Date().toString() +
        '\n---------------------------\n' +
        '\nupdateSpecialtyCount Response\n' +
        JSON.stringify(response.data.data.updateSpecialtyCount) +
        '\n-------------------\n';
      fs.appendFile(fileName, content, function (err) {
        if (err) throw err;
        console.log('Updated!');
      });
    })
    .catch((error) => {
      console.log('error', error);
    });
  //updatePhrDocSummary api call
  axios
    .post(process.env.API_URL, updatePhrDocSummaryRequestJSON)
    .then((response) => {
      console.log(response.data.data.updatePhrDocSummary, 'Summary response is....');
      const fileName =
        process.env.PHARMA_LOGS_PATH + new Date().toDateString() + '-dashboardSummary.txt';
      let content =
        new Date().toString() +
        '\n---------------------------\n' +
        '\nupdatePhrDocSummary Response\n' +
        JSON.stringify(response.data.data.updatePhrDocSummary) +
        '\n-------------------\n';
      fs.appendFile(fileName, content, function (err) {
        if (err) throw err;
        console.log('Updated!');
      });
    })
    .catch((error) => {
      console.log('error', error);
    });

  //getAvailableDoctorsCount api call
  axios
    .post(process.env.API_URL, getAvailableDoctorsCountRequestJSON)
    .then((response) => {
      console.log(response.data.data.getAvailableDoctorsCount, 'Summary response is....');
      const fileName =
        process.env.PHARMA_LOGS_PATH + new Date().toDateString() + '-dashboardSummary.txt';
      let content =
        new Date().toString() +
        '\n---------------------------\n' +
        '\ngetAvailableDoctorsCount Response\n' +
        JSON.stringify(response.data.data.getAvailableDoctorsCount) +
        '\n-------------------\n';
      fs.appendFile(fileName, content, function (err) {
        if (err) throw err;
        console.log('Updated!');
      });
    })
    .catch((error) => {
      console.log('error', error);
    });

  //updateConsultRating api call
  axios
    .post(process.env.API_URL, updateConsultRatingRequestJSON)
    .then((response) => {
      console.log(response.data.data.updateConsultRating, 'Summary response is....');
      const fileName =
        process.env.PHARMA_LOGS_PATH + new Date().toDateString() + '-dashboardSummary.txt';
      let content =
        new Date().toString() +
        '\n---------------------------\n' +
        '\nupdateConsultRating Response\n' +
        JSON.stringify(response.data.data.updateConsultRating) +
        '\n-------------------\n';
      fs.appendFile(fileName, content, function (err) {
        if (err) throw err;
        console.log('Updated!');
      });
    })
    .catch((error) => {
      console.log('error', error);
    });
  res.send({
    status: 'success',
    message: res.data,
  });
});
app.get('/updateDoctorsAwayAndOnlineCount', (req, res) => {
  const currentDate = format(new Date(), 'yyyy-MM-dd');
  const updateDoctorsAwayAndOnlineCountRequestJSON = {
    query: `mutation{
      updateDoctorsAwayAndOnlineCount(doctorId:"0",summaryDate:"${currentDate}"){
        onlineCount
        awayCount
      }
    }`,
  };
  axios.defaults.headers.common['authorization'] = process.env.API_TOKEN;
  axios
    .post(process.env.API_URL, updateDoctorsAwayAndOnlineCountRequestJSON)
    .then((response) => {
      console.log(response.data.data.updateDoctorsAwayAndOnlineCount, 'Summary response is....');
      const fileName =
        process.env.PHARMA_LOGS_PATH +
        new Date().toDateString() +
        '-updateDoctorsAwayAndOnlineCount.txt';
      let content =
        new Date().toString() +
        '\n---------------------------\n' +
        '\nupdateDoctorsAwayAndOnlineCount Response\n' +
        JSON.stringify(response.data.data.updateDoctorsAwayAndOnlineCount) +
        '\n-------------------\n';
      fs.appendFile(fileName, content, function (err) {
        if (err) throw err;
        console.log('Updated!');
      });
    })
    .catch((error) => {
      console.log('error', error);
    });
  res.send({
    status: 'success',
    message: res.data,
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

app.get('/consultpayment', consultPayRequest);
app.post('/consulttransaction', consultPayResponse);
app.get('/consultpg-success', consultsPgSuccess);
app.get('/consultpg-error', consultsPgError);
app.post('/consult-payment-webhook', consultWebhook);

app.get('/paymed', paymedRequest);
app.post('/paymed-response', paymedResponse);
app.get('/mob', mob);
app.get('/mob-error', mobError);
app.post('/pharma-payment-webhook', pharmaWebhook);

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

          const hash = crypto.createHash('sha512').update(code).digest('hex');

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
  let queueMessage = '';
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
          logger.error(`processOrders()-> ${error.stack}`);
          console.log(error, 'address error');
        });
    });
  }
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
        logger.info(`message from topic - processOrders()-> ${JSON.stringify(result.body)}`);
        console.log('message from topic', result.body);
        queueMessage = result.body;
        const queueDetails = queueMessage.split(':');
        axios.defaults.headers.common['authorization'] = 'Bearer 3d1833da7020e0602165529446587434';
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
              logger.info(
                `message from topic -processOrders()->getMedicineOrderDetails()-> ${JSON.stringify(
                  response.data.data
                )}`
              );
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
                logger.info(
                  `processOrders()->${queueDetails[1]}-> pharamInput - ${JSON.stringify(
                    pharmaInput
                  )}`
                );
                console.log('pharmaInput==========>', pharmaInput, '<===============pharmaInput');
                const fileName =
                  process.env.PHARMA_LOGS_PATH + new Date().toDateString() + '-pharmaLogs.txt';
                let content =
                  new Date().toString() +
                  '\n---------------------------\n' +
                  JSON.stringify(pharmaInput) +
                  '\n-------------------\n';
                fs.appendFile(fileName, content, function (err) {
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
                    logger.info(
                      `processOrders()->${queueDetails[1]}-> pharamResponse - ${JSON.stringify(
                        resp.data
                      )}`
                    );
                    console.log('pharma resp', resp, resp.data.ordersResult);
                    //const orderData = JSON.parse(resp.data);
                    content = resp.data.ordersResult + '\n==================================\n';
                    fs.appendFile(fileName, content, function (err) {
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
                          logger.error(
                            `${queueDetails[1]} -> processOrders()->orderPlaced -> ${placedError.stack}`
                          );
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
                    logger.error(
                      `${queueDetails[1]} -> processOrders()->PharamaOrderPlaced -> ${pharmaerror.stack}`
                    );
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
            logger.error(
              `${queueDetails[1]} -> processOrders()->getMedicineOrderDetails() -> ${error.stack}`
            );

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

app.get('/processOmsOrders', (req, res) => {
  const serviceBusConnectionString = process.env.AZURE_SERVICE_BUS_CONNECTION_STRING;
  const azureServiceBus = azure.createServiceBusService(serviceBusConnectionString);
  azureServiceBus.receiveSubscriptionMessage(
    process.env.AZURE_SERVICE_BUS_OMS_QUEUE_NAME,
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
        logger.info(
          `message from topic for OMS - processOrders()-> ${JSON.stringify(result.body)}`
        );
        queueMessage = result.body;
        const [prefix, orderAutoId, patientId] = queueMessage.split(':');
        axios.defaults.headers.common['authorization'] = 'Bearer 3d1833da7020e0602165529446587434';
        axios({
          url: process.env.API_URL,
          method: 'post',
          data: {
            query: getMedicineOrderQuery('getMedicineOrderOMSDetails', patientId, orderAutoId),
          },
        })
          .then(async (response) => {
            const orderDetails =
              response &&
              response.data &&
              response.data.data &&
              response.data.data.getMedicineOrderOMSDetails &&
              response.data.data.getMedicineOrderOMSDetails.medicineOrderDetails;
            if (orderDetails) {
              console.log(orderDetails.currentStatus, 'order details');
              if (orderDetails.currentStatus != 'CANCELLED') {
                let deliveryCity = 'Kakinada',
                  deliveryZipcode = '500034',
                  deliveryAddress1 = '',
                  deliveryAddress2 = '',
                  landmark = '',
                  deliveryAddress = 'Kakinada',
                  deliveryState = 'Telangana',
                  deliveryStateCode = 'TS',
                  lat = 0,
                  long = 0;
                if (orderDetails.patientAddressId) {
                  const patientAddressDetails = await getAddressDetails(
                    orderDetails.patientAddressId
                  );
                  if (patientAddressDetails) {
                    deliveryState = patientAddressDetails.state;
                    deliveryAddress1 = patientAddressDetails.addressLine1;
                    deliveryAddress2 = patientAddressDetails.addressLine2;
                    landmark = patientAddressDetails.landmark || landmark;
                    lat = patientAddressDetails.latitude || lat;
                    long = patientAddressDetails.longitude || long;
                    deliveryStateCode = patientAddressDetails.stateCode || deliveryStateCode;
                    deliveryAddress =
                      patientAddressDetails.addressLine1 + ' ' + patientAddressDetails.addressLine2;
                    deliveryCity = patientAddressDetails.city || deliveryCity;
                    deliveryZipcode = patientAddressDetails.zipcode || deliveryZipcode;
                  }
                }
                const orderLineItems = [];
                let requestType = 'NONCART';
                let orderType = 'fmcg';
                if (orderDetails.orderType == 'CART_ORDER') {
                  requestType = 'CART';
                  orderDetails.medicineOrderLineItems.forEach((item) => {
                    const lineItem = {
                      itemid: item.medicineSKU,
                      itemname: item.medicineName,
                      quantity: item.quantity * item.mou,
                      packsize: item.mou,
                      discpercent: ((item.mrp - item.price) / item.mrp) * 100,
                      discamount: item.mrp - item.price,
                      mrp: item.mrp / item.mou, // per unit
                      splmrp: item.price / item.mou,
                      totalAmount: item.price * item.quantity,
                      comment: '',
                    };
                    orderLineItems.push(lineItem);
                  });
                  const pharmaItems = orderDetails.medicineOrderLineItems.find((item) => {
                    return item.isMedicine == '1';
                  });
                  if (pharmaItems.length > 0) {
                    orderType = 'Pharma';
                  }
                  if (orderDetails.devliveryCharges > 0) {
                    orderLineItems.push({
                      itemid: 'ESH0002',
                      itemname: 'E SHOP SHIPPING CHARGE',
                      packsize: 1,
                      quantity: 1,
                      discpercent: '',
                      discamount: '',
                      mrp: orderDetails.devliveryCharges,
                      totalamount: orderDetails.devliveryCharges,
                      comment: '',
                    });
                  }
                }
                const paymentDetails = orderDetails.medicineOrderPayments;
                const patientDetails = orderDetails.patient;
                let patientAge = 30;
                if (patientDetails.dateOfBirth && patientDetails.dateOfBirth != null) {
                  patientAge = Math.abs(
                    differenceInYears(new Date(), parseISO(patientDetails.dateOfBirth))
                  );
                }
                const orderPrescriptionUrl = [];
                let prescriptionImages = [];
                if (orderDetails.prescriptionImageUrl) {
                  prescriptionImages = orderDetails.prescriptionImageUrl.split(',');
                }
                if (prescriptionImages.length > 0) {
                  prescriptionImages.map((imageUrl) => {
                    const url = {
                      url: imageUrl,
                    };
                    orderPrescriptionUrl.push(url);
                  });
                }
                if (!orderDetails.orderTat) {
                  orderDetails.orderTat = '';
                }
                const [tatDate, timeslot] = orderDetails.orderTat.split(' ');
                const medicineOrderPharma = {
                  orderid: orderDetails.orderAutoId,
                  orderdate: format(
                    addMinutes(parseISO(orderDetails.quoteDateTime), 330),
                    'MM-dd-yyyy HH:mm:ss'
                  ),
                  couponcode: orderDetails.coupon,
                  drname: '',
                  VendorName: 'Apollo247',
                  shippingmethod:
                    orderDetails.deliveryType == 'HOME_DELIVERY' ? 'HOMEDELIVERY' : 'STOREPICKUP',
                  paymentmethod: paymentDetails[0].paymentType,
                  prefferedsite: '',
                  ordertype: requestType,
                  orderamount: orderDetails.estimatedAmount || 0,
                  deliverydate: tatDate ? format(new Date(tatDate), 'MM-dd-yyyy HH:mm:ss') : '',
                  timeslot: timeslot,
                  shippingcharges: orderDetails.devliveryCharges || 0,
                  categorytype: orderType,
                  customercomment: '',
                  landmark: landmark,
                  issubscribe: false,
                  customerdetails: {
                    billingaddress: deliveryAddress.trim(),
                    billingpincode: deliveryZipcode,
                    billingcity: deliveryCity,
                    billingstateid: deliveryStateCode,
                    shippingaddress: deliveryAddress.trim(),
                    shippingpincode: deliveryZipcode,
                    shippingcity: deliveryCity,
                    shippingstateid: deliveryStateCode,
                    customerid: '',
                    patiendname: patientDetails.firstName,
                    customername:
                      patientDetails.firstName +
                      (patientDetails.lastName ? ' ' + patientDetails.lastName : ''),
                    primarycontactno: patientDetails.mobileNumber.substr(3),
                    secondarycontactno: '',
                    age: patientAge,
                    emailid: patientDetails.emailAddress || '',
                    cardno: '0',
                    latitude: lat,
                    longitude: long,
                  },
                  paymentdetails:
                    paymentDetails[0].paymentType === 'CASHLESS'
                      ? [
                          {
                            paymentsource: 'paytm',
                            transactionstatus: 'TRUE',
                            paymenttransactionid: paymentDetails[0].paymentRefId,
                            amount: paymentDetails[0].amountPaid,
                          },
                        ]
                      : [],
                  itemdetails: orderLineItems || [],
                  imageurl: orderPrescriptionUrl,
                };
                axios
                  .post(
                    process.env.PHARMACY_MED_PLACE_OMS_ORDERS,
                    JSON.stringify(medicineOrderPharma),
                    {
                      headers: {
                        'Auth-Token': process.env.PHARMACY_OMS_ORDER_TOKEN,
                        'Content-Type': 'application/json',
                      },
                    }
                  )
                  .then((resp) => {
                    logger.info(
                      `processOrders()->${orderAutoId}-> pharamResponse from OMS - ${JSON.stringify(
                        resp.data
                      )}`
                    );
                    console.log('pharma resp', resp.data);
                    if (resp.data.Status == true) {
                      const requestJSON = {
                        query: `mutation { saveOrderPlacedStatus(orderPlacedInput: { orderAutoId: ${orderDetails.orderAutoId}, referenceNo: "${resp.data.ReferenceNo}" }){ message }}`,
                      };
                      axios
                        .post(process.env.API_URL, requestJSON)
                        .then((placedResponse) => {
                          console.log('placed order in apollo 247', placedResponse.data);
                          azureServiceBus.deleteMessage(result, (deleteError) => {
                            if (deleteError) {
                              console.log('delete error', deleteError);
                            }
                            console.log('message deleted');
                          });
                        })
                        .catch((placedError) => {
                          logger.error(
                            `${orderAutoId} -> processOrders()->orderPlaced from OMS -> ${placedError.stack}`
                          );
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
                      code: orderDetails.orderAutoId + ', ' + orderDetails.pharmaRequest,
                    });
                  })
                  .catch((pharmaerror) => {
                    logger.error(
                      `${orderAutoId} -> processOrders()->PharamaOrderPlaced from OMS -> ${pharmaerror.stack}`
                    );
                    console.log('pharma error from OMS', pharmaerror);
                    res.send({
                      status: 'Failed',
                      reason: '',
                      code: orderDetails.orderAutoId + ', ' + orderDetails.pharmaRequest,
                    });
                  });
              }
            }
          })
          .catch((error) => {
            logger.error(
              `${orderAutoId} -> processOrders()->getMedicineOrderDetails() -> ${error.stack}`
            );

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
          fs.appendFile(fileName, content, function (err) {
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
              fs.appendFile(fileName, content, function (err) {
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

app.get('/list-of-payment-methods', (req, res) => {
  res.json(listOfPaymentMethods);
});

app.use((req, res, next) => {
  res.status(404).send('invalid url!');
});

app.use((err, req, res, next) => {
  if (err.response && err.response.data) {
    logger.error(`Final error handler - ${JSON.stringify(err.response.data)}`);
  } else {
    logger.error(`Final error handler - ${JSON.stringify(err.stack)}`);
  }
  res.status(500).send('something went wrong, please contact IT department!');
});

app.listen(PORT, () => {
  console.log('Running on ' + PORT);
});
