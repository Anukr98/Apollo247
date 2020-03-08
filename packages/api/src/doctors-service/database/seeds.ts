import { connect } from 'doctors-service/database/connect';
import { buildDoctor } from 'doctors-service/database/factories/doctorFactory';
import { DoctorHospitalRepository } from 'doctors-service/repositories/doctorHospitalRepository';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { DoctorSpecialtyRepository } from 'doctors-service/repositories/doctorSpecialtyRepository';
import { StarTeamRepository } from 'doctors-service/repositories/starTeamRepository';
import { getConnection } from 'typeorm';
import _random from 'lodash/random';
import _times from 'lodash/times';
import _reject from 'lodash/reject';
import _sample from 'lodash/sample';
import _sampleSize from 'lodash/sampleSize';
import { buildFacility } from 'doctors-service/database/factories/facilityFactory';
import { FacilityRepository } from 'doctors-service/repositories/facilityRepository';
import {
  Facility,
  Doctor,
  DoctorType,
  Gender,
  DOCTOR_ONLINE_STATUS,
} from 'doctors-service/entities';
import { buildDoctorAndHospital } from 'doctors-service/database/factories/doctorAndHospitalFactory';
import {
  buildDoctorSpecialty,
  allSpecialties,
} from 'doctors-service/database/factories/doctorSpecialtyFactory';
// import { DoctorBankAccountsRepository } from 'doctors-service/repositories/doctorBankAccountsRepository';
// import { buildDoctorBankAccount } from 'doctors-service/database/factories/doctorBankAccountsFactory';
import { PackagesRepository } from 'doctors-service/repositories/packagesRepository';
import { buildPackage, allPackageNames } from 'doctors-service/database/factories/packagesFactory';
import { buildStarTeam } from 'doctors-service/database/factories/starTeamFactory';
import { buildAppointment } from 'consults-service/database/factories/appointmentFactory';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import faker from 'faker';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { buildPatient } from 'profiles-service/database/factories/patientFactory';
import { ConsultQueueRepository } from 'consults-service/repositories/consultQueueRepository';
import { buildConsultQueueItem } from 'doctors-service/database/factories/consultQueueFactory';
import { buildCaseSheet } from 'consults-service/database/factories/caseSheetFactory';
import { CaseSheetRepository } from 'consults-service/repositories/caseSheetRepository';
import { buildBlockedCalendarItem } from 'consults-service/database/factories/blockedCalendarFactory';
import { BlockedCalendarItemRepository } from 'doctors-service/repositories/blockedCalendarItemRepository';

(async () => {
  console.log('Seeding doctors-db...');

  console.log('Establishing connection...');
  await connect();
  const doctorsDb = getConnection();
  const consultsDb = getConnection('consults-db');
  const patientsDb = getConnection('patients-db');

  console.log('Clearing all data...');
  await patientsDb.dropDatabase();
  await patientsDb.synchronize();
  await consultsDb.dropDatabase();
  await consultsDb.synchronize();
  await doctorsDb.dropDatabase();
  await doctorsDb.synchronize();

  // const doctorConsultHoursRepo = doctorsDb.getCustomRepository(DoctorConsultHoursRepository);
  const doctorHospitalRepo = doctorsDb.getCustomRepository(DoctorHospitalRepository);
  // const doctorBankAccountsRepo = doctorsDb.getCustomRepository(DoctorBankAccountsRepository);
  const doctorRepo = doctorsDb.getCustomRepository(DoctorRepository);
  const faiclityRepo = doctorsDb.getCustomRepository(FacilityRepository);
  const doctorSpecialtyRepo = doctorsDb.getCustomRepository(DoctorSpecialtyRepository);
  const starTeamRepo = doctorsDb.getCustomRepository(StarTeamRepository);
  const packagesRepo = doctorsDb.getCustomRepository(PackagesRepository);
  const blockedCalendarRepo = doctorsDb.getCustomRepository(BlockedCalendarItemRepository);

  const appointmentRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const consultQueueRepo = consultsDb.getCustomRepository(ConsultQueueRepository);
  const caseSheetRepo = consultsDb.getCustomRepository(CaseSheetRepository);

  const patientRepo = patientsDb.getCustomRepository(PatientRepository);

  console.log('Building and saving records...');

  console.log('Building facilities...');
  const facilities = await Promise.all(_times(5, () => faiclityRepo.save(buildFacility())));
  console.log(facilities);

  console.log('Building specialties...');
  const doctorSpecialties = await Promise.all(
    allSpecialties.map((name) => doctorSpecialtyRepo.save(buildDoctorSpecialty({ name })))
  );

  console.log('Building doctors...');
  const jrKabir = buildDoctor({
    doctorType: DoctorType.JUNIOR,
    id: 'befa91a6-adb0-488d-a148-cc84ce3cacac',
    firstName: 'Kabir',
    lastName: 'Sarin',
    gender: Gender.MALE,
    emailAddress: 'kabir@sarink.net',
    specialty: _sample(doctorSpecialties),
    delegateNumber: '+91123456789',
    isActive: true, // Don't forget to set this to true or you won't be able to log in!
    onlineStatus: DOCTOR_ONLINE_STATUS.ONLINE,
    mobileNumber: '+919296858696', // OTP is 772345
    firebaseToken: 'gnUQsiiGlrS0NuGgF62RsmvG1HF3',
  });
  const staticDoctorObjs = [jrKabir];
  const staticDoctors = await Promise.all(staticDoctorObjs.map((doc) => doctorRepo.save(doc)));
  const randomDoctors = await Promise.all(
    _times(20, () =>
      doctorRepo.save(
        buildDoctor({
          specialty: _sample(doctorSpecialties),
        })
      )
    )
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

  // console.log('Building doctorBankAccounts...');
  // const doctorBankAccounts = await Promise.all(
  //   _times(5, () =>
  //     doctorBankAccountsRepo.save(buildDoctorBankAccount({ doctor: _sample(doctors) }))
  //   )
  // );
  // console.log(doctorBankAccounts);

  console.log('Building packages...');
  const packages = await Promise.all(
    allPackageNames.map((name) => packagesRepo.save(buildPackage({ name })))
  );
  console.log(packages);

  console.log('Building starTeams...');
  const numStarTeams = 5;
  const starCandidates = _sampleSize(doctors, numStarTeams);
  const possibleAssociatedCandidates = _reject(doctors, (doc) => starCandidates.includes(doc));
  const associatedCandidates = _sampleSize(possibleAssociatedCandidates, numStarTeams);
  const starTeams = await Promise.all(
    _times(numStarTeams, (index) => {
      const starDoctor = starCandidates[index];
      const associatedDoctor = associatedCandidates[index];
      const starTeam = buildStarTeam({ associatedDoctor, starDoctor });
      return starTeamRepo.save(starTeam);
    })
  );
  console.log(starTeams);

  console.log('Building patients...');
  const patients = await Promise.all(_times(50, () => patientRepo.save(buildPatient())));
  console.log(patients);

  console.log('Building appointments...');
  const jrKabirAppointments = await Promise.all(
    _times(15, async () => {
      const patient = _sample(patients)!;
      const jrDocCaseSheet = await caseSheetRepo.save(buildCaseSheet({ doctorId: jrKabir.id }));
      return appointmentRepo.save(
        buildAppointment({
          doctorId: jrKabir.id,
          patientId: patient.id,
          hospitalId: _sample(facilities)!.id,
          patientName: `${patient.firstName} ${patient.lastName}`,
          appointmentDateTime: faker.random.boolean() ? faker.date.past() : faker.date.future(),
          caseSheet: [jrDocCaseSheet],
        })
      );
    })
  );
  console.log(jrKabirAppointments);

  console.log('Building consultqueue...');
  const numConsultQueueItems = 10;
  const consultQueueDoctor = jrKabir;
  const consultQueueAppointments = _sampleSize(jrKabirAppointments, numConsultQueueItems);
  const consultQueue = await Promise.all(
    _times(numConsultQueueItems, (index) =>
      consultQueueRepo.save(
        buildConsultQueueItem({
          doctorId: consultQueueDoctor.id,
          appointmentId: consultQueueAppointments[index].id,
          isActive: faker.random.boolean(),
        })
      )
    )
  );
  console.log(consultQueue);

  console.log('Blocking calendars...');
  const doctorsWithBlockedCalendars = [jrKabir, ..._sampleSize(randomDoctors, 10)];
  const blockedCalendars = await Promise.all(
    doctorsWithBlockedCalendars.flatMap((doc) => {
      const doctorId = doc.id;
      const numItemsToBlockInDoctorsCalendar = _random(1, 4);
      return _times(numItemsToBlockInDoctorsCalendar, () => {
        const blockedCalendarItem = buildBlockedCalendarItem({ doctorId });
        return blockedCalendarRepo.save(blockedCalendarItem);
      });
    })
  );
  console.log(blockedCalendars);

  console.log('Seeding doctors-db complete!');
})();
