import { EntityRepository, Repository, LessThanOrEqual, MoreThan, MoreThanOrEqual } from 'typeorm';
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
    const inputStartDate = format(addDays(slot, -1), 'yyyy-MM-dd');
    const currentStartDate = new Date(inputStartDate + 'T18:30');
    const currentEndDate = new Date(format(slot, 'yyyy-MM-dd').toString() + 'T18:29');
    const secondStartDate = new Date(format(addDays(slot, 1), 'yyyy-MM-dd').toString() + 'T18:30');
    const secondEndDate = new Date(format(addDays(slot, 2), 'yyyy-MM-dd').toString() + 'T18:29');
    return this.find({
      where: [
        {
          doctorId,
          start: LessThanOrEqual(currentStartDate),
          end: MoreThanOrEqual(currentEndDate),
        },
        {
          doctorId,
          start: LessThanOrEqual(secondStartDate),
          end: MoreThanOrEqual(secondEndDate),
        },
      ],
    });
    // start: MoreThanOrEqual(currentStartDate),
    // end: LessThanOrEqual(currentEndDate),
    // const flag = process.env.BLOCKED_FIX_WORKING ? process.env.BLOCKED_FIX_WORKING : '0';
    // if (flag == '1') {
    //   return this.find({
    //     where: {
    //       doctorId,
    //       start: LessThanOrEqual(currentStartDate),
    //       end: MoreThanOrEqual(currentEndDate),
    //     },
    //   });
    // } else {
    //   return this.find({
    //     where: {
    //       doctorId,
    //     },
    //   });
    // }
  }
}
