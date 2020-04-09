import { MedicineOrdersStatus } from 'profiles-service/entities';
import { EntityRepository, Repository } from 'typeorm';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

@EntityRepository(MedicineOrdersStatus)
export class MedicineOrdersStatusRepository extends Repository<MedicineOrdersStatus> {
  saveMedicineOrderStatus(orderStatusAttrs: Partial<MedicineOrdersStatus>, orderAutoId: number) {
    console.log('bbbbbbbbbbbbb', orderStatusAttrs, orderAutoId);
    return this.create(orderStatusAttrs)
      .save()
      .catch((medicineOrderError) => {
        throw new AphError(AphErrorMessages.SAVE_MEDICINE_ORDER_STATUS_ERROR, undefined, {
          medicineOrderError,
        });
      });
  }
}
