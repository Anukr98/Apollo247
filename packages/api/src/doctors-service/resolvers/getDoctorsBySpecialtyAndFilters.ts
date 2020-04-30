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
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { DoctorSpecialtyRepository } from 'doctors-service/repositories/doctorSpecialtyRepository';
//import { FacilityRepository } from 'doctors-service/repositories/facilityRepository';
import { Client, RequestParams } from '@elastic/elasticsearch';
import { format, addMinutes, addDays, differenceInMinutes } from 'date-fns';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { Connection } from 'typeorm';
import { ApiConstants } from 'ApiConstants';
import { debugLog } from 'customWinstonLogger';

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
> = async (parent, args, { }) => {
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

  searchLogger(`API_CALL___START`);

  let finalDoctorNextAvailSlots: DoctorSlotAvailability[] = [],
    finalDoctorsConsultModeAvailability: DoctorConsultModeAvailability[] = [];
  let finalSpecialtyDetails;
  let finalSpecialityDetails = [];
  const elasticMatch = [];
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
  const searchParams: RequestParams.Search = {
    index: 'doctors',
    type: 'posts',
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
  const docs = [];
  finalDoctorNextAvailSlots = [];
  finalDoctorsConsultModeAvailability = [];
  finalSpecialityDetails = [];
  for (const doc of getDetails.body.hits.hits) {
    const doctor = doc._source;
    doctor['id'] = doctor.doctorId;
    doctor['onlineStatus'] = DOCTOR_ONLINE_STATUS.ONLINE;
    doctor['doctorHospital'] = [];
    doctor['activeSlotCount'] = 0;
    doctor['earliestSlotavailableInMinutes'] = 0;
    let bufferTime = 5;
    for (const consultHour of doctor.consultHours) {
      consultHour['id'] = consultHour['consultHoursId'];
      bufferTime = consultHour["consultBuffer"];
    }
    if (doctor.specialty) {
      doctor.specialty.id = doctor.specialty.specialtyId;
    }
    doctor.facility = Array.isArray(doctor.facility) ? doctor.facility : [doctor.facility];
    for (const facility of doctor.facility) {
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
    for (const slots of doc._source.doctorSlots) {
      for (const slot of slots['slots']) {
        if (slot.status == 'OPEN' && (differenceInMinutes(new Date(slot.slot), new Date()) > bufferTime)) {
          if (doctor['activeSlotCount'] === 0) {
            doctor['earliestSlotavailableInMinutes'] = differenceInMinutes(new Date(slot.slot), new Date());
            finalDoctorNextAvailSlots.push({
              availableInMinutes: Math.abs(differenceInMinutes(new Date(), new Date(slot.slot))),
              physicalSlot: slot.slotType === 'ONLINE' ? '' : slot.slot,
              currentDateTime: new Date(),
              doctorId: doc._source.doctorId,
              onlineSlot: slot.slotType === 'PHYSICAL' ? '' : slot.slot,
              referenceSlot: slot.slot,
            });
          }
          doctor['activeSlotCount'] += 1;
        }
      }
    }
    if (doctor['activeSlotCount'] > 0) {
      docs.push(doctor);
      finalDoctorsConsultModeAvailability.push({
        availableModes: [doctor.consultHours[0].consultMode],
        doctorId: doctor.doctorId,
      });
      finalSpecialityDetails.push(doctor.specialty);
    }
  }
  searchLogger(`API_CALL___END`);
  return {
    doctors: docs
      .sort((a, b) => parseFloat(a.earliestSlotavailableInMinutes) - parseFloat(b.earliestSlotavailableInMinutes)),
    doctorsNextAvailability: finalDoctorNextAvailSlots,
    doctorsAvailability: finalDoctorsConsultModeAvailability,
    specialty: finalSpecialtyDetails,
  };
};

const applyFilterLogic = async (
  filterInput: FilterDoctorInput,
  doctorsDb: Connection,
  consultsDb: Connection,
  facilityDistances?: FacilityDistanceMap
) => {
  let filteredDoctors;
  const doctorsConsultModeAvailability: DoctorConsultModeAvailability[] = [];
  let specialtyDetails;
  const consultModeFilter = filterInput.consultMode ? filterInput.consultMode : ConsultMode.BOTH;

  const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
  const consultsRepo = consultsDb.getCustomRepository(AppointmentRepository);

  //create first order curried logger method with first 4 static parameters being passed.
  const searchLogger = debugLog(
    'doctorSearchAPILogger',
    'getDoctorsBySpecialtyAndFilters',
    apiCallId,
    callStartTime,
    identifier
  );

  try {
    const specialtiesRepo = doctorsDb.getCustomRepository(DoctorSpecialtyRepository);
    specialtyDetails = await specialtiesRepo.findById(filterInput.specialty);
    if (!specialtyDetails) {
      throw new AphError(AphErrorMessages.INVALID_SPECIALTY_ID, undefined, {});
    }

    searchLogger('FILTERING_DOCTORS___START');
    filteredDoctors = await doctorRepository.filterDoctors(filterInput);
    searchLogger('FILTERING_DOCTORS___END');

    //get filtered doctor ids
    const doctorIds = filteredDoctors.map((doctor) => {
      return doctor.id;
    });

    searchLogger(`FILTER_BY_AVAILABILITY_CONSULT_MODE___START`);

    //preparin required input parameters based on availability filters selected
    const appointmentDateTimes: AppointmentDateTime[] = [];
    const availabilityDates = filterInput.availability;
    const selectedNow = filterInput.availableNow;
    const selectedDates: string[] = [];
    let nowDateTime;
    if (selectedNow && selectedNow != '') {
      const nowStartDateTime = new Date(selectedNow);
      let nowEndDateTime = addMinutes(nowStartDateTime, 60);
      if (format(nowEndDateTime, 'HH:mm') > '18:30') {
        nowEndDateTime = new Date(format(nowStartDateTime, 'yyyy-MM-dd') + 'T18:29');
      }
      nowDateTime = { startDateTime: nowStartDateTime, endDateTime: nowEndDateTime };
      appointmentDateTimes.push(nowDateTime);
    }

    if (availabilityDates && availabilityDates.length > 0) {
      availabilityDates.forEach((date: string) => {
        const previousDate = format(addDays(new Date(date), -1), 'yyyy-MM-dd');
        const startDateTime = new Date(previousDate + 'T18:30');
        const endDateTime = new Date(date + 'T18:29');
        selectedDates.push(date);
        appointmentDateTimes.push({ startDateTime, endDateTime });
      });
    }

    //get filtered doctors consulthours and consult modes
    const doctorsConsultModeSlots = doctorRepository.getDoctorsAvailability(
      consultModeFilter,
      filteredDoctors,
      selectedDates,
      nowDateTime
    );

    //get filtered doctors appointments
    if (doctorIds.length > 0) {
      const doctorsAppointments = await consultsRepo.findByDoctorIdsAndDateTimes(
        doctorIds,
        appointmentDateTimes
      );
      //console.log('appts: ', doctorsAppointments);

      //reducing availble slots count of filtered doctors based on booked appointment slots
      doctorsAppointments.forEach((appt) => {
        const bookedDate = format(appt.appointmentDateTime, 'yyyy-MM-dd');

        if (
          doctorsConsultModeSlots[appt.doctorId] &&
          doctorsConsultModeSlots[appt.doctorId][bookedDate]
        ) {
          if (
            appt.appointmentType == 'ONLINE' &&
            doctorsConsultModeSlots[appt.doctorId][bookedDate].onlineSlots > 0
          ) {
            doctorsConsultModeSlots[appt.doctorId][bookedDate].onlineSlots--;
          }
          if (
            appt.appointmentType == 'PHYSICAL' &&
            doctorsConsultModeSlots[appt.doctorId][bookedDate].physicalSlots > 0
          ) {
            doctorsConsultModeSlots[appt.doctorId][bookedDate].physicalSlots--;
          }
          if (
            (appt.appointmentType == 'PHYSICAL' || appt.appointmentType == 'ONLINE') &&
            doctorsConsultModeSlots[appt.doctorId][bookedDate].bothSlots > 0
          ) {
            doctorsConsultModeSlots[appt.doctorId][bookedDate].bothSlots--;
          }
        }
      });
      //console.log('consult modes: ', doctorsConsultModeSlots);

      //setting the final available consult modes for the filtered doctors
      for (const docId in doctorsConsultModeSlots) {
        const doctorAvailability = doctorsConsultModeSlots[docId];
        const doctorConsultModeAvailability: DoctorConsultModeAvailability = {
          doctorId: docId,
          availableModes: [],
        };
        Object.keys(doctorAvailability).some((date) => {
          if (
            doctorAvailability[date].onlineSlots > 0 &&
            !doctorConsultModeAvailability.availableModes.includes(ConsultMode.ONLINE)
          ) {
            doctorConsultModeAvailability.availableModes.push(ConsultMode.ONLINE);
          }
          if (
            doctorAvailability[date].physicalSlots > 0 &&
            !doctorConsultModeAvailability.availableModes.includes(ConsultMode.PHYSICAL)
          ) {
            doctorConsultModeAvailability.availableModes.push(ConsultMode.PHYSICAL);
          }
          if (
            doctorAvailability[date].bothSlots > 0 &&
            !doctorConsultModeAvailability.availableModes.includes(ConsultMode.BOTH)
          ) {
            doctorConsultModeAvailability.availableModes.push(ConsultMode.BOTH);
          }
        });

        doctorsConsultModeAvailability.push(doctorConsultModeAvailability);
        //console.log(doctorsConsultModeAvailability);
      }
    }
    searchLogger(`FILTER_BY_AVAILABILITY_CONSULT_MODE___END`);
  } catch (filterDoctorsError) {
    throw new AphError(AphErrorMessages.FILTER_DOCTORS_ERROR, undefined, { filterDoctorsError });
  }

  //filtering the doctors list based on their availability
  const finalDoctorsList = filteredDoctors.filter((doctor) => {
    return doctorsConsultModeAvailability.some((availabilityObject) => {
      if (consultModeFilter == ConsultMode.BOTH) {
        return (
          availabilityObject.doctorId == doctor.id && availabilityObject.availableModes.length > 0
        );
      } else {
        return (
          availabilityObject.doctorId == doctor.id &&
          (availabilityObject.availableModes.includes(consultModeFilter) ||
            availabilityObject.availableModes.includes(ConsultMode.BOTH))
        );
      }
    });
  });

  //logic to sort based on next availability time
  const finalDoctorIds = finalDoctorsList.map((doctor) => {
    return doctor.id;
  });

  searchLogger('GET_DOCTORS_NEXT_AVAILABILITY___START');
  const doctorNextAvailSlots = await doctorRepository.getDoctorsNextAvailableSlot(
    finalDoctorIds,
    consultModeFilter,
    doctorsDb,
    consultsDb
  );
  searchLogger(`GET_DOCTORS_NEXT_AVAILABILITY___END`);

  //get consult now and book now doctors by available time
  const { consultNowDoctors, bookNowDoctors } = await doctorRepository.getConsultAndBookNowDoctors(
    doctorNextAvailSlots.doctorAvailalbeSlots,
    finalDoctorsList
  );

  searchLogger(`APPLY_RANKING_ALGORITHM___START`);
  //apply sort algorithm on ConsultNow doctors
  if (consultNowDoctors.length > 1) {
    //get patient and matched doctors previous appointments starts here
    const consultNowDocIds = consultNowDoctors.map((doctor) => {
      return doctor.id;
    });
    const previousAppointments = await consultsRepo.getPatientAndDoctorsAppointments(
      filterInput.patientId,
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
    const previousAppointments = await consultsRepo.getPatientAndDoctorsAppointments(
      filterInput.patientId,
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
  searchLogger(`APPLY_RANKING_ALGORITHM___END`);

  return {
    consultNowDoctors,
    bookNowDoctors,
    doctorNextAvailSlots,
    doctorsConsultModeAvailability,
  };
};

export const getDoctorsBySpecialtyAndFiltersTypeDefsResolvers = {
  Query: {
    getDoctorsBySpecialtyAndFilters,
  },
};
