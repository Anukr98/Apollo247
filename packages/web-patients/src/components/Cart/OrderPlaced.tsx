import { makeStyles } from '@material-ui/styles';
import { Theme, Typography } from '@material-ui/core';
import React from 'react';
import { AphButton } from '@aph/web-ui-components';
import { AphCheckbox } from 'components/AphCheckbox';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      '& p': {
        fontSize: 17,
        fontWeight: 500,
        lineHeight: 1.41,
        color: theme.palette.secondary.main,
        marginTop: 20,
      },
    },
    windowBody: {
      padding: 20,
      paddingTop: 0,
      paddingBottom: 0,
    },
    orderPlaced: {
      borderRadius: 10,
      backgroundColor: '#f7f8f5',
      padding: 16,
      marginBottom: 20,
    },
    bottomActions: {
      paddingTop: 15,
      borderTop: '0.5px solid rgba(2,71,91,0.3)',
      display: 'flex',
      '& button': {
        backgroundColor: 'transparent',
        boxShadow: 'none',
        fontWeight: 'bold',
        color: '#fc9916',
        padding: 0,
        '&:hover': {
          backgroundColor: 'transparent',
        },
      },
    },
    trackBtn: {
      marginLeft: 'auto',
    },
    orderHeader: {
      display: 'flex',
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      paddingBottom: 8,
      alignItems: 'center',
    },
    medicineName: {
      fontSize: 17,
      fontWeight: 500,
      color: '#01475b',
      display: 'flex',
      alignItems: 'center',
    },
    medicineIcon: {
      paddingRight: 16,
      '& img': {
        verticalAlign: 'middle',
      },
    },
    invoiceNo: {
      fontSize: 14,
      fontWeight: 500,
      color: '#01475b',
      marginLeft: 'auto',
    },
    orderBody: {
      fontSize: 12,
      opacity: 0.6,
      fontWeight: 500,
      color: '#02475b',
      paddingBottom: 10,
      paddingTop: 5,
    },
    remindMe: {
      display: 'flex',
      alignItems: 'center',
      fontSize: 14,
      fontWeight: 500,
      color: '#02475b',
      paddingBottom: 10,
      paddingTop: 5,
      '& span:last-child': {
        marginLeft: 'auto',
      },
    },
  };
});

interface OrderPlacedProps {
  orderId: string;
}

export const OrderPlaced: React.FC<OrderPlacedProps> = (props) => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <div className={classes.windowBody}>
        <Typography variant="h2">yay!</Typography>
        <p>Your orders have been placed successfully</p>
        <div className={classes.orderPlaced}>
          <div className={classes.orderHeader}>
            <div className={classes.medicineName}>
              <span className={classes.medicineIcon}>
                <img src={require('images/ic_tablets.svg')} alt="" />
              </span>
              <span>Medicines</span>
            </div>
            <div className={classes.invoiceNo}>#A2472707936</div>
          </div>
          <div className={classes.orderBody}>Delivery By: 27 July 2019</div>
          <div className={classes.remindMe}>
            <span>Remind me to take medicines</span>
            <span>
              <AphCheckbox />
            </span>
          </div>
          <div className={classes.bottomActions}>
            <AphButton>View Invoice</AphButton>
            <AphButton className={classes.trackBtn}>Track Order</AphButton>
          </div>
        </div>
      </div>
    </div>
  );
};
