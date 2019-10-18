import { EntityRepository, Repository } from 'typeorm';
import { PatientFamilyHistory } from 'profiles-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

@EntityRepository(PatientFamilyHistory)
export class PatientFamilyHistoryRepository extends Repository<PatientFamilyHistory> {
  savePatientFamilyHistory(patientFamilyHistoryAttrs: Partial<PatientFamilyHistory>) {
    return this.save(this.create(patientFamilyHistoryAttrs)).catch((patientFamilyHistoryError) => {
      throw new AphError(AphErrorMessages.SAVE_PATIENT_FAMILY_HISTORY_ERROR, undefined, {
        patientFamilyHistoryError,
      });
    });
  }

  getPatientFamilyHistoryList(patient: string) {
    return this.find({ where: { patient } });
  }

  getPatientFamilyHistory(patient: string) {
    return this.findOne({ where: { patient }, order: { createdDate: 'DESC' } });
  }

  updatePatientFamilyHistory(id: string, patientFamilyHistoryAttrs: Partial<PatientFamilyHistory>) {
    return this.update(id, patientFamilyHistoryAttrs);
  }

  findById(id: string) {
    return this.findOne({ where: { id } });
  }

  deletePatientFamilyHistory(id: string) {
    return this.delete(id);
  }
}
