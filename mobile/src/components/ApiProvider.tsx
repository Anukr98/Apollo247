import React from 'react';
import { ApolloProvider } from 'react-apollo';
import { ApolloProvider as ApolloHooksProvider } from 'react-apollo-hooks';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { createHttpLink } from 'apollo-link-http';
import { apiRoutes } from 'app/src/helpers/apiRoutes';

const apolloClient = new ApolloClient({
  link: createHttpLink({ uri: apiRoutes.graphql() }),
  cache: new InMemoryCache(),
});

export interface ApiProviderProps {}

export const ApiProvider: React.FC<ApiProviderProps> = (props) => {
  return (
    <ApolloProvider client={apolloClient}>
      <ApolloHooksProvider client={apolloClient}>{props.children}</ApolloHooksProvider>
    </ApolloProvider>
  );
};
