import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { DoctorsServiceContext } from 'doctors-service/doctorsServiceContext';
import { Doctor, DoctorSpecialty, ConsultMode } from 'doctors-service/entities/';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { DoctorSpecialtyRepository } from 'doctors-service/repositories/doctorSpecialtyRepository';
import { format, addMinutes, addDays } from 'date-fns';

import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { DoctorConsultHoursRepository } from 'doctors-service/repositories/doctorConsultHoursRepository';
import { Connection } from 'typeorm';

export const getDoctorsBySpecialtyAndFiltersTypeDefs = gql`
  type FilterDoctorsResult {
    doctors: [DoctorDetails]
    doctorsAvailability: [DoctorConsultModeAvailability]
    specialty: DoctorSpecialty
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
  }
  extend type Query {
    getDoctorsBySpecialtyAndFilters(filterInput: FilterDoctorInput): FilterDoctorsResult
  }
`;

type FilterDoctorsResult = {
  doctors: Doctor[];
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
};

export type ConsultModeAvailability = {
  onlineSlots: number;
  physicalSlots: number;
  bothSlots: number;
};
export type DateAvailability = { [index: string]: ConsultModeAvailability };
export type DoctorAvailability = { [index: string]: DateAvailability };
export type AppointmentDateTime = { startDateTime: Date; endDateTime: Date };

export type SlotAvailability = {
  doctorId: string;
  availableSlot: string;
  physicalAvailableSlot: string;
  currentDateTime: Date;
};

const getDoctorsBySpecialtyAndFilters: Resolver<
  null,
  { filterInput: FilterDoctorInput },
  DoctorsServiceContext,
  FilterDoctorsResult
> = async (parent, args, { doctorsDb, consultsDb }) => {
  let filteredDoctors;
  const doctorsConsultModeAvailability: DoctorConsultModeAvailability[] = [];
  let specialtyDetails;

  try {
    const specialtiesRepo = doctorsDb.getCustomRepository(DoctorSpecialtyRepository);
    specialtyDetails = await specialtiesRepo.findById(args.filterInput.specialty);
    if (!specialtyDetails) {
      throw new AphError(AphErrorMessages.INVALID_SPECIALTY_ID, undefined, {});
    }

    const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
    const consultsRepo = consultsDb.getCustomRepository(AppointmentRepository);
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
      return (
        availabilityObject.doctorId == doctor.id && availabilityObject.availableModes.length > 0
      );
    });
  });

  //logic to sort based on next availability time
  const finalDoctorIds = finalDoctorsList.map((doctor) => {
    return doctor.id;
  });

  const doctorNextAvailSlots = await getDoctorNextAvailableSlot(
    finalDoctorIds,
    doctorsDb,
    consultsDb
  );
  console.log('----------------------------------------------------------');
  console.log('doctor next avail slots: ', doctorNextAvailSlots);

  return {
    doctors: finalDoctorsList,
    doctorsAvailability: doctorsConsultModeAvailability,
    specialty: specialtyDetails,
  };
};

const getDoctorNextAvailableSlot = async (
  doctorIds: string[],
  doctorsDb: Connection,
  consultsDb: Connection
) => {
  const appts = consultsDb.getCustomRepository(AppointmentRepository);
  //const weekDay = format(new Date(), 'EEEE').toUpperCase();
  const doctorAvailalbeSlots: SlotAvailability[] = [];
  function slots(doctorId: string) {
    return new Promise<SlotAvailability>(async (resolve) => {
      let availableSlot: string = '';
      let physicalAvailableSlot: string = '';

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
            availableSlot = nextSlot;
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
            physicalAvailableSlot = nextSlot;
            break;
          }
          nextDate = addDays(nextDate, 1);
        }
      }

      const doctorSlot: SlotAvailability = {
        doctorId,
        availableSlot,
        physicalAvailableSlot,
        currentDateTime: new Date(),
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
