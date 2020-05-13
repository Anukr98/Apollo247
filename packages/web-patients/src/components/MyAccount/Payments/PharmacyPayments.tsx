import React from 'react';
import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { PaymentCard } from 'components/MyAccount/Payments/PaymentCard';

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
  };
});


export const PharmacyPayments: React.FC = (props) => {
  const classes = useStyles({});

  return (
    <div className={classes.root}>
      <PaymentCard />
    </div>
  );
};
