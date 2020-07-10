import { EntityRepository, Repository, Not } from 'typeorm';
import { Patient, PRISM_DOCUMENT_CATEGORY, PatientAddress } from 'profiles-service/entities';
import { ApiConstants } from 'ApiConstants';
import { UhidCreateResult } from 'types/uhidCreateTypes';
import { getCache, setCache, delCache } from 'profiles-service/database/connectRedis';
import { PrismSignUpUserData } from 'types/prism';

import { UploadDocumentInput } from 'profiles-service/resolvers/uploadDocumentToPrism';

import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { format, getUnixTime } from 'date-fns';
import { AthsTokenResponse } from 'types/uhidCreateTypes';
import { debugLog } from 'customWinstonLogger';
import { createPrismUser } from 'helpers/phrV1Services';
import {
  PrescriptionInputArgs,
  prescriptionSource,
  uploadPrescriptions,
} from 'profiles-service/resolvers/prescriptionUpload';
import { LabResultsInputArgs, uploadLabResults } from 'profiles-service/resolvers/labResultsUpload';

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
const REDIS_PATIENT_ID_KEY_PREFIX: string = 'patient:';
const REDIS_PATIENT_MOBILE_KEY_PREFIX: string = 'patient:mobile:';
// const REDIS_PATIENT_DEVICE_COUNT_KEY_PREFIX: string = 'patient:deviceCodeCount:';
@EntityRepository(Patient)
export class PatientRepository extends Repository<Patient> {
  async dropPatientCache(id: string) {
    delCache(id);
  }
  async findById(id: string) {
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

  async findByIdWithoutRelations(id: string) {
    return this.findOne({
      where: { id, isActive: true },
    });
  }

  async findOrCreatePatient(
    findOptions: { mobileNumber: Patient['mobileNumber'] },
    createOptions: Partial<Patient>
  ) {
    return this.findOne({
      where: { mobileNumber: findOptions.mobileNumber },
    }).then((existingPatient) => {
      return existingPatient || this.create(createOptions).save();
    });
  }
  findEmpId(empId: string, patientId: string) {
    return this.findOne({
      where: {
        employeeId: empId,
        id: Not(patientId),
      },
    });
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

  async getDeviceCodeCount(deviceCode: string) {
    const deviceCodeCount: DeviceCount[] = await this.createQueryBuilder('patient')
      .select(['"mobileNumber" as mobilenumber', 'count("mobileNumber") as mobilecount'])
      .where('patient."deviceCode" = :deviceCode', { deviceCode })
      .groupBy('patient."mobileNumber"')
      .getRawMany();
    return deviceCodeCount.length;
  }

  async getPatientDetails(id: string) {
    return await this.getByIdCache(id);
  }

  async findByMobileNumber(mobileNumber: string) {
    return await this.getByMobileCache(mobileNumber);
  }

  async getByIdCache(id: string | number) {
    const cache = await getCache(`${REDIS_PATIENT_ID_KEY_PREFIX}${id}`);
    if (cache && typeof cache === 'string') {
      const patient: Patient = JSON.parse(cache);
      patient.dateOfBirth = new Date(patient.dateOfBirth);
      return patient;
    } else {
      return await this.setByIdCache(id);
    }
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

  async setByIdCache(id: string | number) {
    const patientDetails = await this.getPatientData(id);
    if (patientDetails) {
      const patientString = JSON.stringify(patientDetails);
      setCache(
        `${REDIS_PATIENT_ID_KEY_PREFIX}${id}`,
        patientString,
        ApiConstants.CACHE_EXPIRATION_900
      );
    }
    return patientDetails;
  }
  async getByMobileCache(mobile: string) {
    const ids = await getCache(`${REDIS_PATIENT_MOBILE_KEY_PREFIX}${mobile}`);
    if (ids && typeof ids === 'string') {
      const patientIds: string[] = ids.split(',');
      const patients: Patient[] = [];
      for (let index = 0; index < patientIds.length; index++) {
        const patient = await this.getByIdCache(patientIds[index]);
        if (patient) {
          patients.push(patient);
        }
      }
      return patients;
    } else {
      return await this.setByMobileCache(mobile);
    }
  }
  async setByMobileCache(mobile: string) {
    const patients = await this.find({
      where: { mobileNumber: mobile, isActive: true },
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
      setCache(
        `${REDIS_PATIENT_ID_KEY_PREFIX}${patient.id}`,
        JSON.stringify(patient),
        ApiConstants.CACHE_EXPIRATION_900
      );
      return patient.id;
    });
    setCache(
      `${REDIS_PATIENT_MOBILE_KEY_PREFIX}${mobile}`,
      patientIds.join(','),
      ApiConstants.CACHE_EXPIRATION_900
    );
    return patients;
  }

  async findByMobileNumberLogin(mobileNumber: string) {
    const patientList = await this.getByMobileCache(mobileNumber);
    //const finalList: Patient[] = patientList;
    if (patientList.length > 1) {
      patientList.map(async (patient) => {
        if (patient.firstName == '' || patient.uhid == '') {
          console.log(patient.id, 'blank card');
          patient.isActive = false;
          this.save(patient);
        } else if (patient.primaryPatientId == null) {
          patient.primaryPatientId = patient.id;
          this.save(patient);
        }
      });
    } else {
      if (patientList[0].primaryPatientId == null) {
        patientList[0].primaryPatientId = patientList[0].id;
        this.save(patientList[0]);
      }
    }
    return await this.findByMobileNumber(mobileNumber);
  }

  async findDetailsByMobileNumber(mobileNumber: string) {
    return (await this.findByMobileNumber(mobileNumber))[0];
  }

  getPatientAddressById(id: PatientAddress['id']) {
    return PatientAddress.findOne({
      where: { id },
      select: ['addressLine1', 'addressLine2', 'landmark', 'city', 'state', 'zipcode'],
    });
  }

  async updatePatientAllergies(id: string, allergies: string) {
    const patient = await this.getPatientDetails(id);
    if (patient) {
      patient.allergies = allergies;
      return await this.save(patient);
    } else return null;
  }

  /*//utility method to get prism auth token
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
  }*/

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
        await createPrismUser(patientData, patientData.uhid);
        uhid = patientData.uhid;
      }
    }

    return uhid;
  }

  //utility method to get prism user details
  /* async getPrismUsersDetails(uhid: string, authToken: string) {
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
  }*/

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

    if (category == PRISM_DOCUMENT_CATEGORY.OpSummary) {
      const prescriptionFiles = [];
      prescriptionFiles.push({
        id: '',
        fileName: documentName,
        mimeType: 'images/' + fileFormat,
        content: docInput.base64FileInput,
        dateCreated: getUnixTime(new Date()) * 1000,
      });

      const prescriptionInputArgs: PrescriptionInputArgs = {
        prescriptionInput: {
          prescribedBy: ApiConstants.PRESCRIPTION_UPLOADED_BY_PATIENT.toString(),
          prescriptionName: documentName,
          dateOfPrescription: getUnixTime(new Date()) * 1000,
          startDate: 0,
          endDate: 0,
          notes: '',
          prescriptionSource: prescriptionSource.SELF,
          prescriptionDetail: [],
          prescriptionFiles: prescriptionFiles,
          speciality: '',
          hospital_name: '',
          address: '',
          city: '',
          pincode: '',
          instructions: [],
          diagnosis: [],
          diagnosticPrescription: [],
          medicinePrescriptions: [],
        },
        uhid: uhid,
      };

      const uploadedResult = (await uploadPrescriptions(null, prescriptionInputArgs, null)) as {
        recordId: string;
      };
      return `${uploadedResult.recordId}_${documentName}`;
    }

    if (category == PRISM_DOCUMENT_CATEGORY.TestReports) {
      const TestResultsParameter = [];
      TestResultsParameter.push({
        id: '',
        fileName: documentName,
        mimeType: 'images/' + fileFormat,
        content: docInput.base64FileInput,
        dateCreated: getUnixTime(new Date()) * 1000,
      });

      const labResultsInputArgs: LabResultsInputArgs = {
        labResultsInput: {
          labTestName: documentName,
          labTestDate: getUnixTime(new Date()) * 1000,
          labTestRefferedBy: 'RECORD_FROM_OLD_APP',
          observation: '',
          identifier: '',
          additionalNotes: '',
          labTestResults: [],
          labTestSource: ApiConstants.LABTEST_SOURCE_SELF_UPLOADED.toString(),
          visitId: '',
          testResultFiles: TestResultsParameter,
        },
        uhid: uhid,
      };

      const uploadedResult = (await uploadLabResults(null, labResultsInputArgs, null)) as {
        recordId: string;
      };

      return `${uploadedResult.recordId}_${documentName}`;
    }

    return null;
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
    updateAttrs.forEach((pat) => {
      this.dropPatientCache(`${REDIS_PATIENT_ID_KEY_PREFIX}${pat.id}`);
    });
    return this.save(updateAttrs).catch((savePatientError) => {
      throw new AphError(AphErrorMessages.SAVE_NEW_PROFILE_ERROR, undefined, {
        savePatientError,
      });
    });
  }

  async updateProfile(id: string, patientAttrs: Partial<Patient>) {
    const patient = await this.getByIdCache(id);
    if (patient) {
      Object.assign(patient, patientAttrs);
      this.dropPatientCache(`${REDIS_PATIENT_ID_KEY_PREFIX}${id}`);
      return this.save(patient);
    } else return null;
  }

  async updateUhid(id: string, uhid: string) {
    const patient = await this.getByIdCache(id);
    if (patient) {
      Object.assign(patient, {
        id,
        uhid,
        uhidCreatedDate: new Date(),
        primaryUhid: uhid,
        primaryPatientId: id,
      });
      return await this.save(patient);
    } else return null;
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
      ids.forEach((patientId) => {
        this.dropPatientCache(`${REDIS_PATIENT_ID_KEY_PREFIX}${patientId}`);
      });
      return this.update([...ids], fieldToUpdate).catch((updatePatientError) => {
        throw new AphError(AphErrorMessages.UPDATE_PROFILE_ERROR, undefined, {
          updatePatientError,
        });
      });
    } else {
      this.dropPatientCache(`${REDIS_PATIENT_ID_KEY_PREFIX}${primaryPatientId}`);
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

  async updateToken(id: string, athsToken: string) {
    const patient = this.create({ id, athsToken });
    return await patient.save();
  }

  async deleteProfile(id: string) {
    const patient = this.create({ id, isActive: false });
    return await patient.save();
  }

  async createNewUhid(id: string) {
    await this.dropPatientCache(`${REDIS_PATIENT_ID_KEY_PREFIX}${id}`);
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
      await this.updateUhid(id, uhidResp.result.toString());
      createPrismUser(patientDetails, uhidResp.result.toString());
      newUhid = uhidResp.result;
    }
    return newUhid;
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

  async getIdsByMobileNumber(mobileNumber: string) {
    return await this.findByMobileNumber(mobileNumber);
  }

  async getLinkedPatientIds(patientId: string) {
    const linkedPatient = await this.findOne({ where: { id: patientId } });
    const primaryPatientIds: string[] = [];
    if (linkedPatient && linkedPatient.uhid != '' && linkedPatient.uhid != null) {
      const patientsList = await this.find({
        where: { primaryPatientId: linkedPatient.primaryPatientId },
      });
      if (patientsList.length > 0) {
        patientsList.forEach((patientDetails) => {
          primaryPatientIds.push(patientDetails.id);
        });
      }
    } else {
      primaryPatientIds.push(patientId);
    }
    return primaryPatientIds;
  }

  async updateWhatsAppStatus(id: string, whatsAppConsult: Boolean, whatsAppMedicine: Boolean) {
    const patient = await this.getByIdCache(id);
    if (patient) {
      patient.whatsAppConsult = whatsAppConsult;
      patient.whatsAppMedicine = whatsAppMedicine;
      return this.save(patient);
    } else return null;
  }

  async checkMobileIdInfo(mobileNumber: string, uhid: string, patientId: string) {
    if (uhid != '') {
      const getData = await this.findOne({ where: { uhid, mobileNumber } });
      if (getData) return true;
      else return false;
    } else if (patientId != '') {
      const getData = await this.findOne({ where: { id: patientId, mobileNumber } });
      if (getData) return true;
      else return false;
    }
  }

  findByUhid(uhid: string) {
    return this.findOne({ where: { uhid } });
  }
}
