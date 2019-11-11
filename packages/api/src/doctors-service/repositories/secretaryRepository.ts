import { EntityRepository, Repository } from 'typeorm';
import { Secretary } from 'doctors-service/entities';

@EntityRepository(Secretary)
export class SecretaryRepository extends Repository<Secretary> {
  getSecretary(mobileNumber: string, isActive: boolean) {
    return this.findOne({
      where: { mobileNumber, isActive },
      relations: [
        'doctorSecretary',
        'doctorSecretary.doctor',
        'doctorSecretary.doctor.specialty',
        'doctorSecretary.doctor.doctorHospital',
        'doctorSecretary.doctor.doctorHospital.facility',
        'doctorSecretary.doctor.consultHours',
        'doctorSecretary.doctor.starTeam',
        'doctorSecretary.doctor.bankAccount',
        'doctorSecretary.doctor.packages',
        'doctorSecretary.doctor.starTeam.associatedDoctor',
        'doctorSecretary.doctor.starTeam.associatedDoctor.specialty',
        'doctorSecretary.doctor.starTeam.associatedDoctor.doctorHospital',
        'doctorSecretary.doctor.starTeam.associatedDoctor.doctorHospital.facility',
      ],
    });
  }

  getSecretaryList() {
    return this.find({});
  }

  getSecretaryById(id: string) {
    return this.findOne({ where: { id } });
  }
}
