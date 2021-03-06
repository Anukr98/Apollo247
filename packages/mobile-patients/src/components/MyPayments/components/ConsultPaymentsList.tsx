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
  navigationProps: any;
  fromNotification?: boolean;
}
const ConsultPaymentsList: FC<ConsultPaymentsListProps> = (props) => {
  const { patientId, navigationProps, fromNotification } = props;
  const { payments, loading, meta } = useGetPayments(1, 8, 'consult', patientId, navigationProps);

  if (loading) {
    return <Spinner />;
  }

  return (
    <PaymentsList
      patientId={patientId}
      payments={payments}
      meta={meta}
      type="consult"
      navigationProps={navigationProps}
      fromNotification={fromNotification}
    />
  );
};
export default ConsultPaymentsList;
