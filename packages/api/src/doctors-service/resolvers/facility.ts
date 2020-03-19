import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { DoctorsServiceContext } from 'doctors-service/doctorsServiceContext';
import { FacilityRepository, CityList } from 'doctors-service/repositories/facilityRepository';

export const getAllFacilityCitiesTypeDefs = gql`
  type GetCities {
    city: [CityList]
  }

  type CityList {
    city: String
    id: String
  }
  extend type Query {
    getAllFacilityCities: GetCities!
  }
`;

type GetCities = {
  city: CityList[];
};

const getAllFacilityCities: Resolver<null, {}, DoctorsServiceContext, GetCities> = async (
  parent,
  args,
  { doctorsDb }
) => {
  const facilitiesRepo = doctorsDb.getCustomRepository(FacilityRepository);
  const allcities = await facilitiesRepo.findDistinctCity();
  return { city: allcities };
};

export const getAllFacilityCitiesResolvers = {
  Query: {
    getAllFacilityCities,
  },
};
