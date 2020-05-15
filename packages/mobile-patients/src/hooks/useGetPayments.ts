/**
 * @author vishnu-apollo247
 * @email vishnu.r@apollo247.org
 */

import { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  CONSULT_ORDER_PAYMENT_DETAILS,
  PHARMACY_ORDER_PAYMENT_DETAILS,
} from '@aph/mobile-patients/src/graphql/profiles';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';

export const useGetPayments = (type?: string, patientId?: string, navigationProps?: any) => {
  const [payments, setPayments] = useState();
  const [loading, setLoading] = useState(true);
  const client = useApolloClient();
  const { showAphAlert } = useUIElements();

  const renderErrorPopup = (desc: string) =>
    showAphAlert!({
      title: 'Uh oh.. :(',
      description: `${desc || ''}`.trim(),
    });

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
        setPayments(appointments.reverse());
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        navigationProps.navigate(AppRoutes.MyAccount);
        renderErrorPopup(`Something went wrong, please try again after sometime`);
        CommonBugFender('fetchingConsultPayments', error);
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
        const { data } = res;
        const { getMedicineOrdersList } = data;
        const { MedicineOrdersList } = getMedicineOrdersList;
        setPayments(MedicineOrdersList.reverse());
        setLoading(false);
        console.log('payments-->', res);
      })
      .catch((error) => {
        setLoading(false);
        navigationProps.navigate(AppRoutes.MyAccount);
        renderErrorPopup(`Something went wrong, please try again after sometime`);
        CommonBugFender('fetchingPharmacyPayments', error);
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
    // const paymentsResponse: any = [];
    // setPayments(paymentsResponse);
    if (type === 'pharmacy') {
      getPharmacyPaymentsAPI();
    }
  };

  useEffect(() => {
    setPaymentsFromAPI();
  }, []);

  return { payments, loading };
};
