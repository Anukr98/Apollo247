import { EntityRepository, Repository } from 'typeorm';
import { PatientMedicalHistory } from 'profiles-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

@EntityRepository(PatientMedicalHistory)
export class PatientMedicalHistoryRepository extends Repository<PatientMedicalHistory> {
  savePatientMedicalHistory(patientMedicalHistoryAttrs: Partial<PatientMedicalHistory>) {
    if (patientMedicalHistoryAttrs.patient) {
      patientMedicalHistoryAttrs.patientId = patientMedicalHistoryAttrs.patient.id;
    }

    return this.save(this.create(patientMedicalHistoryAttrs)).catch(
      (patientMedicalHistoryError) => {
        throw new AphError(AphErrorMessages.SAVE_PATIENT_MEDICAL_HISTORY_ERROR, undefined, {
          patientMedicalHistoryError,
        });
      }
    );
  }

  getPatientMedicalHistoryList(patient: string) {
    return this.find({ where: { patient } });
  }

  getPatientMedicalHistory(patientId: string) {
    return this.findOne({ where: { patientId: patientId }, order: { createdDate: 'DESC' } });
  }

  updatePatientMedicalHistory(
    id: string,
    patientMedicalHistoryAttrs: Partial<PatientMedicalHistory>
  ) {
    if (patientMedicalHistoryAttrs.patient) {
      patientMedicalHistoryAttrs.patientId = patientMedicalHistoryAttrs.patient.id;
      patientMedicalHistoryAttrs.id = id;
    }

    const patientMedicalHistory = this.create(patientMedicalHistoryAttrs);
    return this.save(patientMedicalHistory);
  }

  findById(id: string) {
    return this.findOne({ where: { id } });
  }

  deletePatientMedicalHistory(id: string) {
    return this.delete(id);
  }
}
