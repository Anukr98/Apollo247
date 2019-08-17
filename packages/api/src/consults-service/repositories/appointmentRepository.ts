import { EntityRepository, Repository, Between, MoreThan, LessThan } from 'typeorm';
import { Appointment, AppointmentSessions } from 'consults-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { format, addMinutes, differenceInMinutes } from 'date-fns';
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
    const startDate = new Date(inputDate + 'T00:00');
    const endDate = new Date(inputDate + 'T23:59');
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

  getDoctorAppointments(doctorId: string, startDate: Date, endDate: Date) {
    return this.find({
      where: { doctorId, appointmentDateTime: Between(startDate, endDate) },
      order: { appointmentDateTime: 'DESC' },
    });
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
    const startDate = new Date(inputDate + 'T00:00');
    const endDate = new Date(inputDate + 'T23:59');
    return this.find({ where: { patientId, appointmentDateTime: Between(startDate, endDate) } });
  }

  getPatinetUpcomingAppointments(patientId: string) {
    const startDate = new Date();
    return this.find({ where: { patientId, appointmentDateTime: MoreThan(startDate) } });
  }

  async findNextOpenAppointment(doctorId: string, consultHours: ConsultHours[]) {
    return {
      [ConsultMode.ONLINE]: new Date(),
      [ConsultMode.PHYSICAL]: new Date(),
    };
  }

  getDoctorNextAvailSlot(doctorId: string) {
    const curDate = new Date();
    const curEndDate = new Date(format(new Date(), 'yyyy-MM-dd').toString() + 'T23:59');
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
          appts.map((appt) => {
            if (appt.appointmentDateTime != firstAppt) {
              if (differenceInMinutes(firstAppt, appt.appointmentDateTime) >= 30) {
                flag = 1;
                return this.getAddAlignedSlot(firstAppt, 15);
              }
              firstAppt = appt.appointmentDateTime;
            }
          });
          //if there is no gap between any appointments
          //then add 15 mins to last appointment and return
          if (flag === 0) {
            return this.getAddAlignedSlot(appts[appts.length - 1].appointmentDateTime, 15);
          }
        }
      } else {
        //if there are no appointments, then return next nearest time
        return this.getAlignedSlot(curDate);
      }
    });
  }

  getAddAlignedSlot(apptDate: Date, mins: number) {
    const nextSlot = addMinutes(apptDate, mins);
    return `${nextSlot
      .getHours()
      .toString()
      .padStart(2, '0')}:${nextSlot
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;
  }

  getAlignedSlot(curDate: Date) {
    let nextHour = curDate.getHours();
    const nextMin = this.getNextMins(curDate.getMinutes());
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
}
