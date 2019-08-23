import faker from 'faker';
import { Doctor, Salutation, DoctorSpecialty, DoctorType } from 'doctors-service/entities';
import { randomEnum } from 'helpers/factoryHelpers';
import { Gender } from 'profiles-service/entities';
import _sample from 'lodash/sample';

const allDoctorSpecialties = ['Gynecology'];
export const randomDoctorSpecialty = () => _sample(allDoctorSpecialties) as string;

const allDoctorSpecializations = ['Gynecologist'];
export const randomDoctorSpecializiation = () => _sample(allDoctorSpecializations) as string;

export const buildDoctorSpecialty = (attrs: Partial<DoctorSpecialty> = {}) => {
  const specialty = new DoctorSpecialty();
  specialty.name = randomDoctorSpecialty();
  return Object.assign(specialty, attrs);
};

export const buildDoctor = (attrs: Partial<Doctor> = {}) => {
  const doctor = new Doctor();
  doctor.doctorType = randomEnum(DoctorType);
  doctor.experience = faker.random.number(20);
  doctor.firstName = faker.name.firstName();
  doctor.gender = randomEnum(Gender);
  doctor.mobileNumber = faker.phone.phoneNumber('+91##########');
  doctor.salutation = randomEnum(Salutation);
  doctor.lastName = faker.name.lastName();
  doctor.specialty = buildDoctorSpecialty();
  doctor.specialization = randomDoctorSpecializiation();
  return Object.assign(doctor, attrs);
};
