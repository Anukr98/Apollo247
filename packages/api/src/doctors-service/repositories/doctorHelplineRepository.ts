import { EntityRepository, Repository } from 'typeorm';

import {
    DoctorHelpLine,
} from 'doctors-service/entities';
@EntityRepository(DoctorHelpLine)
export class DoctorHelpLineRepository extends Repository<DoctorHelpLine>{
    getHelplineDetails() {
        return this.createQueryBuilder()
            .getMany();
    }
}
