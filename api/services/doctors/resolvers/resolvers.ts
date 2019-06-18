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
    name: String
    birthDate: String
  }

  extend type Query {
    doctors: [Doctor!]
  }
`;

const doctors: Resolver = (parent, args, { models }) => models.Doctor.findAll();

export const resolvers = {
  Query: {
    doctors,
  },
};
