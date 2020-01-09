import { EntityRepository, Repository } from 'typeorm';
import { DoctorLoginSessionHistory } from 'doctors-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

@EntityRepository(DoctorLoginSessionHistory)
export class LoginHistoryRepository extends Repository<DoctorLoginSessionHistory> {
  getLoginSessionByDate(todaydate: Date) {
    return this.findOne({
      where: [{ sessionDate: todaydate }],
    });
  }

  updateLoginSession(loginSession: Partial<DoctorLoginSessionHistory>) {
    return this.save(loginSession).catch((loginSessionError) => {
      //TODO: change error message
      throw new AphError(AphErrorMessages.SAVE_DOCTORS_ERROR, undefined, {
        loginSessionError,
      });
    });
  }
}
