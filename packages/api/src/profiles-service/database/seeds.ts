import { connect } from 'profiles-service/database/connect';
import {
  buildPatient,
  buildPatientAddress,
} from 'profiles-service/database/factories/patientFactory';
import { PatientAddressRepository } from 'profiles-service/repositories/patientAddressRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { SearchHistoryRepository } from 'profiles-service/repositories/searchHistoryRepository';
import { getConnection } from 'typeorm';
import faker from 'faker/locale/en_IND';
import _ from 'lodash';

(async () => {
  console.log('Seeding profiles-db...');

  console.log('Establishing connection...');
  await connect();
  const profilesDb = getConnection();

  console.log('Clearing all data...');
  await profilesDb.dropDatabase();
  await profilesDb.synchronize();

  const patientRepo = profilesDb.getCustomRepository(PatientRepository);
  const patientAddressRepo = profilesDb.getCustomRepository(PatientAddressRepository);
  const searchHistoryRepo = profilesDb.getCustomRepository(SearchHistoryRepository);

  console.log('Building and saving records...');

  // _.times(50, () => patientRepo.save(buildPatient(), patientAddressRepo.save(buildPatientAddress())));
  _.times(50, () => patientAddressRepo.save(buildPatientAddress()));
})();
