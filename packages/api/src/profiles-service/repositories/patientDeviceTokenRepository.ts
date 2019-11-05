import { EntityRepository, Repository } from 'typeorm';
import { PatientDeviceTokens } from 'profiles-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

@EntityRepository(PatientDeviceTokens)
export class PatientDeviceTokenRepository extends Repository<PatientDeviceTokens> {
  savePatientDeviceToken(deviceTokenAttrs: Partial<PatientDeviceTokens>) {
    return this.create(deviceTokenAttrs)
      .save()
      .catch((patientAddressError) => {
        throw new AphError(AphErrorMessages.SAVE_PATIENT_DEVICE_TOKEN_ERROR, undefined, {
          patientAddressError,
        });
      });
  }

  findDeviceToken(patient: string, deviceToken: string) {
    return this.findOne({ where: { patient, deviceToken } });
  }

  getDeviceToken(patient: string) {
    return this.find({ select: ['deviceToken'], where: { patient } });
  }

  deleteDeviceToken(id: string) {
    return this.delete(id);
  }
}
