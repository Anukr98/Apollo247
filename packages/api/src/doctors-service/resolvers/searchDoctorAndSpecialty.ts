import gql from 'graphql-tag';
import { Resolver } from 'doctors-service/doctors-service';
import { doctors } from 'doctors-service/data/doctor';
import { specialties } from 'doctors-service/data/specialty';

import { Doctor } from 'doctors-service/resolvers/doctorResolvers';
import { Specialty } from 'doctors-service/resolvers/getSpecialties';

export const searchDoctorAndSpecialtyTypeDefs = gql`
  type SearchDoctorAndSpecialtyResult {
    doctors: [Doctor]
    specialties: [Specialty]
  }
  extend type Query {
    SearchDoctorAndSpecialty(searchText: String): SearchDoctorAndSpecialtyResult
  }
`;

type SearchDoctorAndSpecialtyResult = {
  doctors: Partial<Doctor>[];
  specialties: Specialty[];
};

const SearchDoctorAndSpecialty: Resolver<any, { searchText: string }> = async (
  parent,
  args
): Promise<SearchDoctorAndSpecialtyResult> => {
  const searchTextLowerCase = args.searchText.toLowerCase();
  const mathchedDoctors = doctors.filter((obj) =>
    obj.firstName.toLowerCase().startsWith(searchTextLowerCase)
  );
  const matchedSpecialties = specialties.filter((obj) =>
    obj.name.toLowerCase().startsWith(searchTextLowerCase)
  );
  return {
    doctors: mathchedDoctors,
    specialties: matchedSpecialties,
  };
};

export const searchDoctorAndSpecialtyResolvers = {
  Query: {
    SearchDoctorAndSpecialty,
  },
};
