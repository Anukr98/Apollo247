import { EntityRepository, Repository } from 'typeorm';
import { MedicalRecordParameters } from 'profiles-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

@EntityRepository(MedicalRecordParameters)
export class MedicalRecordParametersRepository extends Repository<MedicalRecordParameters> {
  addMedicalRecordParameters(medicalRecordParametersList: Partial<MedicalRecordParameters>[]) {
    return this.save(medicalRecordParametersList).catch((saveRecordError) => {
      throw new AphError(AphErrorMessages.SAVE_MEDICAL_RECORD_PARAMETERS_ERROR, undefined, {
        saveRecordError,
      });
    });
  }

  deleteByIds(ids: string[]) {
    return this.delete(ids).catch((deleteError) => {
      throw new AphError(AphErrorMessages.DELETE_MEDICAL_RECORD_PARAMETERS_ERROR, undefined, {
        deleteError,
      });
    });
  }
}
