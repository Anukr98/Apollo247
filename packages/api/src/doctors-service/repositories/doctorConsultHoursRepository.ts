import { EntityRepository, Repository } from 'typeorm';
import { ConsultHours } from 'doctors-service/entities';

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
}
