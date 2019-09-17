import { EntityRepository, Repository } from 'typeorm';
import { DoctorAndHospital } from 'doctors-service/entities';

import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

@EntityRepository(DoctorAndHospital)
export class DoctorHospitalRepository extends Repository<DoctorAndHospital> {
  findDoctorHospital(doctor: string, facility: string) {
    return this.count({ where: { doctor, facility } });
  }

  insertDoctorAndHospitals(doctorAndHospitals: Partial<DoctorAndHospital>[]) {
    return this.save(doctorAndHospitals).catch((saveDoctorHospitalsError) => {
      throw new AphError(AphErrorMessages.SAVE_DOCTOR_AND_HOSPITAL_ERROR, undefined, {
        saveDoctorHospitalsError,
      });
    });
  }
}
