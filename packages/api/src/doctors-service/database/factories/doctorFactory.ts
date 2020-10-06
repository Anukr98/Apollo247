import { Doctor, DoctorType, DOCTOR_ONLINE_STATUS } from 'doctors-service/entities';
import faker from 'faker';
import { randomEnum, randomValue, randomValues } from 'helpers/factoryHelpers';
import _random from 'lodash/random';
import _sample from 'lodash/sample';
import { Gender } from 'profiles-service/entities';

const allSpecializations = ['Gynecologist'];
const allQualifications = ['MD', 'DGO', 'OBS', 'GYN', 'Trained In Endoscopic Surgery And Robotics'];
const allLanguages = ['English', 'Hindi', 'Telugu', 'Oriya'];
const allPhotoUrls = [
  'http://dev.popcornapps.com/apolloImages/doctors/doctor_c_3.png',
  'http://dev.popcornapps.com/apolloImages/doctors/doctor_c_1.png',
];

export const buildDoctor = (attrs: Partial<Doctor> = {}) => {
  const doctor = new Doctor();
  doctor.awards = faker.random.boolean()
    ? '<ul> <li> Honours in Physiology, Anatomy, Pharmaco... highest mark in University (final MBBS)</li> </ul>'
    : '';
  doctor.city = faker.address.city();
  doctor.country = faker.address.country();
  doctor.dateOfBirth = faker.date.past();
  if (faker.random.boolean()) doctor.delegateNumber = faker.phone.phoneNumber('+91##########');
  doctor.doctorType = randomEnum(DoctorType);
  doctor.emailAddress = faker.internet.email();
  doctor.experience = _random(0, 40);
  doctor.firstName = faker.name.firstName();
  doctor.gender = randomEnum(Gender);
  doctor.isActive = faker.random.boolean();
  doctor.languages = randomValues(allLanguages).join(', ');
  doctor.lastName = faker.name.lastName();
  doctor.mobileNumber = faker.phone.phoneNumber('+91##########');
  doctor.onlineConsultationFees = _random(100, 999);
  doctor.onlineStatus = randomEnum(DOCTOR_ONLINE_STATUS);
  doctor.photoUrl = _sample(allPhotoUrls) as string;
  doctor.physicalConsultationFees = _random(100, 999);
  doctor.qualification = randomValues(allQualifications).join(', ');
  doctor.registrationNumber = faker.random.alphaNumeric(8).toUpperCase();
  doctor.salutation = 'Dr.';
  doctor.specialization = randomValue(allSpecializations);
  doctor.state = faker.address.state();
  doctor.zip = faker.address.zipCode();
  return Object.assign(doctor, attrs);
};
