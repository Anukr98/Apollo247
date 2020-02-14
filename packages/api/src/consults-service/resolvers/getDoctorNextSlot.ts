import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { DoctorConsultHoursRepository } from 'doctors-service/repositories/doctorConsultHoursRepository';
import { addDays } from 'date-fns';
import { APPOINTMENT_TYPE } from 'consults-service/entities';

export const getNextAvailableSlotTypeDefs = gql`
  input DoctorNextAvailableSlotInput {
    availableDate: Date!
    doctorIds: [ID!]!
    availableType: APPOINTMENT_TYPE
    currentTimeInput: DateTime
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
  availableType: APPOINTMENT_TYPE;
  currentTimeInput: Date;
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
  function slots(doctorId: string, availableType: APPOINTMENT_TYPE, inputDate: Date) {
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
      if (
        docConsultHrsOnline > 0 &&
        (availableType == APPOINTMENT_TYPE.BOTH || availableType == APPOINTMENT_TYPE.ONLINE)
      ) {
        //if the slot is empty check for next day
        let nextDate = new Date();

        while (true) {
          // const docBlockSlots = await appts.checkIfDayBlocked(doctorId, nextDate, doctorsDb);
          // console.log(docBlockSlots, 'docBlockslots');
          /*if (docBlockSlots[1] == 1 && docBlockSlots[0] > 1) {
            nextDate = addDays(nextDate, docBlockSlots[0]);
          } else {*/
          const nextSlot = await appts.getDoctorNextSlotDate(
            doctorId,
            nextDate,
            doctorsDb,
            'ONLINE',
            inputDate
          );
          if (nextSlot != '' && nextSlot != undefined) {
            availableSlot = nextSlot;
            break;
          }
          nextDate = addDays(nextDate, 1);
          //}
        }
      }

      if (docConsultHrsPhysical > 0 && availableType == APPOINTMENT_TYPE.BOTH) {
        //if the slot is empty check for next day
        let nextDate = new Date();
        while (true) {
          const nextSlot = await appts.getDoctorNextSlotDate(
            doctorId,
            nextDate,
            doctorsDb,
            'PHYSICAL',
            inputDate
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
  let inputDate: Date;
  let availableType = APPOINTMENT_TYPE.BOTH;
  if (DoctorNextAvailableSlotInput.availableType) {
    availableType = DoctorNextAvailableSlotInput.availableType;
  }
  if (DoctorNextAvailableSlotInput.currentTimeInput) {
    inputDate = DoctorNextAvailableSlotInput.currentTimeInput;
  }
  DoctorNextAvailableSlotInput.doctorIds.map(async (doctorId) => {
    promises.push(slots(doctorId, availableType, inputDate));
  });
  await Promise.all(promises);
  return { doctorAvailalbeSlots };
};

export const getNextAvailableSlotResolvers = {
  Query: {
    getDoctorNextAvailableSlot,
  },
};
