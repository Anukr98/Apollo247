import { EntityRepository, Repository } from 'typeorm';
import { JdDashboardSummary } from 'consults-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

@EntityRepository(JdDashboardSummary)
export class JdDashboardSummaryRepository extends Repository<JdDashboardSummary> {
  async saveJdDashboardDetails(jdDashboardSummaryAttrs: Partial<JdDashboardSummary>) {
    const checkRecord = await this.findOne({
      where: {
        doctorId: jdDashboardSummaryAttrs.doctorId,
        appointmentDateTime: jdDashboardSummaryAttrs.appointmentDateTime,
      },
    });
    if (checkRecord) {
      return this.update(checkRecord.id, jdDashboardSummaryAttrs);
    } else {
      return this.create(jdDashboardSummaryAttrs)
        .save()
        .catch((createErrors) => {
          throw new AphError(AphErrorMessages.CREATE_APPOINTMENT_ERROR, undefined, {
            createErrors,
          });
        });
    }
  }
}
