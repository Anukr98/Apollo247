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

  async updateLoginSession(loginSession: Partial<DoctorLoginSessionHistory>) {
    return this.save(loginSession).catch((loginSessionError) => {
      throw new AphError(AphErrorMessages.SAVE_LOGIN_SESSION_ERROR, undefined, {
        loginSessionError,
      });
    });
  }

  getLoginDetailsByDocId(doctor: string, sessionDate: Date) {
    return this.findOne({ where: { doctor, sessionDate } });
  }
}
