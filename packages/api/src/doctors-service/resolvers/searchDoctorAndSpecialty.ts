import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { doctors } from 'doctors-service/data/doctor';
import { specialties } from 'doctors-service/data/specialty';
import { DoctorsServiceContext } from 'doctors-service/doctors-service';

import { Doctor } from 'doctors-service/resolvers/getDoctors';
import { Specialty } from 'doctors-service/resolvers/getSpecialties';

export const searchDoctorAndSpecialtyTypeDefs = gql`
  type PossibleMatches {
    doctors: [Doctor]
    specialties: [Specialty]
  }
  type SearchDoctorAndSpecialtyResult {
    doctors: [Doctor]
    specialties: [Specialty]
    possibleMatches: PossibleMatches
  }
  extend type Query {
    SearchDoctorAndSpecialty(searchText: String): SearchDoctorAndSpecialtyResult
  }
`;

type PossibleMatches = {
  doctors: Doctor[];
  specialties: Specialty[];
};

type SearchDoctorAndSpecialtyResult = {
  doctors: Doctor[];
  specialties: Specialty[];
  possibleMatches: PossibleMatches;
};

const SearchDoctorAndSpecialty: Resolver<
  null,
  { searchText: string },
  DoctorsServiceContext,
  SearchDoctorAndSpecialtyResult
> = async (parent, args) => {
  const searchTextLowerCase = args.searchText.trim().toLowerCase();
  const matchedDoctors = doctors.filter(
    (obj) =>
      obj.firstName.toLowerCase().startsWith(searchTextLowerCase) ||
      obj.lastName.toLowerCase().startsWith(searchTextLowerCase) ||
      (obj.firstName + ' ' + obj.lastName).toLowerCase().startsWith(searchTextLowerCase)
  );
  const matchedSpecialties = specialties.filter((obj) =>
    obj.name.toLowerCase().startsWith(searchTextLowerCase)
  );

  const possibleDoctors: Doctor[] = [];
  const possibleSpecialties: Specialty[] = [];

  if (matchedDoctors.length === 0 && matchedSpecialties.length === 0) {
    possibleDoctors.push(doctors[0]);
    possibleSpecialties.push(specialties[0]);
  }
  return {
    doctors: matchedDoctors,
    specialties: matchedSpecialties,
    possibleMatches: {
      doctors: possibleDoctors,
      specialties: possibleSpecialties,
    },
  };
};

export const searchDoctorAndSpecialtyResolvers = {
  Query: {
    SearchDoctorAndSpecialty,
  },
};
