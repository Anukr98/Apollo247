import { EntityRepository, Repository } from 'typeorm';
import { DoctorBankAccounts } from 'doctors-service/entities';

@EntityRepository(DoctorBankAccounts)
export class DoctorBankAccountsRepository extends Repository<DoctorBankAccounts> {}
