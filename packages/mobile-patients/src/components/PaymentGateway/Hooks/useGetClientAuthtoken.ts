import { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { GET_JUSPAY_CLIENTAUTH_TOKEN } from '@aph/mobile-patients/src/graphql/profiles';

export const useGetClientAuthToken = (customer_id: string, businessLine: string) => {
  const [clientAuthToken, setClientAuthToken] = useState<any>(undefined);
  const client = useApolloClient();

  const getJuspayClientToken = () => {
    return client.query({
      query: GET_JUSPAY_CLIENTAUTH_TOKEN,
      variables: {
        customer_id: customer_id,
        is_pharma_juspay: businessLine == 'pharma' ? true : false,
        get_client_auth_token: true,
      },
      fetchPolicy: 'no-cache',
    });
  };

  const initiate = async () => {
    try {
      const response = await getJuspayClientToken();
      const { data } = response;
      setClientAuthToken(data?.getCustomer?.juspay?.client_auth_token);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    initiate();
  }, []);

  return { clientAuthToken };
};
