import { EntityRepository, Repository, LessThanOrEqual, MoreThan } from 'typeorm';
import { BlockedCalendarItem } from 'doctors-service/entities';
//import { addDays, format } from 'date-fns';
@EntityRepository(BlockedCalendarItem)
export class BlockedCalendarItemRepository extends Repository<BlockedCalendarItem> {
  checkIfSlotBlocked(slot: Date, doctorId: string) {
    return this.find({
      where: { doctorId, start: LessThanOrEqual(slot), end: MoreThan(slot) },
    });
  }

  getBlockedSlots(slot: Date, doctorId: string) {
    // const inputStartDate = format(addDays(slot, -1), 'yyyy-MM-dd');
    // const currentStartDate = new Date(inputStartDate + 'T18:30');
    // const currentEndDate = new Date(format(slot, 'yyyy-MM-dd').toString() + 'T18:29');
    // start: MoreThanOrEqual(currentStartDate),
    // end: LessThanOrEqual(currentEndDate),
    return this.find({
      where: {
        doctorId,
      },
    });
  }
}
