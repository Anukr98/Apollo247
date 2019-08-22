import { EntityRepository, Repository } from 'typeorm';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { CaseSheet } from 'consults-service/entities';

@EntityRepository(CaseSheet)
export class AppointmentRepository extends Repository<CaseSheet> {
  saveSymptom(symptomAttrs: Partial<CaseSheet>) {
    return this.create(symptomAttrs)
      .save()
      .catch((createErrors) => {
        throw new AphError(AphErrorMessages.CREATE_APPOINTMENT_ERROR, undefined, { createErrors });
      });
  }
}
