import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import {
  MedicalRecords,
  MedicalRecordParameters,
  MedicalRecordType,
  MedicalTestUnit,
} from 'profiles-service/entities';
import { MedicalRecordsRepository } from 'profiles-service/repositories/medicalRecordsRepository';
import { MedicalRecordParametersRepository } from 'profiles-service/repositories/medicalRecordParametersRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';

import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { getUnixTime } from 'date-fns';
import {
  prescriptionSource,
  uploadPrescriptions,
  PrescriptionInputArgs,
} from 'profiles-service/resolvers/prescriptionUpload';
import { ApiConstants } from 'ApiConstants';
import { LabResultsInputArgs, uploadLabResults } from 'profiles-service/resolvers/labResultsUpload';
import { uploadFileToBlobStorage } from 'helpers/uploadFileToBlob';
import { getFileTypeFromMime } from 'helpers/generalFunctions';

export const addPatientMedicalRecordTypeDefs = gql`
  enum MedicalTestUnit {
    GM
    _PERCENT_
    GM_SLASH_DL
    NONE
  }

  enum MedicalRecordType {
    TEST_REPORT
    CONSULTATION
    PRESCRIPTION
    EHR
    PHYSICAL_EXAMINATION
    OPERATIVE_REPORT
    PATHOLOGY_REPORT
    HEALTHCHECK
    HOSPITALIZATION
  }

  input AddMedicalRecordInput {
    additionalNotes: String
    documentURLs: String
    issuingDoctor: String
    location: String
    medicalRecordParameters: [AddMedicalRecordParametersInput]
    observations: String
    patientId: ID!
    prismFileIds: String
    recordType: MedicalRecordType
    referringDoctor: String
    sourceName: String
    testDate: Date
    testName: String!
    testResultFiles: LabResultFileProperties
  }

  input AddMedicalRecordParametersInput {
    maximum: Float
    minimum: Float
    parameterName: String
    result: Float
    unit: MedicalTestUnit
  }

  type AddMedicalRecordResult {
    status: Boolean
  }

  extend type Mutation {
    addPatientMedicalRecord(addMedicalRecordInput: AddMedicalRecordInput): AddMedicalRecordResult!
  }
`;

type LabResultFileProperties = {
  fileName: string;
  mimeType: string;
  content: string;
};

type AddMedicalRecordInput = {
  additionalNotes: string;
  documentURLs: string;
  issuingDoctor: string;
  location: string;
  medicalRecordParameters: [AddMedicalRecordParametersInput];
  observations: string;
  patientId: string;
  prismFileIds: string;
  recordType: MedicalRecordType;
  referringDoctor: string;
  sourceName: string;
  testDate: Date;
  testName: string;
  testResultFiles: LabResultFileProperties;
};

type AddMedicalRecordParametersInput = {
  maximum: number;
  minimum: number;
  parameterName: string;
  result: number;
  unit: MedicalTestUnit;
};

type MedicalRecordInputArgs = { addMedicalRecordInput: AddMedicalRecordInput };

type AddMedicalRecordResult = {
  status: boolean;
};

/* >= release 5.0.0 not used for lab tests */

const addPatientMedicalRecord: Resolver<
  null,
  MedicalRecordInputArgs,
  ProfilesServiceContext,
  AddMedicalRecordResult
> = async (parent, { addMedicalRecordInput }, { profilesDb }) => {
  const patientsRepo = profilesDb.getCustomRepository(PatientRepository);
  const patient = await patientsRepo.getPatientDetails(addMedicalRecordInput.patientId);
  if (patient == null) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }

  const recordType = addMedicalRecordInput.recordType;
  if (recordType == MedicalRecordType.TEST_REPORT) {
    //upload lab results starts
    const TestResultsParameter = [];
    if (
      addMedicalRecordInput.testResultFiles &&
      addMedicalRecordInput.testResultFiles.fileName.length > 0
    )
      TestResultsParameter.push({
        id: '',
        fileName: addMedicalRecordInput.testResultFiles.fileName,
        mimeType: addMedicalRecordInput.testResultFiles.mimeType,
        content: addMedicalRecordInput.testResultFiles.content,
        dateCreated: getUnixTime(new Date()) * 1000,
      });

    const labTestResults: {
      parameterName: string;
      result: string;
      unit: MedicalTestUnit;
      range: string;
      outOfRange: Boolean;
      resultDate: number;
    }[] = [];

    addMedicalRecordInput.medicalRecordParameters.map((item) => {
      labTestResults.push({
        parameterName: item.parameterName,
        result: item.result.toString(),
        unit: item.unit,
        range: item.minimum && item.maximum ? item.minimum + '-' + item.maximum : '',
        outOfRange: false,
        resultDate: getUnixTime(new Date(addMedicalRecordInput.testDate)) * 1000,
      });
    });

    const labResultsInputArgs: LabResultsInputArgs = {
      labResultsInput: {
        labTestName: addMedicalRecordInput.testName,
        labTestDate: addMedicalRecordInput.testDate
          ? getUnixTime(addMedicalRecordInput.testDate) * 1000
          : getUnixTime(new Date()) * 1000,
        labTestRefferedBy: addMedicalRecordInput.referringDoctor,
        observation: addMedicalRecordInput.observations,
        identifier: '',
        additionalNotes: addMedicalRecordInput.additionalNotes,
        labTestResults: labTestResults,
        labTestSource: ApiConstants.LABTEST_SOURCE_SELF_UPLOADED.toString(),
        visitId: '',
        testResultFiles: TestResultsParameter,
      },
      uhid: patient.uhid,
    };

    const uploadedResult = (await uploadLabResults(null, labResultsInputArgs, null)) as {
      recordId: string;
    };
    addMedicalRecordInput.prismFileIds = uploadedResult.recordId;
    //upload lab results ends
  } else {
    //other than test reports
    const prescriptionFiles = [];
    if (
      addMedicalRecordInput.testResultFiles &&
      addMedicalRecordInput.testResultFiles.fileName.length > 0
    )
      prescriptionFiles.push({
        id: '',
        fileName: addMedicalRecordInput.testResultFiles.fileName,
        mimeType: addMedicalRecordInput.testResultFiles.mimeType,
        content: addMedicalRecordInput.testResultFiles.content,
        dateCreated: getUnixTime(new Date()) * 1000,
      });

    const prescriptionInputArgs: PrescriptionInputArgs = {
      prescriptionInput: {
        prescribedBy: addMedicalRecordInput.issuingDoctor,
        prescriptionName: addMedicalRecordInput.testName,
        dateOfPrescription: addMedicalRecordInput.testDate
          ? getUnixTime(addMedicalRecordInput.testDate) * 1000
          : getUnixTime(new Date()) * 1000,
        startDate: 0,
        endDate: 0,
        notes: addMedicalRecordInput.additionalNotes,
        prescriptionSource: prescriptionSource.SELF,
        prescriptionDetail: [],
        prescriptionFiles: prescriptionFiles,
        speciality: '',
        hospital_name: '',
        hospitalId: '',
        address: '',
        city: '',
        pincode: '',
        instructions: [],
        diagnosis: [],
        diagnosticPrescription: [],
        medicinePrescriptions: [],
      },
      uhid: patient.uhid,
    };
    const uploadedResult = (await uploadPrescriptions(null, prescriptionInputArgs, null)) as {
      recordId: string;
    };
    addMedicalRecordInput.prismFileIds = uploadedResult.recordId;
  }

  if (
    addMedicalRecordInput.testResultFiles &&
    addMedicalRecordInput.testResultFiles.fileName.length > 0
  ) {
    //upload file to blob storage
    const uploadFileType = getFileTypeFromMime(addMedicalRecordInput.testResultFiles.mimeType);

    addMedicalRecordInput.documentURLs = await uploadFileToBlobStorage(
      uploadFileType,
      addMedicalRecordInput.testResultFiles.content
    );
  }

  const addMedicalRecordAttrs: Partial<MedicalRecords> = {
    additionalNotes: addMedicalRecordInput.additionalNotes,
    documentURLs: addMedicalRecordInput.documentURLs,
    issuingDoctor: addMedicalRecordInput.issuingDoctor,
    location: addMedicalRecordInput.location,
    observations: addMedicalRecordInput.observations,
    patient: patient,
    prismFileIds: addMedicalRecordInput.prismFileIds,
    recordType: addMedicalRecordInput.recordType,
    referringDoctor: addMedicalRecordInput.referringDoctor,
    sourceName: addMedicalRecordInput.sourceName,
    testDate: addMedicalRecordInput.testDate,
    testName: addMedicalRecordInput.testName,
  };

  const medicalRecordRepo = profilesDb.getCustomRepository(MedicalRecordsRepository);
  const medicalRecord = await medicalRecordRepo.addMedicalRecord(addMedicalRecordAttrs);

  if (
    medicalRecord &&
    addMedicalRecordInput.medicalRecordParameters &&
    addMedicalRecordInput.medicalRecordParameters.length > 0
  ) {
    const medicalRecordParamsRepo = profilesDb.getCustomRepository(
      MedicalRecordParametersRepository
    );

    const medicalRecordparameters: Partial<MedicalRecordParameters>[] =
      addMedicalRecordInput.medicalRecordParameters;
    medicalRecordparameters.map((p) => (p.medicalRecords = medicalRecord));
    await medicalRecordParamsRepo.addMedicalRecordParameters(medicalRecordparameters);
  }

  return { status: true };
};

export const addPatientMedicalRecordResolvers = {
  Mutation: {
    addPatientMedicalRecord,
  },
};
