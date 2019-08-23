import { getConnection } from 'typeorm';
import { connect } from 'doctors-service/database/connect';
import { PatientAddressRepository } from 'profiles-service/repositories/patientAddressRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { SearchHistoryRepository } from 'profiles-service/repositories/searchHistoryRepository';
import { buildPatient } from 'profiles-service/database/factories/patientFactory';

(async () => {
  console.log('Seeding consults-db...');

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
  const patient = buildPatient();
  patientRepo.save(patient);
})();
