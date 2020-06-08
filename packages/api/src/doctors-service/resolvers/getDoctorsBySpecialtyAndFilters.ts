import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { DoctorsServiceContext } from 'doctors-service/doctorsServiceContext';
import {
  Doctor,
  DoctorSpecialty,
  ConsultMode,
  SpecialtySearchType,
  DOCTOR_ONLINE_STATUS,
} from 'doctors-service/entities/';
import { Client, RequestParams } from '@elastic/elasticsearch';
import { differenceInMinutes } from 'date-fns';

import { ApiConstants } from 'ApiConstants';
import { debugLog } from 'customWinstonLogger';
import { distanceBetweenTwoLatLongInMeters } from 'helpers/distanceCalculator';

export const getDoctorsBySpecialtyAndFiltersTypeDefs = gql`
  enum SpecialtySearchType {
    ID
    NAME
  }

  type FilterDoctorsResult {
    doctors: [DoctorDetails]
    doctorsNextAvailability: [DoctorSlotAvailability]
    doctorsAvailability: [DoctorConsultModeAvailability]
    specialty: DoctorSpecialty
    sort: String
  }
  type DoctorSlotAvailability {
    doctorId: String
    onlineSlot: String
    physicalSlot: String
    referenceSlot: String
    currentDateTime: Date
    availableInMinutes: Int
  }
  type DoctorConsultModeAvailability {
    doctorId: ID
    availableModes: [ConsultMode]
  }
  input Range {
    minimum: Int
    maximum: Int
  }

  input FilterDoctorInput {
    patientId: ID
    specialty: ID
    specialtySearchType: SpecialtySearchType
    specialtyName: [String]
    city: [String]
    experience: [Range]
    availability: [String]
    availableNow: String
    fees: [Range]
    gender: [Gender]
    language: [String]
    geolocation: Geolocation
    consultMode: ConsultMode
    pincode: String
    sort: String
  }
  extend type Query {
    getDoctorsBySpecialtyAndFilters(filterInput: FilterDoctorInput): FilterDoctorsResult
  }
`;

type FilterDoctorsResult = {
  doctors: Doctor[];
  doctorsNextAvailability: DoctorSlotAvailability[];
  doctorsAvailability: DoctorConsultModeAvailability[];
  specialty?: DoctorSpecialty;
  sort: string;
};

export type DoctorConsultModeAvailability = {
  doctorId: string;
  availableModes: ConsultMode[];
};
export type Range = {
  minimum: number;
  maximum: number;
};

export type Geolocation = {
  latitude: number;
  longitude: number;
};

export type FilterDoctorInput = {
  patientId: string;
  specialty: string;
  specialtySearchType: SpecialtySearchType;
  specialtyName: string[];
  city: string[];
  experience: Range[];
  availability: string[];
  availableNow: string;
  fees: Range[];
  gender: string[];
  language: string[];
  geolocation: Geolocation;
  consultMode: ConsultMode;
  pincode: string;
  sort: string;
};

export type ConsultModeAvailability = {
  onlineSlots: number;
  physicalSlots: number;
  bothSlots: number;
};
export type DateAvailability = { [index: string]: ConsultModeAvailability };
export type DoctorAvailability = { [index: string]: DateAvailability };
export type AppointmentDateTime = { startDateTime: Date; endDateTime: Date };
export type DoctorsObject = { [index: string]: Doctor };

export type DoctorSlotAvailability = {
  doctorId: string;
  onlineSlot: string;
  physicalSlot: string;
  referenceSlot: string;
  currentDateTime: Date;
  availableInMinutes: number;
};

export type DoctorSlotAvailabilityObject = { [index: string]: DoctorSlotAvailability };

export type FacilityDistanceMap = { [index: string]: string };

let apiCallId: number;
let identifier: string;
let callStartTime: Date;
const getDoctorsBySpecialtyAndFilters: Resolver<
  null,
  { filterInput: FilterDoctorInput },
  DoctorsServiceContext,
  FilterDoctorsResult
> = async (parent, args, {}) => {
  apiCallId = Math.floor(Math.random() * 1000000);
  callStartTime = new Date();
  identifier = args.filterInput.patientId;
  //create first order curried method with first 4 static parameters being passed.
  const searchLogger = debugLog(
    'doctorSearchAPILogger',
    'getDoctorsBySpecialtyAndFilters',
    apiCallId,
    callStartTime,
    identifier
  );
  const facilityDistances: FacilityDistanceMap = {};
  searchLogger(`API_CALL___START`);

  const finalDoctorNextAvailSlots: DoctorSlotAvailability[] = [],
    finalDoctorsConsultModeAvailability: DoctorConsultModeAvailability[] = [];
  let finalSpecialtyDetails;
  let doctors = [];
  const finalSpecialityDetails = [];
  const elasticMatch = [];
  const earlyAvailableApolloDoctors = [],
    earlyAvailableNonApolloDoctors = [],
    docs = [];
  let earlyAvailableStarApolloDoctors = [],
    earlyAvailableNonStarApolloDoctors = [],
    starDoctor = [],
    nonStarDoctor = [];

  const facilityIds: string[] = [];
  const facilityLatLongs: number[][] = [];
  args.filterInput.sort = args.filterInput.sort || 'availablity';
  const minsForSort = args.filterInput.sort == 'distance' ? 2881 : 241;
  elasticMatch.push({ match: { 'doctorSlots.slots.status': 'OPEN' } });

  if (args.filterInput.specialtyName && args.filterInput.specialtyName.length > 0) {
    elasticMatch.push({ match: { 'specialty.name': args.filterInput.specialtyName.join(',') } });
  }
  if (args.filterInput.specialty) {
    elasticMatch.push({ match_phrase: { 'specialty.specialtyId': args.filterInput.specialty } });
  }
  if (
    (!args.filterInput.specialtyName || args.filterInput.specialtyName.length === 0) &&
    !args.filterInput.specialty
  ) {
    elasticMatch.push({ match: { 'specialty.name': ApiConstants.GENERAL_PHYSICIAN.toString() } });
  }
  if (args.filterInput.experience && args.filterInput.experience.length > 0) {
    let elasticExperience: { [index: string]: any } = [];
    args.filterInput.experience.forEach((experience) => {
      elasticExperience.push({
        range: { experience: { gte: experience.minimum, lte: experience.maximum } },
      });
    });
    if (elasticExperience.length > 0) {
      elasticMatch.push({ bool: { should: elasticExperience } });
    }
  }
  if (args.filterInput.fees && args.filterInput.fees.length > 0) {
    let elasticFee: { [index: string]: any } = [];
    args.filterInput.fees.forEach((fee) => {
      elasticFee.push({
        range: { onlineConsultationFees: { gte: fee.minimum, lte: fee.maximum } },
      });
    });
    if (elasticFee.length > 0) {
      elasticMatch.push({ bool: { should: elasticFee } });
    }
  }
  if (args.filterInput.gender && args.filterInput.gender.length > 0) {
    elasticMatch.push({ match: { gender: args.filterInput.gender.join(',') } });
  }
  if (args.filterInput.language && args.filterInput.language.length > 0) {
    args.filterInput.language.forEach((language) => {
      elasticMatch.push({ match: { languages: language } });
    });
  }

  const searchParams: RequestParams.Search = {
    index: 'doctors',
    body: {
      size: 1000,
      query: {
        bool: {
          must: elasticMatch,
        },
      },
    },
  };
  const client = new Client({ node: process.env.ELASTIC_CONNECTION_URL });
  const getDetails = await client.search(searchParams);

  for (const doc of getDetails.body.hits.hits) {
    const doctor = doc._source;
    doctor['id'] = doctor.doctorId;
    doctor['onlineStatus'] = DOCTOR_ONLINE_STATUS.ONLINE;
    doctor['doctorHospital'] = [];
    doctor['openSlotDates'] = [];
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
    for (const slots of doc._source.doctorSlots) {
      for (const slot of slots['slots']) {
        if (
          slot.status == 'OPEN' &&
          differenceInMinutes(new Date(slot.slot), callStartTime) > bufferTime
        ) {
          doctor['openSlotDates'].push(slots.slotDate);
          if (doctor['activeSlotCount'] === 0) {
            doctor['earliestSlotavailableInMinutes'] = differenceInMinutes(
              new Date(slot.slot),
              callStartTime
            );
            doctor['earliestSlotavailable'] = new Date(slot.slot);
            finalDoctorNextAvailSlots.push({
              availableInMinutes: Math.abs(differenceInMinutes(callStartTime, new Date(slot.slot))),
              physicalSlot: slot.slotType === 'ONLINE' ? '' : slot.slot,
              currentDateTime: callStartTime,
              doctorId: doc._source.doctorId,
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

    let availability = true;
    if (
      (args.filterInput.availability && args.filterInput.availability.length > 0) ||
      args.filterInput.availableNow
    ) {
      availability = false;
    }
    if (args.filterInput.availability && args.filterInput.availability.length > 0) {
      availability =
        args.filterInput.availability.filter(
          (value) => -1 !== doctor['openSlotDates'].indexOf(value)
        ).length > 0;
    }
    if (
      args.filterInput.availableNow &&
      Math.abs(
        differenceInMinutes(
          new Date(doctor['earliestSlotavailable']),
          new Date(args.filterInput.availableNow)
        )
      ) < 241
    ) {
      availability = true;
    }
    if (doctor['activeSlotCount'] > 0 && availability) {
      if (doctor['earliestSlotavailableInMinutes'] < minsForSort) {
        if (doctor.facility[0].name.includes('Apollo') || doctor.doctorType === 'PAYROLL') {
          if (doctor.doctorType === 'STAR_APOLLO') {
            earlyAvailableStarApolloDoctors.push(doctor);
          } else {
            earlyAvailableNonStarApolloDoctors.push(doctor);
          }
        } else {
          earlyAvailableNonApolloDoctors.push(doctor);
        }
      } else {
        if (doctor.doctorType === 'STAR_APOLLO') {
          starDoctor.push(doctor);
        } else {
          nonStarDoctor.push(doctor);
        }
      }
      finalDoctorsConsultModeAvailability.push({
        availableModes: [doctor.consultHours[0].consultMode],
        doctorId: doctor.doctorId,
      });
      finalSpecialityDetails.push(doctor.specialty);
    }
  }
  if (args.filterInput.geolocation && args.filterInput.sort === 'distance') {
    facilityIds.forEach((facilityId: string, index: number) => {
      facilityDistances[facilityId] = distanceBetweenTwoLatLongInMeters(
        facilityLatLongs[index][0],
        facilityLatLongs[index][1],
        args.filterInput.geolocation.latitude,
        args.filterInput.geolocation.longitude
      ).toString();
    });

    for (const doctor of earlyAvailableStarApolloDoctors) {
      earlyAvailableApolloDoctors.push(doctor);
    }
    for (const doctor of earlyAvailableNonStarApolloDoctors) {
      earlyAvailableApolloDoctors.push(doctor);
    }
    for (const doctor of starDoctor) {
      docs.push(doctor);
    }
    for (const doctor of nonStarDoctor) {
      docs.push(doctor);
    }
    doctors = earlyAvailableApolloDoctors
      .sort(
        (a, b) =>
          parseFloat(facilityDistances[a.doctorHospital[0].facility.id]) -
          parseFloat(facilityDistances[b.doctorHospital[0].facility.id])
      )
      .concat(
        earlyAvailableNonApolloDoctors.sort(
          (a, b) =>
            parseFloat(facilityDistances[a.doctorHospital[0].facility.id]) -
            parseFloat(facilityDistances[b.doctorHospital[0].facility.id])
        )
      )
      .concat(
        docs.sort(
          (a, b) =>
            parseFloat(facilityDistances[a.doctorHospital[0].facility.id]) -
            parseFloat(facilityDistances[b.doctorHospital[0].facility.id])
        )
      );
  } else {
    earlyAvailableStarApolloDoctors = earlyAvailableStarApolloDoctors.sort(
      (a, b) =>
        parseFloat(a.earliestSlotavailableInMinutes) - parseFloat(b.earliestSlotavailableInMinutes)
    );
    earlyAvailableNonStarApolloDoctors = earlyAvailableNonStarApolloDoctors.sort(
      (a, b) =>
        parseFloat(a.earliestSlotavailableInMinutes) - parseFloat(b.earliestSlotavailableInMinutes)
    );
    let i = 0,
      j = 0;

    while (
      i < earlyAvailableStarApolloDoctors.length ||
      j < earlyAvailableNonStarApolloDoctors.length
    ) {
      if (
        i < earlyAvailableStarApolloDoctors.length &&
        (j >= earlyAvailableNonStarApolloDoctors.length ||
          earlyAvailableStarApolloDoctors[i].earliestSlotavailableInMinutes <=
            earlyAvailableNonStarApolloDoctors[j].earliestSlotavailableInMinutes)
      ) {
        earlyAvailableApolloDoctors.push(earlyAvailableStarApolloDoctors[i]);
        i++;
      } else {
        earlyAvailableApolloDoctors.push(earlyAvailableNonStarApolloDoctors[j]);
        j++;
      }
    }
    starDoctor = starDoctor.sort(
      (a, b) =>
        parseFloat(a.earliestSlotavailableInMinutes) - parseFloat(b.earliestSlotavailableInMinutes)
    );
    nonStarDoctor = nonStarDoctor.sort(
      (a, b) =>
        parseFloat(a.earliestSlotavailableInMinutes) - parseFloat(b.earliestSlotavailableInMinutes)
    );

    (i = 0), (j = 0);
    while (i < starDoctor.length || j < nonStarDoctor.length) {
      if (
        i < starDoctor.length &&
        (j >= nonStarDoctor.length ||
          starDoctor[i].earliestSlotavailableInMinutes <=
            nonStarDoctor[j].earliestSlotavailableInMinutes)
      ) {
        docs.push(starDoctor[i]);
        i++;
      } else {
        docs.push(nonStarDoctor[j]);
        j++;
      }
    }

    doctors = earlyAvailableApolloDoctors
      .concat(
        earlyAvailableNonApolloDoctors.sort(
          (a, b) =>
            parseFloat(a.earliestSlotavailableInMinutes) -
            parseFloat(b.earliestSlotavailableInMinutes)
        )
      )
      .concat(docs);
  }
  searchLogger(`API_CALL___END`);
  return {
    doctors: doctors,
    doctorsNextAvailability: finalDoctorNextAvailSlots,
    doctorsAvailability: finalDoctorsConsultModeAvailability,
    specialty: finalSpecialtyDetails,
    sort: args.filterInput.sort,
  };
};

export const getDoctorsBySpecialtyAndFiltersTypeDefsResolvers = {
  Query: {
    getDoctorsBySpecialtyAndFilters,
  },
};
