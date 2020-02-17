import { EntityRepository, Repository } from 'typeorm';
import { RegistrationCodes, REG_CODES_STATUS, Patient } from 'profiles-service/entities';

@EntityRepository(RegistrationCodes)
export class RegistrationCodesRepository extends Repository<RegistrationCodes> {
  updateCodeStatus(id: string, patient: Patient) {
    return this.update(id, { codeStatus: REG_CODES_STATUS.SENT, patient });
  }

  getCode() {
    return this.find({
      where: { codeStatus: REG_CODES_STATUS.NOT_SENT },
      take: 1,
      order: { createdDate: 'ASC' },
    });
  }
}
