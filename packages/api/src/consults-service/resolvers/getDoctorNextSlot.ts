import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';

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
  const appts = consultsDb.getCustomRepository(AppointmentRepository);
  const doctorAvailalbeSlots: SlotAvailability[] = [];
  function slots(doctorId: string) {
    return new Promise<SlotAvailability>(async (resolve) => {
      let availableSlot: string = '';
      const slot = await appts.getDoctorNextAvailSlot(doctorId);
      if (slot) {
        availableSlot = slot;
      }
      const doctorSlot: SlotAvailability = { doctorId, availableSlot };
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
