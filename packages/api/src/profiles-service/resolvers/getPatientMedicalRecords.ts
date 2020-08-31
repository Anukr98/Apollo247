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

import { getLabResults, getPrescriptionData, getAuthToken, getHealthCheckRecords, getDischargeSummary } from 'helpers/phrV1Services';
import {
  LabResultsDownloadResponse,
  PrescriptionDownloadResponse,
  GetAuthTokenResponse,
  HealthChecksResponse,
  DischargeSummaryResponse
} from 'types/phrv1';
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
    siteDisplayName: String
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
    hospital_name: String
    hospitalId: String
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
    healthChecksNew: HealthChecksDownloadResponse
    hospitalizationsNew: DischargeSummaryDownloadResponse
  }

  type PrismAuthTokenResponse {
    errorCode: Int
    errorMsg: String
    errorType: String
    response: String
  }

  type HealthChecksBaseResponse {
    authToken: String
    userId: String
    id: String!
    fileUrl: String!
    date: Date!
    healthCheckName: String!
    healthCheckDate: Float
    healthCheckSummary: String
    healthCheckFiles: [HealthCheckFileParameters]
    source: String
    healthCheckType: String
    followupDate: Float
  }

  type HealthCheckFileParameters {
    id: String
    fileName: String
    mimeType: String
    content: String
    byteContent: String
    dateCreated: Float
  }

  type HealthChecksDownloadResponse {
    errorCode: Int!
    errorMsg: String
    errorType: String
    response: [HealthChecksBaseResponse]
  }

  type DischargeSummaryBaseResponse {
    authToken: String,
    userId: String,
    id: String,
    fileUrl: String!
    date: Date!
    dateOfHospitalization: Float,
    hospitalName: String,
    doctorName: String,
    reasonForAdmission: String,
    diagnosisNotes: String,
    dateOfDischarge: Float,
    dischargeSummary: String,
    doctorInstruction: String,
    dateOfNextVisit: Float,
    hospitalizationFiles :[HospitalizationFilesParameters]
    source: String
  }

  type HospitalizationFilesParameters {
    id: String,
    fileName: String,
    mimeType: String,
    content: String,
    byteContent: String,
    dateCreated: Float
  }

  type DischargeSummaryDownloadResponse {
    errorCode: Int!
    errorMsg: String
    errorType: String
    response: [DischargeSummaryBaseResponse]
  }

  extend type Query {
    getPatientMedicalRecords(patientId: ID!, offset: Int, limit: Int): MedicalRecordsResult
    getPatientPrismMedicalRecords(patientId: ID!): PrismMedicalRecordsResult
    getPrismAuthToken(uhid: String!): PrismAuthTokenResponse
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
  healthChecksNew: HealthChecksResponse;
  hospitalizationsNew: DischargeSummaryResponse;

};

//Not in use, to support backward compatability
const getPatientMedicalRecords: Resolver<
  null,
  { patientId: string; offset?: number; limit?: number },
  ProfilesServiceContext,
  MedicalRecordsResult
> = async (parent, args, { profilesDb, doctorsDb }) => {
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
  const patientDetails = await patientsRepo.getPatientDetails(args.patientId);

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

  /* Fetch patient health check records from prism */

  const healthCheckResults = await getHealthCheckRecords(patientDetails.uhid)

  /* Add document urls to the response objects,
  Modify date to ISO
   */

  if (!process.env.PHR_V1_GET_HEALTHCHECK_DOCUMENT || !process.env.PHR_V1_ACCESS_TOKEN)
    throw new AphError(AphErrorMessages.INVALID_PRISM_URL);

  let healthCheckDocumentUrl = process.env.PHR_V1_GET_HEALTHCHECK_DOCUMENT.toString();

  healthCheckDocumentUrl = healthCheckDocumentUrl.replace('{AUTH_KEY}', getToken.response);
  healthCheckDocumentUrl = healthCheckDocumentUrl.replace('{UHID}', patientDetails.uhid);

  healthCheckResults.response.map((healthCheckResult) => {
    healthCheckResult.fileUrl = healthCheckResult.healthCheckFiles.length ? healthCheckDocumentUrl.replace('{RECORDID}', healthCheckResult.id) : ''

    if (healthCheckResult.healthCheckDate.toString().length < 11) {
      healthCheckResult.healthCheckDate = healthCheckResult.healthCheckDate * 1000;
    }
    healthCheckResult.date = new Date(format(new Date(healthCheckResult.healthCheckDate), 'yyyy-MM-dd'));
  });

  /* Fetch patient discharge summary from prism */

  const dischargeSummaryResults = await getDischargeSummary(patientDetails.uhid)

  /* Add document urls to the response objects,
  Modify date to ISO
   */

  if (!process.env.PHR_V1_GET_DISCHARGESUMMARY_DOCUMENT || !process.env.PHR_V1_ACCESS_TOKEN)
    throw new AphError(AphErrorMessages.INVALID_PRISM_URL);

  let dischargeSummaryDocumentUrl = process.env.PHR_V1_GET_DISCHARGESUMMARY_DOCUMENT.toString();

  dischargeSummaryDocumentUrl = dischargeSummaryDocumentUrl.replace('{AUTH_KEY}', getToken.response);
  dischargeSummaryDocumentUrl = dischargeSummaryDocumentUrl.replace('{UHID}', patientDetails.uhid);

  dischargeSummaryResults.response.map((dischargeSummaryResult) => {
    dischargeSummaryResult.fileUrl = dischargeSummaryResult.hospitalizationFiles.length ? dischargeSummaryDocumentUrl.replace('{RECORDID}', dischargeSummaryResult.id) : ''

    if (dischargeSummaryResult.dateOfDischarge.toString().length < 11) {
      dischargeSummaryResult.dateOfDischarge = dischargeSummaryResult.dateOfDischarge * 1000;
    }
    dischargeSummaryResult.date = new Date(format(new Date(dischargeSummaryResult.dateOfDischarge), 'yyyy-MM-dd'));

  });


  const result = {
    labTests: formattedLabResults,
    healthChecks: [],
    hospitalizations: [],
    labResults: labResults,
    prescriptions: prescriptions,
    healthChecksNew: healthCheckResults,
    hospitalizationsNew: dischargeSummaryResults
  };

  return result;
};

const getPrismAuthToken: Resolver<
  null,
  { uhid: string },
  ProfilesServiceContext,
  GetAuthTokenResponse
> = async (parent, args, { }) => {
  return await getAuthToken(args.uhid);
};

export const getPatientMedicalRecordsResolvers = {
  Query: {
    getPatientMedicalRecords,
    getPatientPrismMedicalRecords,
    getPrismAuthToken,
  },
};
