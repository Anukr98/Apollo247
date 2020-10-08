import { EntityRepository, Repository } from 'typeorm';
import { DoctorSpecialty } from 'doctors-service/entities';
import { getCache, setCache } from 'profiles-service/database/connectRedis';
import { ApiConstants } from 'ApiConstants';

import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

const REDIS_DOCTOR_SPECIALITY_KEY: string = 'doctor:speciality';

@EntityRepository(DoctorSpecialty)
export class DoctorSpecialtyRepository extends Repository<DoctorSpecialty> {
  findAll() {
    return this.createQueryBuilder('specialty')
      .orderBy('specialty.displayOrder', 'ASC')
      .getMany()
      .catch((getSpecialtiesError) => {
        throw new AphError(AphErrorMessages.GET_SPECIALTIES_ERROR, undefined, {
          getSpecialtiesError,
        });
      });
  }

  findAllWithPagination(take:number,skip:number){
    return this.findAndCount({
      take,
      skip,
      order: {
        displayOrder: 'ASC'
      }
    })
  }


  async setAllSpecialtiesCache() {
    const specialties = await this.findAll();
    if (specialties) {
      const specialtiesString = JSON.stringify(specialties);
      setCache(
        `${REDIS_DOCTOR_SPECIALITY_KEY}`,
        specialtiesString,
        ApiConstants.CACHE_EXPIRATION_3600
      );
    }
    return specialties;
  }

  async getAllSpecialtiesCache() {
    const cache = await getCache(`${REDIS_DOCTOR_SPECIALITY_KEY}`);
    if (cache && typeof cache === 'string') {
      return JSON.parse(cache);
    } else {
      return await this.setAllSpecialtiesCache();
    }
  }

  async getSpecialityWithPagination(pageSize:number,pageNo:number){
    const offset = (pageNo - 1) * pageSize;
    const speciality = await this.getAllSpecialtiesCache();
    return speciality.slice(offset,offset+pageSize);
  }


  searchByName(searchString: string) {
    return this.createQueryBuilder('specialty')
      .where('LOWER(name) LIKE :searchString', {
        searchString: `${searchString}%`,
      })
      .orderBy('specialty.displayOrder', 'ASC')
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

  getAllSpecialities(specialtyId: string) {
    if (specialtyId == '0') {
      return this.createQueryBuilder('specialty')
        .getMany()
        .catch((getSpecialtiesError) => {
          throw new AphError(AphErrorMessages.GET_SPECIALTIES_ERROR, undefined, {
            getSpecialtiesError,
          });
        });
    } else {
      return this.find({
        where: {
          id: specialtyId,
        },
      });
    }
  }

  findSpecialtyIdsByNames(specialtyNames: string[]) {
    return this.createQueryBuilder('specialty')
      .select('specialty.id', 'id')
      .where('specialty.name IN (:...specialtyNames)', {
        specialtyNames,
      })
      .getRawMany()
      .catch((getSpecialtiesError) => {
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
          return;
        }
      });
    });

    //insert/update new specialties
    return this.save(specialties).catch((saveSpecialtiesError) => {
      throw new AphError(AphErrorMessages.SAVE_SPECIALTIES_ERROR, undefined, {
        saveSpecialtiesError,
      });
    });
  }

  updateSpecialtySlug(id: string, slugName: string) {
    return this.update(id, { slugName });
  }
}
