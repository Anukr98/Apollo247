import { connect } from 'profiles-service/database/connect';
import { buildPatient } from 'profiles-service/database/factories/patientFactory';
import { PatientAddressRepository } from 'profiles-service/repositories/patientAddressRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { SearchHistoryRepository } from 'profiles-service/repositories/searchHistoryRepository';
import { getConnection } from 'typeorm';

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
  const patient = buildPatient();
  patientRepo.save(patient);
})();
