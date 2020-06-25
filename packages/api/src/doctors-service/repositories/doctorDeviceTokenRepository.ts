import { EntityRepository, Repository } from 'typeorm';
import { DoctorDeviceTokens } from 'doctors-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

@EntityRepository(DoctorDeviceTokens)
export class DoctorDeviceTokenRepository extends Repository<DoctorDeviceTokens> {
  saveDoctorDeviceToken(deviceTokenAttrs: Partial<DoctorDeviceTokens>) {
    return this.create(deviceTokenAttrs)
      .save()
      .catch((doctorDeviceTokenError) => {
        throw new AphError(AphErrorMessages.SAVE_DOCTOR_DEVICE_TOKEN_ERROR, undefined, {
          doctorDeviceTokenError,
        });
      });
  }

  findDeviceToken(doctor: string, deviceToken: string) {
    return this.findOne({ where: { doctor, deviceToken } });
  }

  deleteDeviceToken(deviceToken: string) {
    return this.delete({ deviceToken });
  }

  getDeviceTokens(doctor: string) {
    return this.find({ where: { doctor } });
  }
}
