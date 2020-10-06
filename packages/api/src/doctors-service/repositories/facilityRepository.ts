import { EntityRepository, Repository, Not } from 'typeorm';
import { Facility, FacilityType } from 'doctors-service/entities';
import fetch from 'node-fetch';
import { Geolocation } from 'doctors-service/resolvers/getDoctorsBySpecialtyAndFilters';
import { ApiConstants } from 'ApiConstants';

import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { log } from 'customWinstonLogger';

export type CityList = {
  city: string;
  id: string;
};

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

  async findDistinctCity() {
    const citiesList: CityList[] = await this.createQueryBuilder('facility')
      .select(['DISTINCT facility.city as city', 'facility.id as id'])
      .where('facility.city is not null')
      .andWhere("facility.city != ''")
      .getRawMany()
      .catch((getFacilitiesError) => {
        throw new AphError(AphErrorMessages.GET_FACILITIES_ERROR, undefined, {
          getFacilitiesError,
        });
      });
    return citiesList;
  }
  async getAllFacilityDistances(userGeoLocation: Geolocation) {
    const facilities = await this.find({ where: { name: Not('') } });

    //get facility lat longs here
    const facilityAndDistancesMap: { [index: string]: string } = {};
    const facilityIds: string[] = [];
    const facilityLatLongs: string[] = [];
    facilities.forEach((facility) => {
      facilityIds.push(facility.id);
      facilityLatLongs.push(`${facility.latitude},${facility.longitude}`);
      facilityAndDistancesMap[facility.id] = '';
    });
    const pipedFacilityLatLongs = facilityLatLongs.join('|');
    const userLatLong = `${userGeoLocation.latitude},${userGeoLocation.longitude}`;

    //get distances of facilities from user geolocation using google maps distance matrix api
    const mapsUrl = `${ApiConstants.GOOGLE_MAPS_DISTANCE_MATRIX_URL}?origins=${userLatLong}&destinations=${pipedFacilityLatLongs}&mode=driving&language=pl-PL&sensor=true&key=${process.env.GOOGLE_MAPS_KEY}`;
    log(
      'doctorServiceLogger',
      `EXTERNAL_API_CALL_PRISM: ${mapsUrl}`,
      'getAllFacilityDistances()->googleDistanceMatrixApi->API_CALL_STARTING',
      '',
      ''
    );
    const distancesPromise = await fetch(mapsUrl).catch((error) => {
      log(
        'doctorServiceLogger',
        'API_CALL_ERROR',
        'getAllFacilityDistances()->googleDistanceMatrixApi->CATCH_BLOCK',
        '',
        JSON.stringify(error)
      );

      throw new AphError(AphErrorMessages.PRISM_GET_USERS_ERROR);
    });

    type GoogleMapsValue = { text: string; value: string };
    type GoogleMapsElement = {
      distance: GoogleMapsValue;
      duration: GoogleMapsValue;
      status: string;
    };

    const distancesResult = await distancesPromise.json();
    log(
      'doctorServiceLogger',
      'API_CALL_RESPONSE',
      'getAllFacilityDistances()->googleDistanceMatrixApi->API_CALL_RESPONSE',
      JSON.stringify(distancesResult),
      ''
    );

    if (distancesResult.status == 'OK' && distancesResult.rows.length > 0) {
      if (distancesResult.rows[0].elements.length > 0) {
        distancesResult.rows[0].elements.forEach((element: GoogleMapsElement, index: number) => {
          facilityAndDistancesMap[facilityIds[index]] =
            element.status == 'OK' ? element.distance.value : '';
        });
      }
    }
    return facilityAndDistancesMap;
  }

  getFacilityUniqueTerm(facility: Partial<Facility>) {
    let facilityName = '';
    if (facility.name) facilityName = facility.name.trim().toLowerCase();
    if (facility.streetLine1) facilityName += '_' + facility.streetLine1.trim().toLowerCase();
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
