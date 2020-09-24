import { EntityRepository, Repository } from 'typeorm';
import { Deeplink } from 'doctors-service/entities';

import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

@EntityRepository(Deeplink)
export class DeeplinkRepository extends Repository<Deeplink> {
  async createDeeplink(deeplinkAttrs: Partial<Deeplink>) {
    try {
      return this.create(deeplinkAttrs).save();
    } catch (deepLinkError) {
      throw new AphError(AphErrorMessages.SAVE_DEEPLINK_ERROR, undefined, {
        deepLinkError,
      });
    }
  }

  async updateDeepLink(id: string, updatedata: Partial<Deeplink>) {
    return this.update(id, updatedata).catch((deepLinkError) => {
      throw new AphError(AphErrorMessages.UPDATE_DEEPLINK_ERROR, undefined, {
        deepLinkError,
      });
    });
  }

  async getDeepLinkByDoctorId(doctorId: string) {
    return this.findOne({ where: { doctorId } }).catch((deepLinkError) => {
      throw new AphError(AphErrorMessages.GET_DEEPLINK_ERROR, undefined, {
        deepLinkError,
      });
    });
  }

  async getDeeplinks() {
    return this.find().catch((deepLinkError) => {
      throw new AphError(AphErrorMessages.GET_DEEPLINK_ERROR, undefined, {
        deepLinkError,
      });
    });
  }

  async getDeeplinksByLimit(offset: number, limit: number) {
    return this.find({
      skip: offset,
      take: limit,
      order: {
        id: 'ASC',
      },
    }).catch((deepLinkError) => {
      throw new AphError(AphErrorMessages.GET_DEEPLINK_ERROR, undefined, {
        deepLinkError,
      });
    });
  }

  async bulkUpsertDeepLinks(deeplinkAttrs: Partial<Deeplink>[]) {
    try {
      return this.save(deeplinkAttrs);
    } catch (deepLinkError) {
      throw new AphError(AphErrorMessages.SAVE_DEEPLINK_ERROR, undefined, {
        deepLinkError,
      });
    }
  }

  async upsertDeepLink(deeplinkAttrs: Partial<Deeplink>) {
    try {
      return this.save(deeplinkAttrs);
    } catch (deepLinkError) {
      throw new AphError(AphErrorMessages.SAVE_DEEPLINK_ERROR, undefined, {
        deepLinkError,
      });
    }
  }

  async getDoctorsWithDeepLink() {
    return this.find({ select: ['doctorId'] }).catch((deepLinkError) => {
      throw new AphError(AphErrorMessages.GET_DEEPLINK_ERROR, undefined, {
        deepLinkError,
      });
    });
  }
}
