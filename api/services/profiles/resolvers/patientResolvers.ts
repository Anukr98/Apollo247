import gql from 'graphql-tag';
import { Resolver } from 'profiles/profiles-service';
import { Patient, Sex } from 'profiles/entity/patient';

export const patientTypeDefs = gql`
  enum Sex {
    NOT_KNOWN
    MALE
    FEMALE
    OTHER
    NOT_APPLICABLE
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
    getPatients: [Patient!]!
  }

  extend type Mutation {
    patientSignIn(jwt: String): PatientSignInResult!
  }
`;

const getPatients = () => [];

const patientSignIn: Resolver<any, { jwt: string }> = async (parent, args, { firebase }) => {
  const idToken = await firebase.auth().verifyIdToken(args.jwt);
  const uid = idToken.uid;
  const firebaseUser = await firebase.auth().getUser(uid);
  const existingPatient = await Patient.findOne({
    where: { firebaseId: uid, mobileNumber: firebaseUser.phoneNumber! },
  });
  const patient =
    existingPatient ||
    (await Patient.create({
      firebaseId: uid,
      firstName: '',
      lastName: '',
      sex: Sex.NOT_KNOWN,
      mobileNumber: firebaseUser.phoneNumber!,
    })).save();
  return { patients: [patient] };
};

export const patientResolvers = {
  Query: {
    getPatients,
  },
  Mutation: {
    patientSignIn,
  },
};
