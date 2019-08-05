import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { DoctorsServiceContext } from 'doctors-service/doctorsServiceContext';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/AphErrorMessages';
import { StarTeamRepository } from 'doctors-service/repositories/starTeamRepository';
import { StarTeam } from 'doctors-service/entities/';
import { isUndefined } from 'util';

export const starTeamTypeDefs = gql`
  extend type Mutation {
    makeTeamDoctorActive(associatedDoctor: String, starDoctor: String): Boolean
  }
`;

const makeTeamDoctorActive: Resolver<
  null,
  { associatedDoctor: string; starDoctor: string },
  DoctorsServiceContext,
  Boolean
> = async (parent, args, { dbConnect, currentUser }) => {
  const starRepo = dbConnect.getCustomRepository(StarTeamRepository);
  const doctorDetails = (await starRepo.getTeamDoctorData(
    args.associatedDoctor,
    args.starDoctor
  )) as StarTeam;

  if (isUndefined(doctorDetails)) throw new AphError(AphErrorMessages.INSUFFICIENT_PREVILAGES);

  const isAuthorized = doctorDetails.starDoctor.id === currentUser.id;
  if (!isAuthorized) throw new AphError(AphErrorMessages.INSUFFICIENT_PREVILAGES);

  if (doctorDetails.isActive) throw new AphError(AphErrorMessages.ALREADY_ACTIVE_IN_STARTEAM);

  await starRepo.ActivateTeamDoctor(doctorDetails.isActive);

  const updatedDoctorDetails = (await starRepo.getTeamDoctorData(
    args.associatedDoctor,
    args.starDoctor
  )) as StarTeam;
  return updatedDoctorDetails.isActive;
};

export const starTeamResolvers = {
  Mutation: {
    makeTeamDoctorActive,
  },
};
