import { EntityRepository, Repository } from 'typeorm';
import { Facility } from 'doctors-service/entities';

import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

@EntityRepository(Facility)
export class FacilityRepository extends Repository<Facility> {
  findAll() {
    return this.createQueryBuilder('facility')
      .getMany()
      .catch((getFacilitiesError) => {
        throw new AphError(AphErrorMessages.GET_FACILITIES_ERROR, undefined, {
          getFacilitiesError,
        });
      });
  }

  getFacilityUniqueTerm(facility: Partial<Facility>) {
    if (facility.name && facility.streetLine1)
      return facility.name.trim().toLowerCase() + '_' + facility.streetLine1.trim().toLowerCase();
    else return '';
  }

  getUniqueFacilities(duplicateFacilities: Partial<Facility>[]) {
    const uniqueFacilities: Partial<Facility>[] = [];
    const uniqueFacilityChecker: string[] = [];
    duplicateFacilities.forEach((facility) => {
      const uniqueTerm = this.getFacilityUniqueTerm(facility);
      if (!uniqueFacilityChecker.includes(uniqueTerm) && uniqueTerm != '') {
        uniqueFacilityChecker.push(uniqueTerm);
        uniqueFacilities.push(facility);
      }
    });
    return uniqueFacilities;
  }

  async insertOrUpdateAllFacilities(facilities: Partial<Facility>[]) {
    //get all the existing facilities
    const allExistingFacilities = await this.findAll();
    const uniqueFacilities = this.getUniqueFacilities(facilities);

    uniqueFacilities.forEach((facility) => {
      allExistingFacilities.forEach((existingFacility) => {
        if (this.getFacilityUniqueTerm(facility) == this.getFacilityUniqueTerm(existingFacility)) {
          facility.id = existingFacility.id;
          facility.updatedDate = new Date();
          return;
        }
      });

      if (!facility.id) {
        facility.createdDate = new Date();
      }
    });

    //insert/update new facilities
    return this.save(uniqueFacilities).catch((saveFacilitiesError) => {
      throw new AphError(AphErrorMessages.SAVE_FACILITIES_ERROR, undefined, {
        saveFacilitiesError,
      });
    });
  }
}
