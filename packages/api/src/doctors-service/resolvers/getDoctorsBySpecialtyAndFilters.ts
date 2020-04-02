import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { DoctorsServiceContext } from 'doctors-service/doctorsServiceContext';
import {
  Doctor,
  DoctorSpecialty,
  ConsultMode,
  SpecialtySearchType,
} from 'doctors-service/entities/';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { DoctorSpecialtyRepository } from 'doctors-service/repositories/doctorSpecialtyRepository';
import { FacilityRepository } from 'doctors-service/repositories/facilityRepository';

import { format, addMinutes, addDays } from 'date-fns';

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
> = async (parent, args, { doctorsDb, consultsDb }) => {
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

  let finalConsultNowDoctors: Doctor[] = [],
    finalBookNowDoctors: Doctor[] = [],
    finalDoctorNextAvailSlots: DoctorSlotAvailability[] = [],
    finalDoctorsConsultModeAvailability: DoctorConsultModeAvailability[] = [];
  let finalSpecialtyDetails;

  const specialtiesRepo = doctorsDb.getCustomRepository(DoctorSpecialtyRepository);

  //get facility distances from user geolocation
  let facilityDistances: FacilityDistanceMap = {};
  if (args.filterInput.geolocation) {
    searchLogger(`GEOLOCATION_API_CALL___START`);
    const facilityRepo = doctorsDb.getCustomRepository(FacilityRepository);
    facilityDistances = await facilityRepo.getAllFacilityDistances(args.filterInput.geolocation);
    searchLogger(`GEOLOCATION_API_CALL___END`);
  }

  if (
    args.filterInput.specialtySearchType &&
    args.filterInput.specialtySearchType == SpecialtySearchType.NAME
  ) {
    if (!args.filterInput.specialtyName) {
      throw new AphError(AphErrorMessages.FILTER_DOCTORS_ERROR, undefined, {});
    }

    let specialtyIds;
    if (args.filterInput.specialtyName.length === 0) {
      const generalPhysicianName = ApiConstants.GENERAL_PHYSICIAN.toString();
      specialtyIds = await specialtiesRepo.findSpecialtyIdsByNames([generalPhysicianName]);
    } else {
      specialtyIds = await specialtiesRepo.findSpecialtyIdsByNames(args.filterInput.specialtyName);
    }

    if (specialtyIds.length === 1) {
      finalSpecialtyDetails = await specialtiesRepo.findById(specialtyIds[0].id);
      if (!finalSpecialtyDetails) {
        throw new AphError(AphErrorMessages.INVALID_SPECIALTY_ID, undefined, {});
      }
    }

    if (specialtyIds.length >= 1) {
      args.filterInput.specialty = specialtyIds[0].id;
      const {
        consultNowDoctors,
        bookNowDoctors,
        doctorNextAvailSlots,
        doctorsConsultModeAvailability,
      } = await applyFilterLogic(args.filterInput, doctorsDb, consultsDb, facilityDistances);

      finalConsultNowDoctors = finalConsultNowDoctors.concat(consultNowDoctors);
      finalBookNowDoctors = finalBookNowDoctors.concat(bookNowDoctors);
      finalDoctorNextAvailSlots = finalDoctorNextAvailSlots.concat(
        doctorNextAvailSlots.doctorAvailalbeSlots
      );
      finalDoctorsConsultModeAvailability = finalDoctorsConsultModeAvailability.concat(
        doctorsConsultModeAvailability
      );
    }

    if (specialtyIds.length >= 2) {
      args.filterInput.specialty = specialtyIds[1].id;
      const {
        consultNowDoctors,
        bookNowDoctors,
        doctorNextAvailSlots,
        doctorsConsultModeAvailability,
      } = await applyFilterLogic(args.filterInput, doctorsDb, consultsDb, facilityDistances);

      finalConsultNowDoctors = finalConsultNowDoctors.concat(consultNowDoctors);
      finalBookNowDoctors = finalBookNowDoctors.concat(bookNowDoctors);
      finalDoctorNextAvailSlots = finalDoctorNextAvailSlots.concat(
        doctorNextAvailSlots.doctorAvailalbeSlots
      );
      finalDoctorsConsultModeAvailability = finalDoctorsConsultModeAvailability.concat(
        doctorsConsultModeAvailability
      );
    }

    if (specialtyIds.length >= 3) {
      args.filterInput.specialty = specialtyIds[2].id;
      const {
        consultNowDoctors,
        bookNowDoctors,
        doctorNextAvailSlots,
        doctorsConsultModeAvailability,
      } = await applyFilterLogic(args.filterInput, doctorsDb, consultsDb, facilityDistances);

      finalConsultNowDoctors = finalConsultNowDoctors.concat(consultNowDoctors);
      finalBookNowDoctors = finalBookNowDoctors.concat(bookNowDoctors);
      finalDoctorNextAvailSlots = finalDoctorNextAvailSlots.concat(
        doctorNextAvailSlots.doctorAvailalbeSlots
      );
      finalDoctorsConsultModeAvailability = finalDoctorsConsultModeAvailability.concat(
        doctorsConsultModeAvailability
      );
    }
  } else {
    if (!args.filterInput.specialty) {
      throw new AphError(AphErrorMessages.FILTER_DOCTORS_ERROR, undefined, {});
    }

    finalSpecialtyDetails = await specialtiesRepo.findById(args.filterInput.specialty);
    if (!finalSpecialtyDetails) {
      throw new AphError(AphErrorMessages.INVALID_SPECIALTY_ID, undefined, {});
    }

    const {
      consultNowDoctors,
      bookNowDoctors,
      doctorNextAvailSlots,
      doctorsConsultModeAvailability,
    } = await applyFilterLogic(args.filterInput, doctorsDb, consultsDb, facilityDistances);

    finalConsultNowDoctors = finalConsultNowDoctors.concat(consultNowDoctors);
    finalBookNowDoctors = finalBookNowDoctors.concat(bookNowDoctors);
    finalDoctorNextAvailSlots = finalDoctorNextAvailSlots.concat(
      doctorNextAvailSlots.doctorAvailalbeSlots
    );
    finalDoctorsConsultModeAvailability = finalDoctorsConsultModeAvailability.concat(
      doctorsConsultModeAvailability
    );
  }

  let finalSortedDoctors = finalConsultNowDoctors.concat(finalBookNowDoctors);
  let pincodeCity = '';
  if (args.filterInput.pincode) {
    const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
    const pincodeCityDetails = await doctorRepository.getCityMappingPincode(
      args.filterInput.pincode
    );
    if (pincodeCityDetails) pincodeCity = pincodeCityDetails.city;
  }
  if (pincodeCity != '') {
    console.log('entered here');
    //matching docs sorting city based start
    const cityMatchedDocs: Doctor[] = [];
    const cityMatchedDoctorsNextAvailability: DoctorSlotAvailability[] = [];
    const otherCityMatchedDocs: Doctor[] = [];
    const otherCityMatchedDoctorsNextAvailability: DoctorSlotAvailability[] = [];

    const matchedDocIds: string[] = [];
    const matchedOtherDocIds: string[] = [];
    const finalSortedDoctorsIds = finalSortedDoctors.map((doctor) => {
      return doctor.id;
    });
    finalDoctorNextAvailSlots.map((docSlot) => {
      const docIndex = finalSortedDoctorsIds.indexOf(docSlot.doctorId);
      console.log(docIndex, 'docIndex in slot avail array');
      if (finalSortedDoctors[docIndex].doctorHospital[0].facility.city == pincodeCity) {
        cityMatchedDocs.push(finalSortedDoctors[docIndex]);
        matchedDocIds.push(finalSortedDoctors[docIndex].id);
        cityMatchedDoctorsNextAvailability.push(docSlot);
      } else {
        otherCityMatchedDocs.push(finalSortedDoctors[docIndex]);
        matchedOtherDocIds.push(finalSortedDoctors[docIndex].id);
        otherCityMatchedDoctorsNextAvailability.push(docSlot);
      }
    });
    let startSort = 0;
    const cityMatchedDocsOrder: Doctor[] = [];
    const cityMatchedDoctorsNextAvailabilityOrder: DoctorSlotAvailability[] = [];
    cityMatchedDoctorsNextAvailability.map((docSlot) => {
      if (docSlot.referenceSlot != '') {
        cityMatchedDocsOrder.push(cityMatchedDocs[startSort]);
        cityMatchedDoctorsNextAvailabilityOrder.push(docSlot);
      }
      startSort++;
    });

    startSort = 0;
    cityMatchedDoctorsNextAvailability.map((docSlot) => {
      if (docSlot.referenceSlot == '') {
        cityMatchedDocsOrder.push(cityMatchedDocs[startSort]);
        cityMatchedDoctorsNextAvailabilityOrder.push(docSlot);
      }
      startSort++;
    });

    startSort = 0;
    const otherCityMatchedDocsOrder: Doctor[] = [];
    const otherCityMatchedDoctorsNextAvailabilityOrder: DoctorSlotAvailability[] = [];
    otherCityMatchedDoctorsNextAvailability.map((docSlot) => {
      if (docSlot.referenceSlot != '') {
        otherCityMatchedDocsOrder.push(otherCityMatchedDocs[startSort]);
        otherCityMatchedDoctorsNextAvailabilityOrder.push(docSlot);
      }
      startSort++;
    });

    startSort = 0;
    otherCityMatchedDoctorsNextAvailability.map((docSlot) => {
      if (docSlot.referenceSlot == '') {
        otherCityMatchedDocsOrder.push(otherCityMatchedDocs[startSort]);
        otherCityMatchedDoctorsNextAvailabilityOrder.push(docSlot);
      }
      startSort++;
    });

    // finalSortedDoctors.map((preFinalDoc) => {
    //   const docIndex = finalDoctorNextAvailSlotsIds.indexOf(preFinalDoc.id);

    //   if (preFinalDoc.doctorHospital[0].facility.city == pincodeCity) {
    //     cityMatchedDocs.push(preFinalDoc);
    //     matchedDocIds.push(preFinalDoc.id);
    //     cityMatchedDoctorsNextAvailability.push(finalDoctorNextAvailSlots[docIndex]);
    //   } else {
    //     otherCityMatchedDocs.push(preFinalDoc);
    //     matchedOtherDocIds.push(preFinalDoc.id);
    //     otherCityMatchedDoctorsNextAvailability.push(finalDoctorNextAvailSlots[docIndex]);
    //   }
    //   startSort++;
    // });
    console.log(cityMatchedDoctorsNextAvailabilityOrder, 'cityMatchedDoctorsNextAvailability');
    console.log(
      otherCityMatchedDoctorsNextAvailabilityOrder,
      'otherCityMatchedDoctorsNextAvailability'
    );
    // const cityMatchedDocsOrder: Doctor[] = [];
    // cityMatchedDoctorsNextAvailability.map((availDoc) => {
    //   const docIndex = matchedDocIds.indexOf(availDoc.doctorId);
    //   console.log(docIndex, availDoc.doctorId, 'docIndex');
    //   cityMatchedDocsOrder.push(cityMatchedDocs[docIndex]);
    // });
    // console.log(otherCityMatchedDoctorsNextAvailability, 'otherCityMatchedDoctorsNextAvailability');
    // const otherCityMatchedDocsOrder: Doctor[] = [];
    // otherCityMatchedDoctorsNextAvailability.map((availDoc) => {
    //   const docIndex = matchedOtherDocIds.indexOf(availDoc.doctorId);
    //   console.log(docIndex, availDoc.doctorId, 'docIndex 2');
    //   otherCityMatchedDocsOrder.push(otherCityMatchedDocs[docIndex]);
    // });
    console.log('----------final list--------------');
    console.log(cityMatchedDocs, otherCityMatchedDocs);
    finalSortedDoctors = cityMatchedDocsOrder.concat(otherCityMatchedDocsOrder);
    finalDoctorNextAvailSlots = cityMatchedDoctorsNextAvailabilityOrder.concat(
      otherCityMatchedDoctorsNextAvailabilityOrder
    );

    //matching docs sorting city based end
  }
  searchLogger(`API_CALL___END`);
  return {
    doctors: finalSortedDoctors,
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
    // console.log('basic filtered doctors: ',filteredDoctors)

    //apply sort algorithm
    // if (filteredDoctors.length > 1) {
    //   //get patient and matched doctors previous appointments starts here
    //   const filteredDoctorIds = filteredDoctors.map((doctor) => {
    //     return doctor.id;
    //   });
    //   const previousAppointments = await consultsRepo.getPatientAndDoctorsAppointments(
    //     filterInput.patientId,
    //     filteredDoctorIds
    //   );
    //   const consultedDoctorIds = previousAppointments.map((appt) => {
    //     return appt.doctorId;
    //   });
    //   //get patient and matched doctors previous appointments ends here

    //   filteredDoctors.sort((doctorA: Doctor, doctorB: Doctor) => {
    //     return doctorRepository.sortByRankingAlgorithm(doctorA, doctorB, consultedDoctorIds);
    //   });
    // }

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
