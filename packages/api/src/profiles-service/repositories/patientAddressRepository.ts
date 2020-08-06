import { EntityRepository, Repository } from 'typeorm';
import { PatientAddress } from 'profiles-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { getCache, setCache, delCache } from 'profiles-service/database/connectRedis';
import { ApiConstants } from 'ApiConstants';

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
    const response = await getCache(this.cacheKey(REDIS_ADDRESS_PATIENT_ID_KEY_PREFIX, id));
    if (response && typeof response === 'string') {
      const address_list = JSON.parse(response);
      for (let index = 0; index < address_list.length; index++) {
        address_list[index].createdDate = new Date(address_list[index].createdDate);
        address_list[index].updatedDate = new Date(address_list[index].updatedDate);
      }
      return address_list;
    } else return await this.savePatientAdresslistToCache(id);
  }

  async savePatientAdresslistToCache(id: string) {
    const queryResult = await this.getPatientAddressesFromDb(id);
    setCache(
      this.cacheKey(REDIS_ADDRESS_PATIENT_ID_KEY_PREFIX, id),
      JSON.stringify(queryResult),
      ApiConstants.CACHE_EXPIRATION_3600
    );
    return queryResult;
  }

  async updatePatientAddress(id: string, patientAddressAttrs: Partial<PatientAddress>) {
    const address = await this.findOne({ where: { id } });
    if (address) {
      delCache(this.cacheKey(REDIS_ADDRESS_PATIENT_ID_KEY_PREFIX, id));
      Object.assign(address, patientAddressAttrs);
      return this.save(address);
    } else return address;
  }

  findById(id: string) {
    return this.findOne({ where: { id } });
  }

  deletePatientAddress(id: string) {
    delCache(this.cacheKey(REDIS_ADDRESS_PATIENT_ID_KEY_PREFIX, id));
    return this.delete(id);
  }
}
