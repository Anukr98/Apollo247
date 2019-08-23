import { getConnection } from 'typeorm';
import { connect } from 'doctors-service/database/connect';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { AppointmentsSessionRepository } from 'consults-service/repositories/appointmentsSessionRepository';
import { buildAppointment } from 'consults-service/database/factories/appointmentFactory';

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
