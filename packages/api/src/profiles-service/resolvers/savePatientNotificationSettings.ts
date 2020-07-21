import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { Patient, PatientNotificationSettings } from 'profiles-service/entities';
import { NotificationSettingsRepository } from 'profiles-service/repositories/notificationSettingsRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

export const savePatientNotificationSettingsTypeDefs = gql`
  input SavePatientNotificationSettingsInput {
    patient: ID!
    commissionNotification: Boolean
    messageFromDoctorNotification: Boolean
    playNotificationSound: Boolean
    reScheduleAndCancellationNotification: Boolean
    paymentNotification: Boolean
    upcomingAppointmentReminders: Boolean
  }

  type PatientNotificationSettings {
    id: ID!
    patient: Patient!
    commissionNotification: Boolean!
    messageFromDoctorNotification: Boolean!
    playNotificationSound: Boolean!
    reScheduleAndCancellationNotification: Boolean!
    paymentNotification: Boolean!
    upcomingAppointmentReminders: Boolean!
  }

  type SavePatientNotificationSettingsResult {
    status: Boolean
  }

  extend type Mutation {
    savePatientNotificationSettings(
      notificationSettingsInput: SavePatientNotificationSettingsInput
    ): SavePatientNotificationSettingsResult!
  }
`;

type SaveNotificationSettingsInput = {
  patient: Patient;
  commissionNotification: boolean;
  messageFromDoctorNotification: boolean;
  playNotificationSound: boolean;
  reScheduleAndCancellationNotification: boolean;
  paymentNotification: boolean;
  upcomingAppointmentReminders: boolean;
};

type PatientNotificationSettingsInputArgs = {
  notificationSettingsInput: SaveNotificationSettingsInput;
};

type SaveNotificationResult = {
  status: boolean;
};

const savePatientNotificationSettings: Resolver<
  null,
  PatientNotificationSettingsInputArgs,
  ProfilesServiceContext,
  SaveNotificationResult
> = async (parent, { notificationSettingsInput }, { profilesDb }) => {
  const notificationAttrs: Omit<Partial<PatientNotificationSettings>, 'id'> = {
    ...notificationSettingsInput,
  };
  if (notificationAttrs.patient == null)
    throw new AphError(AphErrorMessages.SAVE_NOTIFICATION_SETTINGS_ERROR);

  //patiend id validation
  const patientRepo = profilesDb.getCustomRepository(PatientRepository);
  const patientDetails = await patientRepo.getPatientDetails(<string>(<unknown>notificationAttrs.patient));
  if (patientDetails == null) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }

  const notificationsRepo = profilesDb.getCustomRepository(NotificationSettingsRepository);
  const notificationSettings = await notificationsRepo.findByPatientId(<string>(
    (<unknown>notificationAttrs.patient)
  ));

  if (notificationSettings.length > 0) {
    await notificationsRepo.updateNotificationSettings(notificationAttrs);
  } else {
    await notificationsRepo.createNotificationSettings(notificationAttrs);
  }
  return { status: true };
};

export const savePatientNotificationSettingsResolvers = {
  Mutation: {
    savePatientNotificationSettings,
  },
};
