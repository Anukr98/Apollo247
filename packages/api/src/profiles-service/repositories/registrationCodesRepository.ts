import { EntityRepository, Repository } from 'typeorm';
import { RegistrationCodes, REGISTRATION_CODES_STATUS, Patient } from 'profiles-service/entities';

@EntityRepository(RegistrationCodes)
export class RegistrationCodesRepository extends Repository<RegistrationCodes> {
  async updateCodeStatus(id: string, patient: Patient) {
    const checkRow = await this.find({ where: { patient } });
    if (checkRow.length == 0) {
      return this.update(id, { codeStatus: REGISTRATION_CODES_STATUS.SENT, patient });
    } else {
      return false;
    }
  }

  getCode() {
    return this.find({
      where: { codeStatus: REGISTRATION_CODES_STATUS.NOT_SENT },
      take: 1,
      order: { createdDate: 'ASC' },
    });
  }
}
