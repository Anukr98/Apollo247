import { EntityRepository, Repository } from 'typeorm';
import { PatientFamilyHistory } from 'profiles-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

@EntityRepository(PatientFamilyHistory)
export class PatientFamilyHistoryRepository extends Repository<PatientFamilyHistory> {
  savePatientFamilyHistory(patientFamilyHistoryAttrs: Partial<PatientFamilyHistory>) {
    if (patientFamilyHistoryAttrs.patient) {
      patientFamilyHistoryAttrs.patientId = patientFamilyHistoryAttrs.patient.id;
    }
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
    console.log(
      'updatePatientFamilyHistory id',
      id,
      'patientFamilyHistory attr',
      patientFamilyHistoryAttrs
    );
    if (patientFamilyHistoryAttrs.patient) {
      patientFamilyHistoryAttrs.patientId = patientFamilyHistoryAttrs.patient.id;
      patientFamilyHistoryAttrs.id = id;
    }
    const patientFamilyHistory = this.create(patientFamilyHistoryAttrs);
    console.log('patientFamilyHistory object', patientFamilyHistory);
    return this.save(patientFamilyHistory);
  }

  findById(id: string) {
    return this.findOne({ where: { id } });
  }

  deletePatientFamilyHistory(id: string) {
    return this.delete(id);
  }
}
