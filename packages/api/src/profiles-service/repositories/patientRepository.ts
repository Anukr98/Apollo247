import { EntityRepository, Repository } from 'typeorm';
import { Patient, PRISM_DOCUMENT_CATEGORY, Gender } from 'profiles-service/entities';
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
import { log } from 'customWinstonLogger';

@EntityRepository(Patient)
export class PatientRepository extends Repository<Patient> {
  findById(id: string) {
    return this.findOne({ where: { id } });
  }

  getPatientDetailsByIds(ids: string[]) {
    return this.createQueryBuilder('patient')
      .where('patient.id IN (:...ids)', { ids })
      .getMany();
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

  async findByMobileNumberLogin(mobileNumber: string) {
    const patientList = await this.find({
      where: { mobileNumber, isActive: true },
    });
    console.log('patient list count', patientList.length);
    if (patientList.length > 1) {
      patientList.map((patient) => {
        if (patient.firstName == '' || patient.uhid == '') {
          console.log(patient.id, 'blank card');
          this.update(patient.id, { isActive: false });
        }
      });
    }
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
    //setting mobile number to static value in non-production environments
    // mobileNumber =
    //   process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging'
    //     ? mobileNumber
    //     : ApiConstants.PRISM_STATIC_MOBILE_NUMBER;

    const prismHeaders = {
      method: 'GET',
      timeOut: ApiConstants.PRISM_TIMEOUT,
    };

    const url = `${process.env.PRISM_GET_AUTH_TOKEN_API}?mobile=${mobileNumber}`;
    log(
      'profileServiceLogger',
      `EXTERNAL_API_CALL_PRISM: ${url}`,
      'getPrismAuthToken()->API_CALL_STARTING',
      '',
      ''
    );
    const authTokenResult = await fetch(url, prismHeaders)
      .then((res) => res.json() as Promise<PrismGetAuthTokenResponse>)
      .catch((error: PrismGetAuthTokenError) => {
        log(
          'profileServiceLogger',
          'API_CALL_ERROR',
          'getPrismAuthToken()->CATCH_BLOCK',
          '',
          JSON.stringify(error)
        );
        throw new AphError(AphErrorMessages.PRISM_AUTH_TOKEN_ERROR);
      });

    log(
      'profileServiceLogger',
      'API_CALL_RESPONSE',
      'getPrismAuthToken()->API_CALL_RESPONSE',
      JSON.stringify(authTokenResult),
      ''
    );

    return authTokenResult !== null ? authTokenResult.response : null;
  }

  //utility method to get prism users list
  async getPrismUsersList(mobileNumber: string, authToken: string) {
    //setting mobile number to static value in non-production environments
    // mobileNumber =
    //   process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging'
    //     ? mobileNumber
    //     : ApiConstants.PRISM_STATIC_MOBILE_NUMBER;

    const prismHeaders = {
      method: 'GET',
      timeOut: ApiConstants.PRISM_TIMEOUT,
    };

    const url = `${process.env.PRISM_GET_USERS_API}?authToken=${authToken}&mobile=${mobileNumber}`;
    log(
      'profileServiceLogger',
      `EXTERNAL_API_CALL_PRISM: ${url}`,
      'getPrismUsersList()->API_CALL_STARTING',
      '',
      ''
    );
    const usersResult = await fetch(url, prismHeaders)
      .then((res) => res.json() as Promise<PrismGetUsersResponse>)
      .catch((error: PrismGetUsersError) => {
        log(
          'profileServiceLogger',
          'API_CALL_ERROR',
          'getPrismUsersList()->CATCH_BLOCK',
          '',
          JSON.stringify(error)
        );
        throw new AphError(AphErrorMessages.PRISM_GET_USERS_ERROR);
      });

    log(
      'profileServiceLogger',
      'API_CALL_RESPONSE',
      'getPrismUsersList()->API_CALL_RESPONSE',
      JSON.stringify(usersResult),
      ''
    );

    return usersResult && usersResult.response ? usersResult.response.signUpUserData : [];
  }

  //getPrismAuthTokenByUHID
  async getPrismAuthTokenByUHID(uhid: string) {
    const prismHeaders = {
      method: 'GET',
      timeOut: ApiConstants.PRISM_TIMEOUT,
    };

    const url = `${process.env.PRISM_GET_UHID_AUTH_TOKEN_API}?uhid=${uhid}`;
    log(
      'profileServiceLogger',
      `EXTERNAL_API_CALL_PRISM: ${url}`,
      'getPrismAuthTokenByUHID()->API_CALL_STARTING',
      '',
      ''
    );
    const authTokenResult = await fetch(url, prismHeaders)
      .then((res) => res.json() as Promise<PrismGetAuthTokenResponse>)
      .catch((error: PrismGetAuthTokenError) => {
        log(
          'profileServiceLogger',
          'API_CALL_ERROR',
          'getPrismAuthTokenByUHID()->CATCH_BLOCK',
          '',
          JSON.stringify(error)
        );
        throw new AphError(AphErrorMessages.PRISM_AUTH_TOKEN_ERROR);
      });
    log(
      'profileServiceLogger',
      'API_CALL_RESPONSE',
      'getPrismAuthTokenByUHID()->API_CALL_RESPONSE',
      JSON.stringify(authTokenResult),
      ''
    );

    return authTokenResult !== null ? authTokenResult.response : null;
  }

  async validateAndGetUHID(id: string, prismUsersList: PrismSignUpUserData[]) {
    const patientData = await this.findOne({ where: { id } }).catch((error) => {
      throw new AphError(AphErrorMessages.GET_PROFILE_ERROR, undefined, {
        error,
      });
    });
    log(
      'profileServiceLogger',
      `DEBUG_LOG`,
      'validateAndGetUHID()->patientData',
      JSON.stringify(patientData),
      ''
    );
    if (!patientData) {
      throw new AphError(AphErrorMessages.GET_PROFILE_ERROR, undefined, {
        error: 'Invalid PatientId',
      });
    }

    let uhid;
    if (patientData.uhid === null || patientData.uhid === '') {
      uhid = await this.createNewUhid(patientData.id);
      log(
        'profileServiceLogger',
        `DEBUG_LOG`,
        'validateAndGetUHID()->if->UHID',
        JSON.stringify(uhid),
        ''
      );
    } else {
      log(
        'profileServiceLogger',
        `DEBUG_LOG`,
        'validateAndGetUHID()->prismUsersList',
        JSON.stringify(prismUsersList),
        ''
      );
      const matchedUser = prismUsersList.filter((user) => user.UHID == patientData.uhid);

      log(
        'profileServiceLogger',
        `DEBUG_LOG`,
        'validateAndGetUHID()->matchedUser',
        JSON.stringify(matchedUser),
        ''
      );

      if (matchedUser.length > 0) {
        uhid = matchedUser[0].UHID;
      } else {
        //creating existing new medmentra uhids in prism
        await this.createPrismUser(patientData, patientData.uhid);
        uhid = patientData.uhid;
      }

      log(
        'profileServiceLogger',
        `DEBUG_LOG`,
        'validateAndGetUHID()->else->UHID',
        JSON.stringify(uhid),
        ''
      );
    }

    //setting mobile number to static value in non-production environments
    // uhid =
    //   process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging'
    //     ? uhid
    //     : ApiConstants.PRISM_STATIC_UHID;

    return uhid;
  }

  //utility method to get prism user details
  async getPrismUsersDetails(uhid: string, authToken: string) {
    const prismHeaders = {
      method: 'GET',
      timeOut: ApiConstants.PRISM_TIMEOUT,
    };

    const url = `${process.env.PRISM_GET_USER_DETAILS_API}?authToken=${authToken}&uhid=${uhid}`;
    log(
      'profileServiceLogger',
      `EXTERNAL_API_CALL_PRISM: ${url}`,
      'getPrismUsersDetails()->API_CALL_STARTING',
      '',
      ''
    );
    const detailsResult = await fetch(url, prismHeaders)
      .then((res) => {
        return res.json();
      })
      .catch((error) => {
        log(
          'profileServiceLogger',
          'API_CALL_ERROR',
          'getPrismUsersDetails()->CATCH_BLOCK',
          '',
          JSON.stringify(error)
        );

        throw new AphError(AphErrorMessages.PRISM_GET_USERS_ERROR);
      });

    log(
      'profileServiceLogger',
      'API_CALL_RESPONSE',
      'getPrismUsersDetails()->API_CALL_RESPONSE',
      JSON.stringify(detailsResult),
      ''
    );
    return detailsResult;
  }

  async uploadDocumentToPrism(uhid: string, prismAuthToken: string, docInput: UploadDocumentInput) {
    log(
      'profileServiceLogger',
      `DEBUG_LOG`,
      'uploadDocumentToPrism()->inputParams',
      JSON.stringify({ uhid, prismAuthToken }),
      ''
    );

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
    log(
      'profileServiceLogger',
      `EXTERNAL_API_CALL_PRISM: ${url}`,
      'uploadDocumentToPrism()->API_CALL_STARTING',
      '',
      ''
    );
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
      .catch((error) => {
        log(
          'profileServiceLogger',
          'API_CALL_ERROR',
          'uploadDocumentToPrism()->CATCH_BLOCK',
          '',
          JSON.stringify(error)
        );
        throw new AphError(AphErrorMessages.FILE_SAVE_ERROR);
      });

    log(
      'profileServiceLogger',
      'API_CALL_RESPONSE',
      'uploadDocumentToPrism()->API_CALL_RESPONSE',
      JSON.stringify(uploadResult),
      ''
    );

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
    log(
      'profileServiceLogger',
      `EXTERNAL_API_CALL_PRISM: ${url}`,
      'getPatientLabResults()->API_CALL_STARTING',
      '',
      ''
    );
    const labResults = await fetch(
      `${process.env.PRISM_GET_USER_LAB_RESULTS_API}?authToken=${authToken}&uhid=${uhid}`,
      prismHeaders
    )
      .then((res) => {
        return res.json();
      })
      .catch((error) => {
        log(
          'profileServiceLogger',
          'API_CALL_ERROR',
          'getPatientLabResults()->CATCH_BLOCK',
          '',
          JSON.stringify(error)
        );
        throw new AphError(AphErrorMessages.GET_MEDICAL_RECORDS_ERROR);
      });
    log(
      'profileServiceLogger',
      'API_CALL_RESPONSE',
      'getPatientLabResults()->API_CALL_RESPONSE',
      JSON.stringify(labResults),
      ''
    );

    return labResults.errorCode == '0' ? labResults.response : [];
  }

  async getPatientHealthChecks(uhid: string, authToken: string) {
    const prismHeaders = {
      method: 'GET',
      timeOut: ApiConstants.PRISM_TIMEOUT,
    };

    const url = `${process.env.PRISM_GET_USER_HEALTH_CHECKS_API}?authToken=${authToken}&uhid=${uhid}`;
    log(
      'profileServiceLogger',
      `EXTERNAL_API_CALL_PRISM: ${url}`,
      'getPatientHealthChecks()->API_CALL_STARTING',
      '',
      ''
    );
    const healthChecks = await fetch(url, prismHeaders)
      .then((res) => {
        return res.json();
      })
      .catch((error) => {
        log(
          'profileServiceLogger',
          'API_CALL_ERROR',
          'getPatientHealthChecks()->CATCH_BLOCK',
          '',
          JSON.stringify(error)
        );
        throw new AphError(AphErrorMessages.GET_MEDICAL_RECORDS_ERROR);
      });
    log(
      'profileServiceLogger',
      'API_CALL_RESPONSE',
      'getPatientHealthChecks()->API_CALL_RESPONSE',
      JSON.stringify(healthChecks),
      ''
    );

    return healthChecks.errorCode == '0' ? healthChecks.response : [];
  }

  async getPatientHospitalizations(uhid: string, authToken: string) {
    const prismHeaders = {
      method: 'GET',
      timeOut: ApiConstants.PRISM_TIMEOUT,
    };

    const url = `${process.env.PRISM_GET_USER_HOSPITALIZATIONS_API}?authToken=${authToken}&uhid=${uhid}`;
    log(
      'profileServiceLogger',
      `EXTERNAL_API_CALL_PRISM: ${url}`,
      'getPatientHospitalizations()->API_CALL_STARTING',
      '',
      ''
    );
    const hospitalizations = await fetch(url, prismHeaders)
      .then((res) => {
        return res.json();
      })
      .catch((error) => {
        log(
          'profileServiceLogger',
          'API_CALL_ERROR',
          'getPatientHospitalizations()->CATCH_BLOCK',
          '',
          JSON.stringify(error)
        );
        throw new AphError(AphErrorMessages.GET_MEDICAL_RECORDS_ERROR);
      });

    log(
      'profileServiceLogger',
      'API_CALL_RESPONSE',
      'getPatientHospitalizations()->API_CALL_RESPONSE',
      JSON.stringify(hospitalizations),
      ''
    );

    return hospitalizations.errorCode == '0' ? hospitalizations.response : [];
  }

  async getPatientOpPrescriptions(uhid: string, authToken: string) {
    const prismHeaders = {
      method: 'GET',
      timeOut: ApiConstants.PRISM_TIMEOUT,
    };

    const url = `${process.env.PRISM_GET_USER_OP_PRESCRIPTIONS_API}?authToken=${authToken}&uhid=${uhid}`;
    log(
      'profileServiceLogger',
      `EXTERNAL_API_CALL_PRISM: ${url}`,
      'getPatientOpPrescriptions()->API_CALL_STARTING',
      '',
      ''
    );
    const opPrescriptions = await fetch(url, prismHeaders)
      .then((res) => {
        return res.json();
      })
      .catch((error) => {
        log(
          'profileServiceLogger',
          'API_CALL_ERROR',
          'getPatientOpPrescriptions()->CATCH_BLOCK',
          '',
          JSON.stringify(error)
        );
        throw new AphError(AphErrorMessages.GET_MEDICAL_RECORDS_ERROR);
      });

    log(
      'profileServiceLogger',
      'API_CALL_RESPONSE',
      'getPatientOpPrescriptions()->API_CALL_RESPONSE',
      JSON.stringify(opPrescriptions),
      ''
    );

    return opPrescriptions.errorCode == '0' ? opPrescriptions.response : [];
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

  updateProfiles(updateAttrs: Partial<Patient>[]) {
    return this.save(updateAttrs).catch((savePatientError) => {
      throw new AphError(AphErrorMessages.SAVE_NEW_PROFILE_ERROR, undefined, {
        savePatientError,
      });
    });
  }

  updateProfile(id: string, patientAttrs: Partial<Patient>) {
    return this.update(id, patientAttrs);
  }

  updateUhid(id: string, uhid: string) {
    return this.update(id, { uhid, uhidCreatedDate: new Date() });
  }

  updateToken(id: string, athsToken: string) {
    return this.update(id, { athsToken });
  }

  deleteProfile(id: string) {
    return this.update(id, { isActive: false });
  }

  async createNewUhid(id: string) {
    const patientDetails = await this.getPatientDetails(id);
    log(
      'profileServiceLogger',
      `DEBUG_LOG`,
      'createNewUhid()->patientDetails',
      JSON.stringify(patientDetails),
      ''
    );
    if (!patientDetails) {
      throw new AphError(AphErrorMessages.GET_PROFILE_ERROR, undefined, {
        error: 'Invalid PatientId',
      });
    }

    //setting mandatory fields to create uhid in medmantra
    if (patientDetails.firstName === null || patientDetails.firstName === '') {
      patientDetails.firstName = 'New';
    }
    if (patientDetails.lastName === null || patientDetails.lastName === '') {
      patientDetails.lastName = 'User';
    }
    if (patientDetails.emailAddress === null) {
      patientDetails.emailAddress = '';
    }
    if (patientDetails.dateOfBirth === null) {
      patientDetails.dateOfBirth = new Date('1970-01-01');
    }

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

    log(
      'profileServiceLogger',
      `EXTERNAL_API_CALL_PRISM: ${newUhidUrl}`,
      'createNewUhid()->API_CALL_STARTING',
      JSON.stringify(uhidInput),
      ''
    );

    const uhidCreateResp = await fetch(newUhidUrl, {
      method: 'POST',
      body: JSON.stringify(uhidInput),
      headers: {
        'Content-Type': 'application/json',
        Authkey: process.env.UHID_CREATE_AUTH_KEY ? process.env.UHID_CREATE_AUTH_KEY : '',
      },
    }).catch((error) => {
      log(
        'profileServiceLogger',
        'API_CALL_ERROR',
        'createNewUhid()->CATCH_BLOCK',
        '',
        JSON.stringify(error)
      );
      throw new AphError(AphErrorMessages.PRISM_CREATE_UHID_ERROR);
    });

    const textProcessRes = await uhidCreateResp.text();
    log(
      'profileServiceLogger',
      'API_CALL_RESPONSE',
      'createNewUhid()->API_CALL_RESPONSE',
      textProcessRes,
      ''
    );
    const uhidResp: UhidCreateResult = JSON.parse(textProcessRes);
    this.updateUhid(id, uhidResp.result.toString());

    this.createPrismUser(patientDetails, uhidResp.result.toString());

    return uhidResp.result;
  }

  async createPrismUser(patientData: Patient, uhid: string) {
    //date of birth formatting

    if (patientData.firstName === null || patientData.firstName === '') {
      patientData.firstName = 'New';
    }
    if (patientData.lastName === null || patientData.lastName === '') {
      patientData.lastName = 'User';
    }
    if (patientData.gender === null) {
      patientData.gender = Gender.MALE;
    }
    if (patientData.emailAddress === null) {
      patientData.emailAddress = '';
    }
    let utc_dob = new Date().getTime();
    if (patientData.dateOfBirth != null) {
      utc_dob = new Date(patientData.dateOfBirth).getTime();
    }

    const queryParams = `securitykey=${
      process.env.PRISM_SECURITY_KEY
    }&gender=${patientData.gender.toLowerCase()}&firstName=${patientData.firstName}&lastName=${
      patientData.lastName
    }&mobile=${patientData.mobileNumber.substr(3)}&uhid=${uhid}&CountryPhoneCode=${
      ApiConstants.COUNTRY_CODE
    }&dob=${utc_dob}&sitekey=&martialStatus=&pincode=&email=${
      patientData.emailAddress
    }&state=&country=&city=&address=`;

    const createUserAPI = `${process.env.PRISM_CREATE_UHID_USER_API}?${queryParams}`;

    log(
      'profileServiceLogger',
      `EXTERNAL_API_CALL_PRISM: ${createUserAPI}`,
      'createPrismUser()->API_CALL_STARTING',
      '',
      ''
    );

    const uhidUserResp = await fetch(createUserAPI, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }).catch((error) => {
      log(
        'profileServiceLogger',
        'API_CALL_ERROR',
        'createPrismUser()->CATCH_BLOCK',
        '',
        JSON.stringify(error)
      );
      throw new AphError(AphErrorMessages.PRISM_CREATE_UHID_ERROR);
    });

    const textRes = await uhidUserResp.text();
    console.log(textRes);
    log(
      'profileServiceLogger',
      'API_CALL_RESPONSE',
      'createPrismUser()->API_CALL_RESPONSE',
      textRes,
      ''
    );
    return textRes;
  }

  async createAthsToken(id: string) {
    const patientDetails = await this.getPatientDetails(id);
    if (patientDetails == null)
      throw new AphError(AphErrorMessages.SAVE_NEW_PROFILE_ERROR, undefined, {});
    let patientDob = new Date('1984-01-01');
    if (patientDetails.dateOfBirth != null) {
      patientDob = patientDetails.dateOfBirth;
    }
    const athsTokenInput = {
      AdminId: process.env.ATHS_TOKEN_ADMIN ? process.env.ATHS_TOKEN_ADMIN.toString() : '',
      AdminPassword: process.env.ATHS_TOKEN_PWD ? process.env.ATHS_TOKEN_PWD.toString() : '',
      FirstName: patientDetails.firstName,
      LastName: patientDetails.lastName,
      countryCode: ApiConstants.COUNTRY_CODE.toString(),
      PhoneNumber: patientDetails.mobileNumber,
      DOB: format(patientDob, 'dd/MM/yyyy'),
      Gender: '1',
      PartnerUserId: '1012',
      SourceApp: process.env.ATHS_SOURCE_APP ? process.env.ATHS_SOURCE_APP.toString() : '',
    };
    const athsTokenUrl = process.env.ATHS_TOKEN_CREATE ? process.env.ATHS_TOKEN_CREATE : '';
    log(
      'profileServiceLogger',
      `EXTERNAL_API_CALL_PRISM: ${athsTokenUrl}`,
      'createAthsToken()->API_CALL_STARTING',
      '',
      ''
    );
    const tokenResp = await fetch(athsTokenUrl, {
      method: 'POST',
      body: JSON.stringify(athsTokenInput),
      headers: { 'Content-Type': 'application/json' },
    })
      .then((res) => {
        return res.text();
      })
      .catch((error) => {
        log(
          'profileServiceLogger',
          'API_CALL_ERROR',
          'createAthsToken()->CATCH_BLOCK',
          '',
          JSON.stringify(error)
        );
        throw new AphError(AphErrorMessages.PRISM_CREATE_ATHS_TOKEN_ERROR);
      });
    //console.log(tokenResp, 'token resp');
    log(
      'profileServiceLogger',
      'API_CALL_RESPONSE',
      'createAthsToken()->API_CALL_RESPONSE',
      JSON.stringify(tokenResp),
      ''
    );

    const tokenResult: AthsTokenResponse = JSON.parse(tokenResp);
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

  getIdsByMobileNumber(mobileNumber: string) {
    return this.find({
      where: { mobileNumber, isActive: true },
    });
  }
}
