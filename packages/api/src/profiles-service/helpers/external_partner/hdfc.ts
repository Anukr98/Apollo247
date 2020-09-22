import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import fetch from 'node-fetch';
import * as crypto from 'crypto';
import * as cryptojs from 'crypto-js';
import * as jwt from 'jsonwebtoken';
const HDFC_URL = 'https://openapiuat.hdfcbank.com:9443';
const HDFC_API_KEY = 'l7ba164d15f9de442687e69c89d380b35a';
const HDFC_AUTHURIZATION_HEADER =
  'Basic bDdiYTE2NGQxNWY5ZGU0NDI2ODdlNjljODlkMzgwYjM1YTo4OTA4NmI4ZjRlOTg0YTBkYTg5OTZhMzk0YTEzNDI5Ng==';
const HDFC_PUBLIC_CERTIFICATE =
  '/Users/jarvis/Downloads/openapiuat.hdfcbank.com/openapiuat_hdfcbank_com.cer';
const HDFC_HASH_KEY = 'B9E7O1A7B1';
const HDFC_SMS_USERID = 'banker1245';
const HDFC_SMS_PASSWORD = 'DJ1za79m9x2KA';
const HDFC_CALLER_ID = 'hdfc_Api';
const HDFC_DEPARTMENT_CODE = 'APIGWOTP';
const APOLLO_CERTIFICATE_KEY =
  '/Users/jarvis/Downloads/integrations.apollo247.com/decrypted_key.key';
const APOLLO_CERTIFICATE = '/Users/jarvis/Downloads/integrations.apollo247.com/hdfc.pem';
const APOLLO_CERTIFICATE_PASSWORD = 'hdfc';
const HDFC_SCOPE = 'apollo_uat';
const INSTANCE_ID = '8888';
const options = {
  cert: fs.readFileSync(path.resolve(__dirname, `${APOLLO_CERTIFICATE}`), `utf-8`),
  key: fs.readFileSync(path.resolve(__dirname, `${APOLLO_CERTIFICATE_KEY}`), 'utf-8'),
  passphrase: `${APOLLO_CERTIFICATE_PASSWORD}`,
  rejectUnauthorized: true,
  keepAlive: false,
};
const sslConfiguredAgent = new https.Agent(options);

async function generateAuthToken() {
  const response = await fetch(
    `${HDFC_URL}/AUTH/OAUTH/V2/token?grant_type=client_credentials&scope=${HDFC_SCOPE}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `${HDFC_AUTHURIZATION_HEADER}`,
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
        HDFC_CALLER_ID +
        '|' +
        linkData +
        '|' +
        refNo +
        '|' +
        false +
        '|' +
        HDFC_HASH_KEY
    )
    .digest('base64');
  const messageHash = `static:genpwdreq:06:${shaMessageHash}`;
  const requestBeforeEncryption = {
    ccotpserviceRequest: {
      Trace_Number: '',
      Transaction_DateTimeStamp: '',
      ATM_POS_IVR_ID: 'CCIVR1',
      Credit_Card_Number: linkData,
      callerId: 'hdfc_Api',
      instanceId: INSTANCE_ID,
      linkData: linkData,
      messageHash: messageHash,
      refNo: refNo,
      customerMobileNo: `91${formattedMobile}`,
      otpPasswordValue: '',
      sms_userid: HDFC_SMS_USERID,
      sms_password: HDFC_SMS_PASSWORD,
      ctype: '1',
      sender: 'HDFCBank',
      mobilenumber: `91${formattedMobile}`,
      msgtxt:
        'Your confidential one time password for HDFC Bank Credit card on call authentication is #OTP#, valid for 2 hours. Kindly enter this OTP as prompted by IVR.',
      departmentcode: HDFC_DEPARTMENT_CODE,
      submitdate: '',
      author: '',
      subAuthor: '',
      broadcastname: 'HDFC-BRD',
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
        HDFC_CALLER_ID +
        '|' +
        linkData +
        '|' +
        refNo +
        '|' +
        otp +
        '|' +
        HDFC_HASH_KEY
    )
    .digest('base64');
  const messageHash = `static:verpwdreq:06:${shaMessageHash}`;
  const requestBeforeEncryption = {
    verifyPwdRequest: {
      hdfcVerifyPwdReq: {
        callerId: HDFC_CALLER_ID,
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

export async function CustomerIdentification(mobile: String, dateOfBirth: Date) {
  const formattedMobile = mobile.substr(mobile.length - 10);
  const formattedDateOfBirth = `${dateOfBirth.getFullYear()}${(
    '0' +
    (dateOfBirth.getMonth() + 1)
  ).slice(-2)}${('0' + dateOfBirth.getDate()).slice(-2)}`;
  const requestBeforeEncryption = {
    FetchCustomerCASADetailsReqDTO: {
      mobileNumber: formattedMobile,
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

export function fetchEthnicCode(dateOfBirth: Date, mobile: String, historyToken: String) {
  const formattedMobile = mobile.substr(mobile.length - 10);
  const externalReferenceNo = refNoGenerator();
  const formattedDateOfBirth = `${dateOfBirth.getFullYear()}${(
    '0' +
    (dateOfBirth.getMonth() + 1)
  ).slice(-2)}${('0' + dateOfBirth.getDate()).slice(-2)}`;
  const requestBeforeEncryption = {
    FetchCustomerCASADetailsReqDTO: {
      dateOfBirth: formattedDateOfBirth,
      mobileNumber: formattedMobile,
      panNumber: '',
    },
    sessionContext: {
      bankCode: '08',
      channel: 'ACL',
      userId: 'DevUser01',
      transactionBranch: '089999',
      externalReferenceNo: externalReferenceNo,
    },
  };
  const response = mediumRequest(
    requestBeforeEncryption,
    '/API/Fetch_EthnicCode_RM_Dtls',
    historyToken
  );
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
  const key = randomStringGenerator(32);
  const privateKey = fs.readFileSync(APOLLO_CERTIFICATE_KEY);
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
    Scope: HDFC_SCOPE,
    TransactionId: '2244167897',
    OAuthTokenValue: await generateAuthToken(),
    'Id-token-jwt': historyToken,
  };
  const response = await fetch(`${HDFC_URL}${url}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apiKey: HDFC_API_KEY,
    },
    body: JSON.stringify(request),
    agent: sslConfiguredAgent,
  });
  const decryptedResponse = decryptHighResponse(
    JSON.parse((await response.text()).replace(/(\r\n|\n|\r)/gm, ''))
  );
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
    Scope: HDFC_SCOPE,
    TransactionId: '2234167897',
    OAuthTokenValue: '',
    'Id-token-jwt': historyToken,
  };
  const response = await fetch(`${HDFC_URL}${url}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apiKey: HDFC_API_KEY,
    },
    body: JSON.stringify(request),
    agent: sslConfiguredAgent,
  });
  const decryptedResponse = decryptMediumResponse(
    JSON.parse((await response.text()).replace(/(\r\n|\n|\r)/gm, ''))
  );

  return decryptedResponse;
}

function symmetricKeyEncryptedValue(symmetricKey: String) {
  const publicKey = fs.readFileSync(HDFC_PUBLIC_CERTIFICATE, 'utf8');
  return crypto
    .publicEncrypt(
      { key: publicKey, padding: crypto.constants.RSA_PKCS1_PADDING },
      Buffer.from(symmetricKey)
    )
    .toString('base64');
}

function symmetricKeyDecryptedValue(symmetricKey: string) {
  const privatKey = fs.readFileSync(APOLLO_CERTIFICATE_KEY);
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
// console.log(generateOtp('9930207495'));
// console.log(verifyOtp('123456', '9930207495'));

// console.log(CustomerIdentification('9930207495', new Date('06-10-1960')));
// console.log(fetchEthnicCode(new Date('06-10-1960'), '9930207495'));
