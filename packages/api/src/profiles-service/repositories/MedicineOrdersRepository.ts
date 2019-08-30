import { EntityRepository, Repository } from 'typeorm';
import {
  MedicineOrders,
  MedicineOrderLineItems,
  MedicineOrderPayments,
} from 'profiles-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

@EntityRepository(MedicineOrders)
export class MedicineOrdersRepository extends Repository<MedicineOrders> {
  saveMedicineOrder(medicineOrderAttrs: Partial<MedicineOrders>) {
    return this.create(medicineOrderAttrs)
      .save()
      .catch((medicineOrderError) => {
        throw new AphError(AphErrorMessages.SAVE_MEDICINE_ORDER_ERROR, undefined, {
          medicineOrderError,
        });
      });
  }

  saveMedicineOrderLineItem(lineItemAttrs: Partial<MedicineOrderLineItems>) {
    return MedicineOrderLineItems.create(lineItemAttrs)
      .save()
      .catch((medicineOrderError) => {
        throw new AphError(AphErrorMessages.SAVE_MEDICINE_ORDER_ERROR, undefined, {
          medicineOrderError,
        });
      });
  }

  saveMedicineOrderPayment(paymentAttrs: Partial<MedicineOrderPayments>) {
    return MedicineOrderPayments.create(paymentAttrs)
      .save()
      .catch((medicineOrderError) => {
        throw new AphError(AphErrorMessages.SAVE_MEDICINE_ORDER_ERROR, undefined, {
          medicineOrderError,
        });
      });
  }

  getMedicineOrderDetails(orderAutoId: number) {
    return this.findOne({ where: { orderAutoId } });
  }
}
