import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { DoctorConsultHoursRepository } from 'doctors-service/repositories/doctorConsultHoursRepository';
import { format } from 'date-fns';

export const getNextAvailableSlotTypeDefs = gql`
  input DoctorNextAvailableSlotInput {
    availableDate: Date!
    doctorIds: [ID!]!
  }

  type SlotAvailabilityResult {
    doctorAvailalbeSlots: [SlotAvailability]
  }

  type SlotAvailability {
    doctorId: ID!
    availableSlot: String!
    currentDateTime: DateTime!
  }

  extend type Query {
    getDoctorNextAvailableSlot(
      DoctorNextAvailableSlotInput: DoctorNextAvailableSlotInput
    ): SlotAvailabilityResult!
  }
`;

type SlotAvailability = {
  doctorId: string;
  availableSlot: string;
  currentDateTime: Date;
};

type SlotAvailabilityResult = {
  doctorAvailalbeSlots: SlotAvailability[];
};

type DoctorNextAvailabeSlotInput = {
  availableDate: Date;
  doctorIds: string[];
};

type DoctorNextAvailabeSlotInputArgs = {
  DoctorNextAvailableSlotInput: DoctorNextAvailabeSlotInput;
};

const getDoctorNextAvailableSlot: Resolver<
  null,
  DoctorNextAvailabeSlotInputArgs,
  ConsultServiceContext,
  SlotAvailabilityResult
> = async (parent, { DoctorNextAvailableSlotInput }, { doctorsDb, consultsDb }) => {
  const docConsultRep = doctorsDb.getCustomRepository(DoctorConsultHoursRepository);
  const appts = consultsDb.getCustomRepository(AppointmentRepository);
  const weekDay = format(new Date(), 'EEEE').toUpperCase();
  const doctorAvailalbeSlots: SlotAvailability[] = [];
  function slots(doctorId: string) {
    return new Promise<SlotAvailability>(async (resolve) => {
      let availableSlot: string = '';
      const docConsultHrs = await docConsultRep.getConsultHours(doctorId, weekDay);
      if (docConsultHrs.length === 0) {
        availableSlot = '';
      } else {
        const slot = await appts.getDoctorNextAvailSlot(doctorId);
        if (slot && docConsultHrs) {
          if (slot >= docConsultHrs[0].startTime && slot <= docConsultHrs[0].endTime) {
            availableSlot = slot;
          } else {
            availableSlot = '';
          }
        }
      }
      const curDate = format(new Date(), 'yyyy-MM-dd');
      if (availableSlot != '') {
        availableSlot = `${curDate}T${availableSlot}:00.000Z`;
      }
      const doctorSlot: SlotAvailability = { doctorId, availableSlot, currentDateTime: new Date() };
      doctorAvailalbeSlots.push(doctorSlot);
      resolve(doctorSlot);
    });
  }
  const promises: object[] = [];
  DoctorNextAvailableSlotInput.doctorIds.map(async (doctorId) => {
    promises.push(slots(doctorId));
  });
  await Promise.all(promises);
  return { doctorAvailalbeSlots };
};

export const getNextAvailableSlotResolvers = {
  Query: {
    getDoctorNextAvailableSlot,
  },
};
