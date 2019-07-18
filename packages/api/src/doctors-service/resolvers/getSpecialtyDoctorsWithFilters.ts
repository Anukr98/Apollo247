import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { doctors } from 'doctors-service/data/doctor';
import { Doctor } from 'doctors-service/resolvers/doctorResolvers';

export const getSpecialtyDoctorsTypeDefs = gql`
  type filteredDoctorsResult {
    doctors: [Doctor]
  }
  input filterInput {
    specialty: String!
    city: [String]
    experience: [String]
    availability: [String]
    gender: [String]
    language: [String]
  }
  extend type Query {
    getSpecialtyDoctorsWithFilters(filterInput: filterInput): filteredDoctorsResult
  }
`;

type filteredDoctorsResult = {
  doctors: Doctor[];
};

type filterInput = {
  specialty: String;
  city: String[];
  experience: String[];
  availability: String[];
  gender: String[];
  language: String[];
};

const getSpecialtyDoctorsWithFilters: Resolver<
  null,
  { filterInput: filterInput },
  null,
  filteredDoctorsResult
> = async (parent, args) => {
  const mathchedDoctors = doctors.filter(
    (obj) => obj.speciality.toLowerCase() == args.filterInput.specialty.toLowerCase()
  );

  return {
    doctors: mathchedDoctors,
  };
};

export const getSpecialtyDoctorsResolvers = {
  Query: {
    getSpecialtyDoctorsWithFilters,
  },
};
