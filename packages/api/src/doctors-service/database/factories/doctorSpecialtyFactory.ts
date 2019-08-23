import { DoctorSpecialty } from 'doctors-service/entities';
import _sample from 'lodash/sample';

const allDoctorSpecialties = [
  'Anesthesiologist',
  'Cardiologist',
  'Dermatologist',
  'Gastroenterologist',
  'Hematologist/Oncologist',
  'Internal Medicine Physician',
  'Nephrologist',
  'Neurologist',
  'Neurosurgeon',
  'Obstetrician',
  'Gynecologist',
  'Occupational Medicine Physician',
  'Ophthalmologist',
  'Oral and Maxillofacial Surgeon',
  'Orthopaedic Surgeon',
  'Otolaryngologist',
  'Pathologist',
  'Pediatrician',
  'Plastic Surgeon',
  'Podiatrist',
  'Psychiatrist',
  'Pulmonary Medicine Physician',
  'Radiation Onconlogist',
  'Diagnostic Radiologist',
  'Rheumatologist',
  'Urologist',
];
export const randomDoctorSpecialty = () => _sample(allDoctorSpecialties) as string;

export const buildDoctorSpecialty = (attrs: Partial<DoctorSpecialty> = {}) => {
  const specialty = new DoctorSpecialty();
  specialty.name = randomDoctorSpecialty();
  return Object.assign(specialty, attrs);
};
