import { EntityRepository, Repository } from 'typeorm';
import { DoctorSpecialty } from 'doctors-service/entities';

import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

@EntityRepository(DoctorSpecialty)
export class DoctorSpecialtyRepository extends Repository<DoctorSpecialty> {
  findAll() {
    return this.createQueryBuilder('specialty')
      .orderBy('specialty.name', 'ASC')
      .getMany()
      .catch((getSpecialtiesError) => {
        throw new AphError(AphErrorMessages.GET_SPECIALTIES_ERROR, undefined, {
          getSpecialtiesError,
        });
      });
  }
  searchByName(searchString: string) {
    return this.createQueryBuilder('specialty')
      .where('LOWER(name) LIKE :searchString', {
        searchString: `${searchString}%`,
      })
      .getMany()
      .catch((getSpecialtiesError) => {
        throw new AphError(AphErrorMessages.GET_SPECIALTIES_ERROR, undefined, {
          getSpecialtiesError,
        });
      });
  }

  findById(id: string) {
    return this.findOne({ where: { id } }).catch((getSpecialtiesError) => {
      throw new AphError(AphErrorMessages.GET_SPECIALTIES_ERROR, undefined, {
        getSpecialtiesError,
      });
    });
  }

  getSearchSpecialtiesByIds(specialtyIds: string[]) {
    return this.createQueryBuilder('specialty')
      .select('specialty.id', 'typeId')
      .addSelect('specialty.name', 'name')
      .addSelect('specialty.image', 'image')
      .where('specialty.id IN (:...specialtyIds)', {
        specialtyIds,
      })
      .getRawMany()
      .catch((getSpecialtiesError) => {
        throw new AphError(AphErrorMessages.GET_SPECIALTIES_ERROR, undefined, {
          getSpecialtiesError,
        });
      });
  }
}
