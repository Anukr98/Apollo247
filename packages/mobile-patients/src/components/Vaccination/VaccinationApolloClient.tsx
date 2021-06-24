import { InMemoryCache, NormalizedCacheObject } from 'apollo-cache-inmemory';
import { setContext } from 'apollo-link-context';
import { onError } from 'apollo-link-error';
import { ApolloClient, ApolloQueryResult } from 'apollo-client';
import { useApolloClient } from 'react-apollo-hooks';
import { createHttpLink } from 'apollo-link-http';
import { AppConfig, AppEnv } from '@aph/mobile-patients/src/strings/AppConfig';
import AsyncStorage from '@react-native-community/async-storage';
import firebaseAuth from '@react-native-firebase/auth';

export const vaccinationApiBaseUrl =
  AppConfig.APP_ENV == AppEnv.PROD
    ? 'https://vaccination.apollo247.com/'
    : 'https://vaccineqa1.apollo247.com/';

export const vaccinationADMINBaseUrl =
  AppConfig.APP_ENV == AppEnv.PROD
    ? 'https://vaccination-admin.apollo247.com/'
    : 'https://vaccination-qa1-admin.apollo247.com/';

export const vaccineBookingPDFBaseUrl =
  AppConfig.APP_ENV == AppEnv.PROD
    ? 'https://www.apollo247.com/vaccine-booking/'
    : 'https://qathreepatients.apollo247.com/vaccine-booking/';

export const vaccinationApiRoutes = {
  graphql: () => `${vaccinationApiBaseUrl}/graphql`,
};

export const buildVaccineApolloClient = (authToken: string) => {
  const errorLink = onError((error) => {
    const { graphQLErrors, operation, forward } = error;
    if (graphQLErrors) {
      const unauthenticatedError = graphQLErrors.some(
        (gqlError) => gqlError.extensions && gqlError.extensions.code === 'UNAUTHENTICATED'
      );
      // if (unauthenticatedError) {
      //   authToken = getFirebaseToken();
      // }
    }
  });

  const authLink = setContext(async (_, { headers }) => ({
    headers: {
      ...headers,
      Authorization: !authToken.length ? 'Bearer 3d1833da7020e0602165529446587434' : authToken,
    },
  }));
  const httpLink = createHttpLink({
    uri: vaccinationApiRoutes.graphql(),
  });

  const link = errorLink
    //.concat(loggingLink)  //Uncomment this inroder to enable logging
    .concat(authLink)
    .concat(httpLink);
  //const cache = apolloVaccineClient ? apolloVaccineClient.cache : new InMemoryCache();
  const cache = new InMemoryCache();
  return new ApolloClient({
    link,
    cache,
  });
};
