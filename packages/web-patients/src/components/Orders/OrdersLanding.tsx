import { makeStyles } from '@material-ui/styles';
import { Theme, Tabs, Tab, Typography } from '@material-ui/core';
import React, { useState } from 'react';
import { Header } from 'components/Header';
import { YourOrders } from 'components/Orders/YourOrders';
import { ManageProfile } from 'components/ManageProfile';
import { Relation } from 'graphql/types/globalTypes';
import { useAllCurrentPatients } from 'hooks/authHooks';

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
  const classes = useStyles();
  const {allCurrentPatients} = useAllCurrentPatients()
  const onePrimaryUser = 
    allCurrentPatients && allCurrentPatients.filter((x) => x.relation === Relation.ME).length === 1;
  return (
    <div className={classes.root}>
      <Header />
      <div className={classes.container}>
        <div className={classes.orderListingPage}>
          <YourOrders />
          {!onePrimaryUser && <ManageProfile />}
        </div>
      </div>
    </div>
  );
};
