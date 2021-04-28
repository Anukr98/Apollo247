/**
 *
 * @summary Simple utility to log GQL request & response objects
 * In order to use  .concat(loggingLink) to concat with regular link of apolloClient
 * @see loginCalls.ts
 * @author Gufran Khurshid <gufran.k@apollo247.com>
 *
 * Created at     : 2021-04-01 17:21:56
 * Last modified  : 2021-04-01 17:31:40
 */

import { ApolloLink } from 'apollo-link';

const loggingLink = new ApolloLink((operation, forward) => {
  //console.info('check  request >> ', operation.getContext());
  return forward(operation).map((result) => {
    // console.info('check request forward >> ', operation.getContext());
    return result;
  });
});

export default loggingLink;
