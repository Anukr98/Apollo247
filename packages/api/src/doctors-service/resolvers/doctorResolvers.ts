import gql from 'graphql-tag';
import { Resolver } from 'doctors-service/doctors-service';
import DoctorsData from 'doctors-service/data/doctors.json';
export const doctorTypeDefs = gql`
  type clinics {
    name: String
    location: String
  }

  type Consultations {
    days: String
    timings: String
    availableForPhysicalConsultation: Boolean
    availableForVirtualConsultation: Boolean
    type: String
  }

  type PaymentDetails {
    accountNumber: String
    address: String
  }

  type Doctor {
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
    typeOfConsult: String
    inviteStatus: String
  }

  type DoctorProfile {
    profile: Doctor
    paymentDetails: [PaymentDetails]
    clinics: [clinics]
    starDoctorTeam: [Doctor]
    consultationHours: [Consultations]
  }
  extend type Query {
    getDoctors: [DoctorProfile]
    getDoctorProfile: DoctorProfile
    getDoctorProfileById(id: String): DoctorProfile
    getDoctorsForStarDoctorProgram(searchString: String): [DoctorProfile]
  }
`;

type clinics = {
  name: String;
  location: String;
};

type Consultations = {
  days: String;
  timings: String;
  availableForPhysicalConsultation: Boolean;
  availableForVirtualConsultation: Boolean;
  type: String;
};

type PaymentDetails = {
  accountNumber: String;
  address: String;
};

type Doctor = {
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
  typeOfConsult: String;
  inviteStatus: String;
};

type DoctorProfile = {
  profile: Doctor;
  clinics: clinics[];
  starDoctorTeam: Partial<Doctor>[];
  consultationHours: Consultations[];
  paymentDetails: PaymentDetails[];
};

const getDoctors: Resolver<any> = async (parent, args): Promise<JSON> => {
  return JSON.parse(JSON.stringify(DoctorsData));
};

const getDoctorProfile: Resolver<any> = async (
  parent,
  args,
  { mobileNumber }
): Promise<DoctorProfile> => {
  mobileNumber = '1234567890';
  const doctor = DoctorsData.find((item) => {
    return item.profile.mobileNumber === mobileNumber;
  });
  return <DoctorProfile>doctor;
};

const getDoctorProfileById: Resolver<any, { id: String }> = async (
  parent,
  args
): Promise<DoctorProfile> => {
  const doctor = DoctorsData.find((item) => {
    return item.profile.id === args.id;
  });
  return <DoctorProfile>doctor;
};

const getDoctorsForStarDoctorProgram: Resolver<any, { searchString: string }> = async (
  parent,
  args
): Promise<JSON> => {
  const result = DoctorsData.filter(
    (obj) =>
      obj.profile.firstName.match(args.searchString) &&
      !obj.profile.isStarDoctor &&
      obj.profile.inviteStatus !== 'accepted'
  );
  return JSON.parse(JSON.stringify(result));
};

export const doctorResolvers = {
  Query: {
    getDoctors,
    getDoctorProfile,
    getDoctorsForStarDoctorProgram,
    getDoctorProfileById,
  },
};
