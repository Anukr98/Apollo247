import { EntityRepository, Repository } from 'typeorm';
import { LoginOtp, OTP_STATUS } from 'profiles-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { v1 as uuidv1 } from 'uuid';
import { ApiConstants } from 'ApiConstants';
import { setCache, getCache } from 'profiles-service/database/connectRedis';

const REDIS_OTP_MOBILE_PREFIX: string = 'otp:mobile:';

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
    const id = uuidv1();
    await setCache(
      this.cacheKey(REDIS_OTP_MOBILE_PREFIX, id),
      JSON.stringify({ ...otpAttrs, id, incorrectAttempts: 0 }),
      ApiConstants.CACHE_EXPIRATION_900
    );
    return { id };
  }

  async verifyOtp(otpAttrs: Partial<LoginOtp>) {
    const { id } = otpAttrs;
    if (id) {
      const validOtpRecord = await getCache(this.cacheKey(REDIS_OTP_MOBILE_PREFIX, id));
      if (typeof validOtpRecord === 'string') {
        return JSON.parse(validOtpRecord);
      } else return null;
    }
  }

  async getValidOtpRecord(id: string) {
    const OtpRecord = await getCache(this.cacheKey(REDIS_OTP_MOBILE_PREFIX, id));
    if (typeof OtpRecord === 'string') {
      const validOtpRecord = JSON.parse(OtpRecord);
      return validOtpRecord && (validOtpRecord.status == OTP_STATUS.NOT_VERIFIED || validOtpRecord.status == OTP_STATUS.BLOCKED)
        ? validOtpRecord
        : null;
    } else return null;
  }

  async updateOtpStatus(id: string, updateAttrs: Partial<LoginOtp>) {
    await setCache(
      this.cacheKey(REDIS_OTP_MOBILE_PREFIX, id),
      JSON.stringify(updateAttrs),
      ApiConstants.CACHE_EXPIRATION_900
    );
  }

  deleteOtpRecord(id: string) {
    return this.delete(id);
  }
  cacheKey(key: string, id: string) {
    return `${key}:${id}`;
  }
}
