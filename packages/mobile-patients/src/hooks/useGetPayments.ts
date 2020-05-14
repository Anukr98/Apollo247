import { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  CONSULT_ORDER_PAYMENT_DETAILS,
  PHARMACY_ORDER_PAYMENT_DETAILS,
} from '@aph/mobile-patients/src/graphql/profiles';

export const useGetPayments = (type?: string, patientId?: string) => {
  const [payments, setPayments] = useState();
  const client = useApolloClient();

  const getConsultPaymentsAPI = () => {
    client
      .query({
        query: CONSULT_ORDER_PAYMENT_DETAILS,
        variables: {
          patientId: patientId,
        },
        fetchPolicy: 'no-cache',
      })
      .then((res) => {
        const { data } = res;
        const { consultOrders } = data;
        const { appointments } = consultOrders;
        console.log('payments-->', appointments.length);
        setPayments(appointments);
        // setPayments(appointments.reverse());
        // setLoading(false);
      })
      .catch((error) => {
        // CommonBugFender('fetchingTxnStutus', error);
        console.log('payments error-->', error);
        // props.navigation.navigate(AppRoutes.DoctorSearch);
        // renderErrorPopup(`Something went wrong, plaease try again after sometime`);
      });
  };

  const getPharmacyPaymentsAPI = () => {
    client
      .query({
        query: PHARMACY_ORDER_PAYMENT_DETAILS,
        variables: {
          patientId: patientId,
        },
        fetchPolicy: 'no-cache',
      })
      .then((res) => {
        console.log('payments-->', res);
        // setLoading(false);
      })
      .catch((error) => {
        // CommonBugFender('fetchingTxnStutus', error);
        console.log('payments error-->', error);
        // props.navigation.navigate(AppRoutes.DoctorSearch);
        // renderErrorPopup(`Something went wrong, plaease try again after sometime`);
      });
  };

  const setPaymentsFromAPI = () => {
    if (type === 'consult') {
      //TODO: consult gql
      getConsultPaymentsAPI();
      const paymentsResponse: any = [];
      // setPayments(require('../components/MyPayments/fixtures.json'));
      return;
    }
    const paymentsResponse: any = [];
    setPayments(paymentsResponse);
  };

  useEffect(() => {
    setPaymentsFromAPI();
  }, []);

  return payments;
};
