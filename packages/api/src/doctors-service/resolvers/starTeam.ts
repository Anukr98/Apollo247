import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { DoctorsServiceContext } from 'doctors-service/doctorsServiceContext';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { StarTeamRepository } from 'doctors-service/repositories/starTeamRepository';
import { Doctor } from 'doctors-service/entities/';
import { isUndefined } from 'util';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';

export const starTeamTypeDefs = gql`
  extend type Mutation {
    makeTeamDoctorActive(associatedDoctor: String, starDoctor: String): Boolean
    removeTeamDoctorFromStarTeam(associatedDoctor: String, starDoctor: String): DoctorDetails
  }
`;

const makeTeamDoctorActive: Resolver<
  null,
  { associatedDoctor: string; starDoctor: string },
  DoctorsServiceContext,
  Boolean
> = async (parent, args, { doctorsDb, currentUser }) => {
  const starRepo = doctorsDb.getCustomRepository(StarTeamRepository);
  let doctorDetails;
  try {
    doctorDetails = await starRepo.getTeamDoctorData(args.associatedDoctor, args.starDoctor);
    if (doctorDetails == null) throw new AphError(AphErrorMessages.UNAUTHORIZED);
  } catch (invalidDetails) {
    throw new AphError(AphErrorMessages.INSUFFICIENT_PRIVILEGES, undefined, { invalidDetails });
  }

  if (isUndefined(doctorDetails)) throw new AphError(AphErrorMessages.INSUFFICIENT_PRIVILEGES);

  /*const isAuthorized =  doctorDetails.starDoctor.id === currentUser.id;
  if (!isAuthorized) throw new AphError(AphErrorMessages.INSUFFICIENT_PRIVILEGES); */

  if (doctorDetails.isActive) throw new AphError(AphErrorMessages.ALREADY_ACTIVE_IN_STARTEAM);

  await starRepo.activateTeamDoctor(doctorDetails.id);

  const updatedDoctorDetails = await starRepo.getTeamDoctorData(
    args.associatedDoctor,
    args.starDoctor
  );
  if (updatedDoctorDetails == null) throw new AphError(AphErrorMessages.UNAUTHORIZED);
  return updatedDoctorDetails.isActive;
};

const removeTeamDoctorFromStarTeam: Resolver<
  null,
  { associatedDoctor: string; starDoctor: string },
  DoctorsServiceContext,
  Doctor
> = async (parent, args, { doctorsDb, currentUser }) => {
  const starRepo = doctorsDb.getCustomRepository(StarTeamRepository);
  let doctorDetails;
  try {
    doctorDetails = await starRepo.getTeamDoctorData(args.associatedDoctor, args.starDoctor);
  } catch (invalidDetails) {
    throw new AphError(AphErrorMessages.INSUFFICIENT_PRIVILEGES, undefined, { invalidDetails });
  }

  if (isUndefined(doctorDetails)) throw new AphError(AphErrorMessages.INSUFFICIENT_PRIVILEGES);

  /*const isAuthorized = doctorDetails.starDoctor.id === currentUser.id;
  if (!isAuthorized) throw new AphError(AphErrorMessages.INSUFFICIENT_PRIVILEGES); */

  await starRepo.removeFromStarteam(<string>doctorDetails.id);

  let doctordata;
  try {
    const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
    doctordata = await doctorRepository.findById(args.starDoctor);
    if (doctordata == null) throw new AphError(AphErrorMessages.UNAUTHORIZED);
  } catch (getProfileError) {
    throw new AphError(AphErrorMessages.GET_PROFILE_ERROR, undefined, { getProfileError });
  }
  return doctordata;
};

export const starTeamResolvers = {
  Mutation: {
    makeTeamDoctorActive,
    removeTeamDoctorFromStarTeam,
  },
};
