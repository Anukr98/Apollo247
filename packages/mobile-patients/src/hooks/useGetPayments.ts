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
interface meta {
  total: number;
  pageSize: number;
  pageNo: number;
}
export const useGetPayments = (
  pageNo: number,
  pageSize: number,
  type?: string,
  patientId?: string,
  navigationProps?: any
) => {
  const [payments, setPayments] = useState();
  const [loading, setLoading] = useState(true);
  const [meta, setmeta] = useState<meta>();
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
          pageNo: pageNo,
          pageSize: pageSize,
        },
        fetchPolicy: 'no-cache',
      })
      .then((res) => {
        const { data } = res;
        const { consultOrders } = data;
        const { appointments } = consultOrders;
        const { meta } = consultOrders;
        const freshAppointments = appointments?.filter((item) => item.appointmentType === 'ONLINE');
        setPayments(freshAppointments);

        setmeta(meta);
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
          pageNo: pageNo,
          pageSize: pageSize,
        },
        fetchPolicy: 'no-cache',
      })
      .then((res) => {
        const { data } = res;
        const { pharmacyOrders } = data;
        const { pharmaOrders } = pharmacyOrders;
        const { meta } = pharmacyOrders;
        setPayments(pharmaOrders);
        setmeta(meta);
        setLoading(false);
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
      return;
    }
    if (type === 'pharmacy') {
      getPharmacyPaymentsAPI();
    }
  };

  useEffect(() => {
    setPaymentsFromAPI();
  }, []);

  return { payments, loading, meta };
};
