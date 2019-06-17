import { ApolloServer } from 'apollo-server';
import { typeDefs, resolvers } from 'schema/schema';

// In the most basic sense, the ApolloServer can be started
// by passing type definitions (typeDefs) and the resolvers
// responsible for fetching the data for those types.
const server = new ApolloServer({ typeDefs, resolvers });

// Start the server already!
const port = process.env.API_PORT;
server.listen(port).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
