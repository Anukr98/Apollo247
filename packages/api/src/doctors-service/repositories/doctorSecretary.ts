import { EntityRepository, Repository } from 'typeorm';
import { DoctorSecretary } from 'doctors-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

@EntityRepository(DoctorSecretary)
export class DoctorSecretaryRepository extends Repository<DoctorSecretary> {
  saveDoctorSecretary(doctorSecretaryDetails: Partial<DoctorSecretary>) {
    return this.create(doctorSecretaryDetails)
      .save()
      .catch((createErrors) => {
        throw new AphError(AphErrorMessages.CREATE_DOCTORSECRETARY_ERROR, undefined, {
          createErrors,
        });
      });
  }

  findRecord(doctor: string, secretary: string) {
    return this.find({ where: { doctor, secretary } });
  }
}
