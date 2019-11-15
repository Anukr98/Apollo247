import { EntityRepository, Repository } from 'typeorm';
import { DiagnosticOrders, DiagnosticOrderLineItems } from 'profiles-service/entities';
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

  saveDiagnosticOrderLineItem(lineItemAttrs: Partial<DiagnosticOrderLineItems>) {
    return DiagnosticOrderLineItems.create(lineItemAttrs)
      .save()
      .catch((diagnosticOrderError) => {
        throw new AphError(AphErrorMessages.SAVE_DIAGNOSTIC_ORDER_LINE_ERROR, undefined, {
          diagnosticOrderError,
        });
      });
  }
}
