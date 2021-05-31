import { PHARMA_ORDER_MESSAGE } from '@aph/mobile-patients/src/graphql/profiles';
import {
  pharmaOrderMessage,
  pharmaOrderMessageVariables,
} from '@aph/mobile-patients/src/graphql/types/pharmaOrderMessage';
import ApolloClient from 'apollo-client';

export const getPharmaOrderMessage = async (
  apolloClient: ApolloClient<object>,
  variables: pharmaOrderMessageVariables
) => {
  const { data } = await apolloClient.query<pharmaOrderMessage, pharmaOrderMessageVariables>({
    query: PHARMA_ORDER_MESSAGE,
    variables,
    fetchPolicy: 'no-cache',
  });
  return data?.pharmaOrderMessage;
};
