import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import React from 'react';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { useShoppingCart } from 'components/MedicinesCartProvider';

const useStyles = makeStyles((theme: Theme) => {
  return {
    appNavigation: {
      marginLeft: 'auto',
      [theme.breakpoints.down('xs')]: {
        display: 'none',
      },
      '& a': {
        fontSize: 13,
        fontWeight: 600,
        color: theme.palette.secondary.dark,
        textTransform: 'uppercase',
        padding: '36px 20px 35px 20px',
        display: 'inline-block',
        [theme.breakpoints.down('sm')]: {
          paddingLeft: 10,
          paddingRight: 10,
        },
      },
    },
    menuItemActive: {
      backgroundColor: '#f7f8f5',
      position: 'relative',
      '&:after': {
        position: 'absolute',
        content: '""',
        bottom: 0,
        left: 0,
        height: 5,
        width: '100%',
        backgroundColor: '#00b38e',
      },
    },
    iconLink: {
      padding: '33px 20px 31px 20px !important',
      '& img': {
        verticalAlign: 'middle',
      },
      '& >span': {
        position: 'relative',
      },
    },
    itemCount: {
      width: 14,
      height: 14,
      borderRadius: '50%',
      backgroundColor: '#ff748e',
      position: 'absolute',
      right: -4,
      top: -7,
      fontSize: 9,
      fontWeight: 'bold',
      color: theme.palette.common.white,
      lineHeight: '14px',
      textAlign: 'center',
    },
  };
});

export const Navigation: React.FC = (props) => {
  const classes = useStyles({});
  const currentPath = window.location.pathname;
  const { cartItems } = useShoppingCart();

  return (
    <div className={classes.appNavigation} data-cypress="Navigation">
      <Link
        className={currentPath === clientRoutes.appointments() ? classes.menuItemActive : ''}
        to={clientRoutes.appointments()}
      >
        Appointments
      </Link>
      <Link
        to={clientRoutes.healthRecords()}
        className={currentPath === clientRoutes.healthRecords() ? classes.menuItemActive : ''}
      >
        Health Records
      </Link>
      <Link
        to={clientRoutes.medicines()}
        className={
          currentPath === clientRoutes.medicines() ||
          currentPath === clientRoutes.prescriptionsLanding()
            ? classes.menuItemActive
            : ''
        }
      >
        Medicines
      </Link>
      <Link
        to={clientRoutes.cartLanding()}
        className={`${classes.iconLink} ${
          currentPath === clientRoutes.cartLanding() ? classes.menuItemActive : ''
        }`}
      >
        <span>
          <img src={require('images/ic_cart.svg')} alt="Shopping Cart" />
          <span className={classes.itemCount}>{cartItems.length || 0}</span>
        </span>
      </Link>
      <Link to="/" className={`${classes.iconLink}`}>
        <img src={require('images/ic_notification.svg')} alt="" />
      </Link>
    </div>
  );
};
