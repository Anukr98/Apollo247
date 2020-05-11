/**
 * @author vishnu-apollo247
 * @email vishnu.r@apollo247.org
 */

import React, { FC } from 'react';
import { useGetPayments } from '@aph/mobile-patients/src/hooks/useGetPayments';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import PaymentsList from './PaymentsList';

const ConsultPaymentsList: FC = () => {
  const payments = useGetPayments('consult');

  if (!payments) {
    return <Spinner />;
  }
  return <PaymentsList payments={payments} />;
};
export default ConsultPaymentsList;
