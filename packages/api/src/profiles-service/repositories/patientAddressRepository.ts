import { EntityRepository, Repository } from 'typeorm';
import { PatientAddress } from 'profiles-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

@EntityRepository(PatientAddress)
export class PatientAddressRepository extends Repository<PatientAddress> {
  savePatientAddress(patientAddressAttrs: Partial<PatientAddress>) {
    return this.create(patientAddressAttrs)
      .save()
      .catch((patientAddressError) => {
        throw new AphError(AphErrorMessages.SAVE_PATIENT_ADDRESS_ERROR, undefined, {
          patientAddressError,
        });
      });
  }

  getPatientAddressList(patient: string) {
    return this.find({ where: { patient } });
  }

  updatePatientAddress(id: string, patientAddressAttrs: Partial<PatientAddress>) {
    return this.update(id, patientAddressAttrs);
  }

  findById(id: string) {
    return this.findOne({ where: { id } });
  }

  deletePatientAddress(id: string) {
    return this.delete(id);
  }
}
