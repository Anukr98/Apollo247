import { EntityRepository, Repository } from 'typeorm';
import { PharmacologistConsult } from 'profiles-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

@EntityRepository(PharmacologistConsult)
export class PharmacologistConsultRepository extends Repository<PharmacologistConsult> {
  async savePharmacologistConsult(pharmacologistConsult: Partial<PharmacologistConsult>) {
    try {
      return this.create(pharmacologistConsult).save();
    } catch (error) {
      throw new AphError(AphErrorMessages.SAVE_PHARMACOLOGIST_CONSULT_ERROR, undefined, {
        error,
      });
    }
  }
}
