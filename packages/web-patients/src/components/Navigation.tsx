import { makeStyles } from '@material-ui/styles';
import { Theme, Popover } from '@material-ui/core';
import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { useAuth } from 'hooks/authHooks';
import { useShoppingCart } from 'components/MedicinesCartProvider';
import { useDiagnosticsCart } from 'components/Tests/DiagnosticsCartProvider';
import { getAppStoreLink } from 'helpers/dateHelpers';

const useStyles = makeStyles((theme: Theme) => {
  return {
    appNavigation: {
      marginLeft: 'auto',
      display: 'flex',
      alignItems: 'center',
      '& a': {
        fontSize: 13,
        fontWeight: 600,
        color: '#02475b',
        padding: '15px 16px 14px 16px',
        [theme.breakpoints.down(900)]: {
          display: 'none',
        },
      },
    },
    menuTitle: {
      textTransform: 'uppercase',
      borderBottom: '1px solid #01475b',
      paddingBottom: 3,
      display: 'inline-block',
    },
    menuInfo: {
      paddingTop: 3,
      fontSize: 12,
      opacity: 0.6,
      display: 'block',
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
      display: 'inline-block',
      padding: '33px 16px 31px 16px',
      fontSize: 13,
      fontWeight: 600,
      color: theme.palette.secondary.dark,
      textTransform: 'uppercase',
      cursor: 'pointer',
      [theme.breakpoints.down('xs')]: {
        padding: '25px 16px 23px 16px',
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
    appDownloadBtn: {
      paddingLeft: 16,
      paddingRight: 16,
      textAlign: 'center',
      [theme.breakpoints.down('xs')]: {
        paddingLeft: 10,
        paddingRight: 10,
      },
      '& a': {
        backgroundColor: '#fcb716',
        boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
        borderRadius: 10,
        color: '#fff',
        fontSize: 13,
        fontWeight: 'bold',
        padding: '11px 15px',
        display: 'block',
        textTransform: 'uppercase',
      },
    },
  };
});

export const Navigation: React.FC = (props) => {
  const classes = useStyles({});
  const currentPath = window.location.pathname;
  const { isSigningIn, isSignedIn, setVerifyOtpError } = useAuth();
  const { cartItems } = useShoppingCart();
  const { diagnosticsCartItems } = useDiagnosticsCart();
  const cartPopoverRef = useRef(null);
  const [isCartPopoverOpen, setIsCartPopoverOpen] = React.useState<boolean>(false);

  return (
    <div className={classes.appNavigation} data-cypress="Navigation">
      <Link
        className={currentPath === clientRoutes.doctorsLanding() ? classes.menuItemActive : ''}
        to={clientRoutes.doctorsLanding()}
        title={'Doctors'}
      >
        <span className={classes.menuTitle}>Doctors</span>
        <span className={classes.menuInfo}>Consult<br/> Online</span>
      </Link>
      <Link
        to={clientRoutes.medicines()}
        className={
          currentPath === clientRoutes.medicines() ||
          currentPath === clientRoutes.prescriptionsLanding()
            ? classes.menuItemActive
            : ''
        }
        title={'Pharmacy'}
      >
        <span className={classes.menuTitle}>Pharmacy</span>
        <span className={classes.menuInfo}>Medicines &<br/> other products</span>
      </Link>
      {/* <Link
        to={clientRoutes.tests()}
        className={currentPath === clientRoutes.tests() ? classes.menuItemActive : ''}
        title={'Tests'}
      >
        <span className={classes.menuTitle}>Tests</span>
        <span className={classes.menuInfo}>Health<br/> checks</span>
      </Link> */}
      <Link
        to={clientRoutes.covidLanding()}
        className={currentPath === clientRoutes.covidLanding() ? classes.menuItemActive : ''}
        title={'Covid-19'}
      >
        <span className={classes.menuTitle}>Covid-19</span>
        <span className={classes.menuInfo}>Latest<br/> updates</span>
      </Link>
      {isSignedIn ? (
        ''
      ) : (
        <div className={`${classes.appDownloadBtn}`}>
          <a href={getAppStoreLink()} target="_blank" title={'Download Apollo247 App'}>
            Download App
          </a>
        </div>
      )}
      <div
        id="cartId"
        onClick={() => setIsCartPopoverOpen(!isCartPopoverOpen)}
        onKeyPress={() => setIsCartPopoverOpen(true)}
        ref={cartPopoverRef}
        tabIndex={0}
        className={`${classes.notificationBtn} ${
          currentPath === clientRoutes.medicinesCart() ? classes.menuItemActive : ''
        }  ${currentPath === clientRoutes.testsCart() ? classes.menuItemActive : ''}`}
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
          {/* <Link
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
          </Link> */}
        </div>
      </Popover>
    </div>
  );
};
