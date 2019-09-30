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
  }
  extend type Query {
    getAllSpecialties: [DoctorSpecialty!]!
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

export const getAllSpecialtiesResolvers = {
  Query: {
    getAllSpecialties,
  },
};
