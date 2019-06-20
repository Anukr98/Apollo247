import { models } from 'services/doctors/models/models';
import gql from 'graphql-tag';

type Resolver<Parent = any, Args = any, Context = { models: typeof models }> = (
  parent: Parent,
  args: Args,
  context: Context
) => any;

export const typeDefs = gql`
  type Doctor @key(fields: "id") {
    id: Int!
    firstName: String
    lastName: String
    email: String
  }

  extend type Query {
    doctors: [Doctor!]
  }

  extend type Mutation {
    createDoctor(firstName: String, lastName: String, email: String): Doctor!
  }
`;

const doctors: Resolver = (parent, args, { models }) => models.Doctor.findAll();
const createDoctor: Resolver<any, { firstName: string; lastName: string; email: string }> = (
  parent,
  args,
  { models }
) => models.Doctor.create({ ...args });

export const resolvers = {
  Query: {
    doctors,
  },
  Mutation: {
    createDoctor,
  },
};
