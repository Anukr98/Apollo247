import { EntityRepository, Repository } from 'typeorm';
import { ConsultHours, WeekDay } from 'doctors-service/entities';
import { addDays, addMilliseconds, format } from 'date-fns';

import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

@EntityRepository(ConsultHours)
export class DoctorConsultHoursRepository extends Repository<ConsultHours> {
  getConsultHours(doctor: string, weekDay: string) {
    return this.find({
      where: [{ doctor, weekDay, consultMode: 'ONLINE' }, { doctor, weekDay, consultMode: 'BOTH' }],
    });
  }

  getPhysicalConsultHours(doctor: string, weekDay: string, facility: string) {
    return this.find({
      where: [
        { doctor, weekDay, facility, consultMode: 'BOTH' },
        { doctor, weekDay, facility, consultMode: 'PHYSICAL' },
      ],
    });
  }

  getAnyPhysicalConsultHours(doctor: string, weekDay: string) {
    return this.find({
      where: [
        { doctor, weekDay, consultMode: 'PHYSICAL' },
        { doctor, weekDay, consultMode: 'BOTH' },
      ],
    });
  }

  checkByDoctorAndConsultMode(doctor: string, consultMode: string) {
    return this.count({ where: [{ doctor, consultMode }, { doctor, consultMode: 'BOTH' }] });
  }

  getDayStarAndEndTimesArray(dayAllTimings: string) {
    const delimiter = '\r\n';
    const arrayTimings = dayAllTimings.split(delimiter);
    const startEndTimes = arrayTimings.map((timings) => {
      const timesArray = timings.split('-');
      const istStartTime = timesArray[0].toString().trim();
      const istEndTime = timesArray[0].toString().trim();
      //addMilliseconds(appointment.appointmentDateTime, 19800000);
      const istStartDate = new Date(format(new Date(), 'yyyy-MM-dd') + ' ' + istStartTime + '');
      const utcStartDate = addMilliseconds(istStartDate, -19800000);
      const istEndDate = new Date(format(new Date(), 'yyyy-MM-dd') + ' ' + istEndTime);
      const utcEndDate = addMilliseconds(istEndDate, -19800000);
      console.log(istStartTime, istEndTime);
      console.log(istStartDate, istEndDate);
      console.log(utcStartDate, utcEndDate);
      console.log(
        istStartDate.getUTCHours() + ':' + istStartDate.getUTCMinutes(),
        istEndDate.getUTCHours() + ':' + istEndDate.getUTCMinutes()
      );
      console.log('----------------------------------------');
      return {
        startTime: timesArray[0].toString().trim(),
        endTime: timesArray[1].toString().trim(),
      };
    });
    //console.log(startEndTimes);
  }

  async insertOrUpdateAllConsultHours(availabilityData: any[]) {
    //insert/update new doctors
    availabilityData.forEach((consultHourData) => {
      const weekDays = consultHourData.weekDays.toString();
      const availability = consultHourData.availability.toString();
      this.getDayStarAndEndTimesArray(availability);
      //console.log(weekDays);
    });

    // return this.save(consultHours).catch((saveConsultHoursError) => {
    //   throw new AphError(AphErrorMessages.SAVE_CONSULT_HOURS_ERROR, undefined, {
    //     saveConsultHoursError,
    //   });
    // });
  }
}
