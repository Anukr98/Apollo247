import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { DoctorsServiceContext } from 'doctors-service/doctorsServiceContext';
import { DOCTOR_ONLINE_STATUS, Doctor } from 'doctors-service/entities';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

export const doctorOnlineStatusTypeDefs = gql`
  type UpdateDoctorOnlineStatusResult {
    doctor: DoctorDetails!
  }
  extend type Mutation {
    updateDoctorOnlineStatus(
      doctorId: String!
      onlineStatus: DOCTOR_ONLINE_STATUS!
    ): UpdateDoctorOnlineStatusResult!
  }
`;

type UpdateDoctorOnlineStatusInput = { doctorId: string; onlineStatus: DOCTOR_ONLINE_STATUS };
type UpdateDoctorOnlineStatusResult = { doctor: Doctor };
const updateDoctorOnlineStatus: Resolver<
  null,
  UpdateDoctorOnlineStatusInput,
  DoctorsServiceContext,
  UpdateDoctorOnlineStatusResult
> = async (parent, { doctorId, onlineStatus }, { doctorsDb, currentUser }) => {
  const docRepo = doctorsDb.getCustomRepository(DoctorRepository);
  const doctor = await docRepo.findById(currentUser.id);
  const authorized = currentUser && currentUser.id && currentUser.id === doctorId;
  if (!authorized || !doctor) throw new AphError(AphErrorMessages.UNAUTHORIZED);
  await docRepo.update(doctor.id, { onlineStatus });
  await doctor.reload();
  return { doctor };
};

export const doctorOnlineStatusResolvers = {
  Mutation: {
    updateDoctorOnlineStatus,
  },
};
