import { Patient } from 'profiles-service/entities';

export const buildPatient = (attrs: Partial<Patient> = {}) => {
  const patient = new Patient();
  return Object.assign(patient, attrs);
};
