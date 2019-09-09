import { Facility, FacilityType } from 'doctors-service/entities';
import { randomEnum } from 'helpers/factoryHelpers';
import faker from 'faker';

export const buildFacility = (attrs?: Partial<Facility>) => {
  const facility = new Facility();
  facility.city = faker.address.city();
  facility.facilityType = randomEnum(FacilityType);
  facility.name = faker.company.companyName();
  facility.streetLine1 = faker.address.streetAddress();
  facility.streetLine2 = faker.random.boolean() ? faker.address.streetAddress() : '';
  return Object.assign(facility, attrs);
};
