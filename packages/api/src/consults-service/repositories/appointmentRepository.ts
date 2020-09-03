import {
  EntityRepository,
  Repository,
  Between,
  Brackets,
  Not,
  Connection,
  In,
  MoreThanOrEqual,
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
  PATIENT_TYPE,
  AppointmentUpdateHistory,
  PaginateParams,
} from 'consults-service/entities';
import { AppointmentDateTime } from 'doctors-service/resolvers/getDoctorsBySpecialtyAndFilters';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import {
  format,
  addMinutes,
  differenceInMinutes,
  addDays,
  subDays,
  subMinutes,
  addHours,
  differenceInDays,
} from 'date-fns';
import { ConsultHours, ConsultMode, Doctor } from 'doctors-service/entities';
import { DoctorConsultHoursRepository } from 'doctors-service/repositories/doctorConsultHoursRepository';
import { BlockedCalendarItemRepository } from 'doctors-service/repositories/blockedCalendarItemRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
//import { DoctorNextAvaialbleSlotsRepository } from 'consults-service/repositories/DoctorNextAvaialbleSlotsRepository';
import { log } from 'customWinstonLogger';
import { ApiConstants } from 'ApiConstants';
import { getCache, setCache, delCache } from 'consults-service/database/connectRedis';

const REDIS_APPOINTMENT_ID_KEY_PREFIX: string = 'patient:appointment:';

@EntityRepository(Appointment)
export class AppointmentRepository extends Repository<Appointment> {
  async findById(id: string) {
    const cache = await getCache(`${REDIS_APPOINTMENT_ID_KEY_PREFIX}${id}`);
    if (cache && typeof cache === 'string') {
      let cacheAppointment: Appointment = JSON.parse(cache);
      if (cacheAppointment.sdConsultationDate) {
        cacheAppointment.sdConsultationDate = new Date(cacheAppointment.sdConsultationDate);
      }
      if (cacheAppointment.bookingDate) {
        cacheAppointment.bookingDate = new Date(cacheAppointment.bookingDate);
      }
      if (cacheAppointment.appointmentDateTime) {
        cacheAppointment.appointmentDateTime = new Date(cacheAppointment.appointmentDateTime);
      }
      if (cacheAppointment.updatedDate) {
        cacheAppointment.updatedDate = new Date(cacheAppointment.updatedDate);
      }
      if (cacheAppointment.cancelledDate) {
        cacheAppointment.cancelledDate = new Date(cacheAppointment.cancelledDate);
      }
      if (cacheAppointment.paymentInfo && cacheAppointment.paymentInfo.createdDate) {
        cacheAppointment.paymentInfo.createdDate = new Date(
          cacheAppointment.paymentInfo.createdDate
        );
      }
      if (cacheAppointment.paymentInfo && cacheAppointment.paymentInfo.paymentDateTime) {
        cacheAppointment.paymentInfo.paymentDateTime = new Date(
          cacheAppointment.paymentInfo.paymentDateTime
        );
      }
      if (cacheAppointment.paymentInfo && cacheAppointment.paymentInfo.updatedDate) {
        cacheAppointment.paymentInfo.updatedDate = new Date(
          cacheAppointment.paymentInfo.updatedDate
        );
      }
      return this.create(cacheAppointment);
    }
    const appointment = await this.findOne({ id }).catch((getApptError) => {
      throw new AphError(AphErrorMessages.GET_APPOINTMENT_ERROR, undefined, {
        getApptError,
      });
    });

    if (appointment) {
      await setCache(
        `${REDIS_APPOINTMENT_ID_KEY_PREFIX}${id}`,
        JSON.stringify(appointment),
        ApiConstants.CACHE_EXPIRATION_3600
      );
    }

    return appointment;
  }

  getAppointmentsCount(doctorId: string, patientId: string) {
    return this.createQueryBuilder('appointment')
      .andWhere('appointment.patientId = :patientId', { patientId })
      .andWhere('appointment.doctorId = :doctorId', { doctorId })
      .getCount();
  }

  getAppointmentsCompleteCount(doctorId: string, patientId: string) {
    return this.createQueryBuilder('appointment')
      .andWhere('appointment.patientId = :patientId', { patientId })
      .andWhere('appointment.doctorId = :doctorId', { doctorId })
      .andWhere('appointment.status = :status', { status: STATUS.COMPLETED })
      .getCount();
  }

  getPatientAppointmentCountByPatientIds(patientId: string) {
    return this.createQueryBuilder('appointment')
      .andWhere('appointment.patientId = :patientId', { patientId })
      .getCount();
  }

  async getAppointmentsByIds(ids: string[]) {
    const result: Appointment[] = [];

    return this.handleCachingMultipleItems(ids, REDIS_APPOINTMENT_ID_KEY_PREFIX, result);
  }

  async handleCachingMultipleItems(ids: string[], redisKeyPrefix: string, result: Appointment[]) {
    const idsNotInCache: string[] = [];
    for (let i = 0; i < ids.length; i++) {
      const item = await getCache(`${redisKeyPrefix}${ids[i]}`);
      if (item && typeof item == 'string') {
        result.push(JSON.parse(item));
      } else {
        idsNotInCache.push(ids[i]);
      }
    }
    if (idsNotInCache && idsNotInCache.length > 0) {
      const itemFromDb = await this.createQueryBuilder('appointment')
        .where('appointment.id IN (:...idsNotInCache)', { idsNotInCache })
        .getMany();
      for (let i = 0; i < itemFromDb.length; i++) {
        await setCache(
          `${redisKeyPrefix}${itemFromDb[i].id}`,
          JSON.stringify(itemFromDb[i]),
          ApiConstants.CACHE_EXPIRATION_3600
        );
      }
      result = result.concat(itemFromDb);
    }
    return result;
  }

  getAppointmentsByIdsWithSpecificFields(ids: string[], fields: string[]) {
    return this.createQueryBuilder('appointment')
      .select(fields)
      .where('appointment.id IN (:...ids)', { ids })
      .getMany();
  }

  findByAppointmentId(id: string) {
    return this.find({
      where: { id },
      relations: ['appointmentPayments'],
    }).catch((getApptError) => {
      throw new AphError(AphErrorMessages.GET_APPOINTMENT_ERROR, undefined, {
        getApptError,
      });
    });
  }

  findByPaymentOrderId(paymentOrderId: string) {
    return this.findOne({
      where: { paymentOrderId },
    }).catch((getApptError) => {
      throw new AphError(AphErrorMessages.GET_APPOINTMENT_ERROR, undefined, {
        getApptError,
      });
    });
  }

  /**
   * One stop method to create/update appointments
   * This was needed in order to always pass the @BeforeUpdate hook in index.ts
   * and prevent certain status/states to change after they have reached a final status/states
   * Check out the hook in index.ts for more context around the code that does that
   */
  createUpdateAppointment(
    appt: Appointment,
    updateDetails: Partial<Appointment>,
    errorType: AphErrorMessages
  ): Promise<Appointment> {
    const appointment = this.create(appt);
    Object.assign(appointment, { ...updateDetails });
    return appointment.save().catch((appointmentError) => {
      throw new AphError(errorType, undefined, { appointmentError });
    });
  }

  updatePatientType(appt: Appointment, patientType: PATIENT_TYPE) {
    return this.createUpdateAppointment(
      appt,
      {
        id: appt.id,
        patientType,
      },
      AphErrorMessages.UPDATE_APPOINTMENT_ERROR
    );
  }

  getAppointmentsByDocId(doctorId: string) {
    const appointmentData = this.createQueryBuilder('appointment')
      .andWhere('appointment.doctorId = :doctorId', { doctorId: doctorId })
      .andWhere('appointment.status not in(:status1,:status2,:status3,:status4,:status5)', {
        status1: STATUS.CANCELLED,
        status2: STATUS.PAYMENT_PENDING,
        status3: STATUS.PAYMENT_FAILED,
        status4: STATUS.PAYMENT_PENDING_PG,
        status5: STATUS.PAYMENT_ABORTED,
      })
      .orderBy('appointment.patientId', 'ASC')
      .getMany();
    return appointmentData;
  }

  getAppointmentsByDate(appointmentDateTime: Date) {
    return this.find({
      where: {
        appointmentDateTime,
        status: STATUS.PENDING,
        appointmentType: APPOINTMENT_TYPE.ONLINE,
      },
    }).catch((getApptError) => {
      throw new AphError(AphErrorMessages.GET_APPOINTMENT_ERROR, undefined, {
        getApptError,
      });
    });
  }

  getAllAppointmentsWithDate(appointmentDateTime: Date) {
    return this.find({
      where: {
        appointmentDateTime,
        status: STATUS.PENDING,
      },
    }).catch((getApptError) => {
      throw new AphError(AphErrorMessages.GET_APPOINTMENT_ERROR, undefined, {
        getApptError,
      });
    });
  }
  async getAppointmentsByDoctorIds(doctorId: string) {
    const appointmentData = await this.find({
      where: {
        doctorId: doctorId,
      },
    }).catch((getApptError) => {
      throw new AphError(AphErrorMessages.GET_APPOINTMENT_ERROR, undefined, {
        getApptError,
      });
    });
    return appointmentData;
  }
  checkPatientCancelledHistory(patientId: string, doctorId: string) {
    const newStartDate = new Date(format(addDays(new Date(), -9), 'yyyy-MM-dd') + 'T18:30');
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

  findByOrderIdAndStatus(paymentOrderId: string, status: STATUS[]) {
    return this.findOne({
      where: { paymentOrderId, status: In(status) },
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
      .andWhere('appointment.status not in(:status1,:status2,:status3,:status4,:status5)', {
        status1: STATUS.CANCELLED,
        status2: STATUS.PAYMENT_PENDING,
        status3: STATUS.PAYMENT_FAILED,
        status4: STATUS.PAYMENT_PENDING_PG,
        status5: STATUS.PAYMENT_ABORTED,
      })
      .getCount();
  }

  checkIfAppointmentExistWithId(doctorId: string, appointmentDateTime: Date, id: string) {
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
      .andWhere('appointment.id != :id', { id: id })
      .andWhere('appointment.status not in(:status1,:status2,:status3,:status4,:status5)', {
        status1: STATUS.CANCELLED,
        status2: STATUS.PAYMENT_PENDING,
        status3: STATUS.PAYMENT_FAILED,
        status4: STATUS.PAYMENT_PENDING_PG,
        status5: STATUS.PAYMENT_ABORTED,
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
      .andWhere('appointment.status not in(:status1,:status2,:status3,:status4,:status5)', {
        status1: STATUS.CANCELLED,
        status2: STATUS.PAYMENT_PENDING,
        status3: STATUS.PAYMENT_FAILED,
        status4: STATUS.PAYMENT_PENDING_PG,
        status5: STATUS.PAYMENT_ABORTED,
      })
      .getMany();
  }
  async getBookedSlots(doctorIds: string[]) {
    const appointmentDate = new Date();
    const inputStartDate = format(addDays(appointmentDate, -1), 'yyyy-MM-dd');
    console.log(inputStartDate, 'inputStartDate find by date doctor id - calls count');
    //const inputDate = format(appointmentDate, 'yyyy-MM-dd');
    const inputEndDate = format(appointmentDate, 'yyyy-MM-dd');
    console.log(inputStartDate, 'inputStartDate find by date doctor id');
    const fromDate = new Date(inputStartDate + 'T18:30');
    const toDate = new Date(inputEndDate + 'T18:29');
    const appointments = await this.find({
      where: [
        {
          doctorId: In(doctorIds),
          appointmentDateTime: Between(fromDate, toDate),
          status: Not([
            STATUS.PAYMENT_PENDING,
            STATUS.PAYMENT_PENDING_PG,
            STATUS.PAYMENT_FAILED,
            STATUS.PAYMENT_ABORTED,
          ]),
        },
      ],
    });
    return appointments.length;
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

  updateAppointmentPayment(id: string, paymentInputUpdates: Partial<AppointmentPayments>) {
    return AppointmentPayments.update(id, paymentInputUpdates).catch((getErrors) => {
      throw new AphError(AphErrorMessages.UPDATE_APPOINTMENT_PAYMENT_ERROR, undefined, {
        getErrors,
      });
    });
  }

  async updateAppointment(
    id: string,
    appointmentInfo: Partial<Appointment>,
    apptDetails: Appointment
  ) {
    return this.createUpdateAppointment(
      apptDetails,
      {
        id,
        ...appointmentInfo,
      },
      AphErrorMessages.UPDATE_APPOINTMENT_ERROR
    );
  }

  findAppointmentPayment(id: string) {
    return AppointmentPayments.findOne({ where: { appointment: id } }).catch((getErrors) => {
      throw new AphError(AphErrorMessages.GET_APPOINTMENT_PAYMENT_ERROR, undefined, {
        getErrors,
      });
    });
  }

  findAppointmentPaymentById(appointmentId: string) {
    return this.findOne({
      where: { id: appointmentId },
      relations: ['appointmentPayments', 'appointmentRefunds'],
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

  async updateMedmantraStatus(updateAttrs: Partial<Appointment>) {
    return this.save(updateAttrs).catch((error) => {
      throw new AphError(AphErrorMessages.UPDATE_APPOINTMENT_ERROR, undefined, { error });
    });
  }

  getPatientAppointments(doctorId: string, patientIds: string[]) {
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
    //console.log('past appts', inputStartDate);
    /*return this.find({
      where: {
        doctorId,
        patientId: In(patientIds),
        appointmentDateTime: LessThan(inputStartDate),
        status: Not(STATUS.CANCELLED),
      },
      order: { appointmentDateTime: 'DESC' },
    });*/

    return this.createQueryBuilder('appointment')
      .where('(appointment.appointmentDateTime < :fromDate)', {
        fromDate: inputStartDate,
      })
      .andWhere('appointment.patientId IN (:...ids)', { ids: patientIds })
      .andWhere('appointment.doctorId = :doctorId', { doctorId: doctorId })
      .andWhere(
        'appointment.status not in(:status1,:status2,:status3,:status4,:status5,:status6)',
        {
          status1: STATUS.CANCELLED,
          status2: STATUS.PAYMENT_PENDING,
          status3: STATUS.UNAVAILABLE_MEDMANTRA,
          status4: STATUS.PAYMENT_FAILED,
          status5: STATUS.PAYMENT_PENDING_PG,
          status6: STATUS.PAYMENT_ABORTED,
        }
      )
      .orderBy('appointment.appointmentDateTime', 'DESC')
      .getMany();
  }

  getPatientPastAppointments(
    ids: string[],
    filter?: CONSULTS_RX_SEARCH_FILTER[],
    offset?: number,
    limit?: number
  ) {
    const whereClause = {
      patientId: In(ids),
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
        sdConsultationDate: 'DESC',
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
      .andWhere(
        'appointment.status not in(:status1,:status2,:status3,:status4,:status5,:status6)',
        {
          status1: STATUS.CANCELLED,
          status2: STATUS.PAYMENT_PENDING,
          status3: STATUS.UNAVAILABLE_MEDMANTRA,
          status4: STATUS.PAYMENT_FAILED,
          status5: STATUS.PAYMENT_PENDING_PG,
          status6: STATUS.PAYMENT_ABORTED,
        }
      )
      .orderBy('appointment.appointmentDateTime', 'ASC')
      .getMany();
  }

  getTodaysAppointments(startDate: Date) {
    const newStartDate = new Date(format(addDays(startDate, -1), 'yyyy-MM-dd') + 'T18:30');
    const newEndDate = new Date(format(startDate, 'yyyy-MM-dd') + 'T18:30');

    return this.createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.caseSheet', 'caseSheet')
      .where('(appointment.appointmentDateTime Between :fromDate AND :toDate)', {
        fromDate: newStartDate,
        toDate: newEndDate,
      })
      .andWhere(
        'appointment.status not in(:status1,:status2,:status3,:status4,:status5,:status6)',
        {
          status1: STATUS.CANCELLED,
          status2: STATUS.PAYMENT_PENDING,
          status3: STATUS.UNAVAILABLE_MEDMANTRA,
          status4: STATUS.PAYMENT_FAILED,
          status5: STATUS.PAYMENT_PENDING_PG,
          status6: STATUS.PAYMENT_ABORTED,
        }
      )
      .orderBy('appointment.doctorId', 'ASC')
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
      .andWhere(
        'appointment.status not in(:status1,:status2,:status3,:status4,:status5,:status6)',
        {
          status1: STATUS.CANCELLED,
          status2: STATUS.PAYMENT_PENDING,
          status3: STATUS.UNAVAILABLE_MEDMANTRA,
          status4: STATUS.PAYMENT_FAILED,
          status5: STATUS.PAYMENT_PENDING_PG,
          status6: STATUS.PAYMENT_ABORTED,
        }
      )
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

  getPastAppointments(doctorId: string, ids: string[]) {
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
      .andWhere('appointment.patientId IN (:...ids)', { ids })
      .andWhere('appointment.doctorId = :doctorId', { doctorId: doctorId })
      .andWhere(
        'appointment.status not in(:status1,:status2,:status3,:status4,:status5,:status6)',
        {
          status1: STATUS.CANCELLED,
          status2: STATUS.PAYMENT_PENDING,
          status3: STATUS.UNAVAILABLE_MEDMANTRA,
          status4: STATUS.PAYMENT_FAILED,
          status5: STATUS.PAYMENT_PENDING_PG,
          status6: STATUS.PAYMENT_ABORTED,
        }
      )
      .orderBy('appointment.sdConsultationDate', 'DESC')
      .getMany();
  }

  //get patient all appointments
  getPatientAllAppointments(ids: string[], offset?: number, limit?: number) {
    return this.createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.caseSheet', 'caseSheet')
      .leftJoinAndSelect('appointment.appointmentPayments', 'appointmentPayments')
      .andWhere('appointment.patientId IN (:...ids)', { ids })
      .andWhere(
        'appointment.status not in(:status1,:status2,:status3,:status4,:status5,:status6)',
        {
          status1: STATUS.CANCELLED,
          status2: STATUS.PAYMENT_PENDING,
          status3: STATUS.UNAVAILABLE_MEDMANTRA,
          status4: STATUS.PAYMENT_FAILED,
          status5: STATUS.PAYMENT_PENDING_PG,
          status6: STATUS.PAYMENT_ABORTED,
        }
      )
      .offset(offset)
      .limit(limit)
      .orderBy('appointment.appointmentDateTime', 'DESC')
      .getMany();
  }

  async findByDoctorIdsAndDateTimes(
    doctorIds: string[],
    utcAppointmentDateTimes: AppointmentDateTime[]
  ) {
    const queryBuilder = this.createQueryBuilder('appointment')
      .where('appointment.doctorId IN (:...doctorIds)', { doctorIds })
      .andWhere(
        'appointment.status not in(:status1,:status2,:status3,:status4,:status5,:status6)',
        {
          status1: STATUS.CANCELLED,
          status2: STATUS.PAYMENT_PENDING,
          status3: STATUS.UNAVAILABLE_MEDMANTRA,
          status4: STATUS.PAYMENT_FAILED,
          status5: STATUS.PAYMENT_PENDING_PG,
          status6: STATUS.PAYMENT_ABORTED,
        }
      );

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
      .andWhere(
        'appointment.status not in(:status1,:status2,:status3,:status4,:status5,:status6)',
        {
          status1: STATUS.CANCELLED,
          status2: STATUS.PAYMENT_PENDING,
          status3: STATUS.UNAVAILABLE_MEDMANTRA,
          status4: STATUS.PAYMENT_FAILED,
          status5: STATUS.PAYMENT_PENDING_PG,
          status6: STATUS.PAYMENT_ABORTED,
        }
      )
      .getMany();
  }

  async getPatientUpcomingAppointments(ids: string[]) {
    const weekPastDate = format(addDays(new Date(), -7), 'yyyy-MM-dd');
    const weekPastDateUTC = new Date(weekPastDate + 'T18:30');
    return this.createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.appointmentPayments', 'appointmentPayments')
      .where('appointment.appointmentDateTime > :weekPastDateUTC', { weekPastDateUTC })
      .andWhere('appointment.patientId IN (:...ids)', { ids })
      .andWhere(
        'appointment.status not in(:status1,:status2,:status3,:status4,:status5,:status6)',
        {
          status1: STATUS.CANCELLED,
          status2: STATUS.PAYMENT_PENDING,
          status3: STATUS.UNAVAILABLE_MEDMANTRA,
          status4: STATUS.PAYMENT_FAILED,
          status5: STATUS.PAYMENT_PENDING_PG,
          status6: STATUS.PAYMENT_ABORTED,
        }
      )
      .orderBy('appointment.appointmentDateTime', 'ASC')
      .getMany();
  }

  async getPatientUpcomingAppointmentsCount(ids: string[]) {
    const weekPastDate = format(addDays(new Date(), -7), 'yyyy-MM-dd');
    const weekPastDateUTC = new Date(weekPastDate + 'T18:30');
    return this.createQueryBuilder('appointment')
      .where('appointment.appointmentDateTime > :weekPastDateUTC', { weekPastDateUTC })
      .andWhere('appointment.patientId IN (:...ids)', { ids })
      .andWhere(
        'appointment.status not in(:status1,:status2,:status3,:status4,:status5,:status6)',
        {
          status1: STATUS.CANCELLED,
          status2: STATUS.PAYMENT_PENDING,
          status3: STATUS.UNAVAILABLE_MEDMANTRA,
          status4: STATUS.PAYMENT_FAILED,
          status5: STATUS.PAYMENT_PENDING_PG,
          status6: STATUS.PAYMENT_ABORTED,
        }
      )
      .getCount();
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

  async checkWithinConsultHours(
    appointmentDate: Date,
    appointmentType: string,
    doctorId: string,
    doctorsDb: Connection,
    hospitalId: string
  ) {
    const checkActStart = `${appointmentDate.toDateString()} 18:30:00`;
    const checkActEnd = `${appointmentDate.toDateString()} 23:59:00`;
    let actualDate = new Date(appointmentDate.toDateString());
    if (appointmentDate >= new Date(checkActStart) && appointmentDate <= new Date(checkActEnd)) {
      actualDate = addDays(actualDate, 1);
    }

    const consultHourRep = doctorsDb.getCustomRepository(DoctorConsultHoursRepository);
    let previousDate: Date = appointmentDate;
    let prevDaySlots = 0;
    previousDate = addDays(actualDate, -1);
    const checkStart = `${previousDate.toDateString()} 18:30:00`;
    let weekDay = format(previousDate, 'EEEE').toUpperCase();

    //let timeSlots = await consultHourRep.getConsultHours(doctorId, weekDay);
    let timeSlots: ConsultHours[];
    if (appointmentType == APPOINTMENT_TYPE.ONLINE) {
      timeSlots = await consultHourRep.getConsultHours(doctorId, weekDay);
    } else {
      timeSlots = await consultHourRep.getPhysicalConsultHours(doctorId, weekDay, hospitalId);
    }
    weekDay = format(actualDate, 'EEEE').toUpperCase();
    //const timeSlotsNext = await consultHourRep.getConsultHours(doctorId, weekDay);
    let timeSlotsNext;
    if (appointmentType == APPOINTMENT_TYPE.ONLINE) {
      timeSlotsNext = await consultHourRep.getConsultHours(doctorId, weekDay);
    } else {
      timeSlotsNext = await consultHourRep.getPhysicalConsultHours(doctorId, weekDay, hospitalId);
    }
    if (timeSlots.length > 0) {
      prevDaySlots = 1;
    }
    timeSlots = timeSlots.concat(timeSlotsNext);
    const checkEnd = `${actualDate.toDateString()} 18:30:00`;

    enum CONSULTFLAG {
      OUTOFCONSULTHOURS = 'OUTOFCONSULTHOURS',
      OUTOFBUFFERTIME = 'OUTOFBUFFERTIME',
      INCONSULTHOURS = 'INCONSULTHOURS',
    }
    const availableSlots: string[] = [];
    console.log(timeSlots, 'time slots');
    let rowCount = 0;
    let consultFlag = CONSULTFLAG.OUTOFCONSULTHOURS;
    if (timeSlots && timeSlots.length > 0) {
      timeSlots.map((timeSlot) => {
        let st = `${appointmentDate.toDateString()} ${timeSlot.startTime.toString()}`;
        const ed = `${appointmentDate.toDateString()} ${timeSlot.endTime.toString()}`;
        let consultStartTime = new Date(st);
        let consultEndTime = new Date(ed);

        if (consultEndTime < consultStartTime) {
          st = `${previousDate.toDateString()} ${timeSlot.startTime.toString()}`;
          consultStartTime = new Date(st);
        }
        const duration = parseFloat((60 / timeSlot.consultDuration).toFixed(1));
        //console.log(duration, 'doctor duration');
        if (timeSlot.weekDay != timeSlot.actualDay) {
          consultEndTime = addMinutes(consultEndTime, 1);
        }
        let slotsCount =
          (Math.abs(differenceInMinutes(consultEndTime, consultStartTime)) / 60) * duration;
        if (slotsCount - Math.floor(slotsCount) == 0.5) {
          slotsCount = Math.ceil(slotsCount);
        } else {
          slotsCount = Math.floor(slotsCount);
        }
        const stTime = consultStartTime.getHours() + ':' + consultStartTime.getMinutes();
        let startTime = new Date(previousDate.toDateString() + ' ' + stTime);
        if (prevDaySlots == 0) {
          startTime = new Date(addDays(previousDate, 1).toDateString() + ' ' + stTime);
        }
        if (rowCount > 0) {
          const nextDate = addDays(previousDate, 1);
          const ed = `${nextDate.toDateString()} ${timeSlot.startTime.toString()}`;
          const td = `${nextDate.toDateString()} 00:00:00`;
          if (new Date(ed) >= new Date(td) && timeSlot.weekDay != timeSlots[rowCount - 1].weekDay) {
            previousDate = addDays(previousDate, 1);
            startTime = new Date(previousDate.toDateString() + ' ' + stTime);
          }
        }
        Array(slotsCount)
          .fill(0)
          .map(() => {
            const stTime = startTime;
            startTime = addMinutes(startTime, timeSlot.consultDuration);
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
            const timeWithBuffer = addMinutes(new Date(), timeSlot.consultBuffer);
            if (new Date(generatedSlot) > timeWithBuffer) {
              if (
                new Date(generatedSlot) >= new Date(checkStart) &&
                new Date(generatedSlot) < new Date(checkEnd)
              ) {
                if (!availableSlots.includes(generatedSlot)) {
                  availableSlots.push(generatedSlot);
                }
              }
            }
            return `${startDateStr}T${stTimeHours}:${stTimeMins}${endStr}`;
          });
        const lastSlot = new Date(availableSlots[availableSlots.length - 1]);
        const lastMins = Math.abs(differenceInMinutes(lastSlot, consultEndTime));
        if (lastMins < timeSlot.consultDuration) {
          availableSlots.pop();
        }
        rowCount++;
      });
      const sl = `${format(appointmentDate, 'yyyy-MM-dd')}T${appointmentDate
        .getUTCHours()
        .toString()
        .padStart(2, '0')}:${appointmentDate
        .getUTCMinutes()
        .toString()
        .padStart(2, '0')}:00.000Z`;
      console.log(availableSlots, 'availableSlots final list');
      console.log(availableSlots.indexOf(sl), 'indexof');
      console.log(checkStart, checkEnd, 'check start end');
      if (availableSlots.indexOf(sl) >= 0) {
        consultFlag = CONSULTFLAG.INCONSULTHOURS;
      }
      return consultFlag;
    } else {
      return CONSULTFLAG.OUTOFCONSULTHOURS;
    }
  }

  async getDoctorNextSlotDate(
    doctorId: string,
    selectedDate: Date,
    doctorsDb: Connection,
    appointmentType: string,
    inputDate: Date
  ) {
    let previousDate: Date = selectedDate;
    let prevDaySlots = 0;
    previousDate = addDays(selectedDate, -1);
    const checkStart = `${previousDate.toDateString()} 18:30:00`;
    const checkEnd = `${selectedDate.toDateString()} 18:30:00`;
    let weekDay = format(previousDate, 'EEEE').toUpperCase();
    const consultHoursRepo = doctorsDb.getCustomRepository(DoctorConsultHoursRepository);
    let docConsultHrs: ConsultHours[];
    if (appointmentType == 'ONLINE') {
      docConsultHrs = await consultHoursRepo.getConsultHours(doctorId, weekDay);
    } else {
      docConsultHrs = await consultHoursRepo.getAnyPhysicalConsultHours(doctorId, weekDay);
    }
    weekDay = format(selectedDate, 'EEEE').toUpperCase();
    let timeSlotsNext;
    if (appointmentType == 'ONLINE') {
      timeSlotsNext = await consultHoursRepo.getConsultHours(doctorId, weekDay);
    } else {
      timeSlotsNext = await consultHoursRepo.getAnyPhysicalConsultHours(doctorId, weekDay);
    }
    if (docConsultHrs.length > 0) {
      prevDaySlots = 1;
    }
    docConsultHrs = docConsultHrs.concat(timeSlotsNext);

    let availableSlots: string[] = [];
    let availableSlotsReturn: string[] = [];
    const inputStartDate = format(addDays(selectedDate, -1), 'yyyy-MM-dd');
    const currentStartDate = new Date(inputStartDate + 'T18:30');
    const currentEndDate = new Date(format(selectedDate, 'yyyy-MM-dd').toString() + 'T18:29');
    //let consultBuffer = 0;

    const doctorAppointments = await this.createQueryBuilder('appointment')
      .where('(appointment.appointmentDateTime Between :fromDate AND :toDate)', {
        fromDate: currentStartDate,
        toDate: currentEndDate,
      })
      .andWhere('appointment.status not in(:status1,:status2,:status3,:status4,:status5)', {
        status1: STATUS.CANCELLED,
        status2: STATUS.PAYMENT_PENDING,
        status3: STATUS.PAYMENT_FAILED,
        status4: STATUS.PAYMENT_PENDING_PG,
        status5: STATUS.PAYMENT_ABORTED,
      })
      .andWhere('appointment."doctorId" = :doctorId', { doctorId })
      .getMany();

    //calculating doctor consult hours slot intervals
    if (docConsultHrs && docConsultHrs.length > 0) {
      let rowCount = 0;
      docConsultHrs.map((docConsultHr) => {
        //get the slots of the day first
        let st = `${selectedDate.toDateString()} ${docConsultHr.startTime.toString()}`;
        const ed = `${selectedDate.toDateString()} ${docConsultHr.endTime.toString()}`;
        let consultStartTime = new Date(st);
        let consultEndTime = new Date(ed);
        if (consultEndTime < consultStartTime) {
          st = `${previousDate.toDateString()} ${docConsultHr.startTime.toString()}`;
          consultStartTime = new Date(st);
        }
        //console.log(consultStartTime, consultEndTime);
        const duration = parseFloat((60 / docConsultHr.consultDuration).toFixed(1));
        //const consultBuffer = docConsultHr.consultBuffer;
        if (docConsultHr.weekDay != docConsultHr.actualDay) {
          consultEndTime = addMinutes(consultEndTime, 1);
        }
        let slotsCount =
          (Math.abs(differenceInMinutes(consultEndTime, consultStartTime)) / 60) * duration;
        if (slotsCount - Math.floor(slotsCount) == 0.5) {
          slotsCount = Math.ceil(slotsCount);
        } else {
          slotsCount = Math.floor(slotsCount);
        }

        const stTime = consultStartTime.getHours() + ':' + consultStartTime.getMinutes();
        let startTime = new Date(previousDate.toDateString() + ' ' + stTime);
        if (prevDaySlots == 0) {
          startTime = new Date(addDays(previousDate, 1).toDateString() + ' ' + stTime);
        }
        if (rowCount > 0) {
          const nextDate = addDays(previousDate, 1);
          const ed = `${nextDate.toDateString()} ${docConsultHr.startTime.toString()}`;
          const td = `${nextDate.toDateString()} 00:00:00`;
          if (
            new Date(ed) >= new Date(td) &&
            docConsultHr.weekDay != docConsultHrs[rowCount - 1].weekDay
          ) {
            previousDate = addDays(previousDate, 1);
            startTime = new Date(previousDate.toDateString() + ' ' + stTime);
          }
        }
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
            const timeWithBuffer = addMinutes(new Date(), docConsultHr.consultBuffer);
            if (new Date(generatedSlot) > timeWithBuffer) {
              if (
                new Date(generatedSlot) >= new Date(checkStart) &&
                new Date(generatedSlot) < new Date(checkEnd)
              ) {
                if (!availableSlots.includes(generatedSlot)) {
                  availableSlots.push(generatedSlot);
                }
              }
            }
            return `${startDateStr}T${stTimeHours}:${stTimeMins}${endStr}`;
          });
        const lastSlot = new Date(availableSlots[availableSlots.length - 1]);
        const lastMins = Math.abs(differenceInMinutes(lastSlot, consultEndTime));
        console.log(lastMins, 'last mins', lastSlot);
        if (lastMins < docConsultHr.consultDuration) {
          availableSlots.pop();
        }
        console.log(availableSlotsReturn, 'availableSlotsReturn');
        rowCount++;
      });

      //removing appt booked slots
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
      if (availableSlots.length > 0) {
        //get doctor blocked slots
        const doctorBblockedSlots = await this.getDoctorBlockedSlots(
          doctorId,
          selectedDate,
          doctorsDb,
          availableSlots
        );
        //console.log(doctorBblockedSlots, 'doctorBblockedSlots');
        //removing blocked slots
        if (doctorBblockedSlots.length > 0) {
          availableSlots = availableSlots.filter((val) => !doctorBblockedSlots.includes(val));
        }
      }
      let finalSlot = '';
      console.log(availableSlots, 'slots final list');
      if (availableSlots.length > 0) {
        finalSlot = availableSlots[0];
      }
      return finalSlot; //returning doctors next available time
    } else {
      return '';
    }
  }

  getNextMins(min: number) {
    if (min > 0 && min <= 15) return 15;
    else if (min > 15 && min <= 30) return 30;
    else if (min > 30 && min <= 45) return 45;
    else return 0;
  }

  async updateAppointmentStatus(
    id: string,
    status: STATUS,
    isSeniorConsultStarted: boolean,
    apptDetails: Appointment
  ) {
    return this.createUpdateAppointment(
      apptDetails,
      {
        id,
        status,
        isSeniorConsultStarted,
      },
      AphErrorMessages.UPDATE_APPOINTMENT_ERROR
    );
  }

  updateSDAppointmentStatus(
    id: string,
    status: STATUS,
    isSeniorConsultStarted: boolean,
    sdConsultationDate: Date,
    apptDetails: Appointment
  ) {
    return this.createUpdateAppointment(
      apptDetails,
      {
        id,
        status,
        isSeniorConsultStarted,
        sdConsultationDate,
      },
      AphErrorMessages.UPDATE_APPOINTMENT_ERROR
    );
  }

  patientLog(
    doctorId: string,
    sortBy: patientLogSort,
    type: patientLogType,
    patientName: string,
    offset?: number,
    limit?: number
  ) {
    const results = this.createQueryBuilder('appointment')
      .select([
        'appointment.patientId as patientId',
        'max("sdConsultationDate") as appointmentDateTime',
        'ARRAY_AGG("id" order by appointment.sdConsultationDate desc ) as appointmentids',
      ])
      .addSelect('COUNT(*) AS consultsCount')
      .where('appointment.doctorId = :doctorId', { doctorId: doctorId })
      .andWhere('appointment.status = :status', { status: STATUS.COMPLETED });

    if (type == patientLogType.FOLLOW_UP) {
      results.andWhere('appointment.sdConsultationDate > :tenDays', {
        tenDays: subDays(new Date(), 10),
      });
      results.andWhere('appointment.sdConsultationDate < :beforeNow', { beforeNow: new Date() });
    } else if (type == patientLogType.REGULAR) {
      results.having('count(*) > 2');
    } else {
      results.andWhere('appointment.sdConsultationDate < :beforeNow', { beforeNow: new Date() });
    }

    if (patientName && patientName.length > 0) {
      results.andWhere('appointment.patientName ilike :patientName', {
        patientName: '%' + patientName + '%',
      });
    }

    results.groupBy('appointment.patientId');
    results.offset(offset);
    results.limit(limit);

    if (sortBy == patientLogSort.PATIENT_NAME_A_TO_Z) {
      results.orderBy('min(Lower("patientName"))', 'ASC');
    } else if (sortBy == patientLogSort.PATIENT_NAME_Z_TO_A) {
      results.orderBy('min(Lower("patientName"))', 'DESC');
    } else if (sortBy == patientLogSort.NUMBER_OF_CONSULTS) {
      results.orderBy('count(*)', 'DESC');
    } else {
      results.orderBy('max("sdConsultationDate")', 'DESC');
    }

    return results.getRawMany();
  }

  updateTransferState(id: string, appointmentState: APPOINTMENT_STATE, apptDetails: Appointment) {
    return this.createUpdateAppointment(
      apptDetails,
      {
        id,
        appointmentState,
        isSeniorConsultStarted: false,
      },
      AphErrorMessages.UPDATE_APPOINTMENT_ERROR
    );
  }

  checkDoctorAppointmentByDate(doctorId: string, appointmentDateTime: Date) {
    return this.count({ where: { doctorId, appointmentDateTime } });
  }

  rescheduleAppointment(
    id: string,
    appointmentDateTime: Date,
    rescheduleCount: number,
    appointmentState: APPOINTMENT_STATE,
    apptDetails: Appointment
  ) {
    return this.createUpdateAppointment(
      apptDetails,
      {
        id,
        appointmentDateTime,
        rescheduleCount,
        appointmentState,
        status: STATUS.PENDING,
      },
      AphErrorMessages.RESCHEDULE_APPOINTMENT_ERROR
    );
  }

  async updateJdQuestionStatusbyIds(ids: string[]) {
    for (let i = 0; i < ids.length; i++) {
      await delCache(`${REDIS_APPOINTMENT_ID_KEY_PREFIX}${ids[i]}`);
    }
    return this.update([...ids], {
      isJdQuestionsComplete: true,
      isConsultStarted: true,
    }).catch((getApptError) => {
      throw new AphError(AphErrorMessages.UPDATE_APPOINTMENT_ERROR, undefined, {
        getApptError,
      });
    });
  }

  rescheduleAppointmentByDoctor(
    id: string,
    appointmentDateTime: Date,
    rescheduleCountByDoctor: number,
    appointmentState: APPOINTMENT_STATE,
    apptDetails: Appointment
  ) {
    return this.createUpdateAppointment(
      apptDetails,
      {
        id,
        appointmentDateTime,
        rescheduleCountByDoctor,
        appointmentState,
        status: STATUS.PENDING,
      },
      AphErrorMessages.RESCHEDULE_APPOINTMENT_ERROR
    );
  }

  cancelAppointment(
    id: string,
    cancelledBy: REQUEST_ROLES,
    cancelledById: string,
    cancelReason: string,
    apptDetails: Appointment
  ) {
    const apptUpdatePartial: Partial<Appointment> = {
      id,
      status: STATUS.CANCELLED,
      cancelledBy,
      cancelledById,
      cancelledDate: new Date(),
    };

    if (cancelledBy == REQUEST_ROLES.DOCTOR) {
      apptUpdatePartial['doctorCancelReason'] = cancelReason;
    } else {
      apptUpdatePartial['patientCancelReason'] = cancelReason;
    }

    return this.createUpdateAppointment(
      apptDetails,
      apptUpdatePartial,
      AphErrorMessages.CANCEL_APPOINTMENT_ERROR
    );
  }

  systemCancelAppointment(
    id: string,
    appointmentInfo: Partial<Appointment>,
    apptDetails: Appointment
  ) {
    return this.createUpdateAppointment(
      apptDetails,
      {
        id,
        cancelledBy: REQUEST_ROLES.SYSTEM,
        cancelledDate: new Date(),
        status: STATUS.CANCELLED,
        ...appointmentInfo,
      },
      AphErrorMessages.CANCEL_APPOINTMENT_ERROR
    );
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
      .andWhere(
        'appointment.status not in(:status1,:status2,:status3,:status4,:status5,:status6)',
        {
          status1: STATUS.CANCELLED,
          status2: STATUS.PAYMENT_PENDING,
          status3: STATUS.UNAVAILABLE_MEDMANTRA,
          status4: STATUS.PAYMENT_FAILED,
          status5: STATUS.PAYMENT_PENDING_PG,
          status6: STATUS.PAYMENT_ABORTED,
        }
      )
      .orderBy('appointment.appointmentDateTime', 'ASC')
      .getMany();
  }

  getAllAppointmentsByPatientId(
    ids: string[],
    paginate: PaginateParams
  ): [Promise<Appointment[]>, Promise<number | null>] {
    /**
     * to support ui for web as well as mobile
     * as web using asc and mobile will use desc (who sends paignation params)
     * wll remove this once web also use pagination
     */
    const order: { bookingDate: 'ASC' | 'DESC' } = { bookingDate: 'ASC' };

    if (paginate.skip || paginate.take) {
      order.bookingDate = 'DESC';
    }
    // return [data, counts]<promises>;
    return [
      this.createQueryBuilder('appointment')
        .innerJoinAndSelect('appointment.appointmentPayments', 'appointmentPayments')
        .leftJoinAndSelect('appointment.appointmentRefunds', 'appointmentRefunds')
        .where('appointment.patientId IN (:...ids)', { ids })
        .andWhere('appointment.discountedAmount not in(:discountedAmount)', { discountedAmount: 0 })
        .andWhere('appointment.status not in(:status1)', {
          status1: STATUS.PAYMENT_ABORTED,
        })
        .orderBy('appointment.bookingDate', order.bookingDate)
        //send undefined to skip & take fns to skip pagination to support optional pagination
        .skip(paginate.skip)
        .take(paginate.take)
        .getMany(),
      //do pagiantion if needed...
      Number.isInteger(paginate.take || paginate.skip)
        ? this.createQueryBuilder('appointment')
            .innerJoinAndSelect('appointment.appointmentPayments', 'appointmentPayments')
            .where('appointment.patientId IN (:...ids)', { ids })
            .andWhere('appointment.discountedAmount not in(:discountedAmount)', {
              discountedAmount: 0,
            })
            .andWhere('appointment.status not in(:status1)', {
              status1: STATUS.PAYMENT_ABORTED,
            })
            .getCount()
        : Promise.resolve(null),
    ];
    /**
     * keeping below snippet to validate above query
     * once verified can be removed...
     */
    // return this.createQueryBuilder('appointment')
    //   .innerJoinAndSelect('appointment.appointmentPayments', 'appointmentPayments')
    //   .leftJoinAndSelect('appointment.appointmentRefunds', 'appointmentRefunds')
    //   .where('appointment.patientId IN (:...ids)', { ids })
    //   .andWhere('appointment.discountedAmount not in(:discountedAmount)', { discountedAmount: 0 })
    //   .andWhere('appointment.status not in(:status1)', {
    //     status1: STATUS.PAYMENT_ABORTED,
    //   })
    //   .orderBy('appointment.bookingDate', 'ASC')
    //   .getMany();
  }

  followUpBookedCount(id: string) {
    return this.count({ where: { followUpParentId: id } });
  }

  async getDoctorBlockedSlots(
    doctorId: string,
    availableDate: Date,
    doctorsDb: Connection,
    availableSlots: string[]
  ) {
    const bciRepo = doctorsDb.getCustomRepository(BlockedCalendarItemRepository);
    const docConsultRepo = doctorsDb.getCustomRepository(DoctorConsultHoursRepository);
    const previousDate = addDays(availableDate, -1);
    const prevDay = format(previousDate, 'EEEE').toUpperCase();
    const weekDay = format(availableDate, 'EEEE').toUpperCase();
    let timeSlot = await docConsultRepo.getConsultHours(doctorId, weekDay);
    const prevDayTimeSlot = await docConsultRepo.getConsultHours(doctorId, prevDay);
    timeSlot = timeSlot.concat(prevDayTimeSlot);
    const blockedSlots = await bciRepo.getBlockedSlots(availableDate, doctorId);
    const doctorBblockedSlots: string[] = [];
    console.log(blockedSlots, 'blocked slots');
    if (timeSlot.length > 0) {
      //const duration = Math.floor(60 / timeSlot[0].consultDuration);
      const duration = parseFloat((60 / timeSlot[0].consultDuration).toFixed(1));
      // const consultStartTime = new Date(
      //   format(new Date(), 'yyyy-MM-dd') + ' ' + timeSlot[0].startTime.toString()
      // );

      if (blockedSlots.length > 0) {
        blockedSlots.map((blockedSlot) => {
          let firstSlot = true;

          let apptDt = format(blockedSlot.start, 'yyyy-MM-dd');
          let sl = `${apptDt}T${blockedSlot.start
            .getUTCHours()
            .toString()
            .padStart(2, '0')}:${blockedSlot.start
            .getUTCMinutes()
            .toString()
            .padStart(2, '0')}:00.000Z`;

          let blockedSlotsCount =
            (Math.abs(differenceInMinutes(blockedSlot.end, blockedSlot.start)) / 60) * duration;
          if (!Number.isInteger(blockedSlotsCount)) {
            blockedSlotsCount = Math.ceil(blockedSlotsCount);
          }

          //const startMin = parseInt(format(blockedSlot.start, 'mm'), 0);
          //const consultStartMin = parseInt(format(consultStartTime, 'mm'), 0);

          //let addMin = Math.abs(
          //(startMin % timeSlot[0].consultDuration) - timeSlot[0].consultDuration
          //);

          //if (startMin % timeSlot[0].consultDuration != 0 && timeSlot[0].consultDuration % 2 == 0) {
          //addMin = addMin + 1;
          //}

          let slot = blockedSlot.start;
          // if (addMin != timeSlot[0].consultDuration) {
          //   slot = addMinutes(blockedSlot.start, addMin);
          // }

          // if (
          //   consultStartMin % timeSlot[0].consultDuration ==
          //   startMin % timeSlot[0].consultDuration
          // ) {
          //   slot = blockedSlot.start;
          // }
          const blockedSlotsDuration = differenceInMinutes(blockedSlot.end, blockedSlot.start);
          console.log(slot, 'before start min');
          let counter = 0;
          while (true) {
            if (availableSlots.includes(sl)) {
              //console.log(counter, sl, 'came here 3333');
              break;
            }
            slot = addMinutes(slot, 1);
            counter++;
            // if (counter >= blockedSlotsDuration) {
            //   console.log(counter, sl, 'came here 111');
            //   break;
            // }
            if (
              counter >= availableSlots.length &&
              counter >= timeSlot[0].consultDuration &&
              counter >= blockedSlotsCount &&
              counter >= blockedSlotsDuration
            ) {
              //console.log(counter, sl, 'came here 111');
              break;
            }
            apptDt = format(slot, 'yyyy-MM-dd');
            sl = `${apptDt}T${slot
              .getUTCHours()
              .toString()
              .padStart(2, '0')}:${slot
              .getUTCMinutes()
              .toString()
              .padStart(2, '0')}:00.000Z`;
          }
          console.log('start slot', slot);

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
              if (new Date(genBlockSlot) < blockedSlot.end) {
                doctorBblockedSlots.push(genBlockSlot);
              }
              if (firstSlot) {
                firstSlot = false;
                const prevSlot = subMinutes(slot, timeSlot[0].consultDuration); //addMinutes(slot, -5);
                if (
                  Math.abs(differenceInMinutes(prevSlot, blockedSlot.start)) <
                  timeSlot[0].consultDuration
                ) {
                  const genBlockSlot =
                    format(prevSlot, 'yyyy-MM-dd') + 'T' + format(prevSlot, 'HH:mm') + ':00.000Z';
                  doctorBblockedSlots.push(genBlockSlot);
                }
              }
              slot = addMinutes(slot, timeSlot[0].consultDuration);
            });
          // if (new Date(doctorBblockedSlots[blockedSlotsCount - 1]) >= blockedSlot.end) {
          //   doctorBblockedSlots[blockedSlotsCount - 1] = '';
          // }
        });
        //console.log(doctorBblockedSlots, 'doctor slots');
      }
    }
    return doctorBblockedSlots;
  }

  async checkIfDayBlocked(doctorId: string, selectedDate: Date, doctorsDb: Connection) {
    //if start time is b/w or end time is b/w - then return 1
    //if start and end time both are b/w - then return -1
    const bciRepo = doctorsDb.getCustomRepository(BlockedCalendarItemRepository);
    const blockedSlots = await bciRepo.getBlockedSlots(selectedDate, doctorId);
    const newStartDate = new Date(format(addDays(selectedDate, -1), 'yyyy-MM-dd') + 'T18:30');
    const newEndDate = new Date(format(selectedDate, 'yyyy-MM-dd') + 'T18:30');
    //return multiple days(1),no. of days(days),wholeday blocked(1)
    if (blockedSlots.length > 0) {
      let blockedType = 0,
        multipleDays = 0;
      blockedSlots.forEach((slot) => {
        const daysDiff = differenceInDays(slot.end, slot.start);
        if (daysDiff >= 1) {
          multipleDays = daysDiff;
        }
        if (slot.start <= newStartDate && slot.end >= newEndDate) {
          //whole day blocked
          blockedType = 1;
        } else {
          blockedType = -1;
        }
      });
      return [multipleDays, blockedType];
    } else {
      return [-2, 0];
    }
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

  getAllAppointmentsByDates(fromDate: Date, toDate: Date) {
    const newStartDate = new Date(format(addDays(fromDate, -1), 'yyyy-MM-dd') + 'T18:30');
    const newEndDate = new Date(format(toDate, 'yyyy-MM-dd') + 'T18:30');
    return this.createQueryBuilder('appointment')
      .where('(appointment.bookingDate Between :fromDate AND :toDate)', {
        fromDate: newStartDate,
        toDate: newEndDate,
      })
      .getMany();
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
      .andWhere(
        'appointment.status not in(:status1,:status2,:status3,:status4,:status5,:status6)',
        {
          status1: STATUS.CANCELLED,
          status2: STATUS.PAYMENT_PENDING,
          status3: STATUS.UNAVAILABLE_MEDMANTRA,
          status4: STATUS.PAYMENT_FAILED,
          status5: STATUS.PAYMENT_PENDING_PG,
          status6: STATUS.PAYMENT_ABORTED,
        }
      )
      .getMany();
  }

  getAllCompletedAppointments(appointmentDate: Date) {
    const startDate = new Date(format(addDays(appointmentDate, -1), 'yyyy-MM-dd') + 'T18:30');
    const endDate = new Date(format(appointmentDate, 'yyyy-MM-dd') + 'T18:29');
    return this.find({
      where: {
        appointmentDateTime: Between(startDate, endDate),
        status: STATUS.COMPLETED,
      },
    });
  }

  getAllCompletedAppointmentsByConsultTime(appointmentDate: Date) {
    const startDate = new Date(format(addDays(appointmentDate, -1), 'yyyy-MM-dd') + 'T18:30');
    const endDate = new Date(format(appointmentDate, 'yyyy-MM-dd') + 'T18:29');
    return this.find({
      select: ['id', 'sdConsultationDate'],
      where: {
        sdConsultationDate: Between(startDate, endDate),
        status: STATUS.COMPLETED,
      },
    });
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

  getSpecificMinuteAppointments(nextMin: number, appointmentType: APPOINTMENT_TYPE) {
    const apptDateTime = addMinutes(new Date(), nextMin);
    const formatDateTime =
      format(apptDateTime, 'yyyy-MM-dd') + 'T' + format(apptDateTime, 'HH:mm') + ':00.000Z';
    return this.createQueryBuilder('appointment')
      .where('(appointment.appointmentDateTime = :fromDate)', {
        fromDate: formatDateTime,
      })
      .andWhere('appointment.appointmentType = :appointmentType', {
        appointmentType: appointmentType,
      })
      .andWhere('appointment.status in(:status1)', {
        status1: STATUS.PENDING,
      })
      .andWhere('appointment.appointmentState != :state', {
        state: APPOINTMENT_STATE.AWAITING_RESCHEDULE,
      })
      .getMany();
  }

  getSpecificMinuteBothAppointments(nextMin: number) {
    const apptDateTime = addMinutes(new Date(), nextMin);
    const formatDateTime =
      format(apptDateTime, 'yyyy-MM-dd') + 'T' + format(apptDateTime, 'HH:mm') + ':00.000Z';
    return this.createQueryBuilder('appointment')
      .where('(appointment.appointmentDateTime = :fromDate)', {
        fromDate: formatDateTime,
      })
      .andWhere('appointment.status in(:status1)', {
        status1: STATUS.PENDING,
      })
      .andWhere('appointment.appointmentState != :state', {
        state: APPOINTMENT_STATE.AWAITING_RESCHEDULE,
      })
      .getMany();
  }
  /*return this.find({
      where: { appointmentDateTime: formatDateTime, status: Not(STATUS.CANCELLED) },
      order: { bookingDate: 'ASC' },
    });*/

  updateConsultStarted(id: string, status: Boolean, apptDetails: Appointment) {
    return this.createUpdateAppointment(
      apptDetails,
      {
        id,
        isConsultStarted: status,
      },
      AphErrorMessages.CANCEL_APPOINTMENT_ERROR
    );
  }

  getCompletedAppointments(doctorId: string, fromDate: Date, toDate: Date, statusNumber: Number) {
    const inProgress = 'IN_PROGRESS';
    const completed = 'COMPLETED';
    const cancelled = 'CANCELLED';
    let criteria = inProgress;
    if (statusNumber === 0) criteria = completed;
    if (statusNumber === 1) criteria = cancelled;
    return this.count({
      where: {
        doctorId,
        appointmentDateTime: Between(fromDate, toDate),
        status: criteria,
      },
    });
  }
  getAppointmentsInNextHour(doctorId: string) {
    const curreDateTime = new Date();
    const apptDateTime = addHours(new Date(), 1);
    const currentTime =
      format(curreDateTime, 'yyyy-MM-dd') + 'T' + format(curreDateTime, 'HH:mm') + ':00.000Z';
    const formatDateTime =
      format(apptDateTime, 'yyyy-MM-dd') + 'T' + format(apptDateTime, 'HH:mm') + ':00.000Z';
    return this.count({
      where: {
        doctorId,
        appointmentDateTime: Between(currentTime, formatDateTime),
        status: Not(STATUS.CANCELLED),
      },
    });
  }
  getDoctorAway(doctorId: string, fromDate: Date, toDate: Date) {
    return this.count({
      where: {
        doctorId,
        appointmentDateTime: Between(fromDate, toDate),
      },
    });
  }

  async bookMedMantraAppointment(
    apptDetails: Appointment,
    doctorDetails: Doctor,
    patientsDb: Connection,
    doctorsDb: Connection
  ) {
    const patientRepo = patientsDb.getCustomRepository(PatientRepository);
    const patientDetails = await patientRepo.getPatientDetails(apptDetails.patientId);

    if (!patientDetails) throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});

    //invalid date handling
    let dateOfBirth = patientDetails.dateOfBirth;
    if (patientDetails.dateOfBirth === null || !patientDetails) {
      dateOfBirth = new Date('1990-01-01');
    }

    //calculating appt end time
    const apptEndTime = await this.getAppointmentEndTime(apptDetails, doctorsDb);

    const medMantraBookApptUrl = process.env.MEDMANTRA_BOOK_APPOINTMENT_API || '';
    const medMantraBookApptInput = {
      FirstName: patientDetails.firstName,
      LastName: patientDetails.lastName,
      Gender: ApiConstants.MEDMANTRA_GENDER,
      RegionID: ApiConstants.MEDMANTRA_REGIONID,
      ResourceID: doctorDetails.externalId,
      UHIDNumber: patientDetails.uhid,
      MobileNumber: '91-' + patientDetails.mobileNumber.substr(3),
      Title: ApiConstants.MEDMANTRA_TITLE,
      StartDateTime: format(apptDetails.appointmentDateTime, 'dd-MMM-yyyy HH:mm:ss'),
      EndDateTime: format(apptEndTime, 'dd-MMM-yyyy HH:mm:ss'),
      ServiceID: ApiConstants.MEDMANTRA_SERVICEID,
      RegistrationType: ApiConstants.MEDMANTRA_REGISTRATION_TYPE,
      SpecialityID: doctorDetails.specialty.externalId,
      StatusCheck: ApiConstants.MEDMANTRA_STATUSCHECK,
      DateOfBirth: format(dateOfBirth, 'dd-MMM-yyyy'),
      MaritalStatus: ApiConstants.MEDMANTRA_MARITALSTATUS,
      LocationID: ApiConstants.MEDMANTRA_LOCATIONID,
      UpdatedBy: ApiConstants.MEDMANTRA_UPDATEDBY,
      Flag: ApiConstants.MEDMANTRA_FLAG,
      OnlineAppointmentID: '',
      OnlineReceiptNO: '',
      TranAmount: apptDetails.bookingDate, // Change it to price
      PayeeName: patientDetails.firstName,
      TranDateTime: format(new Date(), 'dd-MMM-yyyy'),
      ModeofAppointment: ApiConstants.MEDMANTRA_APPOINTMENT_MODE,
      PayType: ApiConstants.MEDMANTRA_PAYTYPE,
    };

    log(
      'consultServiceLogger',
      `EXTERNAL_API_CALL_PRISM: ${medMantraBookApptUrl}`,
      'bookMedMantraAppointment()->API_CALL_STARTING',
      JSON.stringify(medMantraBookApptInput),
      ''
    );

    console.log('process.env.UHID_CREATE_AUTH_KEY ==>', process.env.UHID_CREATE_AUTH_KEY);

    const bookApptResp = await fetch(medMantraBookApptUrl, {
      method: 'POST',
      body: JSON.stringify(medMantraBookApptInput),
      headers: {
        'Content-Type': 'application/json',
        Authkey: process.env.UHID_CREATE_AUTH_KEY ? process.env.UHID_CREATE_AUTH_KEY : '',
      },
    })
      .then((res) => {
        console.log('API_response==>', res);
        log(
          'consultServiceLogger',
          'API_CALL_RESPONSE',
          'bookMedMantraAppointment()->API_CALL_RESPONSE',
          JSON.stringify(res),
          ''
        );
        return res.text();
      })
      .catch((error) => {
        console.log('bookingError:', error);
        log(
          'consultServiceLogger',
          'API_CALL_ERROR',
          'bookMedMantraAppointment()->CATCH_BLOCK',
          '',
          JSON.stringify(error)
        );
        throw new AphError(AphErrorMessages.APPOINTMENT_EXTERNAL_ERROR);
      });

    log(
      'consultServiceLogger',
      'API_CALL_RESPONSE',
      'bookMedMantraAppointment()->API_CALL_RESPONSE',
      bookApptResp,
      ''
    );
    console.log('medMantraBookApptResp:', bookApptResp);
    const parsedResponse = JSON.parse(bookApptResp);
    return parsedResponse;
  }

  async cancelMedMantraAppointment(apptDetails: Appointment, cancelReason: string) {
    const medMantraCancelApptUrl = process.env.MEDMANTRA_CANCEL_APPOINTMENT_API || '';
    const medMantraCancelApptInput = {
      RegionID: ApiConstants.MEDMANTRA_REGIONID,
      LocationID: ApiConstants.MEDMANTRA_LOCATIONID,
      AppointmentID: apptDetails.apolloAppointmentId,
      UpdatedBy: ApiConstants.MEDMANTRA_APPOINTMENT_MODE,
      ReasonforCancellation: cancelReason,
    };

    log(
      'consultServiceLogger',
      `EXTERNAL_API_CALL_PRISM: ${medMantraCancelApptUrl}`,
      'cancelMedMantraAppointment()->API_CALL_STARTING',
      JSON.stringify(medMantraCancelApptInput),
      ''
    );

    console.log('process.env.UHID_CREATE_AUTH_KEY ==>', process.env.UHID_CREATE_AUTH_KEY);

    const cancelApptResp = await fetch(medMantraCancelApptUrl, {
      method: 'POST',
      body: JSON.stringify(medMantraCancelApptInput),
      headers: {
        'Content-Type': 'application/json',
        Authkey: process.env.UHID_CREATE_AUTH_KEY ? process.env.UHID_CREATE_AUTH_KEY : '',
      },
    })
      .then((res) => res.json())
      .catch((error) => {
        log(
          'consultServiceLogger',
          'API_CALL_ERROR',
          'cancelMedMantraAppointment()->CATCH_BLOCK',
          '',
          JSON.stringify(error)
        );
        throw new AphError(AphErrorMessages.APPOINTMENT_EXTERNAL_ERROR);
      });

    log(
      'consultServiceLogger',
      'API_CALL_RESPONSE',
      'cancelMedMantraAppointment()->API_CALL_RESPONSE',
      JSON.stringify(cancelApptResp),
      ''
    );
    console.log('MedMantraCancelApptResponse:', cancelApptResp);

    const status = cancelApptResp.retcode == '0' ? true : false;

    return { status, message: cancelApptResp.result };
  }

  async getAppointmentEndTime(apptDetails: Appointment, doctorsDb: Connection) {
    const apptStartDateTime = apptDetails.appointmentDateTime;
    const apptType = apptDetails.appointmentType;
    const doctorId = apptDetails.doctorId;
    const weekDay = format(apptStartDateTime, 'EEEE').toUpperCase();
    const consultHoursRepo = doctorsDb.getCustomRepository(DoctorConsultHoursRepository);
    let docConsultHrs: ConsultHours[];
    if (apptType == 'ONLINE') {
      docConsultHrs = await consultHoursRepo.getConsultHours(doctorId, weekDay);
    } else {
      docConsultHrs = await consultHoursRepo.getAnyPhysicalConsultHours(doctorId, weekDay);
    }

    let endTime = addMinutes(new Date(apptStartDateTime), 15);
    if (docConsultHrs) {
      const duration = docConsultHrs[0].consultDuration;
      endTime = addMinutes(new Date(apptStartDateTime), duration);
    }
    return endTime;
  }

  getPatientFutureAppointmentsCount(patientId: string) {
    return this.createQueryBuilder('appointment')
      .where('appointment.appointmentDateTime > :apptDate', {
        apptDate: new Date(),
      })
      .andWhere('appointment.patientId = :patientId', { patientId: patientId })
      .andWhere(
        'appointment.status not in(:status1,:status2,:status3,:status4,:status5,:status6,:status7)',
        {
          status1: STATUS.CANCELLED,
          status2: STATUS.PAYMENT_PENDING,
          status3: STATUS.UNAVAILABLE_MEDMANTRA,
          status4: STATUS.COMPLETED,
          status5: STATUS.PAYMENT_FAILED,
          status6: STATUS.PAYMENT_PENDING_PG,
          status7: STATUS.PAYMENT_ABORTED,
        }
      )
      .orderBy('appointment.appointmentDateTime', 'ASC')
      .getCount();
  }

  getPatientAppointmentCountByConsultMode(patientId: string[], appointmenType: APPOINTMENT_TYPE) {
    return this.createQueryBuilder('appointment')
      .andWhere('appointment.patientId in(:...patientId)', { patientId: patientId })
      .andWhere('appointment.appointmentType = :appointmenType', { appointmenType })
      .andWhere('appointment.status not in(:status1)', {
        status1: STATUS.PAYMENT_PENDING,
      })
      .getCount();
  }

  getPatientAppointmentCountByCouponCode(patientId: string[], couponCode: string) {
    return this.createQueryBuilder('appointment')
      .andWhere('appointment.patientId in(:...patientId)', { patientId: patientId })
      .andWhere('appointment.couponCode = :couponCode', { couponCode })
      .andWhere('appointment.status not in(:status1)', {
        status1: STATUS.PAYMENT_PENDING,
      })
      .getCount();
  }

  checkIfAppointmentBooked(doctorId: string, patientId: string, appointmentDateTime: Date) {
    return this.createQueryBuilder('appointment')
      .andWhere('appointment.patientId = :patientId', { patientId })
      .andWhere('appointment.doctorId = :doctorId', { doctorId })
      .andWhere('appointment.appointmentDateTime >= :appointmentDateTime', { appointmentDateTime })
      .andWhere('appointment.status not in(:status1,:status2,:status3,:status4,:status5)', {
        status1: STATUS.PAYMENT_PENDING,
        status2: STATUS.CANCELLED,
        status3: STATUS.PAYMENT_FAILED,
        status4: STATUS.PAYMENT_ABORTED,
        status5: STATUS.PAYMENT_PENDING_PG,
      })
      .getCount();
  }

  getNotStartedAppointments() {
    const apptDateTime = new Date(format(addMinutes(new Date(), -5), 'yyyy-MM-dd HH:mm') + ':00');
    return this.createQueryBuilder('appointment')
      .where('appointment.status = :status', { status: STATUS.PENDING })
      .andWhere('appointment.appointmentDateTime = :apptDateTime', {
        apptDateTime,
      })
      .getMany();
  }

  getAppointmentCountByCouponCode(couponCode: string) {
    return this.createQueryBuilder('appointment')
      .andWhere('appointment.couponCode = :couponCode', { couponCode })
      .andWhere('appointment.status not in(:status1)', {
        status1: STATUS.PAYMENT_PENDING,
      })
      .getCount();
  }

  getAllDoctorAppointments(doctorId: string, apptDate: Date) {
    //const newStartDate = new Date(format(addDays(fromDate, -1), 'yyyy-MM-dd') + 'T18:30');
    //const newEndDate = new Date(format(toDate, 'yyyy-MM-dd') + 'T18:30');
    if (doctorId == '0') {
      return this.find({
        where: { bookingDate: MoreThanOrEqual(new Date()), status: Not(STATUS.PAYMENT_PENDING) },
        order: { bookingDate: 'DESC' },
      });
    } else {
      return this.find({
        where: {
          doctorId,
          bookingDate: MoreThanOrEqual(new Date()),
          status: Not(STATUS.PAYMENT_PENDING),
        },
        order: { bookingDate: 'DESC' },
      });
    }
  }

  saveAppointmentHistory(historyAttrs: Partial<AppointmentUpdateHistory>) {
    historyAttrs.updatedAt = new Date();
    return AppointmentUpdateHistory.create(historyAttrs).save();
  }

  async getAppointmenIdsFromPatientID(patientId: string) {
    return this.find({
      select: ['id'],
      where: {
        patientId,
      },
    }).catch((getApptError) => {
      throw new AphError(AphErrorMessages.GET_APPOINTMENT_ERROR, undefined, {
        getApptError,
      });
    });
  }
}
