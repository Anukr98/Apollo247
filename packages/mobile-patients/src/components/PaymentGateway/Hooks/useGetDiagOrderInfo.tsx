import { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { GET_INTERNAL_ORDER } from '@aph/mobile-patients/src/graphql/profiles';
import {
  getOrderInternal,
  getOrderInternalVariables,
} from '@aph/mobile-patients/src/graphql/types/getOrderInternal';

export const useGetDiagOrderInfo = (paymentId: string) => {
  const client = useApolloClient();
  const [fetching, setFetching] = useState<boolean>(true);
  const [orderInfo, setOrderInfo] = useState<any>();
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>();
  const [PaymentMethod, setPaymentMethod] = useState<any>();

  const fetchOrderInfo = () => {
    return client.query<getOrderInternal, getOrderInternalVariables>({
      query: GET_INTERNAL_ORDER,
      variables: {
        order_id: paymentId,
      },
      fetchPolicy: 'no-cache',
    });
  };

  const initiate = async () => {
    try {
      const res = await fetchOrderInfo();
      const info = res?.data?.getOrderInternal?.DiagnosticsPaymentDetails;
      setOrderInfo(info);
      setSubscriptionInfo(res?.data?.getOrderInternal?.SubscriptionOrderDetails);
      setPaymentMethod(res?.data?.getOrderInternal?.payment_method_type);
      setFetching(false);
    } catch (error) {}
  };

  useEffect(() => {
    initiate();
  }, []);

  return { orderInfo, fetching, PaymentMethod, subscriptionInfo };
};
