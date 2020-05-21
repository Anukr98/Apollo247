import { EntityRepository, Repository } from 'typeorm';

import { AppointmentRefunds } from 'consults-service/entities';

import { PaytmHeadBody } from 'consults-service/helpers/refundHelper';

import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

@EntityRepository(AppointmentRefunds)
export class AppointmentRefundsRepository extends Repository<AppointmentRefunds> {
  saveRefundInfo(appointmentRefundAttrs: Partial<AppointmentRefunds>) {
    return this.create(appointmentRefundAttrs)
      .save()
      .catch((createErrors) => {
        throw new AphError(AphErrorMessages.CREATE_APPOINTMENT_REFUND_ERROR, undefined, {
          createErrors,
        });
      });
  }

  async raiseRefundRequestWithPaytm(paytmBody: PaytmHeadBody, paytmUrl: string) {
    console.log('paytm final', paytmBody);
    try {
      const response = await fetch(paytmUrl, {
        method: 'POST',
        body: JSON.stringify(paytmBody),
        headers: { 'Content-Type': 'application/json' },
      });
      return response.json();
    } catch (e) {
      throw new AphError(AphErrorMessages.PAYTM_REFUND_REQUEST_ERROR, undefined, { e });
    }
  }

  updateRefund(refId: AppointmentRefunds['refId'], refundObj: Partial<AppointmentRefunds>) {
    return this.update(refId, refundObj).catch((updateRefundError) => {
      throw new AphError(AphErrorMessages.UPDATE_REFUND_ERROR, undefined, {
        updateRefundError,
      });
    });
  }
}
