import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { doctors } from 'doctors-service/data/doctor';
import { Doctor } from 'doctors-service/resolvers/getDoctors';
import { DoctorsServiceContext } from 'doctors-service/doctorsServiceContext';

export const getSpecialtyDoctorsTypeDefs = gql`
  type filteredDoctorsResult {
    doctors: [Doctor]
  }
  input filterInput {
    specialty: String!
    city: [String]
    experience: [String]
    availability: [String]
    fees: [String]
    gender: [String]
    language: [String]
    location: String
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
  fees: String[];
  gender: String[];
  language: String[];
  location: String;
};

const getSpecialtyDoctorsWithFilters: Resolver<
  null,
  { filterInput: filterInput },
  DoctorsServiceContext,
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
