import { EntityRepository, Repository } from 'typeorm';
import {
  MedicineOrders,
  MedicineOrderLineItems,
  MedicineOrderPayments,
  MedicineOrdersStatus,
  MEDICINE_ORDER_STATUS,
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

  saveMedicineOrderStatus(orderStatusAttrs: Partial<MedicineOrdersStatus>, orderAutoId: number) {
    return MedicineOrdersStatus.create(orderStatusAttrs).save();
  }

  getMedicineOrdersList(patient: String) {
    return this.find({
      where: { patient },
      relations: ['medicineOrderLineItems', 'medicineOrderPayments', 'medicineOrdersStatus'],
    });
  }

  getMedicineOrderById(patient: string, orderAutoId: number) {
    return this.findOne({
      where: { patient, orderAutoId },
      relations: ['medicineOrderLineItems', 'medicineOrderPayments', 'medicineOrdersStatus'],
    });
  }

  updateMedicineOrderStatus(orderAutoId: number, currentStatus: MEDICINE_ORDER_STATUS) {
    return this.update(orderAutoId, { currentStatus });
  }

  updateMedicineOrderDetails(
    id: string,
    orderAutoId: number,
    orderDateTime: Date,
    currentStatus: MEDICINE_ORDER_STATUS
  ) {
    return this.update({ id, orderAutoId }, { orderDateTime, currentStatus });
  }
}
