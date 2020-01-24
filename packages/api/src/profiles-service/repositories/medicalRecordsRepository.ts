import { EntityRepository, Repository, Not, Between } from 'typeorm';
import { MedicalRecords } from 'profiles-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { addDays, format } from 'date-fns';

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

  findById(recordId: string) {
    return this.createQueryBuilder('medicalRecords')
      .where('medicalRecords.id = :recordId', { recordId })
      .getOne()
      .catch((getRecordsError) => {
        throw new AphError(AphErrorMessages.GET_MEDICAL_RECORDS_ERROR, undefined, {
          getRecordsError,
        });
      });
  }

  findByIdAndPatientIds(patientIds: string[], recordId: string) {
    return this.createQueryBuilder('medicalRecords')
      .leftJoinAndSelect('medicalRecords.medicalRecordParameters', 'medicalRecordParameters')
      .where('medicalRecords.id = :recordId', { recordId })
      .andWhere('medicalRecords.patient IN (:...patientIds)', { patientIds })
      .getOne()
      .catch((getRecordsError) => {
        throw new AphError(AphErrorMessages.GET_MEDICAL_RECORDS_ERROR, undefined, {
          getRecordsError,
        });
      });
  }

  deleteMedicalRecord(recordId: string) {
    return this.delete(recordId).catch((deleteError) => {
      throw new AphError(AphErrorMessages.DELETE_MEDICAL_RECORD_ERROR, undefined, {
        deleteError,
      });
    });
  }

  getRecordSummary(selDate: Date) {
    const startDate = new Date(format(addDays(selDate, -1), 'yyyy-MM-dd') + 'T18:30');
    const endDate = new Date(format(selDate, 'yyyy-MM-dd') + 'T18:30');
    return this.count({
      where: { documentURLs: Not(''), createdDate: Between(startDate, endDate) },
    });
  }
}
