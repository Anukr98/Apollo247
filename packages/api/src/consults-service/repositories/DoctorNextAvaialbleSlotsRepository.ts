import { EntityRepository, Repository } from 'typeorm';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { DoctorNextAvaialbleSlots, APPOINTMENT_TYPE } from 'consults-service/entities';

@EntityRepository(DoctorNextAvaialbleSlots)
export class DoctorNextAvaialbleSlotsRepository extends Repository<DoctorNextAvaialbleSlots> {
  async updateSlot(doctorId: string, slotType: string, slot: Date) {
    const doctorSlots = await this.findOne({ where: { doctorId } });
    if (doctorSlots) {
      if (slotType == APPOINTMENT_TYPE.ONLINE) {
        return this.update(doctorSlots.id, { onlineSlot: slot });
      } else {
        return this.update(doctorSlots.id, { physicalSlot: slot });
      }
    } else {
      const doctorSlotsAttrs: Partial<DoctorNextAvaialbleSlots> = {
        doctorId,
        onlineSlot: slot,
      };
      if (slotType == APPOINTMENT_TYPE.PHYSICAL) {
        delete doctorSlotsAttrs.onlineSlot;
        doctorSlotsAttrs.physicalSlot = slot;
      }
      return this.create(doctorSlotsAttrs)
        .save()
        .catch((createErrors) => {
          throw new AphError(AphErrorMessages.CREATE_APPOINTMENT_ERROR, undefined, {
            createErrors,
          });
        });
    }
  }

  getDoctorSlot(doctorId: string) {
    return this.findOne({ where: { doctorId } });
  }
}
