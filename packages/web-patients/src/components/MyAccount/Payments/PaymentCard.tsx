import React from 'react';
import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { ConsultOrders_consultOrders_appointments as CardDetails } from 'graphql/types/ConsultOrders';
import { AphButton } from '@aph/web-ui-components';
import moment from 'moment';
import { getAppStoreLink } from 'helpers/dateHelpers';
import { clientRoutes } from 'helpers/clientRoutes';
import { Link } from 'react-router-dom';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      backgroundColor: '#fff',
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      borderRadius: 10,
      overflow: 'hidden',
      marginBottom: 20,
    },
    notificationText: {
      fontSize: 13,
      padding: '10px 16px',
      color: '#02475b',
      fontWeight: 600,
      [theme.breakpoints.up('sm')]: {
        padding: '16px 20px',
        fontSize: 15,
      },
    },
    boxHeader: {
      backgroundColor: 'rgba(216,216,216,0.34)',
      padding: 16,
      display: 'flex',
      cursor: 'pointer',
      [theme.breakpoints.up('sm')]: {
        padding: 20,
      },
    },
    headerIcon: {
      paddingRight: 10,
      [theme.breakpoints.up('sm')]: {
        paddingRight: 20,
      },
      '& img': {
        [theme.breakpoints.down('xs')]: {
          maxWidth: 20,
        },
      },
    },
    headerContent: {
      width: 'calc(100% - 40px)',
      [theme.breakpoints.up('sm')]: {
        width: 'calc(100% - 50px)',
      },
    },
    topText: {
      display: 'flex',
      '& h3': {
        fontSize: 13,
        fontWeight: 600,
        color: '#4aa54a',
        margin: 0,
        textTransform: 'uppercase',
        [theme.breakpoints.up('sm')]: {
          fontSize: 16,
        },
      },
    },
    price: {
      fontSize: 14,
      fontWeight: 500,
      color: '#02475b',
      marginLeft: 'auto',
      [theme.breakpoints.up('sm')]: {
        fontSize: 16,
      },
    },
    infoText: {
      fontSize: 13,
      color: '#666666',
      display: 'flex',
      alignItems: 'center',
      [theme.breakpoints.up('sm')]: {
        paddingTop: 5,
      },
    },
    rightArrow: {
      marginLeft: 'auto',
    },
    boxContent: {
      padding: 16,
      [theme.breakpoints.up('sm')]: {
        padding: 20,
        textAlign: 'center',
      },
    },
    doctorName: {
      fontSize: 16,
      color: '#02475b',
      fontWeight: 500,
      [theme.breakpoints.up('sm')]: {
        display: 'inline-block',
      },
    },
    consultDate: {
      fontSize: 12,
      color: '#02475b',
      fontWeight: 500,
      display: 'flex',
      paddingTop: 5,
      [theme.breakpoints.up('sm')]: {
        paddingTop: 0,
        fontSize: 14,
        display: 'inline-block',
        paddingLeft: 50,
      },
      '& span': {
        '&:first-child': {
          opacity: 0.6,
        },
      },
    },
    consultType: {
      color: '#02475b',
      marginLeft: 'auto',
      opacity: 0.6,
      [theme.breakpoints.up('sm')]: {
        color: '#00b38e',
        marginLeft: 0,
        opacity: 1,
      },
    },
    bottomActions: {
      width: '100%',
      paddingTop: 16,
      textAlign: 'center',
      '& button': {
        borderRadius: 10,
        minWidth: 240,
      },
    },
    cancelBtn: {
      backgroundColor: 'transparent',
      boxShadow: 'none',
      padding: 0,
      color: '#e02020',
      '&:hover': {
        backgroundColor: 'transparent',
        boxShadow: 'none',
        color: '#e02020',
      },
    },
    pendingCard: {
      '& $topText': {
        '& h3': {
          color: '#e87e38',
        },
      },
    },
    failedCard: {
      '& $topText': {
        '& h3': {
          color: '#e02828',
        },
      },
    },
    refundCard: {
      '& $topText': {
        '& h3': {
          color: '#a30808',
        },
      },
    },
  };
});

interface PaymentCardProps {
  cardDetails?: CardDetails;
}

export const PaymentCard: React.FC<PaymentCardProps> = (props) => {
  const classes = useStyles({});
  const { cardDetails } = props;
  let paymentStatus,
    paymentRefId = '';
  let amountPaid = 0;
  const appointmentStatus = cardDetails.status;
  const getPaymentStatusText = (paymentStatus: string) => {
    if (paymentStatus === 'TXN_SUCCESS') return 'Payment Successful';
    if (paymentStatus === 'TXN_FAILURE') return 'Payment Failed';
    if (paymentStatus === 'PENDING') return 'Payment Pending';
    return 'Payment Invalid';
  };
  const paymentInfo =
    cardDetails && cardDetails.appointmentPayments ? cardDetails.appointmentPayments : [];
  if (typeof paymentInfo[0] === 'undefined') {
    paymentStatus = paymentRefId = 'Invalid';
  } else {
    paymentStatus = paymentInfo[0].paymentStatus;
    paymentRefId = paymentInfo[0].paymentRefId;
    amountPaid = paymentInfo[0].amountPaid;
  }
  const buttonUrl =
    paymentStatus === 'PENDING' || paymentStatus === 'TXN_FAILURE'
      ? clientRoutes.doctorDetails(cardDetails.doctor.name, cardDetails.doctorId)
      : getAppStoreLink();
  const buttonText =
    paymentStatus === 'PENDING' || paymentStatus === 'TXN_FAILURE'
      ? 'TRY AGAIN'
      : 'Download Apollo 247 App';
  return (
    <div
      className={`${classes.root} ${
        paymentStatus === 'PENDING'
          ? classes.pendingCard
          : paymentStatus === 'TXN_FAILURE'
          ? classes.failedCard
          : appointmentStatus === 'CANCELLED'
          ? classes.refundCard
          : ''
      }`}
    >
      {appointmentStatus === 'CANCELLED' && (
        <div className={classes.notificationText}>
          Your refund has been initiated. The amount should be credited in your account in 7-14
          business days.
        </div>
      )}
      <div className={classes.boxHeader}>
        <div className={classes.headerIcon}>
          <img
            src={
              appointmentStatus === 'CANCELLED'
                ? require('images/ic_refund.svg')
                : paymentStatus === 'TXN_SUCCESS'
                ? require('images/ic_tick.svg')
                : paymentStatus === 'TXN_FAILURE'
                ? require('images/ic_failed.svg')
                : require('images/ic_exclamation.svg')
            }
            alt="PaymentStatus"
          />
        </div>
        <div className={classes.headerContent}>
          <div className={classes.topText}>
            <h3>
              {appointmentStatus === 'CANCELLED' ? 'REFUND' : getPaymentStatusText(paymentStatus)}
            </h3>
            <div className={classes.price}>Rs. {amountPaid}</div>
          </div>
          <div className={classes.infoText}>
            <span>Payment Ref Number - {paymentRefId}</span>
            <span className={classes.rightArrow}>
              <Link to={clientRoutes.doctorDetails(cardDetails.doctor.name, cardDetails.doctorId)}>
                <img src={require('images/ic_arrow_right.svg')} alt="Image arrow" />
              </Link>
            </span>
          </div>
        </div>
      </div>
      <div className={classes.boxContent}>
        <div className={classes.doctorName}>{cardDetails.doctor.name}</div>
        <div className={classes.consultDate}>
          <span>{moment(cardDetails.appointmentDateTime).format('DD MMM YYYY, h:mm[ ]A')}</span>
          <span className={classes.consultType}>
            {' '}
            ({cardDetails.appointmentType === 'ONLINE' ? 'Online Consult' : 'Clinic Visit'})
          </span>
        </div>
        <div className={classes.bottomActions}>
          {appointmentStatus === 'CANCELLED' ? (
            <AphButton className={classes.cancelBtn}>CANCELLED</AphButton>
          ) : (
            <AphButton
              color="primary"
              onClick={() => {
                window.open(buttonUrl);
              }}
            >
              {buttonText}
            </AphButton>
          )}
        </div>
      </div>
    </div>
  );
};
