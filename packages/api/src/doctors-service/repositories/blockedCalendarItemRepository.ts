import { EntityRepository, Repository, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { BlockedCalendarItem } from 'doctors-service/entities';

@EntityRepository(BlockedCalendarItem)
export class BlockedCalendarItemRepository extends Repository<BlockedCalendarItem> {
  checkIfSlotBlocked(slot: Date, doctorId: string) {
    return this.count({
      where: { doctorId, start: MoreThanOrEqual(slot), end: LessThanOrEqual(slot) },
    });
  }
}
