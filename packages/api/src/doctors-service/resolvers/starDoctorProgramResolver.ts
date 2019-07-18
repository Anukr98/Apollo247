import gql from 'graphql-tag';
import { Resolver } from 'doctors-service/doctors-service';
import { DoctorProfile } from 'doctors-service/resolvers/doctorResolvers';
import { DoctorsServiceContext } from 'doctors-service/doctors-service';

export const starDoctorTypeDefs = gql`
  extend type Query {

    getDoctorsForStarDoctorProgram(searchString: String): [DoctorProfile]
    addDoctorToStartDoctorProgram(starDoctorId: String, doctorId: String): Boolean
    removeDoctorFromStartDoctorProgram(starDoctorId: String, doctorId: String): Boolean
  } 

const getDoctorsForStarDoctorProgram: Resolver<
  null, 
  { searchString: string },
  DoctorsServiceContext,
  JSON
  > = async (
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

const addDoctorToStartDoctorProgram: Resolver<
  null,
  { starDoctorId: String; doctorId: String },
  DoctorsServiceContext,
  Boolean
> = async (parent, args): Promise<Boolean> => {
  return true;
};

const removeDoctorFromStartDoctorProgram: Resolver<
  null,
  { starDoctorId: String; doctorId: String },
  DoctorsServiceContext,
  Boolean
> = async (parent, args): Promise<Boolean> => {
  return true;
};

  export const starDoctorResolvers = {
  Query: {     
    getDoctorsForStarDoctorProgram, 
    addDoctorToStartDoctorProgram,
    removeDoctorFromStartDoctorProgram,
  },
`;
