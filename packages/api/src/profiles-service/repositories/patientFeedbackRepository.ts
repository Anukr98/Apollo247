import { EntityRepository, Repository } from 'typeorm';
import { PatientFeedback, FEEDBACKTYPE } from 'profiles-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { addDays } from 'date-fns';

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

  getFeedbackByDate(feedbackDate: Date, feedbackType: FEEDBACKTYPE) {
    return this.createQueryBuilder('patientfeedback')
      .select(['patientfeedback.rating as rating', 'count(rating) as ratingCount'])
      .where('patientfeedback.feedbackType = :feedbackType', {
        feedbackType,
      })
      .andWhere('patientfeedback.createdDate between :fromDate and :toDate', {
        fromDate: feedbackDate,
        toDate: addDays(feedbackDate, 1),
      })
      .groupBy('patientfeedback.rating')
      .getRawMany();
  }
}
