import { EntityRepository, Repository } from 'typeorm';
import { DoctorsFavouriteTests } from 'doctors-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

@EntityRepository(DoctorsFavouriteTests)
export class DoctorFavouriteTestRepository extends Repository<DoctorsFavouriteTests> {
  saveDoctorFavouriteTest(doctorFavouriteTestAttrs: Partial<DoctorsFavouriteTests>) {
    return this.create(doctorFavouriteTestAttrs)
      .save()
      .catch((doctorFavouriteTestAttrs) => {
        throw new AphError(AphErrorMessages.SAVE_DOCTOR_FAVOURITE_TEST_ERROR, undefined, {
          doctorFavouriteTestAttrs,
        });
      });
  }

  getDoctorFavouriteTestList(doctorId: string) {
    return this.find({ where: { doctor: doctorId } }).catch((favouriteTestError) => {
      throw new AphError(AphErrorMessages.GET_DOCTOR_FAVOURITE_TEST_ERROR, undefined, {
        favouriteTestError,
      });
    });
  }

  getDoctorFavouriteTestById(doctorId: string, id: string) {
    return this.find({ where: { doctor: doctorId, id } }).catch((favouriteTestError) => {
      throw new AphError(AphErrorMessages.GET_DOCTOR_FAVOURITE_TEST_ERROR, undefined, {
        favouriteTestError,
      });
    });
  }

  getDoctorFavouriteTestByName(doctorId: string, itemName: string) {
    return this.createQueryBuilder('doctors_favourite_tests')
      .where('LOWER(doctors_favourite_tests.itemName) = :itemName', {
        itemName: `${itemName.toLocaleLowerCase()}`,
      })
      .andWhere('doctors_favourite_tests.doctor = :doctorId', { doctorId })
      .getMany()
      .catch((favouriteTestError) => {
        throw new AphError(AphErrorMessages.GET_DOCTOR_FAVOURITE_TEST_ERROR, undefined, {
          favouriteTestError,
        });
      });
  }

  deleteFavouriteTest(id: string) {
    return this.delete(id).catch((favouriteTestError) => {
      throw new AphError(AphErrorMessages.DELETE_DOCTOR_FAVOURITE_TEST_ERROR, undefined, {
        favouriteTestError,
      });
    });
  }

  checkTestNameWhileUpdate(itemName: string, id: string) {
    return this.createQueryBuilder('doctors_favourite_tests')
      .where('LOWER(doctors_favourite_tests.itemName) = :itemName', {
        itemName: `${itemName}`,
      })
      .andWhere('doctors_favourite_tests.id != :id', { id })
      .getMany()
      .catch((favouritemMedicineError) => {
        throw new AphError(AphErrorMessages.GET_DOCTOR_FAVOURITE_TEST_ERROR, undefined, {
          favouritemMedicineError,
        });
      });
  }
}
