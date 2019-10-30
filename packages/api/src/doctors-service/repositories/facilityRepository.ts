import { EntityRepository, Repository } from 'typeorm';
import { Facility, FacilityType } from 'doctors-service/entities';

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
    let facilityName = '';
    if (facility.name) facilityName = facility.name.trim().toLowerCase();
    //if (facility.streetLine1) facilityName += '_' + facility.streetLine1.trim().toLowerCase();
    return facilityName;
  }

  getUniqueFacilities(duplicateFacilities: Partial<Facility>[]) {
    const uniqueFacilities: Partial<Facility>[] = [];
    const uniqueFacilityChecker: string[] = [];
    duplicateFacilities.forEach((facility) => {
      const uniqueTerm = this.getFacilityUniqueTerm(facility);
      if (!uniqueFacilityChecker.includes(uniqueTerm)) {
        uniqueFacilityChecker.push(uniqueTerm);
        if (facility.name === undefined || uniqueTerm == '') {
          uniqueFacilities.push({
            name: '',
            streetLine1: '',
            city: '',
            state: '',
            country: '',
            facilityType: FacilityType.HOSPITAL,
          });
        } else {
          uniqueFacilities.push(facility);
        }
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
    });

    //insert/update new facilities
    return this.save(uniqueFacilities).catch((saveFacilitiesError) => {
      throw new AphError(AphErrorMessages.SAVE_FACILITIES_ERROR, undefined, {
        saveFacilitiesError,
      });
    });
  }

  getfacilityDetails(id: string) {
    return this.findOne({
      where: [{ id }],
    });
  }
}
