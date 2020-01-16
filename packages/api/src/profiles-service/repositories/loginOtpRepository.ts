import { EntityRepository, Repository, MoreThanOrEqual } from 'typeorm';
import { LoginOtp, OTP_STATUS } from 'profiles-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { subMinutes } from 'date-fns';
import { ApiConstants } from 'ApiConstants';

@EntityRepository(LoginOtp)
export class LoginOtpRepository extends Repository<LoginOtp> {
  async findById(id: string) {
    return this.findOne({ id }).catch((getApptError) => {
      throw new AphError(AphErrorMessages.GET_OTP_ERROR, undefined, {
        getApptError,
      });
    });
  }
  async insertOtp(otpAttrs: Partial<LoginOtp>) {
    return this.create(otpAttrs)
      .save()
      .catch((error) => {
        throw new AphError(AphErrorMessages.CREATE_OTP_ERROR, undefined, {
          error,
        });
      });
  }

  async verifyOtp(otpAttrs: Partial<LoginOtp>) {
    const { id, loginType } = otpAttrs;
    const currentTime = new Date();
    const expirationTime = subMinutes(currentTime, ApiConstants.OTP_EXPIRATION_MINUTES);
    const validOtpRecord = await this.find({
      where: {
        id,
        loginType,
        createdDate: MoreThanOrEqual(expirationTime),
      },
      order: { createdDate: 'DESC' },
      take: 1,
    }).catch((error) => {
      throw new AphError(AphErrorMessages.GET_OTP_ERROR, undefined, {
        error,
      });
    });

    return validOtpRecord;
  }

  async getValidOtpRecord(id: string, mobileNumber: string) {
    const validOtpRecord = await this.find({
      where: {
        id,
        mobileNumber,
        status: OTP_STATUS.NOT_VERIFIED,
      },
      order: { createdDate: 'DESC' },
      take: 1,
    }).catch((error) => {
      throw new AphError(AphErrorMessages.GET_OTP_ERROR, undefined, {
        error,
      });
    });

    return validOtpRecord;
  }

  async updateOtpStatus(id: string, updateAttrs: Partial<LoginOtp>) {
    return this.update(id, updateAttrs).catch((error) => {
      throw new AphError(AphErrorMessages.CREATE_OTP_ERROR, undefined, {
        error,
      });
    });
  }

  deleteOtpRecord(id: string) {
    return this.delete(id);
  }
}
