import { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { GET_APPOINTMENT_INFO } from '@aph/mobile-patients/src/graphql/profiles';
import {
  getAppointmentInfo,
  getAppointmentInfoVariables,
} from '@aph/mobile-patients/src/graphql/types/getAppointmentInfo';

export const useGetAppointmentInfo = (paymentId: string) => {
  const client = useApolloClient();
  const [fetching, setFetching] = useState<boolean>(true);
  const [orderInfo, setOrderInfo] = useState<any>();
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>();
  const [PaymentMethod, setPaymentMethod] = useState<any>();

  const fetchOrderInfo = () => {
    return client.query<getAppointmentInfo, getAppointmentInfoVariables>({
      query: GET_APPOINTMENT_INFO,
      variables: {
        order_id: paymentId,
      },
      fetchPolicy: 'no-cache',
    });
  };

  const initiate = async () => {
    try {
      const response = await fetchOrderInfo();
      const appmtDetails = response?.data?.getOrderInternal?.AppointmentDetails?.find(
        (item: any) => item
      );
      setOrderInfo(appmtDetails);
      setSubscriptionInfo(response?.data?.getOrderInternal?.SubscriptionOrderDetails);
      setPaymentMethod(response?.data?.getOrderInternal?.payment_method_type);
      setFetching(false);
    } catch (error) {}
  };

  useEffect(() => {
    initiate();
  }, []);

  return { orderInfo, fetching, PaymentMethod, subscriptionInfo };
};
