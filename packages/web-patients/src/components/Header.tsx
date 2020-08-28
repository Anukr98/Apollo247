import React, { useRef, useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, CircularProgress, Typography } from '@material-ui/core';
import { Link } from 'react-router-dom';
import Popover from '@material-ui/core/Popover';
import Paper from '@material-ui/core/Paper';
import { SignIn } from 'components/SignIn';
import _isEmpty from 'lodash/isEmpty';
import { Navigation } from 'components/Navigation';
import { ProtectedWithLoginPopup } from 'components/ProtectedWithLoginPopup';
import { clientRoutes } from 'helpers/clientRoutes';
import { useLoginPopupState, useAuth, useAllCurrentPatients } from 'hooks/authHooks';
import { MedicinesCartContext } from 'components/MedicinesCartProvider';
import { getAppStoreLink } from 'helpers/dateHelpers';
import { MedicineLocationSearch } from 'components/MedicineLocationSearch';
import { AphButton } from '@aph/web-ui-components';
import { useParams } from 'hooks/routerHooks';
import moment from 'moment';

const useStyles = makeStyles((theme: Theme) => {
  return {
    header: {
      display: 'flex',
      alignItems: 'center',
      boxShadow: '0 2px 10px 0 rgba(0, 0, 0, 0.1)',
      backgroundColor: theme.palette.common.white,
      padding: '0 20px',
      [theme.breakpoints.down('xs')]: {
        padding: '0 10px',
        boxShadow: '0 0.5px 2px 0 rgba(0, 0, 0, 0.1)',
      },
      [theme.breakpoints.down(900)]: {},
    },
    headerSticky: {
      position: 'fixed',
      width: '100%',
      zIndex: 999,
      top: 0,
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    logo: {
      width: 150,
      [theme.breakpoints.down('xs')]: {},
      '& a': {
        display: 'block',
      },
      '& img': {
        maxWidth: 77,
        verticalAlign: 'middle',
        [theme.breakpoints.down('xs')]: {
          maxWidth: 67,
        },
      },
    },
    headerNav: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      width: '100%',
    },
    userAccount: {
      padding: '20px 16px',
      paddingRight: 0,
      position: 'relative',
      [theme.breakpoints.down('xs')]: {
        marginLeft: 'auto',
        padding: '16px 0 16px 10px',
      },
    },
    userAccountActive: {
      backgroundColor: '#f7f8f5',
      '&:after': {
        position: 'absolute',
        content: '""',
        bottom: 0,
        left: 0,
        height: 5,
        width: '100%',
        backgroundColor: '#00b38e',
      },
    },
    userAccountLogin: {
      display: 'flex',
      alignItems: 'center',
    },
    userCircle: {
      display: 'flex',
      width: 48,
      height: 48,
      backgroundColor: '#afc3c9',
      borderRadius: '50%',
      textAlign: 'center',
      cursor: 'pointer',
      alignItems: 'center',
      justifyContent: 'center',
      [theme.breakpoints.down('xs')]: {
        width: 40,
        height: 40,
      },
    },
    userActive: {
      backgroundColor: theme.palette.secondary.dark,
    },
    loginForm: {
      width: 280,
      padding: 20,
      borderRadius: 10,
      boxShadow: '0 5px 40px 0 rgba(0, 0, 0, 0.3)',
      backgroundColor: theme.palette.common.white,
    },
    topPopover: {
      overflow: 'initial',
      backgroundColor: 'none',
      boxShadow: 'none',
    },
    logoutModal: {
      padding: '12px 0',
      '& h3': {
        fontSize: 18,
        fontWeight: 500,
        margin: 0,
      },
    },
    bottomActions: {
      textAlign: 'right',
      paddingTop: 20,
      '& button': {
        marginLeft: 15,
      },
    },
    headerRightGroup: {
      display: 'flex',
      alignItems: 'center',
    },
    appLogin: {
      marginLeft: 0,
    },
    appDownloadBtn: {
      paddingLeft: 20,
      paddingRight: 20,
      textAlign: 'center',
      '& a': {
        backgroundColor: '#fcb716',
        boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
        borderRadius: 5,
        color: '#fff',
        fontSize: 13,
        fontWeight: 'bold',
        padding: '4px 12px',
        display: 'block',
      },
    },
    preAppLogin: {
      paddingRight: 0,
    },
    loginLinks: {
      color: '#02475b',
      fontSize: 13,
      fontWeight: 'bold',
      paddingRight: 10,
      cursor: 'pointer',
      [theme.breakpoints.down(520)]: {
        display: 'none',
      },
    },
    hideVisibility: {
      visibility: 'hidden',
    },
    userOptions: {
      position: 'absolute',
      top: 80,
      right: 0,
      left: 'auto',
      width: 0,
      borderRadius: 10,
      transition: '0.1s ease',
      overflow: 'hidden',
      zIndex: 9,
      [theme.breakpoints.down('sm')]: {
        top: 60,
      },
    },
    userAccountList: {
      padding: 0,
      margin: 0,
      listStyle: 'none',
      textAlign: 'left',
      '& li': {
        borderBottom: '1px solid rgba(2, 71, 91, 0.3)',
        '& a': {
          padding: '10px 20px',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          '& span': {
            display: 'flex',
            alignItems: 'center',
            '& img': {
              margin: '0 10px 0 0',
            },
          },
        },
      },
      [theme.breakpoints.down('sm')]: {
        '& li': {
          '& a': {
            padding: '6px 10px !important',
            fontSize: 12,
          },
        },
      },
    },
    downloadAppBtn: {
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      borderRadius: 10,
      fontSize: 13,
      fontWeight: 'bold',
      padding: '8px 20px',
      display: 'block',
      [theme.breakpoints.down('sm')]: {
        padding: 8,
      },
    },
    userListActive: {
      width: '300px !important',
      [theme.breakpoints.down('sm')]: {
        width: '240px !important',
      },
    },
    userDetails: {
      padding: '10px 20px',
      textAlign: 'left',
      cursor: 'auto',
      '& h2': {
        fontSize: 23,
        fontWeight: 700,
        padding: '0 0 10px',
        margin: 0,
        borderBottom: '1px solid rgba(2,71,91, 0.3)',
      },
      '& p': {
        fontSize: 14,
        fontWeight: 500,
        padding: '10px 0',
        textTransform: 'uppercase',
      },
      [theme.breakpoints.down('sm')]: {
        padding: '5px 10px',
        '& h2': {
          fontSize: 16,
          padding: '0 0 8px',
        },
        '& p': {
          fontSize: 12,
          padding: '8px 0',
        },
      },
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderTop: '1px solid rgba(2,71,91, 0.3)',
      borderBottom: '1px solid rgba(2,71,91, 0.3)',
    },
    downloadOptions: {
      padding: '10px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      [theme.breakpoints.down('sm')]: {
        padding: 10,
      },
    },
    backArrow: {
      position: 'absolute',
      top: 90,
      left: 70,
      width: 48,
      height: 48,
      lineHeight: '36px',
      borderRadius: '50%',
      textAlign: 'center',
      backgroundColor: '#02475b',
      [theme.breakpoints.down('xs')]: {
        top: 15,
        left: 20,
        background: 'transparent',
        width: 25,
        height: 24,
        zIndex: 9,
      },
      '& img': {
        verticalAlign: 'bottom',
      },
    },
    whiteArrow: {
      verticalAlign: 'middle',
      // [theme.breakpoints.down(1220)]: {
      //   display: 'none',
      // },
    },
    blackArrow: {
      verticalAlign: 'middle',
      [theme.breakpoints.up(1220)]: {
        display: 'none',
      },
    },
  };
});

interface HeaderProps {
  backArrowVisible?: boolean;
  isWebView?: boolean;
  backLocation?: string;
}

export const Header: React.FC<HeaderProps> = (props) => {
  const classes = useStyles({});
  const avatarRef = useRef(null);
  const { isSigningIn, isSignedIn, setVerifyOtpError, signOut } = useAuth();
  const { allCurrentPatients, currentPatient } = useAllCurrentPatients();
  const { isLoginPopupVisible, setIsLoginPopupVisible } = useLoginPopupState();
  const [profileVisible, setProfileVisible] = React.useState<boolean>(false);
  const [mobileNumber, setMobileNumber] = React.useState('');
  const [otp, setOtp] = React.useState('');
  const currentPath = window.location.pathname;
  const isMobileView = screen.width <= 768;
  const node = useRef(null);

  const params = useParams<{
    searchMedicineType: string;
    searchText: string;
    sku: string;
  }>();
  const handleClick = (e: any) => {
    if (node.current && node.current.contains(e.target) && !_isEmpty(e.target)) {
      // inside click
      return;
    }
    // outside click
    setProfileVisible(false);
  };

  useEffect(() => {
    // add when mounted
    document.addEventListener('mousedown', handleClick);
    // return function to be called when unmounted
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, []);

  const MedicineRoutes = [
    clientRoutes.medicines(),
    clientRoutes.searchByMedicine(params.searchMedicineType, params.searchText),
    clientRoutes.medicineCategoryDetails(params.searchMedicineType, params.searchText, params.sku),
    clientRoutes.medicineDetails(params.sku),
    clientRoutes.medicineAllBrands(),
    clientRoutes.prescriptionsLanding(),
    clientRoutes.prescriptionReview(),
    clientRoutes.medicinePrescription(),
    clientRoutes.medicineSearch(),
  ];

  const getAge = (dob: string) => {
    if (dob && dob.length) {
      return ` | ${moment().diff(dob, 'years')}`;
    }
    return null;
  };

  return (
    <div className={classes.headerSticky}>
      <div className={classes.container}>
        <header className={classes.header} data-cypress="Header">
          <div className={classes.logo}>
            <Link to="/">
              <img
                src={require('images/ic_logo.png')}
                title={'Online Doctor Consultation & Medicines'}
                alt={'Online Doctor Consultation & Medicines'}
              />
            </Link>
          </div>
          {/* {checkIfDisabled() && currentPath !== '/' && <LocationSearch />} */}
          {MedicineRoutes.find((route) => route === currentPath) && <MedicineLocationSearch />}
          <div className={classes.headerNav}>
            <MedicinesCartContext.Consumer>
              {() => <Navigation activeMedicineRoutes={MedicineRoutes} />}
            </MedicinesCartContext.Consumer>
            <div className={`${classes.headerRightGroup} ${isSignedIn ? classes.appLogin : ''}`}>
              <div
                className={`${classes.userAccount} ${isSignedIn ? '' : classes.userAccountLogin} ${
                  currentPath === clientRoutes.myAccount() ||
                  currentPath === clientRoutes.addressBook() ||
                  currentPath === clientRoutes.needHelp()
                    ? classes.userAccountActive
                    : ''
                }`}
              >
                {isSignedIn ? (
                  <div
                    className={`${classes.userCircle} ${isSignedIn ? classes.userActive : ''}`}
                    title={'Control profile'}
                    ref={node}
                    onClick={(e) => {
                      if (!profileVisible) {
                        setProfileVisible(true);
                      }
                    }}
                  >
                    {isSigningIn ? (
                      <CircularProgress />
                    ) : (
                      <>
                        <img
                          src={require('images/ic_account_white.svg')}
                          alt="Profile"
                          title="Profile"
                        />
                        {profileVisible && (
                          <Paper
                            className={`${classes.userOptions} ${
                              profileVisible ? classes.userListActive : ''
                            }`}
                          >
                            {currentPatient && (
                              <div className={classes.userDetails}>
                                <Typography component="h2">{currentPatient.firstName}</Typography>
                                <Typography>UHID : {currentPatient.uhid}</Typography>
                                <div className={classes.userInfo}>
                                  <Typography>
                                    {currentPatient.gender}
                                    {getAge(currentPatient.dateOfBirth)}
                                  </Typography>
                                  <Typography>{currentPatient.mobileNumber}</Typography>
                                </div>
                              </div>
                            )}
                            <ul className={classes.userAccountList}>
                              <li>
                                <Link to={clientRoutes.myAccount()}>
                                  <span>
                                    <img src={require('images/ic_manageprofile.svg')} alt="" />{' '}
                                    Manage Profiles
                                  </span>
                                  <img src={require('images/ic_arrow_right.svg')} alt="" />
                                </Link>
                              </li>

                              <li>
                                <Link to={clientRoutes.addressBook()}>
                                  <span>
                                    <img src={require('images/ic_location.svg')} alt="" /> Address
                                    Book
                                  </span>
                                  <img src={require('images/ic_arrow_right.svg')} alt="" />
                                </Link>
                              </li>

                              {currentPatient && (
                                <li>
                                  <Link to={clientRoutes.yourOrders()}>
                                    <span>
                                      <img src={require('images/ic_invoice.svg')} alt="" /> My
                                      Orders
                                    </span>
                                    <img src={require('images/ic_arrow_right.svg')} alt="" />
                                  </Link>
                                </li>
                              )}

                              <li>
                                <Link to={clientRoutes.myPayments()}>
                                  <span>
                                    <img src={require('images/ic_fees.svg')} alt="" /> My Payments
                                  </span>
                                  <img src={require('images/ic_arrow_right.svg')} alt="" />
                                </Link>
                              </li>

                              {currentPatient && (
                                <li>
                                  <Link to={clientRoutes.healthRecords()}>
                                    <span>
                                      <img
                                        src={require('images/ic_notificaiton_accounts.svg')}
                                        alt=""
                                      />{' '}
                                      Health Records
                                    </span>
                                    <img src={require('images/ic_arrow_right.svg')} alt="" />
                                  </Link>
                                </li>
                              )}

                              <li>
                                <Link to={clientRoutes.needHelp()}>
                                  <span>
                                    <img src={require('images/ic_round_live_help.svg')} alt="" />{' '}
                                    Need Help
                                  </span>
                                  <img src={require('images/ic_arrow_right.svg')} alt="" />
                                </Link>
                              </li>

                              <li>
                                <a href="javascript:void(0)" onClick={() => signOut()}>
                                  <span>
                                    <img src={require('images/ic_logout.svg')} alt="" /> Logout
                                  </span>
                                </a>
                              </li>
                            </ul>
                            <div className={classes.downloadOptions}>
                              <img src={require('images/apollo247.png')} />
                              <AphButton
                                color="primary"
                                onClick={() => window.open(getAppStoreLink())}
                                className={classes.downloadAppBtn}
                              >
                                Download App
                              </AphButton>
                            </div>
                          </Paper>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <ProtectedWithLoginPopup>
                    {({ protectWithLoginPopup }) => (
                      <>
                        {/* <div
                        onClick={() => {
                          isSignedIn ? clientRoutes.medicinesCart() : protectWithLoginPopup();
                        }}
                        className={classes.loginLinks}
                        title={'Login/SignUp'}
                      >
                        Login/SignUp
                      </div> */}
                        <div
                          id="loginPopup"
                          className={`${classes.userCircle} ${classes.userActive}`}
                          onClick={() =>
                            isSignedIn ? clientRoutes.medicinesCart() : protectWithLoginPopup()
                          }
                          ref={avatarRef}
                          title={'Login/SignUp'}
                        >
                          {isSigningIn ? (
                            <CircularProgress />
                          ) : (
                            <img
                              src={require('images/ic_account.svg')}
                              title={'Login/SignUp'}
                              alt="Login/SignUp"
                            />
                          )}
                        </div>
                      </>
                    )}
                  </ProtectedWithLoginPopup>
                )}
                {!isSignedIn && (
                  <Popover
                    open={isLoginPopupVisible}
                    anchorEl={avatarRef.current}
                    onClose={() => {
                      const otpAfterCleaning = otp.replace(/,/g, '');
                      if (
                        mobileNumber.length === 0 ||
                        (mobileNumber.length === 10 && otpAfterCleaning.length === 0) ||
                        otpAfterCleaning.length === 6
                      ) {
                        setIsLoginPopupVisible(false);
                        setVerifyOtpError(false);
                      }
                    }}
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    classes={{ paper: classes.topPopover }}
                  >
                    <Paper className={classes.loginForm}>
                      <SignIn
                        setMobileNumber={(mobileNumber: string) => setMobileNumber(mobileNumber)}
                        setOtp={(otp: string) => setOtp(otp)}
                        mobileNumber={mobileNumber}
                        otp={otp}
                      />
                    </Paper>
                  </Popover>
                )}
              </div>
            </div>
          </div>
        </header>
        {props.backArrowVisible && (
          <>
            {!props.isWebView && (
              <Link to={props.backLocation || clientRoutes.welcome()}>
                <div className={classes.backArrow}>
                  <img className={classes.whiteArrow} src={require('images/ic_back_white.svg')} />
                </div>
              </Link>
            )}
          </>
        )}
      </div>
    </div>
  );
};
