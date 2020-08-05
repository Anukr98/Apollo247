import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { MedicalRecords } from 'profiles-service/entities';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

import winston from 'winston';
import path from 'path';
import { ApiConstants } from 'ApiConstants';

import { getLabResults, getPrescriptionData, getAuthToken } from 'helpers/phrV1Services';
import { LabResultsDownloadResponse, PrescriptionDownloadResponse } from 'types/phrv1';
import { format } from 'date-fns';
import { prescriptionSource } from 'profiles-service/resolvers/prescriptionUpload';

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

  type LabTestFileParameters {
    parameterName: String
    result: String
    unit: String
    range: String
    outOfRange: Boolean
    resultDate: Int
  }

  type LabResultsBaseResponse {
    authToken: String
    userId: String!
    id: String!
    labTestName: String!
    labTestSource: String!
    packageId: String
    packageName: String
    labTestDate: Float!
    labTestRefferedBy: String
    observation: String
    additionalNotes: String
    consultId: String
    tag: String
    labTestResults: [LabTestFileParameters]
    fileUrl: String!
    date: Date!
    testResultFiles: [PrecriptionFileParameters]
  }

  type LabResultsDownloadResponse {
    errorCode: Int!
    errorMsg: String
    errorType: String
    response: [LabResultsBaseResponse]
  }

  type PrescriptionsBaseResponse {
    authToken: String
    userId: String
    id: String!
    prescriptionName: String!
    dateOfPrescription: Float!
    startDate: Int
    endDate: Int
    prescribedBy: String
    notes: String
    prescriptionSource: String
    source: String!
    fileUrl: String!
    date: Date!
    prescriptionFiles: [PrecriptionFileParameters]
  }

  type PrecriptionFileParameters {
    id: String
    fileName: String
    mimeType: String
    content: String
    byteContent: String
    dateCreated: Int
  }

  type PrescriptionDownloadResponse {
    errorCode: Int
    errorMsg: String
    errorType: String
    response: [PrescriptionsBaseResponse]
  }

  type PrismMedicalRecordsResult {
    labTests: [LabTestResult]
    healthChecks: [HealthCheckResult]
    hospitalizations: [HospitalizationResult]
    labResults: LabResultsDownloadResponse
    prescriptions: PrescriptionDownloadResponse
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
  labResults: LabResultsDownloadResponse;
  prescriptions: PrescriptionDownloadResponse;
};

const getPatientMedicalRecords: Resolver<
  null,
  { patientId: string; offset?: number; limit?: number },
  ProfilesServiceContext,
  MedicalRecordsResult
> = async (parent, args, { profilesDb, doctorsDb }) => {
  //commented to support backward compatability
  /*const { patientId, offset, limit } = args;

  const patientRepo = profilesDb.getCustomRepository(PatientRepository);
  const patientDetails = await patientRepo.findById(patientId);
  if (patientDetails == null) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }

  const medicalRecordsRepo = profilesDb.getCustomRepository(MedicalRecordsRepository);
  const primaryPatientIds = await patientRepo.getLinkedPatientIds(patientId);

  const medicalRecords = await medicalRecordsRepo.findByPatientIds(
    primaryPatientIds,
    offset,
    limit
  ); 
  return { medicalRecords };*/
  return { medicalRecords: [] };
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
  const patientDetails = await patientsRepo.findById(args.patientId);
  if (!patientDetails) throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});

  if (!patientDetails.uhid) throw new AphError(AphErrorMessages.INVALID_UHID);

  if (
    !process.env.PHR_V1_DONLOAD_LABRESULT_DOCUMENT ||
    !process.env.PHR_V1_ACCESS_TOKEN ||
    !process.env.PHR_V1_DONLOAD_PRESCRIPTION_DOCUMENT
  )
    throw new AphError(AphErrorMessages.INVALID_PRISM_URL);

  //get labresults
  const labResults = await getLabResults(patientDetails.uhid);
  const prescriptions = await getPrescriptionData(patientDetails.uhid);

  //get authtoken for downloading urls
  const getToken = await getAuthToken(patientDetails.uhid);

  //document download URLs start
  let labResultDocumentUrl = process.env.PHR_V1_DONLOAD_LABRESULT_DOCUMENT.toString();
  labResultDocumentUrl = labResultDocumentUrl.replace('{AUTH_KEY}', getToken.response);
  labResultDocumentUrl = labResultDocumentUrl.replace('{UHID}', patientDetails.uhid);

  let prescriptionDocumentUrl = process.env.PHR_V1_DONLOAD_PRESCRIPTION_DOCUMENT.toString();
  prescriptionDocumentUrl = prescriptionDocumentUrl.replace('{AUTH_KEY}', getToken.response);
  prescriptionDocumentUrl = prescriptionDocumentUrl.replace('{UHID}', patientDetails.uhid);
  //document download URLs end

  //add documet urls in the labresults and prescription objects
  labResults.response.map((labresult) => {
    labresult.fileUrl =
      labresult.testResultFiles.length > 0
        ? labResultDocumentUrl.replace('{RECORDID}', labresult.id)
        : '';

    if (labresult.labTestDate.toString().length < 11) {
      labresult.labTestDate = labresult.labTestDate * 1000;
    }
    labresult.date = new Date(format(new Date(labresult.labTestDate), 'yyyy-MM-dd'));
  });

  prescriptions.response = prescriptions.response.filter(
    (item) =>
      item.source !==
      ApiConstants.PRESCRIPTION_SOURCE_PREFIX + prescriptionSource.EPRESCRIPTION.toLocaleLowerCase()
  );

  prescriptions.response.map((prescription) => {
    prescription.fileUrl =
      prescription.prescriptionFiles.length > 0
        ? prescriptionDocumentUrl.replace('{RECORDID}', prescription.id)
        : '';
    prescription.fileUrl =
      prescription.fileUrl.length > 0
        ? prescription.fileUrl.replace('{FILE_NAME}', prescription.prescriptionFiles[0].fileName)
        : '';
    if (prescription.dateOfPrescription.toString().length < 11) {
      prescription.dateOfPrescription = prescription.dateOfPrescription * 1000;
    }
    prescription.date = new Date(format(new Date(prescription.dateOfPrescription), 'yyyy-MM-dd'));
  });

  //labtests, healthchecks, hospitalization keys preserved to support backWardCompatability
  const formattedLabResults: LabTestResult[] = [];
  labResults.response.forEach((element) => {
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      labResultParams = element.labTestResults.map((item: any) => {
        return {
          parameterName: item.parameterName,
          result: item.result,
          unit: item.unit,
          range: item.range,
          outOfRange: item.outOfRange,
          resultDate: item.resultDate,
          setOutOfRange: false,
          setResultDate: false,
          setUnit: false,
          setParameterName: false,
          setRange: false,
          setResult: false,
        };
      });
    }

    if (element.labTestDate.toString().length < 11) {
      element.labTestDate = element.labTestDate * 1000;
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

  prescriptions.response = prescriptions.response.filter(
    (item) =>
      item.source !==
      ApiConstants.PRESCRIPTION_SOURCE_PREFIX + prescriptionSource.EPRESCRIPTION.toLocaleLowerCase()
  );

  prescriptions.response.forEach((element) => {
    let prismFileIds: string[] = [];
    const labResultParams: LabTestResultParameter[] = [];
    //collecting prism file ids
    if (element.prescriptionFiles.length > 0) {
      prismFileIds = element.prescriptionFiles.map((item) => {
        return `${item.id}_${item.fileName}`;
      });
    }

    if (element.dateOfPrescription.toString().length < 11) {
      element.dateOfPrescription = element.dateOfPrescription * 1000;
    }

    const labResult = {
      id: element.id,
      labTestName: element.prescriptionName,
      labTestSource: element.prescriptionSource,
      labTestDate: format(new Date(element.dateOfPrescription), 'yyyy-MM-dd HH:mm'),
      labTestReferredBy: element.prescribedBy,
      additionalNotes: element.notes,
      testResultPrismFileIds: prismFileIds,
      labTestResultParameters: labResultParams,
      departmentName: '',
      signingDocName: '',
      observation: '',
    };

    formattedLabResults.push(labResult);
  });

  const result = {
    labTests: formattedLabResults,
    healthChecks: [],
    hospitalizations: [],
    labResults: labResults,
    prescriptions: prescriptions,
  };

  /*
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

  const patientDetails = await patientsRepo.findById(args.patientId);
  if (!patientDetails) throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});

  let uhid = '';
  if (patientDetails.primaryUhid) {
    uhid = patientDetails.primaryUhid;
  } else {
    uhid = await patientsRepo.validateAndGetUHID(args.patientId, prismUserList);
  }

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
  }); */

  return result;
};

export const getPatientMedicalRecordsResolvers = {
  Query: {
    getPatientMedicalRecords,
    getPatientPrismMedicalRecords,
  },
};
