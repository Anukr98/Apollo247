import ApolloClient from 'apollo-client';
import { GET_HELP_SECTION_QUERIES } from '../../graphql/profiles';
import {
  GetHelpSectionQueries,
  GetHelpSectionQueries_getHelpSectionQueries_needHelpQueries,
} from '../../graphql/types/GetHelpSectionQueries';

export type HelpSectionQuery = GetHelpSectionQueries_getHelpSectionQueries_needHelpQueries;

export const getHelpSectionQueries = async (apolloClient: ApolloClient<object>) => {
  const { data } = await apolloClient.query<GetHelpSectionQueries>({
    query: GET_HELP_SECTION_QUERIES,
    variables: {},
    fetchPolicy: 'no-cache',
  });
  return data?.getHelpSectionQueries?.needHelpQueries as HelpSectionQuery[];
};

