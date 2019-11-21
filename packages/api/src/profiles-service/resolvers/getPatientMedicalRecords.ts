import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { MedicalRecords } from 'profiles-service/entities';
import { MedicalRecordsRepository } from 'profiles-service/repositories/medicalRecordsRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

export const getPatientMedicalRecordsTypeDefs = gql`
  type MedicalRecords {
    id: ID!
    testName: String!
    testDate: Date
    recordType: MedicalRecordType
    referringDoctor: String
    observations: String
    additionalNotes: String
    sourceName: String
    documentURLs: String
    prismFileIds: String
    patient: Patient
    medicalRecordParameters: [MedicalRecordParameters]
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
  extend type Query {
    getPatientMedicalRecords(patientId: ID!, offset: Int, limit: Int): MedicalRecordsResult
  }
`;

type MedicalRecordsResult = {
  medicalRecords: MedicalRecords[];
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

export const getPatientMedicalRecordsResolvers = {
  Query: {
    getPatientMedicalRecords,
  },
};
