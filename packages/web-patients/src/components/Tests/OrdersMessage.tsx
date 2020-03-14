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

const useStyles = makeStyles((theme: Theme) => {
  return {
    container: {
      width: '100%',
      maxWidth: 1064,
      margin: 'auto',
      backgroundColor: '#f7f8f5',
      position: 'relative',
    },
    contentWrapper: {
      maxWidth: 820,
      margin: 'auto',
    },
    root: {
      // backgroundColor: '#f7f8f5',
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
    },
    medicineStrip: {
      backgroundColor: theme.palette.common.white,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      borderRadius: 5,
      padding: 30,
      marginBottom: 10,
      position: 'relative',
    },
    medicineStripDisabled: {
      backgroundColor: '#f7f8f5',
    },
    medicineStripWrap: {
      display: 'flex',
      [theme.breakpoints.down('xs')]: {
        display: 'block',
      },
    },
    medicineInformation: {
      paddingRight: 10,
      display: 'flex',
      alignItems: 'center',
    },
    cartRight: {
      marginLeft: 'auto',
      display: 'flex',
      alignItems: 'center',
      color: '#658f9b',
      fontSize: 17,
      fontWeight: 500,
      [theme.breakpoints.down('xs')]: {
        paddingLeft: 45,
        paddingTop: 5,
      },
    },
    medicineIcon: {
      paddingRight: 10,
      '& img': {
        maxWidth: 35,
        verticalAlign: 'middle',
      },
    },
    medicineName: {
      fontSize: 14,
      color: '#02475b',
      fontWeight: 500,
      [theme.breakpoints.down('xs')]: {
        paddingBottom: 5,
        paddingRight: 24,
        flexGrow: 1,
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
    scheduledRow: {
      padding: 14,
    },
    scheduledMessage: {
      color: '#658f9b',
      fontSize: 17,
      fontWeight: 500,
      textAlign: 'center',
    },
    scheduledRowBottom: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      maxWidth: '100%',
      marginBottom: 0,
      borderRadius: 0,
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

export const OrdersMessage: React.FC<TestListCardProps> = (props) => {
  const classes = useStyles({});
  const { addCartItem, removeCartItem, updateCartItemQty, cartItems } = useShoppingCart();
  const options = Array.from(Array(20), (_, x) => x + 1);

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
    <div className={classes.root}>
      <Header />
      <div className={classes.container}>
        <div className={classes.contentWrapper}>
          <div className={classes.heading}>Your Orders</div>
          <Scrollbars autoHide={true} autoHeight autoHeightMin={'calc(100vh - 215px'}>
            <div className={classes.medicineStrip}>
              <div className={classes.medicineStripWrap}>
                <div className={classes.medicineInformation}>
                  <div className={classes.medicineIcon}>
                    <img src={require('images/ic_tests_icon.svg')} alt="" />
                  </div>
                  <div className={classes.medicineName}>Blood Glucose</div>
                </div>
                <div className={classes.cartRight}>Home Visit</div>
              </div>
            </div>
            <div className={`${classes.medicineStrip} ${classes.scheduledRow}`}>
              <div className={classes.scheduledMessage}>Scheduled For : 10 Mar 2020, 06:00 AM</div>
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
