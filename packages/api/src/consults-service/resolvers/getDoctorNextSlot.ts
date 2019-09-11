import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { DoctorConsultHoursRepository } from 'doctors-service/repositories/doctorConsultHoursRepository';
import { addDays } from 'date-fns';

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
    physicalAvailableSlot: String!
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
  physicalAvailableSlot: string;
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
  //const docConsultRep = doctorsDb.getCustomRepository(DoctorConsultHoursRepository);
  const appts = consultsDb.getCustomRepository(AppointmentRepository);
  //const weekDay = format(new Date(), 'EEEE').toUpperCase();
  const doctorAvailalbeSlots: SlotAvailability[] = [];
  function slots(doctorId: string) {
    return new Promise<SlotAvailability>(async (resolve) => {
      let availableSlot: string = '';
      let physicalAvailableSlot: string = '';
      //const docConsultHrs = await docConsultRep.getConsultHours(doctorId, weekDay);
      /*if (docConsultHrs.length === 0) {
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
      }*/
      //availableSlot = await appts.getDoctorNextSlotDate(doctorId, new Date(), doctorsDb);
      /*const curDate = format(new Date(), 'yyyy-MM-dd');
      if (availableSlot != '') {
        availableSlot = `${curDate}T${availableSlot}:00.000Z`;
      }*/

      const docConsultRep = doctorsDb.getCustomRepository(DoctorConsultHoursRepository);
      const docConsultHrsOnline = await docConsultRep.checkByDoctorAndConsultMode(
        doctorId,
        'ONLINE'
      );
      const docConsultHrsPhysical = await docConsultRep.checkByDoctorAndConsultMode(
        doctorId,
        'PHYSICAL'
      );
      if (docConsultHrsOnline > 0) {
        //if the slot is empty check for next day
        let nextDate = new Date();
        while (true) {
          const nextSlot = await appts.getDoctorNextSlotDate(
            doctorId,
            nextDate,
            doctorsDb,
            'ONLINE'
          );
          if (nextSlot != '' && nextSlot != undefined) {
            availableSlot = nextSlot;
            break;
          }
          nextDate = addDays(nextDate, 1);
        }
      }

      if (docConsultHrsPhysical > 0) {
        //if the slot is empty check for next day
        let nextDate = new Date();
        while (true) {
          const nextSlot = await appts.getDoctorNextSlotDate(
            doctorId,
            nextDate,
            doctorsDb,
            'PHYSICAL'
          );
          if (nextSlot != '' && nextSlot != undefined) {
            physicalAvailableSlot = nextSlot;
            break;
          }
          nextDate = addDays(nextDate, 1);
        }
      }

      const doctorSlot: SlotAvailability = {
        doctorId,
        availableSlot,
        physicalAvailableSlot,
        currentDateTime: new Date(),
      };
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
