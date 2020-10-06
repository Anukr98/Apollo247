import { EntityRepository, Repository } from 'typeorm';
import { Packages } from 'doctors-service/entities';

@EntityRepository(Packages)
export class PackagesRepository extends Repository<Packages> {}
