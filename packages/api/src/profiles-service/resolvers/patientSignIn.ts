import gql from 'graphql-tag';
import { Resolver } from 'profiles-service/profiles-service';
import { Patient, ErrorMsgs } from 'profiles-service/entity/patient';
import fetch from 'node-fetch';

import {
  PrismGetAuthTokenResponse,
  PrismGetAuthTokenError,
  PrismGetUsersError,
  PrismGetUsersResponse,
} from 'types/prism';

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

  enum ErrorMsgs {
    INVALID_TOKEN
    INVALID_MOBILE_NUMBER
    PRISM_AUTH_TOKEN_ERROR
    PRISM_GET_USERS_ERROR
    UPDATE_PROFILE_ERROR
    PRISM_NO_DATA
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

  type Error {
    messages: [ErrorMsgs!]!
  }

  type PatientSignInResult {
    patients: [Patient!]
    errors: Error
  }

  extend type Mutation {
    patientSignIn: PatientSignInResult!
  }
`;

type PatientSignInResult = {
  patients: Patient[] | null;
  errors: { messages: string[] } | null;
};

function wait<R, E>(promise: Promise<R>): [R, E] {
  return (promise.then((data: R) => [data, null], (err: E) => [null, err]) as any) as [R, E];
}

const patientSignIn: Resolver<any> = async (
  parent,
  args,
  { firebaseUid, mobileNumber }
): Promise<PatientSignInResult> => {
  const prismBaseUrl = 'http://blue.phrdemo.com/ui/data';
  const prismHeaders = { method: 'get', headers: { Host: 'blue.phrdemo.com' } };
  const [prismAuthToken, prismAuthTokenError] = await wait<
    PrismGetAuthTokenResponse,
    PrismGetAuthTokenError
  >(
    fetch(`${prismBaseUrl}/getauthtoken?mobile=${mobileNumber}`, prismHeaders).then((res) =>
      res
        .json()
        .then((resp) => {
          return resp;
        })
        .catch((e) => {
          return {
            patients: [],
            errors: { messages: [ErrorMsgs.PRISM_NO_DATA] },
          };
        })
    )
  );
  if (prismAuthTokenError) {
    return {
      patients: null,
      errors: { messages: [ErrorMsgs.PRISM_AUTH_TOKEN_ERROR] },
    };
  }

  const [uhids, uhidsError] = await wait<PrismGetUsersResponse, PrismGetUsersError>(
    fetch(
      `${prismBaseUrl}/getusers?authToken=${prismAuthToken.response}&mobile=${mobileNumber}`,
      prismHeaders
    ).then((res) =>
      res
        .json()
        .then((resp) => {
          return resp;
        })
        .catch((e) => {
          return {
            patients: [],
            errors: { messages: [ErrorMsgs.PRISM_NO_DATA] },
          };
        })
    )
  );
  if (uhidsError) {
    return {
      patients: null,
      errors: { messages: [ErrorMsgs.PRISM_GET_USERS_ERROR] },
    };
  }

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

  const patients = await Promise.all(patientPromises);
  return { patients, errors: null };
};

export const patientResolvers = {
  Mutation: {
    patientSignIn,
  },
};
