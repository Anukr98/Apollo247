import gql from 'graphql-tag';
import { Resolver } from 'doctors-service/doctors-service';
import SpecialtiesData from 'doctors-service/data/specialties.json';

export const getSpecialtyTypeDefs = gql`
  type Specialty {
    id: String
    name: String
  }
  extend type Query {
    getSpecialties: [Specialty]
  }
`;

type Specialty = {
  id: string;
  name: string;
};

const getSpecialties: Resolver<any> = async (parent, args): Promise<[Specialty]> => {
  return JSON.parse(JSON.stringify(SpecialtiesData));
};

export const getSpecialtyResolvers = {
  Query: {
    getSpecialties,
  },
};
