import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { DoctorsServiceContext } from 'doctors-service/doctorsServiceContext';
import { Doctor, DoctorSpecialty } from 'doctors-service/entities/';
import {
  DoctorSlotAvailability,
  Geolocation,
  FacilityDistanceMap,
} from 'doctors-service/resolvers/getDoctorsBySpecialtyAndFilters';
import { DoctorSpecialtyRepository } from 'doctors-service/repositories/doctorSpecialtyRepository';
import { Client, RequestParams } from '@elastic/elasticsearch';
import { differenceInMinutes } from 'date-fns';
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
  let matchedSpecialties: DoctorSpecialty[] = [];
  const searchTextLowerCase = args.searchText.trim().toLowerCase();
  let finalMatchedDoctors = [],
    finalPossibleDoctors = [];
  const facilityIds: string[] = [];
  const facilityLatLongs: number[][] = [];
  const matchedDoctors = [],
    perfectMatchedDoctors = [],
    perfectMatchedDoctorsId = [],
    earlyAvailableApolloMatchedDoctors = [],
    earlyAvailableNonApolloMatchedDoctors = [],
    matchedDoctorsNextAvailability: DoctorSlotAvailability[] = [];
  const possibleDoctors = [],
    earlyAvailableApolloPossibleDoctors = [],
    earlyAvailableNonApolloPossibleDoctors = [],
    possibleSpecialties: DoctorSpecialty[] = [],
    possibleDoctorsNextAvailability: DoctorSlotAvailability[] = [];
  const otherDoctors: Doctor[] = [],
    otherDoctorsNextAvailability: DoctorSlotAvailability[] = [];

  // const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
  const specialtyRepository = doctorsDb.getCustomRepository(DoctorSpecialtyRepository);

  const client = new Client({ node: process.env.ELASTIC_CONNECTION_URL });
  searchLogger(`GET_MATCHED_DOCTORS_AND_SPECIALTIES___START`);
  const PerfectdocSearchParams: RequestParams.Search = {
    index: 'doctors',
    body: {
      size: 1000,
      query: {
        bool: {
          must: [
            { match: { 'doctorSlots.slots.status': 'OPEN' } },
            {
              multi_match: {
                fields: [
                  'fullName',
                  'specialty.name',
                  'specialty.groupName',
                  'specialty.commonSearchTerm',
                  'specialty.userFriendlyNomenclature',
                ],
                type: 'phrase_prefix',
                query: searchTextLowerCase,
              },
            },
          ],
        },
      },
    },
  };
  const responsePerfectMatchDoctors = await client.search(PerfectdocSearchParams);

  for (const doc of responsePerfectMatchDoctors.body.hits.hits) {
    const doctor = doc._source;
    doctor['id'] = doctor.doctorId;
    if (doctor.specialty) {
      doctor.specialty.id = doctor.specialty.specialtyId;
    }
    doctor['activeSlotCount'] = 0;
    doctor['earliestSlotavailableInMinutes'] = 0;
    let bufferTime = 5;
    for (const consultHour of doctor.consultHours) {
      consultHour['id'] = consultHour['consultHoursId'];
      bufferTime = consultHour['consultBuffer'];
    }
    doctor['doctorHospital'] = [];

    for (const slots of doctor.doctorSlots) {
      for (const slot of slots['slots']) {
        if (
          slot.status == 'OPEN' &&
          differenceInMinutes(new Date(slot.slot), callStartTime) > bufferTime
        ) {
          if (doctor['activeSlotCount'] === 0) {
            doctor['earliestSlotavailableInMinutes'] = differenceInMinutes(
              new Date(slot.slot),
              callStartTime
            );
            matchedDoctorsNextAvailability.push({
              availableInMinutes: Math.abs(differenceInMinutes(callStartTime, new Date(slot.slot))),
              physicalSlot: slot.slotType === 'ONLINE' ? '' : slot.slot,
              currentDateTime: callStartTime,
              doctorId: doctor.doctorId,
              onlineSlot: slot.slotType === 'PHYSICAL' ? '' : slot.slot,
              referenceSlot: slot.slot,
            });
          }
          doctor['activeSlotCount'] += 1;
        }
      }
    }
    doctor.facility = Array.isArray(doctor.facility) ? doctor.facility : [doctor.facility];
    for (const facility of doctor.facility) {
      if (facilityIds.indexOf(facility.facilityId) === -1) {
        facilityIds.push(facility.facilityId);
        facilityLatLongs.push([facility.latitude, facility.longitude]);
      }
      doctor['doctorHospital'].push({
        facility: {
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
        },
      });
    }
    if (doctor['activeSlotCount'] > 0) {
      perfectMatchedDoctorsId.push(doctor['id']);
      if (doctor.doctorType === 'STAR_APOLLO') {
        perfectMatchedDoctors.unshift(doctor);
      } else {
        perfectMatchedDoctors.push(doctor);
      }
    }
  }
  const docSearchParams: RequestParams.Search = {
    index: 'doctors',
    body: {
      size: 1000,
      query: {
        bool: {
          must: [
            { match: { 'doctorSlots.slots.status': 'OPEN' } },
            {
              multi_match: {
                fields: [
                  'fullName',
                  'specialty.name',
                  'specialty.groupName',
                  'specialty.commonSearchTerm',
                  'specialty.userFriendlyNomenclature',
                ],
                fuzziness: 'AUTO',
                query: searchTextLowerCase,
              },
            },
          ],
          must_not: [
            {
              ids: { values: perfectMatchedDoctorsId },
            },
          ],
        },
      },
    },
  };
  const responseDoctors = await client.search(docSearchParams);
  for (const doc of responseDoctors.body.hits.hits) {
    const doctor = doc._source;
    doctor['id'] = doctor.doctorId;
    if (doctor.specialty) {
      doctor.specialty.id = doctor.specialty.specialtyId;
    }
    doctor['activeSlotCount'] = 0;
    doctor['earliestSlotavailableInMinutes'] = 0;
    let bufferTime = 5;
    for (const consultHour of doctor.consultHours) {
      consultHour['id'] = consultHour['consultHoursId'];
      bufferTime = consultHour['consultBuffer'];
    }
    doctor['doctorHospital'] = [];

    for (const slots of doctor.doctorSlots) {
      for (const slot of slots['slots']) {
        if (
          slot.status == 'OPEN' &&
          differenceInMinutes(new Date(slot.slot), callStartTime) > bufferTime
        ) {
          if (doctor['activeSlotCount'] === 0) {
            doctor['earliestSlotavailableInMinutes'] = differenceInMinutes(
              new Date(slot.slot),
              callStartTime
            );
            matchedDoctorsNextAvailability.push({
              availableInMinutes: Math.abs(differenceInMinutes(callStartTime, new Date(slot.slot))),
              physicalSlot: slot.slotType === 'ONLINE' ? '' : slot.slot,
              currentDateTime: callStartTime,
              doctorId: doctor.doctorId,
              onlineSlot: slot.slotType === 'PHYSICAL' ? '' : slot.slot,
              referenceSlot: slot.slot,
            });
          }
          doctor['activeSlotCount'] += 1;
        }
      }
    }
    doctor.facility = Array.isArray(doctor.facility) ? doctor.facility : [doctor.facility];
    for (const facility of doctor.facility) {
      if (facilityIds.indexOf(facility.facilityId) === -1) {
        facilityIds.push(facility.facilityId);
        facilityLatLongs.push([facility.latitude, facility.longitude]);
      }
      doctor['doctorHospital'].push({
        facility: {
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
        },
      });
    }
    if (doctor['activeSlotCount'] > 0) {
      if (doctor['earliestSlotavailableInMinutes'] < 241) {
        if (doctor.facility[0].name.includes('Apollo') || doctor.doctorType === 'PAYROLL') {
          if (doctor.doctorType === 'STAR_APOLLO') {
            earlyAvailableApolloMatchedDoctors.unshift(doctor);
          } else {
            earlyAvailableApolloMatchedDoctors.push(doctor);
          }
        } else {
          earlyAvailableNonApolloMatchedDoctors.push(doctor);
        }
      } else {
        if (doctor.doctorType === 'STAR_APOLLO') {
          matchedDoctors.unshift(doctor);
        } else {
          matchedDoctors.push(doctor);
        }
      }
    }
  }
  console.log('earlyAvailableApolloMatchedDoctors', earlyAvailableApolloMatchedDoctors);
  console.log('earlyAvailableNonApolloMatchedDoctors', earlyAvailableNonApolloMatchedDoctors);
  console.log('matchedDoctors', matchedDoctors);
  matchedSpecialties = await specialtyRepository.searchByName(searchTextLowerCase);
  searchLogger(`GET_MATCHED_DOCTORS_AND_SPECIALTIES___END`);

  //fetch possible doctors only if there are not matched doctors and specialties
  if (
    earlyAvailableApolloMatchedDoctors.length === 0 &&
    earlyAvailableNonApolloMatchedDoctors.length === 0 &&
    matchedDoctors.length === 0 &&
    matchedSpecialties.length === 0
  ) {
    const PossibleDoctorParams: RequestParams.Search = {
      index: 'doctors',
      body: {
        size: 200,
        query: {
          bool: {
            must: [
              {
                match: {
                  'doctorSlots.slots.status': 'OPEN',
                },
              },
            ],
          },
        },
      },
    };
    const responsePossibleDoctors = await client.search(PossibleDoctorParams);
    for (const doc of responsePossibleDoctors.body.hits.hits) {
      const doctor = doc._source;
      doctor['id'] = doctor.doctorId;
      doctor['doctorHospital'] = [];
      doctor['activeSlotCount'] = 0;
      doctor['earliestSlotavailableInMinutes'] = 0;
      let bufferTime = 5;
      for (const consultHour of doctor.consultHours) {
        consultHour['id'] = consultHour['consultHoursId'];
        bufferTime = consultHour['consultBuffer'];
      }
      if (doctor.specialty) {
        doctor.specialty.id = doctor.specialty.specialtyId;
      }
      for (const slots of doctor.doctorSlots) {
        for (const slot of slots['slots']) {
          if (
            slot.status == 'OPEN' &&
            differenceInMinutes(new Date(slot.slot), callStartTime) > bufferTime
          ) {
            if (doctor['activeSlotCount'] === 0) {
              doctor['earliestSlotavailableInMinutes'] = differenceInMinutes(
                new Date(slot.slot),
                callStartTime
              );
              possibleDoctorsNextAvailability.push({
                availableInMinutes: Math.abs(
                  differenceInMinutes(callStartTime, new Date(slot.slot))
                ),
                physicalSlot: slot.slotType === 'ONLINE' ? '' : slot.slot,
                currentDateTime: callStartTime,
                doctorId: doctor.doctorId,
                onlineSlot: slot.slotType === 'PHYSICAL' ? '' : slot.slot,
                referenceSlot: slot.slot,
              });
            }
            doctor['activeSlotCount'] += 1;
          }
        }
      }
      doctor.facility = Array.isArray(doctor.facility) ? doctor.facility : [doctor.facility];
      for (const facility of doctor.facility) {
        if (facilityIds.indexOf(facility.facilityId) === -1) {
          facilityIds.push(facility.facilityId);
          facilityLatLongs.push([facility.latitude, facility.longitude]);
        }
        doctor['doctorHospital'].push({
          facility: {
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
          },
        });
      }
      if (doctor['activeSlotCount'] > 0) {
        if (doctor['earliestSlotavailableInMinutes'] < 241) {
          if (doctor.facility[0].name.includes('Apollo') || doctor.doctorType === 'PAYROLL') {
            if (doctor.doctorType === 'STAR_APOLLO') {
              earlyAvailableApolloPossibleDoctors.unshift(doctor);
            } else {
              earlyAvailableApolloPossibleDoctors.push(doctor);
            }
          } else {
            earlyAvailableNonApolloPossibleDoctors.push(doctor);
          }
        } else {
          if (doctor.doctorType === 'STAR_APOLLO') {
            possibleDoctors.unshift(doctor);
          } else {
            possibleDoctors.push(doctor);
          }
        }
      }
    }
  }

  finalMatchedDoctors = perfectMatchedDoctors
    .concat(
      earlyAvailableApolloMatchedDoctors.sort(
        (a, b) =>
          parseFloat(a.earliestSlotavailableInMinutes) -
          parseFloat(b.earliestSlotavailableInMinutes)
      )
    )
    .concat(
      earlyAvailableNonApolloMatchedDoctors.sort(
        (a, b) =>
          parseFloat(a.earliestSlotavailableInMinutes) -
          parseFloat(b.earliestSlotavailableInMinutes)
      )
    )
    .concat(
      matchedDoctors.sort(
        (a, b) =>
          parseFloat(a.earliestSlotavailableInMinutes) -
          parseFloat(b.earliestSlotavailableInMinutes)
      )
    );

  finalPossibleDoctors = earlyAvailableApolloPossibleDoctors
    .sort(
      (a, b) =>
        parseFloat(a.earliestSlotavailableInMinutes) - parseFloat(b.earliestSlotavailableInMinutes)
    )
    .concat(
      earlyAvailableNonApolloPossibleDoctors.sort(
        (a, b) =>
          parseFloat(a.earliestSlotavailableInMinutes) -
          parseFloat(b.earliestSlotavailableInMinutes)
      )
    )
    .concat(
      possibleDoctors.sort(
        (a, b) =>
          parseFloat(a.earliestSlotavailableInMinutes) -
          parseFloat(b.earliestSlotavailableInMinutes)
      )
    );

  searchLogger(`API_CALL___END`);
  return {
    doctors: finalMatchedDoctors,
    doctorsNextAvailability: matchedDoctorsNextAvailability,
    specialties: matchedSpecialties,
    possibleMatches: {
      doctors: finalPossibleDoctors,
      doctorsNextAvailability: possibleDoctorsNextAvailability,
      specialties: possibleSpecialties,
    },
    otherDoctors: otherDoctors,
    otherDoctorsNextAvailability: otherDoctorsNextAvailability,
  };
};

export const searchDoctorAndSpecialtyByNameResolvers = {
  Query: {
    SearchDoctorAndSpecialtyByName,
  },
};
