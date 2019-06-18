import { ApolloServer, gql } from 'apollo-server';
import { buildFederatedSchema } from '@apollo/federation';
import { models } from 'services/doctors/models/models';

type Resolver<Parent = any, Args = any, Context = { models: typeof models }> = (
  parent: Parent,
  args: Args,
  context: Context
) => any;

const typeDefs = gql`
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

const resolvers = {
  Query: {
    doctors,
  },
};

const server = new ApolloServer({
  context: () => ({ models }),
  schema: buildFederatedSchema([
    {
      typeDefs,
      resolvers,
    },
  ]),
});

server.listen({ port: 4001 }).then(({ url }) => {
  console.log(`🚀 doctorsService ready at ${url}`);
});
