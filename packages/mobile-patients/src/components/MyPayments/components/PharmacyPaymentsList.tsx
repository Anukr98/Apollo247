/**
 * @author vishnu-apollo247
 * @email vishnu.r@apollo247.org
 */

import React, { FC } from 'react';
import { useGetPayments } from '@aph/mobile-patients/src/hooks/useGetPayments';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import PaymentsList from './PaymentsList';

interface PharmacyPaymentsListProps {
  patientId: string;
  navigationProps: any;
}
const PharmacyPaymentsList: FC<PharmacyPaymentsListProps> = (props) => {
  const { patientId } = props;
  const payments = useGetPayments('pharmacy', patientId);

  if (!payments) {
    return <Spinner />;
  }
  return (
    <PaymentsList payments={payments} type="pharmacy" navigationProps={props.navigationProps} />
  );
};
export default PharmacyPaymentsList;
