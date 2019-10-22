import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { Patient } from 'profiles-service/entities';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

export const getPatientTypeDefs = gql`
  type PatientInfo {
    patient: Patient
  }
  type PatientList {
    patients: [Patient]
  }
  type GetPatientsResult {
    patients: [Patient!]!
  }
  extend type Query {
    getPatientById(patientId: String): PatientInfo
    getPatientByMobileNumber(mobileNumber: String): PatientList
    getPatients: GetPatientsResult
  }
`;

type PatientInfo = {
  patient: Patient;
};
type PatientList = {
  patients: Patient[];
};

const getPatientById: Resolver<
  null,
  { patientId: string },
  ProfilesServiceContext,
  PatientInfo
> = async (parent, args, { profilesDb }) => {
  const patientRepo = profilesDb.getCustomRepository(PatientRepository);
  const patient = await patientRepo.findById(args.patientId);
  if (!patient) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }
  return { patient };
};

const getPatientByMobileNumber: Resolver<
  null,
  { mobileNumber: string },
  ProfilesServiceContext,
  PatientList
> = async (parent, args, { profilesDb }) => {
  const patientRepo = profilesDb.getCustomRepository(PatientRepository);
  const patients = await patientRepo.findByMobileNumber(args.mobileNumber);
  if (!patients) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_DETAILS, undefined, {});
  }
  return { patients };
};

const getPatients = () => {
  return { patients: [] };
};

export const getPatientResolvers = {
  Query: {
    getPatientById,
    getPatientByMobileNumber,
    getPatients,
  },
};
