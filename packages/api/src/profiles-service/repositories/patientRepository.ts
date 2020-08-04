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
import { debugLog } from 'customWinstonLogger';
import { createPrismUser } from 'helpers/phrV1Services';
import {
  PrescriptionInputArgs,
  prescriptionSource,
  uploadPrescriptions,
} from 'profiles-service/resolvers/prescriptionUpload';
import { LabResultsInputArgs, uploadLabResults } from 'profiles-service/resolvers/labResultsUpload';
import { log } from 'customWinstonLogger';

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
  /**
   * @param patient 
   * this method is used to load currently referenced patient record so that when
   * updates are made, validations could be run against the freshly fetched record
   * from Db/Cache
   */
  loadRecordReference = (patient: Patient | undefined) => { if (patient) { patient.setOldRecordReference(patient) } };

  async dropPatientCache(id: string) {
    delCache(id);
  }

  async findByIdWithRelations(id: string, relations: string[]) {
    const findClause = {
      where: { id, isActive: true },
      relations: relations,
    };

    return this.findOne(findClause);
  }

  //naman, check if patient is loaded here
  async findOrCreatePatient(
    findOptions: { mobileNumber: Patient['mobileNumber'] },
    createOptions: Partial<Patient>
  ) {
    return this.find({
      where: { mobileNumber: findOptions.mobileNumber },
    }).then(async (existingPatient) => {
      if (existingPatient.length > 0) {
        return existingPatient;
      }
      const newPatient = await this.create(createOptions).save();
      return [newPatient];
    });
  }

  //naman, sorted
  findEmpId(empId: string, patientId: string, partnerId: string) {
    return this.findOne({
      where: {
        employeeId: empId,
        partnerId,
        id: Not(patientId),
      },
    });
  }

  //naman, sorted
  findPatientDetailsByIdsAndFields(ids: string[], fields: string[]) {
    return this.createQueryBuilder('patient')
      .select(fields)
      .where('patient.id IN (:...ids)', { ids })
      .getMany();
  }

  //naman, sorted
  getPatientDetailsByIds(ids: string[]) {
    return this.createQueryBuilder('patient')
      .where('patient.id IN (:...ids)', { ids })
      .getMany();
  }

  //naman, sorted
  async getDeviceCodeCount(deviceCode: string) {
    return await this.createQueryBuilder('patient')
      .select(['"mobileNumber" as mobilenumber', 'count("mobileNumber") as mobilecount'])
      .where('patient."deviceCode" = :deviceCode', { deviceCode })
      .groupBy('patient."mobileNumber"')
      .getCount();
  }

  //naman, fexed cache to old record
  getPatientDetails(id: string): Promise<Patient> | undefined {
    return new Promise(async (resolve, reject) => {
      try {
        const patient: Patient | undefined = await this.getByIdCache(id);
        this.loadRecordReference(patient);
        return resolve(patient);
      }
      catch (ex) {
        console.log(`getPatientDetails`, ex);
        return reject(ex);
      }
    })
  }

  //naman, fixed
  async findByMobileNumber(mobileNumber: string) {
    return await this.getByMobileCache(mobileNumber);
  }

  async getByIdCache(id: string | number) {
    const cache = await getCache(`${REDIS_PATIENT_ID_KEY_PREFIX}${id}`);
    if (cache && typeof cache === 'string') {
      const patient: Patient = JSON.parse(cache);
      //Only add DOB if it is actually present, or else it will take 1970 date as default when null is passed to constructor
      if (patient.dateOfBirth) {
        patient.dateOfBirth = new Date(patient.dateOfBirth);
      }

      //cache to old record reference 
      this.loadRecordReference(patient);

      return this.create(patient);
    } else {
      return await this.setByIdCache(id);
    }
  }

  //naman, sorted
  async getPatientData(id: string | number) {
    return this.findOne({
      where: { id, isActive: true },
    });
  }

  async setByIdCache(id: string | number) {
    const patientDetails = await this.getPatientData(id);
    if (patientDetails) {
      const patientString = JSON.stringify(patientDetails);
      setCache(
        `${REDIS_PATIENT_ID_KEY_PREFIX}${id}`,
        patientString,
        ApiConstants.CACHE_EXPIRATION_3600
      );
    }
    return patientDetails;
  }

  //naman, old reference fixed
  async getByMobileCache(mobile: string) {
    const ids = await getCache(`${REDIS_PATIENT_MOBILE_KEY_PREFIX}${mobile}`);
    if (ids && typeof ids === 'string') {
      const patientIds: string[] = ids.split(',');
      const patients: Patient[] = [];
      for (let index = 0; index < patientIds.length; index++) {
        const patient = await this.getPatientDetails(patientIds[index]);
        if (patient) {
          //cache to old record reference 
          this.loadRecordReference(patient);
          patients.push(patient);
        }
      }
      return patients;
    } else {
      return await this.setByMobileCache(mobile);
    }
  }

  //naman automatically sets the reference
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
        ApiConstants.CACHE_EXPIRATION_3600
      );
      return patient.id;
    });

    setCache(
      `${REDIS_PATIENT_MOBILE_KEY_PREFIX}${mobile}`,
      patientIds.join(','),
      ApiConstants.CACHE_EXPIRATION_3600
    );
    return patients;
  }

  async findByMobileNumberLogin(mobileNumber: string) {
    const patientList = await this.getByMobileCache(mobileNumber);
    //const finalList: Patient[] = patientList;
    if (patientList.length > 1) {
      patientList.map(async (patient) => {
        if (patient.firstName == '' || patient.uhid == '') {
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
      if (patient.old) {
        console.log(`old found`);
      }
      delete patient.old;
      return await this.save(patient);
    } else return null;
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
      uhid = await this.createNewUhid(patientData);
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

  //naman, check here if onLoaded is called
  async saveNewProfile(patientAttrs: Partial<Patient>) {
    return await this.create(patientAttrs)
      .save()
      .catch((patientError) => {
        throw new AphError(AphErrorMessages.SAVE_NEW_PROFILE_ERROR, undefined, {
          patientError,
        });
      });
  }

  //naman, check here if onLoaded is called
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

  //sorted
  async updateProfile(id: string, patientAttrs: Partial<Patient>) {
    const patient = await this.getByIdCache(id);
    if (patient) {
      Object.assign(patient, patientAttrs);
      return this.save(patient);
    } else return null;
  }


  //need to checkOnloaded
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
      }
      else {
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

  //naman, sorted
  async deleteProfile(id: string) {
    const patient = await this.getPatientDetails(id);
    if (patient) {
      patient.isActive = false;
      return await patient.save();
    }
  }

  //naman, no need
  async createNewUhid(patientDetails: Patient) {
    //setting mandatory fields to create uhid in medmantra
    const uhidResp: UhidCreateResult = await this.getNewUhid(patientDetails);
    if (uhidResp.retcode == '0') {
      patientDetails.uhid = uhidResp.result;
      patientDetails.primaryUhid = uhidResp.result;
      patientDetails.uhidCreatedDate = new Date();
      patientDetails.save();
      createPrismUser(patientDetails, uhidResp.result.toString());
    }

    return uhidResp.result || '';
  }

  //naman, no need
  async getNewUhid(patientDetails: Patient) {
    patientDetails.firstName = patientDetails.firstName || 'New';
    patientDetails.lastName = patientDetails.lastName || 'User';
    patientDetails.emailAddress = patientDetails.emailAddress || '';
    patientDetails.dateOfBirth = patientDetails.dateOfBirth || new Date('1970-01-01');

    const newUhidUrl = process.env.CREATE_NEW_UHID_URL || '';
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
    return uhidResp;
  }

  // not used anywhere
  async updatePatientDetails(patientDetails: Patient) {
    await this.save(patientDetails);
  }

  //fixed
  async getIdsByMobileNumber(mobileNumber: string) {
    return await this.findByMobileNumber(mobileNumber);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getLinkedPatientIds({ patientDetails, patientId }: any) {
    if (!patientDetails) {
      patientDetails = await this.getPatientDetails(patientId);
    }
    const primaryPatientIds: string[] = [];
    if (
      patientDetails &&
      patientDetails.uhid != '' &&
      patientDetails.uhid != null &&
      patientDetails.primaryPatientId != null &&
      patientDetails.primaryPatientId != ''
    ) {
      const patientsList = await this.find({
        where: { primaryPatientId: patientDetails.primaryPatientId },
      });
      if (patientsList.length > 0) {
        patientsList.forEach((patientDetails) => {
          primaryPatientIds.push(patientDetails.id);
        });
      }
    } else {
      primaryPatientIds.push(patientDetails.id);
    }
    return primaryPatientIds;
  }

  //naman, sorted
  async updateWhatsAppStatus(id: string, whatsAppConsult: Boolean, whatsAppMedicine: Boolean) {
    const patient = await this.getPatientDetails(id);
    if (patient) {
      patient.whatsAppConsult = whatsAppConsult;
      patient.whatsAppMedicine = whatsAppMedicine;
      return this.save(patient);
    } else return null;
  }

  //naman, sorted
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

  //naman, sorted
  findByUhid(uhid: string) {
    return this.findOne({ where: { uhid } });
  }
}
