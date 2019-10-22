import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { Patient } from 'profiles-service/entities';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

export const getPatientTypeDefs = gql`
  type PatientInfo {
    patients: Patient
  }
  type PatientList {
    patients: [Patient]
  }
  extend type Query {
    getPatientById(patientId: String): PatientInfo
    getPatientByMobile(mobileNumber: String): PatientList
  }
`;

type PatientInfo = {
  patients: Patient;
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
  const patients = await patientRepo.findById(args.patientId);
  if (!patients) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }
  return { patients };
};

const getPatientByMobile: Resolver<
  null,
  { mobileNumber: string },
  ProfilesServiceContext,
  PatientList
> = async (parent, args, { profilesDb }) => {
  const patientRepo = profilesDb.getCustomRepository(PatientRepository);
  const patients = await patientRepo.findByMobileNumber(args.mobileNumber);
  if (!patients) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }
  return { patients };
};

export const getPatientResolvers = {
  Query: {
    getPatientById,
    getPatientByMobile,
  },
};
