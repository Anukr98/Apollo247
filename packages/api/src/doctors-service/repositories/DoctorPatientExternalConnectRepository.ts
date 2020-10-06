import { EntityRepository, Repository } from 'typeorm';
import { DoctorPatientExternalConnect } from 'doctors-service/entities';

import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

@EntityRepository(DoctorPatientExternalConnect)
export class DoctorPatientExternalConnectRepository extends Repository<
  DoctorPatientExternalConnect
> {
  saveExternalConnectData(attrs: Partial<DoctorPatientExternalConnect>) {
    return this.save(attrs).catch((error) => {
      throw new AphError(AphErrorMessages.SAVE_EXTERNAL_CONNECT_ERROR, undefined, {
        error,
      });
    });
  }
  findByDoctorAndPatient(doctorId: string, patientId: string) {
    return this.findOne({ where: { doctorId, patientId } }).catch((error) => {
      throw new AphError(AphErrorMessages.GET_EXTERNAL_CONNECT_ERROR, undefined, {
        error,
      });
    });
  }

  findCountDoctorAndPatient(doctorId: string, patientId: string) {
    return this.count({
      where: { doctorId, patientId, externalConnect: true },
    }).catch((error) => {
      throw new AphError(AphErrorMessages.GET_EXTERNAL_CONNECT_ERROR, undefined, {
        error,
      });
    });
  }

  findNoCountDoctorAndPatient(doctorId: string, patientId: string, appointmentId: string) {
    return this.count({
      where: { doctorId, patientId, externalConnect: false, appointmentId },
    }).catch((error) => {
      throw new AphError(AphErrorMessages.GET_EXTERNAL_CONNECT_ERROR, undefined, {
        error,
      });
    });
  }
}
