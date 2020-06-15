import { EntityRepository, Repository } from 'typeorm';
import { PlannedDoctors } from 'consults-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

@EntityRepository(PlannedDoctors)
export class PlannedDoctorsRepo extends Repository<PlannedDoctors> {
  async saveDetails(plannedDoctorsAttrs: Partial<PlannedDoctors>) {
    const checkRecord = await this.findOne({
      where: {
        specialityId: plannedDoctorsAttrs.specialityId,
        availabilityDate: plannedDoctorsAttrs.availabilityDate,
      },
    });
    if (checkRecord) {
      return this.update(checkRecord.id, plannedDoctorsAttrs).catch((createErrors) => {
        throw new AphError(AphErrorMessages.CREATE_APPOINTMENT_ERROR, undefined, {
          createErrors,
        });
      });
    } else {
      return this.save(this.create(plannedDoctorsAttrs)).catch((createErrors) => {
        throw new AphError(AphErrorMessages.SAVE_PLANNED_DOCTORS_ERROR, undefined, {
          createErrors,
        });
      });
    }
  }
}
