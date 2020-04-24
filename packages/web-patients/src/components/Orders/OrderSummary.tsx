import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import moment from 'moment';
import {
  GetMedicineOrderDetails,
  GetMedicineOrderDetails_getMedicineOrderDetails_MedicineOrderDetails as orederDetails,
  GetMedicineOrderDetails_getMedicineOrderDetails_MedicineOrderDetails_medicineOrderPayments as payments,
} from 'graphql/types/GetMedicineOrderDetails';
import { CircularProgress } from '@material-ui/core';

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
    medicineName: {
      wordBreak: 'break-word',
    },
    rowHead: {
      fontSize: 10,
      fontWeight: 500,
      textTransform: 'uppercase',
      paddingBottom: 10,
    },
    loader: {
      margin: '20px auto',
      textAlign: 'center',
      display: 'block',
    },
  };
});

type TrackOrdersProps = {
  orderDetailsData: orederDetails | null;
  isLoading: boolean;
};

export const OrdersSummary: React.FC<TrackOrdersProps> = (props) => {
  const classes = useStyles({});
  const orderStatus =
    props.orderDetailsData &&
    props.orderDetailsData.medicineOrdersStatus &&
    props.orderDetailsData.medicineOrdersStatus.length > 0 &&
    props.orderDetailsData.medicineOrdersStatus[0];
  const orderItem = props.orderDetailsData && props.orderDetailsData.medicineOrderLineItems;
  const orderPayment =
    props.orderDetailsData &&
    props.orderDetailsData.medicineOrderPayments &&
    props.orderDetailsData.medicineOrderPayments.length > 0 &&
    props.orderDetailsData.medicineOrderPayments[0];

  return props.isLoading ? (
    <div className={classes.loader}>
      <CircularProgress />
    </div>
  ) : (props.orderDetailsData &&
      props.orderDetailsData.orderAutoId &&
      orderPayment &&
      orderPayment.paymentType === 'COD') ||
    (orderPayment && orderPayment.paymentType === 'CASHLESS') ? (
    <div className={classes.root}>
      <div className={classes.summaryHeader}>
        <div className={classes.headRow}>
          <label>Order ID</label>
          <span>#{props.orderDetailsData && props.orderDetailsData.orderAutoId}</span>
        </div>
        <div className={classes.headRow}>
          <label>Date/Time</label>
          <span>
            {moment(new Date(orderStatus && orderStatus.statusDate)).format('DD MMM YYYY ,hh:mm a')}
          </span>
        </div>
      </div>
      <div className={classes.summaryDetails}>
        <div className={classes.detailsTable}>
          <div className={`${classes.tableRow} ${classes.rowHead}`}>
            <div>Consult Detail</div>
            <div>QTY</div>
            <div>Charges</div>
          </div>
          {orderItem &&
            orderItem.length > 0 &&
            orderItem.map((item, index) => (
              <div key={index} className={classes.tableRow}>
                <div className={classes.medicineName}>{item && item.medicineName}</div>
                <div>{item && item.quantity}</div>
                <div>Rs.{item && item.price}</div>
              </div>
            ))}
        </div>
      </div>
      <div className={classes.deliveryPromise}>2 Hour Delivery Promise!</div>
      <div className={classes.totalPaid}>
        <span>{`${'Total Paid -'} ${orderPayment && orderPayment.paymentType}`}</span>
        <span className={classes.totalPrice}>Rs.{orderPayment && orderPayment.amountPaid}</span>
      </div>
      <div className={classes.disclaimerText}>
        Disclaimer: Price may vary when the actual bill is generated.
      </div>
    </div>
  ) : null;
};
