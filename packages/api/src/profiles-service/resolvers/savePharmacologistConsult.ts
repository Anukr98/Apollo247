import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { PharmacologistConsult } from 'profiles-service/entities';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { PharmacologistConsultRepository } from 'profiles-service/repositories/patientPharmacologistConsults';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { pharmacologistEmailTemplate } from 'helpers/emailTemplates/pharmacologistEmailTemplate';
import { sendMail } from 'notifications-service/resolvers/email';
import { ApiConstants } from 'ApiConstants';

export const savePatientNotificationSettingsTypeDefs = gql`
  input SavePharmacologistConsultInput {
    patientId: ID!
    prescriptionImageUrl: String
    emailId: String
    queries: String
  }

  type SavePharmacologistConsultResult {
    status: Boolean
  }

  extend type Mutation {
    savePatientNotificationSettings(
      savePharmacologistConsultInput: SavePharmacologistConsultInput
    ): SavePharmacologistConsultResult!
  }
`;

type SavePharmacologistConsultInput = {
  patientId: string;
  prescriptionImageUrl: string;
  emailId: string;
  queries: string;
};

type SavePharmacologistConsultInputArgs = {
  savePharmacologistConsultInput: SavePharmacologistConsultInput;
};

type SavePharmacologistConsultResult = {
  status: boolean;
};

const savePharmacologistConsult: Resolver<
  null,
  SavePharmacologistConsultInputArgs,
  ProfilesServiceContext,
  SavePharmacologistConsultResult
> = async (parent, { savePharmacologistConsultInput }, { profilesDb }) => {
  if (!savePharmacologistConsultInput.patientId) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }
  const patientRepo = profilesDb.getCustomRepository(PatientRepository);
  const patientDetails = await patientRepo.findById(savePharmacologistConsultInput.patientId);
  if (patientDetails == null) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }
  const pharmacologistRepo = profilesDb.getCustomRepository(PharmacologistConsultRepository);
  const pharmacologistAttrs: Partial<PharmacologistConsult> = {
    patient: patientDetails,
    prescriptionImageUrl: savePharmacologistConsultInput.prescriptionImageUrl,
    emailId: savePharmacologistConsultInput.emailId,
    queries: savePharmacologistConsultInput.queries,
  };
  try {
    await pharmacologistRepo.savePharmacologistConsult(pharmacologistAttrs);
  } catch (e) {
    throw new AphError(AphErrorMessages.SAVE_PHARMACOLOGIST_CONSULT_ERROR, undefined, {});
  }

  return {
    status: true,
  };
};

export const savePatientNotificationSettingsResolvers = {
  Mutation: {
    savePharmacologistConsult,
  },
};
