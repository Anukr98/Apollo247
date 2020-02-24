import { Theme } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/styles';
import React from 'react';
import { clientRoutes } from 'helpers/clientRoutes';
import { useAuth } from 'hooks/authHooks';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      padding: 0,
    },
    userProfile: {
      width: '100%',
      [theme.breakpoints.down('xs')]: {
        backgroundColor: '#f7f8f5',
        boxShadow: '0 15px 20px 0 rgba(0, 0, 0, 0.1)',
      },
    },
    profileServices: {
      paddingTop: 5,
      paddingRight: 5,
      [theme.breakpoints.down('xs')]: {
        padding: 15,
        paddingLeft: 10,
        paddingRight: 10,
      },
    },
    servicesSection: {
      paddingRight: 15,
      paddingBottom: 5,
      [theme.breakpoints.down('xs')]: {
        padding: 0,
        display: 'flex',
        flexWrap: 'wrap',
      },
    },
    sectionGroup: {
      marginBottom: 10,
      paddingLeft: 5,
      [theme.breakpoints.down('xs')]: {
        width: '50%',
        paddingRight: 5,
      },
    },
    serviceType: {
      backgroundColor: '#fff',
      boxShadow: '0 2px 4px 0 rgba(128, 128, 128, 0.3)',
      border: '1px solid #fff',
      borderRadius: 10,
      padding: 10,
      paddingbottom: 8,
      display: 'flex',
      width: '100%',
      height: '100%',
      color: '#02475b',
      fontSize: 14,
      fontWeight: 500,
      cursor: 'pointer',
    },
    menuActive: {
      border: '1px solid #00b38e',
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
  };
});

export const MyProfile: React.FC = (props) => {
  const classes = useStyles();
  const currentPath = window.location.pathname;
  const { signOut } = useAuth();

  return (
    <div className={classes.root}>
      <div className={classes.userProfile}>
        <div className={classes.profileServices}>
          <div className={classes.servicesSection}>
            <div className={classes.sectionGroup}>
              <Link
                className={`${classes.serviceType} ${classes.textVCenter} ${
                  currentPath === clientRoutes.myAccount() ? classes.menuActive : ''
                }`}
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
                className={`${classes.serviceType} ${classes.textVCenter} ${
                  currentPath === clientRoutes.addressBook() ? classes.menuActive : ''
                }`}
                to={clientRoutes.addressBook()}
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
            {/* <div className={classes.sectionGroup}>
              <Link
                className={`${classes.serviceType} ${classes.textVCenter} ${
                  currentPath === clientRoutes.notificationSettings() ? classes.menuActive : ''
                }`}
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
            </div> */}
            {/* <div className={classes.sectionGroup}>
              <Link className={`${classes.serviceType} ${classes.textVCenter}`} to="#">
                <span className={classes.serviceImg}>
                  <img src={require('images/ic_invoice.svg')} alt="" />
                </span>
                <span className={classes.linkText}>Order Summary</span>
                <span className={classes.rightArrow}>
                  <img src={require('images/ic_arrow_right.svg')} alt="" />
                </span>
              </Link>
            </div> */}
            <div
              className={`${classes.sectionGroup}`}
              onClick={() => signOut()}
            >
              <div className={`${classes.serviceType} ${classes.textVCenter}`}>
                <span className={classes.serviceImg}>
                  <img src={require('images/ic_logout.svg')} alt="" />
                </span>
                <span className={classes.linkText}>Logout</span>
                <span className={classes.rightArrow}>
                  <img src={require('images/ic_arrow_right.svg')} alt="" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
