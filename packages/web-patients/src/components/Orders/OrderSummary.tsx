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
import { AphButton } from '@aph/web-ui-components';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      backgroundColor: theme.palette.common.white,
      boxShadow: '0 2px 4px 0 rgba(128, 128, 128, 0.3)',
      borderRadius: 10,
      marginLeft: 10,
    },
    summaryHeader: {
      padding: '10px 16px',
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
    },
    headRow: {
      display: 'flex',
      fontSize: 12,
      fontWeight: 500,
      color: '#02475b',
      '& label': {
        opacity: 0.6,
        display: 'block',
      },
    },
    leftGroup: {
      fontWeight: 600,
    },
    rightGroup: {
      marginLeft: 'auto',
      textAlign: 'right',
    },
    deliveryPromise: {
      fontSize: 10,
      fontWeight: 500,
      color: '#0087ba',
      borderBottom: 'solid 2px #02475b',
      paddingBottom: 5,
    },
    totalPaid: {
      fontSize: 13,
      fontWeight: 'bold',
      color: '#01475b',
      borderTop: '0.5px solid rgba(2,71,91,0.3)',
      paddingTop: 5,
      marginTop: 5,
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
      padding: 16,
      display: 'flex',
      '& span': {
        opacity: 0.6,
        paddingLeft: 5,
      },
    },
    summaryDetails: {
      color: '#02475b',
      fontSize: 12,
      fontWeight: 600,
      padding: 16,
    },
    detailsTable: {
      paddingBottom: 0,
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
    borderNone: {
      borderBottom: 'none',
    },
    caps: {
      textTransform: 'uppercase',
    },
    addressHead: {
      fontSize: 10,
      textTransform: 'uppercase',
      fontWeight: 500,
      padding: '10px 16px',
      color: '#01475b',
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
    },
    addressDetails: {
      padding: '10px 16px',
      fontSize: 11,
      lineHeight: '16px',
    },
    addressRow: {
      display: 'flex',
      paddingBottom: 10,
      '& label': {
        fontWeight: 500,
        minWidth: 55,
      },
    },
    itemsHeader: {
      fontSize: 10,
      fontWeight: 500,
      display: 'flex',
      padding: '0 16px 10px 16px',
      color: '#01475b',
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      '& span:last-child': {
        marginLeft: 'auto',
      },
    },
    totalItems: {
      paddingBottom: 10,
      fontSize: 10,
      fontWeight: 'normal',
    },
    totalDetails: {
      padding: '10px 16px',
      fontSize: 12,
      fontWeight: 500,
      color: '#01475b',
    },
    priceRow: {
      display: 'flex',
      alignItems: 'center',
      paddingBottom: 5,
      '& span:last-child': {
        marginLeft: 'auto',
        textAlign: 'center',
      },
    },
    lastRow: {
      fontWeight: 'normal',
    },
    bottomActions: {
      textAlign: 'center',
      '& button': {
        minWidth: 154,
        backgroundColor: '#fff',
        borderRadius: 10,
        color: '#fc9916',
        marginTop: 8,
        '&:hover': {
          backgroundColor: '#fff',
          color: '#fc9916',
        },
      },
    }
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
      <>
      <div className={classes.root}>
        <div className={classes.summaryHeader}>
          <div className={classes.headRow}>
            <div className={classes.leftGroup}>
              <span className={classes.caps}>Order</span> # <br/>{props.orderDetailsData && props.orderDetailsData.orderAutoId}
            </div>
            <div className={classes.rightGroup}>
              Total <b>Rs.{orderPayment && orderPayment.amountPaid}</b>
            </div>
          </div>
        </div>
        <div className={`${classes.summaryHeader} ${classes.borderNone}`}>
          <div className={classes.headRow}>
            <div className={classes.leftGroup}>
              <label>Order Placed</label>
              <span>
                {moment(new Date(orderStatus && orderStatus.statusDate)).format('DD MMM YYYY ,hh:mm a')}
              </span>
            </div>
            <div className={classes.rightGroup}>
              <label>Order Placed</label>
              <span>Prepaid</span>
            </div>
          </div>
        </div>
        <div className={classes.addressHead}>
          <span>Shipping Address</span>
        </div>
        <div className={classes.addressDetails}>
          <div className={classes.addressRow}>
            <label>Name -</label>
            <span>Surj Gupta</span>
          </div>
          <div className={classes.addressRow}>
            <label>Address -</label>
            <span>L-2/203, Gulmohar Gardens, Raj Nagar Extension, 201017</span>
          </div>
        </div>
        <div className={classes.itemsHeader}>
          <span className={classes.caps}>Item Details</span>
          <span>Delivered Tue, 27 April</span>
        </div>
        <div className={classes.summaryDetails}>
          <div className={classes.detailsTable}>
            <div className={classes.totalItems}><b>3 item(s)</b> in this shipment</div>
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
        <div className={classes.addressHead}>
          <span>Payment Details</span>
        </div>
        <div className={classes.totalDetails}>
          <div className={classes.priceRow}>
            <span>MRP Total</span>
            <span>Rs. 300</span>
          </div>
          <div className={classes.priceRow}>
            <span>Product Discount</span>
            <span>- Rs. 90</span>
          </div>
          <div className={classes.priceRow}>
            <span>Delivery Charges</span>
            <span>+ Rs. 60</span>
          </div>
          <div className={classes.priceRow}>
            <span>Packaging Charges</span>
            <span>+ Rs. 60</span>
          </div>
          <div className={`${classes.priceRow} ${classes.totalPaid}`}>
            <span>Total</span>
            <span>Rs.{orderPayment && orderPayment.amountPaid}</span>
          </div>
          <div className={`${classes.priceRow} ${classes.lastRow}`}>
            <span>Payment method</span>
            <span>Payment method</span>
          </div>
        </div>
      </div>
      <div className={classes.disclaimerText}><b>Disclaimer:</b> <span>Price may vary when the actual bill is generated.</span></div>
      <div className={classes.bottomActions}>
        <AphButton>Download</AphButton>
        <AphButton>Share</AphButton>
      </div>
    </>
  ) : null;
};
