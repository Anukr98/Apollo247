import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { DoctorsServiceContext } from 'doctors-service/doctorsServiceContext';
import { Doctor, DoctorSpecialty } from 'doctors-service/entities/';

import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { DoctorSpecialtyRepository } from 'doctors-service/repositories/doctorSpecialtyRepository';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';

import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

export const searchDoctorAndSpecialtyByNameTypeDefs = gql`
  type AvailabilityInMinutes {
    online: String
    physical: String
  }
  type DoctorAvailability {
    doctorId: ID!
    availabileInMinutes: AvailabilityInMinutes
    possibleSlots: [String]
  }
  type PossibleSearchMatches {
    doctors: [DoctorDetails]
    doctorsAvailability: [DoctorAvailability]
    specialties: [DoctorSpecialty]
  }
  type OtherDoctors {
    doctors: [DoctorDetails]
    doctorsAvailability: [DoctorAvailability]
  }
  type SearchDoctorAndSpecialtyByNameResult {
    doctors: [DoctorDetails]
    doctorsAvailability: [DoctorAvailability]
    specialties: [DoctorSpecialty]
    possibleMatches: PossibleSearchMatches
    otherDoctors: OtherDoctors
  }

  extend type Query {
    SearchDoctorAndSpecialtyByName(searchText: String!): SearchDoctorAndSpecialtyByNameResult
  }
`;

type AvailabilityInMinutes = {
  online: number;
  physical: number;
};
type DoctorAvailability = {
  doctorId: string;
  availabileInMinutes: AvailabilityInMinutes;
  possibleSlots: string[];
};

type OtherDoctors = {
  doctors?: Doctor[];
  doctorsAvailability?: DoctorAvailability[];
};

type PossibleSearchMatches = {
  doctors?: Doctor[];
  doctorsAvailability?: DoctorAvailability[];
  specialties?: DoctorSpecialty[];
};

type SearchDoctorAndSpecialtyByNameResult = {
  doctors: Doctor[];
  specialties: DoctorSpecialty[];
  possibleMatches: PossibleSearchMatches;
  otherDoctors: OtherDoctors;
};

const SearchDoctorAndSpecialtyByName: Resolver<
  null,
  { searchText: string },
  DoctorsServiceContext,
  SearchDoctorAndSpecialtyByNameResult
> = async (parent, args, { doctorsDb, consultsDb }) => {
  const searchTextLowerCase = args.searchText.trim().toLowerCase();

  let matchedDoctors, doctorsAvailability, matchedSpecialties;
  let possibleDoctors, possibleSpecialties, possibleDoctorsAvailability;
  let otherDoctors, otherDoctorsAvailability;
  try {
    const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
    const specialtyRepository = doctorsDb.getCustomRepository(DoctorSpecialtyRepository);
    const appointmentRepository = consultsDb.getCustomRepository(AppointmentRepository);

    matchedDoctors = await doctorRepository.searchByName(searchTextLowerCase);
    const matchedDoctorIds = matchedDoctors.map((doctor) => {
      return doctor.id;
    });
    doctorsAvailability = await appointmentRepository.findDoctorsNextAvailability(matchedDoctorIds);
    matchedSpecialties = await specialtyRepository.searchByName(searchTextLowerCase);

    //fetch other doctors only if there is one matched doctor
    if (matchedDoctors.length === 1) {
      otherDoctors = await doctorRepository.searchBySpecialty(matchedDoctors[0].specialty.id);
      const otherDoctorIds = otherDoctors.map((doctor) => {
        return doctor.id;
      });
      otherDoctorsAvailability = await appointmentRepository.findDoctorsNextAvailability(
        otherDoctorIds
      );
    }

    //fetch possible doctors only if there are not matched doctors and specialties
    if (matchedDoctors.length === 0 && matchedSpecialties.length === 0) {
      possibleDoctors = await doctorRepository.searchByName('');
      const possibleDoctorIds = possibleDoctors.map((doctor) => {
        return doctor.id;
      });
      possibleDoctorsAvailability = await appointmentRepository.findDoctorsNextAvailability(
        possibleDoctorIds
      );
      possibleSpecialties = await specialtyRepository.searchByName('');
    }
  } catch (searchError) {
    throw new AphError(AphErrorMessages.SEARCH_DOCTOR_ERROR, undefined, { searchError });
  }
  return {
    doctors: matchedDoctors,
    doctorsAvailability: doctorsAvailability,
    specialties: matchedSpecialties,
    possibleMatches: {
      doctors: possibleDoctors,
      doctorsAvailability: possibleDoctorsAvailability,
      specialties: possibleSpecialties,
    },
    otherDoctors: { doctors: otherDoctors, doctorsAvailability: otherDoctorsAvailability },
  };
};

export const searchDoctorAndSpecialtyByNameResolvers = {
  Query: {
    SearchDoctorAndSpecialtyByName,
  },
};
