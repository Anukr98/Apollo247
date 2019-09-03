const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');
const ejs = require('ejs');
const app = express();
const session = require('express-session');

require('dotenv').config();

app.use(session({ secret: process.env.SESSION_SECRET, cookie: { maxAge: 60000 } }));

const PORT = process.env.PORT || 7000;

const { initPayment, responsePayment } = require('./paytm/services/index');

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname + '/views'));
app.set('view engine', 'ejs');

app.get('/paymed', (req, res) => {
  req.session.token = req.query.token;
  initPayment(req.query.orderAutoId, req.query.amount).then(
    (success) => {
      res.render('paytmRedirect.ejs', {
        resultData: success,
        paytmFinalUrl: process.env.PAYTM_FINAL_URL,
      });
    },
    (error) => {
      console.log(error);
      res.send(error);
    }
  );
});

app.post('/paymed-response', (req, res) => {
  const payload = req.body;
  const token = req.session.token;
  const date = new Date(new Date().toUTCString());
  const orderAutoId = payload.ORDERID;

  /*save response in apollo24x7*/
  axios.defaults.headers.common['authorization'] = token;
  const requestJSON = {
    query:
      'mutation { SaveMedicineOrderPayment(medicinePaymentInput: { orderId: "0", orderAutoId: ' +
      orderAutoId +
      ', paymentType: ONLINE, amountPaid: ' +
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
      '" }){ errorCode, errorMessage, paymentOrderId, orderStatus }}',
  };
  axios
    .post(process.env.API_URL, requestJSON)
    .then((response) => {
      const redirectUrl = `${process.env.PORTAL_URL}?orderAutoId=${orderAutoId}&status=success`;
      res.redirect(redirectUrl);
    })
    .catch((error) => {
      console.log('error', error);
    });
});

app.listen(PORT, () => {
  console.log('Running on ' + PORT);
});
