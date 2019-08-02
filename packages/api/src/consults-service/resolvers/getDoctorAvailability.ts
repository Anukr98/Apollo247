import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { addMinutes, differenceInHours } from 'date-fns';
import { ConsultHoursRepository } from 'doctors-service/repositories/consultHoursRepository';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { getConnection } from 'typeorm';

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
> = async (parent, { DoctorAvailabilityInput }, { doctorsDbConnect }) => {
  const consultHourRep = doctorsDbConnect.getCustomRepository(ConsultHoursRepository);
  const timeSlots = await consultHourRep
    .findByDoctorId(DoctorAvailabilityInput.doctorId)
    .then(async (consultHoursResp) => {
      let availableSlots: string[] = [];
      if (consultHoursResp) {
        const st = `${DoctorAvailabilityInput.availableDate.toDateString()} ${consultHoursResp[0].startTime.toString()}`;
        const ed = `${DoctorAvailabilityInput.availableDate.toDateString()} ${consultHoursResp[0].endTime.toString()}`;
        const consultStartTime = new Date(st);
        const consultEndTime = new Date(ed);
        const slotsCount = differenceInHours(consultEndTime, consultStartTime) * 4;
        const stTime = consultStartTime.getHours() + ':' + consultStartTime.getMinutes();
        let startTime = new Date(
          DoctorAvailabilityInput.availableDate.toDateString() + ' ' + stTime
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
        return availableSlots;
      } else {
        return availableSlots;
      }
    });
  const con = getConnection();
  const appts = con.getCustomRepository(AppointmentRepository);
  const apptSlots = await appts
    .findByDateDoctorId(DoctorAvailabilityInput.doctorId, DoctorAvailabilityInput.availableDate)
    .then((apptsResp) => {
      if (apptsResp.length > 0) {
        const slots = apptsResp.map((appt) => {
          const sl = `${appt.appointmentTime
            .getHours()
            .toString()}:${appt.appointmentTime.getMinutes().toString()}`;
          timeSlots.splice(timeSlots.indexOf(sl), 1);
          return sl;
        });
        return slots;
      }
    });
  return { availableSlots: timeSlots };
};

export const getAvailableSlotsResolvers = {
  Query: {
    getDoctorAvailableSlots,
  },
};
