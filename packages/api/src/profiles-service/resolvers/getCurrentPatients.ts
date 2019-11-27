import gql from 'graphql-tag';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { Patient } from 'profiles-service/entities';
import fetch from 'node-fetch';

import {
  PrismGetAuthTokenResponse,
  PrismGetAuthTokenError,
  PrismGetUsersError,
  PrismGetUsersResponse,
} from 'types/prism';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { Resolver } from 'api-gateway';
import { getConnection } from 'typeorm';
import { ApiConstants } from 'ApiConstants';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';

export const getCurrentPatientsTypeDefs = gql`
  enum Gender {
    MALE
    FEMALE
    OTHER
  }

  enum Relation {
    ME
    MOTHER
    FATHER
    SISTER
    BROTHER
    COUSIN
    WIFE
    HUSBAND
    OTHER
  }

  type Patient @key(fields: "id") {
    addressList: [PatientAddress!]
    id: ID!
    firstName: String
    lastName: String
    mobileNumber: String!
    gender: Gender
    uhid: String
    emailAddress: String
    dateOfBirth: Date
    relation: Relation
    photoUrl: String
    allergies: String
  }

  type GetCurrentPatientsResult {
    patients: [Patient!]!
  }

  extend type Query {
    getCurrentPatients: GetCurrentPatientsResult
  }
`;

type GetCurrentPatientsResult = {
  patients: Object[] | null;
};

const getCurrentPatients: Resolver<
  null,
  {},
  ProfilesServiceContext,
  GetCurrentPatientsResult
> = async (parent, args, { firebaseUid, mobileNumber, profilesDb }) => {
  let isPrismWorking = 1;
  const prismUrl = process.env.PRISM_GET_USERS_URL ? process.env.PRISM_GET_USERS_URL : '';
  const prismHost = process.env.PRISM_HOST ? process.env.PRISM_HOST : '';
  if (prismUrl == '') {
    //throw new AphError(AphErrorMessages.INVALID_PRISM_URL, undefined, {});
    isPrismWorking = 0;
  }
  const prismBaseUrl = prismUrl + '/data';
  const prismHeaders = {
    method: 'get',
    headers: { Host: prismHost },
    timeOut: ApiConstants.PRISM_TIMEOUT,
  };

  const prismAuthToken = await fetch(
    `${prismBaseUrl}/getauthtoken?mobile=${mobileNumber}`,
    prismHeaders
  )
    .then((res) => res.json() as Promise<PrismGetAuthTokenResponse>)
    .catch((prismGetAuthTokenError: PrismGetAuthTokenError) => {
      // throw new AphError(AphErrorMessages.PRISM_AUTH_TOKEN_ERROR, undefined, {
      //   prismGetAuthTokenError,
      // });
      isPrismWorking = 0;
    });
  let uhids;
  if (prismAuthToken != null) {
    uhids = await fetch(
      `${prismBaseUrl}/getusers?authToken=${prismAuthToken.response}&mobile=${mobileNumber}`,
      prismHeaders
    )
      .then((res) => res.json() as Promise<PrismGetUsersResponse>)
      .catch((prismGetUsersError: PrismGetUsersError) => {
        // throw new AphError(AphErrorMessages.PRISM_GET_USERS_ERROR, undefined, {
        //   prismGetUsersError,
        // });
        isPrismWorking = 0;
      });
  }
  console.log(uhids, 'uhid', isPrismWorking);
  const findOrCreatePatient = (
    findOptions: { uhid?: Patient['uhid']; mobileNumber: Patient['mobileNumber'] },
    createOptions: Partial<Patient>
  ): Promise<Patient> => {
    return Patient.findOne({
      where: { uhid: findOptions.uhid, mobileNumber: findOptions.mobileNumber },
    }).then((existingPatient) => {
      return existingPatient || Patient.create(createOptions).save();
    });
  };
  let patientPromises: Object[] = [];
  if (uhids != null && uhids.response != null) {
    isPrismWorking = 1;
    //isPatientInPrism = uhids.response && uhids.response.signUpUserData;
    patientPromises = uhids.response!.signUpUserData.map((data) => {
      return findOrCreatePatient(
        { uhid: data.UHID, mobileNumber },
        {
          firebaseUid,
          firstName: data.userName,
          lastName: '',
          gender: undefined,
          mobileNumber,
          uhid: data.UHID,
        }
      );
    });
  } else {
    isPrismWorking = 0;
  }
  if (isPrismWorking == 0) {
    patientPromises = [
      findOrCreatePatient(
        { uhid: '', mobileNumber },
        {
          firebaseUid,
          firstName: '',
          lastName: '',
          gender: undefined,
          mobileNumber,
          uhid: '',
        }
      ),
    ];
  }

  const updatePatients = await Promise.all(patientPromises).catch((findOrCreateErrors) => {
    throw new AphError(AphErrorMessages.UPDATE_PROFILE_ERROR, undefined, { findOrCreateErrors });
  });
  console.log(updatePatients);
  const patientRepo = profilesDb.getCustomRepository(PatientRepository);
  const patients = await patientRepo.findByMobileNumber(mobileNumber);
  return { patients };
};

export const getCurrentPatientsResolvers = {
  Patient: {
    async __resolveReference(object: Patient) {
      const connection = getConnection();
      const patientsRepo = connection.getRepository(Patient);
      const patientDetails = await patientsRepo.findOne({ where: { id: object.id } });
      return patientDetails;
    },
  },
  Query: {
    getCurrentPatients,
  },
};
