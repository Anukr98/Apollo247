import { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { getDiagnosticRefundOrders } from '@aph/mobile-patients/src/helpers/clientCalls';

export const useGetDiagOrderInfo = (paymentId: string, modifiedOrder: any) => {
  const client = useApolloClient();
  const [fetching, setFetching] = useState<boolean>(true);
  const [orderInfo, setOrderInfo] = useState<any>();
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>();
  const [PaymentMethod, setPaymentMethod] = useState<any>();
  const [offerAmount, setOfferAmount] = useState<number>(0);
  const [isSingleUhid, setIsSingleUhid] = useState<boolean>(false);

  const initiate = async () => {
    try {
      let res: any = await getDiagnosticRefundOrders(client, paymentId);
      console.log({ res });
      const info = res?.data?.data?.getOrderInternal?.DiagnosticsPaymentDetails;
      const getOffersResponse = res?.data?.data?.getOrderInternal?.offers;
      setOrderInfo(info);
      setSubscriptionInfo(res?.data?.data?.getOrderInternal?.SubscriptionOrderDetails);
      setPaymentMethod(res?.data?.getOrderInternal?.payment_method_type);
      if (!!getOffersResponse) {
        const getOffersAmount = getOffersResponse?.[0]?.benefits;
        const totalOfferAmount = getOffersAmount?.reduce(
          (prev: any, curr: any) => prev + curr?.amount,
          0
        );
        !!totalOfferAmount && setOfferAmount(totalOfferAmount);
      }
      setIsSingleUhid(info?.ordersList?.length == 1);
      setFetching(false);
    } catch (error) {}
  };

  useEffect(() => {
    initiate();
  }, []);

  return { orderInfo, fetching, PaymentMethod, subscriptionInfo, isSingleUhid, offerAmount };
};
