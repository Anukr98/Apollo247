import { ApolloServer } from 'apollo-server';
import gql from 'graphql-tag';

// This is a (sample) collection of books we'll be able to query
// the GraphQL server for.  A more complete example might fetch
// from an existing data source like a REST API or database.
const books = [
  {
    id: 1,
    title: 'Harry Potter and the Chamber of Secrets',
    author: 'J.K. Rowling',
  },
  {
    id: 2,
    title: 'Jurassic Park',
    author: 'Michael Crichton',
  },
];

// Type definitions define the "shape" of your data and specify
// which ways the data can be fetched from the GraphQL server.
// Read about how this schema works: https://graphql.org/learn/schema/
export const typeDefs = gql`
  # This "Book" type can be used in other type declarations.
  type Book {
    id: Int!
    title: String!
    authorName: String!
  }

  # The "Query" type is the root of all GraphQL queries.
  type Query {
    books: [Book!]
  }

  # The "Mutation" type is the root of all GraphQL mutations.
  # type Mutation {
  # }
`;

// Resolvers define the technique for fetching the types in the
// schema.  We'll retrieve books from the "books" array above.
export const resolvers = {
  Query: {
    books: () => books,
  },
  // Mutation: {
  //   updateBook: (root: any, args: { id: number; title: string }) => {
  //     const bookToUpdate = books.find((b) => b.id === args.id);
  //     if (!bookToUpdate) return null;
  //     bookToUpdate.title = args.title;
  //     return bookToUpdate;
  //   },
  // },
};

// In the most basic sense, the ApolloServer can be started
// by passing type definitions (typeDefs) and the resolvers
// responsible for fetching the data for those types.
const server = new ApolloServer({ typeDefs, resolvers });

// Start the server!
const port = process.env.API_PORT;
server.listen(port).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
