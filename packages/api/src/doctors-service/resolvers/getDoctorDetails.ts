import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { DoctorsServiceContext } from 'doctors-service/doctors-service';
import { Doctor } from 'doctors-service/entity/doctor';
import { getRepository } from 'typeorm';

export const getDoctorDetailsTypeDefs = gql`
  enum AccountType {
    CURRENT
    SAVINGS
  }
  enum ConsultType {
    SUNDAY
    MONDAY
  }
  enum ConsultMode {
    ONLINE
    PHYSICAL
  }
  enum DoctorType {
    APOLLO
    PAYROLL
    STAR_APOLLO
  }

  enum Salutation {
    MR
    MRS
    DR
  }

  enum WeekDay {
    SUNDAY
    MONDAY
    TUESDAY
    WEDNESDAY
    THURSDAY
    FRIDAY
    SATURDAY
  }

  type BankAccount {
    accountHolderName: String
    accountNumber: String
    accountType: AccountType
    bankName: String
    city: String
    id: String
    IFSCcode: String
    state: String
    streetLine1: String
  }
  type ConsultHours {
    consultMode: ConsultMode
    consultType: ConsultType
    endTime: String
    id: String
    isActive: Boolean
    startTime: String
    weekDay: WeekDay
  }
  type DoctorDetails {
    awards: String
    city: String
    country: String
    dateOfBirth: String
    doctorType: DoctorType
    delegateNumber: String
    emailAddress: String
    experience: String
    firstName: String
    gender: Gender
    isActive: Boolean
    languages: String
    lastName: String
    mobileNumber: String
    onlineConsultationFees: String
    photoUrl: String
    physicalConsultationFees: String
    qualification: String
    registrationNumber: String
    salutation: Salutation
    specialization: String
    state: String
    streetLine1: String
    streetLine2: String
    streetLine3: String
    zip: String
    BankAccount: [BankAccount]
    ConsultHours: [[ConsultHours]]
    Packages: [Packages]
    Specialty: [DoctorSpecialties]
  }

  type Packages {
    name: String
    id: String
    fees: String
  }

  type DoctorSpecialties {
    name: String
    image: String
  }

  extend type Query {
    getDoctorDetails: [DoctorDetails]
  }
`;

const getDoctorDetails: Resolver<null, {}, DoctorsServiceContext, Doctor[]> = async (
  parent,
  args,
  { mobileNumber }
) => {
  const doctorRepository = getRepository(Doctor);
  const doctordata = await doctorRepository.find({
    where: { mobileNumber: mobileNumber, isActive: true },
    relations: [
      'specialty',
      'doctorHospital',
      'consultHours',
      'starTeam',
      'bankAccount',
      'packages',
    ],
  });
  console.log(doctordata);
  return doctordata;
};

export const getDoctorDetailsResolvers = {
  Query: {
    getDoctorDetails,
  },
};
