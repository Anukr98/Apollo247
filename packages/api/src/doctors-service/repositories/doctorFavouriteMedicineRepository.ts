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

  favouriteMedicines(doctorId: string) {
    return this.find({ where: { doctorId } }).catch((favouriteMedicineError) => {
      throw new AphError(AphErrorMessages.GET_DOCTOR_FAVOURITE_MEDICINE_ERROR, undefined, {
        favouriteMedicineError,
      });
    });
  }

  removeFavouriteMedicineById(id: string) {
    return this.delete(id).catch((favouriteTestError) => {
      throw new AphError(AphErrorMessages.DELETE_DOCTOR_FAVOURITE_MEDICINE_ERROR, undefined, {
        favouriteTestError,
      });
    });
  }

  updateFavouriteMedicine(id: string, updatedata: Partial<DoctorsFavouriteMedicine>) {
    return this.update(id, updatedata).catch((doctorFavouriteMedicineError) => {
      throw new AphError(AphErrorMessages.UPDATE_DOCTOR_FAVOURITE_MEDICINE_ERROR, undefined, {
        doctorFavouriteMedicineError,
      });
    });
  }

  findById(id: string) {
    return this.findOne({ where: { id } }).catch((getFavouritesError) => {
      throw new AphError(AphErrorMessages.GET_FAVOURITE_ERROR, undefined, {
        getFavouritesError,
      });
    });
  }
}
