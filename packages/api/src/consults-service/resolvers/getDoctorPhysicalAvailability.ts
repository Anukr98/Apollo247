import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { addMinutes, format, differenceInMinutes, addDays } from 'date-fns';
import { DoctorConsultHoursRepository } from 'doctors-service/repositories/doctorConsultHoursRepository';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';

export const getPhysicalAvailableSlotsTypeDefs = gql`
  input DoctorPhysicalAvailabilityInput {
    availableDate: Date!
    doctorId: ID!
    facilityId: ID!
  }

  type PhysicalAvailabilityResult {
    availableSlots: [String!]
  }

  extend type Query {
    getDoctorPhysicalAvailableSlots(
      DoctorPhysicalAvailabilityInput: DoctorPhysicalAvailabilityInput
    ): PhysicalAvailabilityResult!
  }
`;

type PhysicalAvailabilityResult = {
  availableSlots: string[];
};

type DoctorPhysicalAvailabilityInput = {
  availableDate: Date;
  doctorId: string;
  facilityId: string;
};

type DoctorPhysicalAvailabilityInputArgs = {
  DoctorPhysicalAvailabilityInput: DoctorPhysicalAvailabilityInput;
};

const getDoctorPhysicalAvailableSlots: Resolver<
  null,
  DoctorPhysicalAvailabilityInputArgs,
  ConsultServiceContext,
  PhysicalAvailabilityResult
> = async (parent, { DoctorPhysicalAvailabilityInput }, { doctorsDb, consultsDb }) => {
  const consultHourRep = doctorsDb.getCustomRepository(DoctorConsultHoursRepository);
  const weekDay = format(DoctorPhysicalAvailabilityInput.availableDate, 'EEEE').toUpperCase();
  const timeSlots = await consultHourRep.getPhysicalConsultHours(
    DoctorPhysicalAvailabilityInput.doctorId,
    weekDay,
    DoctorPhysicalAvailabilityInput.facilityId
  );
  const availableSlots: string[] = [];
  let availableSlotsReturn: string[] = [];
  if (timeSlots && timeSlots.length > 0) {
    timeSlots.map((timeSlot) => {
      let st = `${DoctorPhysicalAvailabilityInput.availableDate.toDateString()} ${timeSlot.startTime.toString()}`;
      const ed = `${DoctorPhysicalAvailabilityInput.availableDate.toDateString()} ${timeSlot.endTime.toString()}`;
      let consultStartTime = new Date(st);
      const consultEndTime = new Date(ed);
      let previousDate: Date = DoctorPhysicalAvailabilityInput.availableDate;
      if (consultEndTime < consultStartTime) {
        previousDate = addDays(DoctorPhysicalAvailabilityInput.availableDate, -1);
        st = `${previousDate.toDateString()} ${timeSlot.startTime.toString()}`;
        consultStartTime = new Date(st);
      }
      console.log(consultStartTime, consultEndTime, 'conslt hours');
      const slotsCount = (Math.abs(differenceInMinutes(consultEndTime, consultStartTime)) / 60) * 4;
      console.log(slotsCount, 'slots count', differenceInMinutes(consultEndTime, consultStartTime));
      const stTime = consultStartTime.getHours() + ':' + consultStartTime.getMinutes();
      let startTime = new Date(previousDate.toDateString() + ' ' + stTime);
      availableSlotsReturn = Array(slotsCount)
        .fill(0)
        .map(() => {
          const stTime = startTime;
          startTime = addMinutes(startTime, 15);
          const stTimeHours = stTime
            .getHours()
            .toString()
            .padStart(2, '0');
          const stTimeMins = stTime
            .getMinutes()
            .toString()
            .padStart(2, '0');
          const startDateStr = format(stTime, 'yyyy-MM-dd');
          const endStr = ':00.000Z';
          const generatedSlot = `${startDateStr}T${stTimeHours}:${stTimeMins}${endStr}`;
          availableSlots.push(generatedSlot);
          return generatedSlot;
        });
    });
  }
  console.log(availableSlotsReturn, 'return slots');
  const appts = consultsDb.getCustomRepository(AppointmentRepository);
  const apptSlots = await appts.findByDateDoctorId(
    DoctorPhysicalAvailabilityInput.doctorId,
    DoctorPhysicalAvailabilityInput.availableDate
  );
  if (apptSlots && apptSlots.length > 0) {
    apptSlots.map((appt) => {
      const apptDt = format(appt.appointmentDateTime, 'yyyy-MM-dd');
      const sl = `${apptDt}T${appt.appointmentDateTime
        .getUTCHours()
        .toString()
        .padStart(2, '0')}:${appt.appointmentDateTime
        .getUTCMinutes()
        .toString()
        .padStart(2, '0')}:00.000Z`;
      //console.log(sl, 'slot');
      //console.log(availableSlots.indexOf(sl), 'index of');
      // console.log(
      //   appt.appointmentDateTime.toDateString(),
      //   appt.appointmentDateTime,
      //   availableSlots.indexOf(sl),
      //   'check index with date'
      // );
      if (availableSlots.indexOf(sl) >= 0) {
        availableSlots.splice(availableSlots.indexOf(sl), 1);
      }
    });
  }

  return { availableSlots };
};

export const getPhysicalAvailableSlotsResolvers = {
  Query: {
    getDoctorPhysicalAvailableSlots,
  },
};
