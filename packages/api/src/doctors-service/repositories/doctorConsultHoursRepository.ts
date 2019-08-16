import { EntityRepository, Repository } from 'typeorm';
import { ConsultHours } from 'doctors-service/entities';

@EntityRepository(ConsultHours)
export class DoctorConsultHoursRepository extends Repository<ConsultHours> {
  getConsultHours(doctor: string, weekDay: string) {
    return this.find({ where: { doctor, weekDay } });
  }
}
