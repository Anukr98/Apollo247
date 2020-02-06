import { EntityRepository, Repository } from 'typeorm';
import { PlannedDoctors } from 'consults-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

@EntityRepository(PlannedDoctors)
export class PlannedDoctorsRepo extends Repository<PlannedDoctors> {
  saveDetails(plannedDoctorsAttrs: Partial<PlannedDoctors>) {
    return this.save(this.create(plannedDoctorsAttrs)).catch((createErrors) => {
      throw new AphError(AphErrorMessages.SAVE_PLANNED_DOCTORS_ERROR, undefined, {
        createErrors,
      });
    });
  }
}
