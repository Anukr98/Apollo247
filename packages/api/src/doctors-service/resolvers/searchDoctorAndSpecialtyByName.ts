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
import { Client, RequestParams, ApiResponse } from '@elastic/elasticsearch';
import { ApiConstants } from 'ApiConstants';
import { differenceInMinutes } from 'date-fns';
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
  let matchedDoctors = [],
    matchedSpecialties: DoctorSpecialty[] = [],
    matchedDoctorsNextAvailability: DoctorSlotAvailability[] = [];
  let possibleDoctors = [],
    possibleSpecialties: DoctorSpecialty[] = [],
    possibleDoctorsNextAvailability: DoctorSlotAvailability[] = [];
  let otherDoctors: Doctor[] = [],
    otherDoctorsNextAvailability: DoctorSlotAvailability[] = [];

  try {
    // const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
    const specialtyRepository = doctorsDb.getCustomRepository(DoctorSpecialtyRepository);

    //get facility distances from user geolocation
    // let facilityDistances: FacilityDistanceMap = {};
    // if (args.geolocation) {
    //   searchLogger('GEOLOCATION_API_CALL___START');
    //   const facilityRepo = doctorsDb.getCustomRepository(FacilityRepository);
    //   facilityDistances = await facilityRepo.getAllFacilityDistances(args.geolocation);
    //   searchLogger('GEOLOCATION_API_CALL___END');
    // }
    const client = new Client({ node: process.env.ELASTIC_CONNECTION_URL });
    searchLogger(`GET_MATCHED_DOCTORS_AND_SPECIALTIES___START`);
    console.log(searchTextLowerCase)
    // matchedDoctors = await doctorRepository.searchByName(searchTextLowerCase, pincodeCity);
    const docSearchParams: RequestParams.Search = {
      index: 'doctors',
      type: 'posts',
      body: {
        query: {
          bool: {
            must: [
              {
                match: { 'fullName': searchTextLowerCase + '*' },
              },
            ],
          },
        },
      },
    };
    console.log(docSearchParams, "params");
    const responseDoctors = await client.search(docSearchParams);
    console.log(responseDoctors);
    for (const doc of responseDoctors.body.hits.hits) {
      const doctor = doc._source;
      doctor["id"] = doctor.doctorId;
      doctor["doctorHospital"] = []
      for (const facility of doctor.facility) {
        doctor["doctorHospital"].push(
          {
            "facility": {
              name: facility.name,
              facilityType: facility.facilityType,
              streetLine1: facility.streetLine1,
              streetLine2: facility.streetLine2,
              streetLine3: facility.streetLine3,
              city: facility.city,
              state: facility.state,
              zipcode: facility.zipcode,
              imageUrl: facility.imageUrl,
              latitude: facility.latitude,
              longitude: facility.longitude,
              country: facility.country,
              id: facility.facilityId,
            }
          }
        )
      }
      for (let slots of doctor.doctorSlots) {
        for (let slot of slots['slots']) {
          if (slot.status == "OPEN") {
            console.log(slot.status);
            matchedDoctorsNextAvailability.push(
              {
                "availableInMinutes": Math.abs(differenceInMinutes(new Date(), new Date(slot.slot))),
                "physicalSlot": slot.slotType === "ONLINE" ? "" : slot.slot,
                "currentDateTime": new Date(),
                "doctorId": doctor.doctorId,
                "onlineSlot": slot.slot,
                "referenceSlot": slot.slot
              }
            );
            break;
          }
        }
      }
      matchedDoctors.push(doctor);
    }
    matchedSpecialties = await specialtyRepository.searchByName(searchTextLowerCase);
    searchLogger(`GET_MATCHED_DOCTORS_AND_SPECIALTIES___END`);

    //fetch possible doctors only if there are not matched doctors and specialties
    if (matchedDoctors.length === 0 && matchedSpecialties.length === 0) {
      const PossibleDoctorParams: RequestParams.Search = {
        index: 'doctors',
        type: 'posts',
        body: {
          query: {
            bool: {
              must: [
                {
                  match: { "fullName": "*" },
                }
              ],
            },
          },
        },
      };
      const responsePossibleDoctors = await client.search(PossibleDoctorParams);
      for (const doc of responsePossibleDoctors.body.hits.hits) {
        const doctor = doc._source;
        doctor["id"] = doctor.doctorId;
        doctor["doctorHospital"] = []
        for (const facility of doctor.facility) {
          doctor["doctorHospital"].push(
            {
              "facility": {
                name: facility.name,
                facilityType: facility.facilityType,
                streetLine1: facility.streetLine1,
                streetLine2: facility.streetLine2,
                streetLine3: facility.streetLine3,
                city: facility.city,
                state: facility.state,
                zipcode: facility.zipcode,
                imageUrl: facility.imageUrl,
                latitude: facility.latitude,
                longitude: facility.longitude,
                country: facility.country,
                id: facility.facilityId,
              }
            }
          )
        }
        for (let slots of doctor.doctorSlots) {
          for (let slot of slots['slots']) {
            if (slot.status == "OPEN") {
              console.log(slot.status);
              possibleDoctorsNextAvailability.push(
                {
                  "availableInMinutes": Math.abs(differenceInMinutes(new Date(), new Date(slot.slot))),
                  "physicalSlot": slot.slotType === "ONLINE" ? "" : slot.slot,
                  "currentDateTime": new Date(),
                  "doctorId": doctor.doctorId,
                  "onlineSlot": slot.slot,
                  "referenceSlot": slot.slot
                }
              );
              break;
            }
          }
        }
        possibleDoctors.push(doctor);
      }

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
