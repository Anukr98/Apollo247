import { EntityRepository, Repository } from 'typeorm';
import { Secretary } from 'doctors-service/entities';

@EntityRepository(Secretary)
export class SecretaryRepository extends Repository<Secretary> {
  getSecretary(mobileNumber: string, isActive: boolean) {
    return this.findOne({
      where: { mobileNumber, isActive },
      relations: ['doctorSecretary', 'doctorSecretary.doctor'],
    });
  }
}
