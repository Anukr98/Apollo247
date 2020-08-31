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
  MedicineOrderAddress,
  MEDICINE_ORDER_PAYMENT_TYPE,
  MEDICINE_DELIVERY_TYPE,
  PaginateParams,
} from 'profiles-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { format, addDays, differenceInMinutes, getUnixTime } from 'date-fns';
import { getCache, setCache, hmsetCache } from 'profiles-service/database/connectRedis';
import { ApiConstants } from 'ApiConstants';
import { log } from 'customWinstonLogger';

export type SaveMedicineInfoInput = {
  sku: string;
  name: string;
  status: string;
  price: string;
  special_price: string;
  special_price_from: string;
  special_price_to: string;
  qty: number;
  description: string;
  url_key: string;
  base_image: string;
  is_prescription_required: string;
  category_name: string;
  product_discount_category: string;
  sell_online: string;
  molecules: string;
  mou: number;
  gallery_images: string;
  manufacturer: string;
};

const REDIS_ORDER_AUTO_ID_KEY_PREFIX: string = 'orderAutoId:';
@EntityRepository(MedicineOrders)
export class MedicineOrdersRepository extends Repository<MedicineOrders> {
  async saveMedicineOrder(medicineOrderAttrs: Partial<MedicineOrders>) {
    const orderCreated = await this.create(medicineOrderAttrs)
      .save()
      .catch((medicineOrderError) => {
        throw new AphError(AphErrorMessages.SAVE_MEDICINE_ORDER_ERROR, undefined, {
          medicineOrderError,
        });
      });
    const orderCreatedString = JSON.stringify(orderCreated);

    /**
     * Saving order information in redis cache
     * It will be auto deleted in 15 minutes
     */
    setCache(
      `${REDIS_ORDER_AUTO_ID_KEY_PREFIX}${orderCreated.orderAutoId}`,
      orderCreatedString,
      ApiConstants.CACHE_EXPIRATION_900
    );
    return orderCreated;
  }

  getInvoiceDetailsByOrderId(orderId: MedicineOrders['orderAutoId']) {
    return MedicineOrderInvoice.find({
      select: ['billDetails', 'itemDetails'],
      where: { orderNo: orderId },
    });
  }

  getInvoiceWithShipment(id: MedicineOrders['orderAutoId']) {
    return MedicineOrderInvoice.find({
      select: ['billDetails', 'itemDetails', 'medicineOrderShipments'],
      relations: ['medicineOrderShipments'],
      where: { orderNo: id },
    });
  }

  findPharamaOrdersByOrderId(orderAutoId: MedicineOrders['orderAutoId']) {
    return this.createQueryBuilder('mo')
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
  getRefundsAndPaymentsByOrderId(id: MedicineOrders['id']) {
    const paymentType = MEDICINE_ORDER_PAYMENT_TYPE.CASHLESS;
    return MedicineOrderPayments.createQueryBuilder('medicineOrderPayments')
      .innerJoinAndSelect('medicineOrderPayments.medicineOrders', 'medicineOrders')
      .leftJoinAndSelect('medicineOrderPayments.medicineOrderRefunds', 'medicineOrderRefunds')
      .where('medicineOrderPayments.medicineOrders = :id', { id })
      .getOne();
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
      select: ['medicineSKU', 'quantity', 'mou'],
    });
  }

  async getMedicineOrderDetailsByOrderId(orderAutoId: number) {
    /**
     * Fetching from redis cache first, the order details were saved in saveMedicineOrdersOMS.ts
     * If data is not there in cache, then fetch from conventional storage(db)
     */
    const orderResponse = await getCache(`${REDIS_ORDER_AUTO_ID_KEY_PREFIX}${orderAutoId}`);
    if (!orderResponse) {
      return this.findOne({
        select: ['id', 'currentStatus', 'orderAutoId', 'patientAddressId', 'isOmsOrder', 'patient'],
        where: { orderAutoId },
        relations: ['patient'],
      });
    }
    return JSON.parse(orderResponse) as MedicineOrders;
  }

  getMedicineOrderDetailsByAp(apOrderNo: string) {
    return this.findOne({
      where: { apOrderNo },
      relations: ['patient', 'medicineOrderLineItems', 'medicineOrderPayments'],
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

  getMedicineOrdersListWithPayments(
    patientIds: String[],
    paginate: PaginateParams
  ): [Promise<MedicineOrders[]>, Promise<number | null>] {
    // return [data, counts]<promises>;
    return [
      this.createQueryBuilder('medicineOrders')
        .where('medicineOrders.patient IN (:...patientIds)', { patientIds })
        .innerJoinAndSelect('medicineOrders.medicineOrderPayments', 'medicineOrderPayments')
        .leftJoinAndSelect('medicineOrderPayments.medicineOrderRefunds', 'medicineOrderRefunds')
        // apply filters....
        .andWhere('medicineOrders.currentStatus != :currentStatus', {
          currentStatus: MEDICINE_ORDER_STATUS.QUOTE,
        })
        .andWhere('medicineOrders.currentStatus != :currentStatus', {
          currentStatus: MEDICINE_ORDER_STATUS.PAYMENT_ABORTED,
        })
        .andWhere('medicineOrderPayments.paymentType != :paymentType', {
          paymentType: MEDICINE_ORDER_PAYMENT_TYPE.COD,
        })
        .orderBy('medicineOrders.createdDate', 'DESC')
        //send undefined to skip & take fns to skip pagination to support optional pagination
        .skip(paginate.skip)
        .take(paginate.take)
        .getMany(),
      //do pagiantion if needed...
      Number.isInteger(paginate.take || paginate.skip)
        ? this.createQueryBuilder('medicineOrders')
            .where('medicineOrders.patient IN (:...patientIds)', { patientIds })
            .innerJoinAndSelect('medicineOrders.medicineOrderPayments', 'medicineOrderPayments')
            .andWhere('medicineOrders.currentStatus != :currentStatus', { currentStatus: 'QUOTE' })
            .andWhere('medicineOrders.currentStatus != :currentStatus', {
              currentStatus: 'PAYMENT_ABORTED',
            })
            .andWhere('medicineOrderPayments.paymentType != :paymentType', { paymentType: 'COD' })
            .getCount()
        : Promise.resolve(null),
    ];
  }

  getMedicineOrderDetailsByOderId(orderAutoId: number) {
    return this.findOne({
      where: { orderAutoId },
      relations: [
        'medicineOrderLineItems',
        'medicineOrderPayments',
        'medicineOrderRefunds',
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
        'medicineOrderRefunds',
        'medicineOrdersStatus',
        'medicineOrderShipments',
        'medicineOrderShipments.medicineOrdersStatus',
        'medicineOrderShipments.medicineOrderInvoice',
        'medicineOrderInvoice',
        'patient',
      ],
    });
  }

  getMedicineOrderDetailsWithAddressByOrderId(orderAutoId: number) {
    return this.findOne({
      where: { orderAutoId },
      relations: [
        'medicineOrderLineItems',
        'medicineOrderPayments',
        'medicineOrdersStatus',
        'medicineOrderRefunds',
        'medicineOrderShipments',
        'medicineOrderShipments.medicineOrdersStatus',
        'medicineOrderShipments.medicineOrderInvoice',
        'medicineOrderInvoice',
        'medicineOrderAddress',
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
    let totalCount = 0,
      deliveryCount = 0,
      vdcCount = 0,
      vdcDeliveryCount = 0;

    if (ordersList.length > 0) {
      ordersList.map(async (orderDetails) => {
        if (
          orderDetails.orderTat.toString() != null &&
          Date.parse(orderDetails.orderTat.toString())
        ) {
          const tatDate = new Date(orderDetails.orderTat.toString());
          const istCreatedDate = orderDetails.createdDate;
          const orderTat = Math.floor(Math.abs(differenceInMinutes(tatDate, istCreatedDate)));
          if (orderTat <= 120) {
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
                Math.abs(
                  differenceInMinutes(orderStatusDetails.statusDate, orderDetails.createdDate)
                )
              );
              if (deliveryTat <= 120) {
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

  saveMedicineOrderAddress(orderAddressAttrs: Partial<MedicineOrderAddress>) {
    return MedicineOrderAddress.create(orderAddressAttrs).save();
  }

  getMedicineOrder(orderAutoId: number) {
    return this.findOne({ orderAutoId });
  }

  getMedicineOrderWithShipments(orderAutoId: number) {
    return this.findOne({
      where: { orderAutoId },
      relations: [
        'patient',
        'medicineOrderShipments',
        'medicineOrderShipments.medicineOrdersStatus',
      ],
    });
  }

  getMedicineOrderWithPaymentAndShipments(orderAutoId: number) {
    return this.findOne({
      where: { orderAutoId },
      relations: [
        'patient',
        'medicineOrderPayments',
        'medicineOrderShipments',
        'medicineOrderShipments.medicineOrdersStatus',
      ],
    });
  }

  async getOfflineOrderDetails(patientId: string, uhid: string, billNumber: string) {
    if (!uhid) {
      throw new AphError(AphErrorMessages.INVALID_UHID, undefined, {});
    }
    let medicineOrderDetails: any = '';
    if (process.env.NODE_ENV == 'local') uhid = ApiConstants.CURRENT_UHID.toString();
    else if (process.env.NODE_ENV == 'dev') uhid = ApiConstants.CURRENT_UHID.toString();
    const ordersResp = await fetch(
      process.env.PRISM_GET_OFFLINE_ORDERS ? process.env.PRISM_GET_OFFLINE_ORDERS + uhid : '',
      {
        method: 'GET',
        headers: {},
      }
    );
    const textRes = await ordersResp.text();
    const offlineOrdersList = JSON.parse(textRes);
    //console.log(offlineOrdersList.response, offlineOrdersList.response.length, 'offlineOrdersList');
    log(
      'profileServiceLogger',
      `PRISM_GET_OFFLINE_ORDERS_RESP:${uhid}`,
      'getMedicineOrderOMSDetailsWithAddress',
      JSON.stringify(offlineOrdersList),
      ''
    );
    if (offlineOrdersList.errorCode == 0) {
      //const orderDate = fromUnixTime(offlineOrdersList.response[0].billDateTime)
      offlineOrdersList.response.forEach((order: any) => {
        if (order.billNo == billNumber) {
          const lineItems: any[] = [];
          if (order.lineItems) {
            order.lineItems.forEach((item: any) => {
              const itemDets = {
                isMedicine: 1,
                medicineSKU: item.itemId,
                medicineName: item.itemName,
                mrp: item.mrp,
                mou: 1,
                price: item.totalMrp,
                quantity: item.saleQty,
                isPrescriptionNeeded: 0,
              };
              lineItems.push(itemDets);
            });
          }
          const offlineShopAddress = {
            storename: order.siteName,
            address: order.address,
            workinghrs: '24 Hrs',
            phone: order.mobileNo,
            city: order.city,
            state: order.state,
            zipcode: '500033',
            stateCode: 'TS',
          };
          const offlineList: any = {
            id: ApiConstants.OFFLINE_ORDERID,
            orderAutoId: order.id,
            shopAddress: JSON.stringify(offlineShopAddress),
            createdDate:
              format(getUnixTime(order.billDateTime) * 1000, 'yyyy-MM-dd') +
              'T' +
              format(getUnixTime(order.billDateTime) * 1000, 'hh:mm:ss') +
              '.000Z',
            billNumber: order.billNo,
            medicineOrderLineItems: lineItems,
            currentStatus: MEDICINE_ORDER_STATUS.PURCHASED_IN_STORE,
            orderType: MEDICINE_ORDER_TYPE.CART_ORDER,
            patientId: patientId,
            deliveryType: MEDICINE_DELIVERY_TYPE.STORE_PICKUP,
            estimatedAmount: order.mrpTotal,
            productDiscount: order.discountTotal,
            redeemedAmount: order.giftTotal,
            medicineOrdersStatus: [
              {
                id: ApiConstants.OFFLINE_ORDERID,
                statusDate:
                  format(getUnixTime(order.billDateTime) * 1000, 'yyyy-MM-dd') +
                  'T' +
                  format(getUnixTime(order.billDateTime) * 1000, 'hh:mm:ss') +
                  '.000Z',
                orderStatus: MEDICINE_ORDER_STATUS.PURCHASED_IN_STORE,
                hideStatus: true,
              },
            ],
            medicineOrderShipments: [],
          };
          medicineOrderDetails = offlineList;
        }
      });
    }
    return medicineOrderDetails;
  }

  async saveMedicneInfoRedis(saveMedicineInfoInput: SaveMedicineInfoInput) {
    const skuKey = 'medicine:sku:' + saveMedicineInfoInput.sku;
    return await hmsetCache(skuKey, {
      sku: encodeURIComponent(saveMedicineInfoInput.sku),
      name: encodeURIComponent(saveMedicineInfoInput.name),
      status: encodeURIComponent(saveMedicineInfoInput.status),
      price: encodeURIComponent(saveMedicineInfoInput.price),
      special_price:
        saveMedicineInfoInput.special_price != undefined
          ? encodeURIComponent(saveMedicineInfoInput.special_price)
          : '',
      special_price_from:
        saveMedicineInfoInput.special_price_from != undefined
          ? encodeURIComponent(saveMedicineInfoInput.special_price_from)
          : '',
      special_price_to:
        saveMedicineInfoInput.special_price_to != undefined
          ? encodeURIComponent(saveMedicineInfoInput.special_price_to)
          : '',
      qty: encodeURIComponent(saveMedicineInfoInput.qty),
      description: encodeURIComponent(saveMedicineInfoInput.description),
      url_key: encodeURIComponent(saveMedicineInfoInput.url_key),
      base_image: encodeURIComponent(saveMedicineInfoInput.base_image),
      is_prescription_required: encodeURIComponent(saveMedicineInfoInput.is_prescription_required),
      category_name: encodeURIComponent(saveMedicineInfoInput.category_name),
      product_discount_category: encodeURIComponent(
        saveMedicineInfoInput.product_discount_category
      ),
      sell_online: encodeURIComponent(saveMedicineInfoInput.sell_online),
      molecules:
        saveMedicineInfoInput.molecules != undefined
          ? encodeURIComponent(saveMedicineInfoInput.molecules)
          : '',
      mou: encodeURIComponent(saveMedicineInfoInput.mou),
      gallery_images: encodeURIComponent(saveMedicineInfoInput.gallery_images),
      manufacturer: encodeURIComponent(saveMedicineInfoInput.manufacturer),
    });
  }
}
