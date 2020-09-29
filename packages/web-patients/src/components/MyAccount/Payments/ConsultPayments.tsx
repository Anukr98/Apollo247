import React, { useState } from 'react';
import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { PaymentCard } from 'components/MyAccount/Payments/PaymentCard';
import { GET_CONSULT_PAYMENTS } from 'graphql/consult';
import { ConsultOrders, ConsultOrdersVariables } from 'graphql/types/ConsultOrders';
import { useQueryWithSkip } from 'hooks/apolloHooks';
import _sortBy from 'lodash/sortBy';
import { useAllCurrentPatients } from 'hooks/authHooks';
import CircularProgress from '@material-ui/core/CircularProgress';

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
    noData: {
      paddingTop: 30,
      paddingBottom: 30,
      textAlign: 'center',
      fontSize: 14,
      fontWeight: 500,
      color: '#02475b',
    },
    icon: {
      paddingBottom: 10,
      '& img': {
        maxWidth: 34,
        verticalAlign: 'middle',
      },
    },
  };
});

export const ConsultPayments: React.FC = (props) => {
  const classes = useStyles({});
  const { currentPatient } = useAllCurrentPatients();
  const { data, loading, error } = useQueryWithSkip<ConsultOrders, ConsultOrdersVariables>(
    GET_CONSULT_PAYMENTS,
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

  if (
    data &&
    data.consultOrders &&
    data.consultOrders.appointments &&
    data.consultOrders.appointments.length
  ) {
    const appointmentData = data.consultOrders.appointments;
    const sortByPaymentDateTime = _sortBy(appointmentData, function(item) {
      return item.status !== 'PAYMENT_PENDING' && item.appointmentPayments[0].paymentDateTime;
    });
    const dataReversed = [...sortByPaymentDateTime].reverse();
    return (
      <div className={classes.root}>
        {dataReversed.map((appointmentDetails) => (
          <PaymentCard cardDetails={appointmentDetails} key={appointmentDetails.id} />
        ))}
      </div>
    );
  }
  return (
    <div className={classes.root}>
      <div className={classes.noData}>
        <div className={classes.icon}>
          <img src={require('images/transaction_history.svg')} alt="" />
        </div>
        <div>You have no payment history!</div>
      </div>
    </div>
  );
};
