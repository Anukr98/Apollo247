import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { DoctorsServiceContext } from 'doctors-service/doctorsServiceContext';
import { Doctor } from 'doctors-service/entities/';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { isNull } from 'util';
import { getConnection } from 'typeorm';

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
    BOTH
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
  type DoctorDetails @key(fields: "id") {
    awards: String
    city: String
    country: String
    dateOfBirth: String
    doctorType: DoctorType!
    delegateNumber: String
    emailAddress: String
    experience: String
    firebaseToken: String
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
    doctorHospital: [DoctorHospital!]!
    specialty: DoctorSpecialties!
  }

  type StarTeam {
    isActive: Boolean
    associatedDoctor: Profile
  }

  extend type Query {
    getDoctorDetails: DoctorDetails
    getDoctorDetailsById(id: String): DoctorDetails
  }
`;

const getDoctorDetails: Resolver<null, {}, DoctorsServiceContext, Doctor> = async (
  parent,
  args,
  { mobileNumber, doctorsDb, firebaseUid }
) => {
  let doctordata;
  try {
    const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
    doctordata = await doctorRepository.findByMobileNumber(mobileNumber, true);

    if (doctordata == null) throw new AphError(AphErrorMessages.UNAUTHORIZED);

    if (doctordata != null && isNull(doctordata.firebaseToken)) {
      await doctorRepository.updateFirebaseId(doctordata.id, firebaseUid);
    }
  } catch (getProfileError) {
    throw new AphError(AphErrorMessages.GET_PROFILE_ERROR, undefined, { getProfileError });
  }
  return doctordata;
};

const getDoctorDetailsById: Resolver<null, { id: string }, DoctorsServiceContext, Doctor> = async (
  parent,
  args,
  { doctorsDb, firebaseUid }
) => {
  let doctordata: Doctor;
  try {
    const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
    doctordata = (await doctorRepository.findById(args.id)) as Doctor;
  } catch (getProfileError) {
    throw new AphError(AphErrorMessages.GET_PROFILE_ERROR, undefined, { getProfileError });
  }
  return doctordata;
};

export const getDoctorDetailsResolvers = {
  DoctorDetails: {
    async __resolveReference(object: Doctor) {
      const con = getConnection('doctors-db');
      const doctorRepo = con.getCustomRepository(DoctorRepository);
      return await doctorRepo.findById(object.id.toString());
    },
  },
  Query: {
    getDoctorDetails,
    getDoctorDetailsById,
  },
};
