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
    return this.find({ where: { doctorId } }).catch((favouriteTestError) => {
      throw new AphError(AphErrorMessages.GET_DOCTOR_FAVOURITE_ADVICE_ERROR, undefined, {
        favouriteTestError,
      });
    });
  }
}
