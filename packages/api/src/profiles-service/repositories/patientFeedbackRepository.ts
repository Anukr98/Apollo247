import { EntityRepository, Repository } from 'typeorm';
import { PatientFeedback } from 'profiles-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

@EntityRepository(PatientFeedback)
export class PatientFeedbackRepository extends Repository<PatientFeedback> {
  addFeedbackRecord(feedbackRecordAttrs: Partial<PatientFeedback>) {
    return this.create(feedbackRecordAttrs)
      .save()
      .catch((saveRecordError) => {
        throw new AphError(AphErrorMessages.SAVE_MEDICAL_RECORD_ERROR, undefined, {
          saveRecordError,
        });
      });
  }
}
