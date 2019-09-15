import { EntityRepository, Repository } from 'typeorm';
import { BlockedCalendarItem } from 'doctors-service/entities';

@EntityRepository(BlockedCalendarItem)
export class BlockedCalendarItemRepository extends Repository<BlockedCalendarItem> {}
