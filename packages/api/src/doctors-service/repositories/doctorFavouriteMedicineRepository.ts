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
    return this.find({ where: { doctor: doctorId } }).catch((favouriteMedicineError) => {
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

  getFavouriteMedicineByName(medicineName: string, doctorId: string) {
    return this.createQueryBuilder('doctors_favourite_medicine')
      .where('LOWER(doctors_favourite_medicine.medicineName) = :medicineName', {
        medicineName: `${medicineName}`,
      })
      .andWhere('doctors_favourite_medicine.doctor = :doctorId', { doctorId })
      .getMany()
      .catch((favouritemMedicineError) => {
        throw new AphError(AphErrorMessages.GET_DOCTOR_FAVOURITE_MEDICINE_ERROR, undefined, {
          favouritemMedicineError,
        });
      });
  }

  checkMedicineNameWhileUpdate(medicineName: string, id: string) {
    return this.createQueryBuilder('doctors_favourite_medicine')
      .where('LOWER(doctors_favourite_medicine.medicineName) = :medicineName', {
        medicineName: `${medicineName}`,
      })
      .andWhere('doctors_favourite_medicine.id != :id', { id })
      .getMany()
      .catch((favouritemMedicineError) => {
        throw new AphError(AphErrorMessages.GET_DOCTOR_FAVOURITE_MEDICINE_ERROR, undefined, {
          favouritemMedicineError,
        });
      });
  }
}
