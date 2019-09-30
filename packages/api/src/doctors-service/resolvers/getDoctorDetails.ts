import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { DoctorsServiceContext } from 'doctors-service/doctorsServiceContext';
import { Doctor } from 'doctors-service/entities/';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { getConnection } from 'typeorm';

export const getDoctorDetailsTypeDefs = gql`
  enum Gender {
    MALE
    FEMALE
    OTHER
  }
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
    JUNIOR
  }

  enum LoggedInUserType {
    APOLLO
    PAYROLL
    STAR_APOLLO
    SECRETARY
    NONE
  }

  enum Salutation {
    MR
    MRS
    DR
  }

  enum DOCTOR_ONLINE_STATUS {
    ONLINE
    AWAY
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
    facility: Facility
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
    onlineStatus: DOCTOR_ONLINE_STATUS!
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
    specialty: DoctorSpecialties
    starTeam: [StarTeam]
  }
  type DoctorHospital {
    facility: Facility!
  }

  type DoctorSpecialties {
    createdDate: String
    id: ID!
    image: String
    name: String!
  }

  type Facility {
    city: String
    country: String
    facilityType: String!
    id: ID!
    imageUrl: String
    latitude: String
    longitude: String
    name: String!
    state: String
    streetLine1: String
    streetLine2: String
    streetLine3: String
  }

  type Packages {
    fees: String!
    id: String!
    name: String!
  }

  type Profile @key(fields: "id") {
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
    findLoggedinUserType: LoggedInUserType
  }
`;

enum LoggedInUserType {
  APOLLO,
  PAYROLL,
  STAR_APOLLO,
  SECRETARY,
  NONE,
}

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
    if (!doctordata.firebaseToken)
      await doctorRepository.updateFirebaseId(doctordata.id, firebaseUid);
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

const findLoggedinUserType: Resolver<null, {}, DoctorsServiceContext, LoggedInUserType> = async (
  parent,
  args,
  { mobileNumber, doctorsDb, firebaseUid }
) => {
  let doctorData;
  let doctorType;
  try {
    const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
    doctorData = await doctorRepository.findByMobileNumber(mobileNumber, true);
    if (doctorData == null) throw new AphError(AphErrorMessages.UNAUTHORIZED);
    const doctorType =
      doctorData.delegateNumber === mobileNumber
        ? LoggedInUserType.SECRETARY
        : doctorData.doctorType;

    return doctorType;
  } catch (getProfileError) {
    throw new AphError(AphErrorMessages.GET_PROFILE_ERROR, undefined, { getProfileError });
  }

  return doctorType;
};

export const getDoctorDetailsResolvers = {
  DoctorDetails: {
    async __resolveReference(object: Doctor) {
      const connection = getConnection();
      const doctorRepo = connection.getCustomRepository(DoctorRepository);
      return await doctorRepo.findById(object.id.toString());
    },
  },
  Profile: {
    async __resolveReference(object: Doctor) {
      const connection = getConnection();
      const doctorRepo = connection.getCustomRepository(DoctorRepository);
      return await doctorRepo.getDoctorProfileData(object.id.toString());
    },
  },

  Query: {
    getDoctorDetails,
    getDoctorDetailsById,
    findLoggedinUserType,
  },
};
