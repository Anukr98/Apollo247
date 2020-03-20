import { makeStyles } from '@material-ui/styles';
import { Theme, Popover } from '@material-ui/core';
import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { useShoppingCart } from 'components/MedicinesCartProvider';
import { useDiagnosticsCart } from 'components/Tests/DiagnosticsCartProvider';

const useStyles = makeStyles((theme: Theme) => {
  return {
    appNavigation: {
      marginLeft: 'auto',
      [theme.breakpoints.down('xs')]: {
        marginLeft: 0,
      },
      '& a': {
        fontSize: 13,
        fontWeight: 600,
        color: theme.palette.secondary.dark,
        textTransform: 'uppercase',
        padding: '36px 10px 35px 10px',
        display: 'inline-block',
        [theme.breakpoints.down('sm')]: {
          paddingLeft: 10,
          paddingRight: 10,
        },
        [theme.breakpoints.down(900)]: {
          display: 'none',
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
    notificationBtn: {
      // display: 'none',
      display: 'inline-block',
      padding: '33px 10px 31px 10px',
      fontSize: 13,
      fontWeight: 600,
      color: theme.palette.secondary.dark,
      textTransform: 'uppercase',
      cursor: 'pointer',
      [theme.breakpoints.down('xs')]: {
        padding: '26px 20px 24px 20px',
      },
      '& img': {
        verticalAlign: 'middle',
      },
      '& >span': {
        position: 'relative',
      },
      '&:focus': {
        outline: 'none',
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
    cartPopover: {
      padding: 10,
      width: 239,
    },
    cartTypeGroup: {
      display: 'flex',
      width: '100%',
      backgroundColor: '#f7f8f5',
      borderRadius: 5,
      padding: 10,
      marginBottom: 10,
      '&:last-child': {
        marginBottom: 0,
      },
      '&:hover': {
        '& img': {
          opacity: 1,
        },
      },
    },
    cartTypeIcon: {
      width: 40,
      marginRight: 20,
      textAlign: 'center',
      '& img': {
        height: 40,
      },
    },
    cartTypeInfo: {
      width: 'calc(100% - 60px)',
    },
    cartType: {
      borderBottom: 'solid 0.5px rgba(2,71,91,0.2)',
      fontSize: 16,
      color: '#02475b',
      fontWeight: 500,
      display: 'flex',
      lineHeight: '24px',
      alignItems: 'center',
      '& span:last-child': {
        marginLeft: 'auto',
        '& img': {
          verticalAlign: 'middle',
        },
      },
      '& img': {
        opacity: 0.3,
      },
    },
    itemsAdded: {
      fontSize: 12,
      fontWeight: 500,
      color: '#02475b',
      opacity: 0.6,
    },
  };
});

export const Navigation: React.FC = (props) => {
  const classes = useStyles({});
  const currentPath = window.location.pathname;
  const { cartItems } = useShoppingCart();
  const { diagnosticsCartItems } = useDiagnosticsCart();
  const cartPopoverRef = useRef(null);
  const [isCartPopoverOpen, setIsCartPopoverOpen] = React.useState<boolean>(false);

  return (
    <div className={classes.appNavigation} data-cypress="Navigation">
      <Link
        className={currentPath === clientRoutes.appointments() ? classes.menuItemActive : ''}
        to={clientRoutes.appointments()}
        title={'View appointments'}
      >
        Appointments
      </Link>
      <Link
        to={clientRoutes.healthRecords()}
        className={currentPath === clientRoutes.healthRecords() ? classes.menuItemActive : ''}
        title={'View health records'}
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
        title={'Medicines'}
      >
        Medicines
      </Link>
      <Link
        to={clientRoutes.tests()}
        className={
          currentPath === clientRoutes.tests() || currentPath === clientRoutes.testsCart()
            ? classes.menuItemActive
            : ''
        }
        title={'Tests'}
      >
        Tests
      </Link>
      <div
        id="cartId"
        onClick={() => setIsCartPopoverOpen(!isCartPopoverOpen)}
        onKeyPress={() => setIsCartPopoverOpen(true)}
        ref={cartPopoverRef}
        tabIndex={0}
        className={`${classes.notificationBtn} ${
          currentPath === clientRoutes.medicinesCart() ? classes.menuItemActive : ''
        }`}
        title={'cart'}
      >
        <span>
          <img src={require('images/ic_cart.svg')} alt="Cart" title={'cart'} />
          <span className={classes.itemCount}>
            {cartItems.length + diagnosticsCartItems.length || 0}
          </span>
        </span>
      </div>
      {/* <div className={`${classes.notificationBtn}`}>
        <img src={require('images/ic_notification.svg')} alt="Notifications" />
      </div> */}
      <Popover
        open={isCartPopoverOpen}
        anchorEl={cartPopoverRef.current}
        onClose={() => setIsCartPopoverOpen(false)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <div className={classes.cartPopover}>
          <Link
            className={classes.cartTypeGroup}
            to={clientRoutes.medicinesCart()}
            onClick={() => setIsCartPopoverOpen(false)}
          >
            <div className={classes.cartTypeIcon}>
              <img src={require('images/ic_medicines.png')} alt="Medicine Cart" />
            </div>
            <div className={classes.cartTypeInfo}>
              <div className={classes.cartType} title={'View medicines'}>
                <span>Medicines</span>
                <span>
                  <img src={require('images/ic_arrow_right.svg')} alt="" />
                </span>
              </div>
              <div className={classes.itemsAdded}>{`${cartItems.length} Items`}</div>
            </div>
          </Link>
          <Link
            className={classes.cartTypeGroup}
            to={clientRoutes.testsCart()}
            onClick={() => setIsCartPopoverOpen(false)}
          >
            <div className={classes.cartTypeIcon}>
              <img src={require('images/ic_tests.svg')} alt="Tests Cart" />
            </div>
            <div className={classes.cartTypeInfo}>
              <div className={classes.cartType} title={'View tests'}>
                <span>Tests</span>
                <span>
                  <img src={require('images/ic_arrow_right.svg')} alt="" />
                </span>
              </div>
              <div className={classes.itemsAdded}>{`${diagnosticsCartItems.length} Items`}</div>
            </div>
          </Link>
        </div>
      </Popover>
    </div>
  );
};
