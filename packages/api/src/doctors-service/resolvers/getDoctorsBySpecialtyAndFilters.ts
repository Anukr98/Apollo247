import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { DoctorsServiceContext } from 'doctors-service/doctorsServiceContext';
import { Doctor, DoctorSpecialty, ConsultMode } from 'doctors-service/entities/';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { DoctorSpecialtyRepository } from 'doctors-service/repositories/doctorSpecialtyRepository';
import { format, addMinutes, addDays, differenceInMinutes } from 'date-fns';

import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { DoctorConsultHoursRepository } from 'doctors-service/repositories/doctorConsultHoursRepository';
import { Connection } from 'typeorm';

export const getDoctorsBySpecialtyAndFiltersTypeDefs = gql`
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
    specialty: ID!
    city: [String]
    experience: [Range]
    availability: [String]
    availableNow: String
    fees: [Range]
    gender: [Gender]
    language: [String]
    location: String
    consultMode: ConsultMode
  }
  extend type Query {
    getDoctorsBySpecialtyAndFilters(filterInput: FilterDoctorInput): FilterDoctorsResult
  }
`;

type FilterDoctorsResult = {
  doctors: Doctor[];
  doctorsNextAvailability: DoctorSlotAvailability[];
  doctorsAvailability: DoctorConsultModeAvailability[];
  specialty: DoctorSpecialty;
};

export type DoctorConsultModeAvailability = {
  doctorId: string;
  availableModes: ConsultMode[];
};
export type Range = {
  minimum: number;
  maximum: number;
};

export type FilterDoctorInput = {
  patientId: string;
  specialty: string;
  city: string[];
  experience: Range[];
  availability: string[];
  availableNow: string;
  fees: Range[];
  gender: string[];
  language: string[];
  location: string;
  consultMode: ConsultMode;
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

const getDoctorsBySpecialtyAndFilters: Resolver<
  null,
  { filterInput: FilterDoctorInput },
  DoctorsServiceContext,
  FilterDoctorsResult
> = async (parent, args, { doctorsDb, consultsDb }) => {
  let filteredDoctors;
  const doctorsConsultModeAvailability: DoctorConsultModeAvailability[] = [];
  let specialtyDetails;
  const consultModeFilter = args.filterInput.consultMode
    ? args.filterInput.consultMode
    : ConsultMode.BOTH;

  const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
  const consultsRepo = consultsDb.getCustomRepository(AppointmentRepository);

  try {
    const specialtiesRepo = doctorsDb.getCustomRepository(DoctorSpecialtyRepository);
    specialtyDetails = await specialtiesRepo.findById(args.filterInput.specialty);
    if (!specialtyDetails) {
      throw new AphError(AphErrorMessages.INVALID_SPECIALTY_ID, undefined, {});
    }

    filteredDoctors = await doctorRepository.filterDoctors(args.filterInput);
    // console.log('basic filtered doctors: ',filteredDoctors)

    //apply sort algorithm
    if (filteredDoctors.length > 1) {
      //get patient and matched doctors previous appointments starts here
      const filteredDoctorIds = filteredDoctors.map((doctor) => {
        return doctor.id;
      });
      const previousAppointments = await consultsRepo.getPatientAndDoctorsAppointments(
        args.filterInput.patientId,
        filteredDoctorIds
      );
      const consultedDoctorIds = previousAppointments.map((appt) => {
        return appt.doctorId;
      });
      //get patient and matched doctors previous appointments ends here

      filteredDoctors.sort((doctorA: Doctor, doctorB: Doctor) => {
        return doctorRepository.sortByRankingAlgorithm(doctorA, doctorB, consultedDoctorIds);
      });
    }

    //get filtered doctor ids
    const doctorIds = filteredDoctors.map((doctor) => {
      return doctor.id;
    });

    //preparin required input parameters based on availability filters selected
    const appointmentDateTimes: AppointmentDateTime[] = [];
    const availabilityDates = args.filterInput.availability;
    const selectedNow = args.filterInput.availableNow;
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

  const doctorNextAvailSlots = await getDoctorNextAvailableSlot(
    finalDoctorIds,
    consultModeFilter,
    doctorsDb,
    consultsDb
  );

  //sort doctors by available time
  doctorNextAvailSlots.doctorAvailalbeSlots.sort(
    (a, b) => a.availableInMinutes - b.availableInMinutes
  );

  const consultNowDoctorSlots = doctorNextAvailSlots.doctorAvailalbeSlots.filter((doctor) => {
    return doctor.availableInMinutes <= 60;
  });
  const bookNowDoctorSlots = doctorNextAvailSlots.doctorAvailalbeSlots.filter((doctor) => {
    return doctor.availableInMinutes > 60;
  });

  //create key-pair object to map with doctors data object
  const timeSortedConsultNowDoctorSlots: DoctorSlotAvailabilityObject = {};
  consultNowDoctorSlots.forEach((doctorSlot) => {
    timeSortedConsultNowDoctorSlots[doctorSlot.doctorId] = doctorSlot;
  });

  const timeSortedBookNowDoctorSlots: DoctorSlotAvailabilityObject = {};
  bookNowDoctorSlots.forEach((doctorSlot) => {
    timeSortedBookNowDoctorSlots[doctorSlot.doctorId] = doctorSlot;
  });

  //map to real doctors data
  const consultNowDoctorsObject: DoctorsObject = {};
  for (const docId in timeSortedConsultNowDoctorSlots) {
    const matchedDoctor = finalDoctorsList.filter((finalDoc) => {
      return finalDoc.id == docId;
    });
    consultNowDoctorsObject[docId] = matchedDoctor[0];
  }

  const bookNowDoctorsObject: DoctorsObject = {};
  for (const docId in timeSortedBookNowDoctorSlots) {
    const matchedDoctor = finalDoctorsList.filter((finalDoc) => {
      return finalDoc.id == docId;
    });
    bookNowDoctorsObject[docId] = matchedDoctor[0];
  }

  const consultNowDoctors = Object.values(consultNowDoctorsObject);
  const bookNowDoctors = Object.values(bookNowDoctorsObject);

  //apply sort algorithm on ConsultNow doctors
  if (consultNowDoctors.length > 1) {
    //get patient and matched doctors previous appointments starts here
    const consultNowDocIds = consultNowDoctors.map((doctor) => {
      return doctor.id;
    });
    const previousAppointments = await consultsRepo.getPatientAndDoctorsAppointments(
      args.filterInput.patientId,
      consultNowDocIds
    );
    const consultedDoctorIds = previousAppointments.map((appt) => {
      return appt.doctorId;
    });
    //get patient and matched doctors previous appointments ends here

    consultNowDoctors.sort((doctorA: Doctor, doctorB: Doctor) => {
      return doctorRepository.sortByRankingAlgorithm(doctorA, doctorB, consultedDoctorIds);
    });
  }

  //apply sort algorithm on BookNow doctors
  if (bookNowDoctors.length > 1) {
    //get patient and matched doctors previous appointments starts here
    const consultNowDocIds = bookNowDoctors.map((doctor) => {
      return doctor.id;
    });
    const previousAppointments = await consultsRepo.getPatientAndDoctorsAppointments(
      args.filterInput.patientId,
      consultNowDocIds
    );
    const consultedDoctorIds = previousAppointments.map((appt) => {
      return appt.doctorId;
    });
    //get patient and matched doctors previous appointments ends here

    bookNowDoctors.sort((doctorA: Doctor, doctorB: Doctor) => {
      return doctorRepository.sortByRankingAlgorithm(doctorA, doctorB, consultedDoctorIds);
    });
  }

  const finalSortedDoctors = consultNowDoctors.concat(bookNowDoctors);

  return {
    doctors: finalSortedDoctors,
    doctorsNextAvailability: doctorNextAvailSlots.doctorAvailalbeSlots,
    doctorsAvailability: doctorsConsultModeAvailability,
    specialty: specialtyDetails,
  };
};

const getDoctorNextAvailableSlot = async (
  doctorIds: string[],
  consultModeFilter: ConsultMode,
  doctorsDb: Connection,
  consultsDb: Connection
) => {
  const appts = consultsDb.getCustomRepository(AppointmentRepository);
  //const weekDay = format(new Date(), 'EEEE').toUpperCase();
  const doctorAvailalbeSlots: DoctorSlotAvailability[] = [];
  function slots(doctorId: string) {
    return new Promise<DoctorSlotAvailability>(async (resolve) => {
      let onlineSlot: string = '';
      let physicalSlot: string = '';

      const docConsultRep = doctorsDb.getCustomRepository(DoctorConsultHoursRepository);
      const docConsultHrsOnline = await docConsultRep.checkByDoctorAndConsultMode(
        doctorId,
        'ONLINE'
      );
      const docConsultHrsPhysical = await docConsultRep.checkByDoctorAndConsultMode(
        doctorId,
        'PHYSICAL'
      );
      if (docConsultHrsOnline > 0) {
        //if the slot is empty check for next day
        let nextDate = new Date();
        while (true) {
          const nextSlot = await appts.getDoctorNextSlotDate(
            doctorId,
            nextDate,
            doctorsDb,
            'ONLINE'
          );
          if (nextSlot != '' && nextSlot != undefined) {
            onlineSlot = nextSlot;
            break;
          }
          nextDate = addDays(nextDate, 1);
        }
      }

      if (docConsultHrsPhysical > 0) {
        //if the slot is empty check for next day
        let nextDate = new Date();
        while (true) {
          const nextSlot = await appts.getDoctorNextSlotDate(
            doctorId,
            nextDate,
            doctorsDb,
            'PHYSICAL'
          );
          if (nextSlot != '' && nextSlot != undefined) {
            physicalSlot = nextSlot;
            break;
          }
          nextDate = addDays(nextDate, 1);
        }
      }

      let referenceSlot;
      if (consultModeFilter == ConsultMode.ONLINE) {
        referenceSlot = onlineSlot;
      } else if (consultModeFilter == ConsultMode.PHYSICAL) {
        referenceSlot = physicalSlot;
      } else {
        if (onlineSlot == '' && physicalSlot != '') referenceSlot = physicalSlot;
        else if (physicalSlot == '' && onlineSlot != '') referenceSlot = onlineSlot;
        else referenceSlot = onlineSlot < physicalSlot ? onlineSlot : physicalSlot;
      }

      const doctorSlot: DoctorSlotAvailability = {
        doctorId,
        onlineSlot,
        physicalSlot,
        referenceSlot,
        currentDateTime: new Date(),
        availableInMinutes: Math.abs(differenceInMinutes(new Date(), new Date(referenceSlot))),
      };
      doctorAvailalbeSlots.push(doctorSlot);
      resolve(doctorSlot);
    });
  }
  const promises: object[] = [];
  doctorIds.map(async (doctorId) => {
    promises.push(slots(doctorId));
  });
  await Promise.all(promises);
  return { doctorAvailalbeSlots };
};

export const getDoctorsBySpecialtyAndFiltersTypeDefsResolvers = {
  Query: {
    getDoctorsBySpecialtyAndFilters,
  },
};
