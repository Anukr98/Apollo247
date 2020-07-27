import { EntityRepository, Repository } from 'typeorm';
import { MedicineOrderRefunds } from 'profiles-service/entities';
//to avoid code duplication..
import { REFUND_STATUS } from 'consults-service/entities';

import { PaytmHeadBody } from 'profiles-service/helpers/refundHelper';

import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

@EntityRepository(MedicineOrderRefunds)
export class MedicineOrderRefundsRepository extends Repository<MedicineOrderRefunds> {
  saveRefundInfo(medicineOrdersRefundAttrs: Partial<MedicineOrderRefunds>) {
    return this.create(medicineOrdersRefundAttrs)
      .save()
      .catch((createErrors) => {
        throw new AphError(AphErrorMessages.CREATE_MEDICINE_ORDER_REFUND_ERROR, undefined, {
          createErrors,
        });
      });
  }

  async raiseRefundRequestWithPaytm(paytmBody: PaytmHeadBody, paytmUrl: string) {
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

  async getRefundsByMedicineOrderId(id: MedicineOrderRefunds['medicineOrders']) {
    try {
      return this.findOne({
        where: { medicineOrders: id, refundStatus: REFUND_STATUS.REFUND_REQUEST_RAISED },
        order: { txnTimestamp: 'DESC' },
      });
    } catch (getRefundError) {
      throw new AphError(AphErrorMessages.GET_REFUND_ERROR, undefined, {
        getRefundError,
      });
    }
  }

  updateRefund(refId: MedicineOrderRefunds['refId'], refundObj: Partial<MedicineOrderRefunds>) {
    return this.update(refId, refundObj).catch((updateRefundError) => {
      throw new AphError(AphErrorMessages.UPDATE_REFUND_ERROR, undefined, {
        updateRefundError,
      });
    });
  }
}
