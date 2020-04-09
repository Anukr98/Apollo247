import { EntityRepository, Repository, Connection } from 'typeorm';
import { ConsultQueueItem } from 'consults-service/entities';
import { format, addDays } from 'date-fns';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { DOCTOR_ONLINE_STATUS, DoctorType } from 'doctors-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

@EntityRepository(ConsultQueueItem)
export class ConsultQueueRepository extends Repository<ConsultQueueItem> {
  getQueueItemsByAppointmentId(idArray: string[]) {
    return this.createQueryBuilder('consultQueueItem')
      .where('consultQueueItem.appointmentId IN (:...idArray)', { idArray })
      .getRawMany();
  }

  getJuniorDoctorQueueCount(idArray: string[], fromDate: Date, toDate: Date) {
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
      .getRawMany();
  }

  findByAppointmentId(appointmentId: string) {
    return this.findOne({ where: { appointmentId } });
  }

  async saveOrUpdateConsultQueueItem(consultQueueAttrs: Partial<ConsultQueueItem>) {
    const appointmentExistsInQueue = await this.findByAppointmentId(
      consultQueueAttrs.appointmentId ? consultQueueAttrs.appointmentId : ''
    );
    if (appointmentExistsInQueue) {
      return this.update(appointmentExistsInQueue.id, { isActive: false }).catch((error) => {
        throw new AphError(AphErrorMessages.UPDATE_CONSULT_QUEUE_ERROR, undefined, { error });
      });
    } else {
      return this.save(consultQueueAttrs).catch((error) => {
        throw new AphError(AphErrorMessages.CREATE_CONSULT_QUEUE_ERROR, undefined, { error });
      });
    }
  }

  async getNextJuniorDoctor(doctorsDb: Connection) {
    const docRepo = doctorsDb.getCustomRepository(DoctorRepository);
    const onlineJrDocs = await docRepo.find({
      onlineStatus: DOCTOR_ONLINE_STATUS.ONLINE,
      doctorType: DoctorType.JUNIOR,
      isActive: true,
    });
    let minCount = -1,
      minDoctorId: string = '0';
    console.log(onlineJrDocs.length, 'jd length online');
    if (onlineJrDocs.length > 0) {
      console.log('entered here');
      await getQueueCounts();
      return minDoctorId;
    } else {
      return '0';
    }
    function getQueueCounts() {
      return new Promise(async (resolve, reject) => {
        let serialNo = 1;
        onlineJrDocs.map(async (doctor) => {
          const queueCount = await ConsultQueueItem.count({
            where: { doctorId: doctor.id, isActive: true },
          });
          console.log('each doctor', doctor.id, queueCount);
          if (minCount == -1 || minCount > queueCount) {
            minCount = queueCount;
            minDoctorId = doctor.id;
          }
          console.log('selected count', minCount, minDoctorId);
          if (serialNo == onlineJrDocs.length) {
            resolve(minDoctorId);
          }
          serialNo++;
        });
      });
    }
  }
}
