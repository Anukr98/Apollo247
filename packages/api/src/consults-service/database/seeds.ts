import { connect } from 'consults-service/database/connect';
import { buildAppointment } from 'consults-service/database/factories/appointmentFactory';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { AppointmentsSessionRepository } from 'consults-service/repositories/appointmentsSessionRepository';
import { getConnection } from 'typeorm';

(async () => {
  console.log('Seeding consults-db...');

  console.log('Establishing connection...');
  await connect();
  const consultsDb = getConnection();

  console.log('Clearing all data...');
  await consultsDb.dropDatabase();
  await consultsDb.synchronize();

  const appointmentRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const appointmentSessionRepo = consultsDb.getCustomRepository(AppointmentsSessionRepository);

  console.log('Building and saving records...');
  const appointment = buildAppointment();
  appointmentRepo.save(appointment);
})();
