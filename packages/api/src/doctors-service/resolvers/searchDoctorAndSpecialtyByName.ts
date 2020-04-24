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
      pincode: String
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

let apiCallId: number;
let identifier: string;
let callStartTime: Date;
const SearchDoctorAndSpecialtyByName: Resolver<
  null,
  { searchText: string; patientId: string; geolocation: Geolocation; pincode: string },
  DoctorsServiceContext,
  SearchDoctorAndSpecialtyByNameResult
> = async (parent, args, { doctorsDb, consultsDb }) => {
  apiCallId = Math.floor(Math.random() * 1000000);
  callStartTime = new Date();
  identifier = args.searchText;
  //create first order curried method with first 4 static parameters being passed.
  const searchLogger = debugLog(
    'doctorSearchAPILogger',
    'SearchDoctorAndSpecialtyByName',
    apiCallId,
    callStartTime,
    identifier
  );

  searchLogger('API_CALL___STARTED');
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
      searchLogger('GEOLOCATION_API_CALL___START');
      const facilityRepo = doctorsDb.getCustomRepository(FacilityRepository);
      facilityDistances = await facilityRepo.getAllFacilityDistances(args.geolocation);
      searchLogger('GEOLOCATION_API_CALL___END');
    }

    searchLogger(`GET_MATCHED_DOCTORS_AND_SPECIALTIES___START`);
    let pincodeCity = '';
    if (args.pincode) {
      const pincodeCityDetails = await doctorRepository.getCityMappingPincode(args.pincode);
      if (pincodeCityDetails) pincodeCity = pincodeCityDetails.city;
    }
    matchedDoctors = await doctorRepository.searchByName(searchTextLowerCase, pincodeCity);
    matchedSpecialties = await specialtyRepository.searchByName(searchTextLowerCase);
    searchLogger(`GET_MATCHED_DOCTORS_AND_SPECIALTIES___END`);

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
    const otherDoctorIds = matchedDoctors.map((doctor) => {
      return doctor.id;
    });
    const matchedDoctorsOrder: Doctor[] = [];
    const matchedEmptyDoctorsOrder: Doctor[] = [];
    const matchedDoctorsNextAvailabilityOrder: DoctorSlotAvailability[] = [];
    const matchedEmptyDoctorsNextAvailabilityOrder: DoctorSlotAvailability[] = [];
    matchedDoctorsNextAvailability.map((docSlot) => {
      const docIndex = otherDoctorIds.indexOf(docSlot.doctorId);
      if (docSlot.referenceSlot != '') {
        matchedDoctorsOrder.push(matchedDoctors[docIndex]);
        matchedDoctorsNextAvailabilityOrder.push(docSlot);
      } else {
        matchedEmptyDoctorsOrder.push(matchedDoctors[docIndex]);
        matchedEmptyDoctorsNextAvailabilityOrder.push(docSlot);
      }
    });
    console.log(matchedEmptyDoctorsOrder.length, matchedDoctorsOrder.length);
    matchedDoctors = matchedDoctorsOrder.concat(matchedEmptyDoctorsOrder);
    matchedDoctorsNextAvailability = matchedDoctorsNextAvailabilityOrder.concat(
      matchedEmptyDoctorsNextAvailabilityOrder
    );
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
      const otherDoctorIds = otherDoctors.map((doctor) => {
        return doctor.id;
      });
      const otherDoctorsOrder: Doctor[] = [];
      const otherEmptyDoctorsOrder: Doctor[] = [];
      const otherDoctorsNextAvailabilityOrder: DoctorSlotAvailability[] = [];
      const otherEmptyDoctorsNextAvailabilityOrder: DoctorSlotAvailability[] = [];
      otherDoctorsNextAvailability.map((docSlot) => {
        const docIndex = otherDoctorIds.indexOf(docSlot.doctorId);
        if (docSlot.referenceSlot != '') {
          otherDoctorsOrder.push(otherDoctors[docIndex]);
          otherDoctorsNextAvailabilityOrder.push(docSlot);
        } else {
          otherEmptyDoctorsOrder.push(otherDoctors[docIndex]);
          otherEmptyDoctorsNextAvailabilityOrder.push(docSlot);
        }
      });
      otherDoctors = otherDoctorsOrder.concat(otherEmptyDoctorsOrder);
      otherDoctorsNextAvailability = otherDoctorsNextAvailabilityOrder.concat(
        otherEmptyDoctorsNextAvailabilityOrder
      );
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
      const possibleDoctorIds = possibleDoctors.map((doctor) => {
        return doctor.id;
      });
      const possibleDoctorsOrder: Doctor[] = [];
      const possibleEmptyDoctorsOrder: Doctor[] = [];
      const possibleDoctorsNextAvailabilityOrder: DoctorSlotAvailability[] = [];
      const possibleEmptyDoctorsNextAvailabilityOrder: DoctorSlotAvailability[] = [];
      possibleDoctorsNextAvailability.map((docSlot) => {
        const docIndex = possibleDoctorIds.indexOf(docSlot.doctorId);
        if (docSlot.referenceSlot != '') {
          possibleDoctorsOrder.push(possibleDoctors[docIndex]);
          possibleDoctorsNextAvailabilityOrder.push(docSlot);
        } else {
          possibleEmptyDoctorsOrder.push(possibleDoctors[docIndex]);
          possibleEmptyDoctorsNextAvailabilityOrder.push(docSlot);
        }
      });
      possibleDoctors = possibleDoctorsOrder.concat(possibleEmptyDoctorsOrder);
      possibleDoctorsNextAvailability = possibleDoctorsNextAvailabilityOrder.concat(
        possibleEmptyDoctorsNextAvailabilityOrder
      );
    }
  } catch (searchError) {
    throw new AphError(AphErrorMessages.SEARCH_DOCTOR_ERROR, undefined, { searchError });
  }

  searchLogger(`API_CALL___END`);

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
    allPossibleDoctors = await doctorRepository.searchByName('', '');
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
  //create first order curried method with first 4 static parameters being passed.
  const searchLogger = debugLog(
    'doctorSearchAPILogger',
    'SearchDoctorAndSpecialtyByName',
    apiCallId,
    callStartTime,
    identifier
  );

  let sortedDoctors: Doctor[] = doctors;
  let sortedDoctorsNextAvailability: DoctorSlotAvailability[] = [];

  const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
  const consultsRepository = consultsDb.getCustomRepository(AppointmentRepository);

  //get patient and matched doctors previous appointments starts here
  const matchedDoctorIds = doctors.map((doctor) => {
    return doctor.id;
  });

  searchLogger(`GET_DOCTORS_NEXT_AVAILABILITY___START`);
  const doctorNextAvailSlots = await doctorRepository.getDoctorsNextAvailableSlot(
    matchedDoctorIds,
    ConsultMode.BOTH,
    doctorsDb,
    consultsDb
  );
  searchLogger(`GET_DOCTORS_NEXT_AVAILABILITY___END`);

  sortedDoctorsNextAvailability = doctorNextAvailSlots.doctorAvailalbeSlots;
  //apply sort algorithm
  searchLogger(`APPLY_RANKING_ALGORITHM___START`);
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
  searchLogger(`APPLY_RANKING_ALGORITHM___END`);

  return { sortedDoctors, sortedDoctorsNextAvailability };
};

export const searchDoctorAndSpecialtyByNameResolvers = {
  Query: {
    SearchDoctorAndSpecialtyByName,
  },
};
