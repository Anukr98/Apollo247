import React from 'react';
import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { PaymentCardPharmacy } from 'components/MyAccount/Payments/PaymentCardPharmacy';
import { PharmacyOrders, PharmacyOrdersVariables } from 'graphql/types/PharmacyOrders';
import { useQueryWithSkip } from 'hooks/apolloHooks';
import { useAllCurrentPatients } from 'hooks/authHooks';
import CircularProgress from '@material-ui/core/CircularProgress';
import { GET_PHARMACY_PAYMENTS } from 'graphql/medicines';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      padding: 20,
      '& >div': {
        '&:last-child': {
          marginBottom: 0,
        },
      },
    },
    circlularProgress: {
      display: 'flex',
      padding: 20,
      justifyContent: 'center',
    },
  };
});

export const PharmacyPayments: React.FC = (props) => {
  const classes = useStyles({});
  const { currentPatient } = useAllCurrentPatients();
  const { data, loading, error } = useQueryWithSkip<PharmacyOrders, PharmacyOrdersVariables>(
    GET_PHARMACY_PAYMENTS,
    {
      variables: { patientId: currentPatient && currentPatient.id },
    }
  );

  if (loading)
    return (
      <div className={classes.circlularProgress}>
        <CircularProgress />
      </div>
    );

  if (error) return <div className={classes.circlularProgress}>No data is available</div>;

  return (
    <div className={classes.root}>
      {data.pharmacyOrders.pharmaOrders.map((orderDetails) => {
        return <PaymentCardPharmacy cardDetails={orderDetails} key={orderDetails.orderAutoId} />;
      })}
    </div>
  );
};
