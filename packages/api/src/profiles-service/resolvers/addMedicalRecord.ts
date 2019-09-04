import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { MedicalRecords, MedicalRecordParameters } from 'profiles-service/entities';
import { MedicalRecordsRepository } from 'profiles-service/repositories/medicalRecordsRepository';
import { MedicalRecordParametersRepository } from 'profiles-service/repositories/medicalRecordParametersRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';

import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

export const addPatientMedicalRecordTypeDefs = gql`
  input AddMedicalRecordInput {
    patientId: ID!
    testName: String!
    testDate: Date
    recordType: String
    referringDoctor: String
    sourceName: String
    observations: String
    additionalNotes: String
    documentURLs: String
    medicalRecordParameters: [AddMedicalRecordParametersInput]
  }

  input AddMedicalRecordParametersInput {
    parameterName: String
    unit: String
    result: Float
    minimum: Float
    maximum: Float
  }

  type AddMedicalRecordResult {
    status: Boolean
  }

  extend type Mutation {
    addPatientMedicalRecord(addMedicalRecordInput: AddMedicalRecordInput): AddMedicalRecordResult!
  }
`;

type AddMedicalRecordInput = {
  patientId: string;
  testName: string;
  testDate: Date;
  recordType: string;
  referringDoctor: string;
  sourceName: string;
  observations: string;
  additionalNotes: string;
  documentURLs: string;
  medicalRecordParameters: [AddMedicalRecordParametersInput];
};

type AddMedicalRecordParametersInput = {
  parameterName: string;
  unit: string;
  result: number;
  minimum: number;
  maximum: number;
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
    patient: patient,
    testName: addMedicalRecordInput.testName,
    testDate: addMedicalRecordInput.testDate,
    recordType: addMedicalRecordInput.recordType,
    referringDoctor: addMedicalRecordInput.referringDoctor,
    sourceName: addMedicalRecordInput.sourceName,
    observations: addMedicalRecordInput.observations,
    additionalNotes: addMedicalRecordInput.additionalNotes,
    documentURLs: addMedicalRecordInput.documentURLs,
  };

  const medicalRecordRepo = profilesDb.getCustomRepository(MedicalRecordsRepository);
  const medicalRecord = await medicalRecordRepo.addMedicalRecord(addMedicalRecordAttrs);
  console.log(addMedicalRecordInput.medicalRecordParameters);
  console.log('length', addMedicalRecordInput.medicalRecordParameters!.length);
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
