import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { DoctorsServiceContext } from 'doctors-service/doctors-service';
import { DoctorsData } from 'doctors-service/data/doctorProfile';

export const starDoctorTypeDefs = gql`
  type DoctorsProfile {
    profile: Doctor
    paymentDetails: [PaymentDetails]
    clinics: [Clinics]
    starDoctorTeam: [Doctor]
    consultationHours: [Consultations]
  }

  extend type Query {
    getDoctorsForStarDoctorProgram(searchString: String): [DoctorsProfile]
    addDoctorToStartDoctorProgram(starDoctorId: String, doctorId: String): Boolean
    removeDoctorFromStartDoctorProgram(starDoctorId: String, doctorId: String): Boolean
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
      obj.profile.inviteStatus !== 'accepted'
  );
  return JSON.parse(JSON.stringify(result));
};

const addDoctorToStartDoctorProgram: Resolver<
  null,
  { starDoctorId: String; doctorId: String },
  DoctorsServiceContext,
  Boolean
> = async (parent, args) => {
  return true;
};

const removeDoctorFromStartDoctorProgram: Resolver<
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
    addDoctorToStartDoctorProgram,
    removeDoctorFromStartDoctorProgram,
  },
};
