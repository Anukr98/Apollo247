import { EntityRepository, Repository, MoreThanOrEqual } from 'typeorm';
import { LoginOtp, OTP_STATUS } from 'profiles-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { subMinutes } from 'date-fns';
import { ApiConstants } from 'ApiConstants';
import { pool } from 'profiles-service/database/connectRedis';

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
    const { mobileNumber, otp } = otpAttrs;
    let id = null;
    if (mobileNumber && otp) {
      const redis = await pool.getTedis();
      id = Math.floor(Math.random() * 1000000);
      redis.set(this.cacheKey(REDIS_OTP_MOBILE_PREFIX, mobileNumber), JSON.stringify({ ...otpAttrs, id }));
      redis.expire(this.cacheKey(REDIS_OTP_MOBILE_PREFIX, mobileNumber), ApiConstants.CACHE_EXPIRATION_LOWEST);
      pool.putTedis(redis);

    }

    return { id };
  }

  async verifyOtp(otpAttrs: Partial<LoginOtp>) {
    const { id, mobileNumber } = otpAttrs;
    if (mobileNumber) {
      const redis = await pool.getTedis();
      const validOtpRecord = redis.get(this.cacheKey(REDIS_OTP_MOBILE_PREFIX, mobileNumber));
      return JSON.parse(validOtpRecord);
    }
  }

  async getValidOtpRecord(id: string, mobileNumber: string) {
    const redis = await pool.getTedis();
    let validOtpRecord = redis.get(this.cacheKey(REDIS_OTP_MOBILE_PREFIX, mobileNumber));
    validOtpRecord = JSON.parse(validOtpRecord);
    return (validOtpRecord.status == OTP_STATUS.NOT_VERIFIED) ? validOtpRecord : null;
  }

  async updateOtpStatus(id: string, updateAttrs: Partial<LoginOtp>) {
    const { mobileNumber, otp } = updateAttrs;
    if (mobileNumber && otp) {
      const redis = await pool.getTedis();
      redis.set(this.cacheKey(REDIS_OTP_MOBILE_PREFIX, mobileNumber), JSON.stringify(updateAttrs));
      redis.expire(this.cacheKey(REDIS_OTP_MOBILE_PREFIX, mobileNumber), ApiConstants.CACHE_EXPIRATION_LOWEST);
      pool.putTedis(redis);
    }
  }

  deleteOtpRecord(id: string) {
    return this.delete(id);
  }
  cacheKey(key: string, id: string) {
    return `${key}:${id}`;
  }

}
