import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { addMinutes, format, differenceInMinutes, addDays } from 'date-fns';
import { DoctorConsultHoursRepository } from 'doctors-service/repositories/doctorConsultHoursRepository';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { BlockedCalendarItemRepository } from 'doctors-service/repositories/blockedCalendarItemRepository';

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
  let availableSlotsReturn: string[] = [];
  if (timeSlots && timeSlots.length > 0) {
    timeSlots.map((timeSlot) => {
      let st = `${DoctorAvailabilityInput.availableDate.toDateString()} ${timeSlot.startTime.toString()}`;
      const ed = `${DoctorAvailabilityInput.availableDate.toDateString()} ${timeSlot.endTime.toString()}`;
      let consultStartTime = new Date(st);
      const consultEndTime = new Date(ed);
      //console.log(consultStartTime, consultEndTime);
      let previousDate: Date = DoctorAvailabilityInput.availableDate;
      if (consultEndTime < consultStartTime) {
        previousDate = addDays(DoctorAvailabilityInput.availableDate, -1);
        st = `${previousDate.toDateString()} ${timeSlot.startTime.toString()}`;
        consultStartTime = new Date(st);
      }
      const slotsCount =
        Math.ceil(Math.abs(differenceInMinutes(consultEndTime, consultStartTime)) / 60) * 4;
      const stTime = consultStartTime.getHours() + ':' + consultStartTime.getMinutes();
      let startTime = new Date(previousDate.toDateString() + ' ' + stTime);
      //console.log(slotsCount, 'slots count');
      //console.log(startTime, 'slot start time');
      availableSlotsReturn = Array(slotsCount)
        .fill(0)
        .map(() => {
          const stTime = startTime;
          startTime = addMinutes(startTime, 15);
          const stTimeHours = stTime
            .getUTCHours()
            .toString()
            .padStart(2, '0');
          const stTimeMins = stTime
            .getUTCMinutes()
            .toString()
            .padStart(2, '0');
          const startDateStr = format(stTime, 'yyyy-MM-dd');
          const endStr = ':00.000Z';
          const generatedSlot = `${startDateStr}T${stTimeHours}:${stTimeMins}${endStr}`;
          availableSlots.push(generatedSlot);
          return `${startDateStr}T${stTimeHours}:${stTimeMins}${endStr}`;
        });
    });
  }
  //console.log(availableSlots, 'availableSlots', availableSlotsReturn);
  const appts = consultsDb.getCustomRepository(AppointmentRepository);
  const apptSlots = await appts.findByDateDoctorId(
    DoctorAvailabilityInput.doctorId,
    DoctorAvailabilityInput.availableDate
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
  const bciRepo = doctorsDb.getCustomRepository(BlockedCalendarItemRepository);
  const blockedSlots = await bciRepo.getBlockedSlots(
    DoctorAvailabilityInput.availableDate,
    DoctorAvailabilityInput.doctorId
  );
  const doctorBblockedSlots: string[] = [];
  if (blockedSlots.length > 0) {
    blockedSlots.map((blockedSlot) => {
      const blockedSlotsCount =
        (Math.abs(differenceInMinutes(blockedSlot.end, blockedSlot.start)) / 60) * 4;
      let slot = blockedSlot.start;
      console.log(
        blockedSlotsCount,
        'blocked count',
        differenceInMinutes(blockedSlot.end, blockedSlot.start)
      );
      Array(blockedSlotsCount)
        .fill(0)
        .map(() => {
          const genBlockSlot =
            format(slot, 'yyyy-MM-dd') + 'T' + format(slot, 'hh:mm') + ':00.000Z';
          doctorBblockedSlots.push(genBlockSlot);
          slot = addMinutes(slot, 15);
        });
    });
    console.log(doctorBblockedSlots, 'doctor slots');
    availableSlots = availableSlots.filter((val) => !doctorBblockedSlots.includes(val));
  }

  return { availableSlots };
};

export const getAvailableSlotsResolvers = {
  Query: {
    getDoctorAvailableSlots,
  },
};
