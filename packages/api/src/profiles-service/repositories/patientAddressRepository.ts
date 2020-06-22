import { EntityRepository, Repository } from 'typeorm';
import { PatientAddress } from 'profiles-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { pool } from 'profiles-service/database/connectRedis';
import { debugLog } from 'customWinstonLogger';

const dLogger = debugLog(
  'profileServiceLogger',
  'patientRepository',
  Math.floor(Math.random() * 100000000)
);
const REDIS_PATIENT_ID_KEY_PREFIX: string = 'patieaddress:list:patient';
@EntityRepository(PatientAddress)
export class PatientAddressRepository extends Repository<PatientAddress> {
  savePatientAddress(patientAddressAttrs: Partial<PatientAddress>) {
    return this.create(patientAddressAttrs)
      .save()
      .catch((patientAddressError) => {
        throw new AphError(AphErrorMessages.SAVE_PATIENT_ADDRESS_ERROR, undefined, {
          patientAddressError,
        });
      });
  }

  async getPatientAddressList(patient: string) {
    return await this.getCache(REDIS_PATIENT_ID_KEY_PREFIX, patient);
  }

  async patientAddressList(patient: string) {
    return this.find({ where: { patientId: patient } });
  }
  async cacheKey(key: string, id: string) {
    return `${key}:${id}`;
  }

  async getCache(key: string, id: string) {
    const redis = await pool.getTedis();
    const response = await redis.get(await this.cacheKey(key, id));
    pool.putTedis(redis);
    dLogger(new Date(), 'Redis Cache Read of address', `Cache hit ${this.cacheKey(key, id)}${id}`);
    if (response && typeof response === 'string') {
      return JSON.parse(response);
    } else return await this.SetCache(key, id);
  }
  async SetCache(key: string, id: string) {
    const redis = await pool.getTedis();
    const queryResult = await this.patientAddressList(id);
    redis.set(await this.cacheKey(key, id), JSON.stringify(queryResult));
    redis.expire(await this.cacheKey(key, id), 3600);
    pool.putTedis(redis);
    dLogger(new Date(), 'Redis Cache set of address', `Cache hit ${this.cacheKey(key, id)}${id}`);
    return queryResult;
  }

  async updatePatientAddress(id: string, patientAddressAttrs: Partial<PatientAddress>) {
    const address = await this.findOne({ where: { id } });
    if (address) {
      Object.assign(address, patientAddressAttrs);
      return this.save(address);
    } else return address;
  }

  async findAddress(id: string) {
    return this.findOne({ where: { id } });
  }
  findById(id: string) {
    return this.findOne({ where: { id } });
  }

  deletePatientAddress(id: string) {
    return this.delete(id);
  }
}
