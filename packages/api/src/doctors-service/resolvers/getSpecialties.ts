import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { specialties } from 'doctors-service/data/specialty';

export const getSpecialtyTypeDefs = gql`
  type Specialty {
    id: String
    name: String
    image: String
  }
  extend type Query {
    getSpecialties: [Specialty!]!
  }
`;

export type Specialty = {
  id: string;
  name: string;
  image: string;
};

const getSpecialties: Resolver<null, {}, null, Specialty[]> = async (parent, args) => {
  return Promise.resolve(specialties);
};

export const getSpecialtyResolvers = {
  Query: {
    getSpecialties,
  },
};
