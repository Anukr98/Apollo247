import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import fetch from 'node-fetch';
import * as crypto from 'crypto';
import * as cryptojs from 'crypto-js';
import * as jwt from 'jsonwebtoken';
import { debugLog } from 'customWinstonLogger';

const INSTANCE_ID = '8888';
const assetsDir = <string>process.env.ASSETS_DIRECTORY;
const options = {
  cert: fs.readFileSync(path.resolve(assetsDir, `${process.env.APOLLO_CERTIFICATE}`), `utf-8`),
  key: fs.readFileSync(path.resolve(assetsDir, `${process.env.APOLLO_CERTIFICATE_KEY}`), 'utf-8'),
  passphrase: `${process.env.APOLLO_CERTIFICATE_PASSWORD}`,
  rejectUnauthorized: true,
  keepAlive: false,
};
const dLogger = debugLog('profileServiceLogger', 'HDFC', Math.floor(Math.random() * 100000000));
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
  ).then(checkStatus);

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
      Trace_Number: refNo,
      Transaction_DateTimeStamp: new Date().toISOString(),
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
      msgtxt: process.env.HDFC_SMS_TEXT,
      departmentcode: process.env.HDFC_DEPARTMENT_CODE,
      submitdate: new Date().toISOString(),
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
      mobileNumber: `91${formattedMobile}`,
      dateOfBirth: formattedDateOfBirth,
    },
    sessionContext: {
      channel: 'APIGW',
      bankCode: '08',
      userId: 'DevUser01',
      transactionBranch: '089999',
      userReferenceNumber: refNoGenerator(),
      externalReferenceNo: externalReferenceNoGenerator('AP1'),
    },
  };
  const response = await mediumRequest(requestBeforeEncryption, '/API/CustomerIdentification');
  return response;
}

export async function fetchEthnicCode(dateOfBirth: Date, mobile: String, historyToken: String) {
  const formattedMobile = mobile.substr(mobile.length - 10);
  const externalReferenceNo = externalReferenceNoGenerator('AP2');
  const formattedDateOfBirth = `${dateOfBirth.getFullYear()}${(
    '0' +
    (dateOfBirth.getMonth() + 1)
  ).slice(-2)}${('0' + dateOfBirth.getDate()).slice(-2)}`;
  const requestBeforeEncryption = {
    FetchCustomerCASADetailsReqDTO: {
      dateOfBirth: formattedDateOfBirth,
      mobileNumber: `91${formattedMobile}`,
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
  return response;
}

async function decryptHighResponse(response: any) {
  if (!response['ResponseSignatureEncryptedValue']) {
    return { decryptedResponse: null };
  }
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
  const key = randomStringGenerator(32);
  const privateKey = fs.readFileSync(
    path.resolve(assetsDir, `${process.env.APOLLO_CERTIFICATE_KEY}`),
    `utf-8`
  );
  const jwt_request = jwt.sign(base_request, privateKey, { algorithm: 'RS256' });
  const iv = randomStringGenerator(16);
  const RequestSignatureEncryptedValue = cryptojs.AES.encrypt(
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
    TransactionId: refNoGenerator(),
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
  }).then(checkStatus);
  if (response) {
    const responseJson = JSON.parse((await response.text()).replace(/(\r\n|\n|\r)/gm, ''));
    const stringRequest = JSON.stringify(request);
    const stringResponse = JSON.stringify(responseJson);
    dLogger(
      new Date(),
      `HDFC HIGH REQUEST ${url}`,
      `request ${stringRequest} response ${stringResponse} `
    );
    const decryptedResponse = await decryptHighResponse(responseJson);
    return decryptedResponse;
  } else return { decryptedResponse: null, historyToken: null };
}

async function decryptMediumResponse(response: any) {
  if (!response['ResponseEncryptedValue']) {
    return { decryptedResponse: null };
  }
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
  const key = randomStringGenerator(32);
  const iv = randomStringGenerator(16);
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
    TransactionId: refNoGenerator(),
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
  }).then(checkStatus);
  if (response) {
    const responseJson = JSON.parse((await response.text()).replace(/(\r\n|\n|\r)/gm, ''));
    dLogger(
      new Date(),
      `HDFC Medium REQUEST ${url}`,
      `request ${JSON.stringify(request)} response ${JSON.stringify(responseJson)} `
    );
    const decryptedResponse = decryptMediumResponse(responseJson);
    return decryptedResponse;
  } else return { decryptedResponse: null, historyToken: null };
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

function externalReferenceNoGenerator(referenceStart: string) {
  `${referenceStart}${refNoGenerator()
    .toString()
    .slice(-2)}`;
}
function checkStatus(response: any) {
  dLogger(new Date(), `HDFC CheckStatus response status ${response.status}`, ` `);
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    return response;
    console.log('error:', response.status);
  }
}
