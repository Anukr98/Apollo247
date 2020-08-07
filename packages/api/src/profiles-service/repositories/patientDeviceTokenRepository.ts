import { EntityRepository, Repository, In } from 'typeorm';
import { PatientDeviceTokens } from 'profiles-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { DEVICE_TYPE } from 'profiles-service/entities/index';

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

  deleteDeviceToken(deviceToken: string) {
    return this.delete({ deviceToken });
  }

  getTokensByMobileNumber(mobileNumber: string) {
    return this.createQueryBuilder('patient')
      .leftJoinAndSelect('patient.patient_device_tokens', 'patient_device_tokens')
      .addSelect('COUNT(*) AS deviceCount')
      .where('patient.mobileNumber = :mobileNumber', { mobileNumber })
      .andWhere('patient.isActive = true')
      .getMany();
  }

  deviceTokensOfAllIds(ids: string[]) {
    return this.find({
      patient: In(ids),
    });
  }

  getDeviceVoipPushToken(patient: string, deviceType: DEVICE_TYPE) {
    return this.find({
      where: { patient, deviceType },
    });
  }

  updateVoipPushToken(id: string, updateAttrs: Partial<PatientDeviceTokens>) {
    return this.update(id, updateAttrs);
  }

}
