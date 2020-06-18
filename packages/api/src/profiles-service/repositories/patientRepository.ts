import { EntityRepository, Repository } from 'typeorm';
import { Patient, PRISM_DOCUMENT_CATEGORY, Gender } from 'profiles-service/entities';
import { ApiConstants } from 'ApiConstants';
import requestPromise from 'request-promise';
import { UhidCreateResult } from 'types/uhidCreateTypes';
import { redis } from 'profiles-service/database/connectRedis';

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
import { format, getUnixTime } from 'date-fns';
import { AthsTokenResponse } from 'types/uhidCreateTypes';
import { debugLog } from 'customWinstonLogger';
import { map } from 'bluebird';

type DeviceCount = {
  mobilenumber: string;
  mobilecount: number;
};

// Curried method with static parameters being passed.
const dLogger = debugLog(
  'profileServiceLogger',
  'patientRepository',
  Math.floor(Math.random() * 100000000)
);

@EntityRepository(Patient)
export class PatientRepository extends Repository<Patient> {
  findById(id: string) {
    return this.findOne({ where: { id } });
  }

  findPatientDetailsByIdsAndFields(ids: string[], fields: string[]) {
    return this.createQueryBuilder('patient')
      .select(fields)
      .where('patient.id IN (:...ids)', { ids })
      .getMany();
  }

  getPatientDetailsByIds(ids: string[]) {
    return this.createQueryBuilder('patient')
      .where('patient.id IN (:...ids)', { ids })
      .getMany();
  }
  //cache this
  async getDeviceCodeCount(deviceCode: string) {
    const deviceCodeCount: DeviceCount[] = await this.createQueryBuilder('patient')
      .select(['"mobileNumber" as mobilenumber'])
      .where('patient."deviceCode" = :deviceCode', { deviceCode })
      .groupBy('patient."mobileNumber"')
      .getRawMany();
    return deviceCodeCount.length;
  }

  async getPatientDetails(id: string) {
    const patient = await this.getByIdFromRedis;
    return patient;
  }

  findByMobileNumber(mobileNumber: string) {
    return this.getByMobileFromRedis(mobileNumber);
  }

  async getByIdFromRedis(id: string | number) {
    if ((await redis.exists(`patient:${id}`)) > 0) {
      let patient = await redis.get(`patient:${id}`);
      dLogger(new Date(), 'Redis Cache Read of Patient', `Cache hit patient:${id}`);
      return patient;
    } else return await this.setByIdFromRedis(id);
  }

  async getPatientData(id: string | number) {
    const relations = [
      'lifeStyle',
      'healthVault',
      'familyHistory',
      'patientAddress',
      'patientDeviceTokens',
      'patientNotificationSettings',
      'patientMedicalHistory',
    ];
    return this.findOne({
      where: { id, isActive: true },
      relations: relations,
    });
  }

  async setByIdFromRedis(id: string | number) {
    const patientDetails = await this.getPatientData(id);
    await redis.set(`Patient:${id}`, JSON.stringify(patientDetails));
    await redis.expire(`Patient:${id}`, 3600);
    dLogger(new Date(), 'Redis Cache Write of Patient', `Cache miss/write patient:${id}`);
    return patientDetails;
  }

  async setByMobileFromRedis(mobile: string) {
    const patients = await this.find({
      where: { mobile, isActive: true },
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
    const patientIds: string[] = await patients.map((patient) => {
      return patient.id;
    });
    await redis.set(`Patient:mobile:${mobile}`, patientIds.join(','));
    await redis.expire(`Patient:mobile:${mobile}`, 3600);
    dLogger(
      new Date(),
      'Redis Cache Write of Patient',
      `Cache miss/write Patient:mobile:${mobile}`
    );
    return patients;
  }

  async getByMobileFromRedis(mobile: string) {
    const ids = await redis.get(`Patient:mobile:${mobile}`);
    if (typeof ids === 'string') {
      dLogger(new Date(), 'Redis Cache Read of Patient', `Cache hit Patient:mobile:${mobile}`);
      const patientIds: string[] = ids.split(',');
      const patients = patientIds.map((patientId: string) => {
        const patient = redis.get(`Patient:${patientId}`);
        if (typeof patient === 'string') {
          dLogger(new Date(), 'Redis Cache Read of Patient', `Cache hit Patient:${patientId}`);
          return JSON.parse(patient);
        }
      });
      return patients;
    } else {
      return this.setByMobileFromRedis(mobile);
    }
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
        } else if (patient.primaryPatientId == null) {
          this.update(patient.id, { primaryPatientId: patient.id });
        }
      });
    } else {
      if (patientList[0].primaryPatientId == null) {
        this.update(patientList[0].id, { primaryPatientId: patientList[0].id });
      }
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
    const prismHeaders = {
      method: 'GET',
      timeOut: ApiConstants.PRISM_TIMEOUT,
    };

    const url = `${process.env.PRISM_GET_AUTH_TOKEN_API}?mobile=${mobileNumber}`;

    const reqStartTime = new Date();
    const authTokenResult = await fetch(url, prismHeaders)
      .then((res) => res.json() as Promise<PrismGetAuthTokenResponse>)
      .catch((error: PrismGetAuthTokenError) => {
        dLogger(
          reqStartTime,
          'getPrismAuthToken PRISM_GET_AUTHTOKEN_API_CALL___ERROR',
          `${url} --- ${JSON.stringify(error)}`
        );
        throw new AphError(AphErrorMessages.PRISM_AUTH_TOKEN_ERROR);
      });
    dLogger(
      reqStartTime,
      'getPrismAuthToken PRISM_GET_AUTHTOKEN_API_CALL___END',
      `${url} --- ${JSON.stringify(authTokenResult)}`
    );

    return authTokenResult !== null ? authTokenResult.response : null;
  }

  //utility method to get prism users list
  async getPrismUsersList(mobileNumber: string, authToken: string) {
    const prismHeaders = {
      method: 'GET',
      timeOut: ApiConstants.PRISM_TIMEOUT,
    };

    const url = `${process.env.PRISM_GET_USERS_API}?authToken=${authToken}&mobile=${mobileNumber}`;

    const reqStartTime = new Date();
    const usersResult = await fetch(url, prismHeaders)
      .then((res) => res.json() as Promise<PrismGetUsersResponse>)
      .catch((error: PrismGetUsersError) => {
        dLogger(
          reqStartTime,
          'getPrismUsersList PRISM_GET_USERS_API_CALL___ERROR',
          `${url} --- ${JSON.stringify(error)}`
        );
        throw new AphError(AphErrorMessages.PRISM_GET_USERS_ERROR);
      });
    dLogger(
      reqStartTime,
      'getPrismUsersList PRISM_GET_USERS_API_CALL___END',
      `${url} --- ${JSON.stringify(usersResult)}`
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

    const reqStartTime = new Date();
    const authTokenResult = await fetch(url, prismHeaders)
      .then((res) => res.json() as Promise<PrismGetAuthTokenResponse>)
      .catch((error: PrismGetAuthTokenError) => {
        dLogger(
          reqStartTime,
          'getPrismAuthTokenByUHID PRISM_GET_UHID_AUTH_TOKEN_API_CALL___ERROR',
          `${url} --- ${JSON.stringify(error)}`
        );
        throw new AphError(AphErrorMessages.PRISM_AUTH_TOKEN_ERROR);
      });
    dLogger(
      reqStartTime,
      'getPrismAuthTokenByUHID PRISM_GET_UHID_AUTH_TOKEN_API_CALL___END',
      `${url} --- ${JSON.stringify(authTokenResult)}`
    );

    return authTokenResult !== null ? authTokenResult.response : null;
  }

  async validateAndGetUHID(id: string, prismUsersList: PrismSignUpUserData[]) {
    const reqStartTime = new Date();
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
    if (patientData.uhid === null || patientData.uhid === '') {
      uhid = await this.createNewUhid(patientData.id);
    } else {
      const matchedUser = prismUsersList.filter((user) => user.UHID == patientData.uhid);
      dLogger(
        reqStartTime,
        'validateAndGetUHID VALIDATE_AND_GET_UHID___END',
        `${JSON.stringify(prismUsersList)} --- ${JSON.stringify(matchedUser)}`
      );

      if (matchedUser.length > 0) {
        uhid = matchedUser[0].UHID;
      } else {
        //creating existing new medmentra uhids in prism
        await this.createPrismUser(patientData, patientData.uhid);
        uhid = patientData.uhid;
      }
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

    const reqStartTime = new Date();
    const detailsResult = await fetch(url, prismHeaders)
      .then((res) => {
        return res.json();
      })
      .catch((error) => {
        dLogger(
          reqStartTime,
          'getPrismUsersDetails PRISM_GET_USER_DETAILS_API_CALL___ERROR',
          `${url} --- ${JSON.stringify(error)}`
        );
        throw new AphError(AphErrorMessages.PRISM_GET_USERS_ERROR);
      });
    dLogger(
      reqStartTime,
      'getPrismUsersDetails PRISM_GET_USER_DETAILS_API_CALL___END',
      `${url} --- ${JSON.stringify(detailsResult)}`
    );

    return detailsResult;
  }

  async uploadDocumentToPrism(uhid: string, prismAuthToken: string, docInput: UploadDocumentInput) {
    let category = docInput.category ? docInput.category : PRISM_DOCUMENT_CATEGORY.OpSummary;
    category =
      category == PRISM_DOCUMENT_CATEGORY.HealthChecks
        ? PRISM_DOCUMENT_CATEGORY.OpSummary
        : category;
    const currentTimeStamp = getUnixTime(new Date()) * 1000;
    const randomNumber = Math.floor(Math.random() * 10000);
    const fileFormat = docInput.fileType.toLowerCase();
    const documentName = `${currentTimeStamp}${randomNumber}.${fileFormat}`;
    const formData = {
      file: docInput.base64FileInput,
      authtoken: prismAuthToken,
      format: fileFormat,
      tag: category,
      programe: ApiConstants.PRISM_UPLOAD_DOCUMENT_PROGRAME,
      date: currentTimeStamp,
      uhid: uhid,
      category: category,
      filename: documentName,
    };

    const url = `${process.env.PRISM_UPLOAD_RECORDS_API}`;
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

    const reqStartTime = new Date();
    const uploadResult = await requestPromise(options)
      .then((res) => {
        return JSON.parse(res);
      })
      .catch((error) => {
        dLogger(
          reqStartTime,
          'uploadDocumentToPrism PRISM_UPLOAD_RECORDS_API_CALL___ERROR',
          `${url} --- ${JSON.stringify(formData)} --- ${JSON.stringify(error)}`
        );
        throw new AphError(AphErrorMessages.FILE_SAVE_ERROR);
      });
    dLogger(
      reqStartTime,
      'uploadDocumentToPrism PRISM_UPLOAD_RECORDS_API_CALL___END',
      `${url} --- ${JSON.stringify(formData)} --- ${JSON.stringify(uploadResult)}`
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
    const reqStartTime = new Date();
    const labResults = await fetch(url, prismHeaders)
      .then((res) => {
        return res.json();
      })
      .catch((error) => {
        dLogger(
          reqStartTime,
          'getPatientLabResults PRISM_GET_USER_LAB_RESULTS_API_CALL___ERROR',
          `${url} --- ${JSON.stringify(labResults)}`
        );
        throw new AphError(AphErrorMessages.GET_MEDICAL_RECORDS_ERROR);
      });
    dLogger(
      reqStartTime,
      'getPatientLabResults PRISM_GET_USER_LAB_RESULTS_API_CALL___END',
      `${url} --- ${JSON.stringify(labResults)}`
    );

    return labResults.errorCode == '0' ? labResults.response : [];
  }

  async getPatientHealthChecks(uhid: string, authToken: string) {
    const prismHeaders = {
      method: 'GET',
      timeOut: ApiConstants.PRISM_TIMEOUT,
    };

    const url = `${process.env.PRISM_GET_USER_HEALTH_CHECKS_API}?authToken=${authToken}&uhid=${uhid}`;
    const reqStartTime = new Date();
    const healthChecks = await fetch(url, prismHeaders)
      .then((res) => {
        return res.json();
      })
      .catch((error) => {
        dLogger(
          reqStartTime,
          'getPatientHealthChecks PRISM_GET_USER_HEALTH_CHECKS_API_CALL___ERROR',
          `${url} --- ${JSON.stringify(error)}`
        );
        throw new AphError(AphErrorMessages.GET_MEDICAL_RECORDS_ERROR);
      });
    dLogger(
      reqStartTime,
      'getPatientHealthChecks PRISM_GET_USER_HEALTH_CHECKS_API_CALL___END',
      `${url} --- ${JSON.stringify(healthChecks)}`
    );

    return healthChecks.errorCode == '0' ? healthChecks.response : [];
  }

  async getPatientHospitalizations(uhid: string, authToken: string) {
    const prismHeaders = {
      method: 'GET',
      timeOut: ApiConstants.PRISM_TIMEOUT,
    };

    const url = `${process.env.PRISM_GET_USER_HOSPITALIZATIONS_API}?authToken=${authToken}&uhid=${uhid}`;
    const reqStartTime = new Date();
    const hospitalizations = await fetch(url, prismHeaders)
      .then((res) => {
        return res.json();
      })
      .catch((error) => {
        dLogger(
          reqStartTime,
          'getPatientHospitalizations PRISM_GET_USER_HOSPITALIZATIONS_API_CALL___ERROR',
          `${url} --- ${JSON.stringify(error)}`
        );
        throw new AphError(AphErrorMessages.GET_MEDICAL_RECORDS_ERROR);
      });
    dLogger(
      reqStartTime,
      'getPatientHospitalizations PRISM_GET_USER_HOSPITALIZATIONS_API_CALL___END',
      `${url} --- ${JSON.stringify(hospitalizations)}`
    );

    return hospitalizations.errorCode == '0' ? hospitalizations.response : [];
  }

  async getPatientOpPrescriptions(uhid: string, authToken: string) {
    const prismHeaders = {
      method: 'GET',
      timeOut: ApiConstants.PRISM_TIMEOUT,
    };

    const url = `${process.env.PRISM_GET_USER_OP_PRESCRIPTIONS_API}?authToken=${authToken}&uhid=${uhid}`;
    const reqStartTime = new Date();
    const opPrescriptions = await fetch(url, prismHeaders)
      .then((res) => {
        return res.json();
      })
      .catch((error) => {
        dLogger(
          reqStartTime,
          'getPatientOpPrescriptions PRISM_GET_USER_OP_PRESCRIPTIONS_API_CALL___ERROR',
          `${url} --- ${JSON.stringify(error)}`
        );
        throw new AphError(AphErrorMessages.GET_MEDICAL_RECORDS_ERROR);
      });
    dLogger(
      reqStartTime,
      'getPatientOpPrescriptions PRISM_GET_USER_OP_PRESCRIPTIONS_API_CALL___END',
      `${url} --- ${JSON.stringify(opPrescriptions)}`
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
    return this.update(id, {
      uhid,
      uhidCreatedDate: new Date(),
      primaryUhid: uhid,
      primaryPatientId: id,
    });
  }

  updateLinkedUhidAccount(
    ids: string[],
    column: string,
    flag: boolean,
    primaryUhid?: string,
    primaryPatientId?: string
  ) {
    const fieldToUpdate: Partial<Patient> = { [column]: flag };
    let check = true;
    if (primaryUhid) {
      if (primaryUhid == 'null') {
        check = false;
      } else {
        fieldToUpdate.primaryUhid = primaryUhid;
        fieldToUpdate.primaryPatientId = primaryPatientId;
      }
    }

    if (check) {
      return this.update([...ids], fieldToUpdate).catch((updatePatientError) => {
        throw new AphError(AphErrorMessages.UPDATE_PROFILE_ERROR, undefined, {
          updatePatientError,
        });
      });
    } else {
      return this.createQueryBuilder('patient')
        .update()
        .set({
          primaryUhid: () => 'patient.uhid',
          primaryPatientId: () => 'patient.id',
          ...fieldToUpdate,
        })
        .where('id IN (:...ids)', { ids })
        .execute();
    }
  }

  updateToken(id: string, athsToken: string) {
    return this.update(id, { athsToken });
  }

  deleteProfile(id: string) {
    return this.update(id, { isActive: false });
  }

  async createNewUhid(id: string) {
    const patientDetails = await this.getPatientDetails(id);
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

    const reqStartTime = new Date();
    const uhidCreateResp = await fetch(newUhidUrl, {
      method: 'POST',
      body: JSON.stringify(uhidInput),
      headers: {
        'Content-Type': 'application/json',
        Authkey: process.env.UHID_CREATE_AUTH_KEY ? process.env.UHID_CREATE_AUTH_KEY : '',
      },
    }).catch((error) => {
      dLogger(
        reqStartTime,
        'createNewUhid CREATE_NEW_UHID_URL_API_CALL___ERROR',
        `${newUhidUrl} --- ${JSON.stringify(uhidInput)} --- ${JSON.stringify(error)}`
      );
      throw new AphError(AphErrorMessages.PRISM_CREATE_UHID_ERROR);
    });

    const textProcessRes = await uhidCreateResp.text();
    dLogger(
      reqStartTime,
      'createNewUhid CREATE_NEW_UHID_URL_API_CALL___END',
      `${newUhidUrl} --- ${JSON.stringify(uhidInput)} --- ${textProcessRes}`
    );

    const uhidResp: UhidCreateResult = JSON.parse(textProcessRes);
    let newUhid = '';
    if (uhidResp.retcode == '0') {
      this.updateUhid(id, uhidResp.result.toString());
      this.createPrismUser(patientDetails, uhidResp.result.toString());
      newUhid = uhidResp.result;
    }
    return newUhid;
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

    const reqStartTime = new Date();
    const uhidUserResp = await fetch(createUserAPI, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }).catch((error) => {
      dLogger(
        reqStartTime,
        'createPrismUser PRISM_CREATE_UHID_USER_API_CALL___ERROR',
        `${createUserAPI} --- ${JSON.stringify(error)}`
      );
      throw new AphError(AphErrorMessages.PRISM_CREATE_UHID_ERROR);
    });

    const textRes = await uhidUserResp.text();
    dLogger(
      reqStartTime,
      'createPrismUser PRISM_CREATE_UHID_USER_API_CALL___END',
      `${createUserAPI} --- ${textRes}`
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

    const reqStartTime = new Date();
    const tokenResp = await fetch(athsTokenUrl, {
      method: 'POST',
      body: JSON.stringify(athsTokenInput),
      headers: { 'Content-Type': 'application/json' },
    })
      .then((res) => {
        return res.text();
      })
      .catch((error) => {
        dLogger(
          reqStartTime,
          'createAthsToken ATHS_TOKEN_CREATE_API_CALL___ERROR',
          `${athsTokenUrl} --- ${JSON.stringify(athsTokenInput)} --- ${JSON.stringify(error)}`
        );
        throw new AphError(AphErrorMessages.PRISM_CREATE_ATHS_TOKEN_ERROR);
      });
    dLogger(
      reqStartTime,
      'createAthsToken ATHS_TOKEN_CREATE_API_CALL___END',
      `${athsTokenUrl} --- ${JSON.stringify(athsTokenInput)} --- ${JSON.stringify(tokenResp)}`
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

  async getLinkedPatientIds(patientId: string) {
    const linkedPatient = await this.findOne({ where: { id: patientId } });
    const primaryPatientIds: string[] = [];
    if (linkedPatient) {
      const patientsList = await this.find({
        where: { primaryPatientId: linkedPatient.primaryPatientId },
      });
      if (patientsList.length > 0) {
        patientsList.forEach((patientDetails) => {
          primaryPatientIds.push(patientDetails.id);
        });
      }
    }
    return primaryPatientIds;
  }

  updateWhatsAppStatus(id: string, whatsAppConsult: Boolean, whatsAppMedicine: Boolean) {
    return this.update(id, { whatsAppConsult, whatsAppMedicine });
  }
}
