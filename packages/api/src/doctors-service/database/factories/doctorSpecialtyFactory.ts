import { DoctorSpecialty } from 'doctors-service/entities';
import _sample from 'lodash/sample';

export const allSpecialties = [
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

export const buildDoctorSpecialty = (attrs: Partial<DoctorSpecialty> = {}) => {
  const specialty = new DoctorSpecialty();
  specialty.name = _sample(allSpecialties) as string;
  return Object.assign(specialty, attrs);
};
