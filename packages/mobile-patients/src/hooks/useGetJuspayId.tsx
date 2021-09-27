import { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { FETCH_JUSPAY_CUSTOMERID } from '@aph/mobile-patients/src/graphql/profiles';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';

export const useGetJuspayId = () => {
  const client = useApolloClient();
  const { currentPatient } = useAllCurrentPatients();
  const [cusId, setcusId] = useState<any>(currentPatient?.id);
  const [isfetchingId, setIsfetchingId] = useState<boolean>(true);
  const { validateAuthToken } = useAuth();

  const fetchJusPayId = () => {
    return client.query({
      query: FETCH_JUSPAY_CUSTOMERID,
      variables: {},
      fetchPolicy: 'no-cache',
    });
  };

  const initiate = async () => {
    try {
      const response = await fetchJusPayId();
      const { data } = response;
      setcusId(data?.generateUniqueCustomerId?.customer_id);
      setIsfetchingId(false);
    } catch (e) {
      setIsfetchingId(false);
    }
  };

  useEffect(() => {
    validateAuthToken?.();
    initiate();
  }, []);

  return { cusId, isfetchingId };
};
