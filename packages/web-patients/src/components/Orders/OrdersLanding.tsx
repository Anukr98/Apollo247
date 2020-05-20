import { makeStyles } from '@material-ui/styles';
import { Theme, Tabs, Tab, Typography } from '@material-ui/core';
import React, { useState } from 'react';
import { Header } from 'components/Header';
import { YourOrders } from 'components/Orders/YourOrders';
import { NavigationBottom } from 'components/NavigationBottom';
import { BottomLinks } from 'components/BottomLinks';

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
      backgroundColor: '#f7f8f5',
      [theme.breakpoints.down('xs')]: {
        backgroundColor: 'transparent',
      },
    },
    footerLinks: {
      [theme.breakpoints.down(900)]: {
        display: 'none',
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
      <div className={classes.footerLinks}>
        <BottomLinks />
      </div>
      <NavigationBottom />
    </div>
  );
};
