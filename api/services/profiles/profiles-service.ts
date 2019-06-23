import { ApolloServer } from 'apollo-server';
import { buildFederatedSchema } from '@apollo/federation';
import { models } from 'services/profiles/models/models';
import { resolvers, typeDefs } from 'services/profiles/resolvers/resolvers';

const server = new ApolloServer({
  context: () => ({ models }),
  schema: buildFederatedSchema([
    {
      typeDefs,
      resolvers,
    },
  ]),
});

server.listen({ port: 80 }).then(({ url }) => {
  console.log(`🚀 profiles-service ready at ${url}`);
});
