import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';

export const getAvailableNextSlotTypeDefs = gql`
  input DoctorAvailabeNextSlotInput {
    availableDate: Date!
    doctorId: [ID!]!
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
      DoctorAvailabeNextSlotInput: DoctorAvailabeNextSlotInput
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

type DoctorAvailabeNextSlotInput = {
  availableDate: Date;
  doctorId: string[];
};

type DoctorAvailabeNextSlotInputArgs = { DoctorAvailabeNextSlotInput: DoctorAvailabeNextSlotInput };

const getDoctorNextAvailableSlot: Resolver<
  null,
  DoctorAvailabeNextSlotInputArgs,
  ConsultServiceContext,
  SlotAvailabilityResult
> = async (parent, { DoctorAvailabeNextSlotInput }, { doctorsDb, consultsDb }) => {
  const appts = consultsDb.getCustomRepository(AppointmentRepository);
  const doctorAvailalbeSlots: SlotAvailability[] = [];
  function slots(id: string) {
    return new Promise<SlotAvailability>(async (resolve) => {
      let availableSlot: string = '';
      const slot = await appts.getDoctorNextAvailSlot(id);
      if (slot) {
        availableSlot = slot;
      }
      const doctorSlot: SlotAvailability = { doctorId: id, availableSlot };
      doctorAvailalbeSlots.push(doctorSlot);
      resolve(doctorSlot);
    });
  }
  const promises: object[] = [];
  DoctorAvailabeNextSlotInput.doctorId.map(async (id) => {
    promises.push(slots(id));
  });
  await Promise.all(promises);
  return { doctorAvailalbeSlots };
};

export const getAvailableNextSlotResolvers = {
  Query: {
    getDoctorNextAvailableSlot,
  },
};
