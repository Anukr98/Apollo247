import { EntityRepository, Repository, Between } from 'typeorm';
import {
  JdDashboardSummary,
  Appointment,
  CaseSheet,
  CASESHEET_STATUS,
  ConsultQueueItem,
  AppointmentCallDetails,
} from 'consults-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { format, addDays, differenceInMinutes } from 'date-fns';

type CasesheetPrepTime = {
  totalDuration: number;
  appointmentidcount: number;
};

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

  getTotalCompletedChats(selDate: Date, doctorId: string) {
    const newStartDate = new Date(format(addDays(selDate, -1), 'yyyy-MM-dd') + 'T18:30');
    const newEndDate = new Date(format(selDate, 'yyyy-MM-dd') + 'T18:30');
    return CaseSheet.count({
      where: {
        doctorId,
        status: CASESHEET_STATUS.COMPLETED,
        createdDate: Between(newStartDate, newEndDate),
      },
    });
  }

  async getWaitTimePerChat(selDate: Date, doctorId: string) {
    const newStartDate = new Date(format(addDays(selDate, -1), 'yyyy-MM-dd') + 'T18:30');
    const newEndDate = new Date(format(selDate, 'yyyy-MM-dd') + 'T18:30');
    const apptIds = await ConsultQueueItem.createQueryBuilder('consult_queue_item')
      .where('conult_queue_item.doctorId = :docId', { docId: doctorId })
      .andWhere('consult_queue_item.createdDate Between :fromDate AND :toDate', {
        fromDate: newStartDate,
        toDate: newEndDate,
      })
      .getMany();
    let totalMins = 0;
    if (apptIds.length > 0) {
      apptIds.forEach(async (appt) => {
        const caseSheetDets = await CaseSheet.findOne({
          where: { appointment: appt, doctorType: 'JUNIOR' },
        });
        if (caseSheetDets) {
          const diffMins = Math.abs(
            differenceInMinutes(caseSheetDets.createdDate, appt.createdDate)
          );
          totalMins += diffMins;
        }
      });
    }
    console.log(apptIds.length, totalMins, 'wait time percasesheet');
    return totalMins / apptIds.length;
  }

  async timePerChat(selDate: Date, doctorId: string) {
    const newStartDate = new Date(format(addDays(selDate, -1), 'yyyy-MM-dd') + 'T18:30');
    const newEndDate = new Date(format(selDate, 'yyyy-MM-dd') + 'T18:30');
    const casesheetRows: CasesheetPrepTime[] = await CaseSheet.createQueryBuilder('case_sheet')
      .select([
        'sum("preperationTimeInSeconds") as totalduration',
        'count("appointmentId") as appointmentidcount',
      ])
      .where('case_sheet.createdDate Betwen :fromDate and :toDate', {
        fromDate: newStartDate,
        toDate: newEndDate,
      })
      .andWhere('case_sheet.doctorId = :docId', { docId: doctorId })
      .getRawMany();
    console.log(casesheetRows, 'timeperchat casesheet rows');
    if (casesheetRows.length > 0) {
      const duration = parseFloat((casesheetRows[0].totalDuration / 60).toFixed(2));
      return duration / casesheetRows[0].appointmentidcount;
    } else {
      return 0;
    }
  }

  async getCallsCount(doctorId: string, callType: string, selDate: Date) {
    const newStartDate = new Date(format(addDays(selDate, -1), 'yyyy-MM-dd') + 'T18:30');
    const newEndDate = new Date(format(selDate, 'yyyy-MM-dd') + 'T18:30');
    const apptCallDetails = await ConsultQueueItem.createQueryBuilder('consult_queue_item')
      .where('consult_queue_item."createdDate" between :fromDate and :toDate', {
        fromDate: newStartDate,
        toDate: newEndDate,
      })
      .andWhere('consult_queue_item."doctorId" = :docId', { docId: doctorId })
      .getMany();
    const apptIds: string[] = [];
    if (apptCallDetails.length > 0) {
      apptCallDetails.map((appt) => {
        apptIds.push(appt.appointmentId);
      });
      console.log(apptIds, 'apptIds in ontime consultation');
      const callDetails = await AppointmentCallDetails.createQueryBuilder(
        'appointment_call_details'
      )
        .where('appointment_call_details."appointmentId" in (:...apptIds)', { apptIds })
        .andWhere('appointment_call_details."callType" = :callType', { callType })
        .groupBy('appointment_call_details."appointmentId"')
        .getMany();
      if (callDetails && callDetails.length > 0) {
        return callDetails.length;
      } else {
        return 0;
      }
    } else {
      return 0;
    }
  }

  getAppointmentDetails(id: string) {
    return Appointment.findOne({ where: { id } });
  }

  async appointmentBefore15(selDate: Date, doctorId: string) {
    const newStartDate = new Date(format(addDays(selDate, -1), 'yyyy-MM-dd') + 'T18:30');
    const newEndDate = new Date(format(selDate, 'yyyy-MM-dd') + 'T18:30');
    const getCaseSheetList = await CaseSheet.find({
      where: { doctorId, createdDate: Between(newStartDate, newEndDate) },
    });
    let apptCount = 0;
    console.log(getCaseSheetList.length, 'case sheet length');
    if (getCaseSheetList.length > 0) {
      getCaseSheetList.forEach(async (caseSheet) => {
        const apptDetails = await this.getAppointmentDetails(caseSheet.appointment.id);
        if (apptDetails) {
          const startedMins = Math.abs(
            differenceInMinutes(caseSheet.createdDate, apptDetails.appointmentDateTime)
          );
          if (startedMins <= 15) {
            apptCount++;
          }
        }
      });
    }
    return apptCount;
  }

  getCaseSheetsList(limit: number) {
    return CaseSheet.find({ where: { updatedDate: null }, take: limit });
  }

  getCallDetailTime(appointment: string) {
    return AppointmentCallDetails.find({
      where: {
        appointment,
      },
      order: { endTime: 'ASC' },
    });
  }

  updateCaseSheetEndTime(id: string, updatedDate: Date, duration: number) {
    return CaseSheet.update(id, { updatedDate, preperationTimeInSeconds: duration });
  }
}
