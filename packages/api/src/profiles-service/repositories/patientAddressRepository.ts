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
// if changing key please also change the same in entity
const REDIS_ADDRESS_PATIENT_ID_KEY_PREFIX: string = 'address:list:patient';
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
    return await this.getPatientAdresslistFromCache(patient);
  }

  async getPatientAddressesFromDb(patient: string) {
    return this.find({ where: { patientId: patient } });
  }
  cacheKey(key: string, id: string) {
    return `${key}:${id}`;
  }

  async getPatientAdresslistFromCache(id: string) {
    const redis = await pool.getTedis();
    try {
      const response = await redis.get(this.cacheKey(REDIS_ADDRESS_PATIENT_ID_KEY_PREFIX, id));
      dLogger(
        new Date(),
        'Redis Cache Read of address',
        `Cache hit ${this.cacheKey(REDIS_ADDRESS_PATIENT_ID_KEY_PREFIX, id)}${id}`
      );
      if (response && typeof response === 'string') {
        return JSON.parse(response);
      } else return await this.savePatientAdresslistToCache(id);
    } catch (e) {
    } finally {
      pool.putTedis(redis);
    }
  }
  async savePatientAdresslistToCache(id: string) {
    const redis = await pool.getTedis();
    try {
      const queryResult = await this.getPatientAddressesFromDb(id);
      await redis.set(
        this.cacheKey(REDIS_ADDRESS_PATIENT_ID_KEY_PREFIX, id),
        JSON.stringify(queryResult)
      );
      redis.expire(this.cacheKey(REDIS_ADDRESS_PATIENT_ID_KEY_PREFIX, id), 3600);
      dLogger(
        new Date(),
        'Redis Cache set of address',
        `Cache hit ${this.cacheKey(REDIS_ADDRESS_PATIENT_ID_KEY_PREFIX, id)}`
      );
      return queryResult;
    } catch (e) {
    } finally {
      pool.putTedis(redis);
    }
  }

  async updatePatientAddress(id: string, patientAddressAttrs: Partial<PatientAddress>) {
    const address = await this.findOne({ where: { id } });
    if (address) {
      Object.assign(address, patientAddressAttrs);
      return this.save(address);
    } else return address;
  }

  findById(id: string) {
    return this.findOne({ where: { id } });
  }

  deletePatientAddress(id: string) {
    return this.delete(id);
  }
}
