import { EntityRepository, Repository } from 'typeorm';
import { ConsultQueueItem } from 'consults-service/entities';

@EntityRepository(ConsultQueueItem)
export class ConsultQueueRepository extends Repository<ConsultQueueItem> {
  getQueueItemsByAppointmentId(idArray: string[]) {
    return this.createQueryBuilder('consultQueueItem')
      .where('consultQueueItem.appointmentId IN (:...idArray)', { idArray })
      .getRawMany();
  }

  getJuniorDoctorQueueCount(idArray: string[]) {
    return this.createQueryBuilder('consultQueueItem')
      .select(['consultQueueItem.doctorId as doctorId'])
      .addSelect('COUNT(*) AS queuedConsultsCount')
      .where('consultQueueItem.doctorId IN (:...idArray)', { idArray })
      .groupBy('consultQueueItem.doctorId')
      .getRawMany();
  }
}
