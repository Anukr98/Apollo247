import { ConsultQueueItem } from 'consults-service/entities';

export const buildConsultQueueItem = (
  attrs: Partial<ConsultQueueItem> & { doctorId: string; appointmentId: string }
) => {
  const consultQueueItem = new ConsultQueueItem();
  return Object.assign(consultQueueItem, attrs);
};
