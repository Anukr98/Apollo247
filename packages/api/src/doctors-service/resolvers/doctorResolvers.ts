import gql from 'graphql-tag';
import { Resolver } from 'doctors-service/doctors-service';
import DoctorsData from 'doctors-service/data/doctors.json';
export const doctorTypeDefs = gql`
  type clinicsList {
    name: String
    location: String
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
    paymentDetails: [paymentDetails]
    clinicsList: [clinicsList]
    starDoctorTeam: [Doctor]
    consultationHours: [consultations]
  }
  extend type Query {
    getDoctorProfile: DoctorProfile
    getDoctorProfileById(id: String): DoctorProfile
  }
`;

const getDoctors: Resolver<any> = async (parent, args): Promise<JSON> => {
  return JSON.parse(JSON.stringify(DoctorsData));
};

type clinicsList = {
  name: String;
  location: String;
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
  paymentDetails: paymentDetails[];
  clinicsList: clinicsList[];
  starDoctorTeam: Partial<Doctor>[];
  consultationHours: consultations[];
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

/*const getDoctorsForStarDoctorProgram: Resolver<any, { searchString: string }> = async (
  parent,
  args
): Promise<Doctor> => {
  args.searchString = 'an';
  const result = DoctorsData.filter(
    (obj) =>
      obj.profile.firstName.match(args.searchString) &&
      !obj.profile.isStarDoctor &&
      obj.profile.inviteStatus !== 'accepted'
  );
  //return JSON.parse(JSON.stringify(result));
  return result;
};*/

export const doctorResolvers = {
  Query: {
    getDoctors,
    getDoctorProfile,
    /*getDoctorsForStarDoctorProgram,*/
    getDoctorProfileById,
  },
};
