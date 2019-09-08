import { DoctorBankAccounts, AccountType } from 'doctors-service/entities';
import faker from 'faker';
import { randomEnum } from 'helpers/factoryHelpers';

//doctor_bank_accounts("createdDate","accountHolderName","accountNumber","accountType","bankName","city","IFSCcode","state","streetLine1","doctorId")

// values(
//   '5/7/2019 2:02',
//   'My Name',
//   '12345a786786',
//   'SAVINGS',
//   'SBI',
//   'Hyderabad',
//   'SADHGD6745',
//   'Telangana',
//   'Banjara Hills',
//   '9f5aaf8b-4236-48af-b415-af1bee991568'
// );

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
