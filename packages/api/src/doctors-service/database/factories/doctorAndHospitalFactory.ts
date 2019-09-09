import { DoctorAndHospital } from 'doctors-service/entities';

export const buildDoctorAndHospital = (attrs: Partial<DoctorAndHospital>) => {
  const doctorAndHospital = new DoctorAndHospital();
  return Object.assign(doctorAndHospital, attrs);
};
