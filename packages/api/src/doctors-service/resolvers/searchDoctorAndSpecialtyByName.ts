import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { DoctorsServiceContext } from 'doctors-service/doctorsServiceContext';
import { Doctor, DoctorSpecialty } from 'doctors-service/entities/';

import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { DoctorSpecialtyRepository } from 'doctors-service/repositories/doctorSpecialtyRepository';

import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

export const searchDoctorAndSpecialtyByNameTypeDefs = gql`
  type PossibleSearchMatches {
    doctors: [DoctorDetails]
    specialties: [DoctorSpecialty]
  }

  type SearchDoctorAndSpecialtyByNameResult {
    doctors: [DoctorDetails]
    specialties: [DoctorSpecialty]
    possibleMatches: PossibleSearchMatches
    otherDoctors: [DoctorDetails]
  }

  extend type Query {
    SearchDoctorAndSpecialtyByName(searchText: String!): SearchDoctorAndSpecialtyByNameResult
  }
`;

type PossibleSearchMatches = {
  doctors?: Doctor[];
  specialties?: DoctorSpecialty[];
};

type SearchDoctorAndSpecialtyByNameResult = {
  doctors: Doctor[];
  specialties: DoctorSpecialty[];
  possibleMatches: PossibleSearchMatches;
  otherDoctors?: Doctor[];
};

const SearchDoctorAndSpecialtyByName: Resolver<
  null,
  { searchText: string },
  DoctorsServiceContext,
  SearchDoctorAndSpecialtyByNameResult
> = async (parent, args, { doctorsDb, consultsDb }) => {
  const searchTextLowerCase = args.searchText.trim().toLowerCase();

  let matchedDoctors, matchedSpecialties;
  let possibleDoctors, possibleSpecialties;
  let otherDoctors;
  try {
    const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
    const specialtyRepository = doctorsDb.getCustomRepository(DoctorSpecialtyRepository);

    matchedDoctors = await doctorRepository.searchByName(searchTextLowerCase);
    matchedSpecialties = await specialtyRepository.searchByName(searchTextLowerCase);

    //fetch other doctors only if there is one matched doctor
    if (matchedDoctors.length === 1) {
      otherDoctors = await doctorRepository.findOtherDoctorsOfSpecialty(
        matchedDoctors[0].specialty.id,
        matchedDoctors[0].id
      );
    }

    //fetch possible doctors only if there are not matched doctors and specialties
    if (matchedDoctors.length === 0 && matchedSpecialties.length === 0) {
      possibleDoctors = await doctorRepository.searchByName('');
      possibleSpecialties = await specialtyRepository.searchByName('');
    }
  } catch (searchError) {
    throw new AphError(AphErrorMessages.SEARCH_DOCTOR_ERROR, undefined, { searchError });
  }
  return {
    doctors: matchedDoctors,
    specialties: matchedSpecialties,
    possibleMatches: {
      doctors: possibleDoctors,
      specialties: possibleSpecialties,
    },
    otherDoctors: otherDoctors,
  };
};

export const searchDoctorAndSpecialtyByNameResolvers = {
  Query: {
    SearchDoctorAndSpecialtyByName,
  },
};
