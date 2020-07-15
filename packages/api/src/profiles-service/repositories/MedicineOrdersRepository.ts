import { EntityRepository, Repository, Not, Between, In, MoreThan } from 'typeorm';
import {
  MedicineOrders,
  MedicineOrderLineItems,
  MedicineOrderPayments,
  MedicineOrdersStatus,
  MEDICINE_ORDER_STATUS,
  MedicineOrderInvoice,
  MEDICINE_ORDER_TYPE,
  MedicineOrderShipments,
  MedicineOrderCancelReason,
  ONE_APOLLO_USER_REG,
  OneApollTransaction,
} from 'profiles-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { format, addDays, differenceInMinutes } from 'date-fns';

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

  async getOneApolloUser(mobileNumber: string) {
    try {
      const response = await fetch(
        `${process.env.ONEAPOLLO_BASE_URL}/Customer/GetByMobile?mobilenumber=${mobileNumber}&BusinessUnit=${process.env.ONEAPOLLO_BUSINESS_UNIT}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            AccessToken: <string>process.env.ONEAPOLLO_ACCESS_TOKEN,
            APIKey: <string>process.env.ONEAPOLLO_API_KEY,
          },
        }
      );
      return response.json();
    } catch (e) {
      console.log('error occured in getOneApolloUser()', e);
      throw new AphError(AphErrorMessages.GET_ONEAPOLLO_USER_ERROR, undefined, { e });
    }
  }

  async createOneApolloUser(oneApollUser: ONE_APOLLO_USER_REG) {
    try {
      const response = await fetch(process.env.ONEAPOLLO_BASE_URL + '/Customer/Register', {
        method: 'POST',
        body: JSON.stringify(oneApollUser),
        headers: {
          'Content-Type': 'application/json',
          AccessToken: <string>process.env.ONEAPOLLO_ACCESS_TOKEN,
          APIKey: <string>process.env.ONEAPOLLO_API_KEY,
        },
      });
      return response.json();
    } catch (e) {
      throw new AphError(AphErrorMessages.CREATE_ONEAPOLLO_USER_ERROR, undefined, { e });
    }
  }
  async createOneApolloTransaction(transaction: Partial<OneApollTransaction>) {
    try {
      const response = await fetch(process.env.ONEAPOLLO_BASE_URL + '/transaction/create', {
        method: 'POST',
        body: JSON.stringify(transaction),
        headers: {
          'Content-Type': 'application/json',
          AccessToken: <string>process.env.ONEAPOLLO_ACCESS_TOKEN,
          APIKey: <string>process.env.ONEAPOLLO_API_KEY,
        },
      });
      return response.json();
    } catch (e) {
      throw new AphError(AphErrorMessages.CREATE_ONEAPOLLO_USER_TRANSACTION_ERROR, undefined, {
        e,
      });
    }
  }

  getInvoiceDetailsByOrderId(orderId: MedicineOrders['orderAutoId']) {
    const startDateTime = '2020-06-10 15:45:29.453';
    return MedicineOrderInvoice.find({
      select: ['billDetails', 'itemDetails'],
      where: { orderNo: orderId, createdDate: MoreThan(startDateTime) },
    });
  }

  async getOneApolloUserTransactions(mobileNumber: string) {
    try {
      const response = await fetch(
        `${process.env.ONEAPOLLO_BASE_URL}/Customer/GetAllTransactions?mobilenumber=${mobileNumber}&Count=${process.env.ONEAPOLLO_DEFAULT_TRANSACTIONS_COUNT}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            AccessToken: <string>process.env.ONEAPOLLO_ACCESS_TOKEN,
            APIKey: <string>process.env.ONEAPOLLO_API_KEY,
          },
        }
      );
      return response.json();
    } catch (e) {
      throw new AphError(AphErrorMessages.GET_ONEAPOLLO_USER_TRANSACTIONS_ERROR, undefined, { e });
    }
  }

  findPharamaOrdersByOrderId(orderAutoId: MedicineOrders['orderAutoId']) {
    return this.createQueryBuilder()
      .from(MedicineOrders, 'mo')
      .leftJoinAndSelect(
        MedicineOrderPayments,
        'mp',
        'mo."orderAutoId"=mp."medicineOrdersOrderAutoId"'
      )
      .select([
        'mp."paymentDateTime"',
        'mp."paymentRefId"',
        'mp."amountPaid"',
        'mp."paymentStatus"',
        'mp."bankTxnId"',
        'mo."orderAutoId"',
        'mo."orderDateTime"',
        'mp."paymentMode"',
        'mo."currentStatus"',
      ])
      .where('mo.orderAutoId = :orderAutoId', { orderAutoId })
      .getRawOne();
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

  findMedicineOrderPayment(id: string) {
    return MedicineOrderPayments.findOne({
      where: { medicineOrders: id },
    }).catch((medicinePaymentError) => {
      throw new AphError(AphErrorMessages.GET_MEDICINE_ORDER_PAYMENT_ERROR, undefined, {
        medicinePaymentError,
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

  updateMedicineOrderPayment(
    medicineOrdersId: string,
    medicineOrdersOrderAutoId: number,
    paymentAttrs: Partial<MedicineOrderPayments>
  ) {
    return this.createQueryBuilder()
      .update(MedicineOrderPayments)
      .set(paymentAttrs)
      .where('"medicineOrdersId" = :medicineOrdersId', { medicineOrdersId })
      .andWhere('"medicineOrdersOrderAutoId" =:medicineOrdersOrderAutoId', {
        medicineOrdersOrderAutoId,
      })
      .execute()
      .catch((medicineOrderError) => {
        throw new AphError(AphErrorMessages.UPDATE_MEDICINE_ORDER_PAYMENT_ERROR, undefined, {
          medicineOrderError,
        });
      });
  }

  getMedicineOrderDetails(orderAutoId: number) {
    return this.findOne({
      where: { orderAutoId },
      relations: [
        'patient',
        'medicineOrderLineItems',
        'medicineOrderPayments',
        'patient.patientAddress',
        'medicineOrdersStatus',
        'medicineOrderShipments',
        'medicineOrderShipments.medicineOrdersStatus',
      ],
    });
  }

  getMedicineOrderLineItemByOrderId(id: MedicineOrders['id']) {
    return MedicineOrderLineItems.find({
      where: { medicineOrders: id },
      select: ['medicineSKU', 'quantity'],
    });
  }

  getMedicineOrderDetailsByOrderId(orderAutoId: number) {
    return this.findOne({
      select: ['id', 'currentStatus', 'orderAutoId', 'patientAddressId', 'isOmsOrder', 'patient'],
      where: { orderAutoId },
      relations: ['patient'],
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

  saveMedicineOrderShipment(orderShipmentsAttrs: Partial<MedicineOrderShipments>) {
    return MedicineOrderShipments.create(orderShipmentsAttrs)
      .save()
      .catch((medicineOrderError) => {
        throw new AphError(AphErrorMessages.SAVE_MEDICINE_ORDER_SHIPMENT_ERROR, undefined, {
          medicineOrderError,
        });
      });
  }

  updateMedicineOrderShipment(
    orderShipmentsAttrs: Partial<MedicineOrderShipments>,
    apOrderNo?: string
  ) {
    return this.createQueryBuilder()
      .update(MedicineOrderShipments)
      .set(orderShipmentsAttrs)
      .where('"apOrderNo" = :apOrderNo', { apOrderNo })
      .execute()
      .catch((medicineOrderError) => {
        throw new AphError(AphErrorMessages.SAVE_MEDICINE_ORDER_SHIPMENT_ERROR, undefined, {
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

  findByPatientIds(ids: string[], offset?: number, limit?: number) {
    return this.find({
      where: { patient: In(ids), currentStatus: Not(MEDICINE_ORDER_STATUS.QUOTE) },
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

  getMedicineOrdersList(patientIds: String[]) {
    return this.find({
      where: { patient: In(patientIds) },
      order: { createdDate: 'DESC' },
      relations: [
        'medicineOrderLineItems',
        'medicineOrderPayments',
        'medicineOrdersStatus',
        'medicineOrderShipments',
        'medicineOrderShipments.medicineOrdersStatus',
        'medicineOrderShipments.medicineOrderInvoice',
        'medicineOrderInvoice',
        'patient',
      ],
    });
  }

  getMedicineOrdersListWithoutAbortedStatus(patientIds: String[]) {
    return this.find({
      where: { patient: In(patientIds), currentStatus: Not(MEDICINE_ORDER_STATUS.PAYMENT_ABORTED) },
      order: { createdDate: 'DESC' },
      relations: [
        'medicineOrderLineItems',
        'medicineOrdersStatus',
        'medicineOrderShipments',
        'medicineOrderShipments.medicineOrderInvoice',
      ],
    });
  }

  getMedicineOrdersListWithPayments(patientIds: String[]) {
    return this.find({
      where: { patient: In(patientIds) },
      order: { createdDate: 'DESC' },
      relations: ['medicineOrderPayments'],
    });
  }

  getMedicineOrderDetailsByOderId(orderAutoId: number) {
    return this.findOne({
      where: { orderAutoId },
      relations: [
        'medicineOrderLineItems',
        'medicineOrderPayments',
        'medicineOrdersStatus',
        'medicineOrderShipments',
        'medicineOrderShipments.medicineOrdersStatus',
        'medicineOrderShipments.medicineOrderInvoice',
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
        'medicineOrderShipments',
        'medicineOrderShipments.medicineOrdersStatus',
        'medicineOrderShipments.medicineOrderInvoice',
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
        'medicineOrderShipments',
        'medicineOrderShipments.medicineOrdersStatus',
        'medicineOrderShipments.medicineOrderInvoice',
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
        'medicineOrderShipments',
        'medicineOrderShipments.medicineOrdersStatus',
        'medicineOrderShipments.medicineOrderInvoice',
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

  updateMedicineOrder(id: string, orderAutoId: number, orderObj: Partial<MedicineOrders>) {
    return this.update({ id, orderAutoId }, orderObj);
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
      .leftJoinAndSelect('medicineOrders.medicineOrderShipments', 'medicineOrderShipments')
      .getRawMany();
  }

  updateOrderFullfillment(orderAutoId: number, id: string, apOrderNo: string) {
    this.update({ id, orderAutoId }, { apOrderNo });
  }

  updateOrderReferenceNo(orderAutoId: number, id: string, referenceNo: string) {
    this.update({ id, orderAutoId }, { referenceNo });
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
        orderTat: Not(''),
        orderType: MEDICINE_ORDER_TYPE.CART_ORDER,
        currentStatus: In([
          MEDICINE_ORDER_STATUS.ORDER_CONFIRMED,
          MEDICINE_ORDER_STATUS.ORDER_PLACED,
          MEDICINE_ORDER_STATUS.DELIVERED,
        ]),
      },
    });
    console.log('ordersList====>', ordersList.length);
    let totalCount = 0,
      deliveryCount = 0,
      vdcCount = 0,
      vdcDeliveryCount = 0;

    if (ordersList.length > 0) {
      ordersList.map(async (orderDetails) => {
        console.log('orderAutoId=>', orderDetails.orderAutoId);
        if (
          orderDetails.orderTat.toString() != null &&
          Date.parse(orderDetails.orderTat.toString())
        ) {
          const tatDate = new Date(orderDetails.orderTat.toString());
          console.log('tatDate==>', tatDate);
          const istCreatedDate = orderDetails.createdDate;
          console.log('istCreatedDate==>', istCreatedDate);
          const orderTat = Math.floor(Math.abs(differenceInMinutes(tatDate, istCreatedDate)));
          console.log('orderTat==>', orderTat);
          if (orderTat <= 120) {
            totalCount++;
          } else {
            vdcCount++;
          }
          console.log('counts==>', totalCount, vdcCount);
          if (orderDetails.currentStatus == MEDICINE_ORDER_STATUS.DELIVERED) {
            console.log('inside condition');
            const orderStatusDetails = await MedicineOrdersStatus.findOne({
              where: { medicineOrders: orderDetails, orderStatus: MEDICINE_ORDER_STATUS.DELIVERED },
            });
            console.log('orderStatusDetails=>', orderStatusDetails);
            if (orderStatusDetails) {
              console.log('inside orderStatusDetails');
              console.log(orderStatusDetails.statusDate, orderDetails.createdDate);
              console.log(
                'difference==>',
                Math.abs(
                  differenceInMinutes(orderStatusDetails.statusDate, orderDetails.createdDate)
                )
              );
              const deliveryTat = Math.floor(
                Math.abs(
                  differenceInMinutes(orderStatusDetails.statusDate, orderDetails.createdDate)
                )
              );
              console.log('deliveryTat=>', deliveryTat);
              if (deliveryTat <= 120) {
                deliveryCount++;
              } else {
                vdcDeliveryCount++;
              }
              console.log('delivery,VdcCounts=>', deliveryCount, vdcCount);
            }
          }
        }
      });
    }
    return [totalCount, deliveryCount, vdcCount, vdcDeliveryCount];
  }

  getMedicineOrdersCountByPatient(patient: string) {
    return this.count({
      where: { patient, currentStatus: MEDICINE_ORDER_STATUS.DELIVERED },
    });
  }

  getMedicineOrdersCountByCoupon(coupon: string) {
    return this.count({
      where: { coupon, currentStatus: MEDICINE_ORDER_STATUS.DELIVERED },
    });
  }

  getMedicineOrdersCountByCouponAndPatient(patient: string, coupon: string) {
    return this.count({
      where: { patient, coupon, currentStatus: MEDICINE_ORDER_STATUS.DELIVERED },
    });
  }

  getMedicineOrderCancelReasons() {
    return MedicineOrderCancelReason.find({}).catch((medicineOrderError) => {
      throw new AphError(AphErrorMessages.GET_MEDICINE_ORDER_CANCEL_REASONS_ERROR, undefined, {
        medicineOrderError,
      });
    });
  }
  getMedicineOrderCancelReasonByCode(reasonCode: String) {
    return MedicineOrderCancelReason.findOne({
      where: { reasonCode },
    }).catch((medicineOrderError) => {
      throw new AphError(AphErrorMessages.GET_MEDICINE_ORDER_CANCEL_REASONS_ERROR, undefined, {
        medicineOrderError,
      });
    });
  }

  getLatestMedicineOrderDetails(patientId: string) {
    return MedicineOrders.createQueryBuilder('medicine_orders')
      .leftJoinAndSelect('medicine_orders.medicineOrderLineItems', 'medicineOrderLineItems')
      .leftJoinAndSelect('medicine_orders.medicineOrderPayments', 'medicineOrderPayments')
      .leftJoinAndSelect('medicine_orders.medicineOrdersStatus', 'medicineOrdersStatus')
      .leftJoinAndSelect('medicine_orders.medicineOrderShipments', 'medicineOrderShipments')
      .leftJoinAndSelect('medicineOrderShipments.medicineOrderInvoice', 'medicineOrderInvoice')
      .andWhere('medicine_orders."patientId" = :patientId', { patientId })
      .andWhere('medicine_orders."currentStatus" in (:status1)', {
        status1: MEDICINE_ORDER_STATUS.DELIVERED,
      })
      .orderBy('medicine_orders."createdDate"', 'DESC')
      .getOne();
  }
}
