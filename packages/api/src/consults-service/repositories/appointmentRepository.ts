import { EntityRepository, Repository, Between } from 'typeorm';
import { Appointment, AppointmentSessions } from 'consults-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { format, addMinutes } from 'date-fns';
import { ConsultHours, ConsultMode } from 'doctors-service/entities';
import { parseFromTimeZone, convertToTimeZone, convertToLocalTime } from 'date-fns-timezone';

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

  findByDateDoctorId(doctorId: string, appointmentDate: Date) {
    return this.find({
      where: { doctorId, appointmentDate },
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
    return this.find({ where: { doctorId, patientId } });
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

  async findNextOpenAppointment(doctorId: string, consultHours: ConsultHours[]) {
    return {
      [ConsultMode.ONLINE]: new Date(),
      [ConsultMode.PHYSICAL]: new Date(),
    };
  }

  getDoctorNextAvailSlot(doctorId: string) {
    /*const curDate = parseFromTimeZone(new Date().toDateString(), { timeZone: 'Asia/Kolkata' });
    console.log(curDate, 'curDate');
    const curEndDate = parseFromTimeZone(format(new Date(), 'yyyy-MM-dd').toString() + 'T23:59', {
      timeZone: 'Asia/Kolkata',
    });*/
    console.log(
      new Date().toDateString(),
      'todate string',
      format(new Date(), 'yyyy-MM-dd hh:mm').toString()
    );
    //const format1 = 'YYYY-mm-dd HH:mm';
    /*const curDate1 = parseFromTimeZone(format(new Date(), 'yyyy-MM-dd hh:mm').toString(), format1, {
      timeZone: 'Asia/Kolkata',
    });
    console.log(curDate1, 'curDate11');*/

    const curDate2 = convertToTimeZone(new Date().toDateString(), {
      timeZone: 'Asia/Kolkata',
    });
    console.log(curDate2, 'curDate122');
    const curDate = new Date();

    console.log(curDate, 'curDate');
    const curEndDate = new Date(format(new Date(), 'yyyy-MM-dd').toString() + 'T23:59');
    //console.log(curEndDate, 'curEndDate');
    return this.find({
      where: { doctorId, appointmentDateTime: Between(curDate, curEndDate) },
      order: { appointmentDateTime: 'ASC' },
    }).then((appts) => {
      console.log(appts);
      if (appts && appts.length > 0) {
        //if there is only one appointment, then add 15 mins to that appt time and return the slot
        if (appts.length === 1) {
          const nextSlot = addMinutes(appts[0].appointmentDateTime, 15);
          console.log(nextSlot, 'nextslot');
          return `${nextSlot.getHours()}:${nextSlot.getMinutes()}`;
        } else {
          //if there are more than 1 appointment, now check the difference between appointments
          // if the difference is more than or eq to 30 then add 15 mins to start appt and return slot
          appts.map((appt) => {});
        }
      } else {
        //if there are no appointments, then return next nearest time
        let nextHour = curDate.getHours();
        console.log(nextHour, 'next hour');
        const nextMin = this.getNextMins(curDate.getMinutes());
        console.log(nextMin, 'next mins');
        if (nextMin === 0) {
          nextHour++;
        }
        return `${nextHour}:${nextMin}`;
      }
    });
  }

  getNextMins(min: number) {
    if (min > 0 && min <= 15) return 15;
    else if (min > 15 && min <= 30) return 30;
    else if (min > 30 && min <= 45) return 45;
    else if (min > 45) return 0;
  }
}
