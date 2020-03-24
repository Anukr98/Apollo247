import React, { useState, useContext, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, MenuItem, CircularProgress } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
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
        height: '100%',
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
      padding: 30,
      backgroundColor: theme.palette.common.white,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      borderRadius: 5,
      marginBottom: 24,
      position: 'relative',
      [theme.breakpoints.down('xs')]: {
        paddingBottom: 20,
        borderRadius: 0,
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
        padding: '15px',
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
    orderDetails: {
      display: 'flex',
      fontWeight: 500,
      color: '#02475b',
      marginBottom: 15,
      fontSize: 14,
      '& div:first-child': {
        color: '#658f9b',
      },
      '& div:last-child': {
        marginLeft: 'auto',
      },
    },
    orderTime: {
      display: 'flex',
      fontWeight: 500,
      color: '#658f9b',
      marginBottom: 15,
      paddingBottom: 11,
      fontSize: 14,
    },
    timeAndDate: {
      color: '#02475b',
      display: 'flex',
      marginLeft: 'auto',
    },
    orderDate: {
      marginRight: 4,
    },
    consultRow: {
      padding: '15px 68px 30px 0',
      marginBottom: 30,
      borderTop: '2px solid #02475b',
      borderBottom: '2px solid #02475b',
      [theme.breakpoints.down('xs')]: {
        paddingRight: 0,
      },
    },
    consultDetails: {
      display: 'flex',
      fontWeight: 500,
      color: '#02475b',
      marginTop: 15,
      fontSize: 11,
      textTransform: 'uppercase',
    },
    priceDetails: {
      marginLeft: 'auto',
      display: 'flex',
      '& div:first-child': {
        marginRight: 33,
        minWidth: 40,
        textAlign: 'center',
      },
      '& div': {
        textAlign: 'center',
      },
    },
    testsDetailedRow: {
      fontSize: 15,
      fontWeight: 600,
      color: '#02475b',
      marginTop: 18,
    },
    totalCharges: {
      backgroundColor: '#f7f8f5',
      display: 'flex',
      margin: '0 -30px',
      padding: '20px 98px 20px 30px',
      fontSize: 15,
      fontWeight: 600,
      color: '#02475b',
      textTransform: 'uppercase',
      '& div:last-child': {
        marginLeft: 'auto',
      },
      [theme.breakpoints.down('xs')]: {
        paddingRight: 30,
      },
    },
  };
});

export const OrderSummary: React.FC = () => {
  const classes = useStyles({});
  const isSmallScreen = useMediaQuery('(max-width:767px)');
  return (
    <div>
      <Header />
      <div className={classes.container}>
        <div className={classes.contentWrapper}>
          <div className={classes.heading}>ORDER #247000260</div>
          <div className={classes.breadcrumbs}>
            <Link to={clientRoutes.testOrders()}>
              <div className={classes.backArrow}>
                <img className={classes.blackArrow} src={require('images/ic_back.svg')} />
                <img className={classes.whiteArrow} src={require('images/ic_back_white.svg')} />
              </div>
            </Link>
            <div className={classes.detailsHeader}>ORDER #247000260</div>
          </div>
          <Scrollbars
            autoHide={true}
            autoHeight
            autoHeightMin={isSmallScreen ? 'calc(100vh - 90px)' : 'calc(100vh - 210px)'}
          >
            <div className={classes.content}>
              <div className={classes.orderDetails}>
                <div>Order ID</div>
                <div>#247000260</div>
              </div>
              <div className={classes.orderTime}>
                <div>Date/Time</div>
                <div className={classes.timeAndDate}>
                  <div className={classes.orderDate}>13 Mar 2020 | </div>
                  <div>12:52 PM</div>
                </div>
              </div>
              <div className={classes.consultRow}>
                <div className={classes.consultDetails}>
                  <div>Consult Details</div>
                  <div className={classes.priceDetails}>
                    <div>Qty</div>
                    <div>Charges</div>
                  </div>
                </div>
                <div className={`${classes.consultDetails} ${classes.testsDetailedRow}`}>
                  <div>Scrub tyhus Igg/Igm Rapid </div>
                  <div className={classes.priceDetails}>
                    <div>1</div>
                    <div>Rs.100</div>
                  </div>
                </div>
              </div>
              <div className={classes.totalCharges}>
                <div>Total</div>
                <div>Rs.100</div>
              </div>
            </div>
          </Scrollbars>
        </div>
      </div>
    </div>
  );
};
