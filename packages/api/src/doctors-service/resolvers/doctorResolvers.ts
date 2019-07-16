import gql from 'graphql-tag';
import { Resolver } from 'doctors-service/doctors-service';
import DoctorsData from 'doctors-service/data/doctors.json';
import { isUndefined } from 'util';

export const doctorTypeDefs = gql`
  type Doctor {
    id: String
    firstName: String
    lastName: String
    mobileNumber: String
    experience: String
  }

  type clinicsList {
    name: String
    location: String
  }

  type starDoctorTeam {
    firstName: String
    lastName: String
    experience: String
    typeOfConsult: String
    inviteStatus: String
  }

  type consultations {
    days: String
    timings: String
    availableForPhysicalConsultation: Boolean
    availableForVirtualConsultation: Boolean
    type: String
  }

  type paymentDetails {
    accountNumber: String
    address: String
  }

  type DoctorProfile {
    id: String
    firstName: String
    lastName: String
    mobileNumber: String
    experience: String
    speciality: String
    specialization: String
    isStarDoctor: Boolean
    education: String
    services: String
    languages: String
    city: String
    awards: String
    photoUrl: String
    registrationNumber: String
    isProfileComplete: String
    availableForPhysicalConsultation: Boolean
    availableForVirtualConsultation: Boolean
    onlineConsultationFees: String
    physicalConsultationFees: String
    package: String
    paymentDetails: [paymentDetails]
    clinicsList: [clinicsList]
    starDoctorTeam: [starDoctorTeam]
    consultationHours: [consultations]
  }

  extend type Query {
    getDoctors: [Doctor]
    hasAccess(mobileNumber: String): Boolean
    getDoctorProfile(mobileNumber: String): DoctorProfile
  }
`;

const getDoctors: Resolver<any> = async (parent, args): Promise<JSON> => {
  return JSON.parse(JSON.stringify(DoctorsData));
};

const hasAccess: Resolver<any, { mobileNumber: string }> = async (
  parent,
  args
): Promise<Boolean> => {
  const authorized = DoctorsData.find((item) => {
    return item.mobileNumber === args.mobileNumber;
  });
  return isUndefined(authorized) ? false : true;
};

type clinicsList = {
  name: String;
  location: String;
};

type starDoctorTeam = {
  firstName: String;
  lastName: String;
  experience: String;
  typeOfConsult: String;
  inviteStatus: String;
};

type consultations = {
  days: String;
  timings: String;
  availableForPhysicalConsultation: Boolean;
  availableForVirtualConsultation: Boolean;
  type: String;
};

type paymentDetails = {
  accountNumber: String;
  address: String;
};

type DoctorProfile = {
  id: String;
  firstName: String;
  lastName: String;
  mobileNumber: String;
  experience: String;
  speciality: String;
  specialization: String;
  isStarDoctor: Boolean;
  education: String;
  services: String;
  languages: String;
  city: String;
  awards: String;
  photoUrl: String;
  registrationNumber: String;
  isProfileComplete: Boolean;
  availableForPhysicalConsultation: Boolean;
  availableForVirtualConsultation: Boolean;
  onlineConsultationFees: String;
  physicalConsultationFees: String;
  package: String;
  paymentDetails: paymentDetails[];
  clinicsList: clinicsList[];
  starDoctorTeam: starDoctorTeam[];
  consultationHours: consultations[];
};

const getDoctorProfile: Resolver<any, { mobileNumber: string }> = async (
  parent,
  args
): Promise<DoctorProfile> => {
  const doctor = DoctorsData.find((item) => {
    return item.mobileNumber === args.mobileNumber;
  });
  return <DoctorProfile>doctor;
};

export const doctorResolvers = {
  Query: {
    getDoctors,
    hasAccess,
    getDoctorProfile,
  },
};
