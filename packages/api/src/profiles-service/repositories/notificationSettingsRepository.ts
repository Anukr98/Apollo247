import { EntityRepository, Repository } from 'typeorm';
import { PatientNotificationSettings } from 'profiles-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

@EntityRepository(PatientNotificationSettings)
export class NotificationSettingsRepository extends Repository<PatientNotificationSettings> {
  findByPatientId(patient: string) {
    return this.find({ where: { patient }, relations: ['patient'] }).catch((getSettingsError) => {
      throw new AphError(AphErrorMessages.GET_NOTIFICATION_SETTINGS_ERROR, undefined, {
        getSettingsError,
      });
    });
  }

  createNotificationSettings(notificationsettings: Partial<PatientNotificationSettings>) {
    return this.create(notificationsettings)
      .save()
      .catch((saveSettingsError) => {
        throw new AphError(AphErrorMessages.SAVE_NOTIFICATION_SETTINGS_ERROR, undefined, {
          saveSettingsError,
        });
      });
  }

  updateNotificationSettings(notificationAttrs: Partial<PatientNotificationSettings>) {
    const { patient, ...notificationSettings } = notificationAttrs;
    return this.update({ patient }, { ...notificationSettings }).catch((saveSettingsError) => {
      throw new AphError(AphErrorMessages.SAVE_NOTIFICATION_SETTINGS_ERROR, undefined, {
        saveSettingsError,
      });
    });
  }
}
