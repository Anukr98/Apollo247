import { EntityRepository, Repository } from 'typeorm';
import {
  MedicineOrders,
  MedicineOrderLineItems,
  MedicineOrderPayments,
  MedicineOrdersStatus,
  MEDICINE_ORDER_STATUS,
  MedicineOrderInvoice,
} from 'profiles-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { format } from 'date-fns';

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
        throw new AphError(AphErrorMessages.SAVE_MEDICINE_ORDER_LINE_ERROR, undefined, {
          medicineOrderError,
        });
      });
  }

  saveMedicineOrderPayment(paymentAttrs: Partial<MedicineOrderPayments>) {
    return MedicineOrderPayments.create(paymentAttrs)
      .save()
      .catch((medicineOrderError) => {
        throw new AphError(AphErrorMessages.SAVE_MEDICINE_ORDER_PAYMENT_ERROR, undefined, {
          medicineOrderError,
        });
      });
  }

  getMedicineOrderDetails(orderAutoId: number) {
    return this.findOne({
      where: { orderAutoId },
      relations: ['patient', 'medicineOrderLineItems'],
    });
  }

  getMedicineOrderDetailsByAp(apOrderNo: string) {
    return this.findOne({
      where: { apOrderNo },
    });
  }

  saveMedicineOrderStatus(orderStatusAttrs: Partial<MedicineOrdersStatus>, orderAutoId: number) {
    return MedicineOrdersStatus.create(orderStatusAttrs)
      .save()
      .catch((medicineOrderError) => {
        throw new AphError(AphErrorMessages.SAVE_MEDICINE_ORDER_STATUS_ERROR, undefined, {
          medicineOrderError,
        });
      });
  }

  findByPatientId(patient: string, offset?: number, limit?: number) {
    return this.find({
      where: { patient },
      relations: ['medicineOrderLineItems', 'medicineOrderPayments'],
      skip: offset,
      take: limit,
      order: {
        orderDateTime: 'DESC',
      },
    }).catch((error) => {
      throw new AphError(AphErrorMessages.GET_MEDICINE_ORDERS_ERROR, undefined, {
        error,
      });
    });
  }

  getMedicineOrdersList(patient: String) {
    return this.find({
      where: { patient },
      order: { createdDate: 'DESC' },
      relations: [
        'medicineOrderLineItems',
        'medicineOrderPayments',
        'medicineOrdersStatus',
        'medicineOrderInvoice',
        'patient',
      ],
    });
  }

  getMedicineOrderById(patient: string, orderAutoId: number) {
    return this.findOne({
      where: { patient, orderAutoId },
      relations: [
        'medicineOrderLineItems',
        'medicineOrderPayments',
        'medicineOrdersStatus',
        'medicineOrderInvoice',
        'patient',
      ],
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

  getMedicineOrdersListByCreateddate(patient: String, startDate: Date, endDate: Date) {
    const status = [
      MEDICINE_ORDER_STATUS.QUOTE,
      MEDICINE_ORDER_STATUS.ORDER_PLACED,
      MEDICINE_ORDER_STATUS.ORDER_VERIFIED,
      MEDICINE_ORDER_STATUS.OUT_FOR_DELIVERY,
      MEDICINE_ORDER_STATUS.PICKEDUP,
      MEDICINE_ORDER_STATUS.RETURN_INITIATED,
      MEDICINE_ORDER_STATUS.PRESCRIPTION_UPLOADED,
      MEDICINE_ORDER_STATUS.PRESCRIPTION_UPLOADED,
      MEDICINE_ORDER_STATUS.PRESCRIPTION_CART_READY,
    ];
    const newStartDate = new Date(format(startDate, 'yyyy-MM-dd') + 'T18:30');
    const newEndDate = new Date(format(endDate, 'yyyy-MM-dd') + 'T18:30');

    return this.createQueryBuilder('medicineOrders')
      .where('medicineOrders.patient = :patient', { patient })
      .andWhere(
        'medicineOrders.createdDate > :startDate and medicineOrders.createdDate < :endDate',
        { startDate: newStartDate, endDate: newEndDate }
      )
      .andWhere('medicineOrders.currentStatus IN (:...status)', { status: status })
      .leftJoinAndSelect('medicineOrders.medicineOrderLineItems', 'medicineOrderLineItems')
      .leftJoinAndSelect('medicineOrders.medicineOrderPayments', 'medicineOrderPayments')
      .leftJoinAndSelect('medicineOrders.medicineOrdersStatus', 'medicineOrdersStatus')
      .getRawMany();
  }

  updateOrderFullfillment(orderAutoId: number, id: string, apOrderNo: string) {
    this.update({ id, orderAutoId }, { apOrderNo });
  }

  saveMedicineOrderInvoice(orderInvoiceAttrs: Partial<MedicineOrderInvoice>) {
    return MedicineOrderInvoice.create(orderInvoiceAttrs).save();
  }
}
