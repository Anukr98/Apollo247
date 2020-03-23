import { AppointmentDocuments } from 'consults-service/entities';
import { EntityRepository, Repository } from 'typeorm';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { AphError } from 'AphError';

@EntityRepository(AppointmentDocuments)
export class AppointmentDocumentRepository extends Repository<AppointmentDocuments> {
  saveDocument(documentAttrs: Partial<AppointmentDocuments>) {
    return AppointmentDocuments.create(documentAttrs)
      .save()
      .catch((createErrors) => {
        throw new AphError(AphErrorMessages.CREATE_APPOINTMENT_DOCUMENT_ERROR, undefined, {
          createErrors,
        });
      });
  }

  getAllDocuments() {
    return this.find({
      relations: ['appointment'],
    });
  }

  updateUserType(userType: number, appt: AppointmentDocuments) {
    this.update(appt.id, { userType }).catch((getApptError) => {
      throw new AphError(AphErrorMessages.UPDATE_APPOINTMENT_ERROR, undefined, {
        getApptError,
      });
    });
  }
  getDocument(id: string) {
    return this.findOne({ id }).catch((getApptError) => {
      throw new AphError(AphErrorMessages.GET_APPOINTMENT_DOCUMENT_ERROR, undefined, {
        getApptError,
      });
    });
  }

  removeFromAppointmentDocument(id: string) {
    return this.delete(id).catch((getApptError) => {
      throw new AphError(AphErrorMessages.DELETE_APPOINTMENT_DOCUMENT_ERROR, undefined, {
        getApptError,
      });
    });
  }
}
