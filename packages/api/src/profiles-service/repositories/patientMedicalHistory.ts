import { EntityRepository, Repository } from 'typeorm';
import { PatientMedicalHistory } from 'profiles-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

@EntityRepository(PatientMedicalHistory)
export class PatientMedicalHistoryRepository extends Repository<PatientMedicalHistory> {
  savePatientMedicalHistory(patientMedicalHistoryAttrs: Partial<PatientMedicalHistory>) {
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

  getPatientMedicalHistory(patient: string) {
    return this.findOne({ where: { patient }, order: { createdDate: 'DESC' } });
  }

  updatePatientMedicalHistory(
    id: string,
    patientMedicalHistoryAttrs: Partial<PatientMedicalHistory>
  ) {
    return this.update(id, patientMedicalHistoryAttrs);
  }

  findById(id: string) {
    return this.findOne({ where: { id } });
  }

  deletePatientMedicalHistory(id: string) {
    return this.delete(id);
  }
}
