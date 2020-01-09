import { EntityRepository, Repository, MoreThanOrEqual } from 'typeorm';
import { LoginOtp } from 'profiles-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { subMinutes } from 'date-fns';
import { ApiConstants } from 'ApiConstants';

@EntityRepository(LoginOtp)
export class LoginOtpRepository extends Repository<LoginOtp> {
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
    const { mobileNumber, loginType } = otpAttrs;
    const currentTime = new Date();
    const expirationTime = subMinutes(currentTime, ApiConstants.OTP_EXPIRATION_MINUTES);
    const validOtpRecord = await this.find({
      where: {
        mobileNumber,
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

  async updateOtpStatus(id: string, updateAttrs: Partial<LoginOtp>) {
    return this.update(id, updateAttrs).catch((error) => {
      throw new AphError(AphErrorMessages.CREATE_OTP_ERROR, undefined, {
        error,
      });
    });
  }
}
