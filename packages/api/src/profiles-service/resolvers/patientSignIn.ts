import gql from 'graphql-tag';
import { Resolver } from 'profiles-service/profiles-service';
import { Patient } from 'profiles-service/entity/patient';
import fetch from 'node-fetch';

import {
  PrismGetAuthTokenResponse,
  PrismGetAuthTokenError,
  PrismGetUsersError,
  PrismGetUsersResponse,
} from 'types/prism';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/AphErrorMessages';

export const patientTypeDefs = gql`
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
    id: ID!
    firstName: String
    lastName: String
    mobileNumber: String
    gender: Gender
    uhid: String
    emailAddress: String
    dateOfBirth: String
    relation: Relation
  }

  type PatientSignInResult {
    patients: [Patient!]
  }

  extend type Mutation {
    patientSignIn: PatientSignInResult!
  }
`;

type PatientSignInResult = {
  patients: Patient[] | null;
};

const patientSignIn: Resolver<any> = async (
  parent,
  args,
  { firebaseUid, mobileNumber }
): Promise<PatientSignInResult> => {
  const prismBaseUrl = 'http://blue.phrdemo.com/ui/data';
  const prismHeaders = { method: 'get', headers: { Host: 'blue.phrdemo.com' } };

  const prismAuthToken = await fetch(
    `${prismBaseUrl}/getauthtoken?mobile=${mobileNumber}`,
    prismHeaders
  )
    .then((res) => res.json() as Promise<PrismGetAuthTokenResponse>)
    .catch((prismGetAuthTokenError: PrismGetAuthTokenError) => {
      throw new AphError(AphErrorMessages.PRISM_AUTH_TOKEN_ERROR, undefined, {
        prismGetAuthTokenError,
      });
    });

  const uhids = await fetch(
    `${prismBaseUrl}/getusers?authToken=${prismAuthToken.response}&mobile=${mobileNumber}`,
    prismHeaders
  )
    .then((res) => res.json() as Promise<PrismGetUsersResponse>)
    .catch((prismGetUsersError: PrismGetUsersError) => {
      throw new AphError(AphErrorMessages.PRISM_GET_USERS_ERROR, undefined, {
        prismGetUsersError,
      });
    });

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

  const isPatientInPrism = uhids.response && uhids.response.signUpUserData;

  const patientPromises = isPatientInPrism
    ? uhids.response!.signUpUserData.map((data) => {
        return findOrCreatePatient(
          { uhid: data.uhid, mobileNumber },
          {
            firebaseId: firebaseUid,
            firstName: data.userName,
            lastName: '',
            gender: undefined,
            mobileNumber,
            uhid: data.UHID,
          }
        );
      })
    : [
        findOrCreatePatient(
          { uhid: '', mobileNumber },
          {
            firebaseId: firebaseUid,
            firstName: '',
            lastName: '',
            gender: undefined,
            mobileNumber,
            uhid: '',
          }
        ),
      ];

  const patients = await Promise.all(patientPromises).catch((findOrCreateErrors) => {
    throw new AphError(AphErrorMessages.UPDATE_PROFILE_ERROR, undefined, { findOrCreateErrors });
  });
  return { patients };
};

export const patientResolvers = {
  Mutation: {
    patientSignIn,
  },
};
