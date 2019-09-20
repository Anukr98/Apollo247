import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { DoctorsServiceContext } from 'doctors-service/doctorsServiceContext';
import { AphAuthenticationError, AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { BlockedCalendarItemRepository } from 'doctors-service/repositories/blockedCalendarItemRepository';
import { isWithinInterval } from 'date-fns';

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
  const newItemOverlapsExistingItems = existingItems.some(
    ({ start, end }) =>
      isWithinInterval(itemToAdd.start, { start, end }) ||
      isWithinInterval(itemToAdd.end, { start, end })
  );
  if (newItemOverlapsExistingItems)
    throw new AphError(AphErrorMessages.BLOCKED_CALENDAR_ITEM_OVERLAPS);
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

export const blockedCalendarResolvers = {
  Query: {
    getBlockedCalendar,
  },
  Mutation: {
    addBlockedCalendarItem,
    updateBlockedCalendarItem,
    removeBlockedCalendarItem,
  },
};
