import { EntityRepository, Repository } from 'typeorm';
import { Patient, PRISM_DOCUMENT_CATEGORY } from 'profiles-service/entities';
import { ApiConstants } from 'ApiConstants';
import requestPromise from 'request-promise';
import { UhidCreateResult } from 'types/uhidCreateTypes';

import {
  PrismGetAuthTokenResponse,
  PrismGetAuthTokenError,
  PrismGetUsersError,
  PrismGetUsersResponse,
  PrismSignUpUserData,
} from 'types/prism';

import { UploadDocumentInput } from 'profiles-service/resolvers/uploadDocumentToPrism';

import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { format } from 'date-fns';
import { AthsTokenResponse } from 'types/uhidCreateTypes';
import winston from 'winston';

const filePath = 'api/src/profile-service/patientRepository/';
const authLog = {
  level: 'info',
  path: '',
  message: '',
  time: '',
  response: '',
  error: '',
};

@EntityRepository(Patient)
export class PatientRepository extends Repository<Patient> {
  findById(id: string) {
    return this.findOne({ where: { id } });
  }

  getPatientDetails(id: string) {
    return this.findOne({
      where: { id, isActive: true },
      relations: [
        'lifeStyle',
        'healthVault',
        'familyHistory',
        'patientAddress',
        'patientDeviceTokens',
        'patientNotificationSettings',
        'patientMedicalHistory',
      ],
    });
  }

  findByMobileNumber(mobileNumber: string) {
    return this.find({
      where: { mobileNumber, isActive: true },
      relations: [
        'lifeStyle',
        'healthVault',
        'familyHistory',
        'patientAddress',
        'patientDeviceTokens',
        'patientNotificationSettings',
        'patientMedicalHistory',
      ],
    });
  }

  findDetailsByMobileNumber(mobileNumber: string) {
    return this.findOne({
      where: { mobileNumber, isActive: true },
      relations: [
        'lifeStyle',
        'healthVault',
        'familyHistory',
        'patientAddress',
        'patientDeviceTokens',
        'patientNotificationSettings',
        'patientMedicalHistory',
      ],
    });
  }

  updatePatientAllergies(id: string, allergies: string) {
    return this.update(id, { allergies });
  }

  //utility method to get prism auth token
  async getPrismAuthToken(mobileNumber: string) {
    //setting mobile number to static value in local/dev env prism calls
    if (process.env.NODE_ENV === 'local' || process.env.NODE_ENV === 'dev') {
      mobileNumber = '8019677178';
    }

    const prismHeaders = {
      method: 'GET',
      timeOut: ApiConstants.PRISM_TIMEOUT,
    };

    const url = `${process.env.PRISM_GET_AUTH_TOKEN_API}?mobile=${mobileNumber}`;
    const msg = `External_API_Call: ${url}`;
    const authTokenResult = await fetch(url, prismHeaders)
      .then((res) => res.json() as Promise<PrismGetAuthTokenResponse>)
      .catch((error: PrismGetAuthTokenError) => {
        this.createLog(msg, 'getPrismAuthToken->catchBlock', '', JSON.stringify(error));
        throw new AphError(AphErrorMessages.PRISM_AUTH_TOKEN_ERROR);
      });

    this.createLog(msg, 'getPrismAuthToken->response', JSON.stringify(authTokenResult), '');

    return authTokenResult !== null ? authTokenResult.response : null;
  }

  //utility method to get prism users list
  async getPrismUsersList(mobileNumber: string, authToken: string) {
    //setting mobile number to static value in local/dev environments
    if (process.env.NODE_ENV === 'local' || process.env.NODE_ENV === 'dev') {
      mobileNumber = '8019677178';
    }

    const prismHeaders = {
      method: 'GET',
      timeOut: ApiConstants.PRISM_TIMEOUT,
    };

    const url = `${process.env.PRISM_GET_USERS_API}?authToken=${authToken}&mobile=${mobileNumber}`;
    const msg = `External_API_Call: ${url}`;
    const usersResult = await fetch(url, prismHeaders)
      .then((res) => res.json() as Promise<PrismGetUsersResponse>)
      .catch((error: PrismGetUsersError) => {
        this.createLog(msg, 'getPrismUsersList->catchBlock', '', JSON.stringify(error));
        throw new AphError(AphErrorMessages.PRISM_GET_USERS_ERROR);
      });

    this.createLog(msg, 'getPrismUsersList->response', JSON.stringify(usersResult), '');

    return usersResult && usersResult.response ? usersResult.response.signUpUserData : [];
  }

  //getPrismAuthTokenByUHID
  async getPrismAuthTokenByUHID(uhid: string) {
    const prismHeaders = {
      method: 'GET',
      timeOut: ApiConstants.PRISM_TIMEOUT,
    };

    const url = `${process.env.PRISM_GET_UHID_AUTH_TOKEN_API}?uhid=${uhid}`;
    const msg = `External_API_Call: ${url}`;
    const authTokenResult = await fetch(url, prismHeaders)
      .then((res) => res.json() as Promise<PrismGetAuthTokenResponse>)
      .catch((error: PrismGetAuthTokenError) => {
        this.createLog(msg, 'getPrismAuthTokenByUHID->catchBlock', '', JSON.stringify(error));
        throw new AphError(AphErrorMessages.PRISM_AUTH_TOKEN_ERROR);
      });

    this.createLog(msg, 'getPrismAuthTokenByUHID->response', JSON.stringify(authTokenResult), '');

    return authTokenResult !== null ? authTokenResult.response : null;
  }

  async validateAndGetUHID(id: string, prismUsersList: PrismSignUpUserData[]) {
    const patientData = await this.findOne({ where: { id } }).catch((error) => {
      throw new AphError(AphErrorMessages.GET_PROFILE_ERROR, undefined, {
        error,
      });
    });
    if (!patientData) {
      throw new AphError(AphErrorMessages.GET_PROFILE_ERROR, undefined, {
        error: 'Invalid PatientId',
      });
    }

    let uhid;
    if (
      (patientData.uhid === null || patientData.uhid === '') &&
      patientData.firstName.trim() !== ''
    ) {
      uhid = await this.createNewUhid(patientData.id);
    } else {
      const matchedUser = prismUsersList.filter((user) => user.UHID == patientData.uhid);
      uhid = matchedUser.length > 0 ? matchedUser[0].UHID : null;
    }

    //setting mobile number to static value in local/dev environments
    if (process.env.NODE_ENV === 'local' || process.env.NODE_ENV === 'dev') {
      uhid = 'AHB.0000724284';
    }

    return uhid;
  }

  //utility method to get prism user details
  async getPrismUsersDetails(uhid: string, authToken: string) {
    const prismHeaders = {
      method: 'GET',
      timeOut: ApiConstants.PRISM_TIMEOUT,
    };

    const url = `${process.env.PRISM_GET_USER_DETAILS_API}?authToken=${authToken}&uhid=${uhid}`;
    const msg = `External_API_Call: ${url}`;
    const detailsResult = await fetch(url, prismHeaders)
      .then((res) => {
        return res.json();
      })
      .catch((error) => {
        this.createLog(msg, 'getPrismUsersDetails->catchBlock', '', JSON.stringify(error));
        throw new AphError(AphErrorMessages.PRISM_GET_USERS_ERROR);
      });

    this.createLog(msg, 'getPrismUsersDetails->response', JSON.stringify(detailsResult), '');
    return detailsResult;
  }

  async uploadDocumentToPrism(uhid: string, prismAuthToken: string, docInput: UploadDocumentInput) {
    console.log('uhid:', uhid, 'authToken:', prismAuthToken);

    const currentTimeStamp = Math.floor(new Date().getTime() / 1000);
    const randomNumber = Math.floor(Math.random() * 10000);
    const fileFormat = docInput.fileType.toLowerCase();
    const documentName = `${currentTimeStamp}${randomNumber}.${fileFormat}`;
    const formData = {
      file: docInput.base64FileInput,
      authtoken: prismAuthToken,
      format: fileFormat,
      tag: docInput.category,
      programe: ApiConstants.PRISM_UPLOAD_DOCUMENT_PROGRAME,
      date: currentTimeStamp,
      uhid: uhid,
      category: PRISM_DOCUMENT_CATEGORY.OpSummary,
      filename: documentName,
    };

    const url = `${process.env.PRISM_UPLOAD_RECORDS_API}`;
    const msg = `External_API_Call: ${url}`;
    const options = {
      method: 'POST',
      url: url,
      headers: {
        Connection: 'keep-alive',
        'Accept-Encoding': 'gzip, deflate',
        Host: `${process.env.PRISM_HOST}`,
        Accept: '*/*',
      },
      formData: formData,
    };

    const uploadResult = await requestPromise(options)
      .then((res) => {
        console.log('uploadFileResponse:', res);
        return JSON.parse(res);
      })
      .catch((err) => {
        this.createLog(msg, 'uploadDocumentToPrism->catchBlock', '', JSON.stringify(err));
        console.log('Upload Prism Error: ', err);
        throw new AphError(AphErrorMessages.FILE_SAVE_ERROR);
      });

    this.createLog(msg, 'uploadDocumentToPrism->response', JSON.stringify(uploadResult), '');

    if (uploadResult.errorCode != '0' || uploadResult.response == 'fail') {
      throw new AphError(AphErrorMessages.FILE_SAVE_ERROR);
    }

    return uploadResult && uploadResult.response
      ? `${uploadResult.response}_${documentName}`
      : null;
  }

  async getPatientLabResults(uhid: string, authToken: string) {
    const prismHeaders = {
      method: 'GET',
      timeOut: ApiConstants.PRISM_TIMEOUT,
    };

    const url = `${process.env.PRISM_GET_USER_LAB_RESULTS_API}?authToken=${authToken}&uhid=${uhid}`;
    const msg = `External_API_Call: ${url}`;
    const labResults = await fetch(
      `${process.env.PRISM_GET_USER_LAB_RESULTS_API}?authToken=${authToken}&uhid=${uhid}`,
      prismHeaders
    )
      .then((res) => {
        return res.json();
      })
      .catch((error) => {
        this.createLog(msg, 'getPatientLabResults->catchBlock', '', JSON.stringify(error));
        throw new AphError(AphErrorMessages.GET_MEDICAL_RECORDS_ERROR);
      });

    this.createLog(msg, 'getPatientLabResults->response', JSON.stringify(labResults), '');

    return labResults.errorCode == '0' ? labResults.response : [];
  }

  async getPatientHealthChecks(uhid: string, authToken: string) {
    const prismHeaders = {
      method: 'GET',
      timeOut: ApiConstants.PRISM_TIMEOUT,
    };

    const url = `${process.env.PRISM_GET_USER_HEALTH_CHECKS_API}?authToken=${authToken}&uhid=${uhid}`;
    const msg = `External_API_Call: ${url}`;
    const healthChecks = await fetch(url, prismHeaders)
      .then((res) => {
        return res.json();
      })
      .catch((error) => {
        this.createLog(msg, 'getPatientHealthChecks->catchBlock', '', JSON.stringify(error));
        throw new AphError(AphErrorMessages.GET_MEDICAL_RECORDS_ERROR);
      });

    this.createLog(msg, 'getPatientHealthChecks->response', JSON.stringify(healthChecks), '');

    return healthChecks.errorCode == '0' ? healthChecks.response : [];
  }

  async getPatientHospitalizations(uhid: string, authToken: string) {
    const prismHeaders = {
      method: 'GET',
      timeOut: ApiConstants.PRISM_TIMEOUT,
    };

    const url = `${process.env.PRISM_GET_USER_HOSPITALIZATIONS_API}?authToken=${authToken}&uhid=${uhid}`;
    const msg = `External_API_Call: ${url}`;
    const hospitalizations = await fetch(url, prismHeaders)
      .then((res) => {
        return res.json();
      })
      .catch((error) => {
        this.createLog(msg, 'getPatientHospitalizations->catchBlock', '', JSON.stringify(error));
        throw new AphError(AphErrorMessages.GET_MEDICAL_RECORDS_ERROR);
      });

    this.createLog(
      msg,
      'getPatientHospitalizations->response',
      JSON.stringify(hospitalizations),
      ''
    );

    return hospitalizations.errorCode == '0' ? hospitalizations.response : [];
  }

  saveNewProfile(patientAttrs: Partial<Patient>) {
    return this.create(patientAttrs)
      .save()
      .catch((patientError) => {
        throw new AphError(AphErrorMessages.SAVE_NEW_PROFILE_ERROR, undefined, {
          patientError,
        });
      });
  }

  updateProfile(id: string, patientAttrs: Partial<Patient>) {
    return this.update(id, patientAttrs);
  }

  updateUhid(id: string, uhid: string) {
    return this.update(id, { uhid });
  }

  updateToken(id: string, athsToken: string) {
    return this.update(id, { athsToken });
  }

  deleteProfile(id: string) {
    return this.update(id, { isActive: false });
  }

  async createNewUhid(id: string) {
    const patientDetails = await this.getPatientDetails(id);
    this.createLog(
      'Patient Details',
      'createNewUhid()->patientDetails',
      JSON.stringify(patientDetails),
      ''
    );
    if (patientDetails == null)
      throw new AphError(AphErrorMessages.SAVE_NEW_PROFILE_ERROR, undefined, {});
    const newUhidUrl = process.env.CREATE_NEW_UHID_URL ? process.env.CREATE_NEW_UHID_URL : '';
    const uhidInput = {
      OnlineAppointmentID: null,
      Title: '1',
      LocationID: 10201,
      RegionID: 1,
      ResourceID: 0,
      StartDateTime: null,
      EndDateTime: null,
      FirstName: patientDetails.firstName,
      LastName: patientDetails.lastName,
      UHIDNumber: null,
      PRNNumber: null,
      ModeofAppointment: 'Apollo24|7',
      DateOfBirth: format(patientDetails.dateOfBirth, 'dd-MMM-yyyy'),
      MobileNumber: '91-' + patientDetails.mobileNumber.substr(3),
      RegistrationTypes: 'QUICKUHID',
      Gender: '72',
      MaritalStatus: '1',
      StatusCheck: null,
      ServiceID: 0,
      SpecialityID: 0,
      UpdatedBy: null,
      Country: 97,
      State: 280,
      District: 1134,
      City: 6277,
      Address_Line_1: '',
      EmailID: patientDetails.emailAddress,
      FatherName: '',
      SpouseName: null,
      MotherName: null,
      GaurdianName: null,
      EmergencyNumber: null,
      PinCode: '',
      Religion: null,
      AddressTypeID: 2,
      Occupation: null,
      Citizenship: '97',
      Flag: 1,
      RegAuthConsent: {
        PatientorAttendentName: '',
        PatientorAttendentAge: 0,
        NextofKinName: '',
        Resident: '',
        IpAddress: '',
        ConsentStatus: '',
        ConsentCreatedDate: '',
      },
      InternationalPatientFlag: false,
      InternationalPatient: {
        Nationality: '',
        PassportNo: '',
        VisaIssueDate: '',
        VisaExpDate: '',
        ResidingCity: '',
        CountryIssued: '',
        PassportIssueDate: '',
        PassportExpDate: '',
        VisaIssuingAuthority: '',
        Citizenship: '',
      },
    };
    this.createLog(
      'UHID Patient Input',
      'createNewUhid()->uhidInput',
      JSON.stringify(uhidInput),
      ''
    );

    const msg = `External_API_Call: ${newUhidUrl}`;
    const uhidCreateResp = await fetch(newUhidUrl, {
      method: 'POST',
      body: JSON.stringify(uhidInput),
      headers: {
        'Content-Type': 'application/json',
        Authkey: process.env.UHID_CREATE_AUTH_KEY ? process.env.UHID_CREATE_AUTH_KEY : '',
      },
    });

    const textProcessRes = await uhidCreateResp.text();
    this.createLog(msg, 'createNewUhid->response', textProcessRes, '');
    const uhidResp: UhidCreateResult = JSON.parse(textProcessRes);
    this.updateUhid(id, uhidResp.result.toString());
    return uhidResp.result;
  }

  createLog(message: string, context: string, response: string, error: string) {
    authLog.level = error == '' ? 'info' : 'error';
    authLog.message = message;
    authLog.time = format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSX");
    authLog.path = `${filePath}${context}`;
    authLog.response = response;
    authLog.error = JSON.stringify(error);
    winston.log(authLog);
  }

  async createAthsToken(id: string) {
    const patientDetails = await this.getPatientDetails(id);
    if (patientDetails == null)
      throw new AphError(AphErrorMessages.SAVE_NEW_PROFILE_ERROR, undefined, {});
    const athsTokenInput = {
      AdminId: process.env.ATHS_TOKEN_ADMIN ? process.env.ATHS_TOKEN_ADMIN.toString() : '',
      AdminPassword: process.env.ATHS_TOKEN_PWD ? process.env.ATHS_TOKEN_PWD.toString() : '',
      FirstName: patientDetails.firstName,
      LastName: patientDetails.lastName,
      countryCode: ApiConstants.COUNTRY_CODE.toString(),
      PhoneNumber: patientDetails.mobileNumber,
      DOB: format(patientDetails.dateOfBirth, 'dd/MM/yyyy'),
      Gender: '1',
      PartnerUserId: '1012',
      SourceApp: process.env.ATHS_SOURCE_APP ? process.env.ATHS_SOURCE_APP.toString() : '',
    };
    const athsTokenUrl = process.env.ATHS_TOKEN_CREATE ? process.env.ATHS_TOKEN_CREATE : '';
    const tokenResp = await fetch(athsTokenUrl, {
      method: 'POST',
      body: JSON.stringify(athsTokenInput),
      headers: { 'Content-Type': 'application/json' },
    });
    //console.log(tokenResp, 'token resp');
    const textRes = await tokenResp.text();
    const tokenResult: AthsTokenResponse = JSON.parse(textRes);
    if (tokenResult.Result && tokenResult.Result != '') {
      this.updateToken(id, JSON.parse(tokenResult.Result).Token);
    }
    console.log(
      tokenResult,
      'respp',
      tokenResult.Result,
      JSON.parse(tokenResult.Result),
      JSON.parse(tokenResult.Result).Token
    );
  }
}
