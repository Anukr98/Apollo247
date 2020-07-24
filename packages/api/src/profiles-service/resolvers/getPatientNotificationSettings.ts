import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { PatientNotificationSettings } from 'profiles-service/entities';
import { NotificationSettingsRepository } from 'profiles-service/repositories/notificationSettingsRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

export const getPatientNotificationSettingsTypeDefs = gql`
  type NotificationSettingsResult {
    notificationSettings: PatientNotificationSettings
  }
  extend type Query {
    getPatientNotificationSettings(patient: ID!): NotificationSettingsResult
  }
`;

type NotificationSettingsResult = {
  notificationSettings: PatientNotificationSettings | null;
};

const getPatientNotificationSettings: Resolver<
  null,
  { patient: string },
  ProfilesServiceContext,
  NotificationSettingsResult
> = async (parent, args, { profilesDb, doctorsDb }) => {
  //patientId validation
  const patientRepo = profilesDb.getCustomRepository(PatientRepository);
  const patientDetails = await patientRepo.getPatientDetails(args.patient);
  if (patientDetails == null) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }

  const notificationsRepository = profilesDb.getCustomRepository(NotificationSettingsRepository);
  const notificationSettingsResult = await notificationsRepository.findByPatientId(args.patient);
  let notificationSettings;
  if (notificationSettingsResult.length === 0) {
    notificationSettings = null;
  } else {
    notificationSettings = notificationSettingsResult[0];
  }

  return { notificationSettings };
};

export const getPatientNotificationSettingsResolvers = {
  Query: {
    getPatientNotificationSettings,
  },
};
