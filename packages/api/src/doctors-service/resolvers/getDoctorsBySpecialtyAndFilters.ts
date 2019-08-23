import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { DoctorsServiceContext } from 'doctors-service/doctorsServiceContext';
import { Doctor, ConsultMode } from 'doctors-service/entities/';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { format, addMinutes } from 'date-fns';

import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';

export const getDoctorsBySpecialtyAndFiltersTypeDefs = gql`
  type FilterDoctorsResult {
    doctors: [DoctorDetails]
    doctorsAvailability: [DoctorConsultModeAvailability]
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

const getDoctorsBySpecialtyAndFilters: Resolver<
  null,
  { filterInput: FilterDoctorInput },
  DoctorsServiceContext,
  FilterDoctorsResult
> = async (parent, args, { doctorsDb, consultsDb }) => {
  let filteredDoctors;
  const doctorsConsultModeAvailability: DoctorConsultModeAvailability[] = [];

  try {
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
      if (format(nowEndDateTime, 'yyyy-MM-dd') !== format(nowStartDateTime, 'yyyy-MM-dd')) {
        nowEndDateTime = new Date(format(nowStartDateTime, 'yyyy-MM-dd') + 'T23:59');
      }
      //selectedDates.push(format(nowStartDateTime, 'yyyy-MM-dd'));
      nowDateTime = { startDateTime: nowStartDateTime, endDateTime: nowEndDateTime };
      appointmentDateTimes.push(nowDateTime);
    }

    if (availabilityDates && availabilityDates.length > 0) {
      availabilityDates.forEach((date: string) => {
        const startDateTime = new Date(date + 'T00:00');
        const endDateTime = new Date(date + 'T23:59');
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

  return { doctors: filteredDoctors, doctorsAvailability: doctorsConsultModeAvailability };
};

export const getDoctorsBySpecialtyAndFiltersTypeDefsResolvers = {
  Query: {
    getDoctorsBySpecialtyAndFilters,
  },
};
