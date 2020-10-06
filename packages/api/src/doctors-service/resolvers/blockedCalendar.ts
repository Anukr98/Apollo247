import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { DoctorsServiceContext } from 'doctors-service/doctorsServiceContext';
import { AphAuthenticationError, AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { BlockedCalendarItemRepository } from 'doctors-service/repositories/blockedCalendarItemRepository';
import { areIntervalsOverlapping, isEqual, isAfter } from 'date-fns';
import { RescheduleAppointmentDetailsRepository } from 'consults-service/repositories/rescheduleAppointmentDetailsRepository';
import { ConsultMode } from 'doctors-service/entities';
import _ from 'lodash';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';

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

  input CalendarItem {
    start: DateTime!
    end: DateTime!
    consultMode: ConsultMode
  }

  input BlockMultipleItems {
    doctorId: String!
    reason: String
    itemDetails: [CalendarItem]
  }

  extend type Query {
    getBlockedCalendar(doctorId: String!): BlockedCalendarResult!
  }

  extend type Mutation {
    addBlockedCalendarItem(
      doctorId: String!
      start: DateTime!
      end: DateTime!
      reason: String
    ): BlockedCalendarResult!
    updateBlockedCalendarItem(
      id: Int!
      doctorId: String!
      start: DateTime!
      end: DateTime!
    ): BlockedCalendarResult!
    removeBlockedCalendarItem(id: Int!): BlockedCalendarResult!
    blockMultipleCalendarItems(blockCalendarInputs: BlockMultipleItems): BlockedCalendarResult!
  }
`;

type BlockedCalendarItem = {
  id: number;
  doctorId: string;
  start: Date;
  end: Date;
  reason: string;
};
type BlockedCalendarResult = { blockedCalendar: BlockedCalendarItem[] };

const checkAuth = (doctorId: string, context: DoctorsServiceContext) => {
  if (context && context.currentUser && context.currentUser.id !== doctorId)
    throw new AphAuthenticationError(AphErrorMessages.UNAUTHORIZED);
};

const getRepos = (context: DoctorsServiceContext) => ({
  bciRepo: context.doctorsDb.getCustomRepository(BlockedCalendarItemRepository),
  docRepo: context.doctorsDb.getCustomRepository(DoctorRepository),
});

const doesItemOverlap = (item: BlockedCalendarItem, itemsToCheckAgainst: BlockedCalendarItem[]) =>
  itemsToCheckAgainst.some(({ start, end }) =>
    areIntervalsOverlapping({ start: item.start, end: item.end }, { start, end })
  );

const doesCalendarItemOverlap = (
  item: Omit<Omit<Omit<BlockedCalendarItem, 'reason'>, 'doctorId'>, 'id'>,
  itemsToCheckAgainst: Omit<Omit<Omit<BlockedCalendarItem, 'reason'>, 'doctorId'>, 'id'>[]
) =>
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
  const blockedCalendar = await bciRepo.find({ where: { doctorId }, order: { start: 'ASC' } });
  return { blockedCalendar };
};

const addBlockedCalendarItem: Resolver<
  null,
  Omit<BlockedCalendarItem, 'id'>,
  DoctorsServiceContext,
  BlockedCalendarResult
> = async (parent, { doctorId, start, end, reason }, context) => {
  checkAuth(doctorId, context);
  const { bciRepo, docRepo } = getRepos(context);
  if (isEqual(new Date(start), new Date(end))) {
    throw new AphError(AphErrorMessages.INVALID_DATES);
  }

  if (isAfter(new Date(start), new Date(end))) {
    throw new AphError(AphErrorMessages.INVALID_DATES);
  }

  if (isAfter(new Date(), new Date(start))) {
    throw new AphError(AphErrorMessages.INVALID_DATES);
  }

  const itemToAdd = bciRepo.create({ doctorId, start, end, reason });
  const existingItems = await bciRepo.find({ doctorId });
  const overlap = doesItemOverlap(itemToAdd, existingItems);
  if (overlap) throw new AphError(AphErrorMessages.BLOCKED_CALENDAR_ITEM_OVERLAPS);
  await bciRepo.save(itemToAdd);

  //push notification logic no change
  const rescheduleRepo = context.consultsDb.getCustomRepository(
    RescheduleAppointmentDetailsRepository
  );
  await rescheduleRepo.getAppointmentsAndReschedule(
    doctorId,
    start,
    end,
    context.consultsDb,
    context.doctorsDb,
    context.patientsDb
  );

  const blockedCalendar = await bciRepo.find({ doctorId });
  docRepo.updateDoctorSlots(doctorId, context.consultsDb, context.doctorsDb);

  return { blockedCalendar };
};

const updateBlockedCalendarItem: Resolver<
  null,
  BlockedCalendarItem,
  DoctorsServiceContext,
  BlockedCalendarResult
> = async (parent, { id, doctorId, start, end }, context) => {
  checkAuth(doctorId, context);
  const { bciRepo, docRepo } = getRepos(context);
  /*const itemToUpdate = await bciRepo.findOneOrFail(id);
  const existingItems = (await bciRepo.find({ doctorId })).filter(
  (item) => item.id !== itemToUpdate.id
  );
  const overlap = doesItemOverlap(itemToUpdate, existingItems);
  if (overlap) throw new AphError(AphErrorMessages.BLOCKED_CALENDAR_ITEM_OVERLAPS);*/
  const itemToAdd = bciRepo.create({ doctorId, start, end });
  const itemToUpdate = await bciRepo.findOneOrFail(id);
  const existingItems = (await bciRepo.find({ doctorId })).filter(
    (item) => item.id !== itemToUpdate.id
  );
  const overlap = doesItemOverlap(itemToAdd, existingItems);
  if (overlap) throw new AphError(AphErrorMessages.BLOCKED_CALENDAR_ITEM_OVERLAPS);
  await bciRepo.update({ id, doctorId }, { start, end });
  const blockedCalendar = await bciRepo.find({ doctorId });
  docRepo.updateDoctorSlots(doctorId, context.consultsDb, context.doctorsDb);
  return { blockedCalendar };
};

const removeBlockedCalendarItem: Resolver<
  null,
  { id: string },
  DoctorsServiceContext,
  BlockedCalendarResult
> = async (parent, { id }, context) => {
  const { bciRepo, docRepo } = getRepos(context);
  const item = await bciRepo.findOneOrFail(id);
  const { doctorId } = item;
  checkAuth(doctorId, context);
  await bciRepo.delete(item.id);
  const blockedCalendar = await bciRepo.find({ doctorId });
  docRepo.updateDoctorSlots(doctorId, context.consultsDb, context.doctorsDb);
  return { blockedCalendar };
};

type CalendarItem = {
  start: Date;
  end: Date;
  consultMode: ConsultMode;
};

type BlockMultipleItems = {
  doctorId: string;
  reason: string;
  itemDetails: CalendarItem[];
};

type BlockCalendarInputs = {
  blockCalendarInputs: BlockMultipleItems;
};

const blockMultipleCalendarItems: Resolver<
  null,
  BlockCalendarInputs,
  DoctorsServiceContext,
  BlockedCalendarResult
> = async (parent, { blockCalendarInputs }, context) => {
  const { bciRepo, docRepo } = getRepos(context);
  checkAuth(blockCalendarInputs.doctorId, context);
  const doctorId = blockCalendarInputs.doctorId;
  const reason = blockCalendarInputs.reason;
  const CalendarItem: BlockedCalendarItem[] = [];
  const exceptions = await checkOverlapsAndException(0, 0);

  if (exceptions.dateException > 0) {
    throw new AphError(AphErrorMessages.INVALID_DATES);
  }
  if (exceptions.overlapCount > 0) {
    throw new AphError(AphErrorMessages.BLOCKED_CALENDAR_ITEM_OVERLAPS);
  }

  const uniqueCalendarItems = _.uniqWith(
    blockCalendarInputs.itemDetails,
    (item1, item2) =>
      isEqual(new Date(item1.start), new Date(item2.start)) &&
      isEqual(new Date(item1.end), new Date(item2.end)) &&
      item1.consultMode === item2.consultMode
  );

  if (uniqueCalendarItems.length != blockCalendarInputs.itemDetails.length)
    throw new AphError(AphErrorMessages.BLOCKED_CALENDAR_ITEM_OVERLAPS);

  await bciRepo.save(CalendarItem);

  //push notification starts
  blockCalendarInputs.itemDetails.forEach(async (item) => {
    const start = item.start;
    const end = item.end;
    const rescheduleRepo = context.consultsDb.getCustomRepository(
      RescheduleAppointmentDetailsRepository
    );
    await rescheduleRepo.getAppointmentsAndReschedule(
      doctorId,
      start,
      end,
      context.consultsDb,
      context.doctorsDb,
      context.patientsDb
    );
  });
  //push notification ends

  const blockedCalendar = await bciRepo.find({ doctorId });
  docRepo.updateDoctorSlots(doctorId, context.consultsDb, context.doctorsDb);
  return { blockedCalendar };

  function checkOverlapsAndException(overlapCount: number, dateException: number) {
    let currentIndex = 0;
    return new Promise<{ overlapCount: number; dateException: number }>(async (resolve, reject) => {
      blockCalendarInputs.itemDetails.forEach(async (item, index) => {
        const start = item.start;
        const end = item.end;
        const itemsList = blockCalendarInputs.itemDetails.filter((currentObject, currentIndex) => {
          return currentIndex != index;
        });

        const calendarItemsOverlap = doesCalendarItemOverlap(item, itemsList);
        if (calendarItemsOverlap) overlapCount++;

        if (isEqual(new Date(start), new Date(end))) {
          dateException++;
          resolve({ overlapCount, dateException });
        }
        if (isAfter(new Date(start), new Date(end))) {
          dateException++;
          resolve({ overlapCount, dateException });
        }
        if (isAfter(new Date(), new Date(start))) {
          dateException++;
          resolve({ overlapCount, dateException });
        }

        const consultMode = item.consultMode;
        const itemToAdd = bciRepo.create({ doctorId, start, end, reason, consultMode });
        CalendarItem.push(itemToAdd);
        const existingItems = await bciRepo.find({ doctorId });

        const overlap = doesItemOverlap(itemToAdd, existingItems);
        if (overlap) {
          overlapCount++;
          resolve({ overlapCount, dateException });
        }
        currentIndex++;
        if (currentIndex == blockCalendarInputs.itemDetails.length)
          resolve({ overlapCount, dateException });
      });
    });
  }
};

export const blockedCalendarResolvers = {
  Query: {
    getBlockedCalendar,
  },
  Mutation: {
    addBlockedCalendarItem,
    updateBlockedCalendarItem,
    removeBlockedCalendarItem,
    blockMultipleCalendarItems,
  },
};
