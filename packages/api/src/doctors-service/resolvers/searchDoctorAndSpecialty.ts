import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { doctors } from 'doctors-service/data/doctor';
import { specialties } from 'doctors-service/data/specialty';
import { DoctorsServiceContext } from 'doctors-service/doctors-service';

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
  doctors: Doctor[];
  specialties: Specialty[];
};

const SearchDoctorAndSpecialty: Resolver<
  null,
  { searchText: string },
  DoctorsServiceContext,
  SearchDoctorAndSpecialtyResult
> = async (parent, args) => {
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
