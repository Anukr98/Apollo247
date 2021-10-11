import { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { GET_OFFERS_LIST } from '@aph/mobile-patients/src/graphql/profiles';

export const useGetOffers = (paymentOrderId: string, businessLine: string) => {
  const client = useApolloClient();
  const [offers, setOffers] = useState<any>([]);

  const fetchOffers = () => {
    const variables = {
      listOffersInput: {
        order: {
          order_id: paymentOrderId,
        },
      },
      is_juspay_pharma: businessLine == 'pharma' ? true : false,
    };
    return client.query({
      query: GET_OFFERS_LIST,
      variables: variables,
      fetchPolicy: 'no-cache',
    });
  };

  const initiate = async () => {
    try {
      const response = await fetchOffers();
      const { data } = response;
      const { getOffersList } = data;
      const { offers } = getOffersList;
      setOffers(offers);
    } catch (error) {}
  };

  useEffect(() => {
    initiate();
  }, []);

  return { offers };
};
