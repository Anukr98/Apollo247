import { DoctorBankAccounts, AccountType } from 'doctors-service/entities';
import faker from 'faker';
import { randomEnum } from 'helpers/factoryHelpers';

export const buildDoctorBankAccount = (attrs?: Partial<DoctorBankAccounts>) => {
  const doctorBankAccounts = new DoctorBankAccounts();
  doctorBankAccounts.accountHolderName = faker.name.findName();
  doctorBankAccounts.accountNumber = faker.random.alphaNumeric(10);
  doctorBankAccounts.accountType = randomEnum(AccountType);
  doctorBankAccounts.bankName = faker.company.companyName();
  doctorBankAccounts.city = faker.address.city();
  doctorBankAccounts.IFSCcode = faker.random.alphaNumeric(10);
  doctorBankAccounts.state = faker.address.state();
  doctorBankAccounts.streetLine1 = faker.address.streetAddress();
  return Object.assign(doctorBankAccounts, attrs);
};
