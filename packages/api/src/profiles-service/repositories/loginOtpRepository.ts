import { EntityRepository, Repository, MoreThanOrEqual } from 'typeorm';
import { LoginOtp, OTP_STATUS } from 'profiles-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { v1 as uuidv1 } from 'uuid';
import { ApiConstants } from 'ApiConstants';
import { pool } from 'profiles-service/database/connectRedis';
import { relative } from 'path';

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
    try {
      await redis.set(this.cacheKey(REDIS_OTP_MOBILE_PREFIX, id), JSON.stringify({ ...otpAttrs, id }));
      await redis.expire(this.cacheKey(REDIS_OTP_MOBILE_PREFIX, id), ApiConstants.CACHE_EXPIRATION_600);
    } catch (e) {
    } finally {
      pool.putTedis(redis);
    }
    return { id };
  }

  async verifyOtp(otpAttrs: Partial<LoginOtp>) {
    const { id } = otpAttrs;
    if (id) {
      const redis = await pool.getTedis();
      try {
        const validOtpRecord = await redis.get(this.cacheKey(REDIS_OTP_MOBILE_PREFIX, id));
        pool.putTedis(redis);
        if (typeof validOtpRecord === 'string') {
          return JSON.parse(validOtpRecord);
        } else return null;
      } catch (e) {
      } finally {
        pool.putTedis(redis);
      }
    }
  }

  async getValidOtpRecord(id: string) {
    const redis = await pool.getTedis();
    try {
      const OtpRecord = await redis.get(this.cacheKey(REDIS_OTP_MOBILE_PREFIX, id));
      pool.putTedis(redis);
      if (typeof OtpRecord === 'string') {
        const validOtpRecord = JSON.parse(OtpRecord);
        return validOtpRecord && validOtpRecord.status == OTP_STATUS.NOT_VERIFIED
          ? validOtpRecord
          : null;
      } else return null;
    } catch (e) {
    } finally {
      pool.putTedis(redis);
    }
  }

  async updateOtpStatus(id: string, updateAttrs: Partial<LoginOtp>) {
    const redis = await pool.getTedis();
    try {
      await redis.set(this.cacheKey(REDIS_OTP_MOBILE_PREFIX, id), JSON.stringify(updateAttrs));
      await redis.expire(
        this.cacheKey(REDIS_OTP_MOBILE_PREFIX, id),
        ApiConstants.CACHE_EXPIRATION_600
      );
    } catch (e) {
    } finally {
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
