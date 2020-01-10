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

const addPatientMedicalRecord: Resolver<
  null,
  MedicalRecordInputArgs,
  ProfilesServiceContext,
  AddMedicalRecordResult
> = async (parent, { addMedicalRecordInput }, { profilesDb }) => {
  const patientsRepo = profilesDb.getCustomRepository(PatientRepository);
  const patient = await patientsRepo.findById(addMedicalRecordInput.patientId);
  if (patient == null) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
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
