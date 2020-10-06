# Paytm Payment Gateway Integration With NodeJS & Express

Simple explanatory way to use Paytm Payment Integration with NodeJS with Express with minimal dependancies.

### Node Packages Used

- [ejs] - HTML Templating Engine!
- [express] - Http web server!
- [CORS] - CORS is a node.js package for providing a Connect/Express middleware that can be used to enable CORS with various options..
- [dotenv] - Environment config!
- [shortid] - generate unique short IDs
- [body-parser] - Express Middleware..

### ENV Setup

Create .env file as below.

```sh
MID=**MID Given By Paytm Staging Credentials**
PAYTM_MERCHANT_KEY=**PAYTM_MERCHANT_KEY Given By Paytm Staging Credentials**
WEBSITE=WEBSTAGING
CHANNEL_ID=WEB
INDUSTRY_TYPE_ID=Retail
PAYTM_FINAL_URL=https://securegw-stage.paytm.in/order/process
CALLBACK_URL=http://localhost:7000/paywithpaytmresponse
PORT=7000
```

### Installation

Install the dependencies and devDependencies and start the server.

```sh
$ cd paytm-integration
$ npm install
$ npm start
```

### STEPS

- Open below url in browser!
  http://localhost:7000/paywithpaytm?amount=10

- Follow these links https://developer.paytm.com/docs/testing-integration/, https://developer.paytm.com/docs/v1/payment-gateway

- After you login with the staging credentials you will be logged in and once you will click Pay Now button,you will be redirected to below response page with proper payment summary.
  http://localhost:7000/paywithpaytmresponse

## License

MIT
