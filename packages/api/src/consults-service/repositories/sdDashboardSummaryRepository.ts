import { EntityRepository, Repository, Connection, Between, Not } from 'typeorm';
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
  CaseSheet,
  CASESHEET_STATUS,
  TRANSFER_INITIATED_TYPE,
  CurrentAvailabilityStatus,
  UtilizationCapacity,
} from 'consults-service/entities';

import { format, addDays, differenceInMinutes, addMinutes, isWithinInterval } from 'date-fns';
import { ConsultMode, DoctorType } from 'doctors-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { DoctorConsultHoursRepository } from 'doctors-service/repositories/doctorConsultHoursRepository';
import { AppointmentSessions } from 'consults-service/entities';
import { ApiConstants } from 'ApiConstants';

type NewPatientCount = {
  patientid: string;
  patientcount: number;
};

type Archive = {
  id: string;
};
type CasesheetPrepTime = {
  totaltime: number;
  totalrows: number;
};
type TotalConsultation = {
  totalduration: number;
  totalrows: number;
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
      return this.update(checkRecord.id, dashboardSummaryAttrs).catch((createErrors) => {
        throw new AphError(AphErrorMessages.UPDATE_APPOINTMENT_ERROR, undefined, {
          createErrors,
        });
      });
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
  async saveDocumentSummary(phrDocSummaryAttrs: Partial<PhrDocumentsSummary>) {
    const checkRecordExist = await PhrDocumentsSummary.findOne({
      where: {
        documentDate: phrDocSummaryAttrs.documentDate,
      },
    });
    if (checkRecordExist) {
      return PhrDocumentsSummary.update(checkRecordExist.id, phrDocSummaryAttrs);
    } else {
      return PhrDocumentsSummary.create(phrDocSummaryAttrs)
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

  async saveDoctorFeeSummaryDetails(doctorFeeAttrs: Partial<DoctorFeeSummary>) {
    const checkRecord = await DoctorFeeSummary.findOne({
      where:{
        doctorId:doctorFeeAttrs.doctorId,
        appointmentDateTime:doctorFeeAttrs.appointmentDateTime
      }
    })
    if(checkRecord){
      return DoctorFeeSummary.update(checkRecord.id,doctorFeeAttrs).catch((createErrors) => {
        throw new AphError(AphErrorMessages.CREATE_DOCTORFEESUMMARY_ERROR, undefined, {
          createErrors,
        });
      });
    }else{
    return DoctorFeeSummary.create(doctorFeeAttrs)
      .save()
      .catch((createErrors) => {
        throw new AphError(AphErrorMessages.CREATE_DOCTORFEESUMMARY_ERROR, undefined, {
          createErrors,
        });
      });
    }
  }

  getAppointmentPaymentDetailsByApptId(appointment: string) {
    return AppointmentPayments.findOne({ where: { appointment } }).catch((createErrors) => {
      throw new AphError(AphErrorMessages.CREATE_APPOINTMENT_ERROR, undefined, { createErrors });
    });
  }
  async getPatientCancelCount(doctorId: string, selDate: Date) {
    const newStartDate = new Date(format(addDays(selDate, -1), 'yyyy-MM-dd') + 'T18:30');
    const newEndDate = new Date(format(selDate, 'yyyy-MM-dd') + 'T18:30');
    const cancelCount = await Appointment.createQueryBuilder('appointment')
      .where('appointment.status = :status', { status: STATUS.CANCELLED })
      .andWhere('appointment."cancelledBy" = :cancelledBy', { cancelledBy: 'PATIENT' })
      .andWhere('appointment."appointmentDateTime" between :fromDate and :toDate', {
        fromDate: newStartDate,
        toDate: newEndDate,
      })
      .andWhere('appointment."doctorId" = :doctorId', { doctorId })
      .getCount();
    return cancelCount;
  }
  getDocumentSummary(docDate: Date) {
    const newStartDate = new Date(format(addDays(docDate, -1), 'yyyy-MM-dd') + 'T18:30');
    const newEndDate = new Date(format(docDate, 'yyyy-MM-dd') + 'T18:30');
    return AppointmentDocuments.createQueryBuilder('appointment_documents')
      .where('appointment_documents.createdDate Between :fromDate AND :toDate', {
        fromDate: newStartDate,
        toDate: newEndDate,
      })
      .andWhere('appointment_documents.userType = 1')
      .getCount();
  }

  getOldDocumentSummary(docDate: Date) {
    const newStartDate = new Date(format(addDays(docDate, -1), 'yyyy-MM-dd') + 'T18:30');
    const newEndDate = new Date(format(docDate, 'yyyy-MM-dd') + 'T18:30');
    return AppointmentDocuments.createQueryBuilder('appointment_documents')
      .where('appointment_documents.createdDate Between :fromDate AND :toDate', {
        fromDate: newStartDate,
        toDate: newEndDate,
      })
      .andWhere('appointment_documents.userType = 0')
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
        .andWhere('appointment.status not in(:status1)', {
          status1: STATUS.PAYMENT_PENDING,
        })
        .getCount();
    } else if (appointmentType == 'PHYSICAL') {
      return Appointment.createQueryBuilder('appointment')
        .where('(appointment.appointmentDateTime Between :fromDate AND :toDate)', {
          fromDate: startDate,
          toDate: endDate,
        })
        .andWhere('appointment.appointmentType = :appointmentType', {
          appointmentType: APPOINTMENT_TYPE.PHYSICAL,
        })
        .andWhere('appointment.doctorId = :doctorId', { doctorId: doctorId })
        .andWhere('appointment.status not in(:status1)', {
          status1: STATUS.PAYMENT_PENDING,
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
        .andWhere('appointment.status not in(:status1)', {
          status1: STATUS.PAYMENT_PENDING,
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
    const callDetails: CasesheetPrepTime[] = await AppointmentCallDetails.createQueryBuilder(
      'appointment_call_details'
    )
      .leftJoinAndSelect('appointment_call_details.appointment', 'appointment')
      .select(['count(appointment_call_details."appointmentId") as totalrows', '0 as totaltime'])
      .where('(appointment."appointmentDateTime" Between :fromDate AND :toDate)', {
        fromDate: startDate,
        toDate: endDate,
      })
      .andWhere('appointment_call_details."callType" = :callType', { callType })
      .andWhere('appointment."doctorId" = :doctorId', { doctorId })
      .andWhere('appointment.status not in(:status1,:status2)', {
        status1: STATUS.CANCELLED,
        status2: STATUS.PAYMENT_PENDING,
      })
      .groupBy('appointment_call_details."appointmentId"')
      .getRawMany();
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

  getRescheduleCount(
    doctorId: string,
    appointmentDate: Date,
    rescheduleType: TRANSFER_INITIATED_TYPE
  ) {
    const inputDate = format(appointmentDate, 'yyyy-MM-dd');
    const endDate = new Date(inputDate + 'T18:29');
    const inputStartDate = format(addDays(appointmentDate, -1), 'yyyy-MM-dd');
    console.log(inputStartDate, 'inputStartDate find by date doctor id');
    const startDate = new Date(inputStartDate + 'T18:30');
    if (rescheduleType == TRANSFER_INITIATED_TYPE.DOCTOR) {
      return Appointment.createQueryBuilder('appointment')
        .where('(appointment."appointmentDateTime" Between :fromDate AND :toDate)', {
          fromDate: startDate,
          toDate: endDate,
        })
        .andWhere('appointment."rescheduleCountByDoctor" > 0')
        .andWhere('appointment."doctorId" = :doctorId', { doctorId: doctorId })
        .getCount();
    } else {
      return Appointment.createQueryBuilder('appointment')
        .where('(appointment."appointmentDateTime" Between :fromDate AND :toDate)', {
          fromDate: startDate,
          toDate: endDate,
        })
        .andWhere('appointment."rescheduleCount" > 0')
        .andWhere('appointment."doctorId" = :doctorId', { doctorId: doctorId })
        .getCount();
    }
  }
  async getTotalCompletedChats(doctorId:string,selDate:Date){
    const newStartDate = new Date(format(addDays(selDate, -1), 'yyyy-MM-dd') + 'T18:30');
    const newEndDate = new Date(format(selDate, 'yyyy-MM-dd') + 'T18:30');
    return await CaseSheet.count({
      where: {
        doctorId: doctorId,
        status: CASESHEET_STATUS.COMPLETED,
        createdDate: Between(newStartDate, newEndDate),
        doctorType:Not('JUNIOR')
      },
    });
  }

  async getTotalRescheduleCount(doctorId:string,appointmentDate:Date){
    const inputDate = format(appointmentDate, 'yyyy-MM-dd');
    const endDate = new Date(inputDate + 'T18:29');
    const inputStartDate = format(addDays(appointmentDate, -1), 'yyyy-MM-dd');
    console.log(inputStartDate, 'inputStartDate find by date doctor id');
    const startDate = new Date(inputStartDate + 'T18:30');
    return Appointment.createQueryBuilder('appointment')
    .where('(appointment."appointmentDateTime" Between :fromDate AND :toDate)',{
      fromDate:startDate,
      toDate:endDate,
     }).andWhere('(appointment."rescheduleCount">0 OR appointment."rescheduleCountByDoctor">0)')
       .andWhere('appointment."doctorId" = :doctorId', { doctorId:doctorId })
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
      .andWhere('appointment_call_details.endTime is not null',{doctorType:Not('JUNIOR')})
      .andWhere('appointment.doctorId = :doctorId', { doctorId: doctorId })
      .getMany();
    console.log(totalTime, 'total time');
    let totalHours = 0;
    if (totalTime.length > 0) {
      totalTime.map((apptTime) => {
        totalHours =
          parseFloat(totalHours.toString()) + parseFloat(apptTime.callDuration.toString());
      });
      totalHours = parseFloat((totalHours / 60).toFixed(2));
    }
    return totalHours;
  }

  async getCasesheetPrepTime(doctorId: string, appointmentDate: Date) {
    const newStartDate = new Date(format(addDays(appointmentDate, -1), 'yyyy-MM-dd') + 'T18:30');
    const newEndDate = new Date(format(appointmentDate, 'yyyy-MM-dd') + 'T18:30');
    const prepTimeRows: CasesheetPrepTime[] = await CaseSheet.createQueryBuilder('case_sheet')
      .select([
        'sum(case_sheet."preperationTimeInSeconds") as totaltime',
        'count(case_sheet."preperationTimeInSeconds") as totalrows',
      ])
      .where('(case_sheet."createdDate" Between :fromDate AND :toDate)', {
        fromDate: newStartDate,
        toDate: newEndDate,
      })
      .andWhere('case_sheet."doctorId" = :doctorId', { doctorId })
      .andWhere('case_sheet."doctorType" != :docType', { docType: DoctorType.JUNIOR })
      .getRawMany();
    console.log(prepTimeRows, 'case sheet prep time');
    if (prepTimeRows[0].totalrows > 0) {
      return parseFloat((prepTimeRows[0].totaltime / 60).toFixed(2));
    } else {
      return 0;
    }
  }
  getFollowUpBookedCount(doctorId: string, appointmentDate: Date, followUpType: string) {
    const newStartDate = new Date(format(addDays(appointmentDate, -1), 'yyyy-MM-dd') + 'T18:30');
    const newEndDate = new Date(format(appointmentDate, 'yyyy-MM-dd') + 'T18:30');
    if (followUpType == '2') {
      return Appointment.count({
        where: {
          doctorId,
          isFollowUp: true,
          bookingDate: Between(newStartDate, newEndDate),
          status: Not(STATUS.CANCELLED),
        },
      });
    } else if (followUpType == '0') {
      return Appointment.count({
        where: {
          doctorId,
          isFollowUp: true,
          isFollowPaid: false,
          bookingDate: Between(newStartDate, newEndDate),
          status: Not(STATUS.CANCELLED),
        },
      });
    } else {
      return Appointment.count({
        where: {
          doctorId,
          isFollowUp: true,
          isFollowPaid: true,
          bookingDate: Between(newStartDate, newEndDate),
          status: Not(STATUS.CANCELLED),
        },
      });
    }
  }
  async   getOnTimeConsultations(doctorId: string, appointmentDate: Date) {
    const startDate = new Date(format(addDays(appointmentDate, -1), 'yyyy-MM-dd') + 'T18:30');
    const endDate = new Date(format(appointmentDate, 'yyyy-MM-dd') + 'T18:30');
    const appointmentList = await Appointment.find({
      where: {
        doctorId,
        appointmentDateTime: Between(startDate, endDate),
        status: Not(STATUS.CANCELLED),
      },
    });
    let count: number = 0;
    if (appointmentList.length) {
      return new Promise<number>((resolve, reject) => {
        appointmentList.forEach(async (appt, index, array) => {
          const calldetails = await AppointmentCallDetails.findOne({
            where: { appointment: appt.id },
          });
          if (calldetails) {
            const apptFormat = format(appt.appointmentDateTime, 'yyyy-MM-dd HH:mm');
            const callStartTimeFormat = format(calldetails.startTime, 'yyyy-MM-dd HH:mm');
            const addingFiveMinutes = addMinutes(appt.appointmentDateTime, 5);
            const addingFiveMinutesFormat = format(addingFiveMinutes, 'yyyy-MM-dd HH:mm');
            const withInTime = isWithinInterval(new Date(callStartTimeFormat), {
              start: new Date(apptFormat),
              end: new Date(addingFiveMinutesFormat),
            });
            if (withInTime) {
              count = count + 1;
            }
          }
          if (index + 1 === array.length) {
            resolve(count);
          }
        });
      });
    } else {
      return count;
    }
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

  async getFileDownloadUrls(appointmentId: string) {
    const openTok = require('opentok');
    const opentok = new openTok(process.env.OPENTOK_KEY, process.env.OPENTOK_SECRET);
    const sessions = await AppointmentSessions.find({ where: { appointment: appointmentId } });
    return new Promise<string[]>((resolve, reject) => {
      if (sessions.length === 0) {
        resolve([]);
      } else {
        const urls: string[] = [];
        let count = 0;
        const getUrl = async (sessions: AppointmentSessions[]) => {
          if (count === sessions.length) {
            resolve(urls);
          } else {
            if (sessions[count]) {
              opentok.listArchives(
                {
                  sessionId: sessions[count].sessionId,
                },
                (err: string, archives: Archive[], counter: number) => {
                  if (!err) {
                    if (archives && archives.length) {
                      archives.forEach((archive) => {
                        const url = ApiConstants.OPENTOK_URL.replace('{1}', archive.id);
                        urls.push(url);
                      });
                    }
                  }
                  count++;
                  getUrl(sessions);
                }
              );
            }
          }
        };
        getUrl(sessions);
      }
    });
  }
  async get15ConsultationTime(selDate: Date, doctorId: string, timeCheck: number) {
    const newStartDate = new Date(format(addDays(selDate, -1), 'yyyy-MM-dd') + 'T18:30');
    const newEndDate = new Date(format(selDate, 'yyyy-MM-dd') + 'T18:30');
    //.select(['case_sheet."preperationTimeInSeconds" as callduration'])
    if (timeCheck == 0) {
      const caseSheetRows = await CaseSheet.createQueryBuilder('case_sheet')
        .where('case_sheet."createdDate" between :fromDate and :toDate', {
          fromDate: newStartDate,
          toDate: newEndDate,
        })
        .andWhere('case_sheet."doctorId" = :docId', { docId: doctorId })
        .andWhere('case_sheet."preperationTimeInSeconds" <= :givenTime', { givenTime: 900 })
        .andWhere('case_sheet.status = :status', { status: CASESHEET_STATUS.COMPLETED })
        .andWhere('case_sheet."doctorType" != :docType', { docType: DoctorType.JUNIOR })
        .getMany();
      return caseSheetRows.length;
    } else {
      const caseSheetRows = await CaseSheet.createQueryBuilder('case_sheet')
        .where('case_sheet."createdDate" between :fromDate and :toDate', {
          fromDate: newStartDate,
          toDate: newEndDate,
        })
        .andWhere('case_sheet."doctorId" = :docId', { docId: doctorId })
        .andWhere('case_sheet."preperationTimeInSeconds" > :givenTime', { givenTime: 900 })
        .andWhere('case_sheet.status = :status', { status: CASESHEET_STATUS.COMPLETED })
        .andWhere('case_sheet."doctorType" != :docType', { docType: DoctorType.JUNIOR })
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
}
@EntityRepository(CurrentAvailabilityStatus)
export class CurrentAvailStatusRepository extends Repository<CurrentAvailabilityStatus> {
  async updateavailabilityStatus(
    specialityId: string,
    specialityName: string,
    totalDoc: number,
    onlineDoc: number
  ) {
    const CurrentAvailabilityStatusData: Partial<CurrentAvailabilityStatus> = {
      specialityId: specialityId,
      specialtyName: specialityName,
      totalCount: totalDoc,
      onlineCount: onlineDoc,
    };
    const specialityData = await this.findOne({ where: [{ specialityId }] });
    if (specialityData) {
      this.update(specialityData.id, CurrentAvailabilityStatusData);
    } else {
      return this.save(CurrentAvailabilityStatusData).catch((saveCurrentAvailabilityError) => {
        throw new AphError(AphErrorMessages.GET_SPECIALTIES_ERROR, undefined, {
          saveCurrentAvailabilityError,
        });
      });
    }
  }
}
@EntityRepository(UtilizationCapacity)
export class UtilizationCapacityRepository extends Repository<UtilizationCapacity> {
  async updateUtilization(
    specialityId: string,
    specialityName: string,
    doctorSlots: number,
    bookedSlots: number
  ) {
    const utilizationCapacityData: Partial<UtilizationCapacity> = {
      specialityId: specialityId,
      specialtyName: specialityName,
      doctorSlots: doctorSlots,
      slotsBooked: bookedSlots,
    };
    const Data = await this.findOne({ where: [{ specialityId }] });
    if (Data) {
      this.update(Data.id, utilizationCapacityData).catch((utilizationError) => {
        throw new AphError(AphErrorMessages.GET_SPECIALTIES_ERROR, undefined, {
          utilizationError,
        });
      });
    } else {
      return this.save(utilizationCapacityData).catch((utilizationError) => {
        throw new AphError(AphErrorMessages.GET_SPECIALTIES_ERROR, undefined, {
          utilizationError,
        });
      });
    }
  }
}
