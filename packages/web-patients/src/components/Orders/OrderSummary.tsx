import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      backgroundColor: theme.palette.common.white,
      boxShadow: '0 2px 4px 0 rgba(128, 128, 128, 0.3)',
      borderRadius: 10,
      padding: 12,
      marginLeft: 10,
    },
    summaryHeader: {
      borderBottom: 'solid 2px #02475b',
      paddingBottom: 5,
    },
    headRow: {
      display: 'flex',
      alignItems: 'center',
      fontSize: 12,
      fontWeight: 500,
      color: '#02475b',
      padding: '5px 0',
      '& label': {
        opacity: 0.6,
      },
      '& span': {
        marginLeft: 'auto',
        textAlign: 'right',
        fontSize: 14,
      },
    },
    deliveryPromise: {
      fontSize: 10,
      fontWeight: 500,
      color: '#0087ba',
      borderBottom: 'solid 2px #02475b',
      paddingBottom: 5,
    },
    totalPaid: {
      backgroundColor: '#f7f8f5',
      padding: 12,
      display: 'flex',
      alignItems: 'center',
      fontSize: 14,
      fontWeight: 500,
      color: '#01475b',
      marginLeft: -12,
      marginRight: -12,
      marginTop: 15,
    },
    totalPrice: {
      marginLeft: 'auto',
      fontWeight: 'bold',
      textAlign: 'right',
    },
    disclaimerText: {
      fontSize: 10,
      fontWeight: 500,
      color: '#02475b',
      paddingTop: 12,
      opacity: 0.6,
    },
    summaryDetails: {
      color: '#02475b',
      fontSize: 12,
      fontWeight: 600,
      paddingTop: 20,
    },
    detailsTable: {
      paddingBottom: 30,
    },
    tableRow: {
      display: 'flex',
      alignItems: 'center',
      padding: '4px 0',
      '& >div:nth-child(2)': {
        marginLeft: 'auto',
        minWidth: 40,
        textAlign: 'center',
      },
      '& >div:nth-child(3)': {
        minWidth: 60,
      },
    },
    rowHead: {
      fontSize: 10,
      fontWeight: 500,
      textTransform: 'uppercase',
      paddingBottom: 10,
    },
  };
});

export const OrdersSummary: React.FC = (props) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.summaryHeader}>
        <div className={classes.headRow}>
          <label>Order ID</label>
          <span>#A2472707936</span>
        </div>
        <div className={classes.headRow}>
          <label>Date/Time</label>
          <span>9 Aug 2019, 6:30 PM</span>
        </div>
      </div>
      <div className={classes.summaryDetails}>
        <div className={classes.detailsTable}>
          <div className={`${classes.tableRow} ${classes.rowHead}`}>
            <div>Consult Detail</div>
            <div>QTY</div>
            <div>Charges</div>
          </div>
          <div className={classes.tableRow}>
            <div>Norflox - TZ (10 tabs)</div>
            <div>1</div>
            <div>Rs. 89</div>
          </div>
          <div className={classes.tableRow}>
            <div>Corex Cough Syrup</div>
            <div>1</div>
            <div>Rs. 139</div>
          </div>
          <div className={classes.tableRow}>
            <div>Metrogyl (30 tabs)</div>
            <div>1</div>
            <div>Rs. 38</div>
          </div>
        </div>
      </div>
      <div className={classes.deliveryPromise}>2 Hour Delivery Promise!</div>
      <div className={classes.totalPaid}>
        <span>Total Paid — Online</span>
        <span className={classes.totalPrice}>Rs. 316</span>
      </div>
      <div className={classes.disclaimerText}>
        Disclaimer: Nam libero tempore, m soluta nobis est eligendi optio cumque nihil impedit quo
        minus quod.
      </div>
    </div>
  );
};
