import {
  EntityRepository,
  Repository,
  Between,
  LessThan,
  Brackets,
  Not,
  Connection,
  In,
} from 'typeorm';
import {
  Appointment,
  AppointmentPayments,
  AppointmentSessions,
  STATUS,
  patientLogSort,
  patientLogType,
  APPOINTMENT_STATE,
  APPOINTMENT_TYPE,
  CONSULTS_RX_SEARCH_FILTER,
  REQUEST_ROLES,
} from 'consults-service/entities';
import { AppointmentDateTime } from 'doctors-service/resolvers/getDoctorsBySpecialtyAndFilters';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { format, addMinutes, differenceInMinutes, addDays, subDays } from 'date-fns';
import { ConsultHours, ConsultMode } from 'doctors-service/entities';
import { DoctorConsultHoursRepository } from 'doctors-service/repositories/doctorConsultHoursRepository';
import { BlockedCalendarItemRepository } from 'doctors-service/repositories/blockedCalendarItemRepository';
//import { DoctorNextAvaialbleSlotsRepository } from 'consults-service/repositories/DoctorNextAvaialbleSlotsRepository';

@EntityRepository(Appointment)
export class AppointmentRepository extends Repository<Appointment> {
  findById(id: string) {
    return this.findOne({ id }).catch((getApptError) => {
      throw new AphError(AphErrorMessages.GET_APPOINTMENT_ERROR, undefined, {
        getApptError,
      });
    });
  }

  findByAppointmentId(id: string) {
    return this.find({
      where: { id },
    }).catch((getApptError) => {
      throw new AphError(AphErrorMessages.GET_APPOINTMENT_ERROR, undefined, {
        getApptError,
      });
    });
  }

  checkPatientCancelledHistory(patientId: string, doctorId: string) {
    const newStartDate = new Date(format(addDays(new Date(), -8), 'yyyy-MM-dd') + 'T18:30');
    const newEndDate = new Date(format(new Date(), 'yyyy-MM-dd') + 'T18:30');
    const whereClause = {
      patientId,
      doctorId,
      cancelledById: patientId,
      cancelledDate: Between(newStartDate, newEndDate),
    };
    return this.count({ where: whereClause });
  }

  findByIdAndStatus(id: string, status: STATUS) {
    return this.findOne({
      where: { id, status },
    }).catch((getApptError) => {
      throw new AphError(AphErrorMessages.GET_APPOINTMENT_ERROR, undefined, {
        getApptError,
      });
    });
  }

  checkIfAppointmentExist(doctorId: string, appointmentDateTime: Date) {
    /*return this.count({
      where: {
        doctorId,
        appointmentDateTime,
        status: Not([STATUS.CANCELLED, STATUS.PAYMENT_PENDING]),
      },
    });*/

    return this.createQueryBuilder('appointment')
      .where('appointment.appointmentDateTime = :fromDate', {
        fromDate: appointmentDateTime,
      })
      .andWhere('appointment.doctorId = :doctorId', { doctorId: doctorId })
      .andWhere('appointment.status not in(:status1,:status2)', {
        status1: STATUS.CANCELLED,
        status2: STATUS.PAYMENT_PENDING,
      })
      .getCount();
  }

  findByDateDoctorId(doctorId: string, appointmentDate: Date) {
    const inputDate = format(appointmentDate, 'yyyy-MM-dd');
    const endDate = new Date(inputDate + 'T18:29');
    const inputStartDate = format(addDays(appointmentDate, -1), 'yyyy-MM-dd');
    console.log(inputStartDate, 'inputStartDate find by date doctor id');
    const startDate = new Date(inputStartDate + 'T18:30');
    /*return this.find({
      where: {
        doctorId,
        appointmentDateTime: Between(startDate, endDate),
        status: Not(STATUS.CANCELLED),
      },
    });*/
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
      .getMany();
  }

  saveAppointment(appointmentAttrs: Partial<Appointment>) {
    return this.create(appointmentAttrs)
      .save()
      .catch((createErrors) => {
        throw new AphError(AphErrorMessages.CREATE_APPOINTMENT_ERROR, undefined, { createErrors });
      });
  }

  saveAppointmentPayment(appointmentPaymentAttrs: Partial<AppointmentPayments>) {
    return AppointmentPayments.create(appointmentPaymentAttrs)
      .save()
      .catch((createErrors) => {
        throw new AphError(AphErrorMessages.ADD_APPOINTMENT_PAYMENT_ERROR, undefined, {
          createErrors,
        });
      });
  }

  saveAppointmentSession(appointmentSessionAttrs: Partial<AppointmentSessions>) {
    return AppointmentSessions.create(appointmentSessionAttrs)
      .save()
      .catch((createErrors) => {
        throw new AphError(AphErrorMessages.CREATE_APPOINTMENT_SESSION_ERROR, undefined, {
          createErrors,
        });
      });
  }

  getPatientAppointments(doctorId: string, patientId: string) {
    const curDate = new Date();
    let curMin = curDate.getUTCMinutes();
    if (curMin >= 0 && curMin < 15) {
      curMin = 0;
    } else if (curMin >= 15 && curMin < 30) {
      curMin = 15;
    } else if (curMin >= 30 && curMin < 45) {
      curMin = 30;
    } else if (curMin > 45) {
      curMin = 45;
    }
    const inputStartDate =
      format(curDate, 'yyyy-MM-dd') + 'T' + curDate.getUTCHours() + ':' + curMin;
    console.log('past appts', inputStartDate);
    return this.find({
      where: {
        doctorId,
        patientId,
        appointmentDateTime: LessThan(inputStartDate),
        status: Not(STATUS.CANCELLED),
      },
      order: { appointmentDateTime: 'DESC' },
    });
  }

  getPatientPastAppointments(
    patientId: string,
    filter?: CONSULTS_RX_SEARCH_FILTER[],
    offset?: number,
    limit?: number
  ) {
    const whereClause = {
      patientId,
      //appointmentDateTime: LessThan(new Date()),
      status: STATUS.COMPLETED,
      appointmentType: In([APPOINTMENT_TYPE.ONLINE, APPOINTMENT_TYPE.PHYSICAL]),
    };
    if (filter && filter.length > 0) {
      whereClause.appointmentType = In(filter);
    }
    return this.find({
      where: whereClause,
      relations: ['caseSheet'],
      skip: offset,
      take: limit,
      order: {
        appointmentDateTime: 'DESC',
      },
    });
  }

  getDoctorAppointments(doctorId: string, startDate: Date, endDate: Date) {
    //const newStartDate = new Date(format(addDays(startDate, -1), 'yyyy-MM-dd') + '18:30');
    const newStartDate = new Date(format(addDays(startDate, -1), 'yyyy-MM-dd') + 'T18:30');
    const newEndDate = new Date(format(endDate, 'yyyy-MM-dd') + 'T18:30');

    /*return this.find({
      where: {
        doctorId,
        appointmentDateTime: Between(newStartDate, newEndDate),
        status: Not(STATUS.CANCELLED),
      },
      relations: ['caseSheet'],
      order: { appointmentDateTime: 'ASC' },
    });*/

    return this.createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.caseSheet', 'caseSheet')
      .where('(appointment.appointmentDateTime Between :fromDate AND :toDate)', {
        fromDate: newStartDate,
        toDate: newEndDate,
      })
      .andWhere('appointment.doctorId = :doctorId', { doctorId: doctorId })
      .andWhere('appointment.status not in(:status1,:status2)', {
        status1: STATUS.CANCELLED,
        status2: STATUS.PAYMENT_PENDING,
      })
      .orderBy('appointment.appointmentDateTime', 'ASC')
      .getMany();
  }

  getDoctorAppointmentsByDates(doctorId: string, startDate: Date, endDate: Date) {
    //const newStartDate = new Date(format(addDays(startDate, -1), 'yyyy-MM-dd') + '18:30');
    //const newStartDate = new Date(startDate);
    //const newEndDate = new Date(endDate);

    /*return this.find({
      where: {
        doctorId,
        appointmentDateTime: Between(startDate, endDate),
        status: Not(STATUS.CANCELLED),
      },
      order: { appointmentDateTime: 'ASC' },
    });*/

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
      .orderBy('appointment.appointmentDateTime', 'ASC')
      .getMany();
  }

  getDoctorAppointmentHistory(doctorId: string) {
    return this.find({
      where: { doctorId },
      relations: ['caseSheet'],
      order: { appointmentDateTime: 'DESC' },
    });
  }

  getPastAppointments(doctorId: string, patientId: string) {
    /*return this.find({
      where: {
        doctorId,
        patientId,
        appointmentDateTime: LessThan(new Date()),
        status: Not(STATUS.CANCELLED),
      },
      relations: ['caseSheet'],
    });*/

    return this.createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.caseSheet', 'caseSheet')
      .where('appointment.appointmentDateTime < :newDate', {
        newDate: new Date(),
      })
      .andWhere('appointment.patientId = :patientId', { patientId: patientId })
      .andWhere('appointment.doctorId = :doctorId', { doctorId: doctorId })
      .andWhere('appointment.status not in(:status1,:status2)', {
        status1: STATUS.CANCELLED,
        status2: STATUS.PAYMENT_PENDING,
      })
      .getMany();
  }

  async findByDoctorIdsAndDateTimes(
    doctorIds: string[],
    utcAppointmentDateTimes: AppointmentDateTime[]
  ) {
    const queryBuilder = this.createQueryBuilder('appointment')
      .where('appointment.doctorId IN (:...doctorIds)', { doctorIds })
      .andWhere('appointment.status not in(:status1,:status2)', {
        status1: STATUS.CANCELLED,
        status2: STATUS.PAYMENT_PENDING,
      });

    if (utcAppointmentDateTimes && utcAppointmentDateTimes.length > 0) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          utcAppointmentDateTimes.forEach((apptUtcDtTm: AppointmentDateTime) => {
            qb.orWhere(
              new Brackets((qb) => {
                qb.where(
                  `appointment.appointmentDateTime Between '${format(
                    apptUtcDtTm.startDateTime,
                    'yyyy-MM-dd HH:mm'
                  )}' AND '${format(apptUtcDtTm.endDateTime, 'yyyy-MM-dd HH:mm')}'`,
                  apptUtcDtTm
                );
              })
            );
          });
        })
      );
    }

    return queryBuilder.orderBy('appointment.appointmentDateTime', 'DESC').getMany();
  }

  async getDoctorPatientVisitCount(doctorId: string, patientId: string[]) {
    const results = await this.createQueryBuilder('appointment')
      .select('appointment.patientId')
      .addSelect('COUNT(*) AS count')
      .where('appointment.patientId IN (:...patientList)', { patientList: patientId })
      .groupBy('appointment.patientId')
      .getRawMany();
    return results;
  }

  getPatientDateAppointments(appointmentDateTime: Date, patientId: string) {
    const inputDate = format(appointmentDateTime, 'yyyy-MM-dd');
    const endDate = new Date(inputDate + 'T18:29');
    const inputStartDate = format(addDays(appointmentDateTime, -1), 'yyyy-MM-dd');
    const startDate = new Date(inputStartDate + 'T18:30');
    /*return this.find({
      where: {
        patientId,
        appointmentDateTime: Between(startDate, endDate),
        status: Not(STATUS.CANCELLED),
      },
    });*/

    return this.createQueryBuilder('appointment')
      .where('(appointment.appointmentDateTime Between :fromDate AND :toDate)', {
        fromDate: startDate,
        toDate: endDate,
      })
      .andWhere('appointment.patientId = :patientId', { patientId: patientId })
      .andWhere('appointment.status not in(:status1,:status2)', {
        status1: STATUS.CANCELLED,
        status2: STATUS.PAYMENT_PENDING,
      })
      .getMany();
  }

  async getPatinetUpcomingAppointments(patientId: string) {
    const weekPastDate = format(addDays(new Date(), -7), 'yyyy-MM-dd');
    const weekPastDateUTC = new Date(weekPastDate + 'T18:30');

    //get upcoming appointments from current time.
    /*const upcomingAppts = await this.find({
      where: {
        patientId,
        appointmentDateTime: MoreThan(new Date()),
        status: Not(STATUS.CANCELLED),
      },
      order: { appointmentDateTime: 'ASC' },
    });*/

    const upcomingAppts = await this.createQueryBuilder('appointment')
      .where('appointment.appointmentDateTime > :apptDate', { apptDate: new Date() })
      .andWhere('appointment.patientId = :patientId', { patientId: patientId })
      .andWhere('appointment.status not in(:status1,:status2)', {
        status1: STATUS.CANCELLED,
        status2: STATUS.PAYMENT_PENDING,
      })
      .getMany();

    //get past appointments till one week
    /*const weekPastAppts = await this.find({
      where: {
        patientId,
        appointmentDateTime: Between(weekPastDateUTC, new Date()),
        status: Not(STATUS.CANCELLED),
      },
      order: { appointmentDateTime: 'DESC' },
    });*/

    const weekPastAppts = await this.createQueryBuilder('appointment')
      .where('(appointment.appointmentDateTime Between :fromDate AND :toDate)', {
        fromDate: weekPastDateUTC,
        toDate: new Date(),
      })
      .andWhere('appointment.patientId = :patientId', { patientId: patientId })
      .andWhere('appointment.status not in(:status1,:status2)', {
        status1: STATUS.CANCELLED,
        status2: STATUS.PAYMENT_PENDING,
      })
      .getMany();

    const consultRoomAppts = upcomingAppts.concat(weekPastAppts);
    return consultRoomAppts;
  }

  getPatientAndDoctorsAppointments(patientId: string, doctorIds: string[]) {
    return this.createQueryBuilder('appointment')
      .where('appointment.patientId = :patientId', { patientId })
      .andWhere('appointment.doctorId IN (:...doctorIds)', {
        doctorIds,
      })
      .getMany();
  }

  async findNextOpenAppointment(doctorId: string, consultHours: ConsultHours[]) {
    return {
      [ConsultMode.ONLINE]: new Date(),
      [ConsultMode.PHYSICAL]: new Date(),
    };
  }

  getDoctorNextAvailSlot(doctorId: string) {
    const curDate = new Date();
    const curEndDate = new Date(format(new Date(), 'yyyy-MM-dd').toString() + 'T18:29');
    return this.find({
      where: {
        doctorId,
        appointmentDateTime: Between(curDate, curEndDate),
        status: Not(STATUS.CANCELLED),
      },
      order: { appointmentDateTime: 'ASC' },
    }).then((appts) => {
      console.log(appts.length, 'appt length');
      console.log('cur date', new Date());
      if (appts && appts.length > 0) {
        //if there is only one appointment, then add 15 mins to that appt time and return the slot
        if (appts.length === 1) {
          console.log('entered here');
          if (Math.abs(differenceInMinutes(curDate, appts[0].appointmentDateTime)) >= 15) {
            if (curDate < appts[0].appointmentDateTime) {
              return this.getAlignedSlot(curDate);
            } else {
              return this.getAddAlignedSlot(appts[0].appointmentDateTime, 15);
            }
          } else {
            //console.log('came here1111', this.getAddAlignedSlot(appts[0].appointmentDateTime, 15));
            return this.getAddAlignedSlot(appts[0].appointmentDateTime, 15);
          }
        } else {
          //if there are more than 1 appointment, now check the difference between appointments
          // if the difference is more than or eq to 30 then add 15 mins to start appt and return slot
          let firstAppt: Date = appts[0].appointmentDateTime;
          let flag: number = 0;
          let finalSlot = '';
          //console.log(appts, 'appts');
          appts.map((appt) => {
            if (appt.appointmentDateTime != firstAppt && flag === 0) {
              console.log(
                Math.abs(differenceInMinutes(firstAppt, appt.appointmentDateTime)),
                'diff'
              );
              if (
                Math.abs(differenceInMinutes(firstAppt, appt.appointmentDateTime)) >= 30 &&
                Math.abs(differenceInMinutes(new Date(), appt.appointmentDateTime)) >= 15
              ) {
                flag = 1;
                console.log(firstAppt, 'first appt inside');
                console.log('cur time', new Date());
                console.log('inside diff', Math.abs(differenceInMinutes(new Date(), firstAppt)));
                finalSlot = this.getAddAlignedSlot(firstAppt, 15);
                /*if (Math.abs(differenceInMinutes(new Date(), firstAppt)) >= 15) {
                  finalSlot = this.getAlignedSlot(curDate);
                } else {
                  finalSlot = this.getAddAlignedSlot(firstAppt, 15);
                }*/
                console.log(finalSlot, 'final slot');
              }
            }
            firstAppt = appt.appointmentDateTime;
            //console.log(firstAppt, 'in loop');
          });
          //if there is no gap between any appointments
          //then add 15 mins to last appointment and return
          //console.log(flag, 'flag');
          if (flag === 0) {
            //console.log(appts[appts.length - 1].appointmentDateTime, 'last apt');
            if (
              new Date() > appts[0].appointmentDateTime &&
              new Date() < appts[appts.length - 1].appointmentDateTime
            ) {
              finalSlot = this.getAddAlignedSlot(appts[appts.length - 1].appointmentDateTime, 15);
            } else if (
              Math.abs(differenceInMinutes(new Date(), appts[0].appointmentDateTime)) >= 15
            ) {
              finalSlot = this.getAlignedSlot(curDate);
            } else {
              finalSlot = this.getAddAlignedSlot(appts[appts.length - 1].appointmentDateTime, 15);
            }
          }
          return finalSlot;
        }
      } else {
        console.log('np appts');
        //if there are no appointments, then return next nearest time
        return this.getAlignedSlot(curDate);
      }
    });
  }

  async checkWithinConsultHours(
    appointmentDate: Date,
    appointmentType: string,
    doctorId: string,
    doctorsDb: Connection
  ) {
    const givenApptDate = format(appointmentDate, 'yyyy-MM-dd');
    const checkStart = new Date(givenApptDate + 'T18:30');
    const checkEnd = new Date(givenApptDate + 'T23:59');
    let weekDay = format(appointmentDate, 'EEEE').toUpperCase();
    let nextDate = appointmentDate;
    if (appointmentDate >= checkStart && appointmentDate <= checkEnd) {
      nextDate = addDays(appointmentDate, 1);
      weekDay = format(nextDate, 'EEEE').toUpperCase();
    }
    enum CONSULTFLAG {
      OUTOFCONSULTHOURS = 'OUTOFCONSULTHOURS',
      OUTOFBUFFERTIME = 'OUTOFBUFFERTIME',
      INCONSULTHOURS = 'INCONSULTHOURS',
    }
    let consultFlag;
    const consultHoursRepo = doctorsDb.getCustomRepository(DoctorConsultHoursRepository);
    let docConsultHrs: ConsultHours[];
    if (appointmentType == 'ONLINE') {
      docConsultHrs = await consultHoursRepo.getConsultHours(doctorId, weekDay);
    } else {
      docConsultHrs = await consultHoursRepo.getAnyPhysicalConsultHours(doctorId, weekDay);
    }
    if (docConsultHrs && docConsultHrs.length > 0) {
      docConsultHrs.map((docConsultHr) => {
        // if (consultFlag == CONSULTFLAG.OUTOFCONSULTHOURS) {
        //get the slots of the day first
        let st = `${nextDate.toDateString()} ${docConsultHr.startTime.toString()}`;
        const ed = `${nextDate.toDateString()} ${docConsultHr.endTime.toString()}`;
        let consultStartTime = new Date(st);
        const consultEndTime = new Date(ed);
        const appointmentDateInfo = new Date(appointmentDate);
        const currentDate = new Date();
        let previousDate: Date = appointmentDate;
        const currentBuffer = (appointmentDateInfo.getTime() - currentDate.getTime()) / (1000 * 60);
        if (consultEndTime < consultStartTime) {
          previousDate = addDays(previousDate, -1);
          st = `${previousDate.toDateString()} ${docConsultHr.startTime.toString()}`;
          consultStartTime = new Date(st);
        }
        if (currentBuffer < docConsultHr.consultBuffer) {
          consultFlag = CONSULTFLAG.OUTOFBUFFERTIME;
        } else if (appointmentDate >= consultStartTime && appointmentDate < consultEndTime) {
          consultFlag = CONSULTFLAG.INCONSULTHOURS;
        } else {
          consultFlag = CONSULTFLAG.OUTOFCONSULTHOURS;
        }
        // }
      });
    } else {
      consultFlag = CONSULTFLAG.OUTOFCONSULTHOURS;
    }
    return consultFlag;
  }

  async getDoctorNextSlotDate(
    doctorId: string,
    selectedDate: Date,
    doctorsDb: Connection,
    appointmentType: string
  ) {
    const weekDay = format(selectedDate, 'EEEE').toUpperCase();
    //console.log('entered here', selDate, weekDay);
    const consultHoursRepo = doctorsDb.getCustomRepository(DoctorConsultHoursRepository);
    let docConsultHrs: ConsultHours[];
    if (appointmentType == 'ONLINE') {
      docConsultHrs = await consultHoursRepo.getConsultHours(doctorId, weekDay);
    } else {
      docConsultHrs = await consultHoursRepo.getAnyPhysicalConsultHours(doctorId, weekDay);
    }

    let availableSlots: string[] = [];
    let availableSlotsReturn: string[] = [];
    const inputStartDate = format(addDays(selectedDate, -1), 'yyyy-MM-dd');
    const currentStartDate = new Date(inputStartDate + 'T18:30');
    const currentEndDate = new Date(format(selectedDate, 'yyyy-MM-dd').toString() + 'T18:29');
    let consultBuffer = 0;
    /*const doctorAppointments1 = await this.find({
      where: {
        doctorId,
        appointmentDateTime: Between(currentStartDate, currentEndDate),
        status: Not(STATUS.CANCELLED),
      },
      order: { appointmentDateTime: 'ASC' },
    });*/
    const doctorAppointments = await this.createQueryBuilder('appointment')
      .where('(appointment.appointmentDateTime Between :fromDate AND :toDate)', {
        fromDate: currentStartDate,
        toDate: currentEndDate,
      })
      .andWhere('appointment.status not in(:status1,:status2)', {
        status1: STATUS.CANCELLED,
        status2: STATUS.PAYMENT_PENDING,
      })
      .getMany();
    if (docConsultHrs && docConsultHrs.length > 0) {
      docConsultHrs.map((docConsultHr) => {
        //get the slots of the day first
        let st = `${selectedDate.toDateString()} ${docConsultHr.startTime.toString()}`;
        const ed = `${selectedDate.toDateString()} ${docConsultHr.endTime.toString()}`;
        let consultStartTime = new Date(st);
        const consultEndTime = new Date(ed);
        //console.log(consultStartTime, consultEndTime);
        let previousDate: Date = selectedDate;
        if (consultEndTime < consultStartTime) {
          previousDate = addDays(selectedDate, -1);
          st = `${previousDate.toDateString()} ${docConsultHr.startTime.toString()}`;
          consultStartTime = new Date(st);
        }
        const duration = Math.floor(60 / docConsultHr.consultDuration);
        console.log(duration, 'doctor duration');
        consultBuffer = docConsultHr.consultBuffer;

        let slotsCount =
          (Math.abs(differenceInMinutes(consultEndTime, consultStartTime)) / 60) * duration;
        if (slotsCount - Math.floor(slotsCount) == 0.5) {
          slotsCount = Math.ceil(slotsCount);
        } else {
          slotsCount = Math.floor(slotsCount);
        }
        const dayStartTime = consultStartTime.getHours() + ':' + consultStartTime.getMinutes();
        let startTime = new Date(previousDate.toDateString() + ' ' + dayStartTime);
        //console.log(slotsCount, 'slots count');
        //console.log(startTime, 'slot start time');
        availableSlotsReturn = Array(slotsCount)
          .fill(0)
          .map(() => {
            const stTime = startTime;
            startTime = addMinutes(startTime, docConsultHr.consultDuration);
            const stTimeHours = stTime
              .getUTCHours()
              .toString()
              .padStart(2, '0');
            const stTimeMins = stTime
              .getUTCMinutes()
              .toString()
              .padStart(2, '0');
            const startDateStr = format(stTime, 'yyyy-MM-dd');
            const endStr = ':00.000Z';
            const generatedSlot = `${startDateStr}T${stTimeHours}:${stTimeMins}${endStr}`;
            availableSlots.push(generatedSlot);
            return `${startDateStr}T${stTimeHours}:${stTimeMins}${endStr}`;
          });
        const lastSlot = new Date(availableSlots[availableSlots.length - 1]);
        const lastMins = Math.abs(differenceInMinutes(lastSlot, consultEndTime));
        console.log(lastMins, 'last mins', lastSlot);
        if (lastMins < docConsultHr.consultDuration) {
          availableSlots.pop();
        }
        console.log(availableSlotsReturn);
      });
      if (doctorAppointments && doctorAppointments.length > 0) {
        doctorAppointments.map((doctorAppointment) => {
          const apptDt = format(doctorAppointment.appointmentDateTime, 'yyyy-MM-dd');
          const aptSlot = `${apptDt}T${doctorAppointment.appointmentDateTime
            .getUTCHours()
            .toString()
            .padStart(2, '0')}:${doctorAppointment.appointmentDateTime
            .getUTCMinutes()
            .toString()
            .padStart(2, '0')}:00.000Z`;
          if (availableSlots.indexOf(aptSlot) >= 0) {
            availableSlots.splice(availableSlots.indexOf(aptSlot), 1);
          }
        });
      }
      const doctorBblockedSlots = await this.getDoctorBlockedSlots(
        doctorId,
        selectedDate,
        doctorsDb
      );
      if (doctorBblockedSlots.length > 0) {
        availableSlots = availableSlots.filter((val) => !doctorBblockedSlots.includes(val));
      }
      let finalSlot = '';
      let foundFlag = 0;
      availableSlots.map((slot) => {
        const slotDate = new Date(slot);

        const timeWithBuffer = addMinutes(new Date(), consultBuffer);

        if (slotDate >= timeWithBuffer && foundFlag == 0) {
          finalSlot = slot;
          foundFlag = 1;
        }
      });
      //const doctorSlotRepo = getCustomRepository(DoctorNextAvaialbleSlotsRepository);
      //doctorSlotRepo.updateSlot(doctorId, appointmentType, new Date(finalSlot));
      return finalSlot;
    } else {
      return '';
    }
  }

  getAddAlignedSlot(apptDate: Date, mins: number) {
    const nextSlot = addMinutes(apptDate, mins);
    return `${nextSlot
      .getUTCHours()
      .toString()
      .padStart(2, '0')}:${nextSlot
      .getUTCMinutes()
      .toString()
      .padStart(2, '0')}`;
  }

  getAlignedSlot(curDate: Date) {
    let nextHour = curDate.getUTCHours();
    const nextMin = this.getNextMins(curDate.getUTCMinutes());
    if (nextMin === 0) {
      nextHour++;
    }
    return `${nextHour.toString().padStart(2, '0')}:${nextMin.toString().padStart(2, '0')}`;
  }

  getNextMins(min: number) {
    if (min > 0 && min <= 15) return 15;
    else if (min > 15 && min <= 30) return 30;
    else if (min > 30 && min <= 45) return 45;
    else return 0;
  }

  updateAppointmentStatus(id: string, status: STATUS) {
    this.update(id, { status }).catch((createErrors) => {
      throw new AphError(AphErrorMessages.UPDATE_APPOINTMENT_ERROR, undefined, { createErrors });
    });
  }

  confirmAppointment(id: string, status: STATUS, apolloAppointmentId: number) {
    this.update(id, { status, apolloAppointmentId });
  }

  patientLog(
    doctorId: string,
    sortBy: patientLogSort,
    type: patientLogType,
    offset?: number,
    limit?: number
  ) {
    const results = this.createQueryBuilder('appointment')
      .select([
        'appointment.patientId as patientId',
        'max("appointmentDateTime") as appointmentDateTime',
        'ARRAY_AGG("id" order by appointment.appointmentDateTime desc ) as appointmentids',
      ])
      .addSelect('COUNT(*) AS consultsCount')
      .where('appointment.doctorId = :doctorId', { doctorId: doctorId });

    if (type == patientLogType.FOLLOW_UP) {
      results.andWhere('appointment.appointmentDateTime > :tenDays', {
        tenDays: subDays(new Date(), 10),
      });
      results.andWhere('appointment.appointmentDateTime < :beforeNow', { beforeNow: new Date() });
    } else if (type == patientLogType.REGULAR) {
      results.having('count(*) > 2');
    } else {
      results.andWhere('appointment.appointmentDateTime < :beforeNow', { beforeNow: new Date() });
    }

    results.groupBy('appointment.patientId');
    results.offset(offset);
    results.limit(limit);

    if (sortBy == patientLogSort.PATIENT_NAME_A_TO_Z) {
      results.orderBy('min("patientName")', 'ASC');
    } else if (sortBy == patientLogSort.PATIENT_NAME_Z_TO_A) {
      results.orderBy('min("patientName")', 'DESC');
    } else if (sortBy == patientLogSort.NUMBER_OF_CONSULTS) {
      results.orderBy('count(*)', 'DESC');
    } else {
      results.orderBy('max("appointmentDateTime")', 'DESC');
    }

    return results.getRawMany();
  }

  updateTransferState(id: string, appointmentState: APPOINTMENT_STATE) {
    this.update(id, { appointmentState });
  }

  checkDoctorAppointmentByDate(doctorId: string, appointmentDateTime: Date) {
    return this.count({ where: { doctorId, appointmentDateTime } });
  }

  rescheduleAppointment(
    id: string,
    appointmentDateTime: Date,
    rescheduleCount: number,
    appointmentState: APPOINTMENT_STATE
  ) {
    return this.update(id, {
      appointmentDateTime,
      rescheduleCount,
      appointmentState,
      status: STATUS.PENDING,
    });
  }

  updateJdQuestionStatus(id: string, isJdQuestionsComplete: boolean) {
    return this.update(id, {
      isJdQuestionsComplete,
    });
  }

  rescheduleAppointmentByDoctor(
    id: string,
    appointmentDateTime: Date,
    rescheduleCountByDoctor: number,
    appointmentState: APPOINTMENT_STATE
  ) {
    return this.update(id, {
      appointmentDateTime,
      rescheduleCountByDoctor,
      appointmentState,
      status: STATUS.PENDING,
    });
  }

  cancelAppointment(
    id: string,
    cancelledBy: REQUEST_ROLES,
    cancelledById: string,
    cancelReason: string
  ) {
    if (cancelledBy == REQUEST_ROLES.DOCTOR) {
      return this.update(id, {
        status: STATUS.CANCELLED,
        cancelledBy,
        cancelledById,
        doctorCancelReason: cancelReason,
        cancelledDate: new Date(),
      }).catch((cancelError) => {
        throw new AphError(AphErrorMessages.CANCEL_APPOINTMENT_ERROR, undefined, { cancelError });
      });
    } else {
      return this.update(id, {
        status: STATUS.CANCELLED,
        cancelledBy,
        cancelledById,
        patientCancelReason: cancelReason,
        cancelledDate: new Date(),
      }).catch((cancelError) => {
        throw new AphError(AphErrorMessages.CANCEL_APPOINTMENT_ERROR, undefined, { cancelError });
      });
    }
  }

  getAppointmentsByPatientId(patientId: string, startDate: Date, endDate: Date) {
    const newStartDate = new Date(format(addDays(startDate, -1), 'yyyy-MM-dd') + 'T18:30');
    const newEndDate = new Date(format(endDate, 'yyyy-MM-dd') + 'T18:30');
    /*return this.find({
      where: {
        patientId,
        appointmentDateTime: Between(newStartDate, newEndDate),
        status: Not(STATUS.CANCELLED),
      },
      relations: ['caseSheet'],
      order: { appointmentDateTime: 'ASC' },
    });*/

    return this.createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.caseSheet', 'caseSheet')
      .where('(appointment.appointmentDateTime Between :fromDate AND :toDate)', {
        fromDate: newStartDate,
        toDate: newEndDate,
      })
      .andWhere('appointment.patientId = :patientId', { patientId: patientId })
      .andWhere('appointment.status not in(:status1,:status2)', {
        status1: STATUS.CANCELLED,
        status2: STATUS.PAYMENT_PENDING,
      })
      .orderBy('appointment.appointmentDateTime', 'ASC')
      .getMany();
  }

  followUpBookedCount(id: string) {
    return this.count({ where: { followUpParentId: id } });
  }

  async getDoctorBlockedSlots(doctorId: string, availableDate: Date, doctorsDb: Connection) {
    const bciRepo = doctorsDb.getCustomRepository(BlockedCalendarItemRepository);
    const docConsultRepo = doctorsDb.getCustomRepository(DoctorConsultHoursRepository);
    const weekDay = format(availableDate, 'EEEE').toUpperCase();
    const timeSlot = await docConsultRepo.getConsultHours(doctorId, weekDay);
    const blockedSlots = await bciRepo.getBlockedSlots(availableDate, doctorId);
    const doctorBblockedSlots: string[] = [];
    if (timeSlot.length > 0) {
      const duration = Math.floor(60 / timeSlot[0].consultDuration);
      if (blockedSlots.length > 0) {
        blockedSlots.map((blockedSlot) => {
          const startMin = parseInt(format(blockedSlot.start, 'mm'), 0);
          const addMin = Math.abs(
            (startMin % timeSlot[0].consultDuration) - timeSlot[0].consultDuration
          );
          let slot = blockedSlot.start;
          if (addMin != timeSlot[0].consultDuration) {
            slot = addMinutes(blockedSlot.start, addMin);
          }
          console.log(startMin, addMin, slot, 'start min');
          let blockedSlotsCount =
            (Math.abs(differenceInMinutes(blockedSlot.end, blockedSlot.start)) / 60) * duration;
          if (!Number.isInteger(blockedSlotsCount)) {
            blockedSlotsCount = Math.ceil(blockedSlotsCount);
          }
          console.log(
            blockedSlotsCount,
            'blocked count',
            differenceInMinutes(blockedSlot.end, blockedSlot.start)
          );
          Array(blockedSlotsCount)
            .fill(0)
            .map(() => {
              const genBlockSlot =
                format(slot, 'yyyy-MM-dd') + 'T' + format(slot, 'HH:mm') + ':00.000Z';
              doctorBblockedSlots.push(genBlockSlot);
              slot = addMinutes(slot, timeSlot[0].consultDuration);
            });
        });
        console.log(doctorBblockedSlots, 'doctor slots');
      }
    }
    return doctorBblockedSlots;
  }

  getAllAppointments(fromDate: Date, toDate: Date, limit: number) {
    const newStartDate = new Date(format(addDays(fromDate, -1), 'yyyy-MM-dd') + 'T18:30');
    const newEndDate = new Date(format(toDate, 'yyyy-MM-dd') + 'T18:30');
    return this.find({
      where: { bookingDate: Between(newStartDate, newEndDate) },
      order: { bookingDate: 'DESC' },
      take: limit,
      relations: ['caseSheet'],
    });
  }

  getAllAppointmentsWithOutLimit(fromDate: Date, toDate: Date) {
    const newStartDate = new Date(format(addDays(fromDate, -1), 'yyyy-MM-dd') + 'T18:30');
    const newEndDate = new Date(format(toDate, 'yyyy-MM-dd') + 'T18:30');
    /*return this.find({
      where: [
        {
          bookingDate: Between(newStartDate, newEndDate),
          appointmentState: 'NEW',
          status: Not(STATUS.CANCELLED),
        },
      ],
      order: { bookingDate: 'DESC' },
    });*/

    return this.createQueryBuilder('appointment')
      .where('(appointment.bookingDate Between :fromDate AND :toDate)', {
        fromDate: newStartDate,
        toDate: newEndDate,
      })
      .andWhere('appointment.appointmentState = :appointmentState', {
        appointmentState: APPOINTMENT_STATE.NEW,
      })
      .andWhere('appointment.status not in(:status1,:status2)', {
        status1: STATUS.CANCELLED,
        status2: STATUS.PAYMENT_PENDING,
      })
      .getMany();
  }

  async checkPatientConsults(patientId: string, appointmentDateTime: Date) {
    /*const consultCount = await this.count({
      where: { patientId, appointmentDateTime, status: Not(STATUS.CANCELLED) },
    });
    if (consultCount > 0) {
      return true;
    } else {
      return false;
    }*/
    return false;
  }

  getNextMinuteAppointments() {
    const apptDateTime = addMinutes(new Date(), 2);
    const formatDateTime =
      format(apptDateTime, 'yyyy-MM-dd') + 'T' + format(apptDateTime, 'HH:mm') + ':00.000Z';
    return this.find({
      where: { appointmentDateTime: formatDateTime, status: Not(STATUS.CANCELLED) },
      order: { bookingDate: 'ASC' },
    });
  }

  updateConsultStarted(id: string, status: Boolean) {
    return this.update(id, { isConsultStarted: status });
  }
}
