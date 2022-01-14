import { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { GET_ONEAPOLLO_USER } from '@aph/mobile-patients/src/graphql/profiles';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import {
  getOneApolloUser,
  getOneApolloUserVariables,
} from '@aph/mobile-patients/src/graphql/types/getOneApolloUser';
import { persistHealthCredits } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { ELIGIBLE_HC_VERTICALS } from '@aph/mobile-patients/src/strings/AppConfig';

export const useFetchHealthCredits = (
  businessLine: 'consult' | 'diagnostics' | 'pharma' | 'subscription' | 'vaccination'
) => {
  const client = useApolloClient();
  const { currentPatient } = useAllCurrentPatients();
  const [healthCredits, setHealthCredits] = useState<number>(0);

  const fetchHealthCredits = () => {
    return client.query<getOneApolloUser, getOneApolloUserVariables>({
      query: GET_ONEAPOLLO_USER,
      variables: { patientId: currentPatient?.id },
      fetchPolicy: 'no-cache',
    });
  };

  const initiate = async () => {
    try {
      const response = await fetchHealthCredits();
      if (response.data.getOneApolloUser) {
        setHealthCredits(response.data.getOneApolloUser.availableHC);
        persistHealthCredits(response.data.getOneApolloUser.availableHC);
      }
    } catch (error) {}
  };

  useEffect(() => {
   businessLine!="diagnostics" && initiate();
  }, []);

  return { healthCredits };
};
