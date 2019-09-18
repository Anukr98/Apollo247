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
    SearchDoctorAndSpecialtyByName(
      searchText: String!
      patientId: ID
    ): SearchDoctorAndSpecialtyByNameResult
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
  { searchText: string; patientId: string },
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
    const consultsRepository = consultsDb.getCustomRepository(AppointmentRepository);

    matchedDoctors = await doctorRepository.searchByName(searchTextLowerCase);
    matchedSpecialties = await specialtyRepository.searchByName(searchTextLowerCase);

    //apply sort algorithm
    if (matchedDoctors.length > 1) {
      //get patient and matched doctors previous appointments starts here
      const matchedDoctorIds = matchedDoctors.map((doctor) => {
        return doctor.id;
      });
      const previousAppointments = await consultsRepository.getPatientAndDoctorsAppointments(
        args.patientId,
        matchedDoctorIds
      );
      const consultedDoctorIds = previousAppointments.map((appt) => {
        return appt.doctorId;
      });
      //get patient and matched doctors previous appointments ends here

      matchedDoctors.sort((doctorA: Doctor, doctorB: Doctor) => {
        return doctorRepository.sortByRankingAlgorithm(doctorA, doctorB, consultedDoctorIds);
      });
    }

    //fetch other doctors only if there is one matched doctor
    if (matchedDoctors.length === 1) {
      otherDoctors = await doctorRepository.findOtherDoctorsOfSpecialty(
        matchedDoctors[0].specialty.id,
        matchedDoctors[0].id
      );

      //apply sort algorithm
      if (otherDoctors.length > 1) {
        //get patient and matched doctors previous appointments starts here
        const otherDoctorsIds = otherDoctors.map((doctor) => {
          return doctor.id;
        });
        const previousAppointments = await consultsRepository.getPatientAndDoctorsAppointments(
          args.patientId,
          otherDoctorsIds
        );
        const consultedDoctorIds = previousAppointments.map((appt) => {
          return appt.doctorId;
        });
        //get patient and matched doctors previous appointments ends here

        otherDoctors.sort((doctorA: Doctor, doctorB: Doctor) => {
          return doctorRepository.sortByRankingAlgorithm(doctorA, doctorB, consultedDoctorIds);
        });
      }
    }

    //fetch possible doctors only if there are not matched doctors and specialties
    if (matchedDoctors.length === 0 && matchedSpecialties.length === 0) {
      possibleDoctors = await doctorRepository.searchByName('');
      possibleSpecialties = await specialtyRepository.searchByName('');

      if (possibleDoctors.length > 1) {
        //get patient and matched doctors previous appointments starts here
        const possibleDoctorIds = possibleDoctors.map((doctor) => {
          return doctor.id;
        });
        const previousAppointments = await consultsRepository.getPatientAndDoctorsAppointments(
          args.patientId,
          possibleDoctorIds
        );
        const consultedDoctorIds = previousAppointments.map((appt) => {
          return appt.doctorId;
        });
        //get patient and matched doctors previous appointments ends here

        possibleDoctors.sort((doctorA: Doctor, doctorB: Doctor) => {
          return doctorRepository.sortByRankingAlgorithm(doctorA, doctorB, consultedDoctorIds);
        });
      }
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
