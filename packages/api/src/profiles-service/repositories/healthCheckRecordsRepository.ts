import { EntityRepository, Repository, BaseEntity } from 'typeorm';
import { HealthCheckRecords } from 'profiles-service/entities/healthCheckRecordsEntity'
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

@EntityRepository(HealthCheckRecords)
export class HealthCheckRecordsRepository extends Repository<HealthCheckRecords>{

    async saveHealthCheckRecords(healthCheckRecordAttrs: Partial<HealthCheckRecords>) {
        return this.create(healthCheckRecordAttrs)
            .save()
            .catch((saveRecordError) => {
                throw new AphError(AphErrorMessages.SAVE_HEALTH_CHECK_RECORD_ERROR, undefined, {
                    saveRecordError,
                });
            });
    }
}