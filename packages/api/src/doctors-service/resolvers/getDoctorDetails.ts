import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { DoctorsServiceContext } from 'doctors-service/doctorsServiceContext';
import { Doctor, AdminType, AdminUsers, Secretary, DoctorType } from 'doctors-service/entities/';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { getConnection } from 'typeorm';
import { AdminUser } from 'doctors-service/repositories/adminRepository';
import { DashboardData, getJuniorDoctorsDashboard } from 'doctors-service/resolvers/JDAdmin';
import { SecretaryRepository } from 'doctors-service/repositories/secretaryRepository';
import { format } from 'date-fns';

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
    DOCTOR
    JUNIOR
    SECRETARY
    ADMIN
    JDADMIN
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

  type AdminUsers {
    mobileNumber: String
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
    consultDuration: Int
    consultBuffer: Int
  }
  type DoctorDetails @key(fields: "id") {
    awards: String
    city: String
    country: String
    dateOfBirth: String
    displayName: String
    doctorType: DoctorType!
    delegateNumber: String
    emailAddress: String
    experience: String
    firebaseToken: String
    firstName: String!
    fullName: String
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
    signature: String
    specialization: String
    state: String
    streetLine1: String
    streetLine2: String
    streetLine3: String
    thumbnailUrl: String
    zip: String
    bankAccount: [BankAccount]
    consultHours: [ConsultHours]
    doctorHospital: [DoctorHospital!]!
    doctorSecretary: DoctorSecretaryDetails
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
    specialistSingularTerm: String
    specialistPluralTerm: String
    userFriendlyNomenclature: String
    displayOrder: Int
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
    zipcode: String
  }

  type LoggedInUserDetails {
    loggedInUserType: LoggedInUserType
    doctorDetails: DoctorDetails
    JDAdminDetails: DashboardData
    adminDetails: AdminUsers
    secretaryDetails: Secretary
  }

  type DoctorSecretaryDetails {
    secretary: Secretary
  }

  type Secretary {
    id: String!
    name: String!
    mobileNumber: String!
    isActive: Boolean!
    doctorSecretary: [DoctorSecretary]
  }

  type SecretaryDetails {
    id: String!
    name: String!
    mobileNumber: String!
    isActive: Boolean!
  }

  type DoctorSecretary {
    doctor: Profile
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
    fullName: String
    gender: Gender
    id: ID!
    lastName: String
    mobileNumber: String!
    onlineStatus: DOCTOR_ONLINE_STATUS!
    photoUrl: String
    qualification: String
    salutation: Salutation
    signature: String
    state: String
    streetLine1: String
    streetLine2: String
    streetLine3: String
    thumbnailUrl: String
    displayName: String
    zip: String
    registrationNumber: String
    onlineConsultationFees: String!
    physicalConsultationFees: String!
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
    findLoggedinUserDetails: LoggedInUserDetails
  }
`;

enum LoggedInUserType {
  DOCTOR = 'DOCTOR',
  JUNIOR = 'JUNIOR',
  SECRETARY = 'SECRETARY',
  ADMIN = 'ADMIN',
  JDADMIN = 'JDADMIN',
}

const getDoctorDetails: Resolver<null, {}, DoctorsServiceContext, Doctor> = async (
  parent,
  args,
  { mobileNumber, doctorsDb }
) => {
  let doctordata;
  try {
    const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
    doctordata = await doctorRepository.findByMobileNumber(mobileNumber, true);
    if (doctordata == null) throw new AphError(AphErrorMessages.UNAUTHORIZED);
    if (!doctordata.firebaseToken)
      await doctorRepository.updateFirebaseId(doctordata.id, format(new Date(), 'yyyyMMddHHmm'));
  } catch (getProfileError) {
    throw new AphError(AphErrorMessages.GET_PROFILE_ERROR, undefined, { getProfileError });
  }

  return doctordata;
};

const getDoctorDetailsById: Resolver<null, { id: string }, DoctorsServiceContext, Doctor> = async (
  parent,
  args,
  { doctorsDb }
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

type LoggedInUserDetails = {
  loggedInUserType: LoggedInUserType;
  doctorDetails: Doctor | null;
  JDAdminDetails: DashboardData | null;
  adminDetails: AdminUsers | null;
  secretaryDetails: Secretary | null;
};

const findLoggedinUserDetails: Resolver<
  null,
  {},
  DoctorsServiceContext,
  LoggedInUserDetails
> = async (parent, args, { mobileNumber, doctorsDb, consultsDb }) => {
  //check if doctor
  const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
  const doctorData = await doctorRepository.findByMobileNumber(mobileNumber, true);

  const adminRepository = doctorsDb.getCustomRepository(AdminUser);
  const adminData = await adminRepository.checkValidAccess(mobileNumber, true);

  const secretaryRepo = doctorsDb.getCustomRepository(SecretaryRepository);
  const secretaryData = await secretaryRepo.getSecretary(mobileNumber, true);

  if (doctorData) {
    if (!doctorData.firebaseToken)
      await doctorRepository.updateFirebaseId(doctorData.id, format(new Date(), 'yyyyMMddHHmm'));

    return {
      loggedInUserType:
        doctorData.doctorType === DoctorType.JUNIOR
          ? LoggedInUserType.JUNIOR
          : LoggedInUserType.DOCTOR,
      doctorDetails: doctorData,
      JDAdminDetails: null,
      adminDetails: null,
      secretaryDetails: null,
    };
  } else if (adminData) {
    if (adminData.userType === AdminType.ADMIN) {
      return {
        loggedInUserType: LoggedInUserType.ADMIN,
        doctorDetails: null,
        JDAdminDetails: null,
        adminDetails: adminData,
        secretaryDetails: null,
      };
    } else if (adminData.userType === AdminType.JDADMIN) {
      return {
        loggedInUserType: LoggedInUserType.JDADMIN,
        doctorDetails: null,
        JDAdminDetails: await getJuniorDoctorsDashboard(
          new Date(),
          new Date(),
          0,
          100,
          doctorsDb,
          consultsDb
        ),
        adminDetails: null,
        secretaryDetails: null,
      };
    } else throw new AphError(AphErrorMessages.UNAUTHORIZED);
  } else if (secretaryData) {
    return {
      loggedInUserType: LoggedInUserType.SECRETARY,
      doctorDetails: null,
      JDAdminDetails: null,
      adminDetails: null,
      secretaryDetails: secretaryData,
    };
  } else throw new AphError(AphErrorMessages.UNAUTHORIZED);
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
  DoctorDetailsWithStatusExclude: {
    async __resolveReference(object: Doctor) {
      const connection = getConnection();
      const doctorRepo = connection.getCustomRepository(DoctorRepository);
      return await doctorRepo.findByIdWithStatusExclude(object.id.toString());
    },
  },

  Query: {
    getDoctorDetails,
    getDoctorDetailsById,
    findLoggedinUserDetails,
  },
};
