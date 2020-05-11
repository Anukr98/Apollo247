import { useEffect, useState } from 'react';

export const useGetPayments = (type?: string) => {
  const [payments, setPayments] = useState();

  const setPaymentsFromAPI = () => {
    if (type === 'consult') {
      //TODO: consult gql
      const paymentsResponse: any = [];
      setPayments(require('../components/MyPayments/fixtures.json'));
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
