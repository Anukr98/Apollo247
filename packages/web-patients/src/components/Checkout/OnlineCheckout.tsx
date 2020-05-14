import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import React from 'react';
import { Header } from 'components/Header';
import { NavigationBottom } from 'components/NavigationBottom';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { useAuth } from 'hooks/authHooks';
import { BottomLinks } from 'components/BottomLinks';
import { CouponCodeConsult } from 'components/Coupon/CouponCodeConsult';
import { AphButton } from '@aph/web-ui-components';

const useStyles = makeStyles((theme: Theme) => {
  return {
    pageTopHeader: {
      [theme.breakpoints.down('xs')]: {
        display: 'none',
      },
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    pageContainer: {
      marginTop: -16,
      [theme.breakpoints.up('sm')]: {
        marginTop: 0,
        boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.1)',
        backgroundColor: '#f7f8f5',  
      },
    },
    pageHeader: {
      marginLeft: 20,
      marginRight: 20,
      fontSize: 13,
      paddingTop: 17,
      paddingBottom: 11,
      fontWeight: 600,
      color: theme.palette.secondary.dark,
      textTransform: 'uppercase',
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      position: 'relative',
      zIndex: 1,
      display: 'flex',
      alignItems: 'center',
      [theme.breakpoints.down('xs')]: {
        borderBottom: 'none',
        backgroundColor: theme.palette.common.white,
        margin: 0,
        boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.1)',
        padding: '16px 20px',
        position: 'fixed',
        top: 0,
        width: '100%',
      },
    },
    backArrow: {
      cursor: 'pointer',
      marginRight: 20,
      zIndex: 2,
      [theme.breakpoints.up(1220)]: {
        position: 'absolute',
        left: -82,
        width: 48,
        height: 48,
        top: 0,
        lineHeight: '36px',
        borderRadius: '50%',
        textAlign: 'center',
        backgroundColor: '#02475b',
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
    blackArrow: {
      verticalAlign: 'middle',
      [theme.breakpoints.up(1220)]: {
        display: 'none',
      },
    },
    pageContent: {
      paddingBottom: 25,
      [theme.breakpoints.up('sm')]: {
        padding: 20,
        display: 'flex',
      },
    },
    leftGroup: {
      backgroundColor: '#f7f8f5',
      boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.1)',
      [theme.breakpoints.up('sm')]: {
        backgroundColor: '#fff',
        width: 328,
        borderRadius: 10,
        boxShadow: 'none',
      },
    },
    rightGroup: {
      padding: 20,
      [theme.breakpoints.up('sm')]: {
        width: 'calc(100% - 328px)',
        padding: '0 20px 0 40px',
      },
    },
    doctorProfile: {
      [theme.breakpoints.up('sm')]: {
        borderRadius: 10,
        overflow: 'hidden',
      },
    },
    doctorImg: {
      textAlign: 'center',
      '& img': {
        maxWidth: '100%',
        maxHeight: 138,
        verticalAlign: 'middle',
      },
    },
    doctorInfo: {
      padding: 20,
      [theme.breakpoints.down('xs')]: {
        paddingBottom: 0,
      },
    },
    doctorName: {
      fontSize: 20,
      fontWeight: 600,
      paddingBottom: 10,
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
    },
    doctorType: {
      fontSize: 12,
      color: '#0087ba',
      textTransform: 'uppercase',
      paddingTop: 5,
      fontWeight: 600,
      display: 'flex',
    },
    moreBtn: {
      cursor: 'pointer',
      color: '#fc9916',
      textTransform: 'uppercase',
      marginLeft: 'auto',
      fontWeight: 500,
    },
    appointmentDetails: {
      [theme.breakpoints.up('sm')]: {
        marginTop: 30,
        borderRadius: 5,
        backgroundColor: '#f7f8f5',
        padding: 10,  
      },
    },
    blockHeader: {
      fontSize: 12,
      color: '#02475b',
      paddingBottom: 10,
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      [theme.breakpoints.down('xs')]: {
        display: 'none',
      },
    },
    consultServices: {
      paddingTop: 16,
    },
    serviceType: {
      display: 'flex',
      paddingBottom: 16,
      fontSize: 13,
      color: '#02475b',
      fontWeight: 500,
      lineHeight: '18px',
      alignItems: 'center',
    },
    textTopAlign: {
      alignItems: 'start',
    },
    serviceIcon: {
      width: 25,
      marginRight: 20,
      textAlign: 'center',
      '& img': {
        verticalAlign: 'middle',
      },
    },
    sectionHeader: {
      fontSize: 14,
      color: '#02475b',
      paddingBottom: 10,
      fontWeight: 500,
      marginBottom: 16,
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      textTransform: 'uppercase',
    },
    priceSection: {
      padding: '8px 16px',
      backgroundColor: '#fff',
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
      borderRadius: 10,
    },
    priceRow: {
      fontSize: 16,
      fontWeight: 500,
      color: '#01475b',
      display: 'flex',
      alignItems: 'center',
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      paddingBottom: 8,
      paddingTop: 8,
      '&:last-child': {
        borderBottom: 'none',
      },
    },
    price: {
      marginLeft: 'auto',
    },
    totalPrice: {
      fontWeight: 'bold',
    },
    bottomActions: {
      textAlign: 'center',
      paddingTop: 30,
      [theme.breakpoints.down('xs')]: {
        position: 'fixed',
        bottom: 0,
        backgroundColor: '#fff',
        padding: 20,
        left: 0,
        right: 0,
        zIndex: 991,
      },
      '& button': {
        borderRadius: 10,
        minWidth: '100%',
        [theme.breakpoints.up('sm')]: {
          minWidth: 320,
        },
      },
    },
    footerLinks: {
      [theme.breakpoints.down('xs')]: {
        display: 'none',
      },
    },
  };
});

export const OnlineCheckout: React.FC = () => {
  const classes = useStyles({});
  const { isSignedIn } = useAuth();

  return (
    <div>
      <div className={classes.pageTopHeader}>
        <Header />
      </div>
      <div className={classes.container}>
        <div className={classes.pageContainer}>
          <div className={classes.pageHeader}>
            <Link to={clientRoutes.welcome()}>
              <div className={classes.backArrow}>
                <img className={classes.blackArrow} src={require('images/ic_back.svg')} />
                <img className={classes.whiteArrow} src={require('images/ic_back_white.svg')} />
              </div>
            </Link>
            Checkout
          </div>
          <div className={classes.pageContent}>
            <div className={classes.leftGroup}>
              <div className={classes.doctorProfile}>
                <div className={classes.doctorImg}>
                  <img src="https://via.placeholder.com/328X138" alt="" />
                </div>
                <div className={classes.doctorInfo}>
                  <div className={classes.doctorName}>Dr. Jayanth Reddy</div>
                  <div className={classes.doctorType}><span>General Physician | 5YRS Exp</span><div className={classes.moreBtn}>More</div></div>
                  <div className={classes.appointmentDetails}>
                    <div className={classes.blockHeader}>Appointment Details</div>
                    <div className={classes.consultServices}>
                      <div className={classes.serviceType}>
                        <span className={classes.serviceIcon}>
                          <img src={require('images/ic_clinic.svg')} alt="" />
                        </span>
                        <span>Clinic Visit</span>
                      </div>
                      <div className={classes.serviceType}>
                        <span className={classes.serviceIcon}>
                          <img src={require('images/ic_round_video.svg')} alt="" />
                        </span>
                        <span>Online Consultation</span>
                      </div>
                      <div className={classes.serviceType}>
                        <span className={classes.serviceIcon}>
                          <img src={require('images/ic_calendar_show.svg')} alt="" />
                        </span>
                        <span>Today, 6:30 pm</span>
                      </div>
                      <div className={`${classes.serviceType} ${classes.textTopAlign}`}>
                        <span className={classes.serviceIcon}>
                          <img src={require('images/ic_location.svg')} alt="" />
                        </span>
                        <span>Apollo Hospital <br/>Road No 72, Film Nagar <br/>Jubilee Hills, Hyderabad</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className={classes.rightGroup}>
              <CouponCodeConsult />
              <div className={classes.sectionHeader}>
                Total Charges
              </div>
              <div className={classes.priceSection}>
                <div className={classes.priceRow}>
                  <span>Subtotal</span>
                  <span className={classes.price}>Rs. 499.00</span>
                </div>
                <div className={`${classes.priceRow} ${classes.totalPrice}`}>
                  <span>To Pay</span>
                  <span className={classes.price}>Rs. 499.00</span>
                </div>
              </div>
              <div className={classes.bottomActions}>
                <AphButton color="primary">Pay Rs. 499</AphButton>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={classes.footerLinks}>
        <BottomLinks />
      </div>
      {isSignedIn && <NavigationBottom />}
    </div>
  );
};
