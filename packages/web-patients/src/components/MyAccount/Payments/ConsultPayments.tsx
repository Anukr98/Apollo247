import React, { useState } from 'react';
import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { PaymentCard } from 'components/MyAccount/Payments/PaymentCard';
import { GET_CONSULT_PAYMENTS } from 'graphql/consult';
import { ConsultOrders, ConsultOrdersVariables } from 'graphql/types/ConsultOrders';
import { useQueryWithSkip } from 'hooks/apolloHooks';
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

  return data && data.consultOrders && data.consultOrders.appointments ? (
    <div className={classes.root}>
      {data.consultOrders.appointments.map((appointmentDetails) => (
        <PaymentCard cardDetails={appointmentDetails} />
      ))}
    </div>
  ) : (
    <></>
  );
};
