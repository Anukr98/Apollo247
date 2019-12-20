const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');
const ejs = require('ejs');
const app = express();
const session = require('express-session');
const stripTags = require('striptags');
const azure = require('azure-sb');
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

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname + '/views'));
app.set('view engine', 'ejs');

app.get('/consulttransaction', (req, res) => {
  console.log(req.query.CompleteResponse, req.query.ORDERID);
  console.log(req.query.BANKTXNID);
  console.log(req.query.STATUS);
  console.log(req.query.TXNAMOUNT);
  console.log(req.query.TXNDATE);
  /*save response in apollo24x7*/
  axios.defaults.headers.common['authorization'] = 'Bearer 3d1833da7020e0602165529446587434';
  const date = new Date(new Date().toUTCString()).toISOString();
  const txnId = req.query.CompleteResponse.replace('TXNID=', '');
  // this needs to be altered later.
  const requestJSON = {
    query:
      'mutation { makeAppointmentPayment(paymentInput: { appointmentId: "' +
      req.session.appointmentId +
      '", amountPaid: ' +
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
      '" }){appointment { id } }}',
  };

  axios
    .post(process.env.API_URL, requestJSON)
    .then((response) => {
      console.log(response.data.data.makeAppointmentPayment.appointment.id, 'response is....');
      if (req.query.STATUS == 'TXN_SUCCESS') {
        res.redirect(
          `/consultpg-success?tk=${response.data.data.makeAppointmentPayment.appointment.id}&status=${req.query.STATUS}`
        );
      } else {
        res.redirect(`/consultpg-error?tk=${req.query.ORDERID}&status=${req.query.STATUS}`);
      }
    })
    .catch((error) => {
      console.log('error', error);
    });

  //res.send('payment response');
});

app.get('/consultpg-success', (req, res) => {
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

app.get('/consultpg-error', (req, res) => {
  res.send({
    status: 'failed',
  });
});

app.get('/consultpayment', (req, res) => {
  //res.send('consult payment');
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
            .post(
              'http://rest.askapollo.com:9047/restservice.svc/GetMarchantIdAnonymousforSourceApp',
              {
                AdminId: 'AskApollo',
                AdminPassword: 'AskApollo',
                sourceApp: '7729FD68-C552-4C90-B31E-98AA6C84FEBF~web',
              }
            )
            .then((resp) => {
              console.log(resp.data, resp.data.Result);
              req.session.appointmentId = req.query.appointmentId;
              res.render('consults.ejs', {
                athsToken: response.data.data.getAthsToken.patient.athsToken,
                merchantId: resp.data.Result,
                price: req.query.price,
                patientId: req.query.patientId,
                patientName: response.data.data.getAthsToken.patient.firstName,
                mobileNumber: response.data.data.getAthsToken.patient.mobileNumber,
                baseUrl: 'https://aph.dev.pmt.popcornapps.com',
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

  // console.log(
  //   'source', req.session.source
  // );

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
  const token = req.session.token;
  const date = new Date(new Date().toUTCString()).toISOString();
  const reqSource = req.session.source;

  // console.log('payload is....', payload);

  /* make success and failure response */
  const transactionStatus = payload.STATUS === 'TXN_FAILURE' ? 'failed' : 'success';

  /* never execute a transaction if the payment status is failed */
  if (transactionStatus === 'failed') {
    if (reqSource === 'web') {
      const redirectUrl = `${process.env.PORTAL_URL}?orderAutoId=${req.session.orderAutoId}&status=${transactionStatus}`;
      res.redirect(redirectUrl);
    } else {
      res.redirect(`/mob-error?tk=${token}&status=${transactionStatus}`);
    }
  }

  /*save response in apollo24x7*/
  axios.defaults.headers.common['authorization'] = token;

  // this needs to be altered later.
  const requestJSON = {
    query:
      'mutation { SaveMedicineOrderPayment(medicinePaymentInput: { orderId: "0", orderAutoId: ' +
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

  axios
    .post(process.env.API_URL, requestJSON)
    .then((response) => {
      console.log(response, 'response is....');
      if (reqSource === 'web') {
        const redirectUrl = `${process.env.PORTAL_URL}?orderAutoId=${req.session.orderAutoId}&status=${transactionStatus}`;
        res.redirect(redirectUrl);
      } else {
        res.redirect(`/mob?tk=${token}&status=${transactionStatus}`);
      }
    })
    .catch((error) => {
      console.log('error', error);
      if (reqSource === 'web') {
        const redirectUrl = `${process.env.PORTAL_URL}?orderAutoId=${req.session.orderAutoId}&status=${transactionStatus}`;
        res.redirect(redirectUrl);
      } else {
        res.redirect(`/mob-error?tk=${token}&status=${transactionStatus}`);
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

app.get('/processOrders', (req, res) => {
  let queueMessage = '';
  const serviceBusConnectionString =
    'Endpoint=sb://apollodevpopcorn.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=zBbU2kCqxiBny22Zj7rCefaM930uJUYGKw3L/4AqNeQ=';
  const azureServiceBus = azure.createServiceBusService(serviceBusConnectionString);
  azureServiceBus.receiveSubscriptionMessage(
    'orders',
    'supplier1',
    { isPeekLock: true },
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
                  }
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
                response.data.data.getMedicineOrderDetails.MedicineOrderDetails.pharmaRequest;
              const orderLineItems = [];
              const orderPrescriptionUrl = [];
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
                  orderLineItems.push(lineItem);
                }
              );
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
              //axios.defaults.headers.common['token'] = '9f15bdd0fcd5423190c2e877ba0228A24';
              let patientAge = 30;
              const phinput = {
                tpdetails: {
                  OrderId:
                    response.data.data.getMedicineOrderDetails.MedicineOrderDetails.orderAutoId,
                  ShopId: response.data.data.getMedicineOrderDetails.MedicineOrderDetails.shopId,
                  ShippingMethod:
                    response.data.data.getMedicineOrderDetails.MedicineOrderDetails.deliveryType,
                  RequestType: 'CART',
                  PaymentMethod: 'CASHLESS',
                  VendorName: '*****',
                  DotorName: 'Apollo',
                  OrderType: 'Pharma',
                  StateCode: 'TS',
                  TAT: null,
                  CouponCode: 'MED10',
                  OrderDate: new Date(),
                  CustomerDetails: {
                    MobileNo: response.data.data.getMedicineOrderDetails.MedicineOrderDetails.patient.mobileNumber.substr(
                      3
                    ),
                    Comm_addr: 'Kakinada',
                    Del_addr: 'Kakinada',
                    FirstName:
                      response.data.data.getMedicineOrderDetails.MedicineOrderDetails.patient
                        .firstName,
                    LastName:
                      response.data.data.getMedicineOrderDetails.MedicineOrderDetails.patient
                        .lastName,
                    City: 'Kakinada',
                    PostCode: 500045,
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
                        .medicineOrderPayments.amountPaid,
                    PaymentSource: 'CASHLESS',
                    PaymentStatus: 'Success',
                    PaymentOrderId:
                      response.data.data.getMedicineOrderDetails.MedicineOrderDetails
                        .medicineOrderPayments.paymentRefId,
                  },
                  ItemDetails: orderLineItems,
                  PrescUrl: orderPrescriptionUrl,
                },
              };
              axios
                .post(
                  'https://online.apollopharmacy.org/POPCORN/OrderPlace.svc/PLACE_ORDERS',
                  JSON.stringify(phinput),
                  {
                    headers: {
                      token: '9f15bdd0fcd5423190c2e877ba0228A24',
                      'Content-Type': 'application/json',
                    },
                  }
                )
                .then((resp) => {
                  console.log('pharma resp', resp, resp.data.ordersResult);
                  //const orderData = JSON.parse(resp.data);
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

app.listen(PORT, () => {
  console.log('Running on ' + PORT);
});
