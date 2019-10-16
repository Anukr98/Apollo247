import { EntityRepository, Repository, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { BlockedCalendarItem } from 'doctors-service/entities';
import { addDays, format } from 'date-fns';

@EntityRepository(BlockedCalendarItem)
export class BlockedCalendarItemRepository extends Repository<BlockedCalendarItem> {
  checkIfSlotBlocked(slot: Date, doctorId: string) {
    return this.count({
      where: { doctorId, start: LessThanOrEqual(slot), end: MoreThanOrEqual(slot) },
    });
  }

  getBlockedSlots(slot: Date, doctorId: string) {
    const inputStartDate = format(addDays(slot, -1), 'yyyy-MM-dd');
    const currentStartDate = new Date(inputStartDate + 'T18:30');
    const currentEndDate = new Date(format(slot, 'yyyy-MM-dd').toString() + 'T18:29');
    return this.find({
      where: {
        doctorId,
        start: MoreThanOrEqual(currentStartDate),
        end: LessThanOrEqual(currentEndDate),
      },
    });
  }
}
