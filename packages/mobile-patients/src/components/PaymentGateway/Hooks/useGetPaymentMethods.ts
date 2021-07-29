import { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { GET_PAYMENT_METHODS } from '@aph/mobile-patients/src/graphql/profiles';
import {
  getPaymentMethods,
  getPaymentMethodsVariables,
} from '@aph/mobile-patients/src/graphql/types/getPaymentMethods';
import { VERTICALS } from '@aph/mobile-patients/src/graphql/types/globalTypes';

export const useGetPaymentMethods = (businessLine: VERTICALS) => {
  const client = useApolloClient();
  const [paymentMethods, setPaymentMethods] = useState<any>([]);
  const [cardTypes, setCardTypes] = useState<any>([]);
  const [fetching, setFetching] = useState<boolean>(true);

  const fetchPaymentOptions = () => {
    return client.query<getPaymentMethods, getPaymentMethodsVariables>({
      query: GET_PAYMENT_METHODS,
      variables: { is_mobile: true, vertical: businessLine },
      fetchPolicy: 'no-cache',
    });
  };

  const initiate = async () => {
    try {
      const response = await fetchPaymentOptions();
      const { data } = response;
      const { getPaymentMethods } = data;
      setPaymentMethods(getPaymentMethods);
      const types = getPaymentMethods?.find((item: any) => item?.name == 'CARD');
      setCardTypes(types?.payment_methods);
      setFetching(false);
    } catch (error) {
      setFetching(false);
    }
  };

  useEffect(() => {
    initiate();
  }, []);

  return { paymentMethods, cardTypes, fetching };
};
