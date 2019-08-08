import { EntityRepository, Repository } from 'typeorm';
import { DoctorSpecialty } from 'doctors-service/entities';

@EntityRepository(DoctorSpecialty)
export class DoctorSpecialtyRepository extends Repository<DoctorSpecialty> {
  searchByName(searchString: string) {
    return this.createQueryBuilder('specialty')
      .where('LOWER(name) LIKE :searchString', {
        searchString: `${searchString}%`,
      })
      .getMany();
  }
}
