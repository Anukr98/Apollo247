import { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { GET_PAYMENT_METHODS } from '@aph/mobile-patients/src/graphql/profiles';
import {
  getPaymentMethodsV2,
  getPaymentMethodsV2Variables,
} from '@aph/mobile-patients/src/graphql/types/getPaymentMethodsV2';

export const useGetPaymentMethods = (paymentOrderId: string, amount: number) => {
  const client = useApolloClient();
  const [paymentMethods, setPaymentMethods] = useState<any>([]);
  const [cardTypes, setCardTypes] = useState<any>([]);
  const [fetching, setFetching] = useState<boolean>(true);

  const fetchPaymentOptions = () => {
    return client.query({
      query: GET_PAYMENT_METHODS,
      variables: { is_mobile: true, payment_order_id: paymentOrderId, prepaid_amount: amount },
      fetchPolicy: 'no-cache',
    });
  };

  const initiate = async () => {
    try {
      const response = await fetchPaymentOptions();
      const { data } = response;
      const { getPaymentMethodsV3 } = data;
      setPaymentMethods(getPaymentMethodsV3);
      const types = getPaymentMethodsV3?.find((item: any) => item?.name == 'CARD');
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
