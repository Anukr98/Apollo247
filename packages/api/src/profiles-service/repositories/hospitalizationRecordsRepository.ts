import { EntityRepository, Repository, BaseEntity } from 'typeorm';
import { HospitalizationRecords } from 'profiles-service/entities/hospitalizationRecordsEntity'
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

@EntityRepository(HospitalizationRecords)
export class HospitalizationRecordsRepository extends Repository<HospitalizationRecords>{

    async saveHospitalizationRecords(hospitalizationRecordAttrs: Partial<HospitalizationRecords>) {
        return this.create(hospitalizationRecordAttrs)
            .save()
            .catch((saveRecordError) => {
                throw new AphError(AphErrorMessages.SAVE_HOSPITALIZATION_RECORD_ERROR, undefined, {
                    saveRecordError,
                });
            });
    }
}