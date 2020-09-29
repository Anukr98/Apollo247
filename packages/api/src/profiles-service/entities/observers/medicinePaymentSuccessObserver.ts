/* eslint-disable @typescript-eslint/no-explicit-any */
import { EntitySubscriberInterface, EventSubscriber, UpdateEvent } from 'typeorm';
import { MedicineOrders, MEDICINE_ORDER_STATUS } from 'profiles-service/entities';
import { log } from 'customWinstonLogger';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { transactionSuccessTrigger } from 'helpers/subscriptionHelper';
import { TransactionType } from 'ApiConstants';

@EventSubscriber()
export class MedicineEntitySubscriber implements EntitySubscriberInterface<MedicineOrders> {
  afterUpdate(event: UpdateEvent<any>): Promise<any> | void {
    try {
      const oldMedicinePayment: MedicineOrders = MedicineOrders.create(
        event.databaseEntity as MedicineOrders
      );

      const currentMedicinePayment = MedicineOrders.create(event.entity as MedicineOrders);
      if (
        oldMedicinePayment.currentStatus !== MEDICINE_ORDER_STATUS.ORDER_BILLED &&
        currentMedicinePayment.currentStatus == MEDICINE_ORDER_STATUS.ORDER_BILLED
      ) {
        transactionSuccessTrigger({
          amount: `${currentMedicinePayment.paymentInfo.amountPaid}`,
          transactionType: TransactionType.CONSULT,
          transactionDate: currentMedicinePayment.paymentInfo.paymentDateTime || new Date(),
          transactionId: currentMedicinePayment.paymentInfo.paymentRefId,
          sourceTransactionIdentifier: `${currentMedicinePayment.orderAutoId}`,
          mobileNumber: currentMedicinePayment.patient.mobileNumber,
          dob: currentMedicinePayment.patient.dateOfBirth,
          email: currentMedicinePayment.patient.mobileNumber,
          partnerId: currentMedicinePayment.patient.mobileNumber,
        });
      }
    } catch (error) {
      log(
        'consultServiceLogger',
        `MedicineEntitySubscriber`,
        'afterUpdate()',
        JSON.stringify(error),
        ''
      );
      throw new AphError(AphErrorMessages.AFTER_UPDATE_MEDICINE_ERROR, undefined, { error });
    }
  }
}
