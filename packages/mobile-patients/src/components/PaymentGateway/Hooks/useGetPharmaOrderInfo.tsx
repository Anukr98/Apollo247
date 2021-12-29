import { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { GET_PHARMA_TRANSACTION_STATUS_V2 } from '@aph/mobile-patients/src/graphql/profiles';

export const useGetPharmaOrderInfo = (paymentId: string) => {
  const client = useApolloClient();
  const [fetching, setFetching] = useState<boolean>(true);
  const [orderInfo, setOrderInfo] = useState<any>();

  const fetchOrderInfo = () => {
    return client.query({
      query: GET_PHARMA_TRANSACTION_STATUS_V2,
      variables: { paymentOrderId: paymentId },
      fetchPolicy: 'no-cache',
    });
  };

  const initiate = async () => {
    try {
      const res = await fetchOrderInfo();
      const { data } = res;
      setOrderInfo(data?.pharmaPaymentStatusV2);
      setFetching(false);
    } catch (error) {}
  };

  useEffect(() => {
    initiate();
  }, []);

  return { orderInfo, fetching };
};
