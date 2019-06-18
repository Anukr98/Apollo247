import { ApolloServer } from 'apollo-server';
import { buildFederatedSchema } from '@apollo/federation';
import { models } from 'services/doctors/models/models';
import { resolvers, typeDefs } from 'services/doctors/resolvers/resolvers';

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
  console.log(`🚀 doctors service ready at ${url}`);
});
