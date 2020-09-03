import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { DoctorsServiceContext } from 'doctors-service/doctorsServiceContext';
import { Doctor, DoctorSpecialty, DoctorType } from 'doctors-service/entities/';
import {
  DoctorSlotAvailability,
  Geolocation,
} from 'doctors-service/resolvers/getDoctorsBySpecialtyAndFilters';
import { Client, RequestParams } from '@elastic/elasticsearch';
import { differenceInMinutes } from 'date-fns';
import { debugLog } from 'customWinstonLogger';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { AphError } from 'AphError';

const ES_FIELDS_PRIORITY = {
  doctor_fullName: 5,
  speciality_name: 4,
  speciality_groupName: 3,
  speciality_commonSearchTerm: 2,
  speciality_userFriendlyNomenclature: 1,
};

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
      city: String
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
  {
    searchText: string;
    city: string;
    patientId: string;
    geolocation: Geolocation;
    pincode: string;
  },
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

  // const specialtyRepository = doctorsDb.getCustomRepository(DoctorSpecialtyRepository);
  const client = new Client({ node: process.env.ELASTIC_CONNECTION_URL });
  searchLogger(`GET_MATCHED_DOCTORS_AND_SPECIALTIES___START`);

  if (!process.env.ELASTIC_INDEX_DOCTORS) {
    throw new AphError(AphErrorMessages.ELASTIC_INDEX_NAME_MISSING);
  }

  let PerfectdocSearchParams: RequestParams.Search = {
    index: process.env.ELASTIC_INDEX_DOCTORS,
    body: {
      size: 100,
      query: {
        bool: {
          must: [
            { match: { 'doctorSlots.slots.status': 'OPEN' } },
            { match: { isSearchable: true } },
            { query_string: {
              fuzziness: 'AUTO',
              query: `*${searchTextLowerCase}*`,
                fields: [
                  `fullName^${ES_FIELDS_PRIORITY.doctor_fullName}`,
                  `specialty.name^${ES_FIELDS_PRIORITY.speciality_name}`,
                  `specialty.groupName^${ES_FIELDS_PRIORITY.speciality_groupName}`,
                  `specialty.commonSearchTerm^${ES_FIELDS_PRIORITY.speciality_commonSearchTerm}`,
                  `specialty.userFriendlyNomenclature^${ES_FIELDS_PRIORITY.speciality_userFriendlyNomenclature}`,
                ],
              }
            },
          ],
        },
      },
    },
  };

  if (args.city && args.city != '' && args.searchText != '') {
    PerfectdocSearchParams = {
      index: process.env.ELASTIC_INDEX_DOCTORS,
      body: {
        size: 100,
        query: {
          bool: {
            must: [
              { match: { 'doctorSlots.slots.status': 'OPEN' } },
              { match: { 'facility.city': args.city } },
              { match: { isSearchable: true } },
              { query_string: {
                fuzziness: 'AUTO',
                query: `*${searchTextLowerCase}*`,
                  fields: [
                    `fullName^${ES_FIELDS_PRIORITY.doctor_fullName}`,
                    `specialty.name^${ES_FIELDS_PRIORITY.speciality_name}`,
                    `specialty.groupName^${ES_FIELDS_PRIORITY.speciality_groupName}`,
                    `specialty.commonSearchTerm^${ES_FIELDS_PRIORITY.speciality_commonSearchTerm}`,
                    `specialty.userFriendlyNomenclature^${ES_FIELDS_PRIORITY.speciality_userFriendlyNomenclature}`,
                  ],
                }
              },
            ],
          },
        },
      },
    };
  }

  if (args.city && args.city != '' && args.searchText == '') {
    const PerfectdocCitySearchParams: RequestParams.Search = {
      index: process.env.ELASTIC_INDEX_DOCTORS,
      body: {
        size: 100,
        query: {
          bool: {
            must: [
              { match: { 'doctorSlots.slots.status': 'OPEN' } },
              { match: { isSearchable: true } },
              {
                multi_match: {
                  fields: ['facility.city'],
                  type: 'phrase_prefix',
                  query: args.city,
                },
              },
            ],
          },
        },
      },
    };
    PerfectdocSearchParams = PerfectdocCitySearchParams;
  }
  const responsePerfectMatchDoctors = await client.search(PerfectdocSearchParams);
  //console.log(responsePerfectMatchDoctors.body.hits.hits, 'city hits');
  for (const doc of responsePerfectMatchDoctors.body.hits.hits) {
    const doctor = doc._source;
    doctor['id'] = doctor.doctorId;
    if (doctor.specialty) {
      doctor.specialty.id = doctor.specialty.specialtyId;
    }
    if (doctor['languages'] instanceof Array) {
      doctor['languages'] = doctor['languages'].join(', ');
    }
    if (doctor['physicalConsultationFees'] === 0) {
      doctor['physicalConsultationFees'] = doctor['onlineConsultationFees'];
    }
    if (doctor['onlineConsultationFees'] === 0) {
      doctor['onlineConsultationFees'] = doctor['physicalConsultationFees'];
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
      if (doctor.doctorType === DoctorType.STAR_APOLLO) {
        perfectMatchedDoctors.unshift(doctor);
      } else {
        perfectMatchedDoctors.push(doctor);
      }
    }
  }
  const docSearchParams: RequestParams.Search = {
    index: process.env.ELASTIC_INDEX_DOCTORS,
    body: {
      size: 1000,
      query: {
        bool: {
          must: [
            { match: { 'doctorSlots.slots.status': 'OPEN' } },
            { match: { isSearchable: true } },
            { query_string: {
              fuzziness: 'AUTO',
              query: `*${searchTextLowerCase}*`,
                fields: [
                  `fullName^${ES_FIELDS_PRIORITY.doctor_fullName}`,
                  `specialty.name^${ES_FIELDS_PRIORITY.speciality_name}`,
                  `specialty.groupName^${ES_FIELDS_PRIORITY.speciality_groupName}`,
                  `specialty.commonSearchTerm^${ES_FIELDS_PRIORITY.speciality_commonSearchTerm}`,
                  `specialty.userFriendlyNomenclature^${ES_FIELDS_PRIORITY.speciality_userFriendlyNomenclature}`,
                ],
              }
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
    if (doctor['languages'] instanceof Array) {
      doctor['languages'] = doctor['languages'].join(', ');
    }
    if (doctor['physicalConsultationFees'] === 0) {
      doctor['physicalConsultationFees'] = doctor['onlineConsultationFees'];
    }
    if (doctor['onlineConsultationFees'] === 0) {
      doctor['onlineConsultationFees'] = doctor['physicalConsultationFees'];
    }
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
        if (doctor.facility[0].name.includes('Apollo') || doctor.doctorType === DoctorType.APOLLO) {
          earlyAvailableApolloMatchedDoctors.push(doctor);
        } else {
          earlyAvailableNonApolloMatchedDoctors.push(doctor);
        }
      } else {
        matchedDoctors.push(doctor);
      }
    }
  }
  const elasticMatch = [];
  elasticMatch.push({ match: { 'doctorSlots.slots.status': 'OPEN' } });
  elasticMatch.push({ match: { isSearchable: true } });
  elasticMatch.push({
    multi_match: {
      fields: ['specialty.name'],
      type: 'phrase_prefix',
      query: searchTextLowerCase,
    },
  });
  if (args.city) {
    elasticMatch.push({ match: { 'facility.city': args.city } });
  }

  const specialtiesSearchParams: RequestParams.Search = {
    index: process.env.ELASTIC_INDEX_DOCTORS,
    body: {
      _source: ['specialty'],
      query: {
        bool: {
          must: elasticMatch,
        },
      },
      size: 0,
      aggs: {
        matched_specialities: {
          terms: {
            field: 'specialty.name.keyword',
            size: 1000,
          },
          aggs: {
            matched_specialities_hits: {
              top_hits: {
                sort: [
                  {
                    _score: {
                      order: 'desc',
                    },
                  },
                ],
                _source: ['specialty'],
                size: 1,
              },
            },
          },
        },
      },
    },
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let matchedSpecialtiesES: any = await client.search(specialtiesSearchParams);
  const specialityBuckets = matchedSpecialtiesES.body.aggregations.matched_specialities.buckets;

  if (specialityBuckets && specialityBuckets.length) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    matchedSpecialtiesES = specialityBuckets.map((speciality: any) => {
      speciality = speciality.matched_specialities_hits.hits.hits[0]['_source']['specialty'];
      if (!speciality['id']) {
        speciality['id'] = speciality['specialtyId'];
      }
      return speciality;
    });
  } else {
    matchedSpecialtiesES = specialityBuckets;
  }

  matchedSpecialties = matchedSpecialtiesES;

  searchLogger(`GET_MATCHED_DOCTORS_AND_SPECIALTIES___END`);

  //fetch possible doctors only if there are not matched doctors and specialties
  if (
    earlyAvailableApolloMatchedDoctors.length === 0 &&
    earlyAvailableNonApolloMatchedDoctors.length === 0 &&
    perfectMatchedDoctors.length === 0 &&
    matchedDoctors.length === 0 &&
    matchedSpecialties.length === 0
  ) {

    const PossibleDoctorParams: RequestParams.Search = {
      index: process.env.ELASTIC_INDEX_DOCTORS,
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
              { match: { isSearchable: true } },
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
      if (doctor['languages'] instanceof Array) {
        doctor['languages'] = doctor['languages'].join(', ');
      }
      if (doctor['physicalConsultationFees'] === 0) {
        doctor['physicalConsultationFees'] = doctor['onlineConsultationFees'];
      }
      if (doctor['onlineConsultationFees'] === 0) {
        doctor['onlineConsultationFees'] = doctor['physicalConsultationFees'];
      }
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
          if (doctor.facility[0].name.includes('Apollo') || doctor.doctorType === DoctorType.APOLLO) {
            earlyAvailableApolloPossibleDoctors.push(doctor);
          } else {
            earlyAvailableNonApolloPossibleDoctors.push(doctor);
          }
        } else {
          if (doctor.doctorType === DoctorType.STAR_APOLLO) {
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
