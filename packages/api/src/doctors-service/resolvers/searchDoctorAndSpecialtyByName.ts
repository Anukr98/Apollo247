import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { DoctorsServiceContext } from 'doctors-service/doctorsServiceContext';
import { Doctor, DoctorSpecialty, ConsultMode } from 'doctors-service/entities/';
import {
  DoctorSlotAvailability,
  Geolocation,
  FacilityDistanceMap,
} from 'doctors-service/resolvers/getDoctorsBySpecialtyAndFilters';

import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { DoctorSpecialtyRepository } from 'doctors-service/repositories/doctorSpecialtyRepository';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { FacilityRepository } from 'doctors-service/repositories/facilityRepository';
import { ApiConstants } from 'ApiConstants';

import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { Connection } from 'typeorm';
import { debugLog } from 'customWinstonLogger';

export const searchDoctorAndSpecialtyByNameTypeDefs = gql`
  type PossibleSearchMatches {
    doctors: [DoctorDetails]
    doctorsNextAvailability: [DoctorSlotAvailability]
    specialties: [DoctorSpecialty]
  }

  type SearchDoctorAndSpecialtyByNameResult {
    doctors: [DoctorDetails]
    doctorsNextAvailability: [DoctorSlotAvailability]
    specialties: [DoctorSpecialty]
    possibleMatches: PossibleSearchMatches
    otherDoctors: [DoctorDetails]
    otherDoctorsNextAvailability: [DoctorSlotAvailability]
  }

  input Geolocation {
    latitude: Float!
    longitude: Float!
  }

  extend type Query {
    SearchDoctorAndSpecialtyByName(
      searchText: String!
      patientId: ID
      geolocation: Geolocation
    ): SearchDoctorAndSpecialtyByNameResult
  }
`;

type PossibleSearchMatches = {
  doctors?: Doctor[];
  specialties?: DoctorSpecialty[];
  doctorsNextAvailability?: DoctorSlotAvailability[];
};

type SearchDoctorAndSpecialtyByNameResult = {
  doctors: Doctor[];
  specialties: DoctorSpecialty[];
  doctorsNextAvailability: DoctorSlotAvailability[];
  possibleMatches: PossibleSearchMatches;
  otherDoctors?: Doctor[];
  otherDoctorsNextAvailability?: DoctorSlotAvailability[];
};

const SearchDoctorAndSpecialtyByName: Resolver<
  null,
  { searchText: string; patientId: string; geolocation: Geolocation },
  DoctorsServiceContext,
  SearchDoctorAndSpecialtyByNameResult
> = async (parent, args, { doctorsDb, consultsDb }) => {
  debugLog(
    'doctorSearchAPILogger',
    `SEARCH_BY_NAME_CALL___STARTED`,
    '----------------------SearchDoctorAndSpecialtyByName_API--------------------------------'
  );
  const searchTextLowerCase = args.searchText.trim().toLowerCase();

  let matchedDoctors: Doctor[] = [],
    matchedSpecialties: DoctorSpecialty[] = [],
    matchedDoctorsNextAvailability: DoctorSlotAvailability[] = [];
  let possibleDoctors: Doctor[] = [],
    possibleSpecialties: DoctorSpecialty[] = [],
    possibleDoctorsNextAvailability: DoctorSlotAvailability[] = [];
  let otherDoctors: Doctor[] = [],
    otherDoctorsNextAvailability: DoctorSlotAvailability[] = [];
  try {
    const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
    const specialtyRepository = doctorsDb.getCustomRepository(DoctorSpecialtyRepository);

    //get facility distances from user geolocation
    let facilityDistances: FacilityDistanceMap = {};
    if (args.geolocation) {
      debugLog(
        'doctorSearchAPILogger',
        `GEOLOCATION_API_CALL___START`,
        'SearchDoctorAndSpecialtyByName_API'
      );
      const facilityRepo = doctorsDb.getCustomRepository(FacilityRepository);
      facilityDistances = await facilityRepo.getAllFacilityDistances(args.geolocation);
      debugLog(
        'doctorSearchAPILogger',
        `GEOLOCATION_API_CALL___END`,
        'SearchDoctorAndSpecialtyByName_API'
      );
    }

    debugLog(
      'doctorSearchAPILogger',
      `GET_MATCHED_DOCTORS_AND_SPECIALTIES___START`,
      'SearchDoctorAndSpecialtyByName_API'
    );
    matchedDoctors = await doctorRepository.searchByName(searchTextLowerCase);
    matchedSpecialties = await specialtyRepository.searchByName(searchTextLowerCase);
    debugLog(
      'doctorSearchAPILogger',
      `GET_MATCHED_DOCTORS_AND_SPECIALTIES___END`,
      'SearchDoctorAndSpecialtyByName_API'
    );

    //get Sorted Doctors List
    const { sortedDoctors, sortedDoctorsNextAvailability } = await getSortedDoctors(
      matchedDoctors,
      args.patientId,
      doctorsDb,
      consultsDb,
      facilityDistances
    );
    matchedDoctors = sortedDoctors;
    matchedDoctorsNextAvailability = sortedDoctorsNextAvailability;

    //fetch other doctors only if there is one matched doctor
    if (matchedDoctors.length === 1) {
      otherDoctors = await doctorRepository.findOtherDoctorsOfSpecialty(
        matchedDoctors[0].specialty.id,
        matchedDoctors[0].id
      );

      //get Sorted Doctors List
      const { sortedDoctors, sortedDoctorsNextAvailability } = await getSortedDoctors(
        otherDoctors,
        args.patientId,
        doctorsDb,
        consultsDb,
        facilityDistances
      );

      otherDoctors = sortedDoctors;
      otherDoctorsNextAvailability = sortedDoctorsNextAvailability;
    }

    //fetch possible doctors only if there are not matched doctors and specialties
    if (matchedDoctors.length === 0 && matchedSpecialties.length === 0) {
      const {
        sortedPossibleDoctors,
        allPossibleSpecialties,
        sortedPossibleDoctorsNextAvailability,
      } = await getPossibleDoctorsAndSpecialties(
        args.patientId,
        doctorsDb,
        consultsDb,
        facilityDistances
      );
      possibleDoctors = sortedPossibleDoctors;
      possibleSpecialties = allPossibleSpecialties;
      possibleDoctorsNextAvailability = sortedPossibleDoctorsNextAvailability;
    }
  } catch (searchError) {
    throw new AphError(AphErrorMessages.SEARCH_DOCTOR_ERROR, undefined, { searchError });
  }

  debugLog(
    'doctorSearchAPILogger',
    `SEARCH_BY_NAME_CALL___END`,
    '----------------------SearchDoctorAndSpecialtyByName_API--------------------------------'
  );

  return {
    doctors: matchedDoctors,
    doctorsNextAvailability: matchedDoctorsNextAvailability,
    specialties: matchedSpecialties,
    possibleMatches: {
      doctors: possibleDoctors,
      doctorsNextAvailability: possibleDoctorsNextAvailability,
      specialties: possibleSpecialties,
    },
    otherDoctors: otherDoctors,
    otherDoctorsNextAvailability: otherDoctorsNextAvailability,
  };
};

const getPossibleDoctorsAndSpecialties = async (
  patientId: string,
  doctorsDb: Connection,
  consultsDb: Connection,
  facilityDistances?: FacilityDistanceMap
) => {
  const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
  const specialtyRepository = doctorsDb.getCustomRepository(DoctorSpecialtyRepository);

  let allPossibleDoctors: Doctor[] = [];
  let allPossibleSpecialties: DoctorSpecialty[] = [];
  let sortedPossibleDoctors: Doctor[] = [];
  let sortedPossibleDoctorsNextAvailability: DoctorSlotAvailability[] = [];
  const generalPhysicianName = ApiConstants.GENERAL_PHYSICIAN.toString();
  const specialtyId = await specialtyRepository.findSpecialtyIdsByNames([generalPhysicianName]);

  if (specialtyId.length === 1) {
    allPossibleDoctors = await doctorRepository.searchBySpecialty(specialtyId[0].id);
  } else {
    allPossibleDoctors = await doctorRepository.searchByName('');
  }
  allPossibleSpecialties = await specialtyRepository.searchByName('');

  //get Sorted Doctors List
  const { sortedDoctors, sortedDoctorsNextAvailability } = await getSortedDoctors(
    allPossibleDoctors,
    patientId,
    doctorsDb,
    consultsDb,
    facilityDistances
  );

  sortedPossibleDoctors = sortedDoctors;
  sortedPossibleDoctorsNextAvailability = sortedDoctorsNextAvailability;

  return { sortedPossibleDoctors, allPossibleSpecialties, sortedPossibleDoctorsNextAvailability };
};

const getSortedDoctors = async (
  doctors: Doctor[],
  patientId: string,
  doctorsDb: Connection,
  consultsDb: Connection,
  facilityDistances?: FacilityDistanceMap
) => {
  let sortedDoctors: Doctor[] = doctors;
  let sortedDoctorsNextAvailability: DoctorSlotAvailability[] = [];

  const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
  const consultsRepository = consultsDb.getCustomRepository(AppointmentRepository);

  //get patient and matched doctors previous appointments starts here
  const matchedDoctorIds = doctors.map((doctor) => {
    return doctor.id;
  });

  debugLog(
    'doctorSearchAPILogger',
    `GET_DOCTORS_NEXT_AVAILABILITY___START`,
    'SearchDoctorAndSpecialtyByName_API'
  );
  const doctorNextAvailSlots = await doctorRepository.getDoctorsNextAvailableSlot(
    matchedDoctorIds,
    ConsultMode.BOTH,
    doctorsDb,
    consultsDb
  );
  debugLog(
    'doctorSearchAPILogger',
    `GET_DOCTORS_NEXT_AVAILABILITY___END`,
    'SearchDoctorAndSpecialtyByName_API'
  );

  sortedDoctorsNextAvailability = doctorNextAvailSlots.doctorAvailalbeSlots;

  //apply sort algorithm
  debugLog(
    'doctorSearchAPILogger',
    `APPLY_RANKING_ALGORITHM___START`,
    'SearchDoctorAndSpecialtyByName_API'
  );
  if (doctors.length > 1) {
    //get consult now and book now doctors by available time
    const {
      consultNowDoctors,
      bookNowDoctors,
    } = await doctorRepository.getConsultAndBookNowDoctors(
      doctorNextAvailSlots.doctorAvailalbeSlots,
      doctors
    );

    //apply sort algorithm on ConsultNow doctors
    if (consultNowDoctors.length > 1) {
      //get patient and matched doctors previous appointments starts here
      const consultNowDocIds = consultNowDoctors.map((doctor) => {
        return doctor.id;
      });
      const previousAppointments = await consultsRepository.getPatientAndDoctorsAppointments(
        patientId,
        consultNowDocIds
      );

      const consultedDoctorIds = previousAppointments.map((appt) => {
        return appt.doctorId;
      });
      //get patient and matched doctors previous appointments ends here

      consultNowDoctors.sort((doctorA: Doctor, doctorB: Doctor) => {
        return doctorRepository.sortByRankingAlgorithm(
          doctorA,
          doctorB,
          consultedDoctorIds,
          facilityDistances
        );
      });
    }

    //apply sort algorithm on BookNow doctors
    if (bookNowDoctors.length > 1) {
      //get patient and matched doctors previous appointments starts here
      const consultNowDocIds = bookNowDoctors.map((doctor) => {
        return doctor.id;
      });
      const previousAppointments = await consultsRepository.getPatientAndDoctorsAppointments(
        patientId,
        consultNowDocIds
      );
      const consultedDoctorIds = previousAppointments.map((appt) => {
        return appt.doctorId;
      });
      //get patient and matched doctors previous appointments ends here

      bookNowDoctors.sort((doctorA: Doctor, doctorB: Doctor) => {
        return doctorRepository.sortByRankingAlgorithm(
          doctorA,
          doctorB,
          consultedDoctorIds,
          facilityDistances
        );
      });
    }

    sortedDoctors = consultNowDoctors.concat(bookNowDoctors);
  }
  debugLog(
    'doctorSearchAPILogger',
    `APPLY_RANKING_ALGORITHM___END`,
    'SearchDoctorAndSpecialtyByName_API'
  );

  return { sortedDoctors, sortedDoctorsNextAvailability };
};

export const searchDoctorAndSpecialtyByNameResolvers = {
  Query: {
    SearchDoctorAndSpecialtyByName,
  },
};
