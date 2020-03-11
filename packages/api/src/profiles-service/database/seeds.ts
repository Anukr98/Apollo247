import { connect } from 'profiles-service/database/connect';
import {
  buildPatient,
  buildPatientAddress,
} from 'profiles-service/database/factories/patientFactory';
import { PatientAddressRepository } from 'profiles-service/repositories/patientAddressRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';

import { getConnection } from 'typeorm';
import _times from 'lodash/times';
import _random from 'lodash/random';

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

  console.log('Building and saving records...');

  await Promise.all(
    _times(50, async () => {
      const patientObj = buildPatient();
      const patientModel = await patientRepo.save(patientObj);
      return Promise.all(
        _times(_random(1, 8), () => {
          const patientAddressObj = buildPatientAddress({ patient: patientModel });
          return patientAddressRepo.save(patientAddressObj);
        })
      );
    })
  );
})();
