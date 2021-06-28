import { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { FETCH_SAVED_CARDS } from '@aph/mobile-patients/src/graphql/profiles';

export const useFetchSavedCards = (CusId: string) => {
  const client = useApolloClient();
  const [savedCards, setSavedCards] = useState<any>([]);

  const fetchCards = () => {
    return client.query({
      query: FETCH_SAVED_CARDS,
      variables: { customer_id: CusId },
      fetchPolicy: 'no-cache',
    });
  };

  const initiate = async () => {
    try {
      const res = await fetchCards();
      const { data } = res;
      setSavedCards(data?.getSavedCardList?.cards);
    } catch (error) {}
  };

  useEffect(() => {
    initiate();
  }, []);

  return { savedCards };
};
