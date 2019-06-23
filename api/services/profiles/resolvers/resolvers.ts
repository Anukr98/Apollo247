import { models } from 'services/profiles/models/models';
import gql from 'graphql-tag';

export type Resolver<Parent = any, Args = any, Context = { models: typeof models }> = (
  parent: Parent,
  args: Args,
  context: Context
) => any;

export const typeDefs = gql`
  enum Sex {
    NOT_KNOWN
    MALE
    FEMALE
    OTHER
    NOT_APPLICABLE
  }

  type Doctor @key(fields: "id") {
    id: Int!
    firstName: String
    lastName: String
    email: String
  }

  type Patient @key(fields: "id") {
    id: Int!
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

const patientSignIn: Resolver<any, { jwt: string }> = (parent, args, { models }) => {
  console.log('patientSignIn jwt is', args.jwt);
  return { patients: [] };
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
