import { EntityRepository, Repository } from 'typeorm';
import { MedicalRecords } from 'profiles-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

@EntityRepository(MedicalRecords)
export class MedicalRecordsRepository extends Repository<MedicalRecords> {
  addMedicalRecord(medicalRecordAttrs: Partial<MedicalRecords>) {
    return this.create(medicalRecordAttrs)
      .save()
      .catch((saveRecordError) => {
        throw new AphError(AphErrorMessages.SAVE_MEDICAL_RECORD_ERROR, undefined, {
          saveRecordError,
        });
      });
  }

  findByPatientId(patientId: string, offset?: number, limit?: number) {
    return this.createQueryBuilder('medicalRecords')
      .leftJoinAndSelect('medicalRecords.medicalRecordParameters', 'medicalRecordParameters')
      .leftJoinAndSelect('medicalRecords.patient', 'patient')
      .where('medicalRecords.patient = :patientId', { patientId })
      .orderBy('medicalRecords.testDate', 'DESC')
      .skip(offset)
      .take(limit)
      .getMany()
      .catch((getRecordsError) => {
        throw new AphError(AphErrorMessages.GET_MEDICAL_RECORDS_ERROR, undefined, {
          getRecordsError,
        });
      });
  }
}
