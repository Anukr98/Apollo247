import { makeStyles } from '@material-ui/styles';
import { Theme, Tabs, Tab, Typography } from '@material-ui/core';
import React, { useState } from 'react';
import { Header } from 'components/Header';
import { YourOrders } from 'components/Orders/YourOrders';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: '100%',
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    orderListingPage: {
      borderRadius: '0 0 10px 10px',
      backgroundColor: '#f0f1ec',
      [theme.breakpoints.down('xs')]: {
        backgroundColor: 'transparent',
        paddingBottom: 20,
      },
    },
  };
});

export const OrdersLanding: React.FC = (props) => {
  const classes = useStyles({});
  return (
    <div className={classes.root}>
      <Header />
      <div className={classes.container}>
        <div className={classes.orderListingPage}>
          <YourOrders />
        </div>
      </div>
    </div>
  );
};
