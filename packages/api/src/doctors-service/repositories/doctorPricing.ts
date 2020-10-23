import { EntityRepository, Repository } from 'typeorm';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { DoctorPricing } from 'doctors-service/entities/doctorPricing';

@EntityRepository(DoctorPricing)
export class DoctorPricingRepository extends Repository<DoctorPricing> {
  saveDoctorPricing(doctorPricing: Partial<DoctorPricing>) {
    return this.create(doctorPricing)
      .save()
      .catch((createErrors) => {
        throw new AphError(AphErrorMessages.CREATE_DOCTORPRICING_ERROR, undefined, {
          createErrors,
        });
      });
  }
}
