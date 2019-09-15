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

  async insertOrUpdateAllSpecialties(specialties: Partial<DoctorSpecialty>[]) {
    //get all the existing specialties
    const allExistingSpecialties = await this.findAll();

    specialties.forEach((specialty) => {
      allExistingSpecialties.forEach((existingSpecialty) => {
        if (
          specialty.name &&
          specialty.name.trim().toLowerCase() == existingSpecialty.name.trim().toLowerCase()
        ) {
          specialty.id = existingSpecialty.id;
          specialty.updatedDate = new Date();
        }
      });
      if (!specialty.id) {
        specialty.createdDate = new Date();
      }
    });

    //insert/update new specialties
    this.save(specialties).catch((saveSpecialtiesError) => {
      throw new AphError(AphErrorMessages.SAVE_SPECIALTIES_ERROR, undefined, {
        saveSpecialtiesError,
      });
    });
  }
}
