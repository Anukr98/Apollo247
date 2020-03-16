import React, { useState, useContext, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, MenuItem, CircularProgress } from '@material-ui/core';
import { AphButton, AphCustomDropdown } from '@aph/web-ui-components';
import { array } from 'prop-types';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { useShoppingCart } from 'components/MedicinesCartProvider';
import { MedicineProduct } from '../../helpers/MedicineApiCalls';
import { MedicineCartItem } from 'components/MedicinesCartProvider';
import { Header } from 'components/Header';
import Scrollbars from 'react-custom-scrollbars';
import useMediaQuery from '@material-ui/core/useMediaQuery';

const useStyles = makeStyles((theme: Theme) => {
  return {
    container: {
      width: '100%',
      maxWidth: 1064,
      margin: 'auto',
      backgroundColor: '#f7f8f5',
      position: 'relative',
      [theme.breakpoints.down('xs')]: {
        position: 'absolute',
        top: 0,
        zIndex: 99,
      },
    },
    contentWrapper: {
      maxWidth: 820,
      margin: 'auto',
      [theme.breakpoints.down('xs')]: {
        width: '100%',
      },
    },
    content: {
      padding: '0 20px 95px 20px',
      [theme.breakpoints.down('xs')]: {
        paddingBottom: 20,
      },
    },
    breadcrumbs: {
      marginLeft: 20,
      marginRight: 20,
      fontSize: 13,
      paddingTop: 17,
      paddingBottom: 11,
      fontWeight: 600,
      color: '#02475b',
      textTransform: 'uppercase',
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      [theme.breakpoints.down('xs')]: {
        position: 'fixed',
        zIndex: 999,
        top: 0,
        width: '100%',
        borderBottom: 'none',
        backgroundColor: theme.palette.common.white,
        margin: 0,
        paddingLeft: 20,
        paddingRight: 20,
        textAlign: 'center',
        boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.1)',
      },
      [theme.breakpoints.up('sm')]: {
        display: 'none',
      },
    },
    backArrow: {
      cursor: 'pointer',
      marginRight: 50,
      [theme.breakpoints.up(1220)]: {
        position: 'absolute',
        left: -82,
        top: 0,
        width: 48,
        height: 48,
        lineHeight: '36px',
        borderRadius: '50%',
        textAlign: 'center',
        backgroundColor: '#02475b',
      },
      [theme.breakpoints.down('xs')]: {
        marginRight: 0,
      },
      '& img': {
        verticalAlign: 'bottom',
      },
    },
    whiteArrow: {
      verticalAlign: 'middle',
      [theme.breakpoints.down(1220)]: {
        display: 'none',
      },
    },
    detailsHeader: {
      flex: 1,
    },
    blackArrow: {
      verticalAlign: 'middle',
      [theme.breakpoints.up(1220)]: {
        display: 'none',
      },
    },
    heading: {
      fontSize: 17,
      fontWeight: 500,
      color: '#02475b',
      textAlign: 'center',
      borderBottom: '0.5px solid rgba(2,71,91,0.1)',
      paddingBottom: 13,
      paddingTop: 30,
      marginBottom: 30,
      [theme.breakpoints.down('xs')]: {
        paddingTop: 10,
      },
    },
    medicineStrip: {
      backgroundColor: theme.palette.common.white,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      borderRadius: 5,
      padding: 20,
      marginBottom: 10,
      position: 'relative',
    },
    medicineStripDisabled: {
      backgroundColor: '#f7f8f5',
    },
    medicineStripWrap: {
      display: 'flex',
    },
    medicineInformation: {
      paddingRight: 10,
      display: 'flex',
    },
    cartRight: {
      marginLeft: 'auto',
      display: 'flex',
      alignItems: 'center',
      color: '#658f9b',
      fontSize: 17,
      fontWeight: 500,
    },
    medicineIcon: {
      paddingRight: 10,
      '& img': {
        maxWidth: 35,
        verticalAlign: 'middle',
      },
    },
    orderID: {
      fontSize: 17,
      color: '#02475b',
      fontWeight: 500,
      paddingBottom: 8,
      [theme.breakpoints.down('xs')]: {
        fontSize: 16,
      },
    },
    tabInfo: {
      fontSize: 10,
      color: '#02475b',
      fontWeight: 500,
      paddingTop: 2,
      opacity: 0.6,
    },
    noStock: {
      fontSize: 10,
      color: '#890000',
      fontWeight: 500,
      paddingTop: 2,
    },
    medicinePrice: {
      borderLeft: 'solid 0.5px rgba(2,71,91,0.2)',
      borderRight: 'solid 0.5px rgba(2,71,91,0.2)',
      fontSize: 12,
      color: '#02475b',
      letterSpacing: 0.3,
      fontWeight: 'bold',
      paddingTop: 12,
      paddingBottom: 11,
      minWidth: 90,
      textAlign: 'center',
      [theme.breakpoints.down('xs')]: {
        marginLeft: 'auto',
        borderRight: 'none',
        flexGrow: 1,
        textAlign: 'right',
        paddingRight: 12,
        borderTop: '1px solid rgba(2,71,91,0.2)',
      },
      '& span': {
        fontWeight: 500,
      },
    },
    addToCart: {
      paddingLeft: 20,
      paddingTop: 8,
      paddingBottom: 8,
      [theme.breakpoints.down('xs')]: {
        position: 'absolute',
        right: 15,
        top: 8,
      },
      '& button': {
        borderRadius: 0,
        boxShadow: 'none',
        padding: 0,
        minWidth: 'auto',
      },
    },
    medicinePack: {
      fontSize: 13,
      fontWeight: 600,
      color: '#02475b',
      letterSpacing: 0.33,
      borderLeft: 'solid 0.5px rgba(2,71,91,0.2)',
      paddingTop: 4,
      paddingLeft: 8,
      paddingBottom: 4,
      minWidth: 120,
      textAlign: 'center',
      [theme.breakpoints.down('xs')]: {
        borderLeft: 'none',
        flexGrow: 1,
        textAlign: 'left',
        borderTop: '1px solid rgba(2,71,91,0.2)',
      },
    },
    selectMenuItem: {
      backgroundColor: 'transparent',
      fontSize: 13,
      color: '#02475b',
      letterSpacing: 0.33,
      textTransform: 'uppercase',
      paddingTop: 7,
      paddingBottom: 6,
      paddingLeft: 4,
      '&:focus': {
        backgroundColor: 'transparent',
      },
    },
    menuRoot: {
      fontSize: 13,
      fontWeight: 500,
      color: '#02475b',
    },
    menuSelected: {
      backgroundColor: 'transparent !important',
      color: '#00b38e',
      fontWeight: 600,
    },
    labelText: {
      fontSize: 17,
      fontWeight: 500,
      color: '#658f9b',
      marginLeft: 'auto',
      [theme.breakpoints.down('xs')]: {
        fontSize: 12,
      },
    },
    scheduledRowBottom: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      maxWidth: '100%',
      marginBottom: 0,
      borderRadius: 0,
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      borderBottomRightRadius: 5,
      borderBottomLeftRadius: 5,
      [theme.breakpoints.down('xs')]: {
        position: 'fixed',
        borderRadius: 0,
      },
    },
    scheduledRowBottomMsg: {
      fontSize: 17,
      fontWeight: 500,
      color: '#01475b',
      textAlign: 'center',
    },
    bold: {
      fontWeight: 'bold',
    },
    phoneNumbers: {
      '& span': {
        color: '#fc9916',
      },
    },
  };
});

export interface TestListCardProps {
  medicineList: MedicineProduct[] | null;
  isLoading: boolean;
}

export const OrderDetails: React.FC<TestListCardProps> = (props) => {
  const classes = useStyles({});
  const { addCartItem, removeCartItem, updateCartItemQty, cartItems } = useShoppingCart();
  const options = Array.from(Array(20), (_, x) => x + 1);
  const isSmallScreen = useMediaQuery('(max-width:767px)');

  const [selectedPackedQty] = React.useState(1);

  const apiDetails = {
    url: process.env.PHARMACY_MED_SEARCH_URL,
    authToken: process.env.PHARMACY_MED_AUTH_TOKEN,
    imageUrl: process.env.PHARMACY_MED_IMAGES_BASE_URL,
  };

  const itemIndexInCart = (item: MedicineProduct) => {
    return cartItems.findIndex((cartItem) => cartItem.id == item.id);
  };

  return (
    <div>
      <Header />
      <div className={classes.container}>
        <div className={classes.contentWrapper}>
          <div className={classes.heading}>Your Orders</div>
          <div className={classes.breadcrumbs}>
            <a onClick={() => (window.location.href = clientRoutes.tests())}>
              <div className={classes.backArrow}>
                <img className={classes.blackArrow} src={require('images/ic_back.svg')} />
                <img className={classes.whiteArrow} src={require('images/ic_back_white.svg')} />
              </div>
            </a>
            <div className={classes.detailsHeader}>Your Orders</div>
          </div>
          <Scrollbars
            autoHide={true}
            autoHeight
            autoHeightMin={isSmallScreen ? 'calc(100vh - 180px)' : 'calc(100vh - 210px)'}
          >
            <div className={classes.content}>
              <div className={classes.medicineStrip}>
                <div className={classes.medicineStripWrap}>
                  <div className={classes.medicineInformation}>
                    <div className={classes.medicineIcon}>
                      <img src={require('images/ic_tests_icon.svg')} alt="" />
                    </div>
                    <div>
                      <div className={classes.orderID}>#A2472707936</div>
                      <div className={classes.labelText}>Scheduled For : 10 Mar 2020, 06:00 AM</div>
                    </div>
                  </div>
                  <div className={classes.labelText}>Home Visit</div>
                </div>
              </div>
              <div className={classes.medicineStrip}>
                <div className={classes.medicineStripWrap}>
                  <div className={classes.medicineInformation}>
                    <div className={classes.medicineIcon}>
                      <img src={require('images/ic_tests_icon.svg')} alt="" />
                    </div>
                    <div>
                      <div className={classes.orderID}>#A2472707936</div>
                      <div className={classes.labelText}>Scheduled For : 10 Mar 2020, 06:00 AM</div>
                    </div>
                  </div>
                  <div className={classes.labelText}>Clinic Visit</div>
                </div>
              </div>
            </div>
          </Scrollbars>
          <div className={`${classes.medicineStrip} ${classes.scheduledRowBottom}`}>
            <div className={classes.scheduledRowBottomMsg}>
              For <span className={classes.bold}>Test Orders,</span> to know the Order Status /
              Reschedule / Cancel, please call —
              <div className={classes.phoneNumbers}>
                <span>040 44442424 </span> / <span>040 33442424</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
