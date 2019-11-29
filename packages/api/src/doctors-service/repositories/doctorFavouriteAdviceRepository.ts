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
  getDoctorAdviceByName(doctorId: string, instruction: string) {
    return this.createQueryBuilder('doctors_favourite_advice')
      .where('LOWER(doctors_favourite_advice.instruction) = :instruction', {
        instruction: `${instruction.toLocaleLowerCase()}`,
      })
      .andWhere('doctors_favourite_advice.doctor = :doctorId', { doctorId })
      .getMany()
      .catch((adviceError) => {
        throw new AphError(AphErrorMessages.GET_DOCTOR_ADVICE_ERROR, undefined, {
          adviceError,
        });
      });
  }
  getDoctorAdviceList(doctorId: string) {
    return this.find({ where: { doctorId } }).catch((adviceError) => {
      throw new AphError(AphErrorMessages.GET_DOCTOR_ADVICE_ERROR, undefined, {
        adviceError,
      });
    });
  }
  getDoctorAdviceById(doctorId: string, id: string) {
    return this.find({ where: { doctorId, id } }).catch((adviceError) => {
      throw new AphError(AphErrorMessages.GET_DOCTOR_ADVICE_ERROR, undefined, {
        adviceError,
      });
    });
  }
  deleteAdvice(id: string) {
    return this.delete(id).catch((adviceError) => {
      throw new AphError(AphErrorMessages.GET_DOCTOR_ADVICE_ERROR, undefined, {
        adviceError,
      });
    });
  }
}
