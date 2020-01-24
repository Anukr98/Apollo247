import { EntityRepository, Repository, Connection, Between } from 'typeorm';
import {
  Appointment,
  AppointmentCallDetails,
  SdDashboardSummary,
  STATUS,
  FeedbackDashboardSummary,
  APPOINTMENT_TYPE,
  PhrDocumentsSummary,
  AppointmentPayments,
  DoctorFeeSummary,
  AppointmentDocuments,
} from 'consults-service/entities';
import { format, addDays, differenceInMinutes } from 'date-fns';
import { ConsultMode } from 'doctors-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { DoctorConsultHoursRepository } from 'doctors-service/repositories/doctorConsultHoursRepository';

type NewPatientCount = {
  patientid: string;
  patientcount: number;
};

@EntityRepository(SdDashboardSummary)
export class SdDashboardSummaryRepository extends Repository<SdDashboardSummary> {
  async saveDashboardDetails(dashboardSummaryAttrs: Partial<SdDashboardSummary>) {
    const checkRecord = await this.findOne({
      where: {
        doctorId: dashboardSummaryAttrs.doctorId,
        appointmentDateTime: dashboardSummaryAttrs.appointmentDateTime,
      },
    });
    if (checkRecord) {
      return this.update(checkRecord.id, dashboardSummaryAttrs);
    } else {
      return this.create(dashboardSummaryAttrs)
        .save()
        .catch((createErrors) => {
          throw new AphError(AphErrorMessages.CREATE_APPOINTMENT_ERROR, undefined, {
            createErrors,
          });
        });
    }
  }

  saveFeedbackDetails(feedbackSummaryAttrs: Partial<FeedbackDashboardSummary>) {
    return FeedbackDashboardSummary.create(feedbackSummaryAttrs)
      .save()
      .catch((createErrors) => {
        throw new AphError(AphErrorMessages.CREATE_APPOINTMENT_ERROR, undefined, { createErrors });
      });
  }

  saveDoctorFeeSummaryDetails(doctorFeeAttrs: Partial<DoctorFeeSummary>) {
    return DoctorFeeSummary.create(doctorFeeAttrs)
      .save()
      .catch((createErrors) => {
        throw new AphError(AphErrorMessages.CREATE_DOCTORFEESUMMARY_ERROR, undefined, {
          createErrors,
        });
      });
  }

  getAppointmentPaymentDetailsByApptId(appointment: string) {
    return AppointmentPayments.findOne({ where: { appointment } }).catch((createErrors) => {
      throw new AphError(AphErrorMessages.CREATE_APPOINTMENT_ERROR, undefined, { createErrors });
    });
  }

  saveDocumentSummary(phrDocSummaryAttrs: Partial<PhrDocumentsSummary>) {
    return PhrDocumentsSummary.create(phrDocSummaryAttrs)
      .save()
      .catch((createErrors) => {
        throw new AphError(AphErrorMessages.CREATE_APPOINTMENT_ERROR, undefined, { createErrors });
      });
  }

  getDocumentSummary(docDate: Date) {
    const newStartDate = new Date(format(addDays(docDate, -1), 'yyyy-MM-dd') + 'T18:30');
    const newEndDate = new Date(format(docDate, 'yyyy-MM-dd') + 'T18:30');
    return AppointmentDocuments.createQueryBuilder('appointment_documents')
      .where('appointment_documents.createdDate Between :fromDate AND :toDate', {
        fromDate: newStartDate,
        toDate: newEndDate,
      })
      .getCount();
  }

  getAppointmentsByDoctorId(doctorId: string, appointmentDate: Date, appointmentType: string) {
    const inputDate = format(appointmentDate, 'yyyy-MM-dd');
    const endDate = new Date(inputDate + 'T18:29');
    const inputStartDate = format(addDays(appointmentDate, -1), 'yyyy-MM-dd');
    console.log(inputStartDate, 'inputStartDate find by date doctor id');
    const startDate = new Date(inputStartDate + 'T18:30');
    if (appointmentType == 'BOTH') {
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
    } else {
      return Appointment.createQueryBuilder('appointment')
        .where('(appointment.appointmentDateTime Between :fromDate AND :toDate)', {
          fromDate: startDate,
          toDate: endDate,
        })
        .andWhere('appointment.appointmentType = :appointmentType', {
          appointmentType: APPOINTMENT_TYPE.ONLINE,
        })
        .andWhere('appointment.doctorId = :doctorId', { doctorId: doctorId })
        .andWhere('appointment.status not in(:status1,:status2)', {
          status1: STATUS.CANCELLED,
          status2: STATUS.PAYMENT_PENDING,
        })
        .getCount();
    }
  }

  getAppointmentsDetailsByDoctorId(
    doctorId: string,
    appointmentDate: Date,
    appointmentType: string
  ) {
    const inputDate = format(appointmentDate, 'yyyy-MM-dd');
    const endDate = new Date(inputDate + 'T18:29');
    const inputStartDate = format(addDays(appointmentDate, -1), 'yyyy-MM-dd');
    const startDate = new Date(inputStartDate + 'T18:30');
    if (appointmentType == ConsultMode.BOTH) {
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
        .getMany();
    } else {
      return Appointment.createQueryBuilder('appointment')
        .where('(appointment.appointmentDateTime Between :fromDate AND :toDate)', {
          fromDate: startDate,
          toDate: endDate,
        })
        .andWhere('appointment.appointmentType = :appointmentType', {
          appointmentType: APPOINTMENT_TYPE.ONLINE,
        })
        .andWhere('appointment.doctorId = :doctorId', { doctorId: doctorId })
        .andWhere('appointment.status not in(:status1,:status2)', {
          status1: STATUS.CANCELLED,
          status2: STATUS.PAYMENT_PENDING,
        })
        .getMany();
    }
  }

  async getCallsCount(doctorId: string, callType: string, appointmentDate: Date) {
    const inputDate = format(appointmentDate, 'yyyy-MM-dd');
    const endDate = new Date(inputDate + 'T18:29');
    const inputStartDate = format(addDays(appointmentDate, -1), 'yyyy-MM-dd');
    console.log(inputStartDate, 'inputStartDate find by date doctor id - calls count');
    const startDate = new Date(inputStartDate + 'T18:30');
    const callDetails = await AppointmentCallDetails.createQueryBuilder('appointment_call_details')
      .leftJoinAndSelect('appointment_call_details.appointment', 'appointment')
      .where('(appointment.appointmentDateTime Between :fromDate AND :toDate)', {
        fromDate: startDate,
        toDate: endDate,
      })
      .andWhere('appointment_call_details.callType = :callType', { callType: callType })
      .andWhere('appointment.doctorId = :doctorId', { doctorId: doctorId })
      .groupBy('appointment_call_details.appointmentId')
      .getMany();
    if (callDetails && callDetails.length > 0) {
      return callDetails.length;
    } else {
      return 0;
    }
    // let counter = 0;
    // console.log(callDetails, 'callDetails');
    // if (callDetails.length > 0) {
    //   callDetails.map((dets) => {
    //     if (differenceInMinutes(dets.startTime, dets.appointment.appointmentDateTime) < 60) {
    //       counter++;
    //     }
    //   });
    //   return counter;
    // } else {
    //   return counter;
    // }
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

  async getTimePerConsult(doctorId: string, appointmentDate: Date) {
    const inputDate = format(appointmentDate, 'yyyy-MM-dd');
    const endDate = new Date(inputDate + 'T18:29');
    const inputStartDate = format(addDays(appointmentDate, -1), 'yyyy-MM-dd');
    console.log(inputStartDate, 'inputStartDate find by date doctor id - time per consult');
    const startDate = new Date(inputStartDate + 'T18:30');
    const totalTime = await AppointmentCallDetails.createQueryBuilder('appointment_call_details')
      .leftJoinAndSelect('appointment_call_details.appointment', 'appointment')
      .where('(appointment.appointmentDateTime Between :fromDate AND :toDate)', {
        fromDate: startDate,
        toDate: endDate,
      })
      .andWhere('appointment_call_details.endTime is not null')
      .andWhere('appointment.doctorId = :doctorId', { doctorId: doctorId })
      .getMany();
    console.log(totalTime, 'total time');
    let totalHours = 0;
    if (totalTime.length > 0) {
      totalTime.map((apptTime) => {
        totalHours =
          parseFloat(totalHours.toString()) + parseFloat(apptTime.callDuration.toString());
      });
    }
    return totalHours;
  }

  getFollowUpBookedCount(doctorId: string, appointmentDate: Date, followUpType: string) {
    const newStartDate = new Date(format(addDays(appointmentDate, -1), 'yyyy-MM-dd') + 'T18:30');
    const newEndDate = new Date(format(appointmentDate, 'yyyy-MM-dd') + 'T18:30');
    if (followUpType == '0') {
      return Appointment.count({
        where: {
          doctorId,
          isFollowUp: true,
          isFollowPaid: false,
          bookingDate: Between(newStartDate, newEndDate),
        },
      });
    } else {
      return Appointment.count({
        where: {
          doctorId,
          isFollowUp: true,
          isFollowPaid: true,
          bookingDate: Between(newStartDate, newEndDate),
        },
      });
    }
  }

  async getOnTimeConsultations(doctorId: string, appointmentDate: Date) {
    const startDate = new Date(format(addDays(appointmentDate, -1), 'yyyy-MM-dd') + 'T18:30');
    const endDate = new Date(format(appointmentDate, 'yyyy-MM-dd') + 'T18:30');
    const appointmentList = await Appointment.find({
      where: {
        doctorId,
        appointmentDateTime: Between(startDate, endDate),
      },
    });
    const apptIds: string[] = [];
    let duration = 0;
    if (appointmentList.length > 0) {
      appointmentList.map((appt) => {
        apptIds.push(appt.id);
      });
      console.log(apptIds, 'apptIds in ontime consultation');

      const callDetails = await AppointmentCallDetails.createQueryBuilder(
        'appointment_call_details'
      )
        .select([
          'appointment_call_details."appointmentId" as "appointmentid"',
          'sum(appointment_call_details."callDuration") as "totalduration"',
        ])
        .andWhere('appointment_call_details."appointmentId" in (:...apptIds)', { apptIds })
        .andWhere('appointment_call_details.endTime is not null')
        .groupBy('appointment_call_details."appointmentId"')
        .getRawMany();
      console.log(callDetails, 'callDetails');

      if (callDetails.length > 0) {
        duration = callDetails[0].totalduration;
      }
    }
    return duration;
  }

  async getPatientTypes(appointmentDate: Date, doctorId: string) {
    const startDate = new Date(format(addDays(appointmentDate, -1), 'yyyy-MM-dd') + 'T18:30');
    const endDate = new Date(format(appointmentDate, 'yyyy-MM-dd') + 'T18:30');
    const apptsList: NewPatientCount[] = await Appointment.createQueryBuilder('appointment')
      .select(['patientId as patientid', 'count(patientId) as patientcount'])
      .where('appointment.doctorId = :doctorId', { doctorId })
      .andWhere('appointment.appointmentDateTime Between :fromDate and :toDate', {
        fromDate: startDate,
        toDate: endDate,
      })
      .groupBy('appointment.patientId')
      .getRawMany();
    let repeatCount = 0,
      newCount = 0;
    if (apptsList.length > 0) {
      apptsList.forEach((appt) => {
        if (appt.patientcount > 1) {
          repeatCount++;
        } else {
          newCount++;
        }
      });
    }
    return repeatCount + '-' + newCount;
  }
}
