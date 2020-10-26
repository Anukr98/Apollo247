import { EntityRepository, Repository } from 'typeorm';
import { PlatinumSlots, PLATINUM_SLOTS_STATUS } from 'doctors-service/entities/PlatinumSlotsEntity';

@EntityRepository(PlatinumSlots)
export class PlatinumDoctorsRepository extends Repository<PlatinumSlots> {
  
  async getDoctorsOfTheHourBySpecality(specialtyId: string) {
   return this.createQueryBuilder('platinum_slots')
      .leftJoinAndSelect('platinum_slots.doctor', 'doctor')
      .where('platinum_slots.specialty = :specialtyId', {
        specialtyId,
      })
      .andWhere('platinum_slots.startTime <= :timeNow', { timeNow: new Date() })
      .andWhere('platinum_slots.endTime >= :timeNow', { timeNow: new Date() })
      .andWhere('doctor.isActive = true')
      .andWhere('platinum_slots.status != :status', { status: PLATINUM_SLOTS_STATUS.CANCELLED })
      .getOne();
  }

  async doctorsOfTheHourStatus(doctorId: string){
    console.log('quering');
    return this.createQueryBuilder('platinum_slots')
    .leftJoinAndSelect('platinum_slots.doctor', 'doctor')
    .where('doctor.id = :doctorId', {
      doctorId,
    })
    .andWhere('platinum_slots.startTime <= :timeNow', { timeNow: new Date() })
    .andWhere('platinum_slots.endTime >= :timeNow', { timeNow: new Date() })
    .andWhere('doctor.isActive = true')
    .andWhere('platinum_slots.status != :status', { status: PLATINUM_SLOTS_STATUS.CANCELLED })
    .getOne();
  }
}
