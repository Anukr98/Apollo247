import { EntityRepository, Repository } from 'typeorm';
import { DoctorsFavouriteMedicine } from 'doctors-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

@EntityRepository(DoctorsFavouriteMedicine)
export class DoctorFavouriteMedicineRepository extends Repository<DoctorsFavouriteMedicine> {
  saveDoctorFavouriteMedicine(doctorFavouriteMedicineAttrs: Partial<DoctorsFavouriteMedicine>) {
    return this.create(doctorFavouriteMedicineAttrs)
      .save()
      .catch((doctorFavouriteMedicineError) => {
        throw new AphError(AphErrorMessages.SAVE_DOCTOR_FAVOURITE_MEDICINE_ERROR, undefined, {
          doctorFavouriteMedicineError,
        });
      });
  }
}
