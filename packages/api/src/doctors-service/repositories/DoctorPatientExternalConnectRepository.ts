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
}
