import { EntityRepository, Repository } from 'typeorm';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { NotificationBin } from 'consults-service/entities';

@EntityRepository(NotificationBin)
export class NotificationBinRepository extends Repository<NotificationBin> {
  async saveNotification(notifyAttrs: Partial<NotificationBin>) {
    try {
      return this.create(notifyAttrs).save();
    } catch (createErrors) {
      throw new AphError(AphErrorMessages.CREATE_NOTIFICATION_ERROR, undefined, { createErrors });
    }
  }
}
