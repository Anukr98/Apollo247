import { ApolloServer } from 'apollo-server';
import { ApolloGateway } from '@apollo/gateway';
import { GraphQLExecutor } from 'apollo-server-core';

const gateway = new ApolloGateway({
  serviceList: [{ name: 'doctors', url: 'http://api:4001/graphql' }],
});

(async () => {
  const config = await gateway.load();
  const schema = config.schema;
  const executor = config.executor as GraphQLExecutor;
  const server = new ApolloServer({ schema, executor });
  server.listen(process.env.API_PORT).then(({ url }) => {
    console.log(`🚀 api gateway ready at ${url}`);
  });
})();
