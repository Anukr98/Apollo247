import { EntityRepository, Repository, Connection } from 'typeorm';
import {
  Appointment,
  AppointmentCallDetails,
  SdDashboardSummary,
  STATUS,
} from 'consults-service/entities';
import { format, addDays } from 'date-fns';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { differenceInMinutes } from 'date-fns';
import { DoctorConsultHoursRepository } from 'doctors-service/repositories/doctorConsultHoursRepository';

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
    return Appointment.createQueryBuilder('appointment')
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

  async getCallsCount(doctorId: string, callType: string, appointmentDate: Date) {
    const inputDate = format(appointmentDate, 'yyyy-MM-dd');
    const endDate = new Date(inputDate + 'T18:29');
    const inputStartDate = format(addDays(appointmentDate, -1), 'yyyy-MM-dd');
    console.log(inputStartDate, 'inputStartDate find by date doctor id');
    const startDate = new Date(inputStartDate + 'T18:30');
    const callDetails = await AppointmentCallDetails.createQueryBuilder('appointment_call_details')
      .leftJoinAndSelect('appointment_call_details.appointment', 'appointment')
      .where('(appointment.appointmentDateTime Between :fromDate AND :toDate)', {
        fromDate: startDate,
        toDate: endDate,
      })
      .andWhere('appointment_call_details.callType = :callType', { callType: callType })
      .andWhere('appointment.doctorId = :doctorId', { doctorId: doctorId })
      .getMany();
    let counter = 0;
    if (callDetails.length > 0) {
      callDetails.map((dets) => {
        if (differenceInMinutes(dets.startTime, dets.appointment.appointmentDateTime) < 60) {
          counter++;
        }
      });
      return counter;
    } else {
      return counter;
    }
  }

  getRescheduleCount(doctorId: string, appointmentDate: Date) {
    const inputDate = format(appointmentDate, 'yyyy-MM-dd');
    const endDate = new Date(inputDate + 'T18:29');
    const inputStartDate = format(addDays(appointmentDate, -1), 'yyyy-MM-dd');
    console.log(inputStartDate, 'inputStartDate find by date doctor id');
    const startDate = new Date(inputStartDate + 'T18:30');
    return Appointment.createQueryBuilder('appointment')
      .where('(appointment.appointmentDateTime Between :fromDate AND :toDate)', {
        fromDate: startDate,
        toDate: endDate,
      })
      .andWhere('appointment.rescheduleCountByDoctor > 0')
      .andWhere('appointment.doctorId = :doctorId', { doctorId: doctorId })
      .getCount();
  }

  async getDoctorSlots(doctorId: string, appointmentDate: Date, doctorsDb: Connection) {
    const consultHourRep = doctorsDb.getCustomRepository(DoctorConsultHoursRepository);
    const weekDay = format(appointmentDate, 'EEEE').toUpperCase();
    const timeSlots = await consultHourRep.getConsultHours(doctorId, weekDay);
    let totalSlots = 0;
    if (timeSlots && timeSlots.length > 0) {
      timeSlots.map((timeSlot) => {
        let st = `${appointmentDate.toDateString()} ${timeSlot.startTime.toString()}`;
        const ed = `${appointmentDate.toDateString()} ${timeSlot.endTime.toString()}`;
        let consultStartTime = new Date(st);
        const consultEndTime = new Date(ed);
        console.log('consults timings', consultStartTime, consultEndTime);
        let previousDate: Date = appointmentDate;
        if (consultEndTime < consultStartTime) {
          previousDate = addDays(appointmentDate, -1);
          st = `${previousDate.toDateString()} ${timeSlot.startTime.toString()}`;
          consultStartTime = new Date(st);
        }
        const duration = parseFloat((60 / timeSlot.consultDuration).toFixed(1));
        console.log(duration, 'doctor duration');
        let slotsCount =
          (Math.abs(differenceInMinutes(consultEndTime, consultStartTime)) / 60) * duration;
        if (slotsCount - Math.floor(slotsCount) == 0.5) {
          slotsCount = Math.ceil(slotsCount);
        } else {
          slotsCount = Math.floor(slotsCount);
        }
        totalSlots += slotsCount;
        console.log(
          slotsCount,
          'slot count',
          differenceInMinutes(consultEndTime, consultStartTime)
        );
      });
    }
    return totalSlots;
  }
}
