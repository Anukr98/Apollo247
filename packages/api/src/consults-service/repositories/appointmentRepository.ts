import { EntityRepository, Repository, Between } from 'typeorm';
import { Appointment } from 'consults-service/entities/appointment';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/AphErrorMessages';
import { differenceInMinutes } from 'date-fns';
import { format } from 'date-fns';

@EntityRepository(Appointment)
export class AppointmentRepository extends Repository<Appointment> {
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

  getPatientAppointments(doctorId: string, patientId: string) {
    return this.find({ where: { doctorId, patientId } });
  }

  getDoctorAppointments(doctorId: string, startDate: Date, endDate: Date) {
    return this.find({
      where: { doctorId, appointmentDateTime: Between(startDate, endDate) },
    });
  }

  getDoctorNextAvailability(doctorId: string) {
    const curDate = new Date();
    const curEndDate = new Date(format(new Date(), 'yyyy-MM-dd').toString() + 'T11:59');
    return this.find({
      where: { doctorId, appointmentDateTime: Between(curDate, curEndDate) },
      order: { appointmentDateTime: 'ASC' },
    }).then((resp) => {
      let prev = 0;
      let done = 0;
      if (resp) {
        resp.map((appt) => {
          if (done == 0) {
            const diffMins = differenceInMinutes(appt.appointmentDateTime, curDate);
            if (prev > 0) {
              if (diffMins - prev >= 30) {
                done = 1;
              } else {
                prev = diffMins;
              }
            } else {
              prev = diffMins;
              if (diffMins >= 30) {
                prev = 0;
                done = 1;
              }
            }
          }
        });
      }
      prev += 15;
      return prev;
    });
  }
}
