import { EntityRepository, Repository } from 'typeorm';
import { PatientFeedback, FEEDBACKTYPE } from 'profiles-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { addDays, format } from 'date-fns';

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
    const inputDate = format(feedbackDate, 'yyyy-MM-dd');
    const endDate = new Date(inputDate + 'T18:29');
    const inputStartDate = format(addDays(feedbackDate, -1), 'yyyy-MM-dd');
    console.log(inputStartDate, 'inputStartDate find by date doctor id - calls count');
    const startDate = new Date(inputStartDate + 'T18:30');
    return this.createQueryBuilder('patientfeedback')
      .select(['patientfeedback.rating as rating', 'count(rating) as ratingCount'])
      .where('patientfeedback.feedbackType = :feedbackType', {
        feedbackType,
      })
      .andWhere('patientfeedback.createdDate between :fromDate and :toDate', {
        fromDate: startDate,
        toDate: endDate,
      })
      .groupBy('patientfeedback.rating')
      .getRawMany();
  }
}
