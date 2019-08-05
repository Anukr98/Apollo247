import { EntityRepository, Repository } from 'typeorm';
import { ConsultHours } from 'doctors-service/entities';

@EntityRepository(ConsultHours)
export class DoctorConsultHoursRepository extends Repository<ConsultHours> {
  findByDoctorId(doctorId: string) {
    return this.find({
      where: { doctorId },
    });
  }

  getDifference() {}
}
