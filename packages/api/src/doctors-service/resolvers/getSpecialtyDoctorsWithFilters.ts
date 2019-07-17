import gql from 'graphql-tag';
import { Resolver } from 'doctors-service/doctors-service';
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

const getSpecialtyDoctorsWithFilters: Resolver<any, { filterInput: filterInput }> = async (
  parent,
  args
): Promise<filteredDoctorsResult> => {
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
