import { EntityRepository, Repository } from 'typeorm';
import { Patient } from 'profiles-service/entities';

@EntityRepository(Patient)
export class PatientRepository extends Repository<Patient> {
  findById(id: string) {
    return this.findOne({ where: { id } });
  }

  getPatientDetails(id: string) {
    return this.findOne({
      where: { id },
      relations: ['lifeStyle', 'healthVault', 'familyHistory'],
    });
  }
}
