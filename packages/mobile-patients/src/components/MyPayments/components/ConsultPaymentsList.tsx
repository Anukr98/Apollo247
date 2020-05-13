/**
 * @author vishnu-apollo247
 * @email vishnu.r@apollo247.org
 */

import React, { FC } from 'react';
import { useGetPayments } from '@aph/mobile-patients/src/hooks/useGetPayments';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import PaymentsList from './PaymentsList';

interface ConsultPaymentsListProps {
  patientId: string;
}
const ConsultPaymentsList: FC<ConsultPaymentsListProps> = (props) => {
  const { patientId } = props;
  const payments = useGetPayments('consult', patientId);

  if (!payments) {
    return <Spinner />;
  }
  return <PaymentsList payments={payments} type="consult" />;
};
export default ConsultPaymentsList;
