import { EntityRepository, Repository, Between, In } from 'typeorm';
import { Appointment } from 'consults-service/entities/appointment';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { differenceInMinutes, addMinutes, addHours, getMinutes, getHours } from 'date-fns';
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
      order: { appointmentDateTime: 'DESC' },
    });
  }

  getPatientDateAppointments(appointmentDateTime: Date, patientId: string) {
    const inputDate = format(appointmentDateTime, 'yyyy-MM-dd');
    const startDate = new Date(inputDate + 'T00:00');
    const endDate = new Date(inputDate + 'T23:59');
    return this.find({ where: { patientId, appointmentDateTime: Between(startDate, endDate) } });
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

  getNextPossibleSlots(currDateTime: Date) {
    const currentMinutes = getMinutes(currDateTime);
    let nextMins = Math.ceil(currentMinutes / 15) * 15;
    const nextHour = nextMins === 60 ? getHours(addHours(currDateTime, 1)) : getHours(currDateTime);
    nextMins = nextMins === 60 ? 0 : nextMins;
    const startTime = `${nextHour.toString()}:${nextMins.toString()}`;

    let startDateTime = new Date(`${format(currDateTime, 'yyyy-MM-dd').toString()} ${startTime}`);

    const possibleSlots = Array(4)
      .fill(0)
      .map(() => {
        const tempTime = startDateTime;
        startDateTime = addMinutes(startDateTime, 15);
        const stTimeHours = tempTime
          .getHours()
          .toString()
          .padStart(2, '0');
        const stTimeMins = tempTime
          .getMinutes()
          .toString()
          .padStart(2, '0');
        return `${stTimeHours}:${stTimeMins}`;
      });

    return possibleSlots;
  }

  findDoctorsNextAvailability(doctorIds: string[]) {
    const curDate = new Date();
    const curEndDate = addMinutes(curDate, 60);

    const possibleTimeSlots = this.getNextPossibleSlots(curDate);

    const availabiltyData = doctorIds.map((doctorId) => {
      return {
        doctorId,
        availabileInMinutes: { online: 60, physical: 60 },
        possibleSlots: possibleTimeSlots,
      };
    });

    return this.find({
      where: {
        doctorId: doctorIds.length ? In(doctorIds) : '',
        appointmentDateTime: Between(curDate, curEndDate),
      },
    }).then((appointments) => {
      if (appointments) {
        appointments.map((appt) => {
          const aptTime = format(new Date(appt.appointmentDateTime), 'HH:mm').toString();
          const index = availabiltyData.findIndex((avail) => {
            return avail.doctorId === appt.doctorId;
          });
          if (index >= 0) {
            const isSlotBooked = availabiltyData[index].possibleSlots.indexOf(aptTime);
            if (isSlotBooked >= 0) {
              availabiltyData[index].possibleSlots.splice(isSlotBooked, 1);
            }
          }
        });
      }

      availabiltyData.map((avail) => {
        const availDateTime = new Date(
          `${format(curDate, 'yyyy-MM-dd').toString()} ${avail.possibleSlots[0]}`
        );
        const availInMins = differenceInMinutes(availDateTime, curDate);
        avail.availabileInMinutes.online = availInMins;
        avail.availabileInMinutes.physical = availInMins;
      });

      return availabiltyData;
    });
  }
}
