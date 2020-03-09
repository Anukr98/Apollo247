import { connect } from 'consults-service/database/connect';
import { buildAppointment } from 'consults-service/database/factories/appointmentFactory';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { getConnection } from 'typeorm';
import _times from 'lodash/times';
import _random from 'lodash/random';
import { buildCaseSheet } from 'consults-service/database/factories/caseSheetFactory';
import { CaseSheetRepository } from 'consults-service/repositories/caseSheetRepository';

(async () => {
  console.log('Seeding consults-db...');

  console.log('Establishing connection...');
  await connect();
  const consultsDb = getConnection();

  console.log('Clearing all data...');
  await consultsDb.dropDatabase();
  await consultsDb.synchronize();

  const appointmentRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const caseSheetRepo = consultsDb.getCustomRepository(CaseSheetRepository);

  console.log('Building and saving records...');
  _times(_random(5, 20), () => appointmentRepo.save(buildAppointment()));
  _times(_random(5, 20), () => caseSheetRepo.save(buildCaseSheet()));
})();
