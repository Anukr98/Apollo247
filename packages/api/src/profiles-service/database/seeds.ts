import { connect } from 'profiles-service/database/connect';
import {
  buildPatient,
  buildPatientAddress,
} from 'profiles-service/database/factories/patientFactory';
import { PatientAddressRepository } from 'profiles-service/repositories/patientAddressRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { SearchHistoryRepository } from 'profiles-service/repositories/searchHistoryRepository';
import { getConnection } from 'typeorm';
import _times from 'lodash/times';

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

  _times(50, async () => {
    const patientObj = buildPatient();
    const patientModel = await patientRepo.save(patientObj);
    const patientAddressObj = buildPatientAddress({ patient: patientModel });
    const patientAddressModel = await patientAddressRepo.save(patientAddressObj);
  });
})();
