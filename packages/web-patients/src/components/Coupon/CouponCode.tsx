import React from 'react';
import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { AphTextField, AphButton } from '@aph/web-ui-components';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      paddingTop: 10,
      paddingBottom: 10,
    },
    couponButton: {
      backgroundColor: '#f7f8f5',
      boxShadow: '0 2px 4px 0 rgba(128, 128, 128, 0.3)',
      display: 'flex',
      alignItems: 'center',
      fontSize: 16,
      fontWeight: 500,
      color: '#01475b',
      padding: 16,
      borderRadius: 10,
      cursor: 'pointer',
    },
    couponForm: {
      backgroundColor: '#f7f8f5',
      boxShadow: '0 2px 4px 0 rgba(128, 128, 128, 0.3)',
      alignItems: 'center',
      fontSize: 16,
      fontWeight: 500,
      color: '#01475b',
      padding: 16,
      paddingTop: 5,
      borderRadius: 10,
      marginTop: 10,
      position: 'relative',
    },
    priceBox: {
      backgroundColor: '#f7f8f5',
      boxShadow: '0 2px 4px 0 rgba(128, 128, 128, 0.3)',
      padding: 16,
      marginTop: 10,
      borderRadius: 10,
    },
    priceRow: {
      display: 'flex',
      alignItems: 'center',
      fontSize: 16,
      fontWeight: 500,
    },
    price: {
      marginLeft: 'auto',
    },
    totalPriceRow: {
      display: 'flex',
      alignItems: 'center',
      fontSize: 16,
      fontWeight: 500,
      borderTop: '0.5px solid rgba(2,71,91,0.3)',
      paddingTop: 10,
      marginTop: 10,
    },
    totalPrice: {
      marginLeft: 'auto',
      fontWeight: 'bold',
    },
    button: {
      boxShadow: 'none',
      minWidth: 'auto',
      position: 'absolute',
      right: 16,
      top: 3,
      fontSize: 16,
      fontWeight: 500,
      padding: 5,
      textTransform: 'none',
    },
    removeBtn: {
      boxShadow: 'none',
      minWidth: 'auto',
      fontSize: 16,
      fontWeight: 500,
      padding: 5,
      textTransform: 'none',
      color: '#00b38e',
      marginLeft: 'auto',
    },
    couponImg: {
      paddingRight: 16,
      '& img': {
        verticalAlign: 'middle',
      }
    },
    tickMark: {
      marginLeft: 'auto',
      '& img': {
        verticalAlign: 'middle',
      }
    },
    successMsg: {
      fontSize: 16,
      color: '#00b38e',
      paddingTop: 5,
    },
    errorMsg: {
      fontSize: 16,
      color: '#890000',
      paddingTop: 5,
    },
  };
});

export const CouponCode: React.FC = (props) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.couponButton}>
        <span className={classes.couponImg}>
          <img src={require('images/ic_coupon.svg')} alt="" />
        </span>
        <span>Coupon Applied</span>
        <div className={classes.tickMark}>
          <img src={require('images/ic_arrow_right.svg')} alt="" />
        </div>
        <AphButton className={classes.removeBtn}>Remove</AphButton>
      </div>
      <div className={classes.couponForm}>
        <AphTextField placeholder="Enter coupon code" />
        <AphButton className={classes.button}>Apply</AphButton>
        <AphButton className={classes.button}>Remove</AphButton>
        <div className={classes.successMsg}>Success.</div>
        <div className={classes.errorMsg}>Sorry, invalid coupon code.</div>
      </div>
      <div className={classes.priceBox}>
        <div className={classes.priceRow}>
          <span>Subtotal</span>
          <span className={classes.price}>Rs. 800.00</span>
        </div>
        <div className={classes.priceRow}>
          <span>Coupon (WELCOME)</span>
          <span className={classes.price}>-Rs. 800.00</span>
        </div>
        <div className={classes.totalPriceRow}>
          <span>To Pay</span>
          <span className={classes.totalPrice}>Rs. 00.00</span>
        </div>
      </div>
    </div>
  );
};
