import { ApolloServer } from 'apollo-server';
import { ApolloGateway } from '@apollo/gateway';
import { GraphQLExecutor } from 'apollo-server-core';

const gateway = new ApolloGateway({
  serviceList: [{ name: 'profiles', url: 'http://profiles-service/graphql' }],
});

const env = process.env.NODE_ENV as 'local' | 'development';
const port = process.env.WEB_CLIENT_PORT === '80' ? '' : `:${process.env.WEB_CLIENT_PORT}`;
const envToCorsOrigin = {
  local: `http://localhost${port}`,
  development: '*', // 'http://patients-web.aph.popcornapps.com'
  // staging: '',
  // production: ''
};

(async () => {
  const config = await gateway.load();
  const schema = config.schema;
  const executor = config.executor as GraphQLExecutor;
  const server = new ApolloServer({
    cors: { origin: envToCorsOrigin[env] },
    schema,
    executor,
  });
  server.listen(process.env.API_GATEWAY_PORT).then(({ url }) => {
    console.log(`🚀 api gateway ready at ${url}`);
  });
})();
