import { ApolloServer, gql } from 'apollo-server';
import { buildFederatedSchema } from '@apollo/federation';

const doctors = [
  {
    id: 1,
    name: 'Ada Lovelace',
    birthDate: '1815-12-10',
  },
  {
    id: 2,
    name: 'Alan Turing',
    birthDate: '1912-06-23',
  },
];

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

const resolvers = {
  Query: {
    doctors: () => doctors,
  },
};

const server = new ApolloServer({
  schema: buildFederatedSchema([
    {
      typeDefs,
      resolvers,
    },
  ]),
});

server.listen({ port: 4001 }).then(({ url }) => {
  console.log(`🚀 doctors microservice ready at ${url}`);
});
