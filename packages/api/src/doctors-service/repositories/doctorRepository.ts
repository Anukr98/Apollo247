import { EntityRepository, Repository } from 'typeorm';
import { Doctor } from 'doctors-service/entities';

@EntityRepository(Doctor)
export class DoctorRepository extends Repository<Doctor> {
  findByMobileNumber(mobileNumber: string, isActive: Boolean) {
    return this.findOne({
      where: [
        { mobileNumber: mobileNumber, isActive: isActive },
        { delegateNumber: mobileNumber, isActive: isActive },
      ],
      relations: [
        'specialty',
        'doctorHospital',
        'consultHours',
        'starTeam',
        'bankAccount',
        'packages',
        'doctorHospital.facility',
        'starTeam.associatedDoctor',
      ],
    });
  }
}
