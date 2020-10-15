import { EntityRepository, Repository } from 'typeorm';
import { Patient, PatientMedicalHistory, Gender } from 'profiles-service/entities';
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

  upsertPatientMedicalHistory(inputArguments: Partial<PatientMedicalHistory>, patientData: Patient){
    let response: any;
    const medicalHistoryInputs: Partial<PatientMedicalHistory> = {
      patient: patientData,
    };
    medicalHistoryInputs.clinicalObservationNotes = inputArguments.clinicalObservationNotes || '';
    medicalHistoryInputs.diagnosticTestResult = inputArguments.diagnosticTestResult || '';
  
    if (patientData.patientMedicalHistory) {
      medicalHistoryInputs.id = patientData.patientMedicalHistory.id;
    }
  
    if (inputArguments.medicationHistory) {
      medicalHistoryInputs.medicationHistory = inputArguments.medicationHistory;
    }
  
    if (!(inputArguments.bp === undefined))
      medicalHistoryInputs.bp = inputArguments.bp.length > 0 ? inputArguments.bp : '';
  
    if (!(inputArguments.weight === undefined))
      medicalHistoryInputs.weight = inputArguments.weight.length > 0 ? inputArguments.weight : '';
  
    if (!(inputArguments.temperature === undefined))
      medicalHistoryInputs.temperature =
        inputArguments.temperature.length > 0 ? inputArguments.temperature : '';
  
    if (!(inputArguments.pastSurgicalHistory === undefined))
      medicalHistoryInputs.pastSurgicalHistory =
        inputArguments.pastSurgicalHistory && inputArguments.pastSurgicalHistory.length > 0
          ? inputArguments.pastSurgicalHistory
          : '';
  
    if (!(inputArguments.pastMedicalHistory === undefined))
      medicalHistoryInputs.pastMedicalHistory =
        inputArguments.pastMedicalHistory && inputArguments.pastMedicalHistory.length > 0
          ? inputArguments.pastMedicalHistory
          : '';
  
    if (!(inputArguments.menstrualHistory === undefined)) {
      if (patientData.gender === Gender.FEMALE)
        medicalHistoryInputs.menstrualHistory =
          inputArguments.menstrualHistory && inputArguments.menstrualHistory.length > 0
            ? inputArguments.menstrualHistory
            : '';
    }
  
    if (!(inputArguments.height === undefined)) medicalHistoryInputs.height = inputArguments.height;
    if (!(inputArguments.drugAllergies === undefined))
      medicalHistoryInputs.drugAllergies =
        inputArguments.drugAllergies && inputArguments.drugAllergies.length > 0
          ? inputArguments.drugAllergies
          : '';
  
    // if (!inputArguments.dietAllergies))
    medicalHistoryInputs.dietAllergies = inputArguments.dietAllergies || '';
  
    // const medicalHistoryRepo = patientsDb.getCustomRepository(PatientMedicalHistoryRepository);
    // const medicalHistoryRecord = await medicalHistoryRepo.getPatientMedicalHistory(
    //   getCaseSheetData.patientId
    // );
    const medicalHistoryRecord = patientData.patientMedicalHistory;
    if (medicalHistoryRecord == null) {
      //create
      response = this.savePatientMedicalHistory(medicalHistoryInputs);
    } else {
      //update
      response = this.updatePatientMedicalHistory(medicalHistoryRecord.id, medicalHistoryInputs);
    }
    return response;
  }
}
