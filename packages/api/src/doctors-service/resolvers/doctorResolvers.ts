import gql from 'graphql-tag';
import { Resolver } from 'doctors-service/doctors-service';
import DoctorsData from '../data/doctors.json';
import { JsonValue } from 'apollo-utilities';
import { isNull, isUndefined } from 'util';

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

  type DoctorProfile {
    id: String
    firstName: String
    lastName: String
    mobileNumber: String
    experience: String
    speciality: String
    isStarDoctor: Boolean
    education: String
    services: String
    languages: String
    city: String
    awards: String
    clinicsList: [clinicsList]
    starDoctorTeam: [starDoctorTeam]
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
  let authorized = DoctorsData.find((item) => {
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

type DoctorProfile = {
  id: String;
  firstName: String;
  lastName: String;
  mobileNumber: String;
  experience: String;
  speciality: String;
  isStarDoctor: Boolean;
  education: String;
  services: String;
  languages: String;
  city: String;
  awards: String;
  clinicsList: clinicsList[];
  starDoctorTeam: starDoctorTeam[];
};

const getDoctorProfile: Resolver<any, { mobileNumber: string }> = async (
  parent,
  args
): Promise<DoctorProfile> => {
  let doctor = DoctorsData.find((item) => {
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
