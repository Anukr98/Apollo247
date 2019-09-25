import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { DoctorsServiceContext } from 'doctors-service/doctorsServiceContext';
import { AphAuthenticationError, AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { BlockedCalendarItemRepository } from 'doctors-service/repositories/blockedCalendarItemRepository';
import { areIntervalsOverlapping } from 'date-fns';
import { RescheduleAppointmentDetailsRepository } from 'consults-service/repositories/rescheduleAppointmentDetailsRepository';
import { getAppointmentsAndReschedule } from 'consults-service/resolvers/rescheduleAppointment';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { TRANSFER_INITIATED_TYPE, TRANSFER_STATUS } from 'consults-service/entities';
import { getConnection } from 'typeorm';

export const blockedCalendarTypeDefs = gql`
  type BlockedCalendarItem {
    id: Int!
    doctorId: String!
    start: DateTime!
    end: DateTime!
  }

  type BlockedCalendarResult {
    blockedCalendar: [BlockedCalendarItem!]!
  }

  extend type Query {
    getBlockedCalendar(doctorId: String!): BlockedCalendarResult!
  }

  extend type Mutation {
    addBlockedCalendarItem(
      doctorId: String!
      start: DateTime!
      end: DateTime!
    ): BlockedCalendarResult!
    updateBlockedCalendarItem(
      id: Int!
      doctorId: String!
      start: DateTime!
      end: DateTime!
    ): BlockedCalendarResult!
    removeBlockedCalendarItem(id: Int!): BlockedCalendarResult!
    testInitiateRescheduleAppointment1(
      doctorId: String!
      startDate: DateTime!
      endDate: DateTime!
    ): Boolean!
  }
`;

type BlockedCalendarItem = {
  id: number;
  doctorId: string;
  start: Date;
  end: Date;
};
type BlockedCalendarResult = { blockedCalendar: BlockedCalendarItem[] };

const checkAuth = (doctorId: string, context: DoctorsServiceContext) => {
  if (context && context.currentUser && context.currentUser.id !== doctorId)
    throw new AphAuthenticationError(AphErrorMessages.UNAUTHORIZED);
};

const getRepos = (context: DoctorsServiceContext) => ({
  bciRepo: context.doctorsDb.getCustomRepository(BlockedCalendarItemRepository),
});

const doesItemOverlap = (item: BlockedCalendarItem, itemsToCheckAgainst: BlockedCalendarItem[]) =>
  itemsToCheckAgainst.some(({ start, end }) =>
    areIntervalsOverlapping({ start: item.start, end: item.end }, { start, end })
  );

const getBlockedCalendar: Resolver<
  null,
  { doctorId: string },
  DoctorsServiceContext,
  BlockedCalendarResult
> = async (parent, { doctorId }, context) => {
  checkAuth(doctorId, context);
  const { bciRepo } = getRepos(context);
  const blockedCalendar = await bciRepo.find({ doctorId });
  return { blockedCalendar };
};

const addBlockedCalendarItem: Resolver<
  null,
  Omit<BlockedCalendarItem, 'id'>,
  DoctorsServiceContext,
  BlockedCalendarResult
> = async (parent, { doctorId, start, end }, context) => {
  checkAuth(doctorId, context);
  const { bciRepo } = getRepos(context);
  const itemToAdd = bciRepo.create({ doctorId, start, end });
  const existingItems = await bciRepo.find({ doctorId });
  const overlap = doesItemOverlap(itemToAdd, existingItems);
  if (overlap) throw new AphError(AphErrorMessages.BLOCKED_CALENDAR_ITEM_OVERLAPS);
  await bciRepo.save(itemToAdd);
  const blockedCalendar = await bciRepo.find({ doctorId });
  return { blockedCalendar };
};

const updateBlockedCalendarItem: Resolver<
  null,
  BlockedCalendarItem,
  DoctorsServiceContext,
  BlockedCalendarResult
> = async (parent, { id, doctorId, start, end }, context) => {
  checkAuth(doctorId, context);
  const { bciRepo } = getRepos(context);
  const itemToUpdate = await bciRepo.findOneOrFail(id);
  const existingItems = (await bciRepo.find({ doctorId })).filter(
    (item) => item.id !== itemToUpdate.id
  );
  const overlap = doesItemOverlap(itemToUpdate, existingItems);
  if (overlap) throw new AphError(AphErrorMessages.BLOCKED_CALENDAR_ITEM_OVERLAPS);
  await bciRepo.update({ id, doctorId }, { start, end });
  const blockedCalendar = await bciRepo.find({ doctorId });
  return { blockedCalendar };
};

const removeBlockedCalendarItem: Resolver<
  null,
  { id: string },
  DoctorsServiceContext,
  BlockedCalendarResult
> = async (parent, { id }, context) => {
  const { bciRepo } = getRepos(context);
  const item = await bciRepo.findOneOrFail(id);
  const { doctorId } = item;
  checkAuth(doctorId, context);
  await bciRepo.delete(item.id);
  const blockedCalendar = await bciRepo.find({ doctorId });
  return { blockedCalendar };
};

const testInitiateRescheduleAppointment1: Resolver<
  null,
  { doctorId: string; startDate: Date; endDate: Date },
  DoctorsServiceContext,
  Boolean
> = async (parent, args, { consultsDb, doctorsDb, patientsDb }) => {
  const resRepo = consultsDb.getCustomRepository(RescheduleAppointmentDetailsRepository);
  //const apptRepo = consultsDb.getCustomRepository(AppointmentRepository);
  //await resRepo.getAppointmentsAndReschedule(args.doctorId, args.startDate, args.endDate);
  // const apptDetails = await apptRepo.findById('5e29e59a-4500-443a-a0f9-d98e0a55b294');
  // console.log(apptDetails, 'appt details');
  // if (apptDetails) {
  //   const resdets = await resRepo.findRescheduleRecord(apptDetails);
  //   console.log(resdets);
  // }
  /*const rescheduleAppointmentAttrs = {
    appointmentId: '5e29e59a-4500-443a-a0f9-d98e0a55b294',
    rescheduleReason: '',
    rescheduleInitiatedBy: TRANSFER_INITIATED_TYPE.DOCTOR,
    rescheduleInitiatedId: args.doctorId,
    autoSelectSlot: 0,
    rescheduledDateTime: new Date(),
    rescheduleStatus: TRANSFER_STATUS.INITIATED,
  };
  const consultConn = getConnection('consults-db');
  const reshRepo = consultConn.getCustomRepository(RescheduleAppointmentDetailsRepository);
  const createReschdule = await reshRepo.saveReschedule(rescheduleAppointmentAttrs);
  console.log(createReschdule, 'create Reschdule');*/
  await resRepo.getAppointmentsAndReschedule(
    args.doctorId,
    args.startDate,
    args.endDate,
    consultsDb,
    doctorsDb,
    patientsDb
  );
  return true;
};

export const blockedCalendarResolvers = {
  Query: {
    getBlockedCalendar,
  },
  Mutation: {
    addBlockedCalendarItem,
    updateBlockedCalendarItem,
    removeBlockedCalendarItem,
    testInitiateRescheduleAppointment1,
  },
};
