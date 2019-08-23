import { getConnection } from 'typeorm';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { buildDoctor } from 'doctors-service/database/factories/doctorFactory';
import { DoctorConsultHoursRepository } from 'doctors-service/repositories/doctorConsultHoursRepository';
import { DoctorHospitalRepository } from 'doctors-service/repositories/doctorHospitalRepository';
import { DoctorSpecialtyRepository } from 'doctors-service/repositories/doctorSpecialtyRepository';
import { StarTeamRepository } from 'doctors-service/repositories/starTeamRepository';
import { connect } from 'doctors-service/database/connect';

(async () => {
  console.log('Seeding doctors...');

  console.log('Establishing connection...');
  await connect();
  const doctorsDb = getConnection();

  console.log('Clearing all data...');
  doctorsDb.dropDatabase();
  doctorsDb.synchronize();

  const doctorConsultHoursRepo = doctorsDb.getCustomRepository(DoctorConsultHoursRepository);
  const doctorHospitalRepo = doctorsDb.getCustomRepository(DoctorHospitalRepository);
  const doctorRepo = doctorsDb.getCustomRepository(DoctorRepository);
  const doctorSpecialtyRepo = doctorsDb.getCustomRepository(DoctorSpecialtyRepository);
  const starTeamRepo = doctorsDb.getCustomRepository(StarTeamRepository);

  const doctor = buildDoctor();
  console.log('Creating doctor', doctor);
  doctorRepo.save(doctor);
})();
