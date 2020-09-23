"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.fetchEthnicCode = exports.customerIdentification = exports.verifyOtp = exports.generateOtp = void 0;
var fs = require("fs");
var path = require("path");
var https = require("https");
var node_fetch_1 = require("node-fetch");
var crypto = require("crypto");
var cryptojs = require("crypto-js");
var jwt = require("jsonwebtoken");
var HDFC_URL = 'https://openapiuat.hdfcbank.com:9443';
var HDFC_API_KEY = 'l7ba164d15f9de442687e69c89d380b35a';
var HDFC_AUTHURIZATION_HEADER = 'Basic bDdiYTE2NGQxNWY5ZGU0NDI2ODdlNjljODlkMzgwYjM1YTo4OTA4NmI4ZjRlOTg0YTBkYTg5OTZhMzk0YTEzNDI5Ng==';
var HDFC_PUBLIC_CERTIFICATE = '/Users/jarvis/Downloads/openapiuat.hdfcbank.com/openapiuat_hdfcbank_com.cer';
var HDFC_HASH_KEY = 'B9E7O1A7B1';
var HDFC_SMS_USERID = 'banker1245';
var HDFC_SMS_PASSWORD = 'DJ1za79m9x2KA';
var HDFC_CALLER_ID = 'hdfc_Api';
var HDFC_DEPARTMENT_CODE = 'APIGWOTP';
var APOLLO_CERTIFICATE_KEY = '/Users/jarvis/Downloads/integrations.apollo247.com/decrypted_key.key';
var APOLLO_CERTIFICATE = '/Users/jarvis/Downloads/integrations.apollo247.com/hdfc.pem';
var APOLLO_CERTIFICATE_PASSWORD = 'hdfc';
var HDFC_SCOPE = 'apollo_uat';
var INSTANCE_ID = '8888';
var options = {
    cert: fs.readFileSync(path.resolve(__dirname, "" + APOLLO_CERTIFICATE), "utf-8"),
    key: fs.readFileSync(path.resolve(__dirname, "" + APOLLO_CERTIFICATE_KEY), 'utf-8'),
    passphrase: "" + APOLLO_CERTIFICATE_PASSWORD,
    rejectUnauthorized: true,
    keepAlive: false
};
var sslConfiguredAgent = new https.Agent(options);
function generateAuthToken() {
    return __awaiter(this, void 0, void 0, function () {
        var response, body, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, node_fetch_1["default"](HDFC_URL + "/AUTH/OAUTH/V2/token?grant_type=client_credentials&scope=" + HDFC_SCOPE, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            Authorization: "" + HDFC_AUTHURIZATION_HEADER
                        }
                    })];
                case 1:
                    response = _c.sent();
                    _b = (_a = JSON).parse;
                    return [4 /*yield*/, response.text()];
                case 2:
                    body = _b.apply(_a, [_c.sent()]);
                    return [2 /*return*/, body['access_token']];
            }
        });
    });
}
function generateOtp(mobile) {
    return __awaiter(this, void 0, void 0, function () {
        var formattedMobile, linkData, refNo, shaMessageHash, messageHash, requestBeforeEncryption, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    formattedMobile = mobile.substr(mobile.length - 10);
                    linkData = "000000091" + formattedMobile;
                    refNo = refNoGenerator();
                    shaMessageHash = crypto
                        .createHash('sha1')
                        .update(INSTANCE_ID +
                        '|' +
                        HDFC_CALLER_ID +
                        '|' +
                        linkData +
                        '|' +
                        refNo +
                        '|' +
                        false +
                        '|' +
                        HDFC_HASH_KEY)
                        .digest('base64');
                    messageHash = "static:genpwdreq:06:" + shaMessageHash;
                    requestBeforeEncryption = {
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
                            customerMobileNo: "91" + formattedMobile,
                            otpPasswordValue: '',
                            sms_userid: HDFC_SMS_USERID,
                            sms_password: HDFC_SMS_PASSWORD,
                            ctype: '1',
                            sender: 'HDFCBank',
                            mobilenumber: "91" + formattedMobile,
                            msgtxt: 'Your confidential one time password for HDFC Bank Credit card on call authentication is #OTP#, valid for 2 hours. Kindly enter this OTP as prompted by IVR.',
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
                                consumer_name: ''
                            },
                            soafillers: {
                                filler1: '',
                                filler2: '',
                                filler3: '',
                                filler4: '',
                                filler5: ''
                            }
                        }
                    };
                    return [4 /*yield*/, highRequest(requestBeforeEncryption, '/API/OTP_Gen')];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response];
            }
        });
    });
}
exports.generateOtp = generateOtp;
function refNoGenerator() {
    var currentDate = new Date();
    return "" + (currentDate.getTime() * 1000 + currentDate.getMilliseconds());
}
function verifyOtp(otp, mobile) {
    return __awaiter(this, void 0, void 0, function () {
        var formattedMobile, refNo, linkData, shaMessageHash, messageHash, requestBeforeEncryption, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    formattedMobile = mobile.substr(mobile.length - 10);
                    refNo = refNoGenerator();
                    linkData = "000000091" + formattedMobile;
                    shaMessageHash = crypto
                        .createHash('sha1')
                        .update(INSTANCE_ID +
                        '|' +
                        HDFC_CALLER_ID +
                        '|' +
                        linkData +
                        '|' +
                        refNo +
                        '|' +
                        otp +
                        '|' +
                        HDFC_HASH_KEY)
                        .digest('base64');
                    messageHash = "static:verpwdreq:06:" + shaMessageHash;
                    requestBeforeEncryption = {
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
                                fillerField5: ''
                            }
                        }
                    };
                    return [4 /*yield*/, highRequest(requestBeforeEncryption, '/API/OTP_Val_v2')];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response];
            }
        });
    });
}
exports.verifyOtp = verifyOtp;
function customerIdentification(mobile, dateOfBirth) {
    return __awaiter(this, void 0, void 0, function () {
        var formattedMobile, formattedDateOfBirth, requestBeforeEncryption, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    formattedMobile = mobile.substr(mobile.length - 10);
                    formattedDateOfBirth = "" + dateOfBirth.getFullYear() + ('0' +
                        (dateOfBirth.getMonth() + 1)).slice(-2) + ('0' + dateOfBirth.getDate()).slice(-2);
                    requestBeforeEncryption = {
                        FetchCustomerCASADetailsReqDTO: {
                            mobileNumber: formattedMobile,
                            dateOfBirth: formattedDateOfBirth
                        },
                        sessionContext: {
                            channel: 'APIGW',
                            bankCode: '08',
                            userId: 'DevUser01',
                            transactionBranch: '089999',
                            userReferenceNumber: '12349876'
                        }
                    };
                    return [4 /*yield*/, mediumRequest(requestBeforeEncryption, '/API/CustomerIdentification')];
                case 1:
                    response = _a.sent();
                    console.log(response);
                    return [2 /*return*/, response];
            }
        });
    });
}
exports.customerIdentification = customerIdentification;
function fetchEthnicCode(dateOfBirth, mobile, historyToken) {
    var formattedMobile = mobile.substr(mobile.length - 10);
    var externalReferenceNo = refNoGenerator();
    var formattedDateOfBirth = "" + dateOfBirth.getFullYear() + ('0' +
        (dateOfBirth.getMonth() + 1)).slice(-2) + ('0' + dateOfBirth.getDate()).slice(-2);
    var requestBeforeEncryption = {
        FetchCustomerCASADetailsReqDTO: {
            dateOfBirth: formattedDateOfBirth,
            mobileNumber: formattedMobile,
            panNumber: ''
        },
        sessionContext: {
            bankCode: '08',
            channel: 'ACL',
            userId: 'DevUser01',
            transactionBranch: '089999',
            externalReferenceNo: externalReferenceNo
        }
    };
    var response = mediumRequest(requestBeforeEncryption, '/API/Fetch_EthnicCode_RM_Dtls', historyToken);
    return response;
}
exports.fetchEthnicCode = fetchEthnicCode;
function decryptHighResponse(response) {
    return __awaiter(this, void 0, void 0, function () {
        var symmetricKey, decipher, decrypted, jwt2ndpartbase64;
        return __generator(this, function (_a) {
            symmetricKey = symmetricKeyDecryptedValue(response['GWSymmetricKeyEncryptedValue']);
            decipher = crypto.createDecipheriv('AES-256-CBC', symmetricKey, response['ResponseSignatureEncryptedValue'].substring(0, 16));
            decrypted = decipher.update(response['ResponseSignatureEncryptedValue'], 'base64').toString() +
                decipher.final();
            jwt2ndpartbase64 = cryptojs.enc.Base64.parse(decrypted.split('.')[1]);
            return [2 /*return*/, {
                    decryptedResponse: JSON.parse(jwt2ndpartbase64.toString(cryptojs.enc.Utf8).replace(/(\r\n|\n|\r)/gm, '')),
                    historyToken: response['Id-token-jwt']
                }];
        });
    });
}
function highRequest(base_request, url, historyToken) {
    if (historyToken === void 0) { historyToken = ''; }
    return __awaiter(this, void 0, void 0, function () {
        var key, privateKey, jwt_request, iv, RequestSignatureEncryptedValue, request, response, decryptedResponse, _a, _b, _c;
        var _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    key = randomStringGenerator(32);
                    privateKey = fs.readFileSync(APOLLO_CERTIFICATE_KEY);
                    jwt_request = jwt.sign(base_request, privateKey, { algorithm: 'RS256' });
                    iv = randomStringGenerator(16);
                    RequestSignatureEncryptedValue = cryptojs.AES.encrypt("" + iv + jwt_request, cryptojs.enc.Utf8.parse(key), {
                        iv: cryptojs.enc.Utf8.parse(iv),
                        padding: cryptojs.pad.Pkcs7,
                        mode: cryptojs.mode.CBC
                    }).toString();
                    _d = {
                        RequestSignatureEncryptedValue: RequestSignatureEncryptedValue,
                        SymmetricKeyEncryptedValue: symmetricKeyEncryptedValue(key),
                        Scope: HDFC_SCOPE,
                        TransactionId: '2244167897'
                    };
                    return [4 /*yield*/, generateAuthToken()];
                case 1:
                    request = (_d.OAuthTokenValue = _e.sent(),
                        _d['Id-token-jwt'] = historyToken,
                        _d);
                    return [4 /*yield*/, node_fetch_1["default"]("" + HDFC_URL + url, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                apiKey: HDFC_API_KEY
                            },
                            body: JSON.stringify(request),
                            agent: sslConfiguredAgent
                        })];
                case 2:
                    response = _e.sent();
                    console.log(request);
                    _a = decryptHighResponse;
                    _c = (_b = JSON).parse;
                    return [4 /*yield*/, response.text()];
                case 3:
                    decryptedResponse = _a.apply(void 0, [_c.apply(_b, [(_e.sent()).replace(/(\r\n|\n|\r)/gm, '')])]);
                    return [2 /*return*/, decryptedResponse];
            }
        });
    });
}
function decryptMediumResponse(response) {
    return __awaiter(this, void 0, void 0, function () {
        var symmetricKey, decipher, decrypted;
        return __generator(this, function (_a) {
            symmetricKey = symmetricKeyDecryptedValue(response['GWSymmetricKeyEncryptedValue']);
            decipher = crypto.createDecipheriv('AES-256-CBC', symmetricKey, response['ResponseEncryptedValue'].substring(0, 16));
            decrypted = decipher.update(response['ResponseEncryptedValue'], 'base64').toString() + decipher.final();
            return [2 /*return*/, {
                    decryptedResponse: JSON.parse(decrypted.slice(decrypted.indexOf('{'))),
                    historyToken: response['Id-token-jwt']
                }];
        });
    });
}
function mediumRequest(base_request, url, historyToken) {
    if (historyToken === void 0) { historyToken = ''; }
    return __awaiter(this, void 0, void 0, function () {
        var key, iv, RequestEncryptedValue, request, response, decryptedResponse, _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    key = randomStringGenerator(32);
                    iv = randomStringGenerator(16);
                    RequestEncryptedValue = cryptojs.AES.encrypt("" + iv + JSON.stringify(base_request), cryptojs.enc.Utf8.parse(key), {
                        iv: cryptojs.enc.Utf8.parse(iv),
                        padding: cryptojs.pad.Pkcs7,
                        mode: cryptojs.mode.CBC
                    }).toString();
                    request = {
                        RequestEncryptedValue: RequestEncryptedValue,
                        SymmetricKeyEncryptedValue: symmetricKeyEncryptedValue(key),
                        Scope: HDFC_SCOPE,
                        TransactionId: '2234167897',
                        OAuthTokenValue: '',
                        'Id-token-jwt': historyToken
                    };
                    return [4 /*yield*/, node_fetch_1["default"]("" + HDFC_URL + url, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                apiKey: HDFC_API_KEY
                            },
                            body: JSON.stringify(request),
                            agent: sslConfiguredAgent
                        })];
                case 1:
                    response = _d.sent();
                    _a = decryptMediumResponse;
                    _c = (_b = JSON).parse;
                    return [4 /*yield*/, response.text()];
                case 2:
                    decryptedResponse = _a.apply(void 0, [_c.apply(_b, [(_d.sent()).replace(/(\r\n|\n|\r)/gm, '')])]);
                    return [2 /*return*/, decryptedResponse];
            }
        });
    });
}
function symmetricKeyEncryptedValue(symmetricKey) {
    var publicKey = fs.readFileSync(HDFC_PUBLIC_CERTIFICATE, 'utf8');
    return crypto
        .publicEncrypt({ key: publicKey, padding: crypto.constants.RSA_PKCS1_PADDING }, Buffer.from(symmetricKey))
        .toString('base64');
}
function symmetricKeyDecryptedValue(symmetricKey) {
    var privatKey = fs.readFileSync(APOLLO_CERTIFICATE_KEY);
    var value = crypto
        .privateDecrypt({ key: privatKey, padding: crypto.constants.RSA_PKCS1_PADDING }, Buffer.from(symmetricKey, 'base64'))
        .toString();
    return value;
}
function randomStringGenerator(length) {
    return crypto
        .randomBytes(length)
        .toString('base64')
        .slice(0, length);
}
// console.log(cryptojs.enc.Base64.parse('c2F5IEhJ'));
// console.log(await generateOtp('9930207495'));
// console.log(verifyOtp('123456', '9930207495'));
// console.log(CustomerIdentification('9930207495', new Date('06-10-1960')));
// console.log(fetchEthnicCode(new Date('06-10-1960'), '9930207495'));
function executeTestRun() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _b = (_a = console).log;
                    return [4 /*yield*/, generateOtp('9930207495')];
                case 1:
                    _b.apply(_a, [_c.sent()]);
                    console.log(verifyOtp('123456', '9930207495'));
                    return [2 /*return*/];
            }
        });
    });
}
executeTestRun();
