import { EntityRepository, Repository } from 'typeorm';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { TransferAppointmentDetails, TRANSFER_STATUS } from 'consults-service/entities';

@EntityRepository(TransferAppointmentDetails)
export class TransferAppointmentRepository extends Repository<TransferAppointmentDetails> {
  saveTransfer(transferAppointmentAttrs: Partial<TransferAppointmentDetails>) {
    return this.create(transferAppointmentAttrs)
      .save()
      .catch((createErrors) => {
        throw new AphError(AphErrorMessages.TRANSFER_APPOINTMENT_ERROR, undefined, {
          createErrors,
        });
      });
  }

  checkTransfer(appointment: string, transferedDocotrId: string) {
    return this.count({ where: { appointment, transferedDocotrId } });
  }

  updateTransfer(id: string, transferStatus: TRANSFER_STATUS) {
    return this.update(id, { transferStatus });
  }

  getTransferDetails(appointment: string) {
    return this.findOne({ where: { appointment, transferStatus: TRANSFER_STATUS.INITIATED } });
  }
}
