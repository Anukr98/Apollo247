import React from 'react';
import { makeStyles } from '@material-ui/styles';
import Grid from '@material-ui/core/Grid';

import { Link, Theme, Typography } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import Modal from '@material-ui/core/Modal';
import { AphButton } from '@aph/web-ui-components';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import { MEDICINE_ORDER_PAYMENT_TYPE } from 'graphql/types/globalTypes';

const useStyles = makeStyles((theme: Theme) => {
  return {
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    sectionHeader: {
      padding: '0 0 10px',
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      margin: '0 0 20px',
      '& h4': {
        fontSize: 13,
        fontWeight: 600,
        textTransform: 'uppercase',
        color: '#01475b',
      },
      [theme.breakpoints.down('sm')]: {
        display: 'none',
      },
    },
    paper: {
      borderRadius: 5,
      padding: 20,
      boxShadow: 'none',
      [theme.breakpoints.down('sm')]: {
        background: 'none',
        padding: 0,
      },
    },
    paperHeading: {
      padding: '0 0 10px',
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      margin: '0 0 20px',
      '& h3': {
        fontSize: 15,
        fontWeight: 600,
        textTransform: 'uppercase',
        color: '#01475b',
      },
    },
    payBtn: {
      padding: '10px 20px',
      borderRadius: '10px',
      fontSize: 13,
      fontWeight: 700,
      margin: '50px auto 0',
      boxShadow: 'none',
      color: '#fff',
      textTransform: 'uppercase',
      background: '#fcb716',
      display: 'block',
      border: 'none',
    },
    modal: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalContent: {
      width: '600px',
      height: 'auto',
      background: '#fff',
      borderRadius: 10,
      outline: 'none',
      [theme.breakpoints.down('sm')]: {
        width: 400,
        height: '100vh',
      },
      [theme.breakpoints.down('xs')]: {
        width: '100%',
      },
    },
    modalHeader: {
      padding: 20,
      textAlign: 'center',
      boxShadow: '0px 5px 20px 5px rgba(0,0,0,0.1)',
      position: 'relative',
      '& h5': {
        fontSize: 16,
        color: '#02475b',
        fontWeight: 700,
      },
    },
    closePopup: {
      width: 30,
      height: 30,
      borderRadius: '50%',
      background: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'absolute',
      top: 0,
      right: '-50px',
      [theme.breakpoints.down('sm')]: {
        display: 'none',
      },
    },
    mobileBack: {
      display: 'none',
      top: '20px',
      left: '20px',
      [theme.breakpoints.down('sm')]: {
        display: 'block',
      },
    },
    modalBody: {
      padding: 20,
      '& button': {
        margin: '0 auto',
      },
      [theme.breakpoints.down('sm')]: {
        height: 'calc(100% - 64px)',
        overflow: 'auto',
      },
    },
    modalSHeader: {
      [theme.breakpoints.down('sm')]: {
        display: 'block !important',
      },
    },
    statusCard: {
      padding: 20,
      borderRadius: 10,
      textAlign: 'center',
      boxShadow: '0px 5px 20px 5px rgba(0,0,0,0.1)',
      margin: '0 0 20px',
      '& svg': {
        width: 50,
        height: 50,
      },
      '& h5': {
        fontSize: 13,
        fontWeight: 700,
        textTransform: 'uppercase',
        padding: '5px 0',
      },
      '& p': {
        fontSize: 13,
        fontWeight: 700,
        color: '#666666',
        lineHeight: '24px',
      },
    },
    orderDetails: {
      padding: 20,
      display: 'grid',
      gridTemplateColumns: 'auto auto',
      gridColumnGap: '20px',
      boxShadow: '0px 5px 20px 5px rgba(0,0,0,0.1)',
    },
    details: {
      '& h6': {
        fontSize: 13,
        fontWeight: 700,
        color: '#02475b',
      },
      '& p': {
        fontSize: 13,
        fontWeight: 700,
        color: '#666666',
      },
    },
    note: {
      width: '80%',
      textAlign: 'center',
      margin: '20px  auto',
      '& p': {
        fontSize: 13,
        fontWeight: 700,
        color: '#666666',
      },
    },
    pending: {
      background: '#eed9c6',
      '& svg': {
        color: '#e87e38',
      },
      '& h5': {
        color: '#e87e38',
      },
    },
    failed: {
      background: '#edc6c2',
      '& svg': {
        color: '#e02020',
      },
      '& h5': {
        color: '#e02020',
      },
    },
    success: {
      background: '#edf7ed',
      '& svg': {
        color: '#4aa54a',
      },
      '& h5': {
        color: '#4aa54a',
      },
    },
    refund: {
      background: '#edc6c2',
      '& svg': {
        color: '#a30808',
      },
      '& h5': {
        color: '#a30808',
      },
    },
    loader: {
      textAlign: 'center',
      padding: '20px 0',
    },
    consultDetail: {
      display: 'flex !important',
    },
  };
});

type doctorDetail = {
  fullName: string;
  doctorHospital: Array<any>;
};

interface OrderStatusDetail {
  paymentStatus: string;
  paymentInfo: string;
  orderStatusCallback: () => void;
  orderId: number;
  amountPaid: number;
  paymentType?: MEDICINE_ORDER_PAYMENT_TYPE;
  paymentRefId: string;
  paymentDateTime?: string;
  type: string;
  bookingDateTime?: string;
  doctorDetail?: doctorDetail;
  consultMode?: string;
  onClose: () => void;
  ctaText: string;
}

export const OrderStatusContent: React.FC<OrderStatusDetail> = (props) => {
  const classes = useStyles({});
  const {
    paymentStatus,
    paymentInfo,
    orderStatusCallback,
    orderId,
    amountPaid,
    paymentType,
    paymentRefId,
    paymentDateTime,
    type,
    bookingDateTime,
    doctorDetail,
    consultMode,
    onClose,
    ctaText,
  } = props;

  interface statusMap {
    [name: string]: string;
  }
  const status: statusMap = {
    success: 'PAYMENT SUCCESSFUL',
    failed: 'PAYMENT FAILED',
    pending: 'PAYMENT PENDING',
  };

  const doctorAddressDetail =
    (doctorDetail && doctorDetail.doctorHospital[0] && doctorDetail.doctorHospital[0].facility) ||
    '';
  return (
    <div className={classes.modalContent}>
      <div className={classes.modalHeader}>
        <Typography component="h5">Payment Status</Typography>
        <Link onClick={onClose} className={classes.closePopup}>
          <img src={require('images/ic_cross_popup.svg')} />
        </Link>
        <Link onClick={onClose} className={`${classes.closePopup} ${classes.mobileBack}`}>
          <img src={require('images/ic_back.svg')} />
        </Link>
      </div>
      <div className={classes.modalBody}>
        <div
          className={`${classes.statusCard} ${
            paymentStatus == 'pending'
              ? classes.pending
              : paymentStatus == 'failed'
              ? classes.failed
              : paymentStatus == 'success'
              ? classes.success
              : ''
          }`}
        >
          <ErrorOutlineIcon></ErrorOutlineIcon>
          <Typography component="h5">{status[paymentStatus]}</Typography>
          <Typography component="p">Rs. {amountPaid}</Typography>
          <Typography component="p">Order ID : {orderId}</Typography>
          <Typography component="p">Payment Ref. Number - {paymentRefId}</Typography>
        </div>
        <div className={`${classes.sectionHeader} ${classes.modalSHeader}`}>
          <Typography component="h4">{type === 'consult' ? 'Booking' : 'Order'} Details</Typography>
        </div>
        <>
          {type === 'consult' ? (
            <Paper className={`${classes.orderDetails} ${classes.consultDetail}`}>
              <Grid container spacing={1}>
                <Grid item xs={12} sm={5}>
                  <div className={classes.details}>
                    <Typography component="h6">Date &amp; Time of Appointment</Typography>
                    <Typography component="p">{bookingDateTime}</Typography>
                  </div>
                </Grid>
                <Grid item xs>
                  <div className={classes.details}>
                    <Typography component="h6">Doctor Name</Typography>
                    <Typography component="p">{doctorDetail && doctorDetail.fullName}</Typography>
                  </div>
                </Grid>
                <Grid item xs>
                  <div className={classes.details}>
                    <Typography component="h6">Mode of Consult</Typography>
                    <Typography component="p">
                      {consultMode === 'PHYSICAL' ? 'Clinic Visit' : consultMode}
                    </Typography>
                  </div>
                </Grid>
                {consultMode === 'PHYSICAL' &&
                  doctorAddressDetail &&
                  Object.keys(doctorAddressDetail).length > 1 && (
                    <Grid item xs={12} sm={12}>
                      <div className={classes.details}>
                        <Typography component="h6">Clinic Address</Typography>
                        <Typography component="p">{`${doctorAddressDetail.name}, ${
                          doctorAddressDetail.streetLine1
                        },${
                          doctorAddressDetail.streetLine2
                            ? doctorAddressDetail.streetLine2 + ','
                            : ''
                        } ${doctorAddressDetail.city} `}</Typography>
                      </div>
                    </Grid>
                  )}
              </Grid>
            </Paper>
          ) : (
            <Paper className={classes.orderDetails}>
              <div className={classes.details}>
                <Typography component="h6">Order Date &amp; Time</Typography>
                <Typography component="p">{paymentDateTime}</Typography>
              </div>
              <div className={classes.details}>
                <Typography component="h6">Mode of Payment</Typography>
                <Typography component="p">{paymentType === "COD" ? "COD" : "PREPAID"}</Typography>
              </div>
            </Paper>
          )}
        </>
        <div className={classes.note}>
          {paymentInfo && paymentInfo.length > 1 && (
            <Typography component="p">Note : {paymentInfo}</Typography>
          )}
        </div>

        <AphButton className={classes.payBtn} onClick={() => orderStatusCallback()}>
          {ctaText}
        </AphButton>
      </div>
    </div>
  );
};