import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { DoctorSpecialty } from 'doctors-service/entities/';
import { DoctorsServiceContext } from 'doctors-service/doctorsServiceContext';
import { DoctorSpecialtyRepository } from 'doctors-service/repositories/doctorSpecialtyRepository';
import { FacilityRepository } from 'doctors-service/repositories/facilityRepository';

export const getAllSpecialtiesTypeDefs = gql`
  type DoctorSpecialty {
    id: ID!
    name: String!
    image: String
    specialistSingularTerm: String
    specialistPluralTerm: String
    userFriendlyNomenclature: String
    displayOrder: Int
    slugName: String
    shortDescription: String
    symptoms: String
    commonSearchWords: String
  }

  type CitiesResult {
    city: [String]
  }

  extend type Query {
    getAllSpecialties(
      pageSize: Int
      pageNo: Int
    ): [DoctorSpecialty!]!
    getAllCities: CitiesResult
  }

  extend type Mutation {
    updateSpecialtySlug: Boolean!
  }
`;

type CitiesResult = {
  city: string[];
};

const getAllSpecialties: Resolver<null, {pageSize: number,pageNo: number}, DoctorsServiceContext, DoctorSpecialty[]> = async (
  parent,
  args,
  { doctorsDb }
) => {
  const pageNo = args.pageNo ? args.pageNo : 1;
  const pageSize = args.pageSize ? args.pageSize : 100;
  const offset = (pageNo - 1) * pageSize;

  const specialtiesRepo = doctorsDb.getCustomRepository(DoctorSpecialtyRepository);
  const [allSpecialties]  = await specialtiesRepo.findAllWithPagination(pageSize, offset);
  allSpecialties.map((element: any) => {
    element['commonSearchWords'] = element.commonSearchTerm;
  });
  return allSpecialties;
};

const updateSpecialtySlug: Resolver<null, {}, DoctorsServiceContext, Boolean> = async (
  parent,
  args,
  { doctorsDb }
) => {
  const specialtiesRepo = doctorsDb.getCustomRepository(DoctorSpecialtyRepository);
  const allSpecialties = await specialtiesRepo.findAll();
  allSpecialties.forEach((specialty) => {
    const specialtyName = specialty.name
      .trim()
      .toLowerCase()
      .replace(/\s/g, '-')
      .replace('/', '_')
      .replace('&', '%26');
    specialtiesRepo.updateSpecialtySlug(specialty.id, specialtyName);
  });
  return true;
};

const getAllCities: Resolver<null, {}, DoctorsServiceContext, CitiesResult> = async (
  parent,
  args,
  { doctorsDb }
) => {
  const facilityRepo = doctorsDb.getCustomRepository(FacilityRepository);
  const allCities = await facilityRepo.findAll();
  const uniqueCitys: string[] = [];
  allCities.forEach((city) => {
    if (!uniqueCitys.includes(city.city)) {
      uniqueCitys.push(city.city);
    }
  });
  return { city: uniqueCitys };
};

export const getAllSpecialtiesResolvers = {
  Query: {
    getAllSpecialties,
    getAllCities,
  },

  Mutation: {
    updateSpecialtySlug,
  },
};
