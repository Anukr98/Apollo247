/* eslint-disable @typescript-eslint/no-explicit-any */
import { EntitySubscriberInterface, EventSubscriber, UpdateEvent } from 'typeorm';
import { DiagnosticOrderPayments } from 'profiles-service/entities';
import { log } from 'customWinstonLogger';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { transactionSuccessTrigger } from 'helpers/subscriptionHelper';
import { TransactionType } from 'ApiConstants';

@EventSubscriber()
export class DiagnosticEntitySubscriber
  implements EntitySubscriberInterface<DiagnosticOrderPayments> {
  afterUpdate(event: UpdateEvent<any>): Promise<any> | void {
    try {
      // const oldDiagnosticPayment: DiagnosticOrderPayments = DiagnosticOrderPayments.create(
      //   event.databaseEntity as DiagnosticOrderPayments
      // );

      // const currentDiagnosticPayment = DiagnosticOrderPayments.create(
      //   event.entity as DiagnosticOrderPayments
      // );
      // if (
      //   oldDiagnosticPayment?.paymentStatus !== 'success' &&
      //   currentDiagnosticPayment?.paymentStatus == 'success'
      // ) {
      //   transactionSuccessTrigger({
      //     amount: `${currentDiagnosticPayment.amountPaid}`,
      //     transactionType: TransactionType.DIAGNOSTICS,
      //     transactionDate: currentDiagnosticPayment.paymentDateTime || new Date(),
      //     transactionId: currentDiagnosticPayment.txnId,
      //     sourceTransactionIdentifier: `${currentDiagnosticPayment.id}`,
      //     mobileNumber: currentDiagnosticPayment.diagnosticOrders.patient.mobileNumber,
      //     dob: currentDiagnosticPayment.diagnosticOrders.patient.dateOfBirth,
      //     email: currentDiagnosticPayment.diagnosticOrders.patient.emailAddress,
      //     partnerId: currentDiagnosticPayment.diagnosticOrders.patient.partnerId,
      //   });
      // }
    } catch (error) {
      // log(
      //   'consultServiceLogger',
      //   `DiagnosticEntitySubscriber`,
      //   'afterUpdate()',
      //   JSON.stringify(error),
      //   ''
      // );
      // throw new AphError(AphErrorMessages.AFTER_UPDATE_DIAGNOSTIC_ERROR, undefined, { error });
    }
  }
}
