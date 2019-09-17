import { EntityRepository, Repository } from 'typeorm';
import { ConsultHours, WeekDay } from 'doctors-service/entities';
import { addMilliseconds, format } from 'date-fns';

import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

type DayTimes = {
  startTime: string;
  endTime: string;
};

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

  getDayStarAndEndTimesArray(dayAllTimings: string): DayTimes[] {
    const delimiter = '\r\n';
    const arrayTimings = dayAllTimings.split(delimiter);
    const startEndTimes = arrayTimings.map((timings) => {
      const timesArray = timings.split('-');
      const istStartTime = timesArray[0].toString().trim();
      const istEndTime = timesArray[1].toString().trim();
      const istStartDate = new Date(format(new Date(), 'yyyy-MM-dd') + ' ' + istStartTime);
      const istEndDate = new Date(format(new Date(), 'yyyy-MM-dd') + ' ' + istEndTime);
      const utcStartDate = addMilliseconds(istStartDate, -19800000);
      const utcEndDate = addMilliseconds(istEndDate, -19800000);
      const utcStartTime = format(utcStartDate, 'HH:mm');
      const utcEndTime = format(utcEndDate, 'HH:mm');
      return {
        startTime: utcStartTime,
        endTime: utcEndTime,
      };
    });
    return startEndTimes;
  }

  async insertOrUpdateAllConsultHours(availabilityData: any[]) {
    const consultHours: Partial<ConsultHours>[] = [];
    availabilityData.forEach((consultHourData) => {
      const weekDays = consultHourData.weekDays.toString();
      const arrWeekDays = weekDays.split(',');
      const availability = consultHourData.availability.toString();
      const arrDayTimes = this.getDayStarAndEndTimesArray(availability);

      arrWeekDays.forEach((weekDay: WeekDay) => {
        arrDayTimes.forEach((dayTimes: DayTimes) => {
          const dayConsultHour: Partial<ConsultHours> = {
            weekDay: weekDay,
            startTime: dayTimes.startTime,
            endTime: dayTimes.endTime,
            ...consultHourData,
          };
          consultHours.push(dayConsultHour);
        });
      });
    });

    return this.save(consultHours).catch((saveConsultHoursError) => {
      throw new AphError(AphErrorMessages.SAVE_CONSULT_HOURS_ERROR, undefined, {
        saveConsultHoursError,
      });
    });
  }
}
