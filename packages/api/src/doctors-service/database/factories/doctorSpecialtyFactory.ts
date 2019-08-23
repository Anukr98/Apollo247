import { DoctorSpecialty } from 'doctors-service/entities';
import _sample from 'lodash/sample';

const allDoctorSpecialties = ['Gynecology'];
export const randomDoctorSpecialty = () => _sample(allDoctorSpecialties) as string;

export const buildDoctorSpecialty = (attrs: Partial<DoctorSpecialty> = {}) => {
  const specialty = new DoctorSpecialty();
  specialty.name = randomDoctorSpecialty();
  return Object.assign(specialty, attrs);
};
