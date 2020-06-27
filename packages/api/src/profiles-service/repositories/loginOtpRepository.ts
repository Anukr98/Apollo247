import { EntityRepository, Repository, MoreThanOrEqual } from 'typeorm';
import { LoginOtp, OTP_STATUS } from 'profiles-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { v1 as uuidv1 } from 'uuid';
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
    let id = uuidv1();
    const redis = await pool.getTedis();
    redis.set(this.cacheKey(REDIS_OTP_MOBILE_PREFIX, id), JSON.stringify({ ...otpAttrs, id }));
    redis.expire(this.cacheKey(REDIS_OTP_MOBILE_PREFIX, id), ApiConstants.CACHE_EXPIRATION_120);
    pool.putTedis(redis);
    return { id };
  }

  async verifyOtp(otpAttrs: Partial<LoginOtp>) {
    const { id } = otpAttrs;
    if (id) {
      const redis = await pool.getTedis();
      const validOtpRecord = redis.get(this.cacheKey(REDIS_OTP_MOBILE_PREFIX, id));
      return JSON.parse(validOtpRecord);
    }
  }

  async getValidOtpRecord(id: string) {
    const redis = await pool.getTedis();
    let validOtpRecord = redis.get(this.cacheKey(REDIS_OTP_MOBILE_PREFIX, id));
    validOtpRecord = JSON.parse(validOtpRecord);
    return (validOtpRecord.status == OTP_STATUS.NOT_VERIFIED) ? validOtpRecord : null;
  }

  async updateOtpStatus(id: string, updateAttrs: Partial<LoginOtp>) {
    const redis = await pool.getTedis();
    redis.set(this.cacheKey(REDIS_OTP_MOBILE_PREFIX, id), JSON.stringify(updateAttrs));
    redis.expire(this.cacheKey(REDIS_OTP_MOBILE_PREFIX, id), ApiConstants.CACHE_EXPIRATION_120);
    pool.putTedis(redis);
  }

  deleteOtpRecord(id: string) {
    return this.delete(id);
  }
  cacheKey(key: string, id: string) {
    return `${key}:${id}`;
  }

}
