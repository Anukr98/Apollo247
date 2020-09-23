import { EntityRepository, Repository } from 'typeorm';
import { Patient, PatientLifeStyle } from 'profiles-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

@EntityRepository(PatientLifeStyle)
export class PatientLifeStyleRepository extends Repository<PatientLifeStyle> {
  savePatientLifeStyle(patientLifeStyleAttrs: Partial<PatientLifeStyle>) {
    if (patientLifeStyleAttrs.patient) {
      patientLifeStyleAttrs.patientId = patientLifeStyleAttrs.patient.id;
    }
    return this.save(this.create(patientLifeStyleAttrs)).catch((patientLifeStyleError) => {
      throw new AphError(AphErrorMessages.SAVE_PATIENT_LIFE_STYLE_ERROR, undefined, {
        patientLifeStyleError,
      });
    });
  }

  getPatientLifeStyleList(patient: string) {
    return this.find({ where: { patient } });
  }

  getPatientLifeStyle(patient: string) {
    return this.findOne({ where: { patient }, order: { createdDate: 'DESC' } });
  }

  updatePatientLifeStyle(id: string, patientLifeStyleAttrs: Partial<PatientLifeStyle>) {
    if (patientLifeStyleAttrs.patient) {
      patientLifeStyleAttrs.patientId = patientLifeStyleAttrs.patient.id;
      patientLifeStyleAttrs.id = id;
    }
    const patientLifeStyle = this.create(patientLifeStyleAttrs);
    return this.save(patientLifeStyle);
  }

  findById(id: string) {
    return this.findOne({ where: { id } });
  }

  deletePatientLifeStyle(id: string) {
    return this.delete(id);
  }

  upsertPatientLifeStyle(inputArguments: Partial<PatientLifeStyle>, patientData: Patient){
    if (inputArguments.description || inputArguments.occupationHistory) {
      const lifeStyleInputs: Partial<PatientLifeStyle> = {
        patient: patientData,
      };
      if (inputArguments.description) {
        lifeStyleInputs.description = inputArguments.description;
      }
      if (inputArguments.occupationHistory) {
        lifeStyleInputs.occupationHistory = inputArguments.occupationHistory;
      }
      // const lifeStyleRepo = patientsDb.getCustomRepository(PatientLifeStyleRepository);
      const lifeStyleRecord = patientData.lifeStyle
        ? patientData.lifeStyle[0]
        : patientData.lifeStyle;
  
      if (lifeStyleRecord == null) {
        //create
        this.savePatientLifeStyle(lifeStyleInputs);
      } else {
        //update
        this.updatePatientLifeStyle(lifeStyleRecord.id, lifeStyleInputs);
      }
    }
  }
}
