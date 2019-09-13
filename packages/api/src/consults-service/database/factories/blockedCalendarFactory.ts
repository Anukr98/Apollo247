import { BlockedCalendarItem } from 'doctors-service/entities';
import faker from 'faker';

export const buildBlockedCalendarItem = (
  attrs: Partial<BlockedCalendarItem> & { doctorId: string }
) => {
  const blockedCalendarItem = new BlockedCalendarItem();
  blockedCalendarItem.start = faker.random.boolean() ? faker.date.recent() : faker.date.past();
  blockedCalendarItem.end = faker.date.future();
  return Object.assign(blockedCalendarItem, attrs);
};
