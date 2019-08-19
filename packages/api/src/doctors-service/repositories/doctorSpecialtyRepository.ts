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

  findById(id: string) {
    return this.findOne({ where: { id } });
  }

  getSearchSpecialtiesByIds(specialtyIds: string[]) {
    return this.createQueryBuilder('specialty')
      .select('specialty.id', 'typeId')
      .addSelect('specialty.name', 'name')
      .addSelect('specialty.image', 'image')
      .where('specialty.id IN (:...specialtyIds)', {
        specialtyIds,
      })
      .getRawMany();
  }
}
