import { EntityRepository, Repository, Not } from 'typeorm';
import {
  DiagnosticOrders,
  DiagnosticOrderLineItems,
  DIAGNOSTIC_ORDER_STATUS,
  DiagnosticOrderPayments,
} from 'profiles-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

@EntityRepository(DiagnosticOrders)
export class DiagnosticOrdersRepository extends Repository<DiagnosticOrders> {
  saveDiagnosticOrder(diagnosticOrderAttrs: Partial<DiagnosticOrders>) {
    return this.create(diagnosticOrderAttrs)
      .save()
      .catch((diagnosticOrderError) => {
        throw new AphError(AphErrorMessages.SAVE_DIAGNOSTIC_ORDER_ERROR, undefined, {
          diagnosticOrderError,
        });
      });
  }

  updateDiagnosticOrder(
    id: string,
    preBookingId: string,
    fareyeId: string,
    orderStatus: DIAGNOSTIC_ORDER_STATUS
  ) {
    return this.update(id, { fareyeId, preBookingId, orderStatus });
  }

  saveDiagnosticOrderLineItem(lineItemAttrs: Partial<DiagnosticOrderLineItems>) {
    return DiagnosticOrderLineItems.create(lineItemAttrs)
      .save()
      .catch((diagnosticOrderError) => {
        throw new AphError(AphErrorMessages.SAVE_DIAGNOSTIC_ORDER_LINE_ERROR, undefined, {
          diagnosticOrderError,
        });
      });
  }

  getListOfOrders(patient: string) {
    return this.find({
      where: { patient, orderStatus: Not(DIAGNOSTIC_ORDER_STATUS.ORDER_FAILED) },
      order: { createdDate: 'DESC' },
      relations: ['diagnosticOrderLineItems', 'diagnosticOrderLineItems.diagnostics'],
    });
  }

  getOrderDetails(id: string) {
    return this.findOne({
      where: { id },
      relations: ['diagnosticOrderLineItems', 'diagnosticOrderLineItems.diagnostics'],
    });
  }

  saveDiagnosticOrderPayment(paymentAttrs: Partial<DiagnosticOrderPayments>) {
    return DiagnosticOrderPayments.create(paymentAttrs)
      .save()
      .catch((error) => {
        throw new AphError(AphErrorMessages.SAVE_DIAGNOSTIC_ORDER_ERROR, undefined, {
          error,
        });
      });
  }
}
