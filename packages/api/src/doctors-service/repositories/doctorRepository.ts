import { EntityRepository, Repository } from 'typeorm';
import { Doctor } from 'doctors-service/entities';

@EntityRepository(Doctor)
export class DoctorRepository extends Repository<Doctor> {
  findByMobileNumber(mobileNumber: string, isActive: Boolean) {
    return this.findOne({
      where: [{ mobileNumber, isActive }, { delegateNumber: mobileNumber, isActive: isActive }],
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

  updateFirebaseId(id: string, firebaseToken: string) {
    return this.update(id, { firebaseToken: firebaseToken });
  }
}
