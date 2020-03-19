import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { DoctorsServiceContext } from 'doctors-service/doctorsServiceContext';
import { FacilityRepository } from 'doctors-service/repositories/facilityRepository';

export const getAllFacilityCitiesTypeDefs = gql`
  type GetCities {
    city: [String]
  }
  extend type Query {
    getAllFacilityCities: GetCities!
  }
`;

type GetCities = {
  city: string[];
};

const getAllFacilityCities: Resolver<null, {}, DoctorsServiceContext, GetCities> = async (
  parent,
  args,
  { doctorsDb }
) => {
  const facilitiesRepo = doctorsDb.getCustomRepository(FacilityRepository);
  const allcities = await facilitiesRepo.findDistinctCity();
  const cities: string[] = [];
  if (allcities[0]) {
    allcities.forEach((data) => {
      cities.push(data.city);
    });
  }
  return { city: cities };
};

export const getAllFacilityCitiesResolvers = {
  Query: {
    getAllFacilityCities,
  },
};
