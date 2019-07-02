import gql from 'graphql-tag';
import { Resolver } from 'profiles/profiles-service';
import { Patient, Sex, Relation, ErrorMsgs } from 'profiles/entity/patient';
import fetch from 'node-fetch';
import { auth } from 'firebase-admin';
import { BaseEntity, QueryFailedError } from 'typeorm';

import {
  PrismGetAuthTokenResponse,
  PrismGetAuthTokenError,
  PrismGetUsersError,
  PrismGetUsersResponse,
} from 'services/types/prism';

export const patientTypeDefs = gql`
  enum Sex {
    NOT_KNOWN
    MALE
    FEMALE
    OTHER
    NOT_APPLICABLE
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
    sex: Sex
    uhid: String
    emailAddress: String
    dateOfBirth: String
    relation: Relation
  }

  type Error {
    messages: [String!]!
  }

  type GetPatientsResult {
    patients: [Patient!]!
  }
  extend type Query {
    getPatients: GetPatientsResult
  }

  type PatientSignInResult {
    patients: [Patient!]
    errors: Error
  }

  type UpdatePatientResult {
    patient: Patient
    errors: Error
  }

  extend type Mutation {
    patientSignIn(jwt: String): PatientSignInResult!
    updatePatient(
      id: ID!
      firstName: String
      lastName: String
      sex: Sex
      emailAddress: String
      dateOfBirth: String
      relation: Relation
    ): UpdatePatientResult
  }
`;

type PatientSignInResult = {
  patients: Patient[] | null;
  errors: { messages: string[] } | null;
};

type UpdatePatientResult = {
  patient: Patient | null;
  errors: { messages: string[] } | null;
};

function wait<R, E>(promise: Promise<R>): [R, E] {
  return (promise.then((data: R) => [data, null], (err: E) => [null, err]) as any) as [R, E];
}

async function updateEntity<E extends BaseEntity>(
  Entity: typeof BaseEntity,
  id: string,
  attrs: Partial<Omit<E, keyof BaseEntity>>
): Promise<E> {
  let entity: E;
  try {
    entity = await Entity.findOneOrFail<E>(id);
    await Entity.update(id, attrs);
    await entity.reload();
  } catch (e) {
    throw e;
  }
  return entity;
}

const getPatients = () => ({ patients: [] });

const patientSignIn: Resolver<any, { jwt: string }> = async (
  parent,
  args,
  { firebase }
): Promise<PatientSignInResult> => {
  const [firebaseIdToken, firebaseIdTokenError] = await wait<auth.DecodedIdToken, FirebaseError>(
    firebase.auth().verifyIdToken(args.jwt)
  );

  if (firebaseIdTokenError) {
    return {
      patients: null,
      errors: { messages: [`${ErrorMsgs.INVALID_TOKEN}`] },
    };
  }

  const firebaseUid = firebaseIdToken.uid;
  const [firebaseUser, firebaseUserError] = await wait(firebase.auth().getUser(firebaseUid));
  if (firebaseUserError) {
    return {
      patients: [],
      errors: { messages: [ErrorMsgs.INVALID_MOBILE_NUMBER] },
    };
  }
  const mobileNumber = firebaseUser.phoneNumber!;

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
          console.log(resp);
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
            sex: Sex.NOT_KNOWN,
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
            sex: Sex.NOT_KNOWN,
            mobileNumber,
            uhid: '',
          }
        ),
      ];

  const patients = await Promise.all(patientPromises);
  return { patients, errors: null };
};

const updatePatient: Resolver<any, Partial<Patient> & { id: Patient['id'] }> = async (
  parent,
  args
): Promise<UpdatePatientResult> => {
  const { id, ...updateAttrs } = args;
  const [updatedPatient, updateError] = await wait<Patient, QueryFailedError>(
    updateEntity<Patient>(Patient, id, updateAttrs)
  );

  if (updateError) return { patient: null, errors: { messages: [ErrorMsgs.UPDATE_PROFILE_ERROR] } };
  return { patient: updatedPatient, errors: null };
};

export const patientResolvers = {
  Query: {
    getPatients,
  },
  Mutation: {
    patientSignIn,
    updatePatient,
  },
};
