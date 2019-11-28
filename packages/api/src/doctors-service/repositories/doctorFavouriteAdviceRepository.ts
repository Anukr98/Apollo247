import { EntityRepository, Repository } from 'typeorm';
import { DoctorsFavouriteAdvice } from 'doctors-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

@EntityRepository(DoctorsFavouriteAdvice)
export class DoctorFavouriteAdviceRepository extends Repository<DoctorsFavouriteAdvice> {
  saveDoctorFavouriteAdvice(doctorFavouriteAdviceAttrs: Partial<DoctorsFavouriteAdvice>) {
    return this.create(doctorFavouriteAdviceAttrs)
      .save()
      .catch((doctorFavouriteAdviceError) => {
        throw new AphError(AphErrorMessages.SAVE_DOCTOR_FAVOURITE_ADVICE_ERROR, undefined, {
          doctorFavouriteAdviceError,
        });
      });
  }

  getDoctorFavouriteAdviceList(doctorId: string) {
    return this.find({ where: { doctorId } }).catch((favouriteAdviceError) => {
      throw new AphError(AphErrorMessages.GET_DOCTOR_FAVOURITE_ADVICE_ERROR, undefined, {
        favouriteAdviceError,
      });
    });
  }
}
