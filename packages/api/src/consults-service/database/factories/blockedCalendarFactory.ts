import { BlockedCalendarItem } from 'doctors-service/entities';
import faker from 'faker';
import _random from 'lodash/random';
import { addHours } from 'date-fns';

export const buildBlockedCalendarItem = (
  attrs: Partial<BlockedCalendarItem> & { doctorId: string }
) => {
  const sameDay = faker.random.boolean();
  const start = faker.date.past();
  const end = sameDay ? addHours(start, _random(1, 3)) : faker.date.future();
  const blockedCalendarItem = new BlockedCalendarItem();
  blockedCalendarItem.start = start;
  blockedCalendarItem.end = end;
  return Object.assign(blockedCalendarItem, attrs);
};
