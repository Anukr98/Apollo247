import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { DoctorsServiceContext } from 'doctors-service/doctorsServiceContext';
import { DOCTOR_ONLINE_STATUS, Doctor, DoctorLoginSessionHistory } from 'doctors-service/entities';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { differenceInSeconds } from 'date-fns';
import { LoginHistoryRepository } from 'doctors-service/repositories/loginSessionRepository';

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

  //update login session
  if (doctor.statusChangeTime == null || typeof doctor.statusChangeTime == undefined)
    docRepo.update(doctor.id, { statusChangeTime: new Date() });
  else {
    if (doctor.onlineStatus !== onlineStatus) {
      //calculate hours between now and sessionChangeTime
      let onlineSeconds = 0;
      let offlineSeconds = 0;

      const numberOfSeconds = differenceInSeconds(new Date(), doctor.statusChangeTime);
      doctor.onlineStatus === DOCTOR_ONLINE_STATUS.AWAY
        ? (offlineSeconds = numberOfSeconds)
        : (onlineSeconds = numberOfSeconds);

      const todayDate = new Date();
      todayDate.setHours(0);
      todayDate.setMinutes(0);
      todayDate.setSeconds(0);
      todayDate.setMilliseconds(0);
      const loginSessionRepo = doctorsDb.getCustomRepository(LoginHistoryRepository);
      const todaySession = await loginSessionRepo.getLoginSessionByDate(todayDate);

      let sessionRecord: Partial<DoctorLoginSessionHistory>;
      if (todaySession == null) {
        //create new record.
        sessionRecord = {
          sessionDate: todayDate,
          doctor: doctor,
          onlineStatus: doctor.onlineStatus,
          onlineTimeInSeconds: onlineSeconds,
          offlineTimeInSeconds: offlineSeconds,
        };
      } else {
        sessionRecord = {
          sessionDate: todayDate,
          doctor: doctor,
          onlineStatus: doctor.onlineStatus,
          onlineTimeInSeconds: onlineSeconds + todaySession.onlineTimeInSeconds,
          offlineTimeInSeconds: offlineSeconds + todaySession.offlineTimeInSeconds,
          id: todaySession.id,
        };
        //update the existing record.
      }
      loginSessionRepo.updateLoginSession(sessionRecord);
      docRepo.update(doctor.id, { statusChangeTime: undefined });
    }
  }

  await doctor.reload();
  return { doctor };
};

export const doctorOnlineStatusResolvers = {
  Mutation: {
    updateDoctorOnlineStatus,
  },
};
