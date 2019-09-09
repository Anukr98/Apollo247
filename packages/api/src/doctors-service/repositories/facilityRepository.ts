import { EntityRepository, Repository } from 'typeorm';
import { Facility } from 'doctors-service/entities';

@EntityRepository(Facility)
export class FacilityRepository extends Repository<Facility> {}
