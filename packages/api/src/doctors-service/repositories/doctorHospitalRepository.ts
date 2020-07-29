import { EntityRepository, Repository } from 'typeorm';
import { DoctorAndHospital } from 'doctors-service/entities';

import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

@EntityRepository(DoctorAndHospital)
export class DoctorHospitalRepository extends Repository<DoctorAndHospital> {
  findDoctorHospital(doctor: string, facility: string) {
    return this.count({ where: { doctor, facility } });
  }

  findAll() {
    return this.createQueryBuilder('doctorAndHospital')
      .select('doctorAndHospital.doctor', 'doctor')
      .addSelect('doctorAndHospital.facility', 'facility')
      .where('doctorAndHospital.id is not null')
      .getRawMany();
  }

  async insertDoctorAndHospitals(doctorAndHospitals: Partial<DoctorAndHospital>[]) {
    const allDoctorAndHospitals = await this.findAll();

    const newDoctorAndHospitals = doctorAndHospitals.filter((docAndHospital) => {
      return allDoctorAndHospitals.some((allDocHospital) => {
        return (
          allDocHospital.facility == docAndHospital.facility &&
          allDocHospital.doctor == docAndHospital.doctor
        );
      })
        ? false
        : true;
    });
    return this.save(newDoctorAndHospitals).catch((saveDoctorHospitalsError) => {
      throw new AphError(AphErrorMessages.SAVE_DOCTOR_AND_HOSPITAL_ERROR, undefined, {
        saveDoctorHospitalsError,
      });
    });
  }

  findById(id: string) {
    return this.findOne({ where: { id } }).catch((getFacilityError) => {
      throw new AphError(AphErrorMessages.GET_FACILITIES_ERROR, undefined, {
        getFacilityError,
      });
    });
  }

  getDoctorIdByMedmantraId(medmantraId: string) {
    return this.findOne({ where: { medmantraId }, relations: ['doctor'] });
  }

  getDoctorIdsByMedMantraIds(medMantraIds: string[]) {
    return this.createQueryBuilder('doctorAndHospital')
      .select(['"doctorId" AS "apolloDocId"', '"medmantraId" AS "medmantraId"'])
      .where('doctorAndHospital.medmantraId IN (:...idArray)', { idArray: medMantraIds })
      .getRawMany();
  }
}
