import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { addMinutes, format, differenceInMinutes, addDays } from 'date-fns';
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
  let previousDate: Date = DoctorAvailabilityInput.availableDate;
  let prevDaySlots = 0;
  previousDate = addDays(DoctorAvailabilityInput.availableDate, -1);
  const checkStart = `${previousDate.toDateString()} 18:30:00`;
  const checkEnd = `${DoctorAvailabilityInput.availableDate.toDateString()} 18:30:00`;
  console.log(checkStart, checkEnd, 'check start end');
  let weekDay = format(previousDate, 'EEEE').toUpperCase();
  let timeSlots = await consultHourRep.getConsultHours(DoctorAvailabilityInput.doctorId, weekDay);
  weekDay = format(DoctorAvailabilityInput.availableDate, 'EEEE').toUpperCase();
  const timeSlotsNext = await consultHourRep.getConsultHours(
    DoctorAvailabilityInput.doctorId,
    weekDay
  );
  if (timeSlots.length > 0) {
    prevDaySlots = 1;
  }
  timeSlots = timeSlots.concat(timeSlotsNext);
  let availableSlots: string[] = [];
  //let availableSlotsReturn: string[] = [];
  console.log(timeSlots, 'time slots');
  let rowCount = 0;
  if (timeSlots && timeSlots.length > 0) {
    timeSlots.map((timeSlot) => {
      let st = `${DoctorAvailabilityInput.availableDate.toDateString()} ${timeSlot.startTime.toString()}`;
      const ed = `${DoctorAvailabilityInput.availableDate.toDateString()} ${timeSlot.endTime.toString()}`;
      let consultStartTime = new Date(st);
      const consultEndTime = new Date(ed);
      console.log('consults timings', consultStartTime, consultEndTime);

      if (consultEndTime < consultStartTime) {
        st = `${previousDate.toDateString()} ${timeSlot.startTime.toString()}`;
        consultStartTime = new Date(st);
      }
      // let duration = Math.floor(60 / timeSlot.consultDuration);
      // if (timeSlot.consultDuration > 40) {
      //   duration = parseFloat((60 / timeSlot.consultDuration).toFixed(1));
      // }
      const duration = parseFloat((60 / timeSlot.consultDuration).toFixed(1));
      //console.log(duration, 'doctor duration');
      let slotsCount =
        (Math.abs(differenceInMinutes(consultEndTime, consultStartTime)) / 60) * duration;
      if (slotsCount - Math.floor(slotsCount) == 0.5) {
        slotsCount = Math.ceil(slotsCount);
      } else {
        slotsCount = Math.floor(slotsCount);
      }
      console.log(slotsCount, 'slot count', differenceInMinutes(consultEndTime, consultStartTime));
      const stTime = consultStartTime.getHours() + ':' + consultStartTime.getMinutes();
      let startTime = new Date(previousDate.toDateString() + ' ' + stTime);
      if (prevDaySlots == 0) {
        startTime = new Date(addDays(previousDate, 1).toDateString() + ' ' + stTime);
      }
      if (rowCount > 0) {
        const nextDate = addDays(previousDate, 1);
        const ed = `${nextDate.toDateString()} ${timeSlot.startTime.toString()}`;
        const td = `${nextDate.toDateString()} 00:00:00`;
        if (new Date(ed) >= new Date(td) && timeSlot.weekDay != timeSlots[rowCount - 1].weekDay) {
          startTime = new Date(addDays(previousDate, 1).toDateString() + ' ' + stTime);
          previousDate = addDays(previousDate, 1);
        }
      }
      Array(slotsCount)
        .fill(0)
        .map(() => {
          const stTime = startTime;
          startTime = addMinutes(startTime, timeSlot.consultDuration);
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
          const timeWithBuffer = addMinutes(new Date(), timeSlot.consultBuffer);
          console.log(
            new Date(generatedSlot),
            new Date(),
            new Date(generatedSlot) > timeWithBuffer,
            ' dates comparision'
          );
          if (new Date(generatedSlot) > timeWithBuffer) {
            if (
              new Date(generatedSlot) >= new Date(checkStart) &&
              new Date(generatedSlot) < new Date(checkEnd)
            ) {
              if (!availableSlots.includes(generatedSlot)) {
                availableSlots.push(generatedSlot);
              }
            }
          }
          return `${startDateStr}T${stTimeHours}:${stTimeMins}${endStr}`;
        });
      console.log(availableSlots, 'avail slots');
      const lastSlot = new Date(availableSlots[availableSlots.length - 1]);
      const lastMins = Math.abs(differenceInMinutes(lastSlot, consultEndTime));
      console.log(lastMins, 'last mins', lastSlot);
      if (lastMins < timeSlot.consultDuration) {
        availableSlots.pop();
      }
      rowCount++;
    });
  }
  //console.log(availableSlots, 'availableSlots');
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
      if (availableSlots.indexOf(sl) >= 0) {
        availableSlots.splice(availableSlots.indexOf(sl), 1);
      }
    });
  }
  const doctorBblockedSlots = await appts.getDoctorBlockedSlots(
    DoctorAvailabilityInput.doctorId,
    DoctorAvailabilityInput.availableDate,
    doctorsDb,
    availableSlots
  );
  if (doctorBblockedSlots.length > 0) {
    availableSlots = availableSlots.filter((val) => !doctorBblockedSlots.includes(val));
  }

  return { availableSlots };
};

export const getAvailableSlotsResolvers = {
  Query: {
    getDoctorAvailableSlots,
  },
};
