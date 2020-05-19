import React from 'react';
import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { PharmacyOrders_pharmacyOrders_pharmaOrders as CardDetails } from 'graphql/types/PharmacyOrders';
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

export const PaymentCardPharmacy: React.FC<PaymentCardProps> = (props) => {
  const classes = useStyles({});
  const { cardDetails } = props;
  // console.log(cardDetails);
  // return <></>;

  let paymentStatus,
    bankTxnId = '';
  let amountPaid = 0;

  const getPaymentStatusText = (paymentStatus: string) => {
    if (paymentStatus === 'TXN_SUCCESS') return 'Payment Successful';
    if (paymentStatus === 'TXN_FAILURE') return 'Payment Failed';
    if (paymentStatus === 'PENDING') return 'Payment Pending';
    return 'Payment Invalid';
  };
  const paymentInfo =
    cardDetails && cardDetails.medicineOrderPayments && cardDetails.medicineOrderPayments.length > 0
      ? cardDetails.medicineOrderPayments
      : [];

  if (typeof paymentInfo[0] === 'undefined') {
    paymentStatus = bankTxnId = 'Invalid';
  } else {
    paymentStatus = paymentInfo[0].paymentStatus;
    bankTxnId = paymentInfo[0].paymentRefId;
    amountPaid = paymentInfo[0].amountPaid;
  }
  const buttonUrl =
    paymentStatus === 'PENDING' || paymentStatus === 'TXN_FAILURE'
      ? clientRoutes.medicinesCart()
      : clientRoutes.yourOrders();
  const buttonText =
    paymentStatus === 'PENDING' || paymentStatus === 'TXN_FAILURE' ? 'TRY AGAIN' : 'VIEW ORDERS';
  return (
    <div
      className={`${classes.root} ${
        paymentStatus === 'PENDING'
          ? classes.pendingCard
          : paymentStatus === 'TXN_FAILURE'
          ? classes.failedCard
          : ''
      }`}
    >
      <div className={classes.boxHeader}>
        <div className={classes.headerIcon}>
          <img
            src={
              paymentStatus === 'TXN_SUCCESS'
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
            <h3>{getPaymentStatusText(paymentStatus)}</h3>
            <div className={classes.price}>Rs. {amountPaid}</div>
          </div>
          <div className={classes.infoText}>
            <span>Payment Ref Number - {bankTxnId}</span>
            <span className={classes.rightArrow}>
              <Link to={clientRoutes.yourOrders()}>
                <img src={require('images/ic_arrow_right.svg')} alt="Image arrow" />
              </Link>
            </span>
          </div>
        </div>
      </div>
      <div className={classes.boxContent}>
        <div className={classes.doctorName}>Order No. - {cardDetails.orderAutoId}</div>
        <div className={classes.consultDate}>
          <span>{moment(cardDetails.orderDateTime).format('DD MMM YYYY, h:mma')}</span>
          <span className={classes.consultType}> (Debit card)</span>
        </div>
        <div className={classes.bottomActions}>
          <AphButton
            color="primary"
            onClick={() => {
              window.open(buttonUrl);
            }}
          >
            {buttonText}
          </AphButton>
        </div>
      </div>
    </div>
  );
};

{
  /* Payment Pending Card */
}
{
  /* <div className={`${classes.root} ${classes.pendingCard}`}>
        <div className={classes.boxHeader}>
          <div className={classes.headerIcon}>
            <img src={require('images/ic_exclamation.svg')} alt="" />
          </div>
          <div className={classes.headerContent}>
            <div className={classes.topText}>
              <h3>Payment Pending</h3>
              <div className={classes.price}>Rs. 499</div>
            </div>
            <div className={classes.infoText}>
              <span>Payment Ref Number - 123456</span>
              <span className={classes.rightArrow}>
                <img src={require('images/ic_arrow_right.svg')} alt="" />
              </span>
            </div>
          </div>
        </div>
        <div className={classes.boxContent}>
          <div className={classes.doctorName}>Dr. Sushila Dixit</div>
          <div className={classes.consultDate}>
            <span>27 Jul 2019, 6:30 PM</span>
            <span className={classes.consultType}> (Clinic Visit)</span>
          </div>
        </div>
      </div> */
}
{
  /* Payment Failed Card */
}
{
  /* <div className={`${classes.root} ${classes.failedCard}`}>
        <div className={classes.boxHeader}>
          <div className={classes.headerIcon}>
            <img src={require('images/ic_failed.svg')} alt="" />
          </div>
          <div className={classes.headerContent}>
            <div className={classes.topText}>
              <h3>Payment Failed</h3>
              <div className={classes.price}>Rs. 499</div>
            </div>
            <div className={classes.infoText}>
              <span>Payment Ref Number - 123456</span>
              <span className={classes.rightArrow}>
                <img src={require('images/ic_arrow_right.svg')} alt="" />
              </span>
            </div>
          </div>
        </div>
        <div className={classes.boxContent}>
          <div className={classes.doctorName}>Dr. Sushila Dixit</div>
          <div className={classes.consultDate}>
            <span>27 Jul 2019, 6:30 PM</span>
            <span className={classes.consultType}> (Clinic Visit)</span>
          </div>
          <div className={classes.bottomActions}>
            <AphButton color="primary">Try Again</AphButton>
          </div>
        </div>
      </div> */
}
{
  /* Payment Successful Card */
}
{
  /* <div className={classes.root}>
        <div className={classes.notificationText}>Your pending payment is successful!</div>
        <div className={classes.boxHeader}>
          <div className={classes.headerIcon}>
            <img src={require('images/ic_tick.svg')} alt="" />
          </div>
          <div className={classes.headerContent}>
            <div className={classes.topText}>
              <h3>Payment Successful</h3>
              <div className={classes.price}>Rs. 499</div>
            </div>
            <div className={classes.infoText}>
              <span>Payment Ref Number - 123456</span>
              <span className={classes.rightArrow}>
                <img src={require('images/ic_arrow_right.svg')} alt="" />
              </span>
            </div>
          </div>
        </div>
        <div className={classes.boxContent}>
          <div className={classes.doctorName}>Dr. Sushila Dixit</div>
          <div className={classes.consultDate}>
            <span>27 Jul 2019, 6:30 PM</span>
            <span className={classes.consultType}> (Clinic Visit)</span>
          </div>
          <div className={classes.bottomActions}>
            <AphButton color="primary">Download Apollo 247 App</AphButton>
          </div>
        </div>
      </div> */
}
{
  /* Payment Failed Card */
}
{
  /* <div className={`${classes.root} ${classes.failedCard}`}>
        <div className={classes.notificationText}>Your pending payment has failed!</div>
        <div className={classes.boxHeader}>
          <div className={classes.headerIcon}>
            <img src={require('images/ic_failed.svg')} alt="" />
          </div>
          <div className={classes.headerContent}>
            <div className={classes.topText}>
              <h3>Payment Failed</h3>
              <div className={classes.price}>Rs. 499</div>
            </div>
            <div className={classes.infoText}>
              <span>Payment Ref Number - 123456</span>
              <span className={classes.rightArrow}>
                <img src={require('images/ic_arrow_right.svg')} alt="" />
              </span>
            </div>
          </div>
        </div>
        <div className={classes.boxContent}>
          <div className={classes.doctorName}>Dr. Sushila Dixit</div>
          <div className={classes.consultDate}>
            <span>27 Jul 2019, 6:30 PM</span>
            <span className={classes.consultType}> (Clinic Visit)</span>
          </div>
          <div className={classes.bottomActions}>
            <AphButton color="primary">Try Again</AphButton>
          </div>
        </div>
      </div> */
}
{
  /* Payment Failed Card */
}
{
  /* <div className={`${classes.root} ${classes.refundCard}`}>
        <div className={classes.notificationText}>
          Your refund has been initiated. The amount should be credited in your account in 7-14
          business days.
        </div>
        <div className={classes.boxHeader}>
          <div className={classes.headerIcon}>
            <img src={require('images/ic_refund.svg')} alt="" />
          </div>
          <div className={classes.headerContent}>
            <div className={classes.topText}>
              <h3>Refund</h3>
              <div className={classes.price}>Rs. 499</div>
            </div>
            <div className={classes.infoText}>
              <span>Payment Ref Number - 123456</span>
              <span className={classes.rightArrow}>
                <img src={require('images/ic_arrow_right.svg')} alt="" />
              </span>
            </div>
          </div>
        </div>
        <div className={classes.boxContent}>
          <div className={classes.doctorName}>Dr. Sushila Dixit</div>
          <div className={classes.consultDate}>
            <span>27 Jul 2019, 6:30 PM</span>
            <span className={classes.consultType}> (Clinic Visit)</span>
          </div>
          <div className={classes.bottomActions}>
            <AphButton className={classes.cancelBtn}>Cancelled</AphButton>
          </div>
        </div>
      </div> */
}
{
  /* Payment Successful Card */
}
{
  /* <div className={classes.root}>
        <div className={classes.notificationText}>
          We regret to inform you that while your payment is succesful, the appointment slot you
          selected is not available. Kindly book another slot to continue with your consult.
        </div>
        <div className={classes.boxHeader}>
          <div className={classes.headerIcon}>
            <img src={require('images/ic_tick.svg')} alt="" />
          </div>
          <div className={classes.headerContent}>
            <div className={classes.topText}>
              <h3>Payment Successful</h3>
              <div className={classes.price}>Rs. 499</div>
            </div>
            <div className={classes.infoText}>
              <span>Payment Ref Number - 123456</span>
              <span className={classes.rightArrow}>
                <img src={require('images/ic_arrow_right.svg')} alt="" />
              </span>
            </div>
          </div>
        </div>
        <div className={classes.boxContent}>
          <div className={classes.doctorName}>Dr. Sushila Dixit</div>
          <div className={classes.consultDate}>
            <span>27 Jul 2019, 6:30 PM</span>
            <span className={classes.consultType}> (Clinic Visit)</span>
          </div>
          <div className={classes.bottomActions}>
            <AphButton color="primary">Select Appointment Slot</AphButton>
          </div>
        </div>
      </div> */
}
