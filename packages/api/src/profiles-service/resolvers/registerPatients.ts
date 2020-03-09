import gql from 'graphql-tag';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { DEVICE_TYPE } from 'profiles-service/entities';

import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { Resolver } from 'api-gateway';

import { PatientRepository } from 'profiles-service/repositories/patientRepository';

import {
  prismAuthenticationAsync,
  prismGetUsersAsync,
  addToPatientPrismQueue,
  prismAuthentication,
  prismGetUsers,
  findOrCreatePatient,
} from 'helpers/prismCall';
import { GetCurrentPatientsResult } from 'profiles-service/resolvers/getCurrentPatients';
import { PrismGetAuthTokenResponse } from 'types/prism';
import { sendPatientRegistrationNotification } from 'notifications-service/resolvers/notifications';

export const registerPatientsTypeDefs = gql`
  extend type Mutation {
    registerPatients: GetCurrentPatientsResult
    registerPatientsFromPrism(mobileNumber: String): GetCurrentPatientsResult
  }
`;
const registerPatients: Resolver<
  null,
  { appVersion: string; deviceType: DEVICE_TYPE },
  ProfilesServiceContext,
  GetCurrentPatientsResult
> = async (parent, args, { mobileNumber, profilesDb }) => {
  const patientRepo = profilesDb.getCustomRepository(PatientRepository);
  let patients = await patientRepo.findByMobileNumber(mobileNumber);

  //new user for 24X7
  if (patients.length == 0) {
    //prism authentication with logged in mobile number
    const prismAuthToken: PrismGetAuthTokenResponse = await prismAuthenticationAsync(mobileNumber);

    if (prismAuthToken.response === 'AbortError') {
      console.log('error', prismAuthToken);
      //add this to Patient prism Queue
      const patientDetails = await findOrCreatePatient(
        { uhid: '', mobileNumber, isActive: true },
        {
          firstName: '',
          lastName: '',
          gender: undefined,
          mobileNumber,
          uhid: '',
          androidVersion: args.appVersion,
          iosVersion: args.appVersion,
        }
      );
      console.log('AbortError...', patientDetails);
      addToPatientPrismQueue(patientDetails);
    } else {
      //call user data from PRISM
      if (prismAuthToken.response) {
        const uhids = await prismGetUsersAsync(mobileNumber, prismAuthToken.response);
        console.log('uhids>>>>>>>>>>>', uhids);
        let patientPromises: Object[] = [];
        if (uhids.response!.recoveryMessage === 'AbortError') {
          //add this to Patient prism Queue
          const patientDetails = await findOrCreatePatient(
            { uhid: '', mobileNumber, isActive: true },
            {
              firstName: '',
              lastName: '',
              gender: undefined,
              mobileNumber,
              uhid: '',
              androidVersion: args.appVersion,
              iosVersion: args.appVersion,
            }
          );
          addToPatientPrismQueue(patientDetails);
        } else if (uhids && uhids.response) {
          patientPromises = uhids.response!.signUpUserData.map((data) => {
            return findOrCreatePatient(
              { uhid: data.UHID, mobileNumber, isActive: true },
              {
                firstName: data.userName,
                lastName: '',
                gender: undefined,
                mobileNumber,
                uhid: data.UHID,
                androidVersion: args.appVersion,
                iosVersion: args.appVersion,
              }
            );
          });
        } else {
          patientPromises = [
            findOrCreatePatient(
              { uhid: '', mobileNumber, isActive: true },
              {
                firstName: '',
                lastName: '',
                gender: undefined,
                mobileNumber,
                uhid: '',
                androidVersion: args.appVersion,
                iosVersion: args.appVersion,
              }
            ),
          ];
        }
        await Promise.all(patientPromises).catch((findOrCreateErrors) => {
          throw new AphError(AphErrorMessages.UPDATE_PROFILE_ERROR, undefined, {
            findOrCreateErrors,
          });
        });
      }
    }
  }
  patients = await patientRepo.findByMobileNumber(mobileNumber);
  return { patients };
};

const registerPatientsFromPrism: Resolver<
  null,
  { mobileNumber: string },
  ProfilesServiceContext,
  GetCurrentPatientsResult
> = async (parent, args, { profilesDb }) => {
  const mobileNumber = args.mobileNumber;
  const patientRepo = profilesDb.getCustomRepository(PatientRepository);
  let patients = await patientRepo.findByMobileNumber(mobileNumber);

  //prism authentication with logged in mobile number
  const prismAuthToken: PrismGetAuthTokenResponse = await prismAuthentication(mobileNumber);

  //call user data from PRISM
  if (prismAuthToken.response) {
    const uhids = await prismGetUsers(mobileNumber, prismAuthToken.response);
    console.log('uhids>>>>>>>>>>>', uhids);
    let patientPromises: Object[] = [];
    if (uhids && uhids.response) {
      patientPromises = uhids.response!.signUpUserData.map((data) => {
        return findOrCreatePatient(
          { uhid: data.UHID, mobileNumber, isActive: true },
          {
            firstName: data.userName,
            lastName: '',
            gender: undefined,
            mobileNumber,
            uhid: data.UHID,
          }
        );
      });
    }
    await Promise.all(patientPromises).catch((findOrCreateErrors) => {
      throw new AphError(AphErrorMessages.UPDATE_PROFILE_ERROR, undefined, {
        findOrCreateErrors,
      });
    });
    sendPatientRegistrationNotification(patients[0], profilesDb, '');
    patients = await patientRepo.findByMobileNumber(mobileNumber);
    //send registration success notification here
  }

  return { patients };
};
export const registerPatientsResolvers = {
  Mutation: {
    registerPatients,
    registerPatientsFromPrism,
  },
};
