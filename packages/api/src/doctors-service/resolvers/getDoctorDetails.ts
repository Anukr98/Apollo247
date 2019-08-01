import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { DoctorsServiceContext } from 'doctors-service/doctorsServiceContext';
import { Doctor } from 'doctors-service/entities/';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/AphErrorMessages';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';

export const getDoctorDetailsTypeDefs = gql`
  enum AccountType {
    CURRENT
    SAVINGS
  }
  enum ConsultType {
    FIXED
    PREFERRED
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
    accountHolderName: String!
    accountNumber: String!
    accountType: AccountType!
    bankName: String!
    city: String!
    id: ID!
    IFSCcode: String!
    state: String
    streetLine1: String
  }
  type ConsultHours {
    consultMode: ConsultMode!
    consultType: ConsultType!
    endTime: String!
    id: ID!
    isActive: Boolean!
    startTime: String!
    weekDay: WeekDay!
  }
  type DoctorDetails {
    awards: String
    city: String
    country: String
    dateOfBirth: String
    doctorType: DoctorType!
    delegateNumber: String
    emailAddress: String
    experience: String
    firstName: String!
    gender: Gender
    isActive: Boolean!
    id: ID!
    languages: String
    lastName: String!
    mobileNumber: String!
    onlineConsultationFees: String!
    photoUrl: String
    physicalConsultationFees: String!
    qualification: String
    registrationNumber: String!
    salutation: Salutation
    specialization: String
    state: String
    streetLine1: String
    streetLine2: String
    streetLine3: String
    zip: String
    bankAccount: [BankAccount]
    consultHours: [ConsultHours]
    doctorHospital: [DoctorHospital!]!
    packages: [Packages]
    specialty: DoctorSpecialties!
    starTeam: [StarTeam]
  }
  type DoctorHospital {
    facility: Facility!
  }

  type DoctorSpecialties {
    createdDate: String
    name: String!
    image: String
  }

  type Facility {
    city: String
    country: String
    facilityType: String!
    latitude: String
    longitude: String
    name: String!
    state: String
    streetLine1: String
    streetLine2: String
    streetLine3: String
  }

  type Packages {
    name: String!
    id: String!
    fees: String!
  }

  type Profile {
    city: String
    country: String
    doctorType: DoctorType!
    delegateNumber: String
    emailAddress: String
    experience: String
    firstName: String
    gender: Gender
    isActive: Boolean!
    id: ID!
    lastName: String
    mobileNumber: String!
    photoUrl: String
    qualification: String
    salutation: Salutation
    state: String
    streetLine1: String
    streetLine2: String
    streetLine3: String
    zip: String
  }

  type StarTeam {
    associatedDoctor: Profile
  }

  extend type Query {
    getDoctorDetails: [DoctorDetails]
  }
`;

const getDoctorDetails: Resolver<null, {}, DoctorsServiceContext, Doctor[]> = async (
  parent,
  args,
  { mobileNumber, dbConnect }
) => {
  let doctordata: Doctor[] = [];
  try {
    const doctorRepository = dbConnect.getCustomRepository(DoctorRepository);
    doctordata = await doctorRepository.findByMobileNumber(mobileNumber, true);
  } catch (getProfileError) {
    throw new AphError(AphErrorMessages.GET_PROFILE_ERROR, undefined, { getProfileError });
  }
  return doctordata;
};

export const getDoctorDetailsResolvers = {
  Query: {
    getDoctorDetails,
  },
};
