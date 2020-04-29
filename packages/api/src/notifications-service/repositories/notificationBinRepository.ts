import { EntityRepository, Repository, Between } from 'typeorm';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import {
  NotificationBin,
  NotificationBinArchive,
  notificationStatus,
} from 'consults-service/entities';

@EntityRepository(NotificationBin)
export class NotificationBinRepository extends Repository<NotificationBin> {
  async saveNotification(notifyAttrs: Partial<NotificationBin>) {
    try {
      return this.create(notifyAttrs).save();
    } catch (createErrors) {
      throw new AphError(AphErrorMessages.CREATE_NOTIFICATION_ERROR, undefined, { createErrors });
    }
  }

  async updateNotification(id: string, updatedata: Partial<NotificationBin>) {
    return this.update(id, updatedata).catch((updateNotificationError) => {
      throw new AphError(AphErrorMessages.UPDATE_NOTIFICATION_ERROR, undefined, {
        updateNotificationError,
      });
    });
  }

  async removeNotification(id: string) {
    return this.delete(id).catch((getErrors) => {
      throw new AphError(AphErrorMessages.DELETE_NOTIFICATION_ERROR, undefined, {
        getErrors,
      });
    });
  }

  async getNotificationById(id: string) {
    try {
      return this.findOne({ where: { id } });
    } catch (getNotificationErrors) {
      throw new AphError(AphErrorMessages.GET_NOTIFICATION_ERROR, undefined, {
        getNotificationErrors,
      });
    }
  }

  async getNotificationInTimePeriod(toId: string, startDate: Date, endDate: Date) {
    try {
      return this.find({ where: { toId, createdDate: Between(startDate, endDate) } });
    } catch (getNotificationErrors) {
      throw new AphError(AphErrorMessages.GET_NOTIFICATION_ERROR, undefined, {
        getNotificationErrors,
      });
    }
  }

  async getAllNotificationsByDoctorIds(ids: string[]) {
    return this.createQueryBuilder('notificationBin')
      .where('notificationBin.toId IN (:...ids)', { ids })
      .andWhere('notificationBin.status = :status', { status: notificationStatus.UNREAD })
      .getRawMany();
  }
}

@EntityRepository(NotificationBinArchive)
export class NotificationBinArchiveRepository extends Repository<NotificationBinArchive> {
  async saveNotification(notifyAttrs: Partial<NotificationBinArchive>) {
    try {
      return this.create(notifyAttrs).save();
    } catch (createErrors) {
      throw new AphError(AphErrorMessages.CREATE_NOTIFICATION_ARCHIVE_ERROR, undefined, {
        createErrors,
      });
    }
  }

  async updateNotification(id: string, updatedata: Partial<NotificationBinArchive>) {
    return this.update(id, updatedata).catch((updateNotificationError) => {
      throw new AphError(AphErrorMessages.UPDATE_NOTIFICATION_ARCHIVE_ERROR, undefined, {
        updateNotificationError,
      });
    });
  }

  async removeNotification(id: string) {
    return this.delete(id).catch((getErrors) => {
      throw new AphError(AphErrorMessages.DELETE_NOTIFICATION_ARCHIVE_ERROR, undefined, {
        getErrors,
      });
    });
  }
}
