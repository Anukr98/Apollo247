import { EntityRepository, Repository } from 'typeorm';
import { Appointment, SdDashboardSummary, STATUS } from 'consults-service/entities';
import { format, addDays } from 'date-fns';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

@EntityRepository(SdDashboardSummary)
export class SdDashboardSummaryRepository extends Repository<SdDashboardSummary> {
  saveDashboardDetails(dashboardSummaryAttrs: Partial<SdDashboardSummary>) {
    return this.create(dashboardSummaryAttrs)
      .save()
      .catch((createErrors) => {
        throw new AphError(AphErrorMessages.CREATE_APPOINTMENT_ERROR, undefined, { createErrors });
      });
  }

  getAppointmentsByDoctorId(doctorId: string, appointmentDate: Date) {
    const inputDate = format(appointmentDate, 'yyyy-MM-dd');
    const endDate = new Date(inputDate + 'T18:29');
    const inputStartDate = format(addDays(appointmentDate, -1), 'yyyy-MM-dd');
    console.log(inputStartDate, 'inputStartDate find by date doctor id');
    const startDate = new Date(inputStartDate + 'T18:30');
    return this.createQueryBuilder('appointment')
      .where('(appointment.appointmentDateTime Between :fromDate AND :toDate)', {
        fromDate: startDate,
        toDate: endDate,
      })
      .andWhere('appointment.doctorId = :doctorId', { doctorId: doctorId })
      .andWhere('appointment.status not in(:status1,:status2)', {
        status1: STATUS.CANCELLED,
        status2: STATUS.PAYMENT_PENDING,
      })
      .getCount();
  }
}
