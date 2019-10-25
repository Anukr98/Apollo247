import { EntityRepository, Repository } from 'typeorm';
import { PatientLifeStyle } from 'profiles-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

@EntityRepository(PatientLifeStyle)
export class PatientLifeStyleRepository extends Repository<PatientLifeStyle> {
  savePatientLifeStyle(patientLifeStyleAttrs: Partial<PatientLifeStyle>) {
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
    return this.update(id, patientLifeStyleAttrs);
  }

  findById(id: string) {
    return this.findOne({ where: { id } });
  }

  deletePatientLifeStyle(id: string) {
    return this.delete(id);
  }
}
