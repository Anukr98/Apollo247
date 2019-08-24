import { EntityRepository, Repository, IsNull } from 'typeorm';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { CaseSheet } from 'consults-service/entities';

@EntityRepository(CaseSheet)
export class CaseSheetRepository extends Repository<CaseSheet> {
  savecaseSheet(caseSheetAttrs: Partial<CaseSheet>) {
    return this.create(caseSheetAttrs)
      .save()
      .catch((createErrors) => {
        throw new AphError(AphErrorMessages.CREATE_APPOINTMENT_ERROR, undefined, { createErrors });
      });
  }

  getJuniorDoctorCaseSheet(appointmentId: string) {
    return this.findOne({
      where: [{ appointmentId, createdDoctorId: IsNull() }],
      relations: ['appointment'],
    });
  }
}
