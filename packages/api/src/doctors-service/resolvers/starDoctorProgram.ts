import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { DoctorsServiceContext } from 'doctors-service/doctorsServiceContext';
import { DoctorsData, INVITEDSTATUS } from 'doctors-service/data/doctorProfile';

export const starDoctorTypeDefs = gql`
  type StarDoctorProfile {
    profile: Doctor
    paymentDetails: [PaymentDetails]
    clinics: [Clinics]
    starDoctorTeam: [Doctor]
    consultationHours: [Consultations]
  }

  extend type Query {
    getDoctorsForStarDoctorProgram(searchString: String): [StarDoctorProfile]
  }

  extend type Mutation {
    addDoctorToStarDoctorProgram(starDoctorId: String, doctorId: String): Boolean
    removeDoctorFromStarDoctorProgram(starDoctorId: String, doctorId: String): Boolean
  }
`;

const getDoctorsForStarDoctorProgram: Resolver<
  null,
  { searchString: string },
  DoctorsServiceContext,
  JSON
> = async (parent, args) => {
  const result = DoctorsData.filter(
    (obj) =>
      obj.profile.firstName.match(args.searchString) &&
      !obj.profile.isStarDoctor &&
      obj.profile.inviteStatus !== INVITEDSTATUS.ACCEPTED
  );
  return JSON.parse(JSON.stringify(result));
};

const addDoctorToStarDoctorProgram: Resolver<
  null,
  { starDoctorId: String; doctorId: String },
  DoctorsServiceContext,
  Boolean
> = async (parent, args) => {
  return true;
};

const removeDoctorFromStarDoctorProgram: Resolver<
  null,
  { starDoctorId: String; doctorId: String },
  DoctorsServiceContext,
  Boolean
> = async (parent, args) => {
  return true;
};

export const starDoctorProgramResolvers = {
  Query: {
    getDoctorsForStarDoctorProgram,
  },
  Mutation: {
    addDoctorToStarDoctorProgram,
    removeDoctorFromStarDoctorProgram,
  },
};
