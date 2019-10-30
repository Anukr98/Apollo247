import { EntityRepository, Repository } from 'typeorm';
import { ConsultQueueItem } from 'consults-service/entities';

@EntityRepository(ConsultQueueItem)
export class ConsultQueueRepository extends Repository<ConsultQueueItem> {
  findByAppointmentId(appointmentId: string) {
    return this.findOne({ where: { appointmentId } });
  }
}
