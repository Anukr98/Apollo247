import { EntityRepository, Repository } from 'typeorm';
import { DoctorAndHospital } from 'doctors-service/entities';

@EntityRepository(DoctorAndHospital)
export class DoctorHospitalRepository extends Repository<DoctorAndHospital> {
  findDoctorHospital(doctor: string, facility: string) {
    return this.count({ where: { doctor, facility } });
  }
}
