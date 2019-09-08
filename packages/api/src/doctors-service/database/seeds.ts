import { connect } from 'doctors-service/database/connect';
import { buildDoctor } from 'doctors-service/database/factories/doctorFactory';
import { DoctorConsultHoursRepository } from 'doctors-service/repositories/doctorConsultHoursRepository';
import { DoctorHospitalRepository } from 'doctors-service/repositories/doctorHospitalRepository';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { DoctorSpecialtyRepository } from 'doctors-service/repositories/doctorSpecialtyRepository';
import { StarTeamRepository } from 'doctors-service/repositories/starTeamRepository';
import { getConnection } from 'typeorm';
import _times from 'lodash/times';
import _reject from 'lodash/reject';
import _sample from 'lodash/sample';
import { buildFacility } from 'doctors-service/database/factories/facilityFactory';
import { FacilityRepository } from 'doctors-service/repositories/facilityRepository';
import { Facility, Doctor, DoctorType } from 'doctors-service/entities';
import { buildDoctorAndHospital } from 'doctors-service/database/factories/doctorAndHospitalFactory';
import {
  buildDoctorSpecialty,
  allSpecialties,
} from 'doctors-service/database/factories/doctorSpecialtyFactory';
import { DoctorBankAccountsRepository } from 'doctors-service/repositories/doctorBankAccountsRepository';
import { buildDoctorBankAccount } from 'doctors-service/database/factories/doctorBankAccountsFactory';
import { PackagesRepository } from 'doctors-service/repositories/packagesRepository';
import { buildPackage, allPackageNames } from 'doctors-service/database/factories/packagesFactory';
import { buildStarTeam } from 'doctors-service/database/factories/starTeamFactory';

(async () => {
  console.log('Seeding doctors-db...');

  console.log('Establishing connection...');
  await connect();
  const doctorsDb = getConnection();

  console.log('Clearing all data...');
  await doctorsDb.dropDatabase();
  await doctorsDb.synchronize();

  const doctorConsultHoursRepo = doctorsDb.getCustomRepository(DoctorConsultHoursRepository);
  const doctorHospitalRepo = doctorsDb.getCustomRepository(DoctorHospitalRepository);
  const doctorBankAccountsRepo = doctorsDb.getCustomRepository(DoctorBankAccountsRepository);
  const doctorRepo = doctorsDb.getCustomRepository(DoctorRepository);
  const faiclityRepo = doctorsDb.getCustomRepository(FacilityRepository);
  const doctorSpecialtyRepo = doctorsDb.getCustomRepository(DoctorSpecialtyRepository);
  const starTeamRepo = doctorsDb.getCustomRepository(StarTeamRepository);
  const packagesRepo = doctorsDb.getCustomRepository(PackagesRepository);

  console.log('Building and saving records...');

  console.log('Building facilities...');
  const facilities = await Promise.all(_times(5, () => faiclityRepo.save(buildFacility())));
  console.log(facilities);

  console.log('Building specialties...');
  const doctorSpecialties = await Promise.all(
    allSpecialties.map((name) => doctorSpecialtyRepo.save(buildDoctorSpecialty({ name })))
  );

  console.log('Building doctors...');
  const staticDoctorObjs = [
    buildDoctor({
      firstName: 'Kabir',
      lastName: 'Sarin',
      specialty: _sample(doctorSpecialties),
      doctorType: DoctorType.JUNIOR,
      mobileNumber: '+919999999999',
      isActive: true, // Don't forget to set this to true or you won't be able to log in!
    }),
  ];
  const staticDoctors = await Promise.all(staticDoctorObjs.map((doc) => doctorRepo.save(doc)));
  const randomDoctors = await Promise.all(
    _times(20, () => doctorRepo.save(buildDoctor({ specialty: _sample(doctorSpecialties) })))
  );
  const doctors = [...staticDoctors, ...randomDoctors];
  console.log(doctors);

  console.log('Building doctorAndHospitals...');
  const doctorAndHospitals = await Promise.all(
    _times(5, () => {
      const facility = _sample(facilities) as Facility;
      const doctor = _sample(doctors) as Doctor;
      return doctorHospitalRepo.save(buildDoctorAndHospital({ facility, doctor }));
    })
  );
  console.log(doctorAndHospitals);

  console.log('Building doctorBankAccounts...');
  const doctorBankAccounts = await Promise.all(
    _times(5, () =>
      doctorBankAccountsRepo.save(buildDoctorBankAccount({ doctor: _sample(doctors) }))
    )
  );
  console.log(doctorBankAccounts);

  console.log('Building packages...');
  const packages = await Promise.all(
    allPackageNames.map((name) => packagesRepo.save(buildPackage({ name })))
  );
  console.log(packages);

  console.log('Building starTeams...');
  const starTeams = await Promise.all(
    _times(3, () => {
      const starDoctor = _sample(doctors) as Doctor;
      const associatedDoctor = _sample(
        _reject(doctors, (doc) => doc.id === starDoctor.id)
      ) as Doctor;
      const starTeam = buildStarTeam({ associatedDoctor, starDoctor });
      return starTeamRepo.save(starTeam);
    })
  );
  console.log(starTeams);

  console.log('Seeding doctors-db complete!');
})();
