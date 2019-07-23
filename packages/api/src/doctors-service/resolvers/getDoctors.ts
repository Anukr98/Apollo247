import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { DoctorsData, INVITEDSTATUS } from 'doctors-service/data/doctorProfile';
import { DoctorsServiceContext } from 'doctors-service/doctors-service';
import { Gender } from 'profiles-service/entity/patient';

export const doctorTypeDefs = gql`
  enum INVITEDSTATUS {
    ACCEPTED
    REJECTED
    NOTAPPLICABLE
    NONE
  }

  enum Gender {
    MALE
    FEMALE
    OTHER
  }

  type Clinics {
    id: ID!
    name: String!
    image: String
    addressLine1: String
    addressLine2: String
    addressLine3: String
    city: String
    isClinic: Boolean
  }

  type Consultations {
    days: String!
    startTime: Time!
    endTime: Time!
    availableForPhysicalConsultation: Boolean!
    availableForVirtualConsultation: Boolean!
    type: String
  }

  type PaymentDetails {
    accountNumber: String!
    address: String
  }

  type Doctor {
    id: ID!
    salutation: String!
    firstName: String!
    lastName: String!
    mobileNumber: String!
    experience: String
    gender: Gender
    speciality: String!
    specialization: String
    isStarDoctor: Boolean!
    education: String!
    services: String
    languages: String
    city: String
    awards: String
    photoUrl: String
    profilePhotoUrl: String
    registrationNumber: String!
    isProfileComplete: String!
    availableForPhysicalConsultation: Boolean!
    availableForVirtualConsultation: Boolean!
    onlineConsultationFees: String!
    physicalConsultationFees: String!
    package: String
    inviteStatus: INVITEDSTATUS
    address: String
  }

  type DoctorProfile {
    profile: Doctor!
    paymentDetails: [PaymentDetails!]
    clinics: [Clinics!]
    starDoctorTeam: [Doctor!]
    consultationHours: [Consultations!]
  }
  extend type Query {
    getDoctors: [DoctorProfile]
    getDoctorProfile: DoctorProfile
    getDoctorProfileById(id: String): DoctorProfile
  }
`;

type Clinics = {
  id: String;
  name: String;
  image: String;
  addressLine1: String;
  addressLine2: String;
  addressLine3: String;
  city: String;
  isClinic: Boolean;
};

type Consultations = {
  days: String;
  startTime: String;
  endTime: String;
  availableForPhysicalConsultation: Boolean;
  availableForVirtualConsultation: Boolean;
  type: String;
};

type PaymentDetails = {
  accountNumber: String;
  address: String;
};

export type Doctor = {
  id: String;
  salutation: String;
  firstName: String;
  lastName: String;
  mobileNumber: String;
  experience: String;
  gender: Gender;
  speciality: String;
  specialization: String;
  isStarDoctor: Boolean;
  education: String;
  services: String;
  languages: String;
  city: String;
  awards: String;
  photoUrl: String;
  profilePhotoUrl: String;
  registrationNumber: String;
  isProfileComplete: Boolean;
  availableForPhysicalConsultation: Boolean;
  availableForVirtualConsultation: Boolean;
  onlineConsultationFees: String;
  physicalConsultationFees: String;
  package: String;
  inviteStatus: INVITEDSTATUS;
  address: String;
};

export type DoctorProfile = {
  profile: Doctor;
  clinics: Clinics[];
  starDoctorTeam: Partial<Doctor>[];
  consultationHours: Consultations[];
  paymentDetails: PaymentDetails[];
};

const getDoctors: Resolver<null, {}, DoctorsServiceContext, JSON> = async (parent, args) => {
  return JSON.parse(JSON.stringify(DoctorsData));
};

const getDoctorProfile: Resolver<null, {}, DoctorsServiceContext, DoctorProfile> = async (
  parent,
  args,
  { mobileNumber }
) => {
  mobileNumber = '1234567890';
  const doctor = DoctorsData.find((item) => {
    return item.profile.mobileNumber === mobileNumber;
  });
  return <DoctorProfile>doctor;
};

const getDoctorProfileById: Resolver<
  null,
  { id: String },
  DoctorsServiceContext,
  DoctorProfile
> = async (parent, args) => {
  const doctor = DoctorsData.find((item) => {
    return item.profile.id === args.id;
  });
  return <DoctorProfile>doctor;
};

export const doctorResolvers = {
  Query: {
    getDoctors,
    getDoctorProfile,
    getDoctorProfileById,
  },
};
