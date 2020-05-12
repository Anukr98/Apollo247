import React from 'react';
import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { AphButton } from '@aph/web-ui-components';

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


export const PaymentCard: React.FC = (props) => {
  const classes = useStyles({});

  return (
    <>
      {/* Payment Successful Card */}
      <div className={classes.root}>
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
            <span className={classes.consultType}> (Online Consult)</span>
          </div>
          <div className={classes.bottomActions}>
            <AphButton color="primary">Download Apollo 247 App</AphButton>
          </div>
        </div>
      </div>
      {/* Payment Successful Card */}
      <div className={classes.root}>
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
      </div>
      {/* Payment Pending Card */}
      <div className={`${classes.root} ${classes.pendingCard}`}>
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
      </div>
      {/* Payment Failed Card */}
      <div className={`${classes.root} ${classes.failedCard}`}>
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
      </div>
      {/* Payment Successful Card */}
      <div className={classes.root}>
        <div className={classes.notificationText}>
          Your pending payment is successful!
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
            <AphButton color="primary">Download Apollo 247 App</AphButton>
          </div>
        </div>
      </div>
      {/* Payment Failed Card */}
      <div className={`${classes.root} ${classes.failedCard}`}>
        <div className={classes.notificationText}>
          Your pending payment has failed!
        </div>
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
      </div>
      {/* Payment Failed Card */}
      <div className={`${classes.root} ${classes.refundCard}`}>
        <div className={classes.notificationText}>
          Your refund has been initiated. The amount should be credited in your account in 7-14 business days.
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
      </div>
      {/* Payment Successful Card */}
      <div className={classes.root}>
        <div className={classes.notificationText}>
          We regret to inform you that while your payment is succesful, the appointment slot you selected is not available. Kindly book another slot to continue with your consult.
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
      </div>
    </>
  );
};
