import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { addMinutes, format, differenceInMinutes } from 'date-fns';
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
  let availableSlots: string[] = [];
  if (timeSlots && timeSlots.length > 0) {
    const st = `${DoctorPhysicalAvailabilityInput.availableDate.toDateString()} ${timeSlots[0].startTime.toString()}`;
    const ed = `${DoctorPhysicalAvailabilityInput.availableDate.toDateString()} ${timeSlots[0].endTime.toString()}`;
    const consultStartTime = new Date(st);
    const consultEndTime = new Date(ed);
    const slotsCount = Math.ceil(differenceInMinutes(consultEndTime, consultStartTime) / 60) * 4;
    const stTime = consultStartTime.getHours() + ':' + consultStartTime.getMinutes();
    let startTime = new Date(
      DoctorPhysicalAvailabilityInput.availableDate.toDateString() + ' ' + stTime
    );
    availableSlots = Array(slotsCount)
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
        return `${stTimeHours}:${stTimeMins}`;
      });
  }
  const appts = consultsDb.getCustomRepository(AppointmentRepository);
  const apptSlots = await appts.findByDateDoctorId(
    DoctorPhysicalAvailabilityInput.doctorId,
    DoctorPhysicalAvailabilityInput.availableDate
  );
  if (apptSlots && apptSlots.length > 0) {
    apptSlots.map((appt) => {
      const sl = `${appt.appointmentDateTime
        .getHours()
        .toString()
        .padStart(2, '0')}:${appt.appointmentDateTime
        .getMinutes()
        .toString()
        .padStart(2, '0')}`;
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
