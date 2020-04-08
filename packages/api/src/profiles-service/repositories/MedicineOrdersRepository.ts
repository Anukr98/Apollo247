import { EntityRepository, Repository, Not, Between, In } from 'typeorm';
import {
  MedicineOrders,
  MedicineOrderLineItems,
  MedicineOrderPayments,
  MedicineOrdersStatus,
  MEDICINE_ORDER_STATUS,
  MedicineOrderInvoice,
  MEDICINE_ORDER_TYPE,
} from 'profiles-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { format, addDays, differenceInHours, addMilliseconds } from 'date-fns';

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
      relations: ['patient', 'medicineOrderLineItems'],
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
      where: { patient, currentStatus: Not(MEDICINE_ORDER_STATUS.QUOTE) },
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

  getPaymentMedicineOrders() {
    return this.find({
      where: { currentStatus: MEDICINE_ORDER_STATUS.PAYMENT_SUCCESS },
      relations: [
        'medicineOrderLineItems',
        'medicineOrderPayments',
        'medicineOrdersStatus',
        'medicineOrderInvoice',
        'patient',
      ],
    });
  }

  getMedicineOrderWithId(orderAutoId: number) {
    return this.findOne({
      where: { orderAutoId },
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
    return this.update(id, { orderDateTime, currentStatus });
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
      MEDICINE_ORDER_STATUS.READY_AT_STORE,
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

  getPrescriptionsCount(prescriptionDate: Date) {
    const newStartDate = new Date(format(addDays(prescriptionDate, -1), 'yyyy-MM-dd') + 'T18:30');
    const newEndDate = new Date(format(prescriptionDate, 'yyyy-MM-dd') + 'T18:30');
    return this.count({
      where: {
        prescriptionImageUrl: Not([null, '']),
        createdDate: Between(newStartDate, newEndDate),
      },
    });
  }

  async getPrescriptionsCountNewOld(selDate: Date) {
    const startDate = new Date(format(addDays(selDate, -1), 'yyyy-MM-dd') + 'T18:30');
    const endDate = new Date(format(selDate, 'yyyy-MM-dd') + 'T18:30');
    //select r.id, r."documentURLs",p."uhidCreatedDate",p."uhid",p."firstName" from medical_records r, patient p
    //where r."documentURLs" is not null and r."documentURLs" != '' and r."patientId" = p.id
    const newPatientCount = await this.createQueryBuilder('medicine_orders')
      .leftJoinAndSelect('medicine_orders.patient', 'patient')
      .where('medicine_orders."prescriptionImageUrl" is not null')
      .andWhere('medicine_orders."createdDate" Between :fromDate AND :toDate', {
        fromDate: startDate,
        toDate: endDate,
      })
      .andWhere('medicine_orders."prescriptionImageUrl" != \'\'')
      .andWhere('patient."uhidCreatedDate" is not null')
      .getCount();

    const oldPatientCount = await this.createQueryBuilder('medicine_orders')
      .leftJoinAndSelect('medicine_orders.patient', 'patient')
      .where('medicine_orders."prescriptionImageUrl" is not null')
      .andWhere('medicine_orders."createdDate" Between :fromDate AND :toDate', {
        fromDate: startDate,
        toDate: endDate,
      })
      .andWhere('medicine_orders."prescriptionImageUrl" != \'\'')
      .andWhere('patient."uhidCreatedDate" is null')
      .getCount();

    return [newPatientCount, oldPatientCount];
  }

  async getValidHubOrders(summaryDate: Date) {
    const newStartDate = new Date(format(addDays(summaryDate, -1), 'yyyy-MM-dd') + 'T18:30');
    const newEndDate = new Date(format(summaryDate, 'yyyy-MM-dd') + 'T18:30');
    const ordersList = await this.find({
      where: {
        createdDate: Between(newStartDate, newEndDate),
        orderTat: Not(['', null]),
        orderType: MEDICINE_ORDER_TYPE.CART_ORDER,
        currentStatus: In([
          MEDICINE_ORDER_STATUS.ORDER_CONFIRMED,
          MEDICINE_ORDER_STATUS.ORDER_PLACED,
          MEDICINE_ORDER_STATUS.DELIVERED,
        ]),
      },
    });
    let totalCount = 0,
      deliveryCount = 0,
      vdcCount = 0,
      vdcDeliveryCount = 0;

    if (ordersList.length > 0) {
      ordersList.map(async (orderDetails) => {
        if (Date.parse(orderDetails.orderTat.toString())) {
          const tatDate = new Date(orderDetails.orderTat.toString());
          const istCreatedDate = addMilliseconds(orderDetails.createdDate, 19800000);
          const orderTat = Math.floor(Math.abs(differenceInHours(tatDate, istCreatedDate)));
          if (orderTat <= 2) {
            totalCount++;
          } else {
            vdcCount++;
          }
          if (orderDetails.currentStatus == MEDICINE_ORDER_STATUS.DELIVERED) {
            const orderStatusDetails = await MedicineOrdersStatus.findOne({
              where: { medicineOrders: orderDetails, orderStatus: MEDICINE_ORDER_STATUS.DELIVERED },
            });
            if (orderStatusDetails) {
              const deliveryTat = Math.floor(
                Math.abs(differenceInHours(orderStatusDetails.statusDate, orderDetails.createdDate))
              );

              if (deliveryTat <= 2) {
                deliveryCount++;
              } else {
                vdcDeliveryCount++;
              }
            }
          }
        }
      });
    }
    return [totalCount, deliveryCount, vdcCount, vdcDeliveryCount];
  }
}
