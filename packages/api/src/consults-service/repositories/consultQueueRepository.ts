import { EntityRepository, Repository } from 'typeorm';
import { ConsultQueueItem } from 'consults-service/entities';
import { format, addDays } from 'date-fns';

@EntityRepository(ConsultQueueItem)
export class ConsultQueueRepository extends Repository<ConsultQueueItem> {
  getQueueItemsByAppointmentId(idArray: string[]) {
    return this.createQueryBuilder('consultQueueItem')
      .where('consultQueueItem.appointmentId IN (:...idArray)', { idArray })
      .getRawMany();
  }

  getJuniorDoctorQueueCount(
    idArray: string[],
    fromDate: Date,
    toDate: Date,
    offset?: number,
    limit?: number
  ) {
    const newStartDate = new Date(format(addDays(fromDate, -1), 'yyyy-MM-dd') + 'T18:30');
    const newEndDate = new Date(format(toDate, 'yyyy-MM-dd') + 'T18:30');
    return this.createQueryBuilder('consultQueueItem')
      .select(['consultQueueItem.doctorId as doctorId'])
      .addSelect('COUNT(*) AS queuedConsultsCount')
      .where('consultQueueItem.doctorId IN (:...idArray)', { idArray })
      .andWhere('consultQueueItem.isActive = :isactive', { isactive: true })
      .andWhere('consultQueueItem.createdDate >= :newStartDate', { newStartDate })
      .andWhere('consultQueueItem.createdDate <= :newEndDate', { newEndDate })
      .groupBy('consultQueueItem.doctorId')
      .offset(offset)
      .limit(limit)
      .getRawMany();
  }

  findByAppointmentId(appointmentId: string) {
    return this.findOne({ where: { appointmentId } });
  }
}
