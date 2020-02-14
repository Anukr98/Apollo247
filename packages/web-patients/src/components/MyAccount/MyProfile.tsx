import { Theme } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/styles';
import React from 'react';
import Scrollbars from 'react-custom-scrollbars';
import { clientRoutes } from 'helpers/clientRoutes';
import { AphLinearProgress } from '@aph/web-ui-components';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      padding: 0,
    },
    userProfile: {
      width: '100%',
    },
    profileImg: {
      overflow: 'hidden',
      borderRadius: '5px 5px 0 0',
      '& img': {
        maxWidth: '100%',
        verticalAlign: 'middle',
      },
    },
    userInfo: {
      padding: '25px 20px 10px 20px',
    },
    userName: {
      fontSize: 20,
      fontWeight: 600,
      color: '#02475b',
      paddingBottom: 10,
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
    },
    userIdGroup: {
      display: 'flex',
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      paddingTop: 10,
      paddingBottom: 10,
    },
    userId: {
      fontSize: 12,
      fontWeight: 500,
      color: '#02475b',
      letterSpacing: 0.3,
    },
    userGenderInfo: {
      marginLeft: 'auto',
      textTransform: 'uppercase',
      fontSize: 12,
      fontWeight: 500,
      color: '#02475b',
      letterSpacing: 0.3,
    },
    userContact: {
      textAlign: 'right',
      fontSize: 12,
      fontWeight: 500,
      color: '#02475b',
      paddingTop: 10,
    },
    profileServices: {
      paddingTop: 5,
      paddingLeft: 20,
      paddingRight: 5,
      paddingBottom: 20,
    },
    servicesSection: {
      paddingRight: 15,
    },
    sectionGroup: {
      marginBottom: 10,
    },
    serviceType: {
      backgroundColor: '#f7f8f5',
      borderRadius: 5,
      padding: 10,
      paddingbottom: 8,
      display: 'flex',
      width: '100%',
      color: '#02475b',
      fontSize: 14,
      fontWeight: 500,
    },
    serviceImg: {
      marginRight: 10,
      '& img': {
        maxWidth: 49,
        verticalAlign: 'middle',
      },
    },
    serviceIcon: {
      marginRight: 10,
      '& img': {
        maxWidth: 24,
        verticalAlign: 'middle',
      },
    },
    rightArrow: {
      width: 24,
      marginLeft: 'auto',
    },
    linkText: {
      letterSpacing: 'normal',
      paddingRight: 10,
    },
    textVCenter: {
      alignItems: 'center',
      minHeight: 54,
      paddingbottom: 10,
    },
    apolloOneSection: {
      borderLeft: '0.5px solid rgba(2,71,91,0.3)',
      paddingLeft: 10,
      width: 'calc(100% - 50px)',
    },
    apolloOneHeader: {
      display: 'flex',
      fontSize: 12,
      fontWeight: 500,
      color: '#02475b',
    },
    apolloPoints: {
      fontSize: 20,
      fontWeight: 600,
      color: '#02475b',
    },
    planType: {
      marginLeft: 'auto',
      paddingTop: 5,
    },
    pointsSlider: {
      paddingTop: 8,
      paddingBottom: 5,
      position: 'relative',
    },
    sliderArrow: {
      position: 'absolute',
      left: '65%',
      top: -10,
    },
    readMore: {
      textAlign: 'right',
      paddingTop: 10,
      '& a': {
        color: '#fc9916',
        fontSize: 10,
        fontWeight: 600,
        lineHeight: 2,
      },
    },
    lastGroup: {
      marginBottom: 0,
    },
  };
});

export const MyProfile: React.FC = (props) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.userProfile}>
        <div className={classes.profileImg}>
          <img src="https://via.placeholder.com/328x138" alt="" />
        </div>
        <div className={classes.userInfo}>
          <div className={classes.userName}>Surj Gupta</div>
          <div className={classes.userIdGroup}>
            <div className={classes.userId}>UHID : APD1.0010783329</div>
            <div className={classes.userGenderInfo}>Male | 31</div>
          </div>
          <div className={classes.userContact}>+91 9769435788</div>
        </div>
        <div className={classes.profileServices}>
          <Scrollbars autoHide={true} autoHeight autoHeightMax={'calc(100vh - 496px'}>
            <div className={classes.servicesSection}>
              <div className={classes.sectionGroup}>
                <Link
                  className={`${classes.serviceType} ${classes.textVCenter}`}
                  to={clientRoutes.myAccount()}
                >
                  <span className={classes.serviceImg}>
                    <img src={require('images/ic_manageprofile.svg')} alt="" />
                  </span>
                  <span className={classes.linkText}>Manage Profiles</span>
                  <span className={classes.rightArrow}>
                    <img src={require('images/ic_arrow_right.svg')} alt="" />
                  </span>
                </Link>
              </div>
              <div className={classes.sectionGroup}>
                <Link
                  className={`${classes.serviceType} ${classes.textVCenter}`}
                  to={clientRoutes.myAccount()}
                >
                  <span className={classes.serviceImg}>
                    <img src={require('images/ic_location.svg')} alt="" />
                  </span>
                  <span className={classes.linkText}>Address Book</span>
                  <span className={classes.rightArrow}>
                    <img src={require('images/ic_arrow_right.svg')} alt="" />
                  </span>
                </Link>
              </div>
              <div className={classes.sectionGroup}>
                <Link className={`${classes.serviceType} ${classes.textVCenter}`} to="#">
                  <span className={classes.serviceImg}>
                    <img src={require('images/ic_invoice.svg')} alt="" />
                  </span>
                  <span className={classes.linkText}>Order Summary</span>
                  <span className={classes.rightArrow}>
                    <img src={require('images/ic_arrow_right.svg')} alt="" />
                  </span>
                </Link>
              </div>
              <div className={`${classes.sectionGroup} ${classes.lastGroup}`}>
                <Link
                  className={`${classes.serviceType} ${classes.textVCenter}`}
                  to={clientRoutes.notificationSettings()}
                >
                  <span className={classes.serviceImg}>
                    <img src={require('images/ic_notificaiton_accounts.svg')} alt="" />
                  </span>
                  <span className={classes.linkText}>Notification Settings</span>
                  <span className={classes.rightArrow}>
                    <img src={require('images/ic_arrow_right.svg')} alt="" />
                  </span>
                </Link>
              </div>
            </div>
          </Scrollbars>
        </div>
      </div>
    </div>
  );
};
