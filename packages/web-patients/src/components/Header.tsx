import React, { useRef } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, CircularProgress } from '@material-ui/core';
import { Link } from 'react-router-dom';
import Popover from '@material-ui/core/Popover';
import Paper from '@material-ui/core/Paper';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import { AphButton } from '@aph/web-ui-components';
import { SignIn } from 'components/SignIn';
import { Navigation } from 'components/Navigation';
import { ProtectedWithLoginPopup } from 'components/ProtectedWithLoginPopup';

import { useLoginPopupState, useAuth } from 'hooks/authHooks';
import { AppLocations } from './AppLocations';
import { LocationProvider } from 'components/LocationProvider';
import { MedicinesCartProvider, MedicinesCartContext } from 'components/MedicinesCartProvider';

const useStyles = makeStyles((theme: Theme) => {
  return {
    header: {
      display: 'flex',
      alignItems: 'center',
      boxShadow: '0 2px 10px 0 rgba(0, 0, 0, 0.1)',
      backgroundColor: theme.palette.common.white,
      padding: '0 20px 0 20px',
      [theme.breakpoints.down('xs')]: {
        padding: '0 20px 0 20px',
      },
      [theme.breakpoints.down(900)]: {
        paddingRight: 0,
      },
      '& $userAccountLogin': {
        [theme.breakpoints.down(900)]: {
          paddingRight: 20,
        },
      },
    },
    headerSticky: {
      position: 'fixed',
      width: '100%',
      zIndex: 99,
      top: 0,
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    logo: {
      paddingTop: 20,
      paddingBottom: 11,
      [theme.breakpoints.down('xs')]: {
        paddingTop: 15,
        paddingBottom: 9,
      },
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
    userAccount: {
      marginLeft: 20,
      [theme.breakpoints.down('xs')]: {
        marginLeft: 'auto',
      },
      [theme.breakpoints.between('sm', 'md')]: {
        marginLeft: 10,
      },
      [theme.breakpoints.down(990)]: {
        display: 'none',
      },
    },
    userAccountLogin: {
      marginLeft: 'auto',
      [theme.breakpoints.down(990)]: {
        display: 'block',
      },
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
  };
});

export const Header: React.FC = (props) => {
  const classes = useStyles({});
  const avatarRef = useRef(null);
  const { signOut, isSigningIn, isSignedIn } = useAuth();
  const { isLoginPopupVisible, setIsLoginPopupVisible } = useLoginPopupState();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [mobileNumber, setMobileNumber] = React.useState('');
  const [otp, setOtp] = React.useState('');

  // console.log(mobileNumber, otp);

  return (
    <div className={classes.headerSticky}>
      <div className={classes.container}>
        <header className={classes.header} data-cypress="Header">
          <div className={classes.logo}>
            <Link to="/">
              <img src={require('images/ic_logo.png')} />
            </Link>
          </div>
          {isSignedIn && (
            <LocationProvider>
              <AppLocations />
            </LocationProvider>
          )}
          {isSignedIn && (
            <MedicinesCartContext.Consumer>{() => <Navigation />}</MedicinesCartContext.Consumer>
          )}
          <div className={`${classes.userAccount} ${isSignedIn ? '' : classes.userAccountLogin}`}>
            <ProtectedWithLoginPopup>
              {({ protectWithLoginPopup }) => (
                <div
                  className={`${classes.userCircle} ${isSignedIn ? classes.userActive : ''}`}
                  onClick={() => (isSignedIn ? setIsDialogOpen(true) : protectWithLoginPopup())}
                  ref={avatarRef}
                >
                  {isSigningIn ? (
                    <CircularProgress />
                  ) : (
                    <img src={require('images/ic_account.svg')} />
                  )}
                </div>
              )}
            </ProtectedWithLoginPopup>
            {isSignedIn ? (
              <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
                <DialogContent>
                  <div className={classes.logoutModal}>
                    <h3>Are you sure. You want to logout from Apollo 24x7 ?</h3>
                    <div className={classes.bottomActions}>
                      <AphButton color="secondary" onClick={() => setIsDialogOpen(false)} autoFocus>
                        Cancel
                      </AphButton>
                      <AphButton color="primary" onClick={() => signOut()}>
                        Sign out
                      </AphButton>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            ) : (
              <Popover
                open={isLoginPopupVisible}
                anchorEl={avatarRef.current}
                onClose={() => {
                  const otpAfterCleaning = otp.replace(/,/g, '');
                  if (
                    mobileNumber.length === 0 ||
                    (mobileNumber.length === 10 && otpAfterCleaning.length === 0)
                  ) {
                    setIsLoginPopupVisible(false);
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
        </header>
      </div>
    </div>
  );
};
