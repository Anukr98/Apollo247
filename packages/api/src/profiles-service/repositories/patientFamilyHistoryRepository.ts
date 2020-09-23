import { EntityRepository, Repository, Connection } from 'typeorm';
import { Patient, PatientFamilyHistory } from 'profiles-service/entities';
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
    if (patientFamilyHistoryAttrs.patient) {
      patientFamilyHistoryAttrs.patientId = patientFamilyHistoryAttrs.patient.id;
      patientFamilyHistoryAttrs.id = id;
    }
    const patientFamilyHistory = this.create(patientFamilyHistoryAttrs);
    return this.save(patientFamilyHistory);
  }

  findById(id: string) {
    return this.findOne({ where: { id } });
  }

  deletePatientFamilyHistory(id: string) {
    return this.delete(id);
  }

  upsertPatientFamilyHistory(description: string, patientData: Patient) {
    let response: any;
    if (!(description === undefined)) {
      const familyHistoryInputs: Partial<PatientFamilyHistory> = {
        patient: patientData,
        description: description && description.length > 0 ? description : '',
      };
      //      const familyHistoryRepo = patientsDb.getCustomRepository(PatientFamilyHistoryRepository);
      const familyHistoryRecord = patientData.familyHistory
        ? patientData.familyHistory[0]
        : patientData.familyHistory;
      if (familyHistoryRecord == null) {
        //create
        response = this.savePatientFamilyHistory(familyHistoryInputs);
      } else {
        //update
        response = this.updatePatientFamilyHistory(familyHistoryRecord.id, familyHistoryInputs);
      }
    }
    return response;
  }
}
