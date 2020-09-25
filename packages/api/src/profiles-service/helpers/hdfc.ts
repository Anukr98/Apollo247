import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import fetch from 'node-fetch';
import * as crypto from 'crypto';
import * as cryptojs from 'crypto-js';
import * as jwt from 'jsonwebtoken';

const INSTANCE_ID = '8888';
const assetsDir = <string>process.env.ASSETS_DIRECTORY;
const options = {
  cert: fs.readFileSync(path.resolve(assetsDir, `${process.env.APOLLO_CERTIFICATE}`), `utf-8`),
  key: fs.readFileSync(path.resolve(assetsDir, `${process.env.APOLLO_CERTIFICATE_KEY}`), 'utf-8'),
  passphrase: `${process.env.APOLLO_CERTIFICATE_PASSWORD}`,
  rejectUnauthorized: true,
  keepAlive: false,
};
const sslConfiguredAgent = new https.Agent(options);

async function generateAuthToken() {
  const response = await fetch(
    `${process.env.HDFC_URL}/AUTH/OAUTH/V2/token?grant_type=client_credentials&scope=${process.env.HDFC_SCOPE}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `${process.env.HDFC_AUTHURIZATION_HEADER}`,
      },
    }
  );
  const body = JSON.parse(await response.text());
  return body['access_token'];
}

export async function generateOtp(mobile: String) {
  const formattedMobile = mobile.substr(mobile.length - 10);
  const linkData = `000000091${formattedMobile}`;
  const refNo = refNoGenerator();
  const shaMessageHash = crypto
    .createHash('sha1')
    .update(
      INSTANCE_ID +
        '|' +
        process.env.HDFC_CALLER_ID +
        '|' +
        linkData +
        '|' +
        refNo +
        '|' +
        false +
        '|' +
        process.env.HDFC_HASH_KEY
    )
    .digest('base64');
  const messageHash = `static:genpwdreq:06:${shaMessageHash}`;
  const requestBeforeEncryption = {
    ccotpserviceRequest: {
      Trace_Number: '',
      Transaction_DateTimeStamp: '',
      ATM_POS_IVR_ID: 'CCIVR1',
      Credit_Card_Number: linkData,
      callerId: process.env.HDFC_CALLER_ID,
      instanceId: INSTANCE_ID,
      linkData: linkData,
      messageHash: messageHash,
      refNo: refNo,
      customerMobileNo: `91${formattedMobile}`,
      otpPasswordValue: '',
      sms_userid: process.env.HDFC_SMS_USERID,
      sms_password: process.env.HDFC_SMS_PASSWORD,
      ctype: '1',
      sender: process.env.HDFC_OTP_SENDER,
      mobilenumber: `91${formattedMobile}`,
      msgtxt:
        'Your confidential one time password for HDFC Bank Credit card on call authentication is #OTP#, valid for 2 hours. Kindly enter this OTP as prompted by IVR.',
      departmentcode: process.env.HDFC_DEPARTMENT_CODE,
      submitdate: '',
      author: '',
      subAuthor: '',
      broadcastname: process.env.HDFC_BROADCAST_NAME,
      internationalflag: '0',
      msgid: refNo,
      drlflag: '',
      dndalert: '',
      msgtype: 'S',
      priority: '',
      authType: '2',
      appname: '',
      appCodeHash: '',
      SOAStandardElements: {
        service_user: '',
        service_password: '',
        consumer_name: '',
      },
      soafillers: {
        filler1: '',
        filler2: '',
        filler3: '',
        filler4: '',
        filler5: '',
      },
    },
  };
  const response = await highRequest(requestBeforeEncryption, '/API/OTP_Gen');
  return response;
}

function refNoGenerator(): string {
  const currentDate = new Date();
  return `${currentDate.getTime() * 1000 + currentDate.getMilliseconds()}`;
}
export async function verifyOtp(otp: String, mobile: String) {
  const formattedMobile = mobile.substr(mobile.length - 10);
  const refNo = refNoGenerator();
  const linkData = `000000091${formattedMobile}`;
  const shaMessageHash = crypto
    .createHash('sha1')
    .update(
      INSTANCE_ID +
        '|' +
        process.env.HDFC_CALLER_ID +
        '|' +
        linkData +
        '|' +
        refNo +
        '|' +
        otp +
        '|' +
        process.env.HDFC_HASH_KEY
    )
    .digest('base64');
  const messageHash = `static:verpwdreq:06:${shaMessageHash}`;
  const requestBeforeEncryption = {
    verifyPwdRequest: {
      hdfcVerifyPwdReq: {
        callerId: process.env.HDFC_CALLER_ID,
        instanceId: INSTANCE_ID,
        linkData: linkData,
        passwordValue: otp,
        messageHash: messageHash,
        refNo: refNo,
        fillerField1: '',
        fillerField2: '',
        fillerField3: '',
        fillerField4: '',
        fillerField5: '',
      },
    },
  };
  const response = await highRequest(requestBeforeEncryption, '/API/OTP_Val_v2');
  return response;
}

export async function customerIdentification(mobile: String, dateOfBirth: Date) {
  const formattedMobile = mobile.substr(mobile.length - 10);
  const formattedDateOfBirth = `${dateOfBirth.getFullYear()}${(
    '0' +
    (dateOfBirth.getMonth() + 1)
  ).slice(-2)}${('0' + dateOfBirth.getDate()).slice(-2)}`;
  const requestBeforeEncryption = {
    FetchCustomerCASADetailsReqDTO: {
      mobileNumber: `${formattedMobile}`,
      dateOfBirth: formattedDateOfBirth,
    },
    sessionContext: {
      channel: 'APIGW',
      bankCode: '08',
      userId: 'DevUser01',
      transactionBranch: '089999',
      userReferenceNumber: '12349876',
    },
  };
  const response = await mediumRequest(requestBeforeEncryption, '/API/CustomerIdentification');
  console.log(response);
  return response;
}

export async function fetchEthnicCode(dateOfBirth: Date, mobile: String, historyToken: String) {
  const formattedMobile = mobile.substr(mobile.length - 10);
  const externalReferenceNo = refNoGenerator();
  const formattedDateOfBirth = `${dateOfBirth.getFullYear()}${(
    '0' +
    (dateOfBirth.getMonth() + 1)
  ).slice(-2)}${('0' + dateOfBirth.getDate()).slice(-2)}`;
  const requestBeforeEncryption = {
    FetchCustomerCASADetailsReqDTO: {
      dateOfBirth: formattedDateOfBirth,
      mobileNumber: `${formattedMobile}`,
      panNumber: '',
    },
    sessionContext: {
      bankCode: '08',
      channel: 'APIGW',
      userId: 'DevUser01',
      transactionBranch: '089999',
      externalReferenceNo: externalReferenceNo,
    },
  };
  const response = await mediumRequest(
    requestBeforeEncryption,
    '/API/Fetch_EthnicCode_RM_Dtls',
    historyToken
  );
  console.log(JSON.stringify(response['decryptedResponse']['customerCASADetailsDTO']));
  return response;
}

async function decryptHighResponse(response: any) {
  const symmetricKey: string = symmetricKeyDecryptedValue(response['GWSymmetricKeyEncryptedValue']);
  const decipher = crypto.createDecipheriv(
    'AES-256-CBC',
    symmetricKey,
    response['ResponseSignatureEncryptedValue'].substring(0, 16)
  );
  const decrypted =
    decipher.update(response['ResponseSignatureEncryptedValue'], 'base64').toString() +
    decipher.final();
  const jwt2ndpartbase64 = cryptojs.enc.Base64.parse(decrypted.split('.')[1]);
  return {
    decryptedResponse: JSON.parse(
      jwt2ndpartbase64.toString(cryptojs.enc.Utf8).replace(/(\r\n|\n|\r)/gm, '')
    ),
    historyToken: response['Id-token-jwt'],
  };
}

async function highRequest(base_request: any, url: String, historyToken: string = '') {
  console.log('-----------------------------------------------------------------');
  console.log(`request ${url}`, base_request);
  console.log('-----------------------------------------------------------------');
  const key = randomStringGenerator(32);
  const privateKey = fs.readFileSync(
    path.resolve(assetsDir, `${process.env.APOLLO_CERTIFICATE_KEY}`),
    `utf-8`
  );
  const jwt_request = jwt.sign(base_request, privateKey, { algorithm: 'RS256' });
  let iv = randomStringGenerator(16);
  let RequestSignatureEncryptedValue = cryptojs.AES.encrypt(
    `${iv}${jwt_request}`,
    cryptojs.enc.Utf8.parse(key),
    {
      iv: cryptojs.enc.Utf8.parse(iv), // parse the IV
      padding: cryptojs.pad.Pkcs7,
      mode: cryptojs.mode.CBC,
    }
  ).toString();
  const request = {
    RequestSignatureEncryptedValue: RequestSignatureEncryptedValue,
    SymmetricKeyEncryptedValue: symmetricKeyEncryptedValue(key),
    Scope: process.env.HDFC_SCOPE,
    TransactionId: '2244167897',
    OAuthTokenValue: await generateAuthToken(),
    'Id-token-jwt': historyToken,
  };
  const response = await fetch(`${process.env.HDFC_URL}${url}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apiKey: `${process.env.HDFC_API_KEY}`,
    },
    body: JSON.stringify(request),
    agent: sslConfiguredAgent,
  });
  console.log('--------------------------------------------------------');
  console.log('response highrequest', response);
  console.log('--------------------------------------------------------');
  const decryptedResponse = await decryptHighResponse(
    JSON.parse((await response.text()).replace(/(\r\n|\n|\r)/gm, ''))
  );
  console.log('--------------------------------------------------------');
  console.log('response decryptedResponse', decryptedResponse['decryptedResponse']);
  console.log('--------------------------------------------------------');
  return decryptedResponse;
}

async function decryptMediumResponse(response: any) {
  const symmetricKey: string = symmetricKeyDecryptedValue(response['GWSymmetricKeyEncryptedValue']);
  const decipher = crypto.createDecipheriv(
    'AES-256-CBC',
    symmetricKey,
    response['ResponseEncryptedValue'].substring(0, 16)
  );

  const decrypted =
    decipher.update(response['ResponseEncryptedValue'], 'base64').toString() + decipher.final();
  return {
    decryptedResponse: JSON.parse(decrypted.slice(decrypted.indexOf('{'))),
    historyToken: response['Id-token-jwt'],
  };
}

async function mediumRequest(base_request: any, url: String, historyToken: String = '') {
  console.log('-----------------------------------------------------------------');
  console.log(`request ${url}`, base_request);
  console.log('-----------------------------------------------------------------');
  const key = randomStringGenerator(32);
  let iv = randomStringGenerator(16);
  const RequestEncryptedValue = cryptojs.AES.encrypt(
    `${iv}${JSON.stringify(base_request)}`,
    cryptojs.enc.Utf8.parse(key),
    {
      iv: cryptojs.enc.Utf8.parse(iv),
      padding: cryptojs.pad.Pkcs7,
      mode: cryptojs.mode.CBC,
    }
  ).toString();
  const request = {
    RequestEncryptedValue: RequestEncryptedValue,
    SymmetricKeyEncryptedValue: symmetricKeyEncryptedValue(key),
    Scope: process.env.HDFC_SCOPE,
    TransactionId: '2234167897',
    OAuthTokenValue: '',
    'Id-token-jwt': historyToken,
  };
  const response = await fetch(`${process.env.HDFC_URL}${url}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apiKey: `${process.env.HDFC_API_KEY}`,
    },
    body: JSON.stringify(request),
    agent: sslConfiguredAgent,
  });
  console.log('--------------------------------------------------------');
  console.log('response medium request', response);
  console.log('--------------------------------------------------------');
  const decryptedResponse = decryptMediumResponse(
    JSON.parse((await response.text()).replace(/(\r\n|\n|\r)/gm, ''))
  );
  console.log('--------------------------------------------------------');
  console.log('response medium decryptedResponse', decryptedResponse);
  console.log('--------------------------------------------------------');
  return decryptedResponse;
}

function symmetricKeyEncryptedValue(symmetricKey: String) {
  const publicKey = fs.readFileSync(
    path.resolve(assetsDir, `${process.env.HDFC_PUBLIC_CERTIFICATE}`),
    'utf8'
  );
  return crypto
    .publicEncrypt(
      { key: publicKey, padding: crypto.constants.RSA_PKCS1_PADDING },
      Buffer.from(symmetricKey)
    )
    .toString('base64');
}

function symmetricKeyDecryptedValue(symmetricKey: string) {
  const privatKey = fs.readFileSync(
    path.resolve(assetsDir, `${process.env.APOLLO_CERTIFICATE_KEY}`),
    'utf8'
  );
  const value = crypto
    .privateDecrypt(
      { key: privatKey, padding: crypto.constants.RSA_PKCS1_PADDING },
      Buffer.from(symmetricKey, 'base64')
    )
    .toString();
  return value;
}

function randomStringGenerator(length: number): string {
  return crypto
    .randomBytes(length)
    .toString('base64')
    .slice(0, length);
}

// console.log(cryptojs.enc.Base64.parse('c2F5IEhJ'));
// console.log(await generateOtp('9930207495'));
// console.log(verifyOtp('123456', '9930207495'));

// console.log(CustomerIdentification('9930207495', new Date('06-10-1960')));

// async function executeTestRun() {
// console.log(await generateOtp('9930207495'));
// console.log(await verifyOtp('123456', '9930207495'));
//   console.log(
//     await fetchEthnicCode(
//       new Date('06-10-1960'),
//       '9930207495',
//       'LBaersZSbFV8Mf-duaThViD3KJUhYDMfcqu7iNrtJHYZ-ZcF6ETOotkozensvZTd18yXNuejSxfi4tdPHL21T6QVomCrg9kOfrpOhOHdLjaWRqdLeokxlz5E-cuAcrnR-R0CHRGK1xJ97-oE1QxAAoBV2CWP1s81t94zglpwAWt4j3KV1d3Y4tJynCxn84lFV7_fokBJYepcNlLsUizB9tZFE7P8yypgO_DEdfK4VbAQcygTEIdp2qdePoiIdoxy50Y3gCj_v2-t0l-Oi90XVmXC6QLWOEXeb4PDbKdgKYG7I9r9cNPKYNnJFBn_B4TPWbOhQU9Z72BJSDKiioNIow.tLMxA8wle2g_nj2qUNAxjw.v4kGry4WLntw5tOHi5K94ZLIfUXa3HYH66MIteD4LX80YX_aszPq2I9seTy4hA81g58aMQU2JLTmpSymTZLCSQJ0xaf6DS8dpkJdUZzIIdF8AYEVIhOpZS_F91yyW0CvFcv3SR_a-yoFpHOSnxmWBxfVGv5AlB47B8xF0TdGFOP_JPvR5vD_Mql3qrwR9PUEcUvneajUK-qNJY11mp35UYyi6QiXEWa8RZpzJX-3NqbXzz2aBBcdNvAXDABEB--Ju0QPQXlrvkJNlPZT0sfdIZpPac7KkA7ZMuD0--Ln5q946xB7OBt0GWDokXpc1xLVlhwYrNagVn0orr1NYtJQr74REFeThPsXl8tcNxrkbXlyvYv6OOJ3VuEd98pAJc1yoBzRDNsH59mi-e-r4nPu19LWrcU0bHL5Tc2WxurnGZJNYEOjnKxo7epV5ZF_MQA4-z5HztFJss-h6sT4-xjvHkcVD12B9KchWE2zaZ56nZyp22TWk2C3HY4-F1cV-87DWKWBHPaUA14NqBr6MAdEzyQisxFcvKJmod6NVRH8Bm7n5cud9woHWSxMtW0L-timEvhIHAO4ZEFzF5OxWB_neXBjDJIv4bd5M0bT_SFMMdJU4sP60eTjBKxCIMfCAYNi8qtJl1FYAr7M06q-7NYczSFnwHQRh-7_3pN3AEq4sREZ-ilK20-Vxc-EALtXUAskqaQPcwUqetd_gxGv4RfvLjYib56l6oSLpDXJT2LPG4HOsA_A0232FAFqbXh-fEo8AM9N2LuQFYUgqQT5XEXsA0KLRbEk3Zs72ZPQiNybf7xtSTwC5kkpWY-cWk0axhNBsflarXVDeBS2n3H2ZXNwYWoV5IAHMCPsSxWi2PyQp8g.qUdeRV7hUS-1BCkGNHrbFw'
//     )
//   );
// }

// console.log(executeTestRun());
