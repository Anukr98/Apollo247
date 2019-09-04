import { EntityRepository, Repository, Between, MoreThan, LessThan, Brackets } from 'typeorm';
import {
  Appointment,
  AppointmentSessions,
  STATUS,
  patientLogSort,
  patientLogType,
  APPOINTMENT_STATE,
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
  startOfMonth,
  endOfMonth,
} from 'date-fns';
import { ConsultHours, ConsultMode } from 'doctors-service/entities';

@EntityRepository(Appointment)
export class AppointmentRepository extends Repository<Appointment> {
  findById(id: string) {
    return this.findOne({ id });
  }

  findByAppointmentId(id: string) {
    return this.find({
      where: { id },
    });
  }

  checkIfAppointmentExist(doctorId: string, appointmentDateTime: Date) {
    return this.count({ where: { doctorId, appointmentDateTime } });
  }

  findByDateDoctorId(doctorId: string, appointmentDate: Date) {
    const inputDate = format(appointmentDate, 'yyyy-MM-dd');
    const endDate = new Date(inputDate + 'T18:29');
    const inputStartDate = format(addDays(appointmentDate, -1), 'yyyy-MM-dd');
    console.log(inputStartDate, 'inputStartDate find by date doctor id');
    const startDate = new Date(inputStartDate + 'T18:30');
    return this.find({
      where: { doctorId, appointmentDateTime: Between(startDate, endDate) },
    });
  }

  saveAppointment(appointmentAttrs: Partial<Appointment>) {
    return this.create(appointmentAttrs)
      .save()
      .catch((createErrors) => {
        throw new AphError(AphErrorMessages.CREATE_APPOINTMENT_ERROR, undefined, { createErrors });
      });
  }

  saveAppointmentSession(appointmentSessionAttrs: Partial<AppointmentSessions>) {
    return AppointmentSessions.create(appointmentSessionAttrs)
      .save()
      .catch((createErrors) => {
        throw new AphError(AphErrorMessages.CREATE_APPOINTMENT_ERROR, undefined, { createErrors });
      });
  }

  getPatientAppointments(doctorId: string, patientId: string) {
    return this.find({ where: { doctorId, patientId, appointmentDateTime: LessThan(new Date()) } });
  }

  getPatientPastAppointments(patientId: string, offset?: number, limit?: number) {
    return this.find({
      where: { patientId, appointmentDateTime: LessThan(new Date()) },
      relations: ['caseSheet'],
      skip: offset,
      take: limit,
      order: {
        appointmentDateTime: 'DESC',
      },
    });
  }

  getDoctorAppointments(doctorId: string, startDate: Date, endDate: Date) {
    return this.find({
      where: { doctorId, appointmentDateTime: Between(startDate, endDate) },
      order: { appointmentDateTime: 'DESC' },
    });
  }

  getDoctorAppointmentHistory(doctorId: string) {
    return this.find({
      where: { doctorId },
      relations: ['caseSheet'],
      order: { appointmentDateTime: 'DESC' },
    });
  }

  getPastAppointments(doctorId: string, patientId: string) {
    return this.find({
      where: { doctorId, patientId, appointmentDateTime: LessThan(new Date()) },
      relations: ['caseSheet'],
    });
  }

  async findByDoctorIdsAndDateTimes(
    doctorIds: string[],
    appointmentDateTimes: AppointmentDateTime[]
  ) {
    const queryBuilder = this.createQueryBuilder('appointment').where(
      'appointment.doctorId IN (:...doctorIds)',
      { doctorIds }
    );

    if (appointmentDateTimes && appointmentDateTimes.length > 0) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          appointmentDateTimes.forEach((apptDateTime: AppointmentDateTime) => {
            qb.orWhere(
              new Brackets((qb) => {
                qb.where(
                  `appointment.appointmentDateTime Between '${format(
                    apptDateTime.startDateTime,
                    'yyyy-MM-dd HH:mm'
                  )}' AND '${format(apptDateTime.endDateTime, 'yyyy-MM-dd HH:mm')}'`,
                  apptDateTime
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
    console.log(inputStartDate, 'inputStartDate get patient date appointments');
    const startDate = new Date(inputStartDate + 'T18:30');
    return this.find({ where: { patientId, appointmentDateTime: Between(startDate, endDate) } });
  }

  getPatinetUpcomingAppointments(patientId: string) {
    const startDate = new Date();
    return this.find({ where: { patientId, appointmentDateTime: MoreThan(startDate) } });
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
      where: { doctorId, appointmentDateTime: Between(curDate, curEndDate) },
      order: { appointmentDateTime: 'ASC' },
    }).then((appts) => {
      if (appts && appts.length > 0) {
        //if there is only one appointment, then add 15 mins to that appt time and return the slot
        if (appts.length === 1) {
          if (Math.abs(differenceInMinutes(curDate, appts[0].appointmentDateTime)) >= 15) {
            if (curDate < appts[0].appointmentDateTime) {
              return this.getAlignedSlot(curDate);
            } else {
              return this.getAddAlignedSlot(appts[0].appointmentDateTime, 15);
            }
          } else {
            return this.getAddAlignedSlot(appts[0].appointmentDateTime, 30);
          }
        } else {
          //if there are more than 1 appointment, now check the difference between appointments
          // if the difference is more than or eq to 30 then add 15 mins to start appt and return slot
          let firstAppt: Date = appts[0].appointmentDateTime;
          let flag: number = 0;
          let finalSlot = '';
          console.log(appts, 'appts');
          appts.map((appt) => {
            if (appt.appointmentDateTime != firstAppt && flag === 0) {
              console.log(
                Math.abs(differenceInMinutes(firstAppt, appt.appointmentDateTime)),
                'diff'
              );
              if (Math.abs(differenceInMinutes(firstAppt, appt.appointmentDateTime)) >= 30) {
                flag = 1;
                console.log(firstAppt, 'first appt inside');
                if (Math.abs(differenceInMinutes(new Date(), firstAppt)) >= 15) {
                  finalSlot = this.getAlignedSlot(curDate);
                } else {
                  finalSlot = this.getAddAlignedSlot(firstAppt, 15);
                }
                console.log(finalSlot, 'final slot');
              }
            }
            firstAppt = appt.appointmentDateTime;
            console.log(firstAppt, 'in loop');
          });
          //if there is no gap between any appointments
          //then add 15 mins to last appointment and return
          console.log(flag, 'flag');
          if (flag === 0) {
            console.log(appts[appts.length - 1].appointmentDateTime, 'last apt');
            if (new Date() < appts[appts.length - 1].appointmentDateTime) {
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
    this.update(id, { status });
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
      results.andWhere('appointment.appointmentDateTime > :monthStartDate', {
        monthStartDate: startOfMonth(new Date()),
      });
      results.andWhere('appointment.appointmentDateTime < :monthendDate', {
        monthendDate: endOfMonth(new Date()),
      });
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
    return this.update(id, { appointmentDateTime, rescheduleCount, appointmentState });
  }
}
