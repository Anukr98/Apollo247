import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { DoctorSpecialty } from 'doctors-service/entities/';
import { DoctorsServiceContext } from 'doctors-service/doctorsServiceContext';
import { DoctorSpecialtyRepository } from 'doctors-service/repositories/doctorSpecialtyRepository';

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
  }
  extend type Query {
    getAllSpecialties: [DoctorSpecialty!]!
  }

  extend type Mutation {
    updateSpecialtySlug: Boolean!
  }
`;

const getAllSpecialties: Resolver<null, {}, DoctorsServiceContext, DoctorSpecialty[]> = async (
  parent,
  args,
  { doctorsDb }
) => {
  const specialtiesRepo = doctorsDb.getCustomRepository(DoctorSpecialtyRepository);
  const allSpecialties = await specialtiesRepo.findAll();
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

export const getAllSpecialtiesResolvers = {
  Query: {
    getAllSpecialties,
  },

  Mutation: {
    updateSpecialtySlug,
  },
};
