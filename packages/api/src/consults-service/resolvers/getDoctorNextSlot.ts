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
    return new Promise<string>(async (resolve) => {
      let availableSlot: string = '';
      const slot = await appts.getDoctorNextAvailSlot(id);
      if (slot) {
        availableSlot = slot;
      }
      console.log(availableSlot, 'doctor slot');
      const doctorSlot: SlotAvailability = { doctorId: id, availableSlot };
      doctorAvailalbeSlots.push(doctorSlot);
      resolve(availableSlot);
    });
  }
  /*const promises: string[] = [];
  DoctorAvailabeNextSlotInput.doctorId.map(async (id) => {
    promises.push(slots(id));
  });
  Promise.all(promises);*/
  await slots(DoctorAvailabeNextSlotInput.doctorId[0]);
  console.log(doctorAvailalbeSlots, 'doctorAvailalbeSlots');
  return { doctorAvailalbeSlots };
};

export const getAvailableNextSlotResolvers = {
  Query: {
    getDoctorNextAvailableSlot,
  },
};
