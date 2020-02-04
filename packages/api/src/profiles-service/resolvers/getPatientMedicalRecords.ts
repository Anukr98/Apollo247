import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { MedicalRecords } from 'profiles-service/entities';
import { MedicalRecordsRepository } from 'profiles-service/repositories/medicalRecordsRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { format } from 'date-fns';
import winston from 'winston';
import path from 'path';
import { ApiConstants } from 'ApiConstants';

import {
  PrismLabTestResult,
  PrismHealthCheckResult,
  PrismHospitalizationResult,
} from 'types/prismMedicalRecords';

export const getPatientMedicalRecordsTypeDefs = gql`
  type MedicalRecords {
    additionalNotes: String
    documentURLs: String
    id: ID!
    issuingDoctor: String
    location: String
    medicalRecordParameters: [MedicalRecordParameters]
    observations: String
    patient: Patient
    prismFileIds: String
    recordType: MedicalRecordType
    referringDoctor: String
    sourceName: String
    testDate: Date
    testName: String!
  }

  type MedicalRecordParameters {
    id: ID!
    parameterName: String!
    unit: MedicalTestUnit
    result: Float
    minimum: Float
    maximum: Float
  }

  type MedicalRecordsResult {
    medicalRecords: [MedicalRecords]
  }

  type LabTestResult {
    additionalNotes: String
    departmentName: String
    id: String
    labTestDate: String
    labTestName: String
    labTestReferredBy: String
    labTestResultParameters: [LabTestResultParameter]
    labTestSource: String
    observation: String
    signingDocName: String
    testResultPrismFileIds: [String]
  }

  type LabTestResultParameter {
    parameterName: String
    unit: String
    result: String
    range: String
    setOutOfRange: Boolean
    setResultDate: Boolean
    setUnit: Boolean
    setParameterName: Boolean
    setRange: Boolean
    setResult: Boolean
    outOfRange: Boolean
  }

  type HealthCheckResult {
    id: String
    healthCheckName: String
    healthCheckDate: String
    healthCheckPrismFileIds: [String]
    healthCheckSummary: String
    source: String
    appointmentDate: String
    followupDate: String
  }

  type HospitalizationResult {
    id: String
    diagnosisNotes: String
    dateOfDischarge: String
    dateOfHospitalization: String
    dateOfNextVisit: String
    hospitalizationPrismFileIds: [String]
    source: String
  }

  type PrismMedicalRecordsResult {
    labTests: [LabTestResult]
    healthChecks: [HealthCheckResult]
    hospitalizations: [HospitalizationResult]
  }
  extend type Query {
    getPatientMedicalRecords(patientId: ID!, offset: Int, limit: Int): MedicalRecordsResult
    getPatientPrismMedicalRecords(patientId: ID!): PrismMedicalRecordsResult
  }
`;

type MedicalRecordsResult = {
  medicalRecords: MedicalRecords[];
};

type LabTestResult = {
  id: string;
  labTestName: string;
  labTestSource: string;
  labTestDate: string;
  labTestReferredBy: string;
  additionalNotes: string;
  testResultPrismFileIds: string[];
  labTestResultParameters: LabTestResultParameter[];
  departmentName: string;
  signingDocName: string;
};

type LabTestResultParameter = {
  parameterName: string;
  unit: string;
  result: string;
  range: string;
};

type HealthCheckResult = {
  appointmentDate: string;
  followupDate: string;
  healthCheckDate: string;
  healthCheckPrismFileIds: string[];
  healthCheckName: string;
  healthCheckSummary: string;
  id: string;
  source: string;
};

type HospitalizationResult = {
  dateOfDischarge: string;
  dateOfHospitalization: string;
  dateOfNextVisit: string;
  diagnosisNotes: string;
  hospitalizationPrismFileIds: string[];
  id: string;
  source: string;
};

type PrismMedicalRecordsResult = {
  labTests: LabTestResult[];
  healthChecks: HealthCheckResult[];
  hospitalizations: HospitalizationResult[];
};

const getPatientMedicalRecords: Resolver<
  null,
  { patientId: string; offset?: number; limit?: number },
  ProfilesServiceContext,
  MedicalRecordsResult
> = async (parent, args, { profilesDb, doctorsDb }) => {
  const { patientId, offset, limit } = args;

  const patientRepo = profilesDb.getCustomRepository(PatientRepository);
  const patientDetails = await patientRepo.findById(patientId);
  if (patientDetails == null) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }

  const medicalRecordsRepo = profilesDb.getCustomRepository(MedicalRecordsRepository);
  const medicalRecords = await medicalRecordsRepo.findByPatientId(patientId, offset, limit);
  return { medicalRecords };
};

//configure winston for profiles service
const logsDirPath = <string>process.env.API_LOGS_DIRECTORY;
const logsDir = path.resolve(logsDirPath);
winston.configure({
  transports: [
    new winston.transports.File({
      filename: logsDir + ApiConstants.PROFILES_SERVICE_ACCESS_LOG_FILE,
      level: 'info',
    }),
    new winston.transports.File({
      filename: logsDir + ApiConstants.PROFILES_SERVICE_ERROR_LOG_FILE,
      level: 'error',
    }),
  ],
  exitOnError: false, // do not exit on handled exceptions
});

//Includes  User Lab Results + Hospitalizations + HealthChecks
const getPatientPrismMedicalRecords: Resolver<
  null,
  { patientId: string },
  ProfilesServiceContext,
  PrismMedicalRecordsResult
> = async (parent, args, { mobileNumber, profilesDb }) => {
  const patientsRepo = profilesDb.getCustomRepository(PatientRepository);
  //get authtoken for the logged in user mobile number
  const prismAuthToken = await patientsRepo.getPrismAuthToken(mobileNumber);

  const authLog = {
    message: 'PrismAuthToken API Response',
    time: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSX"),
    level: 'info',
    response: prismAuthToken,
  };
  winston.log(authLog);

  if (!prismAuthToken) throw new AphError(AphErrorMessages.PRISM_AUTH_TOKEN_ERROR, undefined, {});

  //get users list for the mobile number
  const prismUserList = await patientsRepo.getPrismUsersList(mobileNumber, prismAuthToken);

  const usersLog = {
    message: 'PrismUserList API Response',
    time: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSX"),
    level: 'info',
    response: prismUserList,
  };
  winston.log(usersLog);

  //check if current user uhid matches with response uhids
  const uhid = await patientsRepo.validateAndGetUHID(args.patientId, prismUserList);

  if (!uhid) {
    throw new AphError(AphErrorMessages.PRISM_AUTH_TOKEN_ERROR, undefined, {});
  }

  //get authtoken for the logged in user mobile number
  const prismUHIDAuthToken = await patientsRepo.getPrismAuthTokenByUHID(uhid);

  if (!prismUHIDAuthToken)
    throw new AphError(AphErrorMessages.PRISM_AUTH_TOKEN_ERROR, undefined, {});

  //just call get prism user details with the corresponding uhid
  await patientsRepo.getPrismUsersDetails(uhid, prismUHIDAuthToken);
  const formattedLabResults: LabTestResult[] = [];
  const labResults = await patientsRepo.getPatientLabResults(uhid, prismUHIDAuthToken);
  const labResultLog = {
    message: 'LabResults API Response',
    time: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSX"),
    level: 'info',
    response: labResults,
  };
  winston.log(labResultLog);

  labResults.forEach((element: PrismLabTestResult) => {
    let prismFileIds: string[] = [];
    let labResultParams: LabTestResultParameter[] = [];
    //collecting prism file ids
    if (element.testResultFiles.length > 0) {
      prismFileIds = element.testResultFiles.map((item) => {
        return `${item.id}_${item.fileName}`;
      });
    }
    //collecting test result params
    if (element.labTestResults.length > 0) {
      labResultParams = element.labTestResults.map((item) => {
        return {
          parameterName: item.parameterName,
          result: item.result,
          unit: item.unit,
          range: item.range,
          outOfRange: item.outOfRange,
          resultDate: item.resultDate,
          setOutOfRange: item.setOutOfRange,
          setResultDate: item.setResultDate,
          setUnit: item.setUnit,
          setParameterName: item.setParameterName,
          setRange: item.setRange,
          setResult: item.setResult,
        };
      });
    }

    const labResult = {
      id: element.id,
      labTestName: element.labTestName,
      labTestSource: element.labTestSource,
      labTestDate: format(new Date(element.labTestDate), 'yyyy-MM-dd HH:mm'),
      labTestReferredBy: element.labTestRefferedBy,
      additionalNotes: element.additionalNotes,
      testResultPrismFileIds: prismFileIds,
      labTestResultParameters: labResultParams,
      departmentName: element.departmentName,
      signingDocName: element.signingDocName,
      observation: element.observation,
    };

    formattedLabResults.push(labResult);
  });

  const formattedHealthChecks: HealthCheckResult[] = [];
  const healthChecks = await patientsRepo.getPatientHealthChecks(uhid, prismUHIDAuthToken);
  const healthChecksLog = {
    message: 'HealthChecks API Response',
    time: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSX"),
    level: 'info',
    response: healthChecks,
  };
  winston.log(healthChecksLog);
  healthChecks.forEach((element: PrismHealthCheckResult) => {
    //collecting prism file ids
    let prismFileIds: string[] = [];
    if (element.healthCheckFiles.length > 0) {
      prismFileIds = element.healthCheckFiles.map((item) => {
        return `${item.id}_${item.fileName}`;
      });
    }
    const healthCheckResult = {
      appointmentDate: format(new Date(element.appointmentDate), 'yyyy-MM-dd HH:mm'),
      followupDate: format(new Date(element.followupDate), 'yyyy-MM-dd HH:mm'),
      healthCheckDate: format(new Date(element.healthCheckDate), 'yyyy-MM-dd HH:mm'),
      healthCheckPrismFileIds: prismFileIds,
      healthCheckName: element.healthCheckName,
      healthCheckSummary: element.healthCheckSummary,
      id: element.id,
      source: element.source,
    };

    formattedHealthChecks.push(healthCheckResult);
  });

  const formattedHospitalizations: HospitalizationResult[] = [];
  const hospitalizations = await patientsRepo.getPatientHospitalizations(uhid, prismUHIDAuthToken);
  const hospitalizationsLog = {
    message: 'Hospitalizations API Response',
    time: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSX"),
    level: 'info',
    response: hospitalizations,
  };
  winston.log(hospitalizationsLog);
  hospitalizations.forEach((element: PrismHospitalizationResult) => {
    //collecting prism file ids
    let prismFileIds: string[] = [];
    if (element.hospitalizationFiles.length > 0) {
      prismFileIds = element.hospitalizationFiles.map((item) => {
        return `${item.id}_${item.fileName}`;
      });
    }
    const hospitalizationResult = {
      id: element.id,
      diagnosisNotes: element.diagnosisNotes,
      dateOfDischarge: format(new Date(element.dateOfDischarge), 'yyyy-MM-dd HH:mm'),
      dateOfHospitalization: format(new Date(element.dateOfHospitalization), 'yyyy-MM-dd HH:mm'),
      dateOfNextVisit: format(new Date(element.dateOfNextVisit), 'yyyy-MM-dd HH:mm'),
      hospitalizationPrismFileIds: prismFileIds,
      source: element.source,
    };
    formattedHospitalizations.push(hospitalizationResult);
  });

  const result = {
    labTests: formattedLabResults,
    healthChecks: formattedHealthChecks,
    hospitalizations: formattedHospitalizations,
  };

  return result;
};

export const getPatientMedicalRecordsResolvers = {
  Query: {
    getPatientMedicalRecords,
    getPatientPrismMedicalRecords,
  },
};
