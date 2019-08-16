import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { addMinutes, differenceInHours, format, differenceInMinutes } from 'date-fns';
import { DoctorConsultHoursRepository } from 'doctors-service/repositories/doctorConsultHoursRepository';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';

export const getAvailableSlotsTypeDefs = gql`
  input DoctorAvailabilityInput {
    availableDate: Date!
    doctorId: ID!
  }

  type AvailabilityResult {
    availableSlots: [String!]
  }

  extend type Query {
    getDoctorAvailableSlots(DoctorAvailabilityInput: DoctorAvailabilityInput): AvailabilityResult!
  }
`;

type AvailabilityResult = {
  availableSlots: string[];
};

type DoctorAvailabilityInput = {
  availableDate: Date;
  doctorId: string;
};

type AvailabilityInputArgs = { DoctorAvailabilityInput: DoctorAvailabilityInput };

const getDoctorAvailableSlots: Resolver<
  null,
  AvailabilityInputArgs,
  ConsultServiceContext,
  AvailabilityResult
> = async (parent, { DoctorAvailabilityInput }, { doctorsDb, consultsDb }) => {
  const consultHourRep = doctorsDb.getCustomRepository(DoctorConsultHoursRepository);
  const weekDay = format(DoctorAvailabilityInput.availableDate, 'EEEE').toUpperCase();
  const timeSlots = await consultHourRep.getConsultHours(DoctorAvailabilityInput.doctorId, weekDay);
  let availableSlots: string[] = [];
  if (timeSlots && timeSlots.length > 0) {
    const st = `${DoctorAvailabilityInput.availableDate.toDateString()} ${timeSlots[0].startTime.toString()}`;
    const ed = `${DoctorAvailabilityInput.availableDate.toDateString()} ${timeSlots[0].endTime.toString()}`;
    const consultStartTime = new Date(st);
    const consultEndTime = new Date(ed);
    const slotsCount = Math.ceil(differenceInMinutes(consultEndTime, consultStartTime) / 60) * 4;
    const stTime = consultStartTime.getHours() + ':' + consultStartTime.getMinutes();
    let startTime = new Date(DoctorAvailabilityInput.availableDate.toDateString() + ' ' + stTime);
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
    DoctorAvailabilityInput.doctorId,
    DoctorAvailabilityInput.availableDate
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

export const getAvailableSlotsResolvers = {
  Query: {
    getDoctorAvailableSlots,
  },
};
