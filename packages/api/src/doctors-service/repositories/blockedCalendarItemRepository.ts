import { EntityRepository, Repository, LessThanOrEqual, MoreThan, Brackets } from 'typeorm';
import { BlockedCalendarItem } from 'doctors-service/entities';
import { addDays, format } from 'date-fns';
@EntityRepository(BlockedCalendarItem)
export class BlockedCalendarItemRepository extends Repository<BlockedCalendarItem> {
  checkIfSlotBlocked(slot: Date, doctorId: string) {
    return this.find({
      where: { doctorId, start: LessThanOrEqual(slot), end: MoreThan(slot) },
    });
  }

  getBlockedSlots(slot: Date, doctorId: string) {
    const startDate = new Date(format(addDays(slot, -1), 'yyyy-MM-dd') + 'T18:30');
    const endDate = new Date(format(slot, 'yyyy-MM-dd') + 'T18:30');
    return this.createQueryBuilder('blockedCalendarItem')
      .where('blockedCalendarItem.doctorId = :doctorId', { doctorId: doctorId })
      .andWhere(
        new Brackets((qb) => {
          qb.where('not (blockedCalendarItem.start >= :sd and blockedCalendarItem.start > :ed', {
            sd: startDate,
            ed: endDate,
          }).orWhere('blockedCalendarItem.end < :sd and blockedCalendarItem.end <= :ed)', {
            sd: startDate,
            ed: endDate,
          });
        })
      )
      .getMany();
  }
}
