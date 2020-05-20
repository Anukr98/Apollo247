import { EntityRepository, Repository, Between } from 'typeorm';
import {
  JdDashboardSummary,
  Appointment,
  CaseSheet,
  CASESHEET_STATUS,
  ConsultQueueItem,
  AppointmentCallDetails,
} from 'consults-service/entities';
import { DoctorType } from 'doctors-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { format, addDays, differenceInMinutes, differenceInSeconds } from 'date-fns';

type CasesheetPrepTime = {
  totalduration: number;
  appointmentidcount: number;
};

type AvCount = {
  appointmentid: string;
  appointmentidcount: number;
};

type ApptCreateDates = {
  casesheetcreatedate: Date;
  appointmentdatetime: Date;
};

type TotalConsultation = {
  totalduration: number;
  totalrows: number;
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
        createdDoctorId: doctorId,
        status: CASESHEET_STATUS.COMPLETED,
        createdDate: Between(newStartDate, newEndDate),
      },
    });
  }

  getOngoingCases(selDate: Date, doctorId: string) {
    const newStartDate = new Date(format(addDays(selDate, -1), 'yyyy-MM-dd') + 'T18:30');
    const newEndDate = new Date(format(selDate, 'yyyy-MM-dd') + 'T18:30');
    return CaseSheet.count({
      where: {
        createdDoctorId: doctorId,
        status: CASESHEET_STATUS.PENDING,
        createdDate: Between(newStartDate, newEndDate),
      },
    });
  }

  getTotalAllocatedChats(selDate: Date, doctorId: string) {
    const newStartDate = new Date(format(addDays(selDate, -1), 'yyyy-MM-dd') + 'T18:30');
    const newEndDate = new Date(format(selDate, 'yyyy-MM-dd') + 'T18:30');
    return ConsultQueueItem.count({
      where: {
        doctorId,
        createdDate: Between(newStartDate, newEndDate),
      },
    });
  }

  async getWaitTimePerChat(selDate: Date, doctorId: string) {
    const newStartDate = new Date(format(addDays(selDate, -1), 'yyyy-MM-dd') + 'T18:30');
    const newEndDate = new Date(format(selDate, 'yyyy-MM-dd') + 'T18:30');
    const apptIds = await ConsultQueueItem.createQueryBuilder('consult_queue_item')
      .where('consult_queue_item.doctorId = :docId', { docId: doctorId })
      .andWhere('consult_queue_item.createdDate Between :fromDate AND :toDate', {
        fromDate: newStartDate,
        toDate: newEndDate,
      })
      .getMany();

    let totalMins = 0;
    const promises: object[] = [];
    async function getCasesheetTime(appt: ConsultQueueItem) {
      return new Promise<number>(async (resolve) => {
        console.log(appt, 'came here inside the appt');
        const caseSheetDets = await CaseSheet.findOne({
          where: { appointment: appt.appointmentId, doctorType: DoctorType.JUNIOR },
        });
        if (caseSheetDets) {
          const diffMins =
            Math.abs(differenceInSeconds(caseSheetDets.createdDate, appt.createdDate)) / 60;
          console.log('dates ', caseSheetDets.createdDate, appt.createdDate);
          totalMins += diffMins;
          console.log(totalMins, 'total mins');
        } else {
          totalMins += 0;
        }
        resolve(totalMins);
      });
    }
    console.log(apptIds, apptIds.length);
    if (apptIds.length > 0) {
      apptIds.forEach(async (appt) => {
        promises.push(getCasesheetTime(appt));
      });
    }
    await Promise.all(promises);
    console.log(apptIds.length, totalMins, 'wait time percasesheet');
    if (totalMins == 0 && apptIds.length == 0) {
      return 0;
    } else {
      console.log('finalresult=>', totalMins / apptIds.length);
      return totalMins / apptIds.length;
    }
  }

  async getTotalConsultsInQueue(selDate: Date, doctorId: string) {
    const newStartDate = new Date(format(addDays(selDate, -1), 'yyyy-MM-dd') + 'T18:30');
    const newEndDate = new Date(format(selDate, 'yyyy-MM-dd') + 'T18:30');
    return ConsultQueueItem.createQueryBuilder('consult_queue_item')
      .where('consult_queue_item.doctorId = :docId', { docId: doctorId })
      .andWhere('consult_queue_item.createdDate Between :fromDate AND :toDate', {
        fromDate: newStartDate,
        toDate: newEndDate,
      })
      .getCount();
  }

  async timePerChat(selDate: Date, doctorId: string) {
    const newStartDate = new Date(format(addDays(selDate, -1), 'yyyy-MM-dd') + 'T18:30');
    const newEndDate = new Date(format(selDate, 'yyyy-MM-dd') + 'T18:30');
    const casesheetRows: CasesheetPrepTime[] = await CaseSheet.createQueryBuilder('case_sheet')
      .select([
        'sum("preperationTimeInSeconds") as totalduration',
        'count("appointmentId") as appointmentidcount',
      ])
      .where('case_sheet.createdDate Between :fromDate and :toDate', {
        fromDate: newStartDate,
        toDate: newEndDate,
      })
      .andWhere('case_sheet."createdDoctorId" = :docId', { docId: doctorId })
      .andWhere('case_sheet.status = :status', { status: CASESHEET_STATUS.COMPLETED })
      .getRawMany();
    //console.log(casesheetRows, 'timeperchat casesheet rows');
    if (casesheetRows.length > 0) {
      const duration = parseFloat((casesheetRows[0].totalduration / 60).toFixed(2));
      //console.log(duration, 'duration in imin', casesheetRows[0].appointmentidcount);
      // if (duration && duration > 0) {
      //   return parseFloat((duration / casesheetRows[0].appointmentidcount).toFixed(2));
      // } else {
      //   return 0;
      // }
      return duration;
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
      const callDetails: AvCount[] = await AppointmentCallDetails.createQueryBuilder(
        'appointment_call_details'
      )
        .select([
          '"appointmentId" as appointmentid',
          'count("appointmentId") as appointmentidcount',
        ])
        .where('appointment_call_details."appointmentId" in (:...apptIds)', { apptIds })
        .andWhere('appointment_call_details."callType" = :callType', { callType })
        .andWhere('appointment_call_details."doctorType" = :docType', {
          docType: DoctorType.JUNIOR,
        })
        .groupBy('appointment_call_details."appointmentId"')
        .getRawMany();
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
    const caseSheetDetails: ApptCreateDates[] = await CaseSheet.createQueryBuilder('case_sheet')
      .select([
        'case_sheet."createdDate" as casesheetcreatedate',
        'appointment."appointmentDateTime" as appointmentdatetime',
      ])
      .leftJoinAndSelect('case_sheet.appointment', 'appointment')
      .where('case_sheet."createdDate" between :fromDate and :toDate', {
        fromDate: newStartDate,
        toDate: newEndDate,
      })
      .andWhere('case_sheet."createdDoctorId" = :docId', { docId: doctorId })
      .getRawMany();
    let apptCount = 0;
    if (caseSheetDetails.length > 0) {
      caseSheetDetails.forEach((appt) => {
        const startedMins = Math.abs(
          differenceInMinutes(appt.casesheetcreatedate, appt.appointmentdatetime)
        );
        //console.log(startedMins, 'start mins');
        if (startedMins <= 15) {
          apptCount++;
        }
      });
    }
    return apptCount;
  }

  getCaseSheetsList(limit: number) {
    return CaseSheet.find({
      where: { updatedDate: null },
      take: limit,
      relations: ['appointment'],
    });
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

  async getConsultationTime(selDate: Date, doctorId: string, timeCheck: number) {
    const newStartDate = new Date(format(addDays(selDate, -1), 'yyyy-MM-dd') + 'T18:30');
    const newEndDate = new Date(format(selDate, 'yyyy-MM-dd') + 'T18:30');
    //.select(['case_sheet."preperationTimeInSeconds" as callduration'])
    if (timeCheck == 0) {
      const caseSheetRows = await CaseSheet.createQueryBuilder('case_sheet')
        .where('case_sheet."createdDate" between :fromDate and :toDate', {
          fromDate: newStartDate,
          toDate: newEndDate,
        })
        .andWhere('case_sheet."createdDoctorId" = :docId', { docId: doctorId })
        .andWhere('case_sheet."preperationTimeInSeconds" <= :givenTime', { givenTime: 900 })
        .andWhere('case_sheet.status = :status', { status: CASESHEET_STATUS.COMPLETED })
        .getMany();
      return caseSheetRows.length;
    } else {
      const caseSheetRows = await CaseSheet.createQueryBuilder('case_sheet')
        .where('case_sheet."createdDate" between :fromDate and :toDate', {
          fromDate: newStartDate,
          toDate: newEndDate,
        })
        .andWhere('case_sheet."createdDoctorId" = :docId', { docId: doctorId })
        .andWhere('case_sheet."preperationTimeInSeconds" > :givenTime', { givenTime: 900 })
        .andWhere('case_sheet.status = :status', { status: CASESHEET_STATUS.COMPLETED })
        .getMany();
      return caseSheetRows.length;
    }
  }

  async getTotalConsultationTime(selDate: Date, doctorId: string, needAvg: number) {
    const newStartDate = new Date(format(addDays(selDate, -1), 'yyyy-MM-dd') + 'T18:30');
    const newEndDate = new Date(format(selDate, 'yyyy-MM-dd') + 'T18:30');
    const caseSheetRows: TotalConsultation[] = await CaseSheet.createQueryBuilder('case_sheet')
      .select([
        'sum(case_sheet."preperationTimeInSeconds") as totalduration',
        'count(case_sheet."preperationTimeInSeconds") as totalrows',
      ])
      .where('case_sheet."createdDate" between :fromDate and :toDate', {
        fromDate: newStartDate,
        toDate: newEndDate,
      })
      .andWhere('case_sheet."createdDoctorId" = :docId', { docId: doctorId })
      .andWhere('case_sheet.status = :status', { status: CASESHEET_STATUS.COMPLETED })
      .getRawMany();
    if (caseSheetRows[0].totalrows > 0) {
      const totalDurationInMins = parseFloat((caseSheetRows[0].totalduration / 60).toFixed(2));
      if (needAvg == 0) {
        return parseFloat((totalDurationInMins / caseSheetRows[0].totalrows).toFixed(2));
      } else {
        return totalDurationInMins;
      }
    } else {
      return 0;
    }
  }

  getCasesheetNotSatisfactory(selDate: Date, doctorId: string) {
    const newStartDate = new Date(format(addDays(selDate, -1), 'yyyy-MM-dd') + 'T18:30');
    const newEndDate = new Date(format(selDate, 'yyyy-MM-dd') + 'T18:30');
    return CaseSheet.count({
      where: {
        createdDoctorId: doctorId,
        createdDate: Between(newStartDate, newEndDate),
        symptoms: null,
        status: CASESHEET_STATUS.COMPLETED,
      },
    });
  }
}
