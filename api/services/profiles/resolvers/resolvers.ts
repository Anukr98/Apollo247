import { models } from 'services/profiles/models/models';
import gql from 'graphql-tag';
import * as firebaseAdmin from 'firebase-admin';
import { PatientModel } from 'services/profiles/models/patient';

export type Resolver<Parent = any, Args = any, Context = { models: typeof models }> = (
  parent: Parent,
  args: Args,
  context: Context
) => any;

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.applicationDefault(),
  databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
});

export const typeDefs = gql`
  enum Sex {
    NOT_KNOWN
    MALE
    FEMALE
    OTHER
    NOT_APPLICABLE
  }

  type Doctor @key(fields: "id") {
    id: ID!
    firstName: String
    lastName: String
    email: String
  }

  type Patient @key(fields: "id") {
    id: ID!
    firstName: String
    lastName: String
    mobileNumber: String
    sex: Sex
  }

  type PatientSignInResult {
    patients: [Patient!]!
  }

  extend type Query {
    doctors: [Doctor!]
  }

  extend type Mutation {
    createDoctor(firstName: String, lastName: String, email: String): Doctor!
    patientSignIn(jwt: String): PatientSignInResult!
  }
`;

const doctors: Resolver = (parent, args, { models }) => models.Doctor.findAll();

const createDoctor: Resolver<any, { firstName: string; lastName: string; email: string }> = (
  parent,
  args,
  { models }
) => models.Doctor.create({ ...args });

const patientSignIn: Resolver<any, { jwt: string }> = async (parent, args, { models }) => {
  const idToken = await firebaseAdmin.auth().verifyIdToken(args.jwt);
  const uid = idToken.uid;
  const firebaseUser = await firebaseAdmin.auth().getUser(uid);
  const existingPatient = await models.Patient.findOne({
    where: { firebaseId: uid, mobileNumber: firebaseUser.phoneNumber! },
  });
  const patient =
    existingPatient ||
    (await models.Patient.create({
      firebaseId: uid,
      mobileNumber: firebaseUser.phoneNumber!,
      firstName: '',
      lastName: '',
    }));
  return { patients: [patient] };
};

export const resolvers = {
  Query: {
    doctors,
  },
  Mutation: {
    createDoctor,
    patientSignIn,
  },
};
